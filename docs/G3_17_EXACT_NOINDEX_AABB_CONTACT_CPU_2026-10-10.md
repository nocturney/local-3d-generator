# LOCAL3D G3.17 — exact rational contact on every numerically selected NO-INDEX AABB candidate (CPU)

2026-10-10 | Release: v0.2.17-g3-exact-noindex-aabb-cpu

**Scope:** Independently enumerate all numerical AABB-overlapping triangle pairs, then classify every pair that shares **NO original indexed vertex** with an exact rational triangle-triangle contact predicate. Entirely CPU-only, no inference, no cloud, no model weights install, no printer. **Not** a formal arbitrary-precision all-face-pair broadphase/mesh no-contact proof and **not** physical millimeter/3D printing quality certification.

## Why the last index-adjacency class needed independent exact predicates

Prior G3.14 independently counted all conservative numerical AABB candidates for four SHA-pinned already existing licensed GLBs. G3.15 classified **all full shared-indexed-edge pairs** under exact decoded-GLB IEEE754 arithmetic. G3.16 classified **all exactly one-shared-index vertex-only face pairs** under exact decoded-GLB arithmetic. Remaining G3.14 category 0: numerically overlapping AABB pairs of faces that share NO original indexed vertex. The historical G3.8/G3.14 approximate SAT tests returned zero numerical potential contacts in this group, but numerical SAT is not exact near degenerate boundaries, coplanar overlap or tiny intersections. G3.17 closes **exact pairwise narrowphase for these enumerated candidates**, without claiming full physical precision or a universal exact spatial-index guarantee.

New CPU module: engines/quality/exact_nonindexed_contact.py.

### Independent candidate enumeration

1. Decode the prior SHA-pinned GLB indexed mesh; require one connected manifold with closed, consistently wound faces, finite valid triangles and no duplicated face-index triples. This is trusted-local-source-only, not untrusted image/mesh parsing approval.
2. Compute each face's exact (as decoded float) coordinate min/max 3D AABB. Enclose the ENTIRE AABB with a midpoint+half-diagonal sphere, query SciPy cKDTree using a conservative radius including maximum other box half diagonal and a declared tolerance. Use eps=0 / workers=1 and include only ordered j greater than i, then recheck all three numerical interval overlaps. The tolerance is max(1e-12, bounding-diagonal * 1e-9), in arbitrary GLB units; box-sphere guard has a separate floating-precision cushion.
3. Independently partition every AABB candidate into exactly 0/1/2 common original indexed vertex IDs and crosscheck those counts against previously pinned G3.14 independent proof. Only category zero is sent to the new exact narrowphase. Per-mesh budgets include max 75,000 faces, 100,000 vertices, 2,000,000 sphere candidate pairs, 750,000 numerical AABB candidates, 300,000 0-index exact pairs and 120s CPU. Input/budget/time failure remains INDETERMINATE or explicit QAError.

**Completeness boundary:** this reproduces all **numerically selected conservative 3D AABB candidates**, not a mathematical proof that an arbitrary floating-point spatial index can never omit any geometry under all magnitudes and precision models. Exact pair arithmetic below applies only to returned candidates, not to unspecified other face pairs.

### Exact nonindexed triangle-pair predicate

The pair classifier uses Python Fraction based on ALREADY DECODED binary-float vertices, never approximate plane-sign thresholds:

- If the two supporting planes have parallel normals, test exact signed plane separation. Different planes => disjoint. Same exact plane => exact 2D convex triangle-triangle polygon clipping, distinguishing empty intersection, single geometric point, positive-length boundary segment and **positive-area coplanar overlap**.
- Otherwise planes intersect along a precise mathematical line. Intersect each triangle with the other support plane by exact rational signed vertex distances and exact edge interpolation. Each finite triangle yields 0, 1 or 2 distinct points (a point or line segment). Project the two resulting collinear sections on the exact cross-normal direction, and compare rational signed intervals. The overlap is exactly none, one point, or a **positive-length noncoplanar segment**.
- Reject exact degenerate face or inconsistent plane section instead of quietly labelling it collision-free; preserve private example indexed triangle IDs only in the ignored local runtime evidence.

The exact classifier can detect deliberately constructed actual noncoplanar crossing, near-coplanar tiny 2^-40 numerical displacement, positive area coplanar penetration, shared-position but DIFFERENT-index boundary segment and vertex-only point contact; those cases are not all labelled disjoint.

### SHA-verified PREVIOUS source results

| Previously existing licensed GLB | Faces | All conservative AABB pairs, categories 0/1/2 | Exact tested category 0 | Exact disjoint | Any exact point/line/area contacts |
|---|---:|---:|---:|---:|---:|
| Genuine prior TripoSR 01-orb-alpha | 40,352 | 294,495 | **43,107** | 43,107 | **0** |
| Same-surface G3.7 winding-only derivative | 40,352 | 294,495 | **43,107** | 43,107 | **0** |
| Project-owned procedural sphere GT | 1,280 | 7,866 | **216** | 216 | **0** |
| Historic licensed MIT chair derivative | 19,972 | 151,180 | **28,593** | 28,593 | **0** |

Orb complete 294,495 numerical AABB candidates = 60,528 indexed-edge + 190,860 indexed one-vertex + 43,107 no-index. GT complete 7,866 = 1,920 + 5,730 + 216. Chair complete 151,180 = 29,958 + 92,629 + 28,593. The exact narrowphase finds no 0-index face contacts within these fully enumerated NUMERICAL candidate sets. The real orb and only-winding-reversed copy yield identical geometry counts. This does NOT establish ideal original CAD exact mesh collision freedom, absolute mm geometry, or print qualification.

Four real/prior GLB source SHA256, actual G2 historic completed source image/job/QA assets, project rights manifest, G3.14 independent counts, G3.15 full-edge counts, G3.16 vertex-only counts and public evidence are crossvalidated. No new neural job, image, private prompt, model or private job UUID is published. Public [G3.17 sanitized four-source SHA evidence](evidence/g3/orb-01-g317-exact-noindex-aabb-pairs.json); private immutable classification details and example face indices stay in gitignored runtime only.

### Adversarial controls, instructions and remaining gates

15 new Python G3.17 tests exercise strict 3D line crossing, coplanar interior area overlap, coplanar positive-length boundary segment, single-point touch, truly disjoint despite overlapping AABB, icosphere AABB index 0/1/2 brute-force independent counts, exact plane separation, tiny 2^-40 crossings, invalid resource/degenerate input, fail-closed all budget gates, winding and permutation invariance, previously licensed GT and historical chair SHA, and immutable evidence refusal. 3 Node tests enforce SHA lineage through G3.14/G3.15/G3.16, four model per-category totals, source privacy and zero print release claims. Full pinned G2/G3/Chrome regression is required prior to release.

CPU-only reproducibility from the existing Windows Chris checkout without touching inference runtime:

    runtime\engines\triposr\venv\Scripts\python.exe -m unittest discover -s engines\quality -p test_g317_exact_nonindexed_contact.py

Read-only four historic model proof using the privately known completed G2 job ID (never copy that UUID to Git, docs or chat status):

    runtime\engines\triposr\venv\Scripts\python.exe scripts\g3-17-noindex-replay.py --job-id <PREVIOUS_PRIVATE_COMPLETED_ORB_JOB_UUID>

First immutable private report and sanitized public JSON creation for those already licensed SHA hashes used --prepare-private --write-public; subsequent verification replays are READ-ONLY and refuse drift. No model calls, GPU/cloud/printer actions or engine upgrades.

**Remaining:** Physical millimeter dimensional calibration, wall thickness and minimum printable feature checks, inter-shell/material/strength/supports/slicer/power loss QA, and independently corroborated robust geometry kernel/whole-mesh spatial coverage, ideal CAD quantization assumptions. Also Python dependency advisory analysis and OS-backed confinement/no-network-escape for untrusted images and GLB parser (Issue #4); none is complete. Real AI benchmark inference remains **2/9** previous sources, seven pending distinct explicit GPU approvals. Issues #3/#4 remain OPEN. Every generated GLB remains **DRAFT**, printQualified=false, approvedForPrinter=false, fabricationAction=NONE.

Next G3.18: independent geometric/spatial mesh candidate completeness audit (ideally exact axis-boundary or alternative kernel broadphase) and explicit self-contact policy for decoded GLB vs ideal CAD; then physical scale and wall-thickness gate, security triage/sandbox. Do not equate four trusted decoded models with commercial/print suitability.
