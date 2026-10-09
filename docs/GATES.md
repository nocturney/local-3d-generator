# Evidence, golden fixtures, acceptance gates, benchmark plan

## G0 - Source and rights screening
- PASS: inspected ctate source reference: app is Rodin SaaS UI, no standalone inference.
- PASS: do not copy source without a verified explicit license; clean-room app chosen.
- PASS: Three.js pinned, local-only fixture; no weights downloaded.
- REVIEW LATER: exact commit, all indirect dependency licenses, TripoSR weight card, Hunyuan jurisdiction and distribution.
- PASS: existing AI3D engineering Issue #613 is P2/PARKED, not this project's scheduler.

## G1 - Fixture-only interface
Evidence: npm test on Windows Chris host, nine automated tests PASS on 2026-10-09.
Golden fixture: fixtures/demo-sculpture.glb, generated deterministically with server/fixture.js.
- A: image upload -> persisted job -> GLB asset -> DRAFT QA report: PASS automated API test. Real browser visual rotation pending independent human/UI verification.
- B: invalid image, missing prompt, disabled provider, job cancel, missing output: PASS automated. Model timeout (real engine) NOT APPLICABLE to G1.
- C: job QA report states DRAFT, no manifold/wall thickness test, printQualified false: PASS. Deliberately no positive manufacturing claim.
- D: remote URL rejected, Host/Origin blocked, unknown job/asset inaccessible: PASS automated. External independent security review pending.
- E: same input through two real engines: NOT STARTED; no second engine installed.
- Persistence: atomic job.json plus restart-interruption recovery tested PASS.
- Browser UI: static assets served; visual smoke testing still required before calling visual QA passed.

## G2 - First real local inference (NOT APPROVED/NOT STARTED)
Verify exact TripoSR source, weights and package licenses; resource budget on Windows RTX 4080 SUPER (16GB claimed in handoff), isolated venv, read-only health, image-to-3D only, input safety, cancellation and failure cleanup. No claim of text-to-3D. Benchmark before registry status changes.

## G3 - Multiple provider candidates (NOT APPROVED)
Hunyuan Shape, SPAR3D / TripoSG, alternatives: gate on licensing, reproducible installs, VRAM and non-conflicting scheduling. No P0 CPU/GPU resource impact without separate verified allocation.

## G4 - Fair benchmark (NOT RUN)
Run identical verified fixtures through each qualified engine. Record source image/license, seed, provider version, model SHA256, elapsed wall-clock, peak VRAM, output bytes, silhouette fidelity, multipart integrity, surface topology, normals, manifold and dimensional accuracy where source is measurable. Compare actual mesh utility, not only a pretty render.

## G5 - Optional output qualification (NOT RUN)
STL/3MF export pipeline only with independent geometry report, repair recommendation and explicit state DRAFT / GEOMETRY CHECKED / PRINT QUALIFIED. No print action or automatic release.
