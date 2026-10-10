# LOCAL3D G3.15 — exact-binary-float classification of ALL indexed shared-edge face pairs (CPU)

Date: 2026-10-10 | Release: v0.2.15-g3-exact-indexed-edge-cpu

**Scope: mathematical pair contact for an indexed SHARED EDGE ONLY**, using exact rational arithmetic on already-decoded IEEE-754 GLB coordinates. Not an exact global all-triangle contact scan, not CAD mm calibration and not physical print qualification. No new AI/GPU inference, cloud, model engine, printer, OS security or Office operations.

## Why this closes a specific gap

G3.14 independently enumerated all 294,495 conservative AABB-overlap candidate pairs on an earlier real orb and counted 60,528 pairs sharing a full original vertex index edge. G3.11 had only a floating near-coplanar same-side fold screen on those indexed edge pairs. G3.13 exact arithmetic applied only to 24 deliberately chosen edge-adjacent face pairs and correctly refused to call normal edge touching a defect.

G3.15 now **exactly classifies every indexed shared-edge pair** on the four previous licensed models, not merely sampling 24. It uses the fundamental geometric fact: two nondegenerate triangle supporting planes meeting along the exact same indexed segment have no possible extra intersection off the common line unless they are coplanar. When coplanar, their two third vertices lie either on the same lateral side of the shared edge (positive interior-area overlap) or opposite sides (ordinary expected edge-only contact).

New reusable CPU module: engines/quality/exact_indexed_edge_contact.py.

Method, no approximate dihedral threshold:
1. Validate bounded indexed triangles/adjacency, no duplicate triples, ordered unique face pairs, exact two shared indexed vertices, finite XYZ, no geometrically degenerate face. For GLBs independently require one valid connected closed, consistently wound manifold.
2. Convert every decoded vertex XYZ float into its exact Python Fraction rational. For each shared indexed edge, calculate exact cross-product normal of one face and signed dot with the other face's third vertex, using rational arithmetic.
3. If exact signed plane distance is nonzero, the planes intersect only along the indexed common edge: classify as EXACT_NONCOPLANAR_ONLY_SHARED_EDGE.
4. If exactly coplanar, classify third-vertex position with exact rational cross/dot lateral sign. Same side => true positive-area planar overlap of these indexed neighbor triangles; opposite => normal edge-only contact. Any zero/degenerate determinant fails closed, not declared safe.
5. Bounded CPU: <=100,000 vertices, <=75,000 faces, <=120,000 indexed shared-edge pairs, <=60s scan; timeout = INDETERMINATE. The output always has globalSelfIntersectionFreeCertified=false and printQualified=false.

The proof concerns **exactly the digital decoded GLB coordinates**. Models may have been quantized to float32 and lost near-planar or microscopic geometric information before analysis. A visually planar chair face may not be EXACTLY planar after export; a physically insufficient wall could remain even if all indexed-edge contacts are normal. This is NOT an OS sandbox and not safe for arbitrary untrusted models.

## SHA-verified previous-model CPU findings

| Previously existing licensed GLB | Triangles | All indexed shared-edge pairs | Exact noncoplanar edge-only | Exact coplanar opposite-side edge-only | Exact coplanar same-side positive-area overlaps |
|---|---:|---:|---:|---:|---:|
| Genuine earlier 01-orb-alpha TripoSR output | 40,352 | **60,528** | 60,528 | 0 | **0** |
| Same-surface G3.7 winding-only derivative | 40,352 | **60,528** | 60,528 | 0 | **0** |
| Project-original procedural sphere GT | 1,280 | **1,920** | 1,920 | 0 | **0** |
| Historical previously licensed MIT chair derivative | 19,972 | **29,958** | 29,958 | 0 | **0** |

All four counts completed within CPU budget. Original/copy SHA validation and all deterministic counts are identical except binary model source digest. The chair's lack of EXACT coplanar adjacency is a property of its decoded IEEE-754 geometry, not a certified statement that it has no perceptually flat surfaces. **Zero same-side coplanar shared-edge overlap here does not rule out any other kind of mesh self-contact**, including indexed one-vertex-only pairs (190,860 on orb), different-index/no-index pairs, nonexact finite floating precision, real-world wall thickness, and multi-component scene objects.

Public [G3.15 sanitized exact-edge SHA counts](evidence/g3/orb-01-g315-exact-indexed-edge.json) includes no private job UUID, image/photo, raw model GLB, face index examples, customer content or Windows file paths. Private immutable per-model outputs remain gitignored on Chris. The script verifies completed source-job asset manifests, four fixed GLB SHAs and previous G3.14 AABB indexed-edge counts.

## Negative controls and full regression

14 new Python CPU adversarial tests include: strict coplanar same-side overlap detection; opposite-side coplanar ordinary planar adjacency; valid noncoplanar shared edge; tiny nonzero off-plane differences (exact on binary floats); global winding invariance; valid cube sharp right angles and smooth sphere; invalid vertex-only pair passed as edge; wrong or duplicated face IDs; finite and exact degeneracy checks; tight CPU timeout; oversized CPU budgets; immutable-report tampering and actual historical real chair SHA replay. Synthetic same-side planar overlap flags, while valid cube/GT produce no false overlap label.

Additional Node tests lock public SHA source lineage and verify exact indexed-edge counts against G3.14, aggregate/count invariants, private data absence and DRAFT/no-printer flags.

## Reproduce in Chris safely, no model inference

From D:\Velvet\Projects\local-3d-generator, using the already installed pinned Python environment:

    runtime\engines\triposr\venv\Scripts\python.exe -m unittest discover -s engines\quality -p test_g315_exact_indexed_edge_contact.py

Recompute four existing SHA-pinned private reports in **read-only** mode (prior genuine completed orb job UUID only as local CLI argument):

    runtime\engines\triposr\venv\Scripts\python.exe scripts\g3-15-edge-replay.py --job-id <PREVIOUSLY_COMPLETED_PRIVATE_ORB_JOB_UUID>

For the one-time immutable private/sanitized evidence creation (already performed for these SHAs), the operator used --prepare-private --write-public. This refuses changed prior reports, does not infer a model and cannot upload raw local model data to GitHub.

## Acceptance and remaining blockers

This milestone closes the **exact expected-contact-vs-coplanar-area-overlap classification for ALL full-indexed-edge-adjacent face pairs in each existing model**, in decoded IEEE-754 geometry. It does not close global exact collision checking: pairs that share only ONE indexed vertex are still limited to prior bounded numerical G3.10 ray-risk predicates; fully nonindex-adjacent pairs currently have an exhaustive conservative numerical AABB/SAT screen, not exact predicates across all. Numerical and quantization caveats remain, and no mm wall thickness or physical print qualification is proven.

Issues #3 (geometry, benchmark & manufacturing) and #4 (dependency risk, OS isolation, untrusted inputs) stay OPEN. No new real inference beyond historical **2/9** of G3 fixtures; seven further source images require fresh per-image GPU approval. No printing or slicer. No Office 2.0 core/security or service 4178 changes. All outputs DRAFT; printQualified=false; approvedForPrinter=false; fabricationAction=NONE.

Next engineering gate: indexed single-vertex extra-contact classification using robust exact geometry (not mere vertex touching), independently bounded and conservative. Maintain explicit unresolved outcomes for coplanar/near-degenerate geometry, then address physical units/wall checks, licensing and OS-backed security under separate gates.
