# Release notes

## Unreleased hotfix — 2026-10-10 — G3 TripoSR Windows Git source-owner mismatch

- Confirmed a real one-time user-authorized `01-orb-alpha` job failed **before model inference**, at `verify_sources`: TripoSR source checkout is owned by Windows SYSTEM and the interactive CHRIS operator encountered Git's `detected dubious ownership` (exit 128).
- Updated `engines/triposr/worker.py` to use `git -c safe.directory=<exact resolved TripoSR source>` **only for fixed `rev-parse HEAD` and `status --porcelain` read-only checks**. No wildcard, no global safe.directory/owner change, no skipping dirty tree, commit, checkpoint, config or DINO SHA256 integrity verification.
- Added CPU-only `scripts/g3-verify-triposr-source-owner-cpu.py` to validate Git source integrity, model SHA and the licensed `01-orb-alpha` image **without CUDA, job submission, prints or network requests**.
- Added isolated Python regression cases for exact path/scoped Git commands, disallowed operations and tampered source. Remote CPU-only verification succeeded; **interactive CHRIS-account acceptance is still pending**.
- Preserved the failed job evidence and spent one-time approval latch. The historic v0.2.4 snapshot remains unchanged, and **no new GPU permission is implied**.

## v0.2.6 — 2026-10-10 — G3.6 isolated Pillow shadow compatibility research

- Downloaded and cryptographically verified the **official PyPI Pillow 12.3.0 Windows CPython3.11 wheel** in private gitignored runtime only, SHA256 8e95e1385e4998ae9694eeaa4730ba5457ff61185b3a55e2e7bea0880aef452a. Public OSV version matches: **0 candidate vs 32 for Pillow 10.1.0**, not codepath safety certification.
- Verified **9/9 license/SHA-locked source images**, 4 synthetic alpha/EXIF/WebP/corrupt-image input tests, 23/23 G2/G3 Python unit tests and an import-only TripoSR tokenizer/system check with pinned Transformers/Torch under shadow Pillow. No weights loaded, no CUDA inference.
- **No upgrade to the live G2 Python runtime or frozen model requirements**. Production Pillow stayed 10.1.0 before and after. Candidate is not activated by the app or startup.
- Added reproducible CPU-only shadow research scripts, public-only optional OSV/PyPI metadata screen, sanitized provenance-locked result, safety documentation and automated artifact assertions. Full regression: 67/67 Node, 23/23 pinned Python and 23/23 shadow-Pillow Python, 8 G1 and 8 G2/G3 mock Chrome phases. A separate v0.2.6 npm audit summary reports 0 Node advisory matches with its own lockfile SHA, preserving the historical G3.5 result. No new user-source images, model predictions, print commands, Office or system configuration changes.
- Open security issue #4 still requires actionable advisory codepath triage, Transformers/Torch compatibility, an isolated complete patched environment and fresh approval for any real CUDA compatibility trial. G3 quality benchmark remains 1 historical model result / 8 unrun images.

## v0.2.5 — 2026-10-10 — G3.5 manual storage safety and Python dependency-advisory screen

- Added fail-closed pre-GPU storage admission for each manually consented real TripoSR job: 8GiB maximum accounted G2 job storage, at least 3GiB remaining free after a prospective 128MiB reservation, 400-folder cap and unsafe/corrupt manifest rejection. No automatic deletion, quota reservation or behavior change for default G1 DEMO.
- Serialized manual G3 geometry and shape CPU reviewers **across review types and job IDs within a single server process**, returning 409 G3_CPU_BUSY instead of launching unbounded parallel CPU tasks.
- Validated the guard against the existing private Windows G2 storage data in read-only mode: 3 folders and identical audited data before/after, 0 deletions, no new model execution.
- Read-only Node npm audit reported 0 vulnerability matches. An optional public OSV.dev screen of 34 pinned Python package/version pairs returned 104 **untriaged public advisory matches** across Transformers, Pillow and Torch. No exploitability claim or package upgrade; manual UI explicitly warns to use only trusted image sources pending full Python security triage.
- Added storage/CPU concurrency and negative-path regression tests, sanitized public evidence, and separate audit scripts excluded from all startup, browser and inference paths. Validation: 64/64 Node, 23/23 Python, 8/8 G1 Chrome and 8/8 G2/G3 mock Chrome phases.
- G3 benchmark completeness remains **one historical true GPU chair / eight unrun synthetic cases**. No new AI model inference, printer, Office modification, OS firewall change or second engine installation.

## v0.2.4 — 2026-10-10 — G3.4 completed-job CPU benchmarking and shared-host GPU metrics

- Added an explicit **G3 CPU comparison** button/POST /v1/jobs/:uuid/benchmark for completed G2 jobs whose source SHA matches a licensed G3 fixture. The bounded, isolated local Python scorer verifies the completed job, source/GLB/QA hashes and pinned model; writes downloadable DRAFT benchmark-shape.json without allocating GPU.
- UI clearly distinguishes known procedural original GT (post-hoc normalized Chamfer diagnostic) from licensed sample photographs with **NO GROUND-TRUTH 3D**. Unlicensed, unfinished, tampered or falsely print-approved outputs fail closed.
- Actual pinned Python scorer exercised through a temporary localhost API using the **existing** historical G2 real chair GLB. No new model inference, no printing and no source-image uploads.
- Future manually approved TripoSR runs now record NVIDIA shared-host initial/lowest-free/highest-used/highest-utilization snapshots and sampling count separately from PyTorch peak CUDA reserved VRAM, with explicit nonexclusive and inexact-peak caveats. Mock child tests verified this without CUDA.
- Original G3 public benchmark coverage remains exactly 1 previously observed real chair / 8 unrun new images. Issue #3 stays open for per-image real GPU results and manufacturing validation.

## v0.2.3 — 2026-10-10 — G3.3 manual benchmark sources and CPU 3D shape diagnostics

- Added reproducible CPU-only reference mesh surface metrics for 8 project-original synthetic cases. Positive self-controls produce zero Chamfer by construction; 4 intentionally wrong-shape controls detect differences. Metrics are post-hoc yaw/scale normalized and NOT print/manufacturing qualified.
- Added strict hash-linked local G2 completed-job scoring to gitignored private runtime, without claiming independent GPU execution attestation, using existing pinned TripoSR source/weight provenance. Upstream chair has no original 3D GT, and attempts to pass original GT copies off as AI are rejected.
- Added an allowlisted SHA-verified source-image endpoint and Hebrew G3 image picker. Loading images never creates jobs or allocates GPU; changing a selected image revokes prior GPU consent.
- Connected optional private scores to the privacy-preserving benchmark collector while leaving public 1/9 coverage intentionally fixed. No new model inference, Office changes, printer actions or second engine installation.
- Regression: CPU quality and provenance negative tests plus Chrome G1/G2 per-image consent tests. Issue #3 still OPEN for actual per-image AI benchmarking and manufacturing qualifications.

## v0.2.2 — 2026-10-10 — G3.2 resource safety & honest benchmark coverage

- Introduced a cross-process LOCAL3D GPU filesystem lease shared across manual G2 server processes; concurrency rejected with 409 before allocating a GPU worker, release on completion/cancel/shutdown, stale locks never auto-recovered.
- Added read-only nine-source benchmark coverage: previous actual G2 chair output 1/9, eight unrun sources explicitly PENDING; strict source/GLB/QA/weight SHA checking and privacy-preserving optional local job scan. No new inference was executed.
- Added read-only G3 benchmark status to the Hebrew sidebar, backed by GET /v1/benchmarks/g3 fixed public evidence. This does not start GPU jobs or falsely rank engines.
- Added safe, metadata-only local job-storage audit (counts/bytes/age, no deletion or client data) and read-only GPU-lock inspection.
- Added Windows multi-process lease tests, two-live-API-instance contention, provenance-tamper tests and browser assertions. No Office, printer or OS firewall changes.
- **Still blocked:** multi-image real benchmark, second provider install/qualification, physical manufacturing checks, commercial multi-user hardening or unattended AI.

## v0.2.1 — 2026-10-10 — G3 CPU quality preview (NOT full model benchmark)

- Added a complete 9-reference source catalog with immutable SHA provenance: eight project-original procedural 3D/product-image/mask triples plus one upstream MIT chair photo. No new GPU inference or third-party model installations.
- Added offline CPU Trimesh GLB scanner (topology, edge incidence, winding, signed volume and bounded geometry) and exploratory 2D silhouette IoU with calibrated positive controls. NOT print qualified, no physical unit/wall-thickness claim.
- Connected a manual CPU-only geometry-review button and /v1/jobs/:uuid/review endpoint to completed real-model jobs; validated SHA before/after review, one review at a time, rejected compromised models and falsely print-qualified reports.
- Identified the real previous TripoSR chair's negative signed volume despite watertight mesh. Added an optional strictly guarded, *non-destructive* positive-winding GLB derivative and source/output SHA report; still DRAFT.
- Completed browser proof using existing real GLB, actual CPU reviewer and ZERO new GPU inference; 0 browser errors or external requests. Added regression tests and separate engine rights/VRAM screening.
- G3 issue remains OPEN: no new fixture inference for the eight originals, no second engine installed/benchmarked, no production/printing release.

## v0.2.0 — 2026-10-10 — Manual local TripoSR image-to-3D

- Added a **real, on-device TripoSR image-to-3D adapter** behind an explicit Windows-only manual session. It is disabled by default; G1 remains a deterministic, no-GPU demonstration.
- Added per-job GPU confirmation in the Hebrew UI, runtime provider discovery, separate demo/real labels and staged job progress. Upload supports PNG/JPEG/WebP with server-side decode/pixel limits. Text remains demo/annotation-only, not text-to-3D.
- Added live Office Accelerator/Ollama conflict checks and NVIDIA GPU headroom gates, a single atomic GPU permit, time/VRAM guards, process-tree cancellation, shutdown/restart safety and fail-closed artifact publication.
- Added dedicated G2 manual launch script on **127.0.0.1:4179** and separate runtime/data-g2-manual storage; original G1 on 4177 and existing unrelated service on 4178 remain untouched. No autostart or background GPU scheduler.
- Verified a genuine local GPU image→GLB→API→Chrome viewport run with the MIT-licensed TripoSR chair fixture: 25.51 s model worker, 2,058 MiB peak PyTorch CUDA reserved, 400,452-byte Y-up GLB, DRAFT/non-printable report, full artifact SHA256 chain.
- Added isolated offline worker preprocessing, pinned weights and DINO config, CPU marching cubes, extra test harnesses, independent model provenance, and complete security/operations documentation.
- Validation: 26 Node tests (including real Windows fake-child process termination), 5 isolated Python tests, 7 G1 browser phases, 5 G2 manual mock-browser phases and the separate one-time real inference smoke; no model inference occurs under normal npm test.

**Important limitations:** One real licensed source image only; output is not CAD, dimensionally qualified or suitable for print release without separate geometry QA. No SaaS/paid fallback, remote access, user authentication, automatic GPU jobs or Office 2.0 integration.

## v0.1.0 — 2026-10-09 — G1 standalone clean-room fixture workbench

- Built an independent Hebrew RTL localhost Node/Three.js workbench with deterministic GLB demo fixture, upload history, API job manifests, audit, download and camera controls.
- Added G1 Windows Chrome and macOS Edge acceptance with full DEMO/NOT PRINT QUALIFIED truth labeling.
- Pinned Three.js and model-engine research candidates without allowing unreviewed source reuse or cloud provider fallback.
