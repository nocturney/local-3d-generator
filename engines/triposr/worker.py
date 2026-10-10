"""Isolated, local-only TripoSR image-to-GLB worker for G2 manual jobs and original pilots.

Never downloads weights or other remote assets at inference time.
Does not import or execute native torchmcubes code; uses a bounded CPU
marching-cubes substitute based on scikit-image. This is an adapted pipeline.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import time
import traceback
import types

ROOT = Path(__file__).resolve().parents[2]
ENGINE = ROOT / "runtime" / "engines" / "triposr"
SOURCE = ENGINE / "src"
WEIGHTS = ENGINE / "weights"
CHECKPOINT = WEIGHTS / "model.ckpt"
CONFIG = WEIGHTS / "config.yaml"
DINO_CONFIG = WEIGHTS / "dino-vitb16-config.json"
LOCK = ROOT / "docs" / "TRIPOSR_SOURCE_LOCK.json"
SOURCE_SHA = "107cefdc244c39106fa830359024f6a2f1c78871"
DINO_CONFIG_SHA = "b87c0270b97db085fd82cf114a761fd0f62ae7914fbd407c752a2260646b689c"
WEIGHTS_CONFIG_SHA = "74ca708ce086bf68e97709ea6b3d91f14717921c04691e84043f0eb8fcc68e62"

os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"
os.environ["HF_HUB_DISABLE_TELEMETRY"] = "1"
os.environ["DO_NOT_TRACK"] = "1"

def hash_file(file: Path) -> str:
    h = hashlib.sha256()
    with file.open("rb") as f:
        for part in iter(lambda: f.read(4 * 1024 * 1024), b""):
            h.update(part)
    return h.hexdigest()

def check_materials() -> dict:
    lock = json.loads(LOCK.read_text(encoding="utf-8"))
    sha = subprocess.check_output(
        ["git", "-C", str(SOURCE), "rev-parse", "HEAD"], text=True, timeout=6
    ).strip()
    dirty = subprocess.check_output(
        ["git", "-C", str(SOURCE), "status", "--porcelain"], text=True, timeout=6
    ).strip()
    if sha != SOURCE_SHA or dirty or lock["source"]["commit"] != sha:
        raise RuntimeError("Pinned upstream source missing, changed or dirty")
    if CHECKPOINT.stat().st_size != int(lock["weights"]["bytes"]):
        raise RuntimeError("Checkpoint size differs from source lock")
    if hash_file(CHECKPOINT) != lock["weights"]["sha256"]:
        raise RuntimeError("Checkpoint SHA-256 mismatch")
    if hash_file(CONFIG) != WEIGHTS_CONFIG_SHA:
        raise RuntimeError("Model config SHA-256 mismatch")
    if hash_file(DINO_CONFIG) != DINO_CONFIG_SHA:
        raise RuntimeError("DINO config SHA-256 mismatch")
    return lock

def progress(output: Path, stage: str, **data) -> None:
    print("TRIPOSR_STAGE " + stage, flush=True)
    output.mkdir(parents=True, exist_ok=True)
    with (output / "trace.jsonl").open("a", encoding="utf-8") as fp:
        fp.write(json.dumps({"at": time.time(), "stage": stage, **data}) + "\n")

def install_local_import_barriers(torch, numpy):
    """Replace native/unpinned MC extension with local CPU skimage alternative."""
    import skimage.measure

    mc = types.ModuleType("torchmcubes")

    def marching_cubes(level, threshold=0.0):
        volume = level.detach().to(device="cpu", dtype=torch.float32).numpy()
        # No arbitrary web access, native CUDA extension, or subprocess build.
        v, f, _, _ = skimage.measure.marching_cubes(
            volume, level=threshold, allow_degenerate=False
        )
        # Upstream helper reverses coordinate order after torchmcubes; reverse
        # here as well to retain axes in skimage's original ijk grid order.
        vertices = torch.from_numpy(numpy.asarray(v[:, ::-1], dtype=numpy.float32).copy())
        faces = torch.from_numpy(numpy.asarray(f, dtype=numpy.int64).copy())
        return vertices, faces

    mc.marching_cubes = marching_cubes
    sys.modules["torchmcubes"] = mc

    # Upstream tsr.utils imports rembg eagerly although our worker never calls
    # remove_background. Fail CLOSED if any code tries to use it.
    stub = types.ModuleType("rembg")

    def forbidden(*_args, **_kwargs):
        raise RuntimeError("Background removal is disabled in local offline pilot")

    stub.new_session = forbidden
    stub.remove = forbidden
    sys.modules["rembg"] = stub

def prepare_image(image: Path):
    """Validate pixels BEFORE allocating CUDA or loading large weights."""
    from PIL import Image, ImageOps
    Image.MAX_IMAGE_PIXELS = 16_000_000
    with Image.open(image) as src:
        width, height = src.size
        if width < 64 or height < 64 or width * height > 16_000_000:
            raise ValueError("Input dimensions must be >=64x64 and <=16 megapixels")
        src.load()
        oriented = ImageOps.exif_transpose(src)
        if "A" in oriented.getbands() or "transparency" in oriented.info:
            rgba = oriented.convert("RGBA")
            gray = Image.new("RGBA", rgba.size, (128, 128, 128, 255))
            picture = Image.alpha_composite(gray, rgba).convert("RGB")
            preprocessing = "RGBA alpha-composited onto mid-gray RGB, no rembg"
        else:
            picture = oriented.convert("RGB")
            preprocessing = "RGB original, no rembg"
    return picture, preprocessing


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--image", type=Path, required=True)
    parser.add_argument("--output-dir", type=Path, required=True)
    parser.add_argument("--job-dir", type=Path, default=None,
                        help="Trusted LOCAL3D server job directory; no client paths are accepted")
    parser.add_argument("--resolution", type=int, default=128)
    parser.add_argument("--chunk-size", type=int, default=2048)
    args = parser.parse_args()
    if not (64 <= args.resolution <= 160):
        parser.error("Resolution must be 64..160 for bounded pilot")
    if not (256 <= args.chunk_size <= 4096):
        parser.error("Chunk size must be 256..4096")
    image = args.image.resolve(strict=True)
    if args.image.is_symlink() or not image.is_file():
        parser.error("Untrusted image file")
    app_job = args.job_dir is not None
    if app_job:
        job_dir = args.job_dir.resolve(strict=True)
        if args.job_dir.is_symlink() or not job_dir.is_dir():
            parser.error("Untrusted job directory")
        if image.parent != job_dir or image.name not in ("input.png", "input.jpg", "input.webp"):
            parser.error("App worker accepts only the fixed upload inside its job")
        if not args.output_dir.is_absolute() or args.output_dir.resolve() != job_dir / "engine-output":
            parser.error("Output must be the dedicated engine-output folder")
    else:
        # The original G2 pilot is intentionally pinned to an MIT-licensed example.
        allowed_source = (SOURCE / "examples" / "chair.png").resolve(strict=True)
        if image != allowed_source:
            parser.error("Pilot accepts only pinned MIT example chair.png")
    output_dir = args.output_dir.resolve()
    if not app_job and not output_dir.is_relative_to((ROOT / "runtime" / "pilots").resolve()):
        parser.error("Pilot output must be inside runtime/pilots")
    if args.output_dir.is_symlink() or output_dir.exists():
        parser.error("Refuse to overwrite an existing output directory")
    output_dir.mkdir(parents=True, exist_ok=False)
    progress(output_dir, "verify_sources")
    lock = check_materials()
    start = time.perf_counter()
    progress(output_dir, "preprocess_image")
    picture, preprocessing = prepare_image(image)
    processed_path = output_dir / "preprocessed.png"
    picture.save(processed_path)

    import numpy as np
    import torch
    install_local_import_barriers(torch, np)
    if not torch.cuda.is_available():
        raise RuntimeError("CUDA unavailable in isolated environment")
    if torch.cuda.device_count() != 1:
        raise RuntimeError("Pilot requires exactly one CUDA GPU")
    torch.cuda.set_device(0)
    torch.backends.cudnn.benchmark = False
    torch.backends.cuda.matmul.allow_tf32 = False
    torch.cuda.reset_peak_memory_stats()

    # Insert pinned, clean upstream source, NOT an editable install.
    sys.path.insert(0, str(SOURCE))
    import tsr.models.tokenizers.image as image_tokenizer

    def pinned_dino_download(*_args, **kwargs):
        if kwargs.get("repo_id") != "facebook/dino-vitb16" or kwargs.get("filename") != "config.json":
            raise RuntimeError("Unapproved remote/model file request blocked")
        return str(DINO_CONFIG)

    image_tokenizer.hf_hub_download = pinned_dino_download
    from tsr.system import TSR

    # Force safe state_dict deserialization. Never fall back to arbitrary pickle.
    torch_load = torch.load

    def protected_load(*a, **kw):
        kw["weights_only"] = True
        return torch_load(*a, **kw)

    progress(output_dir, "loading_model", device=torch.cuda.get_device_name(0))
    torch.load = protected_load
    try:
        model = TSR.from_pretrained(str(WEIGHTS), config_name="config.yaml", weight_name="model.ckpt")
    finally:
        torch.load = torch_load
    model.renderer.set_chunk_size(args.chunk_size)
    model = model.to("cuda:0").eval()
    load_elapsed = time.perf_counter() - start

    progress(output_dir, "infer_image")
    with torch.no_grad():
        code = model([picture], device="cuda:0")
    infer_elapsed = time.perf_counter() - start - load_elapsed

    progress(output_dir, "extract_mesh", resolution=args.resolution)
    with torch.no_grad():
        meshes = model.extract_mesh(code, has_vertex_color=True, resolution=args.resolution)
    if len(meshes) != 1:
        raise RuntimeError("Unexpected mesh count from engine")
    mesh = meshes[0]
    if len(mesh.vertices) < 20 or len(mesh.faces) < 20:
        raise RuntimeError("Insufficient valid geometry generated")
    if app_job:
        # TripoSR yields Z-up; portable glTF viewers use Y-up.
        import math
        import trimesh
        mesh.apply_transform(trimesh.transformations.rotation_matrix(-math.pi / 2, [1, 0, 0]))
    glb = output_dir / "model.glb"
    progress(output_dir, "export_glb")
    mesh.export(str(glb), file_type="glb")
    if not glb.is_file() or glb.stat().st_size < 1024:
        raise RuntimeError("GLB artifact missing or unreasonably small")
    with glb.open("rb") as fp:
        if fp.read(4) != b"glTF":
            raise RuntimeError("Exported file has invalid GLB header")

    elapsed = time.perf_counter() - start
    record = {
        "schema": "local3d.triposr.g2-pilot.v1",
        "mode": "LOCAL_REAL_INFERENCE", "simulation": False, "provider": "TripoSR",
        "sourceCommit": lock["source"]["commit"],
        "weightsRevision": lock["weights"]["revision"],
        "weightsSha256": lock["weights"]["sha256"],
        "input": image.name, "inputSha256": hash_file(image),
        "preprocessing": preprocessing, "preprocessedSha256": hash_file(processed_path),
        "coordinateSystem": "Y_UP" if app_job else "Z_UP",
        "appJob": app_job, "imagePixels": picture.width * picture.height,
        "artifact": glb.name, "artifactSha256": hash_file(glb), "artifactBytes": glb.stat().st_size,
        "gpu": torch.cuda.get_device_name(0),
        "peakCudaReservedMiB": round(torch.cuda.max_memory_reserved() / 2**20, 1),
        "peakCudaAllocatedMiB": round(torch.cuda.max_memory_allocated() / 2**20, 1),
        "elapsedSeconds": round(elapsed, 2),
        "modelLoadSeconds": round(load_elapsed, 2),
        "inferenceSeconds": round(infer_elapsed, 2),
        "resolution": args.resolution, "chunkSize": args.chunk_size,
        "vertices": len(mesh.vertices), "faces": len(mesh.faces),
        "watertight": bool(mesh.is_watertight),
        "windingConsistent": bool(mesh.is_winding_consistent),
        "status": "DRAFT",
        "printQualified": False,
        "notes": [
            "No connection to cloud inference or printer",
            "Offline image-only reconstruction; input is operator-provided" if app_job else
            "Offline image-only reconstruction; example is licensed upstream source",
            "Native torchmcubes replaced by CPU skimage marching cubes for Windows reproducibility",
            "No watertightness/manifold/wall-thickness/manufacturing guarantees"
        ]
    }
    (output_dir / "qa-report.json").write_text(json.dumps(record, indent=2) + "\n", encoding="utf-8")
    progress(output_dir, "completed", elapsedSeconds=round(elapsed, 2), glbBytes=glb.stat().st_size)
    print("TRIPOSR_PILOT_SUCCESS " + json.dumps({"glb": str(glb), "qa": str(output_dir/"qa-report.json"), "elapsedSeconds": round(elapsed, 2)}), flush=True)

if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print("TRIPOSR_PILOT_FAILED " + type(exc).__name__ + ": " + str(exc), file=sys.stderr, flush=True)
        traceback.print_exc()
        sys.exit(1)
