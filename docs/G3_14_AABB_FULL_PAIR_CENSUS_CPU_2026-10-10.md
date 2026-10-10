# LOCAL3D G3.14 — independent AABB all-candidate census (CPU only)

Date: 2026-10-10 | Version: v0.2.14-g3-aabb-census-cpu

**Scope:** Exhaustive **numerical AABB-overlapping face-pair enumeration** for four PREVIOUSLY existing SHA-pinned GLBs. This does NOT certify absence of robust triangle intersection, safe wall thickness, correct millimeter dimensions, or printing. No CUDA, model inference, cloud, weights install, printer, slicer or Office changes.

## What changed and why

Prior G3.8 used a face centroid / triangle circumsphere broadphase, followed by AABB, excluding any indexed-vertex-adjacent faces from SAT. G3.10 and G3.11 separately examined only specific indexed-adjacency risk indicators; G3.12 screened coincident different-index vertex positions. G3.13 added exact-rational IEEE-754 triangle-pair predicates but only on deliberately chosen pairs.

New CPU module engines/quality/aabb_pair_census.py independently encloses **each complete 3D AABB** in a box-center + half-diagonal sphere, queries a SciPy cKDTree with a conservative radius, and then checks all three numerical AABB intervals. Every unordered pair found is partitioned into exactly 0, 1 or 2 original shared vertex IDs, never skipped just because of indexed adjacency. The proof of candidate completeness applies to finite already-decoded GLB coordinates under the declared AABB tolerance; it is NOT a proof that floating-point SAT perfectly classifies all microscopic intersections.

For each nonindexed (zero shared-vertex-ID) AABB pair the module reruns the established numerical SAT, in full. Any SAT-positive candidates are forwarded to G3.13 exact binary-float arithmetic, with a 64-pair cap; otherwise the exact stage is not invoked. Indexed-adjacent candidate pairs remain **NOT globally exact-intersection cleared**, and all outputs remain DRAFT.

Resource caps: 75,000 triangles, 100,000 vertices, 2,000,000 bounding-sphere pairs, 750,000 AABB overlaps, 300,000 no-index SAT pairs, at most 64 SAT-positive exact pair refinements, and 45 seconds per source scan. Any incomplete budget or timeout is INDETERMINATE, never accepted as completed clearance. AABB margin is max(1e-12, object-diagonal*1e-9), in ARBITRARY GLB UNITS, not physical millimeters.

## Actual previous licensed real model findings (all CPU)

| Count | G3.8 original orb | G3.14 original orb |
|---|---:|---:|
| AABB overlaps after broadphase | 294,413 | **294,495** |
| Nonindexed AABB pairs numerically SAT-screened | 43,025 | **43,107** |
| Shared full indexed edge AABB pairs | excluded from SAT | **60,528** |
| Shared exactly one indexed vertex AABB pairs | excluded from SAT | **190,860** |
| Possible no-index numerical SAT contacts | 0 | **0** |
| Full global robust self-intersection-free certification | No | **No** |

The **82 additional conservative AABB overlaps** are not confirmed triangle collisions. They were absent from G3.8's earlier triangle-centroid/circumsphere filtered set, but all are numerically SAT-negative at the current tolerance. AABB overlap is necessary, NOT sufficient, for triangle surface intersection; the additional candidate coverage does not establish that G3.8 missed a true intersection.

The unchanged G3.7 reversal copy produces identical G3.14 counts, as it has identical 3D positions and face graph. Project-original procedural GT (1,280 triangles): 7,866 total new AABB candidate pairs = 1,920 edge-indexed + 5,730 vertex-only + 216 no-index, with zero numerical no-index SAT candidates. Earlier G3.8 used 7,650 filtered GT pairs. An earlier licensed real MIT chair copy was also examined. All four model SHA hashes and existing original G2 image/model asset provenance were verified; the published report contains only hashes and aggregated counts, not raw models or private identifiers.

Original real orb model SHA256:
f37a812bc4414ddee34bcb19d2e7535f25d219a3731c14f2dcc89c2c7ba030e2
G3.7 same-surface winding derivative:
ab2e5aeb55598624209eeca3e700abef93a69a52886c63ecad6a840e62d8d68f
Original procedural GT:
c8834b2668210e58a73ff8b2ab3bcf2d0bc5d2df9a09b3dd0313b425b3664749
Previous chair copy:
48ee912229ad73fcbda1a6b455dbcc39d396bdf2c752ccabc90a29097b09b6ec

See [immutable sanitized SHA evidence](evidence/g3/orb-01-g314-full-aabb-census.json) for all four result summaries. Private GLBs, image, job UUID, paths, model checkpoints, face pair indices, per-run private JSON and prompts remain local/ignored.

## Verification and reproducing on Chris

12 G3.14 Python controls cross-check independent AABB enumeration against brute-force O(n²) on small indexed examples, including (i) all 0/1/2 shared-index classes; (ii) definite nonindexed piercing and coplanar area overlap routed to exact arithmetic; (iii) legitimate shared-edge contact; (iv) icosphere; (v) expected extra GT AABB candidates; (vi) 2-million broadphase/750k AABB/300k SAT/64 exact/time budget fail-closed; (vii) corrupt input; (viii) immutable evidence. Public Node tests additionally verify source SHA lineage and no sensitive data.

The first *private* evidence preparation has already been completed for these four source hashes. Subsequent read-only verification from D:\Velvet\Projects\local-3d-generator:

    runtime\engines\triposr\venv\Scripts\python.exe scripts\g3-14-aabb-replay.py --job-id <EXISTING_COMPLETED_LOCAL_REAL_JOB_UUID>

The one-time immutable proof constructor, which refuses divergent evidence, accepts --prepare-private --write-public and was used only with the previously completed local job ID. No command ever regenerates a model.

## Gates still open

G3.14 is an independent completed **conservative numerical broadphase census**. It does not offer all-pair exact penetration classification or distinguish every legitimate adjacent contact from extra overlap. G3.13 selected-pair exact arithmetic cannot be extrapolated to millions of unexamined pair combinations. Float rounding and original GLB quantization, coplanar degeneracies, multi-scene overlapping objects, arbitrary unit scale, minimum real wall thickness, structural mechanics, supportability and real-world slicer/printer QA remain unverified.

GitHub Issues #3 and #4 remain OPEN. Private actual AI inference coverage is still **2/9**, and the remaining 7 fixtures cannot run without fresh per-image explicit consent. No security policy change, isolated runtime patch, Office resource use or printer command occurred. printQualified=false; approvedForPrinter=false; fabricationAction=NONE.

Next: independently classify extra geometric contact for indexed shared-edge and indexed single-vertex pairs with robust exact predicates and explicit proper topological semantics; treat ambiguous/over-budget results as unresolved rather than clearance. Consider independent geometry kernel validation and physical scale/walls only under separate gates.
