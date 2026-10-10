# LOCAL3D G3.9 — CPU edge-adjacent face-normal variation on real 01-orb-alpha

Date 2026-10-10. Release v0.2.9-g3-edge-angles-cpu.
Scope: **CPU only**. The real TripoSR 01-orb-alpha GLB came from an EARLIER explicit per-image GPU approval and completed job. This G3.9 milestone created **no new AI model, cloud work or print files**, installed no engine or dependencies, and did not alter the source or corrected GLBs.

## Purpose

G3.8 screened 43,025 eligible nonadjacent triangle pairs per previously created TripoSR model for potential surface contacts, finding 0 within the conservative floating-point tolerance. Critically, that screen excluded over 250k AABB-overlapping triangle pairs sharing at least one indexed vertex; this is NOT full self-intersection proof.

G3.9 explicitly measures **one important part** of that gap: the angle between each pair of faces **sharing an entire indexed edge** in a watertight, consistently wound, single-component mesh. It still DOES NOT analyze pairs that share only a vertex, prove that adjacent faces do not fold/intersect geometrically, classify concave versus convex physical folds, or certify wall thickness/physical manufacturing safety.

The diagnostic can flag sharp or rapidly changing normals, a possible correlate of visible roughness, but a high angle can be a perfectly legitimate design feature such as a cube edge. It is NOT a defect classifier, printability rating or image reconstruction accuracy number.

## CPU method and limits

The new engines/quality/adjacent_face_angles.py module:
- Validates local GLB header and bounded Trimesh CPU input; accepts a single connected, consistently wound watertight indexed mesh only; rejects nonfinite coordinates, nonmanifold/open topology, degenerate faces and excessive complexity.
- Fetches the finite per-triangle normals and the exact indexed face-adjacency edge pairs; requires every indexed triangle edge to have exactly two incident faces, so total adjacency is F*3/2.
- Computes normalized normal dot products and arccosine angle in degrees per edge. Records p50/p90/p95/p99/max and counts over 15°, 30°, 45°, 60°, 90°, 120°, 150°. There is NO fabricated "number of physically folded edges".
- Does not require a CUDA/Torch model, mesh repair, smoothing, slicer or printer. All report flags remain DRAFT and printQualified=false.

This is a bounded face-edge angle diagnostic, not a mathematically exact self-intersection test. Numerical tolerance and source tessellation matter. It is not a surface-manufacture quality predictor.

## Actual results (SHA-pinned, no model rerun)

| Quantity | Actual existing TripoSR GLB | Separate winding-only derivative | Procedural original GT |
|---|---:|---:|---:|
| Indexed triangle faces | 40,352 | 40,352 | 1,280 |
| Face pairs sharing an indexed edge | **60,528** | **60,528** | **1,920** |
| Angle median (p50) | 8.278947° | 8.278947° | 5.428102° |
| p90 | 27.673930° | 27.673930° | 5.680823° |
| **p95** | **33.018760°** | **33.018760°** | **5.731991°** |
| p99 | 41.757141° | 41.757141° | 5.751611° |
| Maximum | 74.402674° | 74.402674° | 5.751622° |
| Pairs exceeding 45° | **312** | **312** | **0** |
| Pairs exceeding 60° | **18** | **18** | **0** |
| Pairs exceeding 90° | **0** | **0** | **0** |
| Measured physical fold/defect/print clearance | NO | NO | NO |

Thus 312/60,528 (about **0.5155%**) of real-model indexed edge adjacencies exhibit >45° face-normal change. **No adjacent-edge pair exceeds 90°** in this model. This does NOT exclude vertex-only overlaps, near-coincident triangles or self-folding by other geometric definitions.

The winding-inverted copy has **exactly the same angular distribution**, as expected from G3.7's SHA-verified bit-identical coordinates/colors and exactly reversed faces. It provides no new mesh-quality improvement.

The smooth source procedural sphere has far gentler adjacent-face angles. **IMPORTANT CONTROL LIMIT:** the procedural GT is a 1,280-triangle ico-sphere and the TripoSR mesh is 40,352 triangles. Raw face-angle statistics from meshes with very different resolutions are NOT directly comparable as calibrated reconstruction or texture-fidelity scores. The contrast supports the existing visual finding of ripple/nonuniform normals; it does not give a percentage of product quality or a mm finish tolerance.

## Negative controls and independent replay

CPU negative controls:
- A closed cube naturally has **12 edges with 90° normal changes**, yet those are **INTENTIONAL**, not automatically flaws.
- A non-destructively inverted historical real MIT chair GLB retains identical adjacent-normal-angle statistics.
- A deformed synthetic ico-sphere at **the same triangulation density** has larger high-quantile normal changes than the unchanged smooth sphere.
- Open shells, invalid indexed topology and degenerate faces are refused instead of marked as passed.
- Tests assert every indexed edge is accounted for; original SHA must remain pinned and no print-approval flag may be set.

Three immutable private reports live under gitignored:
    runtime/qa/g3/orb-01-positive-winding/original-edge-angle.json
    runtime/qa/g3/orb-01-positive-winding/corrected-edge-angle.json
    runtime/qa/g3/orb-01-positive-winding/reference-edge-angle.json

**Read-only CPU reproduction**, where UUID identifies only the earlier existing local completed model:
    runtime\engines\triposr\venv\Scripts\python.exe scripts\g3-9-verify-cpu-replay.py --job-id <EXISTING_COMPLETED_REAL_JOB_UUID>

**Immutable sanitized public proof assembly**:
    npm run proof:g3:orb:edge -- --job-id <EXISTING_COMPLETED_REAL_JOB_UUID>

Public SHA evidence:
[orb-01-g39-adjacent-angles.json](evidence/g3/orb-01-g39-adjacent-angles.json)

The proof validator cross-checks the actual earlier real G2 job and five SHA-linked assets, original project source+GT and copy-only corrected GLB, prior G3.7 winding exactness and G3.8 nonadjacent screen. The public JSON contains no private UUID, model binary, customer photo, prompt, local Windows path or engine weights.

## What is NOT solved

- Full self-intersections including triangles sharing **only a vertex** or overlapping despite edge adjacency, exact robust geometric predicates, collision margin and inward-facing pockets.
- Absolute millimeter dimensions and local wall thickness; internal cavities, material strength, overhangs/supportability, slicer, printer, and real physical manufacturing tolerances.
- Valid benchmark comparisons across different-resolution meshes, unknown camera, image occlusion, real customer photos, other categories, multiple model providers.
- Python dependency risk triage, OS sandbox, retention/authentication (separate security Issue #4).

**G3.9 has no printer authorization.** G3 private completed-output coverage remains 2/9 (historical MIT chair + authorized real orb), seven original fixtures still require fresh per-image consent for any GPU inference. The immutable public historical benchmark remains 1/9 and is NOT the private live counter. All model files stay local and gitignored.

Conclusion: adjacent-face normal variation is now a measured, reproducible, bounded CPU diagnostic showing substantial angular variation on the previously inferred orb, but there is **no foldover-certification, wall-thickness or print-qualification pass**.
