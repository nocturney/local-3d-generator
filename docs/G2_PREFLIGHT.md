# G2 preflight and reproducibility notes (updated 2026-10-09)

## Current gate
**Isolated TripoSR installation and two bounded real GPU pilots: PASS.** Source, 1.68GB checkpoint, TripoSR config and auxiliary DINO config have exact pinned versions and verified local SHA256 hashes. The G1 web app still produces FIXTURE outputs; real inference is NOT available through its API. General background workers, arbitrary customer image processing and print qualification remain unapproved. See G2_RESULTS.md and G2_APPROVAL_2026-10-09.json for exact user approval, resource caps and proof.

## Why the initial read-only preflight originally said BLOCKED
Original environment on Windows Chris had no isolated torch, unverified model bytes, nvcc CUDA 13.2 and ~39% GPU utilization. We created a separate Python 3.11 venv and installed official torch 2.5.1+cu121 wheels without touching global Python/CUDA. Windows GPU graphics workloads still occupy the device, so a generic preflight marks the GPU shared; the approved pilots used a stricter live Office conflict check and bounded VRAM/time guard at the exact time of execution.

## Pinned source and assets
See machine-readable TRIPOSR_SOURCE_LOCK.json:
- VAST-AI-Research TripoSR MIT, commit 107cefdc244c39106fa830359024f6a2f1c78871. Original git checkout remains clean; model code not patched.
- stabilityai/TripoSR MIT model checkpoint 1,677,246,742 bytes, SHA256 429e2c6b22a0923967459de24d67f05962b235f79cde6b032aa7ed2ffcd970ee.
- config.yaml SHA256 74ca708ce086bf68e97709ea6b3d91f14717921c04691e84043f0eb8fcc68e62.
- facebook/dino-vitb16 Apache-2.0 config SHA256 b87c0270b97db085fd82cf114a761fd0f62ae7914fbd407c752a2260646b689c.
- Existing source run.py accepts --model-save-format glb. It otherwise imports xatlas/rembg and can cause hidden model fetches, so the bounded pilot uses an independent local-only image worker with pinned assets and explicit model-fetch barriers.

## Runtime / dependencies
- Gitignored isolated paths: runtime/engines/triposr/src, /venv, /weights. Full checkpoint is NOT committed.
- Tested Python 3.11/Windows CUDA torch 2.5.1+cu121.
- engines/triposr/requirements-win-py311.txt describes direct minimal dependencies; requirements-resolved-win-py311.txt is the full local pip freeze.
- CPU scikit-image marching cubes replaces unpinned source torchmcubes CUDA extension. Native compilation is not required, reducing Windows/CUDA mismatch risk; this is a documented adaptation, not a claim of numerical equivalence.
- Background removal intentionally disabled. Transparent RGBA foregrounds are composited over neutral gray. No rembg/onnx package was installed or automatically fetched.
- During worker inference, HF_HUB_OFFLINE=1, TRANSFORMERS_OFFLINE=1; the tokenizer's DINO config comes from a pinned local file, not a network call. Checkpoint deserialization uses torch.load(weights_only=True).

## Verification already performed
- Python pip check: no broken requirements.
- Runtime imports: torch, transformers, NumPy, OmegaConf, skimage, Trimesh, imageio all passed.
- SHA256 verification of model and config, source commit/clean tree, GLB binary parser and real Chrome viewport all passed.
- Two GPU runs completed in 13.48 s and 14.15 s respectively; peak torch CUDA reserved ~2,058 MiB. Guard checked >=10,000 MiB free, Office Ollama loaded-model count 0, time <=240 s and VRAM hard stops. Returned to observed baseline GPU memory after exit.
- Improved output has mesh report watertight TRUE and consistent winding TRUE, but remains DRAFT and NOT PRINT QUALIFIED.
- Raw model is Z-up; independently verified Y-up derivative is in docs/evidence/g2/chair-yup.glb.

## Repeatability and safety
Use scripts/g2-preflight.mjs only for read-only status. It must not authorize inference. scripts/download-triposr-windows.ps1 is a one-time download/checksum staging utility; rerunning still validates weight hashes. engines/triposr/worker.py is an isolated local image-only worker; scripts/pilot-triposr-windows.ps1 enforces hardware/Office guards before launching it. The user approved bounded pilots but NOT unattended or unrestricted future use. A future operator must confirm GPU capacity and authorization anew, and must not change Office 2.0 P0, printers, external services or shared runtimes.

See G2_RESULTS.md, GATES.md and issue #2 for remaining provider adapter, general input/cancellation and quality benchmark work.
