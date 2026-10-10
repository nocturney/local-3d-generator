# Release notes

## v0.2.0 — 2026-10-10 — Manual local TripoSR image-to-3D

- Added a **real, on-device TripoSR image-to-3D adapter** behind an explicit Windows-only manual session. It is disabled by default; G1 remains a deterministic, no-GPU demonstration.
- Added per-job GPU confirmation in the Hebrew UI, runtime provider discovery, separate demo/real labels and staged job progress. Upload supports PNG/JPEG/WebP with server-side decode/pixel limits. Text remains demo/annotation-only, not text-to-3D.
- Added live Office Accelerator/Ollama conflict checks and NVIDIA GPU headroom gates, a single atomic GPU permit, time/VRAM guards, process-tree cancellation, shutdown/restart safety and fail-closed artifact publication.
- Added dedicated G2 manual launch script on **127.0.0.1:4179** and separate runtime/data-g2-manual storage; original G1 on 4177 and existing unrelated service on 4178 remain untouched. No autostart or background GPU scheduler.
- Verified a genuine local GPU image→GLB→API→Chrome viewport run with the MIT-licensed TripoSR chair fixture: 25.51 s model worker, 2,058 MiB peak PyTorch CUDA reserved, 400,452-byte Y-up GLB, DRAFT/non-printable report, full artifact SHA256 chain.
- Added isolated offline worker preprocessing, pinned weights and DINO config, CPU marching cubes, extra test harnesses, independent model provenance, and complete security/operations documentation.
- Validation: 26 Node tests (including real Windows fake-child process termination), 5 isolated Python tests, 7 G1 browser phases, 5 G2 manual mock-browser phases and the separate one-time real inference smoke; no model inference occurs under normal npm test.

**Important limitations:** One real licensed source image only; output is not CAD, dimensionally qualified or suitable for print release without separate geometry QA. No SaaS/paid fallback, remote access, user authentication, automatic GPU jobs or Office 2.0 integration.

## v0.1.0 — 2026-10-09 — G1 standalone clean-room fixture workbench

- Built an independent Hebrew RTL localhost Node/Three.js workbench with deterministic GLB demo fixture, upload history, API job manifests, audit, download and camera controls.
- Added G1 Windows Chrome and macOS Edge acceptance with full DEMO/NOT PRINT QUALIFIED truth labeling.
- Pinned Three.js and model-engine research candidates without allowing unreviewed source reuse or cloud provider fallback.
