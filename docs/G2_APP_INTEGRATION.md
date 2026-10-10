# G2.2 - LOCAL3D manual TripoSR integration (2026-10-10)

**Status: implemented and independently tested end-to-end with real local GPU inference.** Default LOCAL3D mode is still G1 DEMO. G2 is a MANUAL-ONLY session that the operator must start explicitly, and each individual image submission requires an explicit GPU checkbox in the browser (and confirmGpu=true in the API). **No unattended background queue, no auto-start and no printer integration.**

## Operations

Default G1 remains unchanged:
    npm start
    http://127.0.0.1:4177

On Windows Chris, after explicitly deciding to enter a manual GPU session:
    powershell -NoProfile -File scripts/start-g2-manual.ps1
    http://127.0.0.1:4179

Run the script from the project root. It checks installed weights/venv and refuses to steal a port. It binds localhost only, sets temporary process-only L3D_ENABLE_TRIPOSR=1, and stores its jobs in **runtime/data-g2-manual**, separate from any G1 session. Closing Ctrl+C ends the process; no scheduled daemon/autostart is installed. Opening the page and selecting TripoSR does **not** start GPU inference until a user chooses an image and checks the one-job explicit confirmation.

G2 is qualified on **Windows / NVIDIA RTX 4080 SUPER**. Mac G1 mode and Edge acceptance remain supported, but real Mac GPU inference is NOT qualified. Text mode is G1 fixture-only. TripoSR is image-to-3D; an optional prompt is stored as an annotation but **never fed as text-to-3D**.

## Architecture

Local browser → POST /v1/jobs (providerId=triposr-local, mode=image, confirmGpu=true, image file bytes) → Node server/index.js → single-process lease → isolated server/triposr-adapter.js → Office+NVIDIA live guard → Windows hidden Python 3.11 venv subprocess → engines/triposr/worker.py → unmodified pinned upstream source & SHA-verified local weights → CPU marching cubes → Y-up GLB → SHA-verified QA artifact → job manifest → existing Three.js viewport and downloads.

Internal stages: g2_gpu_guard, g2_verify_sources, g2_preprocess_image, g2_loading_model, g2_infer_image, g2_extract_mesh, g2_export_glb, g2_ready_draft. Status can be queued/running/cancelling/completed/cancelled/failed/interrupted. Job progress is stage milestones, not invented per-step neural-network telemetry. Each job has immutable UUID storage, manifest, source image, GLB, QA and audit events. Manual GPU submissions are **not queued**; if a GPU permit already exists, the second POST returns 409 G2_BUSY.

On cancellation the job enters **cancelling** until the real subprocess exits. AbortController invokes Windows taskkill /T /F for the entire subprocess tree, then the permit is released. Failures/guard aborts never expose partial model/QA downloads. Restart never resumes GPU jobs; unfinished manifests become interrupted and no Python worker starts automatically.

## Guard and security

- Host remains 127.0.0.1 only. Existing Origin/Host checks, path allowlists, UUID separation and no CORS are preserved. No webhooks, remote paths or arbitrary URLs are accepted from the client.
- MIME/magic bytes and upload <=8 MiB. Before CUDA allocation, Pillow checks full image decode, EXIF orientation, >=64×64 and <=16 million pixels. PNG/WebP alpha is composited onto neutral gray, no surprise rembg/model download. JPEG accepted.
- Exactly one NVIDIA GPU must be recognized. Three live baseline samples: >=10,000 MiB available and <=65% initial utilization; local Office Accelerator's Ollama /api/ps on 127.0.0.1:11555 must be reachable with zero loaded models.
- At runtime: 240-second hard timeout, <2,500 MiB free or >8,500 MiB additional allocated VRAM terminates the worker; new loaded Office Ollama model also triggers termination. These are policy caps, not exclusive hardware reservation; non-Ollama GPU work remains a residual shared-resource risk.
- Git-pinned TripoSR 107cefdc... and locally SHA-verified MIT model checkpoint and Apache-licensed DINO tokenizer config. torch.load(weights_only=True). During inference HF_HUB_OFFLINE and TRANSFORMERS_OFFLINE are set and DINO config lookup uses a pinned local file; no API token/cloud model or payment is used. This is NOT a formal OS firewall-based egress sandbox.
- Python worker is a separately installed venv; no global Python or GPU configuration is modified. Desktop Commander/Office/VelvetOS and Fabrication Router remain untouched.
- Output is image-derived, **Y-up GLB, geometryStatus DRAFT, printQualified=false, dimensions UNCALIBRATED**, no STL manufacturing qualification or printer commands. Watertightness for a particular sample is NOT a structural/printability certification.

## Test evidence

- **26/26** Node API/geometry/security/G2 provider tests on Windows, including concurrent POST lease race, per-job confirmation, staged progress, abort/cancel, failure cleanup, restart, real sample GLB hash and geometry evidence; 5 process-tree/gpu-limit tests execute separate Node fake workers with ZERO GPU allocations.
- **5/5** offline Python contract tests including model source/checkpoint SHA and invalid image handling; GPU is not allocated in these unit tests.
- **7/7** G1 real Chrome browser phases; **5/5** G2 manual UI acceptance phases via MOCK adapter (explicitly not real inference).
- **One owner-scoped, one-time true end-to-end GPU smoke** (not a scheduled test): locally uploaded licensed MIT chair, single job, Office idle guard, real TripoSR, 400,452-byte GLB, peak reserved torch CUDA 2,058 MiB, total engine elapsed 25.51 sec, REAL Chrome viewport screenshot and QA. All paths remained loopback. Worker process and temporary local server exited. Portable evidence is in docs/evidence/g2-app; no API secrets or model weights committed.

The prior engine-only 14.15 sec pilot remains documented in G2_RESULTS.md. The 25.51 sec manual-app smoke is a DIFFERENT measurement, including updated safety/preprocessing, and should not be interpreted as a regressed controlled benchmark without repeated tests.

## Limits / next decisions

1. Run a 5–10 image licensed benchmark for silhouette fidelity, background handling, multipart geometry and real memory peaks before recommending results for customers. Do not use protected customer media as open test fixtures.
2. Add independent mesh repair, measured dimensions, wall thickness, model-to-print workflows and manufacturing quality gates; do not auto-print.
3. Consider a more rigorous OS-level network restriction, process quotas, disk retention policy and dependency CVE review before multi-user/commercial service. G2 is still trusted single-user localhost only.
4. Keep Office 2.0 scheduler and GPU priority separate. Manual sessions can be closed or not started at all; do not turn this into unattended work without new authorization.
