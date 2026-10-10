# LOCAL3D G3.5 — Storage admission, CPU review throttle and dependency advisory screen

**Date:** 2026-10-10
**Target:** v0.2.5-g3-resource-screen (CPU-only release)

## Verified scope

No new AI image inference or GPU model work, no new local engine, no printer commands, no Office/VelvetOS changes, no file deletion and no dependency installation/upgrade. G1 remains the default DEMO-only workflow; manual G2 is still off unless deliberately launched on Windows with per-image GPU consent.

The already-established G3 public benchmark coverage is unchanged: **one historically observed licensed TripoSR chair model and eight original-source benchmark images with NO completed AI inference**. G3.5 does not add model-quality or manufacturing evidence.

## 1. Fail-closed disk admission before manual G2 GPU launch

New source: server/storage-admission.js. Only an explicitly authorized G2 real image job calls this check. G1 DEMO jobs do not.

Default provisional safety policy:
- Maximum accounted stored G2 manual job data: **8 GiB**.
- Reserve **at least 128 MiB** for the proposed new job (or the 8 MiB source plus 16 MiB additional buffer, whichever is greater).
- At least **3 GiB of volume capacity must remain free AFTER the notional reservation**.
- At most **400 existing manually stored G2 job folders** before refusing another.
- Filesystem stat must report trustworthy BigInt block accounting; top-level unexpected entries, symlinks, unreadable/unknown job manifests, unsafe nested entries, mismatched folder counts or disk probe errors all fail closed.
- Error codes: G3_STORAGE_QUOTA (HTTP 507), G3_LOW_DISK_SPACE (HTTP 507), G3_STORAGE_UNVERIFIED (HTTP 503).
- Checks run BEFORE obtaining the cooperative GPU lease, saving the image or starting Python. A failed request creates no model job and does not allocate GPU resources.

**Important limitations:** This is a POINT-IN-TIME *admission check*, not an exclusive disk allocation, physical volume quota or OS file-system sandbox. Other apps, separate LOCAL3D processes and the current worker can still consume space after admission. There is no automatic garbage collection, retention enforcement or destruction of customer files. Thresholds are protective development defaults, NOT agreed corporate retention policy. Review real production disk capacity and retention with the owner before deployment.

### Actual existing-storage proof

scripts/g3-5-storage-readiness.mjs runs a read-only worst-case 8MiB input check against the already-existing local G2 job data. On Chris at this checkpoint:
- 3 stored job folders, approximately 1.92 MB accounted.
- The storage guard returned ADMITTED under its provisional policy.
- Audit before vs after was identical: **3 → 3 folders**, same byte count.
- No job IDs, filenames, prompts, private source images, sensitive paths or exact free-space value are committed.
- Zero deleted files, zero model inference, zero printer commands.

Evidence: docs/evidence/g3/g3-5-storage-admission.json. Current capacity is **not** proof the GPU has adequate headroom later; Office/NVIDIA checks still run separately for each manually approved job.

## 2. Cross-type CPU-only review throttle

Local service state in server/index.js now allows at most **one heavy G3 CPU review** in a given server process, shared between topology (POST /v1/jobs/:uuid/review) and source-geometry comparison (POST /v1/jobs/:uuid/benchmark). This fixes the previous limitation where each review type was independently limited per job but many distinct jobs could request CPU scans concurrently.

- If another CPU review is active, the server returns 409 G3_CPU_BUSY; it never silently queues a scan or starts CUDA.
- Permits are reserved synchronously before any reviewer filesystem awaits and always released in finally, including failure or false-print-approval rejection.
- GET /v1/health now exposes only cpuReviewBusy (boolean), not private job metadata.
- Dedicated tests cover simultaneous geometry/benchmark requests, different job IDs, failed/unsafe reports, permit release, no AI rerun and G1 compatibility.

**Limit:** This is in-process throttling, NOT a shared cross-process CPU semaphore or an OS-level CPU/RAM quota. Multiple independently launched LOCAL3D servers still need a separate shared CPU control. No reviewed image is automatically print-qualified.

## 3. Read-only software dependency advisory screen

Two distinct sources and assessment lanes:

### Node (direct runtime and development deps)

A read-only **npm audit**, once with --omit=dev and once including development packages, reported **zero matched vulnerabilities** in the current v0.2.5 pinned dependency graph on 2026-10-10. A sanitized package-lock SHA-linked summary is stored at docs/evidence/g3/g3-5-npm-audit-summary.json. This is a timestamped audit result, not a vulnerability-free guarantee for future advisories.

### Python / isolated CUDA model environment

scripts/g3-5-dependency-screen.mjs reads the committed frozen, pinned Python dependency manifest and sends **only public PyPI package/version pairs** to the public OSV.dev querybatch endpoint. No source code, runtime model weights, media files, credentials, client prompts, paths or customer data are sent. This optional explicit audit is NEVER part of inference, npm start, npm test, the worker or the browser.

At this checkpoint, OSV returned **104 version-level advisory matches** across **3 of 34 pinned Python packages**:

| Package/version in the isolated environment | OSV matches |
| --- | ---: |
| transformers 4.35.0 | 50 |
| Pillow 10.1.0 | 32 |
| torch 2.5.1+cu121 (matched against public PyPI 2.5.1) | 22 |
| Other 31 frozen dependencies | 0 |

Examples for expert review: [GHSA-29pf-2h5f-8g72](https://osv.dev/vulnerability/GHSA-29pf-2h5f-8g72) (transformers RCE advisory), [GHSA-3f63-hfp8-52jq](https://osv.dev/vulnerability/GHSA-3f63-hfp8-52jq) (Pillow arbitrary-code-execution advisory), [GHSA-3749-ghw9-m3mg](https://osv.dev/vulnerability/GHSA-3749-ghw9-m3mg) (PyTorch denial-of-service advisory). Severity and fixes vary by advisory and must be individually verified.

**Crucial interpretation:** These are **reported matches from a public database**, not 104 independently exploited flaws in this application. Some advisories are conditional on specific package features, file types or unsafe model loading paths and may NOT be reachable through LOCAL3D's pinned, offline-only paths. OSV entries and version matching can overlap. The script makes NO exposure/exploitability claim. But the result means a commercial or untrusted-image service should NOT be declared security-qualified without a true code-path triage, dependency compatibility tests, isolated patching and, ideally, OS-enforced outbound-network and filesystem confinement.

No dependencies were changed. The currently tested G2 venv remains intact; automatic upgrades of Pillow/Transformers/Torch could break the pinned model and would need a separate versioned, isolated compatibility experiment. Operator UI now explicitly advises using only **trusted source images** in the G2 manual development workflow.

Evidence: docs/evidence/g3/g3-5-python-osv-screen.json. The full raw npm audit is retained only under gitignored runtime/qa/g3.

## Tests and remaining G3 gates

The G3.5 unit/API tests verify positive storage admission, low-free-volume refusal, byte quota, max folder count, rogue/untrusted files, corrupt manifests, missing disk telemetry, G1 isolation, zero new workers/leases, cross-job CPU reviewer contention and release after unsafe report. They use disposable temp paths and mocks with **no model CUDA inference**. Full Windows regression: **64/64 Node tests**, **5/5 isolated G2 Python tests**, **18/18 G3 Python tests**, **8/8 G1 Chrome phases**, **8/8 G2/G3 mock Chrome phases**. Browser tests did not run a new AI model.

Still unresolved:
1. **Python security remediation gate:** Confirm which OSV advisories are reachable, prioritize impact, build a new isolated/pinned compatible environment and run CPU regression before any explicitly authorized real GPU compatibility test.
2. **Real benchmark coverage:** Eight original reference cases remain unrun on a real model. Each new GPU inference requires separate explicit approval and a contemporaneous Office/GPU safety check; there is no autonomous batch.
3. **Production storage/CPU hardening:** OS-backed quotas, multi-process CPU caps, independently agreed retention/deletion consent, secure data isolation and outbound-network sandbox.
4. **Manufacturing qualification:** Correct physical units, wall thickness, intersections, materials, strengths and print safety are NOT established. No print-ready STL/3MF or printer commands.
5. **Second engine:** research-only until rights/dependency/VRAM inspection and explicit installation authorization.

Issue #3 remains OPEN; G3.5 is a controlled resource/supply-chain screening milestone, **not** completion of all G3 or print qualification.
