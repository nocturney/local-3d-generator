# G2 milestone: first REAL local TripoSR image-to-3D - 2026-10-09

**Status: limited, owner-authorized GPU pilots succeeded. Full application provider integration remains DISABLED / NOT APPROVED.** G1 Web app still creates deterministic DEMO fixture jobs, not real inference. Do not present G2 as a generally available image-to-3D service.

## Isolated installation and immutable provenance

- Source: VAST-AI-Research/TripoSR MIT, detached at 107cefdc244c39106fa830359024f6a2f1c78871. Upstream source remains git CLEAN, untouched.
- Model: stabilityai/TripoSR MIT, exact revision 5b521936b01fbe1890f6f9baed0254ab6351c04a, model.ckpt 1,677,246,742 bytes, SHA256 **429e2c6b22a0923967459de24d67f05962b235f79cde6b032aa7ed2ffcd970ee**, verified against LOCAL BYTES twice.
- Model config.yaml SHA256 74ca708ce086bf68e97709ea6b3d91f14717921c04691e84043f0eb8fcc68e62.
- Required DINO tokenizer config: facebook/dino-vitb16, revision f205d5d8e640a89a2b8ef0369670dfc37cc07fc2, Apache-2.0, local config SHA256 b87c0270b97db085fd82cf114a761fd0f62ae7914fbd407c752a2260646b689c.
- Runtime: Windows Chris RTX 4080 SUPER, isolated Python 3.11 venv at runtime/engines/triposr/venv, torch 2.5.1+cu121 (no global Python modification), transformers 4.35.0, tokenizers 0.14.1, NumPy 1.26.4, scikit-image 0.22.0. Exact resolved freeze at engines/triposr/requirements-resolved-win-py311.txt.
- NO unpinned native torchmcubes: an explicitly authored CPU scikit-image marching-cubes substitute is used. No xatlas, Gradio, cloud model API, default rembg weights or subprocess compiler needed in this initial adapter. Network/model download disabled during worker inference; source/config/weights validated before GPU load.
- Engine source, checkpoints and live pilot jobs are in gitignored runtime; only limited MIT-licensed demonstration evidence is copied to docs/evidence/g2.

## Scope and GPU guard

The user explicitly approved **isolated installation and a bounded GPU experiment after checking Office no-conflict**, not standing authorization for unrestricted job queues. Decision: docs/G2_APPROVAL_2026-10-09.json.

Each pilot checked 3 consecutive NVIDIA GPU samples with >10,000 MiB free and <=65% utilization, no loaded Ollama model on Office Accelerator's local port 11555, allocated one process, 240 s max timeout, >8,500 MiB additional memory or <2,500 MiB free triggers a stop, and refused any printer/Office/cloud interaction. Original occupancy was ~4,644 MiB; GPU returned to baseline after each run. NVIDIA CUDA peak reserved is reported from PyTorch; it is not equivalent to full WDDM host memory accounting.

## Results

| Pilot | Preprocessing | Total wall clock | Peak torch reserved | Vertices | Faces | Raw GLB | Outcome |
|---|---|---:|---:|---:|---:|---:|---|
| tripo-20261009T205831222-b90af4a0 | Transparent black pixels inadvertently converted to RGB black | 13.48 sec | 2058 MiB | 12,999 | 25,998 | 520,980 bytes | Genuine model/GLB; visibly inferior. Worker succeeded; PowerShell wrapper incorrectly read null exit code as failure. Corrected for next trial. |
| tripo-20261009T210159110-e62b9a20 | RGBA composited onto neutral gray, no rembg | **14.15 sec** | **2058 MiB** | **9,986** | **19,972** | **400,452 bytes** | Genuine image-derived GLB, clear chair shape, guarded launcher success |

The improved pilot took 9.63 sec to load weights, 2.59 sec for the forward image reconstruction. Marching cubes uses resolution 128 and renderer chunk size 2048, deliberately modest to limit resource contention. Upstream A100 speed claims are NOT local results.

## Model orientation correction

TripoSR source mesh has **Z-up**, while Three.js/glTF displays expect **Y-up**. A separate CPU-only rigid -90-degree rotation about X produced:
- Derived file: docs/evidence/g2/chair-yup.glb (400,652 bytes).
- SHA256: **03e0e70d1bfffaae36bda09b56bf65f33f8c60a132d6a9caf7fca8f87621b7be**.
- Bounds (X,Y,Z): approx [0.61345, 1.06718, 0.57130].
- 9,986 vertices, 19,972 faces, watertight and consistent winding in Trimesh.
- GLB parsed and displayed successfully using the real Three.js GLTFLoader and Chrome; 0 browser JS errors and 0 external requests. Visual proof: docs/evidence/g2/chair-preview.png.

Raw model.glb is retained unmodified in the gitignored runtime/pilots job alongside the Y-up derivative and separate SHA-preserving provenance. Python postprocess: engines/triposr/reorient.py.

## Printing and quality boundaries

Watertight TRUE and consistent winding TRUE apply ONLY to this sample mesh. There is no dimensional calibration, wall-thickness proof, supportability, materials suitability, manufacturing strength, a multi-view benchmark or print-qualified STL/3MF output. The visual reconstruction is recognizable, not production-quality. Output status is DRAFT / printQualified=false. No printer connection, Office P0 modification, Fabrication Router mutation, paid fallback or scheduled GPU task.

## Next engineering gate (still open)

A) Engineer a bounded provider adapter behind a separately approved activation flag, supporting start/status/cancel/result plus child-process cleanup, isolation, input security and per-job provenance.

B) Expand input processing safely to real user images (PNG/JPEG/WebP, alpha compositing, optional separately licensed background removal); then test error/cancellation/VRAM pressure and image-dependent geometry using several licensed fixtures.

C) Preserve Y-up output and prove mesh geometry quality, not only screenshot aesthetics. Benchmark other qualified local engines independently.

D) Keep G1 fixture mode clearly separate until real-model backend integration and security/quality gates pass.

Issue: https://github.com/nocturney/local-3d-generator/issues/2
