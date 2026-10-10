# LOCAL3D G3.12 — CPU-only spatially coincident DIFFERENT vertex indices

Date: 2026-10-10 | Release: v0.2.12-g3-spatial-index-cpu

**Scope: existing GLB geometric diagnostics ONLY.** No CUDA, new image-to-3D inference, cloud, model install, printer/slicer, Office 2.0 or Windows security changes. Prior G3 orb and chair sources were SHA-verified and rescanned on CPU. All results remain DRAFT, NOT PRINT QUALIFIED.

## Gap addressed, and what it cannot prove

G3.8 considered nonadjacent triangle pairs under *indexed* adjacency, G3.9 checked angles of pairs sharing an indexed edge, G3.10 considered pairs sharing exactly one indexed vertex, and G3.11 checked same-side coplanar shared-edge fold candidates. Those passes did NOT detect two **different** vertex indices that refer to the same (or very close) XYZ position. An indexed mesh may be connected by its indices while separate geometric shells touch, or separate indexed components may have matching coordinates. UV/material seams may also intentionally duplicate a coordinate under different indices.

G3.12 independently compares spatial position pairs across all different vertex IDs, then distinguishes whether their face-edge *indexed-connected components* are equal. Cross-component candidate pairs can indicate touching components **at vertices**. They are not proof of actual penetrating shell intersection; absence of these pairs cannot exclude face-interior–face-interior intersections without nearby vertices.

This stage never welds/merges vertices, alters the triangulation, automatically repairs, or authorizes a print.

## Method and explicit numerical boundaries

New reusable module: `engines/quality/spatial_index_proximity.py`.

1. Validate bounded finite, nondegenerate indexed triangles with integer indices, all referenced vertices, positive nondegenerate object bounds; reject unsafe input. The real-GLB wrapper independently verifies single-mesh GLB provenance, each indexed shell closed, winding consistent and no invalid edge topology. A model may contain multiple indexed components so the scan can identify touching shells; multiple scene objects are deliberately unsupported rather than silently ignored.
2. Compute **indexed** connected component labels from the triangles' vertex-ID edges using sparse graph traversal, *not* from geometric proximity.
3. Query a CPU SciPy cKDTree over the original immutable vertex coordinates. Search radius = **1e-7 × 3D bounding-box diagonal**, in arbitrary GLB model units (NOT millimeters). Pairs with exactly equal XYZ coordinates are counted as **exactly coincident**; different-but-in-radius coordinates are counted as **near**.
4. A k-neighbor sentinel detects dense clusters where the limited neighbor census would otherwise miss pairs. Above **32 neighboring different IDs per vertex** or **200,000 candidate pairs**, return **INDETERMINATE** with null counts, never zero/clean. Other budgets: 100,000 vertices, 75,000 triangles and 35 seconds. Overflow, invalid topology and resource/time failures never become clearance.
5. Count candidates within vs across indexed components. Private example vertex indices remain in ignored local reports; the published summary deliberately strips them.

Tolerance is a *chosen numerical relative resolution*, not a measured printer capability. Extremely close distances below floating-point precision and triangle contacts with no vertex pair in this radius remain outside this screen. KDTree numerical behavior is not an exact arithmetic collision proof.

## SHA-verified CPU results from four PREVIOUSLY EXISTING models

| Model | Vertices | Triangles | Indexed components | Exactly equal, different IDs | Near, different IDs | Cross-component proximity |
|---|---:|---:|---:|---:|---:|---:|
| Previously authorized REAL TripoSR `01-orb-alpha` | 20,178 | 40,352 | 1 | **0** | **0** | **0** |
| G3.7 exact-surface winding-only copy | 20,178 | 40,352 | 1 | **0** | **0** | **0** |
| Original project procedural GT | 642 | 1,280 | 1 | **0** | **0** | **0** |
| Prior MIT chair orientation copy | 9,986 | 19,972 | 1 | **0** | **0** | **0** |

All four censuses were completed within caps at the specified tolerance. The original inference GLB retains SHA256 `f37a812bc4414ddee34bcb19d2e7535f25d219a3731c14f2dcc89c2c7ba030e2`; the *copy-only* winding derivative SHA remains `ab2e5aeb55598624209eeca3e700abef93a69a52886c63ecad6a840e62d8d68f`. Their spatial-index observations are identical because global face winding does not change coordinates or connectivity. This is **0 detected vertex proximity candidates**, NOT proof that a 40k-triangle surface is globally self-intersection-free, smooth or printable.

## Adversarial controls (12 new Python tests)

- Two triangles with **different indices** and exactly equal geometry MUST report three exact cross-component pairs.
- Near copies offset below the relative tolerance MUST be near candidates, not exact duplicates; distant geometry MUST not be flagged.
- Coincident XYZ under different indices **within one indexed component** is not conflated with cross-component contact.
- Valid cube and procedural icosphere do not receive spurious duplicate indices; legitimate same-index vertex sharing is never a different-index pair.
- Two closed boxes whose faces touch and whose indices are disconnected MUST register cross-shell vertex proximity.
- Dense clusters exceeding neighbor/pair caps become **INDETERMINATE**, never a clean zero count.
- Malformed indices, unreferenced vertices, NaNs, degenerate faces and unsafe tolerances are rejected; private output reports are immutable.
- Known earlier chair GLB remains DRAFT.

Three added Node assertions verify cross-release SHA lineage (G3.11), all four summaries, strict DRAFT/no-printer metadata, and absence of private job UUID/path/raw indices.

## Reproduction on Chris (CPU only)

From `D:\Velvet\Projects\local-3d-generator`, using the already installed pinned local Python 3.11 environment:

    runtime\engines\triposr\venv\Scripts\python.exe -m unittest discover -s engines\quality -p test_g312_spatial_index_proximity.py

Private immutable four-model reports were created once with:

    runtime\engines\triposr\venv\Scripts\python.exe scripts\g3-12-verify-spatial-replay.py --job-id <PREVIOUSLY_COMPLETED_PRIVATE_JOB_UUID> --prepare-private

Subsequent read-only SHA-locked replay (no write):

    runtime\engines\triposr\venv\Scripts\python.exe scripts\g3-12-verify-spatial-replay.py --job-id <PREVIOUSLY_COMPLETED_PRIVATE_JOB_UUID>

Sanitized immutable evidence verification/assembly:

    npm run proof:g3:orb:spatial -- --job-id <PREVIOUSLY_COMPLETED_PRIVATE_JOB_UUID>

Public verified output: [orb-01-g312-spatial-index-proximity.json](evidence/g3/orb-01-g312-spatial-index-proximity.json). The prior real job UUID, private model blobs, image media, raw vertex examples and per-job reports never enter Git. The private actual completed-AI-output coverage is **still only 2/9**; seven original fixtures require fresh separate GPU consent and were NOT run.

## Unresolved / blocked gates

G3.12 closes only the *bounded different-index vertex position candidate inventory*. It does **not** establish robust global triangle-triangle self-intersection freedom (including face/edge interiors and coplanar degeneracies), a physically measured scale, wall thickness, cavities, manufacturing tolerances, supportability, strength or slicer/printer suitability. A zero candidate result also does not establish no geometric contact between disconnected shells. Issue #3 remains OPEN. Python advisories, OS sandbox, retention/egress and production untrusted-media security stay open under Issue #4.

**printQualified=false, approvedForPrinter=false, fabricationAction=NONE.** No printing, Fabrication Router, GPU inference, model cloud service, Office core change or OS policy change authorized or performed.
