# G2.2 real LOCAL3D API/Web UI acceptance - 2026-10-10

**Real, not fixture and not mock.** A single **owner-directed** image-to-3D TripoSR local GPU smoke was launched through createApp's actual opt-in provider, using the already-licensed upstream chair image at docs/evidence/g2/source-chair.png. This validation did not use background workers, a remote inference API or a 3D printer. The single manual test server was closed after acceptance.

- real-app-output.glb: GLB model from API job, Y-up orientation, 400,452 bytes, SHA256 ed50855c7e2f6a3cd0ab884a41d44a13c2ea86a3d14f04c05b9e889160429416
- real-g2-manual-ui.png: actual Chrome screenshot of this very job loaded in LOCAL3D WebGL viewport. This image is not retouched.
- qa-report.json: server-side per-job DRAFT QA, realInference=true, printQualified=false, source/model hashes, durations, geometry and shared GPU accounting.
- e2e-report.json: one-time manual harness report. It has an ephemeral UUID and local provenance metadata, but no tokens, paid cloud calls or credentials.

The result is a recognizable, imperfect chair reconstruction. Real end-to-end success does not imply commercial image-to-3D quality, dimensional accuracy or printable geometry. Future GPU work must remain manual/guarded until separately approved.

Implementation/security: ../../G2_APP_INTEGRATION.md.
