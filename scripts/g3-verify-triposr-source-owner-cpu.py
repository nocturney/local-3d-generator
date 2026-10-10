"""G3 TripoSR source-owner repair validation. CPU-only, no neural inference.

Reads pinned Git/weights and the licensed 01-orb-alpha image. Does NOT
edit Git configuration, run Torch/CUDA, change model weights, or consume an
AI-run authorization. Use the isolated TripoSR Python interpreter.
"""
from __future__ import annotations

import hashlib
import importlib.util
import json
import os
from pathlib import Path

os.environ["CUDA_VISIBLE_DEVICES"] = "-1"
os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"
os.environ["PYTHONNOUSERSITE"] = "1"

ROOT = Path(__file__).resolve().parents[1]
WORKER = ROOT / "engines" / "triposr" / "worker.py"
FIXTURE = ROOT / "benchmarks" / "g3" / "fixtures" / "01-orb-alpha" / "input.png"
CATALOG = ROOT / "benchmarks" / "g3" / "fixtures" / "manifest.json"
EXPECTED_IMAGE_SHA = "9cb2f41de1b0239570068b055dc06bf941491559e11942b5bbc5757adb3d886a"

def main():
    spec = importlib.util.spec_from_file_location("local3d_readonly_triposr", WORKER)
    if spec is None or spec.loader is None:
        raise RuntimeError("Pinned CPU-only worker import unavailable")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    if module.ROOT.resolve(strict=True) != ROOT.resolve(strict=True):
        raise RuntimeError("Worker is not in the expected LOCAL3D project")
    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    entries = [e for e in catalog["fixtures"] if e["id"] == "01-orb-alpha"]
    if len(entries) != 1 or entries[0]["sourceRights"] != "PROJECT_ORIGINAL_PROCEDURAL":
        raise RuntimeError("Licensed fixture entry is missing")
    digest = hashlib.sha256(FIXTURE.read_bytes()).hexdigest()
    if digest != EXPECTED_IMAGE_SHA or digest != entries[0]["imageSha256"]:
        raise RuntimeError("Input image changed from its licensed SHA")
    source_commit = module.pinned_source_git("head")
    source_status = module.pinned_source_git("status")
    if source_commit != module.SOURCE_SHA or source_status:
        raise RuntimeError("TripoSR Git source is not pinned and clean")
    lock = module.check_materials()
    image, preprocessor = module.prepare_image(FIXTURE)
    print("G3_CPU_ONLY_SOURCE_OWNER_FIX_PASS")
    print("FIXTURE", "01-orb-alpha", digest)
    print("GIT_PINNED_COMMIT", source_commit)
    print("SOURCE_CLEAN", not bool(source_status))
    print("WEIGHTS_SHA_CHECK", "PASS")
    print("IMAGE_PIXELS", image.width, image.height)
    print("PREPROCESS", preprocessor)
    print("NO_CUDA_OR_AI_INFERENCE", True)
    print("ONE_TIME_GPU_APPROVAL_UNCHANGED", True)

if __name__ == "__main__":
    main()
