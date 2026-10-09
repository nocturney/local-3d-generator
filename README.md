# LOCAL3D - Local 3D Model Generator

Independent local-first workbench, clean-room implementation under HANDOFF 12 (2026-10-09).

**Gate G1 / FIXTURE DEMO ONLY.** This is NOT AI image-to-3D or text-to-3D inference. Uploaded images and text are stored but NOT used to generate geometry. The bundled GLB fixture is deterministic. Every job is labeled DEMO and DRAFT / NOT PRINT QUALIFIED.

## Quick start

Node.js 20+ and npm required. Installation contacts npm once for Three.js; normal operation is local.

    npm ci --ignore-scripts --no-audit --no-fund
    npm test
    npm run qa:browser
    npm start

Open http://127.0.0.1:4177 in a browser on the same machine. No GPU, model download, admin access, cloud account or API key required.

Windows working directory: D:\Velvet\Projects\local-3d-generator

## Implemented at G1

- Hebrew RTL responsive workbench, PNG/JPEG/WebP upload and text inputs.
- Single-job local demo simulation queue, cancellable status, persistence and audit log.
- Real GLB preview using Three.js and OrbitControls; downloads and camera reset.
- Local provider registry: fixture-demo enabled; TripoSR CANDIDATE G2 and Hunyuan RESEARCH G3 disabled.
- SHA-256 manifest, source file access and truthful DRAFT QA report.
- Loopback/Origin checks, allowlisted routes, UUID job separation, signature/size upload limits.
- 9 Node automated tests + 7 real-Chrome browser QA phases (desktop, mobile, source, camera, cancellation), no inference process or printer integration.

## Deliberately NOT implemented

No real model inference, STL/3MF manufacturing qualification, cloud fallback, printing, Office runtime integration, autonomous worker, paid services or automatic engine installation. Read-only TripoSR preflight is available with `npm run preflight:g2` and remains BLOCKED from inference until separately approved.

## Local data

Job manifest: runtime/data/jobs/<UUID>/job.json, optional input image, output GLB, QA report.
Audit log: runtime/data/audit/events.jsonl.
Runtime data is gitignored and persists across normal app restarts.

## Docs

- docs/API.md - API/provider contracts.
- docs/SECURITY.md - threat model and mitigations.
- docs/LICENSES.md - G0 rights and research.
- docs/GATES.md - acceptance, fixtures and future benchmark.
- docs/OPERATIONS.md - environment, backup and rollback.
- docs/ENGINE_CANDIDATES.md - researched local engine options and licensing/hardware gates.
- docs/G2_PREFLIGHT.md and TRIPOSR_SOURCE_LOCK.json - pinned upstream evidence, no model installed.
- docs/evidence/g1 - local Chrome screenshot and browser acceptance report (demo fixture only).

Independent from nocturney/velvetos-core. Its Issue #613 remains P2/PARKED and must not be activated by this project.
