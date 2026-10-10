# LOCAL3D G3.19 — second independent rational triangle-contact oracle and differential source QA (CPU only)

2026-10-10 | v0.2.19-g3-second-exact-oracle-cpu

**Scope:** Second independently coded exact triangle-triangle contact classifier, compared directly and face-pair-by-face-pair against the existing G3.17 algorithm. Mathematical precision applies only to ALREADY-DECODED IEEE-754 coordinate values of previous SHA-pinned GLBs; it is not a new neural model, mm calibration, CAD geometry reconstruction, user-upload sandbox or printer certificate.

## Previous limitation and new independent implementation

G3.18 independently verified all 43,107 exact AABB no-index candidate PAIR IDS of the real orb against the G3.17 numerical KDTree. G3.17 classified those pairs exactly with one rational predicate implementation, but a shared algorithmic assumption/bug could persist. G3.19 adds a separate **narrowphase** classifier for direct mathematical differential checks.

New engines/quality/independent_triangle_oracle.py deliberately DOES NOT import G3.13's polygon clip function or G3.17's plane-intersection helpers.

- In NONCOPLANAR geometry, the second implementation uses exact 3D signed support-plane distances and directly interpolates finite triangle edge/plane crossings in rational arithmetic, constructs both segments of the intersecting support-plane line and compares their exact projected finite ranges. Distinguishes exact disjoint, single-point boundary and positive-length line intersection.
- In COPLANAR geometry, the second implementation independently builds a set of exact 2D intersection points from all three vertices of A inside B, all three vertices of B inside A and **ALL NINE finite edge/edge intersections**. It handles collinear overlapping segments without relying on polygon clipping. Zero, one, two or noncollinear multiple intersection points determine exact disjoint, point, boundary positive length, positive area.
- Geometry values are Python Fraction rationals of the already-decoded binary-float mesh coordinates; invalid/NaN/oversized or exact-degenerate triangles cause explicit refusal, not silent clear.

The second implementation is algorithmically independent enough to expose different edge/boundary handling, but NOT an external separately validated third-party geometry kernel, proof of perfect software implementation, CAD float quantization recovery or manufacturing print certificate.

## Differential comparison scopes

1. **FULL no-index AABB candidate subset** per already licensed existing SHA-verified source: G3.18 proved its candidate ID set identical to independently implemented exact sorted-X sweep. On ALL of those no-index candidates, run G3.17 exact predicate and the new G3.19 oracle from the SAME decoded indexed face coordinates, and require exact classification LABEL identity pair-by-pair. A disagreement is a FAIL CLOSED and prevents publication of "no discrepancy" evidence.
2. **SAMPLED indexed-adjacency subset only**: select the first 256 lexicographic original shared full-edge face pairs and the first 256 indexed one-vertex-only pairs from each model. Compare both exact predicates there. For legitimate shared-edge pairs, expected contact is the existing edge segment (NOT a collision defect), and for selected one-vertex-only pairs, expected only-point contact. This intentionally does not claim a full second independently exact check on the much larger indexed-adjacency sets (which G3.15/G3.16 classify in their separate previous methods).
3. **Deterministic seeded adversarial fuzz**: integer-grid noncoplanar random triangles, coplanar planar triangles and tiny exact binary-float near-boundary offsets (plus explicit positive crossing, same-line contact and positive coplanar area). Each differential mismatch fails the test; malformed exact zero-area cases are explicitly excluded with tracked bounds, not interpreted as no contact. A deliberately patched wrong classifier MUST cause a fail-closed disagreement.

Bounds: only trusted, previously completed G2 source and four licensed SHA-pinned GLBs; max 100,000 no-index pairs per source, max 256 edge and 256 one-vertex selected pairs, <=105 seconds CPU per model; G3.17 old broadphase per-mesh caps continue in force. Sources must remain one connected manifold, watertight/winding consistent, with prior ownership/rights/asset SHA/immutable evidence checks. No training, GPU inference, cloud or printer operations.

## Historic SHA-locked four-model CPU findings

| Existing pre-approved prior GLB | Faces | All no-index AABB candidates checked by BOTH exact classifiers | Indexed-edge SAMPLE | Indexed single-vertex SAMPLE | Differential disagreements |
|---|---:|---:|---:|---:|---:|
| Previous genuine TripoSR real orb 01-orb-alpha | 40,352 | **43,107** | 256 | 256 | **0** |
| G3.7 same-surface winding-only derivative | 40,352 | **43,107** | 256 | 256 | **0** |
| Original project-owned procedural sphere GT | 1,280 | **216** | 256 | 256 | **0** |
| Historical licensed MIT chair derivative | 19,972 | **28,593** | 256 | 256 | **0** |

All zero-index AABB candidates were classified EXACT_DISJOINT by both engines. The sampled normal full-edge pairs retain a positive-length expected common-edge segment (not a penetration defect), while sampled indexed single-vertex-only pairs have ordinary exact point-only contact. None of these claims covers physical wall thickness or millimeters.

Only SHA checksums, aggregate numeric status/classification counts and scope booleans are published: [G3.19 four-source second-oracle sanitized proof](evidence/g3/orb-01-g319-second-exact-oracle-proof.json). Private historic G2 job UUID, original source media, model GLBs and sampled triangle face IDs remain in gitignored runtime. Immutable private per-model reports preserve the QA results for read-only replay.

## Tests and reproduction on Chris

17 new G3.19 Python controls include explicit 3D line/area/point/disjoint adversarial examples, signed tiny 2^-45 crossing, coplanar segment overlap, plane separation, shared-indexed edge/vertex normal touches, invalid/oversized/zero-area coordinates, winding and vertex order invariance, deterministic 3D and coplanar grid fuzz plus near-boundary perturbations, and injected false-primary-classification failure. New Node tests verify SHA lineage G3.14/17/18, that FULL no-index class and ONLY 256 samples for each indexed category are independently checked, and public privacy/print flags. Full prior Node/Python/Chrome regression is required before release.

From D:\Velvet\Projects\local-3d-generator using the already installed CPU Python runtime:

    runtime\engines\triposr\venv\Scripts\python.exe -m unittest discover -s engines\quality -p test_g319_independent_oracle.py

Four SHA-pinned previously existing source model reproduction without generating model or writing fresh evidence:

    runtime\engines\triposr\venv\Scripts\python.exe scripts\g3-19-second-oracle-replay.py --job-id <PREVIOUS_COMPLETED_PRIVATE_ORB_JOB_UUID>

The first immutable per-model private and sanitized public reports were created with --prepare-private --write-public for previously completed input SHAs ONLY; later verification omits those flags and strictly refuses drift.

## Remaining open hard gates

This is a SECOND independent rational contact implementation for the full no-index subset plus deterministic indexed-adjacent samples; the prior indexed shared-edge and indexed one-vertex tests were exhaustive in G3.15/16 respectively but not all rerun by this second oracle. New independent mathematical confidence is not equal to ideal original CAD precision or a safety approval: physical mm calibration, minimum wall thickness and tiny features, material strength, supporting walls, slicer/export specifics and real print validation are all unverified. GlobalSelfIntersectionFreeCertified=false and printQualified=false remain unchanged.

GitHub Issue #3 quality/manufacturing and Issue #4 pinned Python package advisories, untrusted native parser OS isolation and network egress enforcement remain OPEN. Real image-to-3D output coverage still only **2/9** historic genuine fixtures; seven remaining GPU jobs require independent per-image user permission. No model inference, GPU lease, cloud, printer, Office, unrelated service 4178 or Windows security setting modified. All source GLBs DRAFT, approvedForPrinter=false, fabricationAction=NONE.

Next G3.20: establish physical-scale unit provenance (fail-closed UNKNOWN_MM) and bounded CPU wall-thickness/feature measurements only in arbitrary GLB units pending verified dimensional calibration, alongside Issue #4 security review. Do not release for manufacturing.
