"""G3.6: CPU-only shadow Pillow regression, never changes live TripoSR venv.

Launch from the project root using its already installed Python, with a
process-local PYTHONPATH pointing to a separate Pillow wheel --target overlay.
This intentionally imports only the engine's image preprocessing function;
it NEVER calls worker.main(), torch CUDA, downloads or a model inference.
"""
from __future__ import annotations

import hashlib
import json
import sys
import argparse
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SHADOW = ROOT / "runtime" / "qa" / "g3" / "pillow-shadow"
WHEEL_NAME = "pillow-12.3.0-cp311-cp311-win_amd64.whl"
WHEEL_SHA = "8e95e1385e4998ae9694eeaa4730ba5457ff61185b3a55e2e7bea0880aef452a"


def sha(path: Path):
    h = hashlib.sha256()
    with path.open("rb") as stream:
        for piece in iter(lambda: stream.read(2 * 1024 * 1024), b""):
            h.update(piece)
    return h.hexdigest()


def run():
    import PIL
    from PIL import Image, features
    # Script entrypoint lives in scripts/, but engine is in sibling engines/.
    sys.path.insert(0, str(ROOT))
    from engines.triposr.worker import prepare_image

    overlay = (SHADOW / "overlay").resolve(strict=True)
    package = Path(PIL.__file__).resolve(strict=True)
    if PIL.__version__ != "12.3.0" or not package.is_relative_to(overlay):
        raise RuntimeError("The current Python process is not importing the isolated shadow Pillow")
    wheel = (SHADOW / "wheels" / WHEEL_NAME)
    if sha(wheel) != WHEEL_SHA:
        raise RuntimeError("Shadow wheel failed the previously confirmed official PyPI SHA-256")

    catalog_path = ROOT / "benchmarks" / "g3" / "fixtures" / "manifest.json"
    catalog = json.loads(catalog_path.read_text(encoding="utf8"))
    observations = []
    for entry in catalog["fixtures"]:
        relative = Path(entry["files"]["image"])
        parent = ROOT / "benchmarks" / "g3" / "fixtures" if entry["sourceRights"] == "PROJECT_ORIGINAL_PROCEDURAL" else ROOT
        image = (parent / relative).resolve(strict=True)
        if not image.is_relative_to(ROOT):
            raise RuntimeError("Fixture image must stay inside the trusted project")
        if sha(image) != entry["imageSha256"]:
            raise RuntimeError("Catalog source hash mismatch " + entry["id"])
        picture, processing = prepare_image(image)
        if picture.mode != "RGB" or picture.width < 64 or picture.height < 64:
            raise RuntimeError("Shadow Pillow failed image preprocessing")
        if sha(image) != entry["imageSha256"]:
            raise RuntimeError("Image source mutated unexpectedly " + entry["id"])
        observations.append({
            "fixtureId": entry["id"], "sourceSha256Verified": True,
            "mode": picture.mode, "size": [picture.width, picture.height],
            "alphaComposited": "mid-gray" in processing
        })

    # Create ALL extra samples inside ignored private shadow directory.
    sample_dir = SHADOW / "samples"
    if sample_dir.exists() and any(sample_dir.iterdir()):
        raise RuntimeError("Shadow samples already exist; do not overwrite")
    sample_dir.mkdir(exist_ok=True, parents=True)
    rgba = Image.new("RGBA", (96, 80), (0, 0, 0, 0))
    rgba.putpixel((48, 40), (230, 75, 30, 255))
    png = sample_dir / "alpha.png"
    rgba.save(png)
    gray, how = prepare_image(png)
    if gray.getpixel((0, 0)) != (128, 128, 128) or gray.getpixel((48, 40)) != (230, 75, 30):
        raise RuntimeError("RGBA alpha blending deviated from known safe gray compositing")
    if "mid-gray" not in how:
        raise RuntimeError("Expected explicit alpha preprocessing lane")

    rgb = Image.new("RGB", (96, 80), (75, 100, 120))
    jpeg = sample_dir / "exif-rotation.jpg"
    exif = Image.Exif()
    exif[274] = 6
    rgb.save(jpeg, "JPEG", exif=exif)
    rotated, _ = prepare_image(jpeg)
    if rotated.size != (80, 96):
        raise RuntimeError("EXIF orientation should rotate image before inference")

    if not features.check("webp"):
        raise RuntimeError("Shadow Pillow WebP decoder is unavailable")
    webp = sample_dir / "webp-alpha.webp"
    rgba.save(webp, format="WEBP", lossless=True)
    webp_out, _ = prepare_image(webp)
    if webp_out.mode != "RGB" or webp_out.getpixel((0, 0)) != (128, 128, 128):
        raise RuntimeError("WebP alpha compositing failed")

    bad = sample_dir / "corrupted.png"
    bad.write_bytes(b"\x89PNG\r\n\x1a\nINVALID")
    try:
        prepare_image(bad)
        raise RuntimeError("Corrupt PNG was wrongly accepted")
    except (OSError, ValueError):
        pass

    report = {
        "schema": "local3d.g3-6.pillow-shadow-cpu-compatibility.v1",
        "shadowPillowVersion": PIL.__version__,
        "previousProductionPillowVersion": "10.1.0",
        "wheelFile": WHEEL_NAME,
        "wheelSha256": sha(wheel),
        "pypiWheelSha256Matches": True,
        "pythonMajorMinor": f"{sys.version_info.major}.{sys.version_info.minor}",
        "sourceCatalogSha256": sha(catalog_path),
        "fixtures": observations,
        "extraTests": {
            "alphaComposite": "PASS",
            "exifRotation": "PASS",
            "webpAlpha": "PASS",
            "rejectCorruptedImage": "PASS",
        },
        "shadowImportedFromSeparateOverlay": True,
        "modelInferenceExecuted": False,
        "gpuAllocated": False,
        "modelWeightsLoaded": False,
        "productionVenvChanged": False,
        "dependenciesInstalledToProduction": False,
        "printQualified": False,
        "securityQualification": "NONE_ADVISORY_AND_CPU_COMPATIBILITY_SCREEN_ONLY",
        "note": "CPU image-preprocessing checks of source images, NOT TripoSR model prediction compatibility or security clearance"
    }
    output = SHADOW / "shadow-cpu-report.json"
    if output.exists():
        raise RuntimeError("Refuse to overwrite existing shadow CPU proof")
    output.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf8")
    print("G36_PILLOW_SHADOW_CPU_PASS " + json.dumps({
        "version": PIL.__version__, "imageFixtures": len(observations),
        "extraChecks": len(report["extraTests"]), "modelInferenceRuns": 0,
        "productionVenvChanged": False,
        "wheelSha256": sha(wheel)
    }))


if __name__ == "__main__":
    if sys.version_info[:2] != (3, 11):
        raise SystemExit("Shadow experiment requires pinned Windows Python 3.11")
    run()
