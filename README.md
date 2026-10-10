# LOCAL3D — Local-first 3D Model Workbench

Independent clean-room project under HANDOFF 12 (2026-10-09). LOCAL3D includes a responsive Hebrew RTL workbench and a **real, locally verified TripoSR image-to-3D adapter** on Windows. No OpenAI/Codex engine, Rodin/Meshy/Tripo SaaS subscription, print service or Office 2.0 runtime dependency.

**Default is G1 DEMO, no GPU.** The real G2 engine is available ONLY in an explicitly started **manual local session** with confirmation for each image. It is not an unattended AI queue, not text-to-3D, and never automatically sends files to a printer. All generated geometry is **DRAFT / NOT PRINT QUALIFIED**.

## Quick start: safe G1 demonstration (no AI)

Windows Chris / Mac Mini with Node.js 20+:

    npm ci --ignore-scripts --no-audit --no-fund
    npm test
    npm run qa:browser
    npm start

Open http://127.0.0.1:4177 on that host. G1 fixture jobs simulate progress; the output GLB is deterministic and independent of the uploaded image or text. It never executes Python/CUDA.

Windows working directory: D:\Velvet\Projects\local-3d-generator

## G2: real image-to-3D in an intentional manual session (Windows)

Model installed locally in an isolated Python 3.11 venv with pinned/verified TripoSR weights. On Windows Chris, manually start a separate session:

    powershell -NoProfile -File scripts/start-g2-manual.ps1

Then open **http://127.0.0.1:4179** on Chris. Select **TripoSR Local**, upload one PNG/JPEG/WebP image (max 8MiB; full decode <=16MP), explicitly check the GPU consent box and click **צור מודל אמיתי (GPU)**. When completed, rotate the Y-up GLB, inspect its DRAFT report and download it. Use Cancel to terminate a running subprocess; the UI says "נעצרת" until actual cleanup. Stop the manual session with Ctrl+C.

G2 uses its own runtime/data-g2-manual directory and port, not G1 job records. Every job checks Office Accelerator idle status and GPU headroom before spawning an isolated Python process, enforces timeout/VRAM limits, and never queues another GPU task. The server remains on 127.0.0.1; there is no cloud fallback, local printer connection or scheduled inference. Models are not required or validated on macOS G2; only G1 was qualified there.

Text-to-3D remains unavailable: text input in G1 is demonstration only, and notes attached to G2 image jobs do NOT change the shape.

## Implemented

- Hebrew RTL responsive input, drag-and-drop upload, history, progress, cancellation and Three.js/OrbitControls GLB viewer.
- Persistent UUID jobs with source/model SHA256 manifests, DRAFT QA and local audit logs.
- G1 CPU deterministic fixture demonstration, fully independent of the AI installation.
- G2 manual-only guarded TripoSR image-to-3D via **start/status/cancel/result** APIs, Python worker isolation, Y-up GLB export, input validation, GPU/Office safety gates and process-tree cleanup.
- Exact pinned MIT TripoSR source/weights, pinned Apache DINO configuration, Windows CUDA PyTorch stack; no upstream unpinned torchmcubes extension or network background-removal weights.
- End-to-end G2 real CUDA proof through LOCAL3D API and Chrome UI (licensed chair example, 25.51 sec, 2058 MiB peak torch reserved); no running GPU worker left after validation.
- Tests: 26 Node API/geometry/G2 security tests on Windows, 5 isolated Python tests, 7 G1 browser phases, 5 G2 mock-provider browser phases and one actual G2 end-to-end smoke. No GPU model is run by npm test/test:all.

## Not implemented / not claimed

No unattended GPU worker, public/multi-user authentication, arbitrary text-to-3D, cloud inference, dimensionally accurate CAD, manufacturing qualification, wall-thickness and support checks, print-ready STL/3MF release, fabrication router, machine control, or integration into Office 2.0 P0. The input model quality is not guaranteed by a single sample; further licensed-image benchmarking is needed before production use.

## Documentation and evidence

- [G2 manual integration, security and operation](docs/G2_APP_INTEGRATION.md)
- [Actual app/browser GPU proof](docs/evidence/g2-app/README.md) — real image-derived GLB, unedited Chrome screenshot, SHA and QA report
- [Original isolated TripoSR pilot](docs/G2_RESULTS.md) and [pilot evidence](docs/evidence/g2/README.md)
- [API contracts](docs/API.md) | [Security](docs/SECURITY.md) | [Operations](docs/OPERATIONS.md)
- [Licensing](docs/LICENSES.md) | [Gates and benchmarks](docs/GATES.md) | [Engine comparisons](docs/ENGINE_CANDIDATES.md)
- [G2 source lock](docs/TRIPOSR_SOURCE_LOCK.json) and [scoped original approval](docs/G2_APPROVAL_2026-10-09.json)

This is independent from nocturney/velvetos-core. Its AI3D Issue #613 remains P2/PARKED and is not activated or modified by LOCAL3D.
