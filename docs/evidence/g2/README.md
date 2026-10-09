# G2 limited TripoSR real GPU output evidence

All items are from a LOCAL offline TripoSR image-to-3D pilot on Windows (2026-10-09). **This is not the G1 fixture, but it is also NOT approved for printing.** These are small, licensed demonstration artifacts only; full 1.68GB checkpoint remains local/gitignored.

- source-chair.png: upstream TripoSR MIT-licensed chair image used as test input, original source file unmodified. Copyright 2024 Tripo AI & Stability AI (upstream LICENSE).
- chair-preview.png: real Three.js/Chrome screenshot of the reconstructed chair in the correct Y-up orientation, not retouched, DRAFT label visible.
- chair-yup.glb: CPU-reoriented export of real TripoSR model. SHA256: 03e0e70d1bfffaae36bda09b56bf65f33f8c60a132d6a9caf7fca8f87621b7be, 400,652 bytes.
- inference-qa.json: original second-pilot model SHA, vertex and face counts, peak CUDA memory, real inference duration, input SHA and no-print qualification.
- upright-qa.json: parent-to-derived SHA trace and Z-up → Y-up rigid coordinate conversion.
- browser-validation.json: independent Three.js loader and real-browser result. One mesh, 9,986 vertices, 19,972 triangles, 0 JS errors, 0 external URL requests.

The result is a recognizable chair at 128 MC resolution. It has visual defects and is not a substitute for geometric or dimensional QA. It does not establish that arbitrary images will work. Future model installation or general application inference requires scoped approval and dedicated GPU resource gating.

Full technical details: ../../G2_RESULTS.md
