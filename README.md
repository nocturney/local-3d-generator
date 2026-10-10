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
- Tests as of G3 preview: **33 Node** API/geometry/security tests on Windows, **15 Python** tests (5 G2 + 10 G3), 7 G1 browser phases, 6 G2/G3 mock-provider browser phases, one prior real G2 GPU end-to-end smoke and one actual G3 CPU-only review of the existing GLB. No GPU model is run by npm test/test:all.

## G3.2 — benchmark coverage and shared GPU protection (v0.2.2)

Local-first safety now includes an atomic GPU lease across multiple manually started LOCAL3D Node servers, in addition to the original in-process/Office/NVIDIA guards. If another G2 server owns the lease, a new GPU request is rejected (409) without scheduling the job. After a crash, locks are **not automatically cleared**. Inspect with npm run audit:g3:gpu-lock; do not bypass it without checking for worker processes.

A read-only, SHA-verified [nine-source benchmark coverage snapshot](docs/evidence/g3/benchmark-coverage.json) reports **1 previously observed real G2 chair result and 8 unrun images**, not nine AI successes. In the UI, the new G3 QUALITY BENCHMARK panel shows these historical results, never a GPU trigger. npm run benchmark:g3 reproduces the public snapshot; an optional --jobs-dir flag writes only to gitignored private runtime. npm run audit:g3:storage reports existing job storage size/age without deleting anything.

See [G3.2 security + operations](docs/G3_2_SAFETY_BENCHMARK_2026-10-10.md). Still no print certification, multi-user OS sandbox, second provider installation or automatic benchmark run.

## G3 preview — CPU geometry quality checks (no new GPU inference)

A new manual **סריקת רשת (CPU)** button on completed TripoSR jobs runs independent topology inspection in the local isolated Python environment. It checks GLB source SHA, connected components, open/nonmanifold edges, signed volume, winding and face quality; exposes a separate downloadable **geometry-qa.json** asset, with explicit unknown real-world units and wall thickness. It NEVER print-qualifies a model.

A reproducible **9-fixture benchmark source catalog** is available under [benchmarks/g3](benchmarks/g3/README.md): 8 project-original synthetic image/mask/source-3D triples plus the already-licensed upstream chair photo and mask. NO NEW synthetic image has yet been through actual AI inference. Exact-source-camera positive controls validate the silhouette scorer, not the AI. The previous real chair's signed volume was found to be **negative despite watertightness**. A separate CPU-only optional winding derivative preserves the original and still remains DRAFT.

Read [G3 progress](docs/G3_PROGRESS_2026-10-10.md), [real-world geometry evidence](docs/evidence/g3/README.md) and [research-only engine screening](docs/G3_PROVIDER_SCREENING.md). **Issue #3 remains open** for licensed-image GPU benchmarking, actual provider comparisons, physical print geometry qualification and hardening.

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
