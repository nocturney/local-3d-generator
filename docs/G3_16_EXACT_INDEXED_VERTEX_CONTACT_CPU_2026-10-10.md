# LOCAL3D G3.16 — exact ALL indexed single-vertex contact census (CPU)

2026-10-10 | Release: v0.2.16-g3-exact-indexed-vertex-cpu

**Scope:** Exact binary-float rational triangle-triangle geometric contact classification for EVERY pair of faces sharing exactly ONE original indexed vertex within the four licensed, PREVIOUSLY EXISTING GLBs. This is NOT a global exact intersection certificate, real-world CAD dimensional check, print release, GPU inference, cloud model run, or printer action.

## Gate addressed

G3.14 independently enumerated 294,495 numerical AABB-overlap candidate pairs on the previously generated 40,352-triangle TripoSR orb. Exactly 190,860 of those share one indexed vertex (but NO indexed edge); G3.10 previously offered only numerical local risk screens for some adjacency patterns. G3.15 subsequently classified all **60,528 full-indexed-shared-edge pairs** exactly. The 190,860 vertex-only class required an independent mathematically rigorous test distinguishing normal point contact from true additional geometric overlap.

New CPU-only reusable module: engines/quality/exact_indexed_vertex_contact.py.

### Geometry, exact predicate, mathematical scope

1. Validate bounded finite decoded XYZ and integer original face indexes, no duplicate face triples, no degenerate triangles, and safe numeric input range. Real GLB reading requires a single connected closed, consistently wound indexed manifold and verified SHA/rights.
2. Build original **vertex -> incident face** lists. For each incident vertex, visit every unordered pair of incident faces; exclude any pair sharing another original vertex (full-edge pair). This enumerates each EXACTLY one-vertex-index face pair **once**, independently of G3.14's SciPy sphere/AABB spatial index. All exactly shared-index-vertex triangles geometrically share that point and therefore must have overlapping bounding boxes.
3. Convert original decoded IEEE-754 XYZ values to Python Fraction exact rationals; calculate exact per-face normals ONCE (not approximate normalized floating normals), and all pairwise signed orientation tests are exact on these decoded digital coordinate values.
4. **Noncoplanar** triangles: supporting planes intersect on a line through the shared indexed vertex O. A triangular wedge restricted to the other plane is either only O or a nonzero finite ray-segment with endpoint determined by exact signed plane distances of its two other vertices; compare exact signed directions relative to cross(normalA, normalB). Same nonzero ray sign on both implies shared positive-length line segment BEYOND O; opposite/no ray means vertex-only contact. Zero/inconsistent determinants are rejected, not silently accepted.
5. **Coplanar** triangles: project exact rationals to a nondegenerate 2D axis plane and apply exact rational convex polygon clipping (existing independently tested G3.13 primitive). Distinguish positive AREA intersection; zero-area positive-LENGTH segment beyond O; or normal vertex-only contact. This captures coincident edge-like overlap even when those physical positions have different indexed vertex IDs.
6. All 0/1/2 shared-index classes are disjoint. This module checks ONLY class 1; G3.15 exact class 2, G3.14 numerical SAT class 0, with different and explicitly bounded guarantees. The evidence has no model- or manufacturing-wide selfIntersectionFree flag.

Resource limits: max 100,000 vertices, 75,000 triangles, 1,000,000 per-vertex incidence unordered-pair visits, 280,000 unique one-vertex triangle pairs, 90 seconds CPU, max abs coordinate 1e9 (arbitrary GLB units). Budget/time or input/degeneracy error fails closed, with INDETERMINATE or explicit QAError rather than declaring the geometry clear. No memory unbounded neighbor expansion.

**Decoded IEEE-754 exactness is NOT ideal CAD exactness:** output coordinates were already quantized/exported by the model. The result does not establish original material tolerances, physical mm wall thickness, watertight fabrication under a specific slicer, absolute part scaling, object supports or print safety.

## Provenance and real-geometry findings

The original synthetic project image and earlier approved genuine TripoSR model output remain private; no AI inference was rerun. The historical G2 successful source job, image, output GLB, QA assets, license manifest and four pinned GLB SHA values are independently crossvalidated by the G3.15 trusted provenance reader. Original G3.7 winding-only derivative must match the original face geometry census exactly. G3.16 must also match G3.14's earlier exact indexed-adjacency COUNT; no broadphase hit can be silently lost.

| Existing model | Faces | All indexed vertex-only face pairs | G3.16 exact classification | Exact extra contact beyond shared vertex |
|---|---:|---:|---|---:|
| Historical real TripoSR 01-orb-alpha | 40,352 | **190,860** | every pair, exact digital geometry | **0** |
| Same-surface G3.7 winding derivative | 40,352 | **190,860** | same exact counts | **0** |
| Project-original procedural GT sphere | 1,280 | **5,730** | all source pairs | **0** |
| Historical licensed MIT chair derivative | 19,972 | **92,629** | every pair, exact digital geometry | **0** |

The real orb and unchanged-surface derivative have no extra noncoplanar positive-length line contact or coplanar extra line/area overlap within this exact one-index class. The historically licensed chair is an independent additional source; its counts and any diagnostics are in the public immutable evidence, not a new quality claim. All models remain **DRAFT**, printQualified=false. Zero vertex-only extra contacts does **NOT** mean the complete mesh has no intersections.

Evidence: [G3.16 sanitized four SHA-provenance exact-contact counters](evidence/g3/orb-01-g316-exact-indexed-vertex-only.json). Raw private models, source image, prompts, job UUIDs and exact flagged triangle index examples NEVER enter Git; immutable per-model full reports remain in the previously gitignored private runtime area.

## Tests, reproducibility and safety

18 new G3.16 Python adversarial controls cover positive-length NONCOPLANAR overlap on the shared support line, noncoplanar opposite-direction/one wedge absent vertex-only contact, strict boundary ray and tiny 2^-48 coordinate gap, coplanar positive area overlap, coplanar same-ray line overlap and opposite-wedge normal shared vertex, winding/index renaming invariance, manifold cube/icosphere normal adjacency, independent brute-force topology count comparison, GT/real-chair GLB source SHA, duplicate/invalid/degenerate inputs, absolute bounded time/incidence/pair resources and immutable evidence. The synthetic positive controls deliberately trigger both line and AREA alerts; real source zero candidates is not achieved by a globally inert detector.

Additional Node tests assert the G3.14 AABB indexed vertex-only count equals G3.16 independent topology census, SHA provenance remains identical to G3.15, candidate partition equals total, and public proof excludes private UUID/file/face pairs. Full prior Node/Python/Chrome regression is performed before committing or tagging.

No new package, weight, system networking configuration, Windows policy, Office 2.0 API, external GPU lease or model runtime was installed/touched. No print qualification or Fabrication Router writes.

From D:\Velvet\Projects\local-3d-generator using the EXISTING pinned LOCAL CPU interpreter:

    runtime\engines\triposr\venv\Scripts\python.exe -m unittest discover -s engines\quality -p test_g316_exact_indexed_vertex_contact.py

Replay previously generated SHA-pinned source assets in **read-only** mode (operator already possesses the ONE historical real source job identifier; do not place it in Git):

    runtime\engines\triposr\venv\Scripts\python.exe scripts\g3-16-vertex-replay.py --job-id <EXISTING_COMPLETED_PRIVATE_ORB_JOB_UUID>

The one-time immutable private evidence generation used --prepare-private --write-public; subsequent read-only replays refuse any input/model SHA drift or changed public evidence. It does not initiate model inference.

## Still OPEN: global and manufacturing/security gates

This release has exactly analyzed all indexed shared-edge pairs (G3.15) AND indexed vertex-only pairs (G3.16) **for the already decoded model**, but it still has only a conservative **numerical SAT** G3.14 contact screen for the **43,107 nonindexed AABB-overlap pairs**. To claim exact global decoded-GLB self-intersection status, nonindexed pairs need a separately independent complete exact contact/overlap classification, including coplanar/near-boundary cases and coordinate precision assumptions, under CPU/time fail-closed handling.

Other blocked gates: physical millimeter scale and minimum wall thickness, duplicate-shell/deep occlusion/component semantics, watertightness under target slicer/export, material/strength/support validation, user-untrusted image/GLB parser filesystem+network sandbox and Python OSV advisory triage (#4). Real AI image-to-3D coverage remains **2/9 historical**, seven fixtures require fresh per-image GPU consent. Issues #3/#4 both OPEN; no print release. No modifications to Office, service 4178, global Windows security, cloud, model weights or printers.

**Next proposed G3.17:** expand from G3.14 complete numerical no-index AABB overlap *candidate* enumeration to CPU bounded independent exact rational robust contact classification for those **43,107 prior orb pairs**. Only after combining mutually exclusive indexed edge/vertex/nonindexed classes and independent QA can a strictly scoped decoded-geometry no-contact statement be considered; manufacturing/physical precision stays separately blocked.
