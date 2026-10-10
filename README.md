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
- Current v0.2.15 CPU-only full regression on Windows Chris: **89/89 Node**, **137/137 pinned Python** (7 G2, 130 G3), **8/8 G1 Chrome** and **8/8 G2/G3 mock Chrome** phases. The earlier G3.6 Pillow shadow experiment independently covered its THEN-existing 23 Python tests and is NOT automatically re-certified for newer suites. The historical licensed CUDA chair and one previously separately authorized orb inference remain the ONLY two real completed AI outputs of nine benchmark sources. **Normal npm tests and G3.12 diagnostics never execute model inference or allocate CUDA.**

## G3.15 — exact geometrical classification of ALL indexed shared-edge pairs (v0.2.15)

New CPU-only [G3.15 exact shared-edge contact proof](docs/G3_15_EXACT_INDEXED_EDGE_CONTACT_CPU_2026-10-10.md) goes beyond the narrow G3.11 numerical backfold screen and the G3.13 selected-pair exact sample. It classifies ALL **60,528 indexed full-edge-adjacent face pairs** of the PREVIOUSLY generated real TripoSR orb with exact rational arithmetic on **already decoded IEEE-754 GLB coordinates**. Each pair is mathematically checked for noncoplanar expected edge-only contact, coplanar opposite-side edge-only contact, or coplanar same-side positive-area overlap. Real orb, unchanged winding-only copy, project source GT and historical chair all completed with **0 exact coplanar same-side shared-edge overlaps**; normal cube corners and normal touching edges are not marked defective. This does **NOT** certify indexed one-vertex extra ray contacts, nonindexed floating SAT negatives, original CAD/mm dimensions, wall thickness or printing. [Sanitized SHA evidence](docs/evidence/g3/orb-01-g315-exact-indexed-edge.json). No CUDA, model inference, cloud or printer involved.

## G3.14 — independent exhaustive numerical AABB-pair coverage (v0.2.14)

New CPU-only [G3.14 full AABB candidate census](docs/G3_14_AABB_FULL_PAIR_CENSUS_CPU_2026-10-10.md) independently encloses each TRIANGLE BOUNDING BOX in a conservative sphere, enumerates all numerical AABB-overlapping unordered face pairs and splits them by shared indexed vertices: none, exactly one or full edge. All zero-index pairs are rerun through the existing numerical SAT; only SAT positives are routed to bounded G3.13 exact pair predicates. **This is numerical candidate enumeration, NOT global exact self-intersection clearance.** The real previously generated 40,352-face orb has **294,495 AABB candidates**, including 60,528 shared-edge, 190,860 one-vertex and 43,107 no-index; **0 numerical no-index SAT positive candidates**. This independently broadens earlier G3.8 filtered AABB counts by **82** possible overlapping boxes, NOT by 82 proven real mesh defects. Four original SHA-pinned real/reference sources validated without any new inference or printing. [Public sanitized counts](docs/evidence/g3/orb-01-g314-full-aabb-census.json). G3 #3 and security #4 remain OPEN.

## G3.13 — exact-binary-float triangle PAIR predicates, selected pairs only (v0.2.13)

Added a bounded pure-CPU exact-rational predicate for **explicitly selected pairs of triangles**. It detects strict noncoplanar interior edge-piercings, coplanar positive-area overlaps and definite plane separation; zero/borderline exact determinants are UNRESOLVED. The exactness applies ONLY to the IEEE-754 coordinates **already decoded from GLB**, not true CAD/mm precision. This is a reusable primitive **not a full-mesh broadphase or self-intersection-free certificate**.

19 new adversarial Python tests passed. A SHA-locked proof on FOUR previously existing licensed GLBs checked exactly **24 chosen indexed shared-edge face pairs per model**: all 24 in each are **unresolved legitimate shared-edge contacts**, NOT 24 defects or a clearance of untested pairs. No fresh GPU, reconstruction, cloud or printer actions. [G3.13 scope](docs/G3_13_EXACT_SELECTED_TRIANGLE_PREDICATES_CPU_2026-10-10.md) · [Sanitized selection-only evidence](docs/evidence/g3/orb-01-g313-selected-exact-pair-predicate.json).

## G3.12 — different-index spatial vertex proximity (v0.2.12)

New offline CPU-only [G3.12 spatial index screen](docs/G3_12_SPATIAL_INDEX_PROXIMITY_CPU_2026-10-10.md) examines the gap left by G3.8–G3.11: vertex IDs that are distinct in indexed topology but occupy exactly the same or nearly the same XYZ position, and whether such vertices belong to different indexed components. **All four previously existing SHA-verified models passed the bounded census**; the real TripoSR orb (20,178 vertices), winding-only copy, GT sphere and prior chair have **0 different-index exact/near spatial pairs** within 1e-7 × their own AABB diagonal. Positive controls detect actual touching disconnected shells; dense-neighbor/pair limits are **INDETERMINATE**, never false clearance. This is not a complete face-intersection test, mm-scale measurement or manufacturing gate. [Immutable sanitized evidence](docs/evidence/g3/orb-01-g312-spatial-index-proximity.json). No new GPU inference, installation or printer access.

## G3.11 — shared-edge planar backfold risk on real orb (v0.2.11)

G3.11 checks a further geometry case not covered by the earlier adjacent-edge angle histogram: **triangles sharing the SAME complete indexed edge** whose third vertices are on the same lateral side AND nearly coplanar, potentially overlapping beyond their expected common edge. All 60,528 indexed edge-adjacent pairs in the previously generated actual `01-orb-alpha` TripoSR model and copy-only winding reversal were screened, with **0 same-side coplanar overlap candidates, 0 near-antiparallel >=175° or suspicious same-side >=150° backturns**. The original procedural GT and historical chair derivative were independently screened too.

The accompanying tests recognize deliberately coplanar overlapping triangle fixtures and avoid mistaking legitimate flat seams or intentional sharp cube corners for defects. **This remains a numerical CPU diagnostic, NOT an exact self-intersection-free or print-qualification certificate.** Coplanar numeric tolerance, mm scale, wall thickness, material strength and full collision/proximity remain open. [Method and limitations](docs/G3_11_EDGE_BACKFOLD_CPU_2026-10-10.md) · [Sanitized real-model proof](docs/evidence/g3/orb-01-g311-edge-coplanar-screen.json). No new GPU inference or printer actions.

## G3.10 — vertex-only additional contact-ray screening (v0.2.10)

G3.10 extends the CPU-only diagnostic series to triangle pairs that share **exactly ONE vertex but not an edge**. On the prior genuine TripoSR `01-orb-alpha` model and its non-destructive winding-only copy, all **190,860 unique vertex-only pairs** per model were analyzed for a possible **extra nonzero common ray beyond the ordinary shared vertex**, with 0 candidates flagged and 0 near-coplanar unresolved cases at the configured numerical tolerances. Known procedural GT and the earlier real chair derivative are additional CPU controls.

This is **not mathematical proof of no self-intersections or readiness to print**: the algorithm does not certify coplanar/near-zero numerical edge cases, coincident coordinates with different vertex IDs, true edge-adjacent foldover, physical wall thickness, scale in millimeters, materials or slicer suitability. The difference between a normal shared-vertex contact and additional overlap is explicit; uncertainty and resource exhaustion never produce a false clearance.

[**G3.10 full CPU method**](docs/G3_10_SHARED_VERTEX_CPU_2026-10-10.md) · [Sanitized SHA-linked real-model results](docs/evidence/g3/orb-01-g310-shared-vertex-ray-screen.json). Normal workflow does not allocate GPU or modify model files. The independent local model-output ledger remains 2/9 real completed cases (7 require fresh per-image authorization).

## G3.9 — indexed edge-adjacent normal-angle diagnostic (v0.2.9)

Following G3.8's nonadjacent-triangle conservative SAT contact screen, G3.9 now assesses **all 60,528 EDGE-adjacent face pairs** of the one previously generated actual 01-orb-alpha TripoSR mesh. Adjacent surface-normal angle p95 is **33.019°**, with 312 edges above 45° and none above 90°. The 1,280-triangle original procedural GT's p95 is **5.732°**, but their very different mesh densities make these percentages unsuitable as calibrated 3D prediction accuracy or physical finish metrics.

The TripoSR original and copy-only winding-fixed derivative produce **identical results**, confirming that orientation reversal did not remove the visible roughness. Sharp edges can be legitimate (e.g. a cube); pairs sharing only one vertex, true geometric foldover, wall thickness, mm dimensions, strength and print readiness are NOT resolved. All records are DRAFT. [Detailed CPU proof and limits](docs/G3_9_ADJACENT_FACES_CPU_2026-10-10.md) · [sanitized angle statistics](docs/evidence/g3/orb-01-g39-adjacent-angles.json). CPU-only independent replay operates on existing local model files, without GPU/AI or printer. Private inference coverage stays 2/9.

## G3.8 — real orb CPU-only contact risk and radial irregularity (v0.2.8)

G3.8 screens the genuinely completed `01-orb-alpha` TripoSR GLB and the previous copy-only orientation derivative for possible **non-vertex-adjacent triangle surface contacts**, using strictly bounded local CPU computation. Both 40,352-triangle versions completed an examination of **43,025 eligible triangle pairs**, with **0 potential contacts flagged**. Crucial caveat: adjacent triangles (251,388 AABB candidate pairs in each) are excluded, and the floating-point screen cannot prove absence of all intersections; printing is **still blocked**.

A second CPU-only diagnostic takes 4,096 area-weighted points from the procedural source sphere and from the previously generated TripoSR orb, fits each its own normalized best-fit sphere, then reports relative mean radial deviations of **0.0625% source vs 4.974% AI output**. This illustrates shape nonroundness, not any percentage of 3D-image accuracy, physical millimeter deviation, measured surface finish or an automatic smoothing pass. The previous winding correction makes no shape improvement.

[**G3.8 engineering method and limits**](docs/G3_8_ORB_CPU_RISK_2026-10-10.md) · [G3.8 sanitized CPU proof](docs/evidence/g3/orb-01-g38-cpu-risk-screen.json). Private results are read-only reproducible from the completed local job; no GPU, new image, printer or cloud is involved. The private original/model-output ledger stays **2/9** (historic chair + real orb) with seven pending. New model GPU authorizations are still individual.

## G3.7 — true orb model, copy-only winding and local visual verification (v0.2.7)

A genuinely generated TripoSR result now exists for the first project-original G3 fixture, **01-orb-alpha**. Its one-time authorized inference took 12.59s and produced a SHA-verified 808,092-byte GLB, 20,178 vertices and 40,352 triangles. Independent CPU QA found a **watertight but inward-facing** mesh, with negative signed volume.

G3.7 corrected **ONLY triangle winding** in a separate private/ignored copy and independently proved that vertex positions, per-vertex colors and individual triangle geometry were preserved exactly. The corrected copy has positive signed volume, but BOTH versions remain DRAFT/NOT PRINT QUALIFIED: physical dimensions, self-intersections, wall thickness and structural/material safety are untested. The reconstructed orb visibly contains surface roughness not present in the smooth procedural GT; the winding-only correction does not smooth it.

[Three-way true GLB software preview](docs/evidence/g3/orb-01-threeway-preview.png) · [G3.7 CPU evidence and safety gates](docs/G3_7_ORB_WINDING_CPU_2026-10-10.md) · [Sanitized QA/provenance](docs/evidence/g3/orb-01-cpu-quality-milestone.json). **All G3.7 computation used CPU/software-rendering; zero new inference, printer actions or Office changes.**

The private SHA-verified local benchmark now includes **2/9 real model outputs** (old MIT chair + new 01 orb), while the published fixed historical snapshot remains **1/9 by design** and is not an automatically refreshed live counter. Seven licensed fixtures still await explicit per-image GPU approval. Private GLB files stay gitignored.

## Windows source-owner Git hotfix — resolved for interactive CHRIS

An approved single-image `01-orb-alpha` G3 trial failed at the worker's first `verify_sources` step because the source checkout belongs to Windows SYSTEM but interactive CHRIS Git refused it as dubious ownership. **This run consumed its one-use permit but created no GLB.** The initial CPU-only source integrity tests under the connected system account passed, but the interactive-user run identified the trust boundary.

The patched TripoSR worker now passes an **exact, command-local Git safe.directory** only for two pinned read-only source metadata commands; it still checks clean source/expected commit and all downloaded-model SHA256 values. No global Git settings were modified. The interactive-user CPU-only proof **passed in CHRIS**, and a **new, separately authorized single-image 01-orb-alpha GPU run** subsequently completed; the earlier failed v0.2.4 approval remains spent and must never be reused.

## G3.4 — one-click CPU benchmark review after manual inference (v0.2.4)

Completed manually approved G2 jobs whose image SHA matches one of the nine licensed G3 reference inputs now show **"השוואת G3 (CPU)"**. A click runs the pinned, offline local Python scorer once and exposes a downloadable benchmark-shape.json. It validates the source, output model, QA and pinned model provenance, and is always NOT PRINT QUALIFIED. The ninth upstream chair has no actual original 3D ground truth, so the report states **NO_GROUND_TRUTH_3D** rather than a fictional 3D accuracy score. Changing a source image still revokes GPU consent.

G2 adapter now records **optional shared-host NVIDIA used/free/utilization observations** on future manually approved actual inference runs, explicitly separated from PyTorch's peak CUDA reserved memory; neither is an exclusive VRAM measurement. The actual CPU reviewer passed an end-to-end localhost proof using the **historical G2 chair GLB**, with zero new inference. The model-accuracy benchmark is still **1 historical model observed and 8 licensed sources not inferred**.

Read [G3.4 operator and measurement protocol](docs/G3_4_CPU_REVIEW_TELEMETRY_2026-10-10.md) and [prior CPU proof](docs/evidence/g3/g3-4-existing-chair-cpu-proof.json). Still no automatic model queue, second provider, OS isolation or printer release.

## G3.3 — measurable 3D shape comparison and ready-to-load test images (v0.2.3)

The G3 reference catalog can now be opened directly inside the Hebrew image input via **טען תמונה לטופס בלבד**. It loads one of nine licensed PNG inputs but **NEVER starts a job or allocates GPU**. Selecting/replacing/clearing any source image invalidates prior GPU consent, so real G2 jobs still require a fresh checkbox approval **per image**.

A CPU-only, reproducible [3D shape-distance evaluator](docs/G3_3_SHAPE_EVALUATION_2026-10-10.md) compares completed local models to the eight original synthetic source geometries after independent scale normalization and best-of-eight yaw search. Eight identical source/self controls and four deliberately wrong-shape controls prove the diagnostic responds to gross shape changes; they are NOT new AI results. The ninth upstream chair has no original 3D reference and receives no fake 3D fidelity score.

Run **npm run score:g3 -- --job-id <full-job-uuid>** only after explicitly approving and completing a manual TripoSR image job; it validates source/model/QA SHA and saves the shape score to gitignored private runtime. Optional private benchmark collector joins verified metadata without presenting it as independently verified GPU execution. **Public historical coverage remains 1/9; eight new inputs are still not inferred.** No print qualifications or new GPU model runs were introduced.

## G3.2 — benchmark coverage and shared GPU protection (v0.2.2)

Local-first safety now includes an atomic GPU lease across multiple manually started LOCAL3D Node servers, in addition to the original in-process/Office/NVIDIA guards. If another G2 server owns the lease, a new GPU request is rejected (409) without scheduling the job. After a crash, locks are **not automatically cleared**. Inspect with npm run audit:g3:gpu-lock; do not bypass it without checking for worker processes.

A read-only, SHA-verified [nine-source benchmark coverage snapshot](docs/evidence/g3/benchmark-coverage.json) reports **1 previously observed real G2 chair result and 8 unrun images**, not nine AI successes. In the UI, the new G3 QUALITY BENCHMARK panel shows these historical results, never a GPU trigger. npm run benchmark:g3 reproduces the public snapshot; an optional --jobs-dir flag writes only to gitignored private runtime. npm run audit:g3:storage reports existing job storage size/age without deleting anything.

See [G3.2 security + operations](docs/G3_2_SAFETY_BENCHMARK_2026-10-10.md). Still no print certification, multi-user OS sandbox, second provider installation or automatic benchmark run.

## G3 preview — CPU geometry quality checks (no new GPU inference)

A new manual **סריקת רשת (CPU)** button on completed TripoSR jobs runs independent topology inspection in the local isolated Python environment. It checks GLB source SHA, connected components, open/nonmanifold edges, signed volume, winding and face quality; exposes a separate downloadable **geometry-qa.json** asset, with explicit unknown real-world units and wall thickness. It NEVER print-qualifies a model.

A reproducible **9-fixture benchmark source catalog** is available under [benchmarks/g3](benchmarks/g3/README.md): 8 project-original synthetic image/mask/source-3D triples plus the already-licensed upstream chair photo and mask. At the original G3 preview checkpoint, no new synthetic image had been inferred; G3.7 now documents ONE real previously authorized TripoSR orb output, leaving seven original inputs unrun. Exact-source-camera positive controls validate the silhouette scorer, not the AI. The previous real chair's signed volume was found to be **negative despite watertightness**. A separate CPU-only optional winding derivative preserves the original and still remains DRAFT.

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

## G3.5 — resource admission and dependency screening (v0.2.5)

Manual G2 jobs now fail closed **before** acquiring a GPU lease or saving a new image if verified storage thresholds are exceeded (development defaults: 8GiB stored, at least 3GiB remaining after a 128MiB prospective job reservation, at most 400 existing job folders). No private data is deleted, and G1 DEMO is unaffected. G3's topology and licensed-source benchmarking share a **single in-process CPU review permit** to avoid parallel CPU spikes; extra requests return 409 instead of queuing.

**Security limitation:** A read-only public OSV.dev screening of 34 pinned PyPI package versions found 104 advisory matches across Pillow, Transformers and PyTorch. This is NOT proof of exploitability in this pinned offline inference path, but it prevents a responsible production-security clearance without detailed triage and isolated dependency remediation. The manual G2 UI now explicitly warns to use **trusted image sources only**. npm audit of the pinned Node dependency tree returned 0 matches as of this checkpoint. No model packages were changed.

Read [G3.5 resource/supply-chain screening](docs/G3_5_RESOURCE_SECURITY_2026-10-10.md). Public evidence contains only sanitized counts, package names/versions and advisory IDs, never customer images or job IDs.

## G3.6 — verified Pillow shadow experiment (v0.2.6)

The original G2 model still uses **Pillow 10.1.0**. For security evaluation only, a separately staged Windows Python3.11 Pillow **12.3.0** candidate had a verified official PyPI wheel SHA-256 and zero version-level OSV advisory matches at the test time (previous Pillow 10.1.0 had 32). The shadow code passed **9/9 pinned source image CPU preprocess checks**, four synthetic edge tests, **23/23 existing Python unit tests** and an **import-only** pinned TripoSR/Transformers/Torch smoke. **No model checkpoint loading, CUDA inference, package replacement, Office interaction, or printing occurred.** This does not prove full model or commercial security compatibility, and does not address Transformer/Torch advisory matches.

More: [G3.6 detailed offline-shadow proof](docs/G3_6_PILLOW_SHADOW_2026-10-10.md), [sanitized SHA-locked result](docs/evidence/g3/g3-6-shadow-pillow-cpu-proof.json) and [v0.2.6 Node audit proof](docs/evidence/g3/g3-6-npm-audit-summary.json). GitHub Issue #4 remains OPEN for vulnerability-path triage and a separately approved fully isolated upgrade; the candidate is NOT enabled in normal LOCAL3D.
