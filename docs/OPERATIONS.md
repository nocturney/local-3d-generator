# Operations — LOCAL3D G1/G2 on Windows, G1 on macOS

## G3.7: CPU-only exact winding derivative of an existing real orb model

A single genuinely approved local TripoSR inference already completed on 01-orb-alpha. Its source output remains under the original G2 manual job's private runtime folder; the separate CPU-only orientation derivative lives at:

    runtime/qa/g3/orb-01-positive-winding/orb-positive-winding.glb

Independent CPU verification requires exactly unchanged vertex coordinates, unchanged vertex RGBA, exactly reversed face indices, opposite face normals and same one-component watertight bounds/absolute signed volume. The original GLB SHA is f37a812bc4414ddee34bcb19d2e7535f25d219a3731c14f2dcc89c2c7ba030e2; the separate DRAFT derivative SHA is ab2e5aeb55598624209eeca3e700abef93a69a52886c63ecad6a840e62d8d68f.

The public model binaries are NOT uploaded to GitHub; output is local and ignored. Re-create a sanitized read-only proof from an **already completed and hash-verified** local job (pass the full UUID operator-side only):

    node scripts/g3-7-assemble-orb-evidence.mjs --job-id <existing-G3-orb-job-UUID>

The command is CPU/Node-only and does NOT launch TripoSR, GPU, slicers or printers. Evidence and screenshot under docs/evidence/g3 include no job IDs, client names or private source files. The local report now counts 2/9 observed outputs including the historic chair, while the immutable checked-in public G3 baseline stays 1/9. No one has standing approval to infer the seven remaining images without a fresh per-image request.

**Never treat volume-positive, closed-topology or visually similar geometry as print-ready.** Physical mm units, minimum wall thickness, intersections, supports, material strength and printer suitability remain untested. See docs/G3_7_ORB_WINDING_CPU_2026-10-10.md.

## Hardware and environment (checked 2026-10-09–10)

Windows Chris: NVIDIA GeForce RTX 4080 SUPER 16GB, Intel i9-14900K, Node 24.19, Python 3.11.9, Torch 2.5.1+cu121 **inside isolated G2 venv only**. nvidia-smi observed Office/GUI GPU use; production resource reservations are not guaranteed.

MacMiniOffice.local: arm64, 16 GiB unified memory, Node 24.21. G1 Node API and Edge browser tests previously passed. Real G2 CUDA inference is NOT qualified on macOS and deliberately remains disabled even if L3D_ENABLE_TRIPOSR is set there.

## Start G1 — default, no AI/GPU

From Chris, Windows PowerShell:
    Set-Location 'D:\Velvet\Projects\local-3d-generator'
    npm ci --ignore-scripts --no-audit --no-fund
    npm test
    npm start

Open http://127.0.0.1:4177 on Chris. Stop with Ctrl+C. Default G1 data is runtime/data/jobs + runtime/data/audit/events.jsonl; every completion is DEMO. G1 does not need installed model weights.

## Start G2 manually — Windows Chris ONLY

Prerequisite: separate runtime/engines/triposr/src, /venv, /weights installed and SHA-verified, and an operator intentionally decides to enable local manual image-to-3D. It is not an automated or persistent background service.

From project root:
    powershell -NoProfile -File scripts/start-g2-manual.ps1

This launches **http://127.0.0.1:4179**, stores jobs under **runtime/data-g2-manual** and temporarily sets L3D_ENABLE_TRIPOSR=1 for this local process. It will never occupy the default G1 port/data directory. It refuses to kill a process on a busy port. In browser, choose TripoSR Local, upload image, check the one-job GPU approval and press Create Real Model. A text prompt is an annotation only. No job begins without POST confirmGpu=true, and no GPU queue can remain unattended.

Close the terminal with Ctrl+C to stop; automatic restart and OS boot start are NOT configured. The model worker uses an isolated Python process; if the worker is cancelled the UI displays "נעצרת" until its process tree exits. No cloud inference/print output.

## Local model files

- Source: runtime/engines/triposr/src — pinned detached, clean MIT upstream checkout.
- Model/config: runtime/engines/triposr/weights — SHA-verified 1.68GB model.ckpt, config.yaml and DINO tokenizer config.
- Runtime: runtime/engines/triposr/venv/Scripts/python.exe, Torch 2.5.1+cu121, dependency freeze in engines/triposr/requirements-resolved-win-py311.txt.
- App engine worker: engines/triposr/worker.py; manual per-run GPU guard: server/triposr-adapter.js; G1 fixture is independent.
- Model stage/source/GLB evidence: runtime/data-g2-manual/jobs/<UUID>/... + local audit log (private; do NOT publish customer photos). GPU smoke evidence lives in runtime/qa, with a sanitized MIT sample in docs/evidence/g2-app.
- Original isolated standalone pilot remains at runtime/pilots and runtime/pilot-logs; do not overwrite it.
- Source and weights never committed. Do not copy proprietary images, downloaded model checkpoint or executable venv into GitHub.

## Windows Chris: scoped Git source-owner CPU preflight (before any further GPU request)

The October 10 one-time G3 `01-orb-alpha` attempt passed GPU and Office gates but failed at **`verify_sources`**, before model loading. Its original Windows-PowerShell diagnostic showed Git exit 128: TripoSR checkout owned by **NT AUTHORITY/SYSTEM**, operator **CHRIS/Chris**. This is not a missing checkpoint; Git refused metadata access because of the checkout ownership. Historical G3.4 job failure and spent approval latch are retained privately.

Worker fix: for exactly two fixed metadata commands (`rev-parse HEAD` and `status --porcelain`), `worker.py` sets a command-scoped `-c safe.directory=<resolved exact TripoSR checkout>`, with `core.fsmonitor=false`. The pinned upstream commit, clean-source test and checkpoint/config SHA are still required. **Do not** run `git config --global --add safe.directory`, set `safe.directory=*`, disable ownership checks globally, re-own the SYSTEM source folder or alter Office. This is a deliberately scoped trust decision for the already-pinned source checkout, not a general security workaround.

From the CHRIS interactive PowerShell session run this **CPU-only** test using the NEW project worker (not the immutable failed v0.2.4 snapshot):

    & 'D:\Velvet\Projects\local-3d-generator\runtime\engines\triposr\venv\Scripts\python.exe' 'D:\Velvet\Projects\local-3d-generator\scripts\g3-verify-triposr-source-owner-cpu.py'

Expected: `G3_CPU_ONLY_SOURCE_OWNER_FIX_PASS`, `SOURCE_CLEAN True`, `WEIGHTS_SHA_CHECK PASS`, `NO_CUDA_OR_AI_INFERENCE True`. If Git still fails, **stop** and report output; do not change global trust settings or consume another GPU approval.

**Not authorized:** re-running the archived `runtime/qa/approved-01-orb-alpha-g34-20261010/release-v024/scripts/g3-approved-orb-once.mjs`. Its one-time approval was consumed and original code snapshot is preserved unchanged. New real inference, even on the same image, requires a *new explicit per-image authorization*, live Office/GPU no-conflict gates, and a fresh single-run script. No unattended GPU queue or print release.

## G3.4 one-click CPU scoring on a completed G3 fixture (NO AI inference)

After an explicitly consented TripoSR G2 job with a licensed G3 source image completes, open that job's details and click **"השוואת G3 (CPU)"**. The bounded offline Python worker verifies hashes/provenance, computes a diagnostic normalized 3D surface distance only when *source original 3D* exists, and attaches **"דוח השוואת G3"** in the existing local job. A second click is idempotent, no new neural inference/Cloud/API calls. DEMO, unlicensed, running, failed or changed files fail closed.

The **"סריקת רשת (CPU)"** tool is independent and still useful: a good geometric similarity score cannot certify correct normals, positive volume, wall thickness or physical print readiness.

For a previous-real-GLB CPU-only proof (no CUDA/GPU), run from project root:

    node scripts/g3-4-actual-cpu-review-proof.mjs

This uses a temporary reconstructed job from the previously generated G2 chair GLB, invokes the ACTUAL isolated Python scorer over localhost, verifies NO_GROUND_TRUTH_3D / NOT PRINT QUALIFIED, records a sanitized proof in docs/evidence/g3 and removes the temporary job. This is **not** a new model prediction or an authorization to run a real GPU job.

Future successful actual G2 inference QA includes optional hostGpuTelemetry (shared-host NVIDIA-SMI snapshots) in addition to peakCudaReservedMiB (PyTorch worker). Samples every 1500ms approximate the shared GPU state and may miss short peaks. Both are diagnostic only; neither certifies that Office or other GPU applications are unaffected, and all current no-conflict checks remain.

See docs/G3_4_CPU_REVIEW_TELEMETRY_2026-10-10.md. **No new GPU runs or printer actions are part of the G3.4 milestone.**

## G3.3 one-image manual quality workflow (no unattended AI)

1. In the explicitly launched G2 Windows localhost UI (port 4179), choose any G3 source image from the selector under **תמונת מקור**; click **טען תמונה לטופס בלבד**. This loads the licensed PNG but does not start any job. The chosen image gets a fresh blank GPU-consent checkbox.
2. If you intentionally want a real TripoSR run, choose the TripoSR Local provider, tick the per-image consent and press **צור מודל אמיתי (GPU)**. Office idle and NVIDIA GPU guards and shared LOCAL3D lease all remain in force. There is NO unattended batch.
3. After completion, copy the full UUID via **העתק Manifest**. From project root, evaluate the existing output ONLY in CPU:

       npm run score:g3 -- --job-id <full-job-uuid>

   Source/weights/job/model SHA must match the pinned G3 licensed input. The result is private under runtime/qa/g3/manual-scores. Ninth upstream chair has NO source 3D and cannot be ranked with an invented 3D ground truth.
4. Optionally consolidate without uploading private records:

       node scripts/g3-collect-benchmark.mjs --jobs-dir runtime/data-g2-manual/jobs

   This produces an append-only SHA-fingerprinted private benchmark snapshot and includes only validated local scores; it does not alter the public 1/9 reviewed coverage.

Regression controls without ANY model inference:

       runtime\engines\triposr\venv\Scripts\python.exe engines\quality\shape_metrics.py --positive-controls --output docs\evidence\g3\shape-positive-controls.json
       runtime\engines\triposr\venv\Scripts\python.exe engines\quality\shape_metrics.py --negative-controls --output docs\evidence\g3\shape-negative-controls.json
       runtime\engines\triposr\venv\Scripts\python.exe -m unittest discover -s engines\quality -p test_*.py

The shape metrics are finite-sample, scale-normalized and pose-selected after the fact, not proof of physical dimensions, complete shape reconstruction or printer compatibility. No automatic repair/printing.

## G3.2 read-only management and cross-process GPU lease

- npm run audit:g3:gpu-lock — read-only shared lease diagnostic. If locked, investigate existing LOCAL3D/Python workers and Office/NVIDIA GPU usage. **No automated lock deletion or stale lock reclamation**.
- npm run benchmark:g3 — SHA-checks licensed nine-input catalog and previous G2 real chair provenance. Public coverage snapshot stays 1 prior observed real sample / 8 unrun; refuses silent overwrite of different evidence.
- node scripts/g3-collect-benchmark.mjs --jobs-dir runtime/data-g2-manual/jobs — optional PRIVATE matching of local complete job records; writes an append-only fingerprinted private snapshot under gitignored runtime/qa/g3; does not expose client names/prompts/IDs. Local SHA-provenance is not independent proof of GPU execution.
- npm run audit:g3:storage — read-only metadata storage summary (job counts, sizes, status/age); sanitized report under gitignored runtime/qa/g3. Never deletes source images, trims history or enforces a quota.
- G1 normal launch unaffected; all G2 manual servers use the SAME project-wide GPU lock regardless of port/data folder. Concurrent G2 manual requests return 409 instead of queuing. The lock is not a replacement for live Office/GPU no-conflict checks.

More: docs/G3_2_SAFETY_BENCHMARK_2026-10-10.md.

## G3 optional CPU mesh review — NO GPU activity

On a **completed** manual TripoSR job in http://127.0.0.1:4179, press "סריקת רשת (CPU)". This runs the fixed offline Python Trimesh scanner on the existing output.glb and adds a geometry-qa.json report to the job manifest. "סריקת רשת הושלמה" means the scan completed, **not** that the model is safe to print. No G1 demo job can request this action.

For standalone reproducibility using the *already generated* licensed G2 chair model:

    runtime\engines\triposr\venv\Scripts\python.exe engines\quality\geometry_qa.py --model docs\evidence\g2-app\real-app-output.glb --out docs\evidence\g3\chair-geometry.json

    runtime\engines\triposr\venv\Scripts\python.exe -m unittest discover -s engines\quality -p test_quality.py -v

The G3 nine-source-image catalog is generated by scripts/g3_make_fixtures.py using CPU-only Trimesh/Pillow and refuses to change locked fixture bytes. Its 8 synthetic reference pairs have known source geometry; do not claim they are AI outputs. An existing *real* chair model has negative signed volume. Optional CPU-only corrective derivative is documented in docs/G3_PROGRESS_2026-10-10.md and never modifies the original GLB. Do not run a new AI benchmark batch unless a fresh manual per-job GPU approval and Office no-conflict gate are satisfied.

## Tests — no AI model execution

    npm test
    npm run qa:browser
    npm run qa:browser-g2-mock
    npm run test:all

On Chris v0.2.4 G3.4 preview: **53/53 Node tests**, 8 G1 Chrome phases, 8 mock G2/G3 Chrome phases, 18 G3 CPU-only Python tests plus 5 prior G2 offline Python tests. Separately, the historical G2 chair was re-audited with the actual pinned Python CPU scorer (no GPU). The isolated Python interpreter can run the G2 tests with:
    runtime\engines\triposr\venv\Scripts\python.exe -m unittest discover -s engines\triposr -p test_offline.py -v

Python tests validate weights hash/input/CPU marching cubes and do not allocate GPU. Tests using mock real-provider injection are marked TEST_MOCK; they must never be presented as a fresh AI result.

Real one-time G2 smoke exists as scripts/g2-one-time-app-smoke.mjs and is **not** included in npm test/test:all. It requires an explicit process-only manual authorization environment variable and an Office idle/GPU capacity check. Do NOT schedule or automatically replay it.

## Data, backup and rollback

Stop servers first, then copy runtime/data and runtime/data-g2-manual to an access-controlled dated backup. Store Git source SHA, package-lock SHA256, model/checkpoint SHA and job manifests separately. Verify backup integrity before attempting restoration. Preserve original job directories (source images may be confidential).

Rollback code: stop servers, preserve both G1/G2 data and runtime/engines, checkout last tested Git commit, npm ci for that lockfile, npm test and verify localhost health. Never overwrite/delete weights or job records automatically. Future JSON schema migrations must be separately reviewed. A G2 interrupted job is not resumed automatically after restart.

## Troubleshooting

- Port 4177/4179 busy: stop only your own known LOCAL3D instance or choose an explicitly supported free port; do not kill unknown processes.
- G2 engine disabled: normal on default G1. Start intentional manual script; do not set persistent system-wide env flags.
- G2_NOT_INSTALLED: confirm isolated Python, model source and pinned weights, verify hashes; do not silently download remote model.
- G2_OFFICE_BUSY / G2_OFFICE_UNVERIFIED / G2_GPU_BUSY: a guard is blocking a collision; do not bypass for speed.
- G2_IMAGE_ONLY / BAD_IMAGE: TripoSR needs image input, 64x64 to 16MP, PNG/JPEG/WebP within 8MiB. Transparent background is automatically composited on gray, not removed with rembg.
- Browser WebGL missing: verify local Three.js and graphics support, inspect console; GLB downloads remain available.
- G2 cancelled/failed: only manifests with fully verified GLB and DRAFT report expose output links. Do not infer printability from a watertight flag.
- HTTP 403: localhost Host/Origin guard; no LAN exposure. Do not disable security to resolve access problems.

Never modify Office 2.0 / VelvetOS core / Fabrication Router, UAC/firewall/system CUDA or printer services as part of LOCAL3D operation.

## G3.5 CPU resource and public advisory audit (NO GPU)

All commands below are run manually in LOCAL3D's repository; they never start the TripoSR neural worker or a printer.

    npm run audit:g3:storage
    npm run audit:g3:admission
    npm run test:all

The admission proof checks real existing G2 manual job storage at the worst allowed 8MiB input size, without deleting or modifying any existing job. It retains a private sanitized runtime/qa/g3/g3-5-storage-admission.json audit snapshot. New manually consented G2 jobs are now rejected on storage cap (507 G3_STORAGE_QUOTA), low free volume (507 G3_LOW_DISK_SPACE) or unsafe/unverified storage state (503 G3_STORAGE_UNVERIFIED), **before model/GPU access**. The numbers are protective development thresholds, not actual reserved disk blocks.

For optional public security-advisory research ONLY, with explicit outbound Internet contact to OSV.dev (transfers only public PyPI package names/versions; no client images, source code, paths or secrets):

    npm run audit:g3:python-osv

This contacts the public OSV.dev service, saves timestamped matches to gitignored runtime/qa/g3/g3-5-python-osv-screen.json and never installs or changes Python. The separate optional scripts/g3-5-npm-audit-evidence.mjs can summarize previously captured raw npm audit responses with current package-lock SHA; it makes no network calls itself. A version-level advisory match is NOT confirmed code-path exploitability. npm audit of production/development Node dependencies can be run separately in read-only mode. Current Python advisory findings require a scoped, reviewed compatibility/upgrade plan before calling this product secure for untrusted media.

To avoid CPU contention, only one G3 CPU topology or shape review may run in one LOCAL3D Node process at a time. Others receive 409 G3_CPU_BUSY. There is no unattended CPU review queue. No automatic deletion or retention enforcement has been introduced.

Detailed controls: docs/G3_5_RESOURCE_SECURITY_2026-10-10.md.

## G3.6 reproducible Pillow shadow evaluation — not a runtime upgrade

The original Windows TripoSR venv is still pinned to Pillow 10.1.0. A separate, ignored location under runtime/qa/g3/pillow-shadow holds a Pillow 12.3.0 CPython3.11 amd64 wheel (PyPI SHA256 8e95e1385e4998ae9694eeaa4730ba5457ff61185b3a55e2e7bea0880aef452a) and a target overlay. Do NOT set system-wide PYTHONPATH or mutate the currently working model venv.

To investigate the candidate in a **new** isolated experiment folder, download the exact public wheel with pip --no-deps --only-binary, verify the official SHA256, then pip install --no-index --no-deps --target into the separate local overlay. The included scripts describe the pinned experiment. For an already staged overlay, the CPU-only verifier and importer can be launched in process-local CUDA_VISIBLE_DEVICES=-1 / PYTHONPATH mode. scripts/g3-6-shadow-python-regression.ps1 executes 5 G2 plus 18 G3 Python unit tests with temporary environment restoration and refuses to overwrite a previous proof.

scripts/g3-6-pillow-candidate-screen.mjs explicitly queries only public PyPI/OSV package metadata (Internet required, never normal runtime). scripts/g3-6-assemble-shadow-proof.mjs checks existing ignored report hashes and produces a sanitized release proof offline. The version/code evidence is in docs/G3_6_PILLOW_SHADOW_2026-10-10.md.

Do NOT activate this shadow in G2 startup, do not replace frozen requirements/model packages, and do not run additional GPU compatibility tests without new scoped permission plus current Office/VRAM checks. No automatic inference or printing is part of this workflow.
