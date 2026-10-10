# LOCAL3D security/threat model — G1 and manual-only G2

## G3.14: full conservative AABB candidate coverage is NOT global contact-free proof

G3.14's independent bounded box-sphere CPU broadphase enumerates all AABB-overlapping face-pair CANDIDATES with a finite declared numerical tolerance relative to arbitrary GLB coordinates. This is a useful new count/provenance gate, NOT an exact test that surfaces do not penetrate. It counts indexed edge/vertex adjacency but does NOT classify their extra intersections globally. Non-indexed overlapping AABBs receive floating-point SAT risk screening only, exact G3.13 pair checks are limited to SAT-positive pairs; a numerical SAT negative can miss near-degenerate tiny features. True CAD mm-scale, minimum wall thickness and physical printer qualification remain BLOCKED.

Inputs are capped at 75k faces, 100k vertices, 2M bounding-sphere pairs, 750k AABB pairs, 300k numerical SAT, 64 exact flagged refinements and 45s CPU; resource failure is INDETERMINATE, never a declaration of clearance. Verified GLB SHA/provenance only from PREVIOUSLY approved local inference and licensed GT/chair assets; public JSON contains only aggregate counts and SHAs, not local job IDs, model/face binaries, prompts or customer assets.

This CPU code does not import/execute a neural model, install dependencies, take a GPU lease, change firewall/Defender/OS policy, alter Office, or command printers. Native GLB parser remains trusted-local-only; pinned Python advisory reachability/OS egress and untrusted-input isolation are still open under Issue #4. Quality Issue #3 remains OPEN; all models DRAFT and printQualified=false.

## G3.13: selected exact pair arithmetic is NOT whole-mesh clearance or untrusted-input sandbox

G3.13 only classifies **explicitly passed triangle pairs** using Fraction exact rational representation of prior GLB-decoded IEEE-754 coordinates. It does not implement exhaustive mesh broadphase, robust/global collision exclusion, physical tolerance, multiuser safe parsing, geometry repair, network isolation or manufacturing authorization. Positive strict interior/coplanar overlap results are narrow mathematical facts about supplied triangles; zero findings on a limited chosen pair list cannot rule out any unselected collisions. All 24 deterministically selected shared-indexed-edge adjacent pairs on each of the FOUR previously licensed GLBs yielded UNRESOLVED normal boundary contact; these are not 24 defects.

Inputs are bounded (pair-list <=256, selected mesh <=75k faces/100k vertices, |coordinate|<=1e9 and 15s batch budget) and rejected for invalid geometry, degenerate triangles, complex coordinates, illegal pair references and resource exhaustion. The result retains full DRAFT/no-print flags. Output code never runs a Python model, imports CUDA/Torch, merges vertices or sends files to printers. Sanitized evidence strips private job IDs and raw selected face IDs.

Caveat: exact predicate arithmetic is not an OS security sandbox, and bounded Python GLB parsing remains trusted-local-only. Python supply-chain advisories/OS-backed outbound network constraints remain open under Issue #4. Issue #3's complete global robust geometry, mm scale, walls and physical printer qualification remain blocked.

## G3.12: geometric vertex proximity evidence is NOT collision/print authority

G3.12's bounded CPU cKDTree screening of SHA-pinned existing GLBs compares different-index vertex positions at <=1e-7 of model AABB diagonal. Even a zero result does not rule out face-to-face contacts away from vertices, coplanar edge-overlaps, microscopic collisions, multi-mesh-object interactions or sub-tolerance numerical conditions. UV/material seams can legitimately have duplicate positions; candidates are review signals, not automatic defects. Physical model scale, mm wall thickness, manufacturing capability, printer/slicer/material qualification remain UNKNOWN/BLOCKED.

Denial-of-service bounds: max 100k vertices, 75k faces, 32 local neighbors, 200k pairs and 35s wall time. Incomplete scans fail INDETERMINATE and cannot publish completed-case evidence. Real GLB input must pass bounded topology/sha/source checks; G3.12 is NOT OS-enforced native-parser isolation or arbitrary third-party/untrusted GLB authorization. Private local job UUID, vertex examples and source blobs are excluded from the immutable public SHA evidence.

No CUDA/AI inference, new Python packages, Office services, physical printers, firewall/Defender rules, private images or OS policy were changed. Supply-chain advisories (Issue #4), robust geometric self-intersection and production manufacturing gates (Issue #3) remain open; all outputs DRAFT, approvedForPrinter=false.

## G3.11: zero shared-edge coplanar findings are NOT fabrication authority

CPU-only screening over previously generated real orb and licensed sources now considers shared-indexed-edge, same-side, near-coplanar third-vertex positions. A positive indicator is a **possible** overlapping planar region, not certified penetration. The numerical plane-distance tolerance is relative to unknown arbitrary AABB coordinates and can miss exact/very small/degenerate physical issues. Intentional sharp folded geometry is not automatically a defect. It does NOT make the older G3.8 nonshared pair SAT, G3.9 normal angles or G3.10 vertex-only rays a robust exact global collision library.

All original/derivative geometry and customer media remain local/ignored. The public G3.11 report is sanitized and SHA-pinned and contains no job UUID, private GLB, prompt, checkpoint, local PC path or raw example triangles. No OS sandbox, egress/privacy, pinned Python dependency advisory or multiuser security gap was closed. G3.11 is CPU-only and never authorizes a printer, slicer or Fabrication Router call.

## G3.10: single-indexed-vertex contact screening is not a full self-intersection guard

All earlier real source media and TripoSR model outputs remain under gitignored runtime. G3.10's new shared-one-vertex candidate-ray routine is CPU only. It enumerates pairs of triangles sharing exactly ONE indexed vertex and tests whether their noncoplanar plane intersection contains a positive-length segment beyond the expected shared vertex. **An ordinary valid shared indexed vertex is not considered a defect.** Near-parallel/coplanar and barycentric-boundary cases are intentionally marked UNRESOLVED, not clearance. Huge valence/input/time/pair workloads fail to INDETERMINATE instead of silently truncating and reporting safety.

Even a completed zero-finding run cannot certify missing self-intersections: geometric duplicate vertices with differing indices, edge-connected coplanar folds, tolerance-sensitive/near-zero contacts, actual millimeter units, insufficient walls and material/print conditions remain unverified. These data do NOT authorize printer/slicer/Fabrication Router. Public evidence is SHA-verified, sanitized, and contains no private job ID/model binary/customer media. No OS sandbox, egress, credentials or dependency vulnerabilities were changed or declared resolved by G3.10.

## G3.9: normal-angle statistics cannot authorize print or evade collision guards

Reusable CPU-only adjacent-face-angle inspection on already completed TripoSR and GT GLBs checks only pairs sharing an entire indexed edge. The statistics distinguish flat/high-angular mesh creases but are **not a collision predicate**, signed curvature standard, scale-invariant comparison of differently tessellated meshes or a manufacturing acceptance test. A cube can be valid at 90° creases; this real orb has 0 adjacent-edge normal differences over 90°, yet the vertex-only adjacency/foldover and self-intersection certification gaps remain.

All G3.9 public data are SHA/provenance-checked sanitized JSON, NO private job IDs, raw private GLBs/prompts/image source/customer files or model checkpoints. Model execution/printing/Office/sandbox configuration unchanged. CPU-only run does not lessen prior untrusted-input vulnerabilities, old pinned Python advisory risk or OS egress/multiuser safety limitations.

## G3.8: conservative mesh-risk checks are NOT secure manufacturing certification

Only CPU-only parsing of **already completed, SHA-verified G3 original orb + derivative + original procedural source GT** took place. The nonadjacent-triangle candidate screen uses capped SciPy cKDTree neighborhoods, AABBs and numerical SAT. Its core BLIND SPOT deliberately excludes any pair of triangles sharing a vertex index: sharp self-foldover adjacent faces may escape, as may numerically ill-conditioned contacts. A candidate positive can also represent touching rather than actual penetration. The code therefore sets selfIntersectionFreeCertified=false even if the full **eligible-pair** screen finishes with 0 flagged pairs. Hard resource limits cause INDETERMINATE, never proof of no geometric collision or printer readiness.

The sphere radial diagnostic is an independent normalized shape/roundness research metric using a known project-original test fixture and never evaluates actual structural strength, physical unit dimensions or print material conditions. G3.8 evidence includes only sanitized, SHA-linked counts, ratio and scope-limited model hashes; original customer source/model and local operator/job UUID remain private and gitignored. CPU replay and fake-geometry negative tests use no GPU, no cloud and no printer.

Original Python supply-chain advisory triage, OS network egress sandbox and future untrusted/multiuser hosting security are unchanged and still open. PrintApproved/printQualified always remain false.

## G3.7: orientation derivative evidence is NOT a manufacturing/security pass

The only new G3.7 transformation was a COPY-ONLY, CPU Trimesh winding reversal on a previously generated real 01-orb-alpha TripoSR output. The source remained locally unchanged and SHA-pinned; the derivative is gitignored and strictly separate. An independently implemented audit demands exact vertex coordinates, exact reversed face indices, original vertex colors, opposite normals and volume-sign correction, and marks printQualified=false. All new CPU audit, synthetic negative tests and Chrome SwiftShader preview require no CUDA or internet.

Only SHA-linked, **sanitized** milestone JSON and a screenshot from original project-synthetic reference/model derivatives are committed; no local UUID, prompt, source customer photo, source GLB, derivative GLB, model weights or OS path. The private observed-model coverage 2/9 must not be confused with the immutable historical public scoreboard's 1/9. Local SHA linkage is NOT independent remote hardware attestation.

**Security limits unchanged:** current Python package-version advisories from OSV screening, lack of OS-enforced network isolation and untrusted multi-user input containment, and absent retention/quotas are still open. Geometry limits also remain: positive volume does not detect self-intersections, wall thickness, physical units, supports or mechanical strength. Never use the derivative to bypass human print/slicer safety review or enable Fabrication Router writes.

LOCAL3D is a **trusted single-OS-user, loopback development application**, NOT a remotely secure multi-tenant inference service. Controls here are implementation defenses and are not a penetration-test certification.

## Trust boundaries

G1: local browser → 127.0.0.1 Node API → UUID job folder → deterministic fixture GLB. No AI process.

G2: explicitly started Windows manual local session → browser per-job GPU consent + POST confirmGpu=true → Node API → single GPU permit → Office/GPU live checks → separate hidden Python venv worker → pinned local source+model → image-derived Y-up GLB → artifact SHA/provenance check → Three.js preview. No inference service on LAN/cloud; no printer, firmware or G-code service.

## Baseline defenses

1. SSRF and command injection: no client-specified URLs, webhooks, remote paths, shell commands or generic proxy/download routes. Output access uses allowlisted artifact ID, never a client filesystem path.
2. Traversal and cross-job access: UUID-only records, internal filenames input.png/jpg/webp, output.glb and qa-report.json. No client filename is used for a disk path.
3. Local exposure / DNS rebinding: server binds 127.0.0.1 only; Host allowlisted for local names/IP; mutating browser requests reject mismatched Origin; no CORS headers. Never reverse proxy or bind to LAN without a separate authentication design.
4. Uploaded bytes: JSON <=12 MiB, image <=8 MiB, signature/MIME checked, filename sanitized. G2 Python performs real Pillow image decode, EXIF orientation, >=64px width/height and <=16MP before CUDA. No server-side remote image fetching.
5. UI injection: all prompt/filename strings use DOM textContent; Three.js is installed/served locally. CSP default-src none, scripts self+importmap hash, connect-src self, workers disabled, frames forbidden.
6. Source/license integrity: locked clean Git TripoSR commit; checkpoint/model config/DINO config SHA-verified locally before G2 worker loads weights. Isolated Python 3.11/Torch CUDA 12.1; torch.load(weights_only=True). Model source and weights are never committed to GitHub.
7. Confidentiality: job source images/prompts and internal manifests persist locally and must receive restrictive host OS permissions. No telemetry paid service or cloud model fallback is configured.

## Manual-only GPU controls

- G2 is disabled by default in npm start; no AI subprocess runs. Operator must deliberately start scripts/start-g2-manual.ps1 in a dedicated process/port/data folder; supports Windows only.
- UI requires a fresh consent checkbox on **each** selected TripoSR image job. API requires confirmGpu=true. This is UX/contract confirmation, NOT strong authentication against other local processes with host access.
- Single GPU permit is reserved synchronously before any awaited filesystem writes; second concurrent POST returns 409 and is not queued. This was regression-tested with concurrent requests.
- Before GPU launch, 3 live snapshots must show one recognized GPU, >=10GB available, <=65% utilization and Office Accelerator Ollama /api/ps with no loaded models; missing service fails closed.
- Runtime GPU monitor checks every ~1.5s for <2.5GB free, >8.5GB new VRAM use, Office model conflict, telemetry loss, or 240s timeout. It terminates the entire Windows child process tree. AbortController cancellation enters "cancelling" until worker exit; no premature "cancelled" state or false asset release.
- On process failure/cancel/restart, incomplete output is never exposed as a downloadable artifact. GLB magic, version, size, embedded byte count, source/model SHA, Y_UP coordinate and DRAFT QA are independently checked before model assets are published.
- Output is always printQualified=false, no printer, slicer or Fabrication Router write. Visual mesh preview and "watertight" single-image sample are not manufacturing approval.

## Verified threat/negative tests

- Concurrent GPU race and permit cleanup; POST without consent, text mode rejected, unknown URL/origin/job blocked.
- Process-tree termination with a real, benign Node fake-worker process via AbortController.
- GPU scarcity and Office busy fail closed before subprocess start; over-budget GPU mock triggers worker termination.
- Error paths provide no model/QA asset; restart marks jobs interrupted rather than silently resuming.
- Browser G1 and opt-in G2 mock tests have 0 page errors and no remote URL requests.
- Single real G2 local GPU image → verified GLB and DRAFT report → real Chrome 3D preview on Windows; manual server and worker exited after acceptance.

## Windows TripoSR source-owner trust boundary (October 10 hotfix)

A user-authorized 01-orb-alpha test exposed a mismatch between the SYSTEM-owned pinned TripoSR source checkout and the interactive CHRIS account. Git's `dubious ownership` protection refused `git rev-parse HEAD` at the initial `verify_sources` stage. This is an OS account/checkout trust issue; the actual original model result was a failure, not a benchmark success.

The worker now supplies **only per-Git-process** `-c safe.directory=<canonical exact checkout>`, and only for two fixed read-only metadata commands. It also uses `-c core.fsmonitor=false` to avoid invoking configured external fsmonitor helpers. There is no persistent global config change, no trust wildcard and no unverified arbitrary path from HTTP or user input. The helper refuses other Git operations and verifies the resolved checkout path; unchanged-source SHA and clean working tree plus checkpoint/config/DINO SHA256 checks remain mandatory.

**Tradeoff:** trusting a SYSTEM-owned checkout for these two Git subprocesses is still an explicit local trust exception. It is not a general OS filesystem isolation boundary and does not mean a SYSTEM-level administrator cannot modify that checkout. Do not repurpose this scope for downloading, merging, executing hooks or handling arbitrary user-supplied repos. Interactive CHRIS user-account CPU validation must pass before considering another approved GPU experiment; the previous approval remains spent.

## G3.4 read-only completed-job evaluation and telemetry

POST /v1/jobs/:uuid/benchmark is a deliberate CPU-only write of a **diagnostic JSON artifact**, not a model inference or print operation. It first checks completed real G2 status, model SHA/size, licensed image SHA and catalog integrity. The pinned local Python subprocess uses execFile (no shell), a fixed runtime-only job root and output file, 45-second timeout, offline HF flags and CUDA_VISIBLE_DEVICES=-1. It independently validates the image, model and QA against the manifest and locked TripoSR weights/source; no arbitrary URL, filename or client-provided output path is executed. Concurrent same-job reviews are rejected and a previously verified score is idempotently served.

It does **not** provide an OS process sandbox, OS-level outbound-network denial or multiuser untrusted parsing boundary; Trimesh/SciPy still run with the current logged-in user's permissions. Do not use this on untrusted network uploads or equate source/QA SHA matching with independent hardware attestation.

Optional G2 hostGpuTelemetry comes from 1.5-second NVIDIA-SMI snapshots *while a manually approved worker is running*. The stats include all GPU users (potentially Office) and are not exact peaks or exclusive GPU memory; CUDA allocations in the worker are measured and represented separately. No GPU checks or worker activity are triggered by the benchmark HTTP endpoint. Cross-process cooperative lease and live Office no-conflict gate remain mandatory for new inference.

## G3.3 source-integrity and CPU scoring trust boundary

The new G3 benchmark-source HTTP route only serves one of nine license-attested images from exact fixed repo paths, after SHA256 and PNG magic/size verification. No arbitrary filesystem path, private media, URL, third-party download, POST or GPU job is permitted by this route. The browser adds it to the existing input form without submission, and changing/clearing any selected image explicitly clears stale GPU consent.

The CPU-only manual scorer accepts only a direct UUID subfolder of LOCAL3D's fixed private manual-job storage, completed local TripoSR manifest, catalog-matching source image SHA, manifest-matching GLB/QA bytes, pinned local source/checkpoint SHA and DRAFT-only flags. Outputs go to gitignored private path without prompts, filenames, job IDs or source images. A copied original ground-truth GLB is blocked from masquerading as AI output. No 3D GT means no 3D score.

Local manifests and SHA256 prove internal record consistency, **NOT hardware execution**; no malicious local OS user sandbox or independent attestation is implemented. 3D metrics normalize size/translation and optimize yaw after observing data; they are shape diagnostics only, NOT actual dimensions, printer supportability or a general AI-quality certification. All printApproved fields remain false.

## G3.2 resource and privacy hardening

G2 now uses an additional atomic fixed project-wide runtime/gpu-coordination/triposr-gpu.lock **across distinct LOCAL3D Node servers**. Per-process atomic reservation remains. A second server receives 409 without creating a GPU job. Owner-specific release occurs after runner process exit, and an unclear/crashed lock is NEVER auto-stolen: a dead parent may leave a child worker alive. Read-only GPU lease diagnostic: npm run audit:g3:gpu-lock. This is cooperative LOCAL3D-only locking, NOT Windows GPU isolation or an Office scheduler.

The nine-fixture public benchmark report is a fixed SHA-verified licensed snapshot, read-only via GET /v1/benchmarks/g3. It contains no prompts/job IDs/client paths. Optional private local-job scans validate fixed artifact hashes and never export filenames, prompts, paths or job UUIDs; they are still NOT cryptographic hardware attestations; new local snapshots use SHA-suffixed filenames to avoid overwriting earlier audit evidence. Any unknown data is excluded.

Storage auditing (npm run audit:g3:storage) reads only aggregate metadata and writes its sanitized report into gitignored runtime/qa. It does NOT enforce quotas, delete private media or create backups. OS file permissions, process isolation, retention consent/policy, SBOM/CVE audit and sandboxing remain open.

## G3 CPU geometry reviewer boundary

An explicitly requested POST /v1/jobs/:uuid/review is allowed ONLY on completed real TripoSR GLB with manifest-matching bytes/SHA, under the already opt-in Windows session. It executes a fixed, installed Python script via execFile (no shell or client path) with a bounded 35-second timeout and 64MiB GLB size cap, and validates the output schema/sha/qualification. A second review for the same job returns 409 instead of spawning a duplicate process. No new PyTorch/CUDA import, printer, remote fetch, or GPU lease is part of G3 scanning. A new geometry-qa asset appears only after independent provenance checks and a persisted manifest update. The browser shows signed-volume/closed-shell results but keeps printQualified=false.

G3 is NOT OS-level untrusted-input sandboxing. The native Trimesh parser still processes GLB bytes in a Python subprocess under the current OS user; arbitrary third-party/multi-user GLB uploads are not supported. Physical self-intersections and wall thickness remain unmeasured. This is a single-user localhost engineering system, not a trusted multi-tenant geometry service.

## Known limits and required hardening before productization

- Single trusted user: there is no per-OS-user authentication, CSRF token or HTTP origin proof for command-line requests; any malicious local process with access to localhost may forge confirmation. Do not expose beyond localhost or run with untrusted local tenants.
- The default Windows OS account's filesystem permissions protect job folders; no fully isolated Windows Sandbox/VM is used. Python libraries process complex media and model code, so dependency review, CVEs, sandboxing, cleanup and disk quotas remain relevant.
- GPU free-memory telemetry and Ollama status are not an exclusive reservation against all other local applications. Monitor frequency is best-effort, not hardware-level preemption.
- HF_HUB_OFFLINE and local pinned model interception stop known model fetch paths, but do not prove outbound network isolation against malicious code. No firewall change performed.
- No per-user quotas, global job retention cleanup, audit log authentication or crash-safe cross-process GPU semaphore across multiple manually launched servers. The manual G2 script uses a dedicated port/data folder, but **do not start multiple G2 manual instances simultaneously**.
- No formal independent penetration test, signed installers or secure auto-update, and no geometry/manufacturing certification. No business/customer production claims yet.

Next gate: separate user authorization and hardening for multi-user use, broad content, true CAD/manufacturing output or unattended scheduling. Keep Office 2.0 P0 independent.

## G3.5 resource admission and dependency risk — 2026-10-10

Before creating a manually confirmed real G2 job, server/storage-admission.js performs a **read-only and fail-closed** trust/size/statfs audit. The 8GiB stored-data cap, 128MiB prospective job allowance, 3GiB remaining free floor and 400-folder limit are conservative development settings, not a backup or enterprise retention policy. Unexpected symlinks/files, unknown manifests and telemetry errors reject the new GPU job (503/507), without deletion, CPU model execution or altering the working GPU lease. Another process can still change storage after admission; no OS disk quota is installed.

A new process-local permit serializes G3 topology vs source-shape reviews across different completed jobs. It never queues CPU tasks and releases on failure, but multiple separate LOCAL3D servers still have no cross-process CPU semaphore or OS job object.

**Supply-chain gate remains OPEN:** npm audit (production+dev) found 0 advisories in the pinned Node packages on 2026-10-10, but public OSV batch matching of 34 pinned PyPI versions returned 104 advisory IDs across transformers 4.35.0 (50), Pillow 10.1.0 (32), PyTorch 2.5.1+cu121 (22). These are *untriaged package/version advisory matches*, not 104 confirmed exploitable application paths. Selected OSV records include high/critical code-execution advisories, but exact reachable entry points and safe patched compatibility have not been established. Do not claim LOCAL3D is safe for untrusted public image uploads or production multi-tenancy.

For now the G2 manual session is for trusted local images only; arbitrary untrusted images must not be treated as vetted. Upgrade candidates must be tested in a NEW isolated environment with pinned clean-room provenance and functionality regressions, not installed silently in the working engine. No OS network sandbox, antivirus exception, firewall change, new model weights, GPU run or printer release was performed during this phase.

Detailed proof and remediation gate: G3_5_RESOURCE_SECURITY_2026-10-10.md.

## G3.6 CPU-only Pillow patched-shadow investigation

A candidate Pillow 12.3.0 (OSV version-level matches 0 on 2026-10-10) was installed only in a **gitignored target overlay**, without changing the live Python venv's Pillow 10.1.0. The official CPython3.11 Windows wheel SHA256 was checked byte-for-byte. With process-local PYTHONPATH and CUDA_VISIBLE_DEVICES=-1, all nine pinned input source images passed the real worker preprocessing function; four RGBA/EXIF/WebP/corruption checks and 23 Python unit tests passed. Importing the pinned TripoSR/Transformers/Torch symbols also succeeded, without loading a model/checkpoint or allocating CUDA.

This is **not** an OS-isolated sandbox, proof that all vulnerabilities are gone, nor proof that the real CUDA model generates valid outputs with Pillow 12.3.0. Public OSV findings for pinned Transformers and Torch remain unresolved. The existing manual G2 engine is STILL on the older version; only trusted local source images should be used until actual advisory codepath triage, security hardening and explicit compatibility qualification are complete. No firewall/antivirus/UAC or OS permissions were changed in this milestone.

See G3_6_PILLOW_SHADOW_2026-10-10.md and GitHub Issue #4.
