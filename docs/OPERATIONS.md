# Operations: environment, Windows/macOS, backup, rollback

## Machine inventory (read-only, 2026-10-09)
Windows Chris: Microsoft Windows NT 10.0.26300, Node 24.19.0, npm 11.17.0, Git 2.55.0, Python 3.11.9; nvidia-smi reports NVIDIA RTX 4080 SUPER / 16376 MiB. G1 does not use GPU.
MacMiniOffice.local: Darwin arm64, 16 GiB unified memory, Node 24.21.0, npm 11.19.0. Clean macOS G1 test copy passed 12 Node tests and 7 browser QA phases using Microsoft Edge 154 headless. Chromium Chrome headless failed to launch in the remote session, but Edge worked. Do not equate unified memory with discrete VRAM or infer G2 inference compatibility.

## Start (Windows)
1. Open PowerShell on Chris.
2. Set-Location 'D:\Velvet\Projects\local-3d-generator'
3. npm ci --ignore-scripts --no-audit --no-fund (first setup)
4. npm test (Node API/security and preflight tests); npm run qa:browser (requires locally installed Google Chrome; creates runtime/qa screenshots in a temporary localhost server)
5. npm start
6. Open http://127.0.0.1:4177 locally.
7. Press Ctrl+C to stop. No auto-start installed.

If port 4177 is in use, set L3D_PORT to a free local port between 1024 and 65535. Binding always remains 127.0.0.1.

## Start (macOS - procedure only, not validated)
Copy or git-clone the independent repository to a separate directory. Install Node 20+; run npm ci --ignore-scripts, npm test, npm run qa:browser (uses installed Microsoft Edge on macOS), and npm start; open local loopback URL. Verified on temporary Mac test copy; 12/12 Node + 7/7 Edge browser PASS. Do not copy live Windows runtime records by default. No real model was installed or executed.

## Runtime data
runtime/data/jobs contains immutable original images, job manifests and output fixtures. runtime/data/audit/events.jsonl contains events. User prompts/source images may contain confidential information: keep backups private and apply host filesystem permissions.

## Backup
1. Stop server cleanly (Ctrl+C).
2. Copy runtime/data to a dated, access-controlled backup location.
3. Record git commit SHA, package-lock SHA256 and app version alongside backup.
4. Verify backup files and hash before treating it as safe to restore.

## Rollback
1. Stop the server.
2. Retain a copy of runtime/data; do not delete job records.
3. Checkout the prior known-good git commit and npm ci with the corresponding lockfile.
4. Run npm test; start server, GET /v1/health and inspect history.
5. If data schema changes in a later version, restore only from schema-compatible backup or use a reviewed migration. G1 has no migration.

## Operational limits
Loopback single-user development only; no internet service, printer, scheduler, Hunyuan weight download, Python model environment, payment, user telemetry, remote writable endpoint or unattended process setup.

## Troubleshooting
- Missing vendor module: run npm ci, verify installed three version 0.180.0.
- GLB download works but canvas blank: browser may lack WebGL; verify WebGL enabled and inspect browser Console. Download and local reports remain functional.
- Interrupted job after restart: deliberate truth-in-status behavior; re-submit as a new job.
- HTTP 403: request Host/Origin must be local; never remove safeguards to allow network exposure.
