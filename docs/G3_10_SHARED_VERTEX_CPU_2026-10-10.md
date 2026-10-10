# LOCAL3D G3.10 — shared-one-vertex additional-contact-ray screen (CPU only)

Date: 2026-10-10 | Version: v0.2.10-g3-vertex-only-cpu (G3.10)

## Executive conclusion

The one previously explicitly approved, genuinely completed TripoSR CUDA generation of **01-orb-alpha** produced a 40,352-triangle GLB. G3.7 produced a separate copy-only orientation reversal, whose vertex positions, triangle surface and RGBA vertex colors are identical to the original prediction.

G3.10 analyzes a *new* category omitted by the G3.8 conservative nonadjacent contact screen: **pairs of triangles sharing exactly ONE indexed vertex, but NOT a complete indexed edge**. Ordinary contact *at* a shared vertex is valid mesh topology, so just applying a generic triangle-vs-triangle SAT test would incorrectly flag nearly every such pair. Instead, G3.10 checks whether a **non-zero common ray away from their shared vertex** lies within the two face sectors, which may indicate an EXTRA contact between triangles beyond the expected shared point.

**This is a numerical conservative screening diagnostic, not a global exact-predicate self-intersection proof or print release. No CUDA model, OpenAI/remote provider, new data/photo, printer, slicer or cloud request was run during G3.10.**

## Actual real-model results

| Category | Previously generated real TripoSR orb | G3.7 copy-only derivative | Project-original orb GT | Historic real chair derivative |
|---|---:|---:|---:|---:|
| Indexed triangles | 40,352 | 40,352 | 1,280 | 19,972 |
| Unique triangle pairs sharing EXACTLY ONE indexed vertex | **190,860** | **190,860** | **5,730** | **92,629** |
| Vertex-only pairs checked | **190,860** | **190,860** | **5,730** | **92,629** |
| Additional non-coplanar common-ray candidate pairs | **0** | **0** | **0** | **0** |
| Near-parallel/coplanar cases not numerically decidable | **0** | **0** | **0** | **0** |
| Borderline/shared-edge-ray or near-zero-length cases | **0** | **0** | **0** | **0** |
| Completed eligible-pair scan within time/pair/valence caps | Yes | Yes | Yes | Yes |
| Certified no self-intersections or print-qualified | **NO / NO** | **NO / NO** | **NO / NO** | **NO / NO** |

The real orb's 190,860 triangle pairs share a single indexed vertex, not an edge. A separate 121,056 *incidences* of shared-edge triangle pairs are skipped in the vertex enumeration; because each shared-edge pair is enumerated through each of its TWO shared vertices, this is 2 × 60,528 distinct indexed edge-adjacent face pairs already characterized by G3.9. Never add these incidence counts together as unique geometric contact tests.

The original inference GLB remains SHA256:
\`f37a812bc4414ddee34bcb19d2e7535f25d219a3731c14f2dcc89c2c7ba030e2\`.
The separate non-destructive orientation derivative remains:
\`ab2e5aeb55598624209eeca3e700abef93a69a52886c63ecad6a840e62d8d68f\`.

The new screen finds **no indication** of an extra non-coplanar ray of contact beyond the shared vertex among those numerically analyzed pairs. It does NOT prove absence of all possible self-intersections: near-coplanar overlap, very small numerical intersections, unindexed duplicate/coincident coordinates, triangle pairs sharing entire edges and off-by-tolerance behaviors require additional independent checks.

## Algorithm, resource limits, and fail-closed behavior

Reusable CPU-only \`engines/quality/vertex_only_ray_screen.py\` uses preexisting NumPy/Trimesh only, with NO third-party package installation.

1. Accept only bounded finite indexed triangles, rejecting duplicate-vertex or zero-area faces and unsafe model complexity. The real GLB entry point requires one closed connected mesh, consistent winding, no duplicate triangle triples, no boundary or non-manifold indexed edges. Source GLB SHA and model metadata are checked by existing read-only topology QA.
2. Enumerate face incidences around each indexed vertex. Only pairs whose intersection of THREE vertex-ID sets has cardinality exactly one are retained. Two-face pairs sharing an entire indexed edge are excluded from this *specific* test, not declared safe.
3. Each vertex-only pair lies in two planes meeting at the shared point. For **non-parallel** planes the intersection is a line through that point, with direction given by the cross product of the triangle-plane normals.
4. Express both the positive and negative line directions in each face's two-edge tangent cone using a 2×2 Gram matrix. If a ray remains in both triangles for a non-zero distance, the pair is flagged as a **potential extra contact** (not proof of actual penetration).
5. Explicitly classify nearly coplanar normals and borderline/ray-aligned/very-short cases as UNRESOLVED. No inferred "all-safe" state is created by skipped classification.
6. Guard CPU time (default 35 s), max face count (75,000), max vertex count (100,000), per-vertex indexed valence (64) and vertex-only pair budget (600,000); any budget violation is **INDETERMINATE_CPU_BUDGET**, NOT zero-collision certified.

Numerical tolerances scale with global AABB diagonal; all dimensions are arbitrary/un-calibrated model units. A common-ray finding may be mere geometric overlap/touching, not a mechanical defect. A zero finding cannot certify that shared-edge face pairs never fold, near-coplanar surfaces never overlap, or close-but-not-shared-index triangles never have a different collision.

**Regardless of the results:** \`trueSelfIntersectionFreeCertified=false\`, \`printQualified=false\`, \`approvedForPrinter=false\`, \`fabricationAction=NONE\`.

## Adversarial validation and replay

Python regression covers:
- Two triangle sectors sharing ONLY O=(0,0,0), crossing along a **nonzero ray beyond O** => positive potential extra contact flagged.
- Different triangles with a NORMAL, single shared vertex but disjoint rays => no extra contact candidate.
- Exactly coplanar triangles => explicitly unresolved, not a false pass.
- Ray collinear with one triangle's face edge => borderline unresolved instead of a confident hit.
- Edge-sharing pair => excluded from vertex-only enumeration.
- Valid box with arbitrary intentional sharp corners => shared-vertex contact not automatically a defect.
- Procedural sphere and prior genuine chair => 0 additional ray candidates, not manufactured proof of full clearance.
- Winding reversal leaves all geometric pair counts unchanged.
- CPU time/pair caps, malformed vertices and degenerate faces => hard refusal or INDETERMINATE; no inferred all-safe result.
- Existing private proof modification => immutable output rejects overwrite.

Private read-only reproduction on Chris using the **already-completed** local TripoSR job UUID:

    runtime\engines\triposr\venv\Scripts\python.exe scripts\g3-10-verify-cpu-replay.py --job-id <EXISTING_COMPLETED_LOCAL_JOB_UUID>

This recomputes all four geometry screens and checks EVERY deterministic JSON field against the private reports, ignoring CPU elapsed timing. It executes no AI and modifies no file.

Sanitized immutable public evidence assembly, with the same private job ID supplied ONLY on the command line:

    npm run proof:g3:orb:vertex -- --job-id <EXISTING_COMPLETED_LOCAL_JOB_UUID>

[Read the SHA-locked G3.10 results](evidence/g3/orb-01-g310-shared-vertex-ray-screen.json)

Private raw reports and model binaries remain in gitignored runtime. The public report includes only licensed fixture IDs, source/model SHA digests, bounded counts, explicit limitations and printQualified=false; it contains **no** private job UUID, customer photo, source model binary, human name, source media, API keys or local Windows path. Local integrity proves SHA-locked evidence, not independent external GPU attestation.

## Three complementary screens — still not manufacturing clearance

G3.8: non-adjacent triangle pairs with *no shared indexed vertex*, SAT potential-contact screen -> **43,025 eligible pairs** on orb, 0 potential contacts flagged; numerical floating-point, not exact.

G3.9: complete *indexed edge-adjacent* face **normal angle distribution** -> **60,528 indexed edge pairs**, p95 33.019°, 312 >45°, no >90°. This is an ANGLE test, **not** geometric intersection testing of shared-edge pairs.

G3.10: *exactly-one-vertex adjacent* non-coplanar common-ray risk -> **190,860 eligible pairs**, 0 extra non-coplanar-ray candidates flagged. Again a bounded numerical diagnostic, **not** an exact-predicate collision certificate.

**Still untested / blocked:** coplanar or extremely close surface foldovers, actual surface intersection of edge-adjacent triangle pairs, geometrically coincident coordinates with distinct vertex indices, true minimum wall thickness, mm-scale/units, small features, base orientation/supportability, material strength, slicing, printer-specific profile and physical QA. The orb surface remains visibly uneven vs GT; none of G3.8–G3.10 performed smoothing or shape repair.

Private actual model outputs stay **2/9** (historical licensed chair and single authorized real orb); seven project-original G3 images require new explicit individual GPU approvals before inference. The checked-in historical public benchmark file remains a fixed earlier 1/9 baseline, NOT current private coverage. No new GPU tasks authorized.

No Office 2.0, VelvetOS, Windows security policy, printer services, model weights or checkpoint path was modified. Security/sandbox advisories remain open under Issue #4; print qualification and benchmark work remain open under Issue #3.
