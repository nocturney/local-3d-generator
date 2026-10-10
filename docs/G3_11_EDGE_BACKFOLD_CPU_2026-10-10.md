# LOCAL3D G3.11 — indexed shared-edge coplanar backfold risk, CPU only

Date: 2026-10-10 | Version: v0.2.11-g3-edge-backfold-cpu

**No GPU / AI inference, cloud use, printer export or customer media processing occurred in this milestone.** G3.11 only examines the previously genuinely authorized TripoSR 01-orb-alpha model, its G3.7 orientation-only derivative, project-original procedural ground-truth sphere and earlier licensed real chair derivative.

## Why this diagnostic is different

G3.8 screened triangles with NO shared indexed vertex; G3.9 measured face-normal angles over all SHARED INDEXED EDGES but could not detect geometry overlapping beyond those edges; G3.10 screened triangles sharing exactly ONE indexed vertex for non-zero extra common rays.

G3.11 checks actual SHARED-EDGE triangle geometry for a narrower and important special case: **coplanar triangles having their third vertices on the SAME side of the shared edge**. Two non-coplanar supporting triangle planes containing that edge can only intersect along their shared support line, not over a two-dimensional off-edge area. However, if the triangle planes become (near-)coplanar and both third vertices lie on the same lateral side of the shared edge, their interiors may overlap on an area beyond the legitimate shared edge. Nearly opposite face normals are a companion backfold indicator for consistently oriented triangles.

This is a *conservative numeric candidate screen*, NOT an exact proof that all shared-edge foldovers, self-intersections, or physical manufacturing defects are absent.

## Computation and guards

The new reusable, CPU-only \`engines/quality/edge_backfold_screen.py\`:
- Requires a single connected, consistently wound, watertight indexed mesh, no degenerate/duplicate faces, 0 boundary/nonmanifold indexed edges. The lower-level pair function allows intentionally open two-triangle fixtures for negative/positive unit controls.
- Uses the exact Trimesh indexed-face-adjacency map; requires that each pair shares precisely two vertex IDs and that the complete edge list on real closed meshes contains F × 3 / 2 face pairs.
- Computes the face-normal angular difference, the third vertex of each face's signed side relative to the shared edge in triangle A's plane, and its signed distance to triangle A's plane.
- Flags potential **same-side coplanar overlap** if both third vertices fall on the same side, the fourth point is within **10^-8 of object AABB diagonal** from the face plane, and the face normals are >=175° apart. Counts suspicious near-backtracking pairs with same side and normal differences >=150°. Nearly edge-collinear unresolved cases are tracked separately and are not passed as clean by inference.
- Bounded to 75,000 face triangles, 100,000 vertices and 120,000 shared indexed edges; input validation rejects invalid/degenerate meshes. No new Python dependencies.
- Reports no automatic mesh modification/smoothing, and always: \`completeMeshSelfIntersectionFreeCertified=false\`, \`printQualified=false\`, \`approvedForPrinter=false\` and \`fabricationAction=NONE\`.

These are **arbitrary model coordinates**, not millimeters or a physical print tolerance. A large normal angle alone can be a deliberate sharp folded aesthetic. Even if zero same-side coplanar candidates are found, numerical tolerance, duplicated spatial positions under different vertex IDs, other non-local surface defects, wall thickness and mechanical safety remain unresolved.

## Actual prior real-model results, independently reproduced

| Measure | Real TripoSR orb | Orientation-only copy | Original procedural sphere | Historic real chair copy |
|---|---:|---:|---:|---:|
| Face triangles | 40,352 | 40,352 | 1,280 | 19,972 |
| All indexed shared-edge face pairs | **60,528** | **60,528** | **1,920** | **29,958** |
| Candidate coplanar same-side interior-overlaps | **0** | **0** | **0** | **0** |
| Near-antiparallel angle >=175° | **0** | **0** | **0** | **0** |
| Near-backtracking same-side angle >=150° | **0** | **0** | **0** | **0** |
| Coplanar borderline/near-collinear unresolved | **0** | **0** | **0** | **0** |
| Independently certified print-safe | **NO** | **NO** | **NO** | **NO** |

TripoSR real orb GLB SHA:
\`f37a812bc4414ddee34bcb19d2e7535f25d219a3731c14f2dcc89c2c7ba030e2\`.
Non-destructive G3.7 reversed winding copy SHA:
\`ab2e5aeb55598624209eeca3e700abef93a69a52886c63ecad6a840e62d8d68f\`.

The two AI-output versions have **identical shared-edge geometric/normal findings**. Reversing global triangle winding does not improve the input's geometric quality.

## Positive/negative controls

CPU unit tests use two triangle faces with a full shared indexed edge:

1. Third vertices SAME SIDE and COPLANAR with antiparallel normals → deliberately flawed planar overlapping pair is flagged.
2. Third vertices OPPOSITE SIDES and COPLANAR with parallel normals → normal shared-edge contact, not flagged.
3. Same-side but NON-COPLANAR ~153° normal backturn → flagged as an extreme angle indicator but NOT falsely called a coplanar interior overlap.
4. Exactly/near-collinear edge third vertex → explicit near-plane borderline classification instead of an invented clean result.
5. Proper closed box and icosphere → no fabricated coplanar backfold; valid 90° cube edges are intentional.
6. Full winding reversal of a known sphere → invariant results.
7. Invalid adjacency, open/nonmanifold geometry, tampered evidence and prior real chair source SHA → rejected or verified, never print-cleared.

The private actual original/derivative/GT/chair reports are written only into gitignored \`runtime/qa/g3/orb-01-positive-winding\`. They include per-face sample indices locally if any real candidate appears; no such per-face evidence is published.

## Source-bound CPU replay and sanitized evidence

Use the ALREADY COMPLETED earlier real TripoSR orb job UUID locally; never reuse the spent GPU authorization:

    runtime\engines\triposr\venv\Scripts\python.exe scripts\g3-11-verify-edge-replay.py --job-id <EXISTING_REAL_LOCAL_JOB_UUID>

This CPU-only command recomputes four full edge screens and checks deterministic fields and SHA256 of all four existing GLBs; it writes no files. To regenerate or verify the immutable sanitized public report:

    npm run proof:g3:orb:edge-backfold -- --job-id <EXISTING_REAL_LOCAL_JOB_UUID>

[G3.11 anonymized public evidence](evidence/g3/orb-01-g311-edge-coplanar-screen.json) ties all counts to original licensed source/GT/input SHA, prior actual real job and G3.9/G3.10 reports without disclosing private UUID, source images/GLBs, checkpoints, local paths, user prompts, or raw face index examples.

Private real model-output coverage stays **2/9** (one historical licensed MIT chair, one original G3 orb); seven other licensed original synthetic sources have NO AI-generated model output and require NEW individual GPU consent. The older checked-in public benchmark snapshot stays frozen at 1/9 and must not be described as live coverage.

## Engineering status

**Not print qualified.** Physical scale/unit mapping, minimum wall thickness, actual precise nonlocal face collisions including numerically tiny/coincident cases, zero-width internal cavities, unsupported details, mechanical strength, slicer, printer profiles and tests on real-world photo categories remain open. OS-enforced sandbox, Python supply-chain advisories and retention/authentication remain open on security Issue #4. No changes made to Office 2.0, VelvetOS, Windows configuration, cloud or printers.

**Conclusion:** four already existing meshes produced zero possible same-side coplanar shared-edge backfold findings under the fixed CPU predicate. This is another narrowly successful geometry DIAGNOSTIC, **not an independent global self-intersection or manufacturing certificate**.
