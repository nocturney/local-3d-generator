# Evidence, golden fixtures, acceptance gates, benchmark plan

## G3.16 — exact shared ONE-index vertex-only face contacts (CPU, decoded GLB only)

- PASS: raw original vertex-to-face index incidence census independently enumerates every face pair with exactly ONE shared index; it excludes full-indexed-edge neighbors. Mathematical exact signed planes/rays or exact 2D coplanar polygon clipping distinguishes expected only-point contact, extra line contact beyond that shared vertex and positive-area coplanar overlap, all on IEEE754-decoded source XYZ values. Valid synthetic overlaps MUST be flagged. Budget/time/degenerate cases never pass as clear.
- PASS: previous real orb and G3.7 same-surface copy: 190,860 exact pairs each, 0 extra contacts. Project-original GT 5,730 and earlier licensed chair 92,629, also 0. All four actual SHA/image provenance and G3.14 independent counts agree, and source reports replay immutably. No new neural job.
- OPEN: G3.14 no-index pair class has only conservative NUMERICAL SAT (43,107 previous real AABB pairs), not exact whole-mesh proof; original CAD/mm precision, wall thickness, supports/mechanics/printer suitability and OS/network sandbox/security Issue #4 not satisfied. Print release remains BLOCKED, Issue #3 OPEN and every model DRAFT / printQualified=false.
- [G3.16 exact vertex method and caveats](G3_16_EXACT_INDEXED_VERTEX_CONTACT_CPU_2026-10-10.md), [sanitized four-model SHA evidence](evidence/g3/orb-01-g316-exact-indexed-vertex-only.json).

## G3.15 — exact shared-index-edge adjacency classification (CPU, DECODED GLB COORDINATES ONLY)

- PASS: rational signed tetrahedral orientation and coplanar side-of-shared-edge classifies every indexed full-edge face pair, distinguishing expected edge-only contact from true coplanar same-side positive interior area overlap under exact IEEE-754-decoded GLB numeric geometry. Tests include positive synthetic coplanar same-side overlap, valid cube/flat seam, reversed winding and fail-closed unsafe/degenerate input.
- PASS: actual prior real orb 60,528 edges, copy 60,528, project GT 1,920 and licensed chair 29,958 all classified, zero same-side coplanar positive-area overlap candidates. Four source SHA hashes, private job provenance, previous G3.14 AABB edge counts and immutable sanitized evidence verified. Zero new AI inference.
- BLOCKED: indexed one-vertex-only extra contact remains numerical (G3.10), no-index pairs SAT floating (G3.14), original GLB float32/CAD tolerance, physical wall thickness, real-world scale and printer QA. This is NOT a full exact self-intersection clearance, all output DRAFT and printQualified=false. GitHub Issues #3/#4 remain OPEN.
- [G3.15 details](G3_15_EXACT_INDEXED_EDGE_CONTACT_CPU_2026-10-10.md), [G3.15 aggregate SHA evidence](evidence/g3/orb-01-g315-exact-indexed-edge.json).

## G3.14 — independently exhaustive AABB numerical candidate and indexed adjacency census (CPU ONLY)

- PASS: conservative bounding-box-sphere cKDTree broadphase independently accounts for every numerical AABB-overlapping face-pair candidate; explicit indexed partition into exactly-one-vertex, full-edge and no shared indexed vertices. The no-index category is fully screened by conservative numerical SAT; SAT-positive pairs would be routed to bounded G3.13 exact refinement. 12 synthetic/trusted Python controls including brute-force AABB comparisons and 3 Node public source/privacy checks pass.
- PASS: previous real 01-orb-alpha (40,352 triangles) contains 294,495 AABB candidate pairs: 60,528 shared indexed edge + 190,860 only indexed vertex + 43,107 no-index, 0 numerical SAT positives among all 43,107. This is 82 more conservative AABB candidate boxes than the G3.8 previously triangle-centroid-sphere filtered count. The G3.7 winding-only copy reproduces results exactly; GT and chair were also SHA-verified CPU replayed. NO NEW MODEL INFERENCE.
- LIMITATION: numerical SAT negatives are NOT exact proof of no microscopic intersection, and shared-edge/vertex candidate pairs are NOT globally classified for extra geometric intersections here. Candidate boxes do not equal real mesh penetrations. No wall thickness, mm scale, manufacturing or printer clearance.
- Evidence: [G3.14 numerical scope](G3_14_AABB_FULL_PAIR_CENSUS_CPU_2026-10-10.md), [sanitized SHA report](evidence/g3/orb-01-g314-full-aabb-census.json). G3 Issue #3, security Issue #4 both OPEN. Every model DRAFT / printQualified=false.

## G3.13 — exact-binary-float triangle PAIR classifier (FOUNDATION ONLY)

- PASS: new standalone CPU-only selected triangle-pair classifier with exact rational orientation and coplanar polygon clipping of *already decoded* IEEE-754 GLB coordinates. 19 adversarial Python tests for definite strict interior piercing, coplanar positive-area overlap, legitimate boundary touching/plane separation and malformed/budget-limited inputs.
- PASS: SHA-verified previous real orb, winding-only copy, known procedural GT and old chair; 24 lexicographically chosen already-indexed SHARED-EDGE adjacent triangle pairs per existing GLB analyzed. All 24 in each are **UNRESOLVED_BOUNDARY** because neighboring triangles legitimately meet on that indexed edge; NOT defects. NO OTHER PAIRS screened by G3.13 selected-pair proof.
- BLOCKED: complete mesh pair enumeration/BVH, nonadjacent pairs and degenerate boundary handling globally, exact full self-intersection-free certification, true physical mm-scale/walls, printer/structural QA. No production-code connection or automatic printer action; no new AI model or GPU.
- Evidence: [limited method](G3_13_EXACT_SELECTED_TRIANGLE_PREDICATES_CPU_2026-10-10.md), [immutable SHA-linked selection-only counts](evidence/g3/orb-01-g313-selected-exact-pair-predicate.json). `printQualified=false`; Issues #3/#4 remain OPEN.

## G3.12 — different-index spatial position and disconnected-shell proximity (CPU DIAGNOSTIC)

- PASS: on four EXISTING SHA-verified GLBs (20,178-vertex real TripoSR orb, exact-winding copy, 642-vertex procedural GT, 9,986-vertex historical chair), independently enumerated different indexed vertex IDs at distance <=1e-7 of each model's AABB diagonal. **0 exact or near pairs** in each; one indexed component each. No new model run or CUDA permission used.
- PASS: 12 adversarial Python tests flag different-index coincident/near XYZ, contact at touching separate closed box shells, prevent same-index overcount, and fail closed for dense clusters and malformed input. Three Node tests enforce previous source SHA, privacy and DRAFT/no-printer flags. Immutable reports and [G3.12 evidence](evidence/g3/orb-01-g312-spatial-index-proximity.json) verified.
- LIMITATION: this is a per-vertex spatial screen, **not** a triangle-interior/surface-surface intersection detector, physical mm threshold, automatic vertex welding/repair or proof that disconnected shells never meet; coplanar/near-zero precise geometric contacts remain unresolved.
- BLOCKED: exact robust whole-mesh collision predicates, calibrated CAD dimensions, local wall thickness, material/slicer/printer checks, remaining seven per-image GPU authorizations and production sandbox/advisory triage. Issue #3 and #4 remain OPEN. No output PRINT QUALIFIED.
- [Method](G3_12_SPATIAL_INDEX_PROXIMITY_CPU_2026-10-10.md). Nothing touches Office 2.0, printer or existing GPU inference.

## G3.11 — shared-edge same-side planar fold screening (DIAGNOSTIC ONLY)

- PASS: CPU screen over all **60,528** actual indexed two-face edge pairs in the prior real 01-orb-alpha TripoSR model and G3.7 exact-surface orientation copy, with **0 possible coplanar same-side beyond-edge overlap candidates**, 0 near-antiparallel >=175°, 0 suspicious same-side >=150° backturns and 0 borderline cases. Source procedural GT: 1,920 edge pairs; historical MIT chair: 29,958, also zero under these numerical predicates.
- PASS: adversarial coplanar same-side overlapping triangle test MUST flag; valid opposite-side planar pair, legitimate cube corners and sphere do not. Noncoplanar high-backturn pair is a separate indicator, not falsely called coplanar penetration. Four-model SHA validation/read-only CPU replay and public sanitized immutable report passed. No GPU tasks.
- NOT CERTIFIED: G3.8 SAT no shared indexed vertex, G3.9 edge-normal angle, G3.10 shared-one-vertex ray, G3.11 edge-coplanar same-side fold are *different narrow numerical screens*, not one mathematically exhaustive global geometric collision predicate.
- BLOCKED: true robust 3D intersection under degeneracies, co-located separate-index vertices, physical mm scale, local minimum thickness, supports/material strength/slicer/real-world photos, seven still-unrun G3 originals and independent second engine.
- [G3.11 scope](G3_11_EDGE_BACKFOLD_CPU_2026-10-10.md), [real model evidence](evidence/g3/orb-01-g311-edge-coplanar-screen.json). All output remains DRAFT, printQualified=false.

## G3.10 — extra-contact rays between exactly-one-vertex-adjacent faces (CPU DIAGNOSTIC)

- PASS: on prior genuinely authorized 01-orb-alpha TripoSR real output AND unchanged-surface G3.7 winding copy, enumerated all **190,860 unique vertex-only triangle pairs per GLB** and tested positive/negative possible shared noncoplanar rays away from the common indexed point. No such extra ray candidate found under finite precision. Project-original GT: 5,730 pairs; historical real chair derivative: 92,629 pairs; 0 extra candidates in those numerical screens. None of these counts constitutes a new model run.
- PASS: separate ray detection from **NORMAL shared-vertex touching**, which is not a defect; explicit near-coplanar/ray-boundary UNRESOLVED outcome, fail-closed resource exhaustion, 13 adversarial CPU controls including synthetic true extra-ray intersection, SHA-pinned immutable public proof and 4-model private read-only CPU replay. G3.7 shape is preserved.
- LIMITATION: G3.8 no-shared-vertex SAT=43,025 eligible orb pairs; G3.9 indexed SHARED-EDGE angle statistics=60,528; G3.10 shared-ONE-vertex ray candidates=190,860. These are different diagnostics, **NOT** complete exact global mesh self-intersection screening. A truly coplanar folded edge, hidden wall issue or mm tolerance still requires new independent tests.
- BLOCKED: **no** manufacturing certification, true minimum mm walls, absolute model scale, supports/material strength, slicer/physical QA, model provider licensing, seven unrun synthetic G3 images. G3 real-output private coverage remains 2/9, public historical scorecard remains earlier 1/9.
- Evidence: docs/G3_10_SHARED_VERTEX_CPU_2026-10-10.md and docs/evidence/g3/orb-01-g310-shared-vertex-ray-screen.json. Model printing remains disabled; G3.10 runs CPU-only.

## G3.9 — edge-adjacent face-normal-angle diagnostic (PARTIAL CPU PASS)

- PASS: all 60,528 indexed two-face shared-edge pairs of the existing 40,352-face real 01-orb-alpha output and its G3.7 separate winding derivative checked with deterministic CPU Trimesh face normals. Their p95 difference is 33.018760°, 312 edges >45°, 18 >60°, **0 >90°**. Underlying known original project GT has p95 5.731991°, but GT has 1,280 faces vs 40,352 model faces, so direct angle percentiles are NOT mesh-resolution invariant.
- PASS: reproducible source/model/derivative SHA-linked counts, a completely independent CPU-only replay, immutable sanitized G3.9 evidence and negative tests (including intentional cube sharp edges, open/degenerate geometry and changed winding). 0 newly launched AI workers.
- LIMITATION: this adds **full indexed edge adjacency angular coverage**, NOT a contact/collision check for edge-adjacent faces. Vertex-only adjacency, true foldover geometry and exact global self-intersections remain **NOT EXAMINED**. Sharp angles do not alone imply a defect; zero angles above 90° cannot imply print/structural safety.
- Still DRAFT / NOT PRINT QUALIFIED: physical units, walls, material/slicer/strength, mesh self-intersection certification, trusted media sandbox/security, alternative provider and seven unrun synthetic G3 images.
- Evidence: docs/G3_9_ADJACENT_FACES_CPU_2026-10-10.md and docs/evidence/g3/orb-01-g39-adjacent-angles.json.

## G3.8 — bounded triangle-contact risk + orb radial quality (CPU diagnostic ONLY)

- PASS: actual previously consented 01-orb-alpha TripoSR GLB and previous non-destructive orientation derivative both underwent bounded, conservative nonadjacent-triangle SAT screening (43,025 eligible pairs per 40,352-face mesh, 0 potential contacts flagged). Independently verified original and derivative SHA and same geometry before testing.
- LIMITATION: this is **NOT a complete self-intersection or print pass**. Excludes all pairs sharing a vertex index (251,388 AABB candidate pairs) and uses tolerant floating-point potential-contact checks. Traversal/resource budgets are explicit and INDETERMINATE if exceeded; false negatives/positives remain possible.
- PASS: licensed procedural orb GT and actual generated AI orb compared via 4096 deterministic area-weighted surface samples and separate best-fit spheres. Mean absolute radial residual relative to fitted radius: 0.00062476 GT vs 0.04973669 TripoSR. Can measure nonroundness but not millimeter thickness/finish or physical accuracy.
- PASS: synthetic intersecting/disjoint/coplanar negative controls, degenerate/over-budget/invalid-mesh refusal, deterministic private CPU-only replay of all 3 scans and the radial metric, immutable sanitized evidence SHA validated against actual completed job.
- ZERO new AI in this phase, no second provider, no cloud or printer, no Office runtime modifications. **2/9 private actual model outputs** remain unchanged, 7 G3 sources require separate new GPU approvals. Public fixed historical 1/9 baseline is not live.
- BLOCKED: adjacent-face foldover, mathematically exact global collision checking, real-world mm dimensions, thickness, supportability, mechanics, slicer validation, OS sandbox/authentication and resolved Python advisory triage. DRAFT/printQualified=false.
- Evidence: docs/G3_8_ORB_CPU_RISK_2026-10-10.md and docs/evidence/g3/orb-01-g38-cpu-risk-screen.json.

## G3.7 — one actual new G3 synthetic model + copy-only CPU QA (PARTIAL PASS)

- REAL PREEXISTING INPUT: one newly consented TripoSR 01-orb-alpha inference successfully generated an 808,092-byte GLB in 12.59s, with source/job/output SHA consistency and complete native worker stages. This real inference occurred BEFORE the G3.7 CPU-only milestone. Seven other new synthetic reference images are unrun; previous real MIT chair is the other observed output.
- PASS: new private, source-preserving GLB derivative flips only triangle winding on closed inward-facing original mesh: signed volume -0.3691746 -> +0.3691746 arbitrary units cubed, same 40,352 triangles / 20,178 vertices, one watertight component.
- PASS: independent CPU auditor demands bit-exact unchanged vertex coordinates/vertex colors, exact per-triangle reversed face indices, opposite normals and identical bounds/abs(volume). Malformed/open/reordered/mutated inputs and overwrite attempts are rejected; no CUDA inference needed.
- PASS: native three-way Chrome SwiftShader screenshot of original source 3D, generated real output and winding-only derivative with no external network calls. The AI surface visibly has roughness relative to original source. Inverted-to-positive winding does NOT improve original-vs-reference shape distance.
- EVIDENCE: private SHA-linked input, GLB and CPU QA; sanitized docs/evidence/g3/orb-01-* and docs/G3_7_ORB_WINDING_CPU_2026-10-10.md. Public fixed historical benchmark remains 1/9; private live observed-output coverage 2/9 (7 pending).
- BLOCKED: self-intersections, physical dimensions, minimum walls, strength, support/material/printer profile, second licensed provider, real-world quality generalization, OS network sandbox/authentication. PrintQualified remains FALSE and no printer action occurred.
- GPU: zero NEW TripoSR inference from G3.7; all additional model tasks require explicit per-image approval and live Office/GPU safeguards.

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

## G3.4 — manual completed-job CPU comparison / host GPU evidence (PARTIAL PASS)

- PASS: manually initiated CPU-only benchmark on a **completed licensed-source G2** job with source/GLB/provenance verification and downloadable, DRAFT benchmark-shape JSON. Denies DEMO, unknown/unlicensed source, running, tampered model, duplicate requests and false print claims.
- PASS: actual pinned Windows CPU scorer over temporary localhost API against the **existing historical real chair GLB**; no new model inference, accurately reports NO_GROUND_TRUTH_3D, with temp evidence cleaned.
- PASS: future real-model successful G2 QA can report NVIDIA host usage as sampled shared-GPU observations distinct from model CUDA reserved MiB; the delayed native mock process tests sampling without CUDA.
- STILL OPEN: eight *new* licensed inputs have NO AI results and no cross-provider ranking; per-image GPU approval and live Office/NVIDIA checks required for each. Camera/real-world scale, self-intersection, thickness/strength/material safety, native process sandbox and OS network denial absent.
- HOLD Issue #3 OPEN. No printing, no autonomously scheduled inference, no licensing assumptions about additional engines.

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

## G3.5 — CPU admission and supply-chain safety (PARTIAL PASS)

- PASS in CPU-only tests: a new manual G2 job is not saved or handed to GPU if existing job storage is invalid, exceeds 8GiB prospective quota, has too many job folders or cannot leave >=3GiB volume free after estimated reservation. No automatic deletion. G1 demo unaffected.
- PASS: one cross-type topology/shape CPU-review permit per server process, immediate HTTP 409 G3_CPU_BUSY without queue, released on success and rejected print-approval report. No GPU tests needed.
- PASS: read-only existing G2 manual storage preflight found 3 prior job folders and unchanged byte totals before/after. No images, paths or filenames committed.
- SCREENED / NOT REMEDIATED: npm audit found 0 Node package matches; public OSV matching of 34 frozen Python dependencies found 104 advisory entries in Pillow, Transformers and Torch. Applicability and patched-model compatibility remain unreviewed; untrusted-media/production-security gate is BLOCKED pending triage.
- STILL OPEN: 8 real TripoSR model runs on G3 synthetic fixtures (each needs new per-run approval); second-model comparison, real-world dimensions, topology/printability, system egress sandbox, OS-backed quotas and production retention. G3 issue stays OPEN. No Office, printer or model changes.

Evidence: docs/G3_5_RESOURCE_SECURITY_2026-10-10.md and docs/evidence/g3/g3-5-*.

## G3.6 — Pillow shadow candidate, CPU-only sub-gate PASS

- PASS: public official Pillow 12.3.0 Windows CPython3.11 wheel and SHA256 verified; OSV public version-query matches 0 versus 32 for working Pillow 10.1.0 at this test date. Zero OSV matches are not exploit-proof.
- PASS: 9/9 pinned licensed benchmark input preprocessing checks via actual TripoSR worker CPU helper, four alpha/EXIF/WebP/corrupt-file controls, 23/23 original Python G2/G3 CPU unit tests and import-only TripoSR tokenizer/system compatibility; CUDA not used.
- PASS: working production venv remains Pillow 10.1.0, frozen manifest/source/weights unchanged, shadow overlay stays gitignored. No new image→3D generation or OS configuration changes.
- BLOCKED: Transformers 4.35.0 and Torch 2.5.1 version-level OSV matches, true reachable vulnerability assessment, entire patched model dependency compatibility, OS sandbox, public untrusted input security and actual CUDA reconstruction qualification.
- G3 source benchmark still 1 historically real chair / 8 new source images without AI runs, no manufactured geometry release. New GPU attempts require separate authorization.

Proof: docs/G3_6_PILLOW_SHADOW_2026-10-10.md and docs/evidence/g3/g3-6-shadow-pillow-cpu-proof.json. Issue #4 remains OPEN.
