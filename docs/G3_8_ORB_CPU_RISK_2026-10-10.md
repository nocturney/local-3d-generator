# LOCAL3D G3.8 — CPU-only triangle-contact risk and orb radial irregularity

Date: 2026-10-10. Workstream: independent LOCAL3D G3 image→3D quality gates.
Scope: a **PREVIOUSLY user-authorized, completed** real TripoSR inference of the project-original 01-orb-alpha case. No new GPU inference, weights/dependency installs, Office actions, cloud requests, printer exports or slicer changes.

## What this milestone measures

G3.7 had proven that flipping the original AI mesh's inward triangle winding **only changed normals/order**, not positions, triangle surface geometry or vertex colors. The corrected copy is closed and has positive signed volume but contains visually uneven geometry relative to the smooth procedural input.

G3.8 advances on two **DIAGNOSTIC, NON-CERTIFYING** CPU checks:
1. Bounded, conservative geometric contact screening of non-vertex-adjacent triangle pairs. A complete **eligible-pair screen** does not mean full self-intersection freedom or printability.
2. Deterministic, area-weighted best-fit-sphere radial deviation for this explicitly spherical procedural fixture. This measures closeness to a fitted sphere, NOT calibrated image-to-3D accuracy or actual surface-finish tolerances.

All data are anchored to the genuine completed model SHA256 **f37a812bc4414ddee34bcb19d2e7535f25d219a3731c14f2dcc89c2c7ba030e2**, the copy-only corrected GLB SHA256 **ab2e5aeb55598624209eeca3e700abef93a69a52886c63ecad6a840e62d8d68f**, and licensed procedural GT SHA256 **c8834b2668210e58a73ff8b2ab3bcf2d0bc5d2df9a09b3dd0313b425b3664749**.

## 1. Conservative bounded nonadjacent-triangle contact screen

Reusable CPU code: engines/quality/triangle_contact_screen.py. No new dependency installed: it uses the already available pinned Trimesh, NumPy and SciPy cKDTree.

Pipeline:
- Validate bounded, finite indexed vertices/faces and reject geometrically degenerate triangle faces. Trimesh's separate topology QA is NOT sufficient alone for intersection detection.
- Each triangle is enclosed in a guaranteed centroid sphere. cKDTree returns potentially touching neighborhoods using each triangle's circumsphere radius and the maximum radius. This **broadphase** does not prune intersecting nonadjacent triangle pairs except through explicit numerical tolerances.
- For each candidate, apply 3D AABB overlap, exclude triangle pairs that **share ANY vertex INDEX**, then apply a vectorized conservative separating-axis screen, including triangle normals, nine edge-cross-edge axes and six in-plane edge axes needed for coplanar overlaps.
- This floating-point SAT identifies **possible** overlap/contact, not exact physical penetration. Touches or near-coplanar triangles can be false positives. Very tiny intersections may escape numerical tolerance.
- Exhaustion guards: max 75,000 triangles, 1,500,000 broadphase pairs, 500,000 eligible narrowphase pair tests, approximately 35 s per invocation; stop after 32 potential contact findings. If any cap/time budget is hit, report **INDETERMINATE** or explicit partial contacts; do NOT return a fabricated clearance.
- This screen **does not inspect indexed adjacent triangles against each other** (pairs sharing any vertex are excluded); they may self-fold. It is NOT a robust exact-predicate mesh-intersection library, full manufacturing topology audit, BVH collision proof, 3D printing check, or a replacement for a slicer.

### Real 01-orb-alpha result

| CPU measure | Previously generated TripoSR GLB | Corrected orientation-only copy | Original procedural GT |
|---|---:|---:|---:|
| Faces | 40,352 | 40,352 | 1,280 |
| Broadphase candidate pairs | 641,074 | 641,074 | 7,650 |
| AABB-overlapping pairs | 294,413 | 294,413 | 7,650 |
| Excluded pairs sharing any vertex index | 251,388 | 251,388 | 7,650 |
| Nonadjacent pairs checked by conservative SAT | **43,025** | **43,025** | **0** |
| Possible nonadjacent contacts detected | **0** | **0** | **0** |
| Eligible-pair screen completed within the guards | Yes | Yes | Yes |
| Certified self-intersection-free / print-qualified | **No / No** | **No / No** | **No / No** |

The GT's zero tested nonadjacent pairs is explained by all its AABB candidate pairs being vertex-adjacent; that is **not** an exhaustive geometry pass. The two TripoSR output versions have identical candidate statistics because G3.7 proved the exact same vertex positions/faces regardless of orientation.

**Interpretation:** no potential contacts were detected among the 43,025 actually eligible triangle pairs, at geometric tolerance about 1.582e-9 in **arbitrary** model-coordinate units. This only removes one narrow red flag; it does not rule out adjacent-face foldovers, near-touch tolerance errors, real-world insufficient wall thickness or any unsupported manufacturing risk.

Negative tests: intersecting overlapping closed cubes show potential contacts; non-overlapping closed cubes and convex icospheres show none; coplanar overlapping triangles and crossing surfaces are identified by the SAT; openly degenerate faces, invalid arrays and unsafe resource limits fail closed. Budget/time truncation never reports "complete" or "safe".

## 2. Orb-specific area-weighted radial irregularity

Reusable CPU code: engines/quality/orb_radial_irregularity.py.

The algorithm takes **4,096 deterministic area-weighted triangle surface samples** from the known original procedurally generated sphere and from the *already generated* real TripoSR mesh, normalizes each mesh independently by its own AABB diagonal/center, fits a separate least-squares sphere in that normalized frame, then computes absolute radial deviations relative to each fitted radius.

| Metric, divided by own fitted sphere radius | Original source GT | Actual TripoSR output |
|---|---:|---:|
| Mean absolute radial deviation | **0.00062476** (0.062476%) | **0.04973669** (4.973669%) |
| 95th percentile absolute radial deviation | 0.00157925 (0.157925%) | 0.11574727 (11.574727%) |
| Radial residual RMS | 0.00079004 | 0.05983397 |
| Radial distance 95th–5th spread | 0.00270997 | 0.18831454 |

The model's mean radial residual is about **79.61 times** the GT's residual *under this best-fit-sphere diagnostic*. That does **not** mean "79.61x worse model", "5% model accuracy loss" or general photographic output quality. In fact the method mixes coarse ellipsoid/nonroundness, triangulation faceting, high-frequency ripples and any geometric distortion. It cannot separate these causes, evaluate high-quality human detail, prove whether hidden parts are correct, or claim physical millimeter error.

The corrected orientation-only GLB is not fraudulently scored as a second inference or an "improved" roundness result: G3.7 proved that its geometric surface is EXACTLY identical to the original prediction. Sample parameters and random seed are identical, but each model's normalization is independent and conceals actual scale.

## 3. Reproduction and privacy

The **only newly exported repository evidence** is the sanitized, SHA-linked JSON:

[orb-01-g38-cpu-risk-screen.json](evidence/g3/orb-01-g38-cpu-risk-screen.json)

Do not commit private images, job IDs, prompts, model GLBs, source/chair client photos, checkpoints, local paths or worker trace. Under gitignored private runtime the diagnostic reports remain:
- runtime/qa/g3/orb-01-positive-winding/original-contact-screen.json
- runtime/qa/g3/orb-01-positive-winding/contact-screen-cpu.json
- runtime/qa/g3/orb-01-positive-winding/ground-truth-contact-screen.json
- runtime/qa/g3/orb-01-positive-winding/orb-radial-cpu.json

Operator reproduction using already-completed private job UUID:

    runtime\engines\triposr\venv\Scripts\python.exe scripts\g3-8-verify-cpu-replay.py --job-id <EXISTING_LOCAL_REAL_JOB_UUID>

This read-only script recomputes all three scans and the radial fit, comparing every deterministic field to previously stored results (excluding elapsed wall-clock time). It runs no model and stores no new output.

Verify/refill immutable **sanitized-only** provenance after the four private records exist:

    node scripts/g3-8-assemble-cpu-risk-evidence.mjs --job-id <EXISTING_LOCAL_REAL_JOB_UUID>

The evidence assembler validates original source rights/hashes, a completed real G2 job and its five manifest-linked assets, source + derivative + GT hashes, previous G3.7 geometry preservation and all new CPU findings. It refuses to overwrite divergent public reports. It does not claim external GPU attestation. All tests and outputs are CPU-only.

## 4. Coverage, safety and next gates

The confirmed private model-output ledger remains **2/9** historical real TripoSR output fixtures (licensed upstream MIT chair plus project-original 01 orb). Seven other synthetic G3 references have no actual AI reconstruction. The checked-in public baseline file benchmark-coverage.json is an immutable **earlier 1/9 snapshot**, NOT the up-to-date private ledger. Neither run creates model data from GT fixtures or restarts a GPU worker.

- **PENDING:** adjacent-face foldover/dihedral risk, independent exact self-intersection library validation, real-world CAD scale, per-location wall thickness, supports/overhangs, material and mechanical strength, slicer simulation, real part qualification and subsequent human review.
- **BLOCKED FOR PRINT:** output remains DRAFT and printQualified=false; no STL/3MF print release, fabrication automation or printer command.
- **SECURITY:** old Python dependency advisory reachability/isolated upgrades, trusted-source-only restriction, OS-enforced sandbox/auth, external security audits and data retention still open (Issue #4).
- **NEW GPU:** every additional image requires fresh, separately explicit consent and live Office idle/NVIDIA/multi-instance lease safeguards. The user authorization for 01-orb-alpha has been consumed.

No Office 2.0 P0, VelvetOS, Windows security configuration, active service on 4178, model weights, local printer or printer firmware was changed.

**Conclusion:** the existing TripoSR orb did not show nonadjacent-triangle contacts in the bounded screen, but its best-fit-sphere radial deviation is conspicuously higher than the original reference and its manufacturing status is still NOT PRINT QUALIFIED.
