# Evidence, golden fixtures, acceptance gates, benchmark plan

## G0 - Source and rights screening
- PASS: inspected ctate source reference: app is Rodin SaaS UI, no standalone inference.
- PASS: do not copy source without a verified explicit license; clean-room app chosen.
- PASS at G0: Three.js pinned, local-only fixture; G2 weights downloaded and verified later under explicit user approval.
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

## G2 - First real local inference (BOUNDED PILOT + MANUAL APP ADAPTER PASS)
Explicit user authorization covered isolated model installation and limited GPU runs. Source/weights/DINO config pinned and SHA256 verified, isolated Python3.11+torch 2.5.1 cu121. Two original standalone TripoSR pilots succeeded (improved 14.15s, 2058 MiB torch reserved). Subsequently a secure opt-in local app adapter was integrated: G1 default remains fixture-only, G2 only in manually launched Windows localhost session; per-image GPU consent, single synchronous permit, GPU/Office checks, timeout/VRAM caps, process-tree cleanup, cancellation, persistence, SHA/QA validation and Y-up GLB output. Real local end-to-end UI+API smoke passed in 25.51s, 400452 bytes, peak 2058 MiB torch reserved, model loaded in real Chrome; no printer or cloud. Tests 26/26 Node, 5/5 isolated Python, 7/7 G1 browser, 5/5 G2 mock browser; five process tests use actual zero-GPU child processes. See docs/G2_APP_INTEGRATION.md and docs/evidence/g2-app. **Limit:** only one real licensed image has been assessed; no multi-image quality baseline or print certification. No unattended schedule, general text-to-3D or Office integration.

## G3 - Licensed source catalog + CPU geometry review (PARTIAL PASS)

- PASS: nine SHA-locked source references: eight project-original synthetic image/mask/ground-truth GLB triples, plus one pre-existing TripoSR MIT chair image/mask with NO ground-truth 3D. Exact-camera source/GT silhouette positive controls >0.935 IoU. This is NOT model benchmarking.
- PASS: independent CPU GLB topology scanner and optional browser manual review for completed real G2 jobs. Existing real chair is watertight, but signed volume **negative**, caught by new positive-volume guard. Missing scale, thickness, self-intersection and strength checks remain explicit.
- PASS: optional CPU-only winding derivative produces distinct SHA, positive volume, same geometry extents; original unchanged; all printability flags remain false. Real Chrome viewed the previous GLB and its G3 CPU report without new GPU inference.
- RESEARCH ONLY: SF3D, SPAR3D, InstantMesh, Hunyuan Shape, OpenLRM licensing/VRAM comparison in docs/G3_PROVIDER_SCREENING.md. No new candidate weights installed, no commercial licensing assumed.
- OPEN: run new images through the real G2 model with *per-job authorization*, true multi-image output analysis and comparison to another independently licensed engine. Production print and multi-user hardening remain blocked.

## G3.3 — genuine-source shape metric readiness (PARTIAL PASS)

- PASS: SHA-locked nine-image local picker with server allowlisted image reads and browser consent reset. Selecting an image does not create a GPU job.
- PASS: independent CPU normalized-surface Chamfer/F1 diagnostics on eight original synthetic source GT models, with eight exact identity controls and four intentionally wrong-shape controls, explicit optimism/scale limits.
- PASS: private, hash-linked completed-G2-job scorer; denies unlicensed/incomplete/tampered job files, original GT copies and incorrect weights provenance. Upstream chair has no original 3D and must not get a fake 3D metric. Local records are not independent hardware attestations.
- PASS: optional private scores may enter private coverage snapshot, but public benchmark remains **1 prior observed real chair / 8 new images not yet inferred**.
- OPEN: actual G2 inference on each of the eight (requires per-job explicit consent), second local engine and fair real-output comparison, real-world dimensions/self-intersections/wall thickness/print release, and production security hardening. Issue #3 stays OPEN.

## G3.2 — management/benchmark coverage (PARTIAL PASS)

- PASS: one real pre-existing G2 model, eight untouched synthetic reference inputs; reproducible SHA-evidence ledger with explicit "pending" statuses and **no fabricated nine-model results**. Fixed read-only /v1/benchmarks/g3 response in UI.
- PASS: cross-process filesystem GPU lease with multi-process and two-HTTP-app contention tests; second local request rejected without job or GPU. Stale lock is fail-closed, inspected manually.
- PASS: aggregate storage audit, no user photo/prompt/ID disclosure, no deletion/quota claims.
- OPEN: real multi-image G2 runs require separate per-image GPU consent; second independently licensed engine not installed; OS-level egress sandbox, user isolation, formal retention quotas and print qualification not implemented.

## G3 - Multiple provider candidates (NOT APPROVED)
Hunyuan Shape, SPAR3D / TripoSG, alternatives: gate on licensing, reproducible installs, VRAM and non-conflicting scheduling. No P0 CPU/GPU resource impact without separate verified allocation.

## G4 - Fair benchmark (NOT RUN)
Run identical verified fixtures through each qualified engine. Record source image/license, seed, provider version, model SHA256, elapsed wall-clock, peak VRAM, output bytes, silhouette fidelity, multipart integrity, surface topology, normals, manifold and dimensional accuracy where source is measurable. Compare actual mesh utility, not only a pretty render.

## G5 - Optional output qualification (NOT RUN)
STL/3MF export pipeline only with independent geometry report, repair recommendation and explicit state DRAFT / GEOMETRY CHECKED / PRINT QUALIFIED. No print action or automatic release.
