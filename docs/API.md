# LOCAL3D internal loopback API v1 — G1 plus opt-in G2

Bind: **127.0.0.1 only**; default G1 4177, explicit G2 Windows manual session 4179. No CORS, no printer, remote URLs, paid providers or unattended GPU scheduling. JSON request and response formats are authoritative.

## G3.4 explicit finished-job CPU benchmark (NO GPU)

POST /v1/jobs/:uuid/benchmark — only when a manually consented local TripoSR job is **completed**, its GLB SHA matches the stored manifest, and its exact licensed input image matches the pinned G3 nine-reference catalog. No unlicensed user media are passed through the evaluation. The server invokes a fixed offline Python CPU evaluator with a 45-second timeout and no client filesystem paths.

Results remain DRAFT as **benchmark-shape.json** and are downloadable by GET /v1/jobs/:uuid/assets/benchmark-shape. Reports always set modelInferenceExecuted=false, printQualified=false, approvedForPrinter=false, fabricationAction=NONE. A matching original reference model yields scale-normalized post-hoc 3D shape distance (NOT physical millimeter accuracy); the upstream chair yields NO_GROUND_TRUTH_3D and no fabricated shape value. Empty/DEMO/running/unlicensed input returns 422; simultaneous reviews of the same job return 409 G3_BENCHMARK_BUSY; reports already persisted are idempotent. This endpoint does NOT start a model, acquire GPU, queue tasks or print.

Successful future G2 real-mode QA provenance may include hostGpuTelemetry: observed initial shared GPU free/used/utilization, peak observed used/utilization, minimum observed free, sample count and period (1.5s). These are NVIDIA telemetry estimates, not exclusive model GPU allocation or exact peaks; PyTorch peakCudaReservedMiB remains a separate metric.

## G3.3 licensed benchmark-image loader (read-only)

GET /v1/benchmarks/g3/sources/:fixtureId — accepts only one of the nine exact G3 licensed IDs (01-orb-alpha through 09-upstream-chair). Returns schema local3d.g3.fixture-image.v1 with image={filename,mime:image/png,base64,bytes}, fixtureId, sourceRights, sha256, manualOnly=true, confirmationGranted=false, modelInferenceExecuted=false and printQualified=false. The server checks fixed allowlisted paths, PNG magic, 8MiB file limit and source SHA256 before return. It does NOT create jobs, execute inference, change provider state, confirm GPU or access client files. Invalid ID returns 404; source-integrity failure 503.

The browser image picker requests a source then creates a File object locally; like manual upload or drag/drop, **any source-image replacement/clear revokes the previous GPU consent**. Explicit checkbox + POST /v1/jobs with confirmGpu=true is still required separately for each real image.

CPU-only private comparison after completed G2 job is an operator CLI, not an HTTP endpoint: npm run score:g3 -- --job-id <uuid>. It writes a gitignored private score. Only the eight project-original synthetic references have actual source 3D for post-hoc normalized surface comparison; the upstream chair has no ground-truth 3D.

## Read-only G3 source-quality coverage

GET /v1/benchmarks/g3 returns schema local3d.g3.benchmark-coverage.v1 from the fixed licensed, publicly committed benchmark-coverage.json. It is a **stored snapshot** of nine reference sources: one previously observed true-local TripoSR E2E result, eight cases with no recorded model. It is not a live provider status, does not scan private user files and cannot trigger inference. Distinguishes original synthetic source 3D from generated model outputs, and hash-matched local records from independent GPU execution proof. All manufacturing flags remain false.

## Providers

GET /v1/providers returns identity, version, inputTypes, outputTypes, hardwareNeeds, licenseLane, simulation, status and canStart/canCancel:
- fixture-demo — G1 CPU demo, canStart=true on all supported hosts.
- triposr-local — G2 real single-image engine. In default session: status STAGED_DISABLED, canStart=false. On explicitly opted-in Windows manual server: status MANUAL_OPT_IN, canStart=true, canCancel=true. This indicates eligible for a one-job request; live GPU/Office guard still must pass after POST.
- hunyuan-shape — research only, canStart=false.

GET /v1/health: schema local3d.health.v1, service, localOnly=true, inference (whether a manual real provider is enabled), status=G1_DEMO or G2_MANUAL_OPT_IN, jobs, gpuBusy, autoGpuQueue=false, printing=false.

## Create job

POST /v1/jobs, application/json.

For G1: providerId=fixture-demo; mode=image or text; prompt length <=1200 (min 3 for text); optional image for image mode. simulation=true. Real input and text do not alter the deterministic G1 fixture.

For opted-in G2: providerId=triposr-local; **mode=image only**; image={filename,mime,base64} with PNG/JPEG/WebP, up to 8 MiB, valid image MIME/magic signature. Browser's GPU checkbox maps to **confirmGpu=true for each POST**. If not present, 422 G2_CONFIRM_REQUIRED; text requests are rejected G2_IMAGE_ONLY. Prompt is saved only as a label and is not a text-to-3D model instruction. Real worker performs additional pixel validation, EXIF orientation handling, alpha compositing and GPU/Office verification.

Response 201: a Job Manifest. Fields: schema, id (UUID), providerId, mode, prompt, simulation (true G1, false G2), seed, status, stage, progress, createdAt, updatedAt, completedAt, error, source and assets. G2 job initially queued then runs manually immediately; **no GPU queue**. If another real job is still reserving GPU, 409 G2_BUSY; it will never be queued to run later.

## Read job, cancel and assets

- GET /v1/jobs — last 50 newest
- GET /v1/jobs/:uuid — live details (poll ~1 sec)
- POST /v1/jobs/:uuid/cancel — G1 marks cancelled immediately; G2 marks cancelling and signals the process tree to stop. Status changes to cancelled only after worker exits and GPU permit is released; do not claim process stopped while cancelling
- GET /v1/jobs/:uuid/assets/:artifactId
- GET /v1/health for gpuBusy status
- POST /v1/jobs/:uuid/review — **CPU-only G3 geometry report**, completed manual TripoSR job only; no input paths/URLs, no GPU/model launch, one reviewer per job (409 G3_REVIEW_BUSY on parallel request). Validates existing GLB against manifest SHA before executing the pinned local Python scanner and checks returned JSON SHA/status; idempotent after a completed review. G1 demo, incomplete jobs and disabled G2 sessions return 422 G3_REVIEW_UNAVAILABLE.

Allowlisted assets:
- source-image — verified original uploaded local photo
- preview-glb — G1 deterministic fixture OR G2 SHA-verified local real Y-up GLB, MIME model/gltf-binary
- qa-report — JSON DRAFT inference/source provenance, never print approved
- geometry-qa — G3 *optional on completed real TripoSR jobs*, independent JSON CPU topology/signed-volume report; never print approved. Source model must pass SHA and length verification. No material-unit/print qualification is implied.

No arbitrary asset path, URL, filename or command is accepted. Source filename is display-only and never used as a local path. Every asset has MIME, length, SHA256 and label in manifest. No model/API token or filesystem path is returned to the browser.

Statuses: queued, running, cancelling (G2 only), completed, cancelled, failed, interrupted. On restart queued/running/cancelling jobs are recovered as interrupted — **no real model resumes automatically**.

G1 stages: demo_intake, demo_processing, demo_packaging, fixture_ready (simulated percentages).

G2 stages: g2_gpu_guard, g2_verify_sources, g2_preprocess_image, g2_loading_model, g2_infer_image, g2_extract_mesh, g2_export_glb, g2_ready_draft; stage percentages are coarse progress milestones, NOT token or network telemetry.

## Safety and errors

Cross-process manual GPU contention returns 409 G2_SHARED_GPU_BUSY. An unverified filesystem lease root or suspicious stale lock blocks new G2 work; do not try to auto-recover. Lease inspection is read-only (npm run audit:g3:gpu-lock) and is not an HTTP write endpoint.

Typical errors: {error:{code,message}}. Codes include BAD_JSON, BAD_IMAGE, PROMPT_REQUIRED, PROVIDER_UNAVAILABLE, G2_CONFIRM_REQUIRED, G2_IMAGE_ONLY, G2_BUSY, ALREADY_FINISHED, HOST_DENIED, ORIGIN_DENIED, INVALID_JOB_ID, NOT_FOUND, CAPACITY. Engine failures are reflected in persisted job status/error (codes such as G2_GPU_BUSY, G2_OFFICE_BUSY, G2_GPU_LIMIT, G2_TIMEOUT, G2_WORKER_FAILED) without exposing sensitive stdout/stderr or local paths.

Network fallback, external model URLs, webhooks, remote paths and arbitrary shell commands are forbidden. G2 requires trusted single-user Windows loopback plus a manually launched opt-in session; it does not provide authentication for remote or multiple local OS users.

## Qualification

Every G2 report includes geometryStatus=DRAFT, printQualified=false and approvedForPrinter=false. A watertight sample is not proof of wall thickness, dimensions, strength, supports or printer safety. Real geometry generation is **image-to-3D only**, not semantic text-to-3D or CAD repair.

Full security/operational notes: G2_APP_INTEGRATION.md, SECURITY.md and OPERATIONS.md.

## G3.5 disk and CPU review safety

A real G2 POST /v1/jobs request **must** pass the read-only local storage-admission check **before** any shared GPU lease acquisition or Python subprocess. If the prospective single job would exceed 8GiB of currently accounted job storage, 400 existing manual folders, or leave fewer than 3GiB free after a conservative 128MiB reservation, response is HTTP 507 with G3_STORAGE_QUOTA or G3_LOW_DISK_SPACE. Invalid storage accounting, rogue entries or disk-stat failures return HTTP 503 G3_STORAGE_UNVERIFIED. The request does not create a new job, queue GPU inference or delete old files.

GET /v1/health now has cpuReviewBusy:boolean in addition to gpuBusy:boolean. This reports only a current per-process CPU review, not any secret job ID, exclusive CPU allocation or multi-server workload telemetry. Both G3 manual CPU review routes share one permit; simultaneous requests for different completed jobs or different review types return HTTP 409 G3_CPU_BUSY without adding a background queue. Per-job duplicate codes G3_REVIEW_BUSY/G3_BENCHMARK_BUSY remain as before.

Development safeguards only; no native OS disk quota, automatic retention, untrusted-data isolation or print qualification. See G3_5_RESOURCE_SECURITY_2026-10-10.md.
