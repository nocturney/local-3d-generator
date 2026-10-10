# LOCAL3D G3.4 — Manually requested CPU benchmark review + GPU host-memory evidence
2026-10-10 | Preview release v0.2.4-g3-cpu-review

## Scope and honesty

G3.4 extends the G3.3 SHA-locked nine-image catalog, manually consented local G2 TripoSR image-to-3D pipeline and optional offline 3D shape comparison.

**NO fresh image-to-3D inference was performed for G3.4. No CUDA worker, autonomous GPU queue, additional model or print instruction was invoked.** Public model-quality coverage stays **1 previously observed true G2 MIT chair / 8 not run**. The upstream chair has no original 3D ground truth; any CPU review of it must say NO_GROUND_TRUTH_3D instead of inventing a model accuracy number.

Implemented a direct manual **"השוואת G3 (CPU)"** button on a completed, SHA-matched licensed fixture job. It is a CPU-only *postprocessing step*, not inference, and remains DRAFT. Also extended TripoSR's **future successful** runtime report to record periodic NVIDIA shared GPU usage snapshots separately from PyTorch's reported CUDA reserved memory.

## New CPU review API and UI

- POST /v1/jobs/:uuid/benchmark — only a completed real-mode local TripoSR job whose source SHA256 matches one of the nine publicly documented, license-attested fixtures. Explicit click required. Rejects unlicensed sources, unfinished/DEMO jobs and unexpected producer/model SHA or size. No arbitrary model upload, external URL or client filesystem path accepted.
- The G3 source catalog is pinned, and its PNG must pass a fresh exact-file allowlist and SHA check before the CPU scanner is permitted. The GLB must match bytes/hash from the job manifest.
- The server invokes pinned local Python **engines/quality/job_review.py** through execFile (NO shell), with a fixed trusted job directory and output filename, offline HF flags and CUDA_VISIBLE_DEVICES=-1. The existing **manual_job_score.evaluate_job** validates completed state, pinned TripoSR source/weights, source/GLB/QA assets and license catalog; geometry-based shape metric runs for one of eight original synthetic reference models only.
- The result is bounded, checksum-verified, requires printQualified=false/approvedForPrinter=false/modelInferenceExecuted=false/fabricationAction=NONE and is persisted as an optional **benchmark-shape.json** job asset. Duplicate requests return 409 G3_BENCHMARK_BUSY and a finished review is idempotent. A failed or unsafe report never becomes a visible approved asset.
- The Hebrew UI shows the button only after an eligible licensed G2 job completes; **"דוח השוואת G3"** downloads the full report and the summary explains either the normalized post-hoc Chamfer score or NO_GROUND_TRUTH_3D. This is NOT a physical-dimension accuracy percentage and NOT print approval. DEMO, unlicensed and unfinished jobs cannot request benchmarking.
- CPU evaluation still parses local GLB geometry using native packages under the current Windows OS user; OS-level untrusted-input sandbox and enterprise multiuser isolation do NOT exist.

## Actual pinned Python CPU proof, no new model

scripts/g3-4-actual-cpu-review-proof.mjs constructs a disposable temporary API job using the **previously generated real G2 chair GLB** and its licensed source image. The temporary job manifest and the prior G2 QA job-ID association are explicitly reconstructed **FOR CPU REVIEW ONLY**; this does not represent an independently observed new model execution. The test invokes the actual Windows isolated Python scorer via the new LOCAL3D HTTP endpoint (no fake Python scorer) and downloads the report:
- Returned **NO_GROUND_TRUTH_3D**, because no original chair CAD exists
- Report remains DRAFT / no print authority; source and model SHA match historical bytes
- Zero GPU-model worker calls, no new CUDA inference, no new user media, temp job removed
- Second identical request idempotent, report downloadable
- Sanitized evidence: docs/evidence/g3/g3-4-existing-chair-cpu-proof.json

Separate stubbed-provider tests cover real API authorization, duplicate simultaneous requests, missing source rights, tampered model hash and malicious false print approval. Chrome G2 mock tests cover button -> report download -> explicit missing reference message without a second worker. **Do not interpret mock UI acceptance as proof the AI reconstructed a new image.**

## Shared-host GPU telemetry on future manually approved runs

server/triposr-adapter.js now preserves an optional **hostGpuTelemetry** object on successful real inference, and server/index.js writes it to the G2 DRAFT QA provenance. It records:
- initial NVIDIA used/free MiB and utilization from the final of three live preflight observations;
- highest *observed* shared GPU used MiB and utilization, lowest *observed* free MiB;
- count of runtime snapshots and explicit 1500 ms sampling interval;
- peakIsExact=false and the classification that these are **shared-host observations, NOT model-exclusive allocations**.

The native worker's own **peakCudaReservedMiB** stays distinct. GPU usage from Office, the browser or other programs can affect shared NVIDIA observations. Short spikes can be missed; neither measurement proves an exclusive hardware reservation or actual print performance. Existing live Office/NVIDIA pressure guards and cross-process cooperative LOCAL3D lease remain unchanged. No new NVIDIA reads occur unless a manually approved G2 inference is actually launched; mock child tests validate telemetry without touching CUDA.

The private G3 benchmark collector accepts correctly shaped, bounded host GPU telemetry and keeps the fields separate from PyTorch reserved GPU memory. Old G2 data is still valid with no hostGpuTelemetry field. Public historical 1/9 coverage remains unchanged.

## Operation — one fixture at a time, not a batch

1. **GPU approval gate:** Before any new real inference, obtain explicit authorization for the selected G3 image/fixture ID, current Office no-conflict and GPU free-capacity check. The G2 manual process on Windows is separate from G1 and is never started at boot.
2. Deliberately start scripts/start-g2-manual.ps1 from an interactive PowerShell session and open http://127.0.0.1:4179. This starts a localhost UI, not an AI job.
3. Select the chosen one of nine G3 reference images in the UI; loading it must not create a job. Choose TripoSR Local, tick a **fresh** one-image GPU consent checkbox, then request exactly ONE model. The cross-process GPU lease and live Office/NVIDIA checks gate the job. Never run an unattended batch.
4. After completion, optionally click **"סריקת רשת (CPU)"** (topology) and **"השוואת G3 (CPU)"** (source/reference comparison). These buttons are independent, do not rerun the AI and never print.
5. Download the GLB, G2 QA report, topology report and G3 benchmark-shape JSON. Record time, observed host GPU metrics, peak CUDA reserved and actual failure modes. The absolute scale, wall thickness, structural strength and self-intersections remain UNTESTED.
6. Only then consider another fixture, with a separate explicit GPU approval.

Preferred first experimental source after authorization: **01-orb-alpha**, to establish a low-complexity known-reference baseline; then test 02-orb-opaque for background sensitivity and 04-torus-hole for topology. This is a *future trial protocol*, not permission to execute any of these images.

## Remaining blocked gates

- No new completed AI runs for eight synthetic sources yet; no valid cross-model ranking.
- No second local engine installed; candidate license and model weights still need evaluation.
- No fully calibrated camera/physical millimeter dimensions, measured wall thickness, intersection/material/slicer safety or print-qualified release.
- No OS-level outbound-network sandbox or hardened multiuser file isolation. Shared GPU lease is cooperative, not a machine-wide hardware reservation.
- A true *real CUDA cancellation* test needs explicit per-run authorization and live Office/GPU no-conflict; not attempted by this CPU milestone.
- No implicit changes to VelvetOS, Office 2.0 P0 or printer controls.

Keep Issue #3 OPEN. G3.4 improves repeatable post-run measurement and resource evidence; it does not establish reconstructive quality on the unrun images.
