# LOCAL3D G3.2 — shared GPU coordination, benchmark ledger, storage audit
Date: 2026-10-10. Release: v0.2.2-g3-safety-preview.

**Status:** Implemented and tested with CPU/mock workers; NO NEW TripoSR or second-engine GPU inference. G2 remains explicit manual Windows localhost with per-image GPU confirmation. G1 remains DEMO by default. No new printer, cloud provider or Office core changes.

## 1. Critical cross-process GPU coordination

Previous v0.2.1 single-job limiter was effective inside ONE Node app but not across TWO manually started LOCAL3D servers with different ports/data folders. Fixed in server/gpu-lease.js and server/index.js.

- Filesystem-atomic coordination directory: runtime/gpu-coordination/triposr-gpu.lock, common to all production G2 sessions.
- A second LOCAL3D server receives HTTP 409 G2_SHARED_GPU_BUSY BEFORE it saves a job or starts a worker. There is never an unattended GPU queue.
- Lease metadata includes random owner ID, PID, timestamp. Only owning process may release after its worker terminates. Cancellation, errors and normal shutdown release the lease after process cleanup.
- On crash or damaged metadata, NEVER auto-steal a lock. Parent death does NOT prove its worker is dead. An owner must inspect running LOCAL3D/Python workers and Office/GPU contention before manual cleanup.
- Read-only operator diagnostic: npm run audit:g3:gpu-lock. It never removes a lock or kills processes.
- Tests verify atomic contention, wrong-owner release, invalid/stale locks, a truly separate Node child process and two separate localhost HTTP server instances competing for the same lease. No test invokes GPU.
- This is a COOPERATIVE guard among LOCAL3D processes, NOT exclusive hardware scheduling; Office and other applications still require live NVIDIA/Ollama checks.

## 2. Benchmark ledger from verifiable existing evidence

- Source catalog: nine SHA-locked licensed references in benchmarks/g3/fixtures; eight project-original synthetic rendered images with original reference 3D (NOT reconstructed AI output), plus one prior MIT TripoSR chair photograph.
- Generated, read-only public coverage: docs/evidence/g3/benchmark-coverage.json by npm run benchmark:g3.
- Coverage: 1/9 previously observed genuine G2 image-to-3D chair run; 8/9 have no model inference yet. No synthetic reference GT is counted as an AI prediction.
- G2 historical metrics: 25.51 seconds (single prior run), peak PyTorch CUDA reserved 2058 MiB, one topologically closed but negative signed-volume chair. No print qualification. Approximate best 24-view silhouette IoU 0.82448 is explicitly POST-HOC, not calibrated reconstruction accuracy.
- Collector verifies catalog source/mask/GT hashes and historical G2 checkpoint/GLB/QA/E2E evidence before counting outputs. A tampered asset causes failure.
- Optional local scan: node scripts/g3-collect-benchmark.mjs --jobs-dir runtime/data-g2-manual/jobs. Only licensed SHA-matching completed real-model job records may enter PRIVATE coverage; each distinct private report goes into gitignored runtime/qa/g3/benchmark-coverage-private-<report-SHA-prefix>.json (append-only, no silent overwrite). Unknown/mocked/mismatched jobs are excluded. Input names, prompts, paths and job UUIDs are not emitted.
- SHA-verified local records are not independent hardware attestations; the ledger labels them separately from the earlier G2 real Chrome E2E.
- GET /v1/benchmarks/g3 exposes ONLY the fixed public licensed coverage snapshot, no GPU action. The Hebrew sidebar now shows nine cases and 1/9 previously observed real output. This is NOT a live inference counter and does NOT launch jobs.

## 3. Storage retention readiness — audit ONLY

- Run npm run audit:g3:storage. Reads metadata and file sizes from runtime/data-g2-manual/jobs and writes a sanitized summary under gitignored runtime/qa/g3/storage-audit.json.
- Counts stored job folders, statuses, bytes, age over 30 days and unsafe filesystem entries. No photo, filename, prompt or job ID is copied into the audit report.
- Observed on Windows Chris at milestone: 3 manual G2 job directories; 1 completed and 2 failed; ~1.92 MB; 0 older than 30 days. This is current observation, NOT a permanent inventory or backup certification.
- No files deleted, no quota enforced, no automatic cleanup or backup. Retention/consent/quota policy still needs design approval.

## 4. Qualification, safety, rollback

- No new CUDA jobs, source checkout, model installation, scheduler, network egress firewall, OS service, Office or printer changes were executed.
- Default G1 remains on port 4177, manual G2 (when launched by user) on port 4179. Tests use temporary ports/dirs and fake workers.
- Original G3 independent CPU geometry review, negative-volume detection and separate DRAFT winding derivative remain as before.
- Issue #3 stays OPEN: 8 licensed sources still await REAL image-to-3D runs; second local model uninstalled; scale, wall-thickness, self-intersections, manufacturing print release, OS sandbox, multi-user authentication and retention enforcement remain unqualified.
- Rollback: stop LOCAL3D processes, preserve all runtime job files and investigate any outstanding GPU lease manually before reverting to v0.2.1. Never remove a lock without proving no worker can still own the GPU.
- Generated public coverage report is intentionally immutable if it differs from the previous result; reconcile before replacing. Private source/job data must remain outside GitHub.
