# Operations — LOCAL3D G1/G2 on Windows, G1 on macOS

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

On Chris G3 preview: 33/33 Node tests (including G2 process mocks with NO GPU and G3 geometry-review security checks), 7 G1 browser phases, 6 mock G2/G3 UI phases and 10 G3 offline Python tests, in addition to the 5 G2 Python tests. Separately, the isolated Python interpreter runs:
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
