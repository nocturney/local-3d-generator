# Evidence, golden fixtures, acceptance gates, benchmark plan

## G0 - Source and rights screening
- PASS: inspected ctate source reference: app is Rodin SaaS UI, no standalone inference.
- PASS: do not copy source without a verified explicit license; clean-room app chosen.
- PASS: Three.js pinned, local-only fixture; no weights downloaded.
- REVIEW LATER: exact commit, all indirect dependency licenses, TripoSR weight card, Hunyuan jurisdiction and distribution.
- PASS: existing AI3D engineering Issue #613 is P2/PARKED, not this project's scheduler.

## G1 - Fixture-only interface
Evidence (2026-10-09): Windows Chris: 12/12 Node tests + 7/7 browser phases PASS in real Chrome 154.0.8037.98. MacMiniOffice.local: 12/12 Node tests + 7/7 browser phases PASS in real Microsoft Edge 154.0.4258.53 on macOS arm64. See docs/evidence/g1/report.json, macos-report.json and Windows screenshots.
Golden fixture: fixtures/demo-sculpture.glb, generated deterministically with server/fixture.js.
- A: image upload -> persisted job -> GLB asset -> DRAFT QA report: PASS API and real Chrome browser. Screenshot and byte-for-byte source download verified.
- B: invalid image, missing prompt, disabled provider, job cancel, missing output: PASS automated. Model timeout (real engine) NOT APPLICABLE to G1.
- C: job QA report states DRAFT, no manifold/wall thickness test, printQualified false: PASS. Deliberately no positive manufacturing claim.
- D: remote URL rejected, Host/Origin blocked, unknown job/asset inaccessible: PASS automated. External independent security review pending.
- E: same input through two real engines: NOT STARTED; no second engine installed.
- Persistence: atomic job.json plus restart-interruption recovery tested PASS.
- Browser UI: 1440px desktop and 390px mobile screenshots inspected on Windows Chrome and macOS Edge; OrbitControls changed viewport pixels, reset exercised; no browser JS errors or external requests on either host. PASS for the two tested browser/OS combinations. Mac Chrome headless had a host-specific path-service crash, but Mac Edge passed. A missing Three.js core import and favicon were found/fixed by live browser QA.

## G2 - First real local inference (BLOCKED; read-only screening done)
TripoSR source and checkpoint metadata pinned in docs/TRIPOSR_SOURCE_LOCK.json; no sources/weights installed or local hashes verified. Windows read-only preflight at runtime/qa/g2-preflight.json found 4080 SUPER 16GB, ~11.4GB free but ~39% utilization, default Python 3.11 without torch, and nvcc 13.2. Nonconflicting GPU capacity not proven. Upstream includes unpinned torchmcubes source compilation. See docs/G2_PREFLIGHT.md. A real isolated venv + verified weights, qualified license/dependencies, explicit model installation/GPU approval, image-to-3D inference, cancellation and failure cleanup remain NOT STARTED. No claim of text-to-3D. Benchmark before registry status changes.

## G3 - Multiple provider candidates (NOT APPROVED)
Hunyuan Shape, SPAR3D / TripoSG, alternatives: gate on licensing, reproducible installs, VRAM and non-conflicting scheduling. No P0 CPU/GPU resource impact without separate verified allocation.

## G4 - Fair benchmark (NOT RUN)
Run identical verified fixtures through each qualified engine. Record source image/license, seed, provider version, model SHA256, elapsed wall-clock, peak VRAM, output bytes, silhouette fidelity, multipart integrity, surface topology, normals, manifold and dimensional accuracy where source is measurable. Compare actual mesh utility, not only a pretty render.

## G5 - Optional output qualification (NOT RUN)
STL/3MF export pipeline only with independent geometry report, repair recommendation and explicit state DRAFT / GEOMETRY CHECKED / PRINT QUALIFIED. No print action or automatic release.
