# LOCAL3D G3.13 — exact-rational triangle PAIR predicates (CPU, selected pairs only)

2026-10-10 | Release `v0.2.13-g3-exact-selected-pairs-cpu`

**Engineering foundation, not whole-mesh certification.** Adds reusable exact arithmetic for pairwise triangle intersection signals, using the Python standard-library `fractions.Fraction` on values ALREADY decoded as IEEE-754 floats from GLB. Every result refers to those numeric GLB coordinates, **not** an ideal underlying CAD surface, millimeter geometry or physical measurement. No model/GPU run, no mesh edit, no cloud or printer/slicer use.

## Motivation

Earlier G3.8 examined 43,025 nonadjacent TripoSR orb face-pair candidates with a floating-point SAT risk screen; G3.9–G3.11 examined distinct narrow categories of indexed adjacency risk; G3.12 screened spatially duplicate vertex *identifiers*. None of those guarantees exact global self-intersection absence. G3.13 lays one building block for a later independently scoped **whole-mesh triangle-pair classifier**. G3.13 **DOES NOT** yet provide that complete pair enumeration, true robust global self-intersection test or physically calibrated mesh qualification.

## Narrow classifier, input assumptions and result vocabulary

New `engines/quality/exact_triangle_predicates.py`:
- Takes **two explicitly supplied triangle coordinate triplets** or a bounded set of specifically selected face pairs. It does **not** choose potentially intersecting face pairs on its own.
- Converts each finite, bounded coordinate to the exact binary-float rational representation. Signed tetrahedral orientation volumes are evaluated in rational arithmetic, not float tolerances.
- Detects a *strict* noncoplanar segment-through-triangle interior piercing using opposite exact plane signs plus three exact oriented edge-side signs. Zero/boundary determinants yield **UNRESOLVED**, not a false piercing claim.
- For exact coplanarity of the supplied binary coordinates, projects to a valid 2D plane and performs rational polygon clipping. **Positive clipped area** is an overlap signal; zero-area boundary-only contact is distinguished from separated triangles.
- Exact strict plane separation is detected where all vertices of either triangle are on one strict side of the other's plane. If none of the limited tests proves a crossing, no global geometry certificate is claimed.
- Bounded batch accepts at most **256 explicitly supplied sorted face pairs**, max **15 seconds** for the batch, at most **100,000 vertices** and **75,000 faces**, and finite vertex coordinates of absolute magnitude <= 1e9. An incomplete CPU time budget returns **INDETERMINATE**.
- The Python-level pair module does not load unknown multi-user model uploads, replace the native GLB parser, define a BVH, calculate global thickness, emit 3D printer files or automate actions.

**Exact binary-float predicate** is not equivalent to exact manufacture geometry. GLB vertices may have already lost detail under float32 export/quantization, and the mesh's coordinate units remain UNKNOWN. Any zero finding on a small selected pair list cannot certify anything about the millions of unselected possible pairs.

## Adversarial CPU tests

19 targeted Python controls cover strict transverse crossing and symmetry; tiny exact crossings; coplanar containment, identical triangles and winding changes; shared-edge legitimate zero-area contact; single-vertex touching; exact noncoplanar plane separation; clear disjoint coplanar triangles; out-of-bounds and just-boundary piercing; malformed/complex/NaN/oversized/degenerate inputs; caller-supplied invalid pair IDs; explicit pair limits and time-budget fail-closed status; and actual procedural source shared-edge sample that always remains **NOT PRINT QUALIFIED**.

## Read-only already-existing real-model selected-pair replay

`scripts/g3-13-selected-pair-replay.py` rechecks exact SHAs of the previous genuine completed `01-orb-alpha` model, its **same-surface winding-only copy**, the project-original procedural GT and historical licensed chair. For each geometry it chooses **ONLY the first 24 lexicographically ordered indexed shared-edge-adjacent face pairs**. This is **not a statistical sample** and not an exhaustive AABB/SAT scan. All four selected sets yield **24 UNRESOLVED_EXACT_BOUNDARY_OR_PARTIAL_COINCIDENCE** classifications. These triangles are necessarily already touching by construction (they share a known indexed edge). **These unresolved results are expected and are NOT 24 real collision defects.**

| Source (previously existing only) | Total indexed shared-edge pairs | Chosen for G3.13 | Exact boundary/partial-coincidence unresolved |
|---|---:|---:|---:|
| Real TripoSR orb | 60,528 | **24** | **24** |
| Winding-only derivative | 60,528 | **24** | **24** |
| Procedural GT sphere | 1,920 | **24** | **24** |
| Historical chair | 29,958 | **24** | **24** |

The experiment intentionally exercises legitimate indexed-adjacent boundary contacts to prove a narrow exact predicate must NOT be promoted automatically into a global mesh intersection-free verdict. It does not reconstruct new models or mean 96 unique material samples.

Sanitized [SHA-locked selected-pair evidence](evidence/g3/orb-01-g313-selected-exact-pair-predicate.json) contains only fixed model SHA references and bounded summary counts, **not** any private job UUID, face indices, geometry, images or paths.

## Reproduction on Windows Chris (CPU only)

From `D:\Velvet\Projects\local-3d-generator`:

    runtime\engines\triposr\venv\Scripts\python.exe -m unittest discover -s engines\quality -p test_g313_exact_predicates.py

Read-only proof, providing the already-completed private job UUID ONLY on local CLI:

    runtime\engines\triposr\venv\Scripts\python.exe scripts\g3-13-selected-pair-replay.py --job-id <PREVIOUS_COMPLETED_PRIVATE_JOB_UUID>

The initial G3.13 sanitized public JSON was generated once with `--write-public`. This switch refuses divergent preexisting evidence; it is not an inference authorization. Normal operation uses read-only replay.

## Explicit unsolved gates

- **Not implemented:** complete, independent, efficient BVH/broadphase candidate enumeration + proof of coverage; exact robust distinction of touching-vs-penetration across ALL indexed/shared/near-coplanar pairs; global self-intersection certification and full degeneracy handling. Selected pair classification alone cannot solve these.
- **Unknown:** physical millimeter scale, actual minimum wall thickness, structural integrity/materials, supports, slicer/printer profiles, manufactured quality, CAD tolerance, seven unrun additional GPU fixture outputs.
- **Security Issue #4:** pinned Python advisory remediation, OS-backed parser/network sandbox, file retention and multiuser input safety unresolved.
- **Quality Issue #3:** still open. A ready-for-print outcome is never emitted.

No Office/VelvetOS/Fabrication Router change, no model weights, Python dependency install, OS settings, cloud service, new GPU job, slicing or printer action was performed. All outputs DRAFT, `printQualified=false`, `approvedForPrinter=false`, `fabricationAction=NONE`. The real completed AI output count remains **2/9**, not increased by these CPU scans.

**Next engineering target:** independent bounded full-mesh broadphase & exact-predicate routing that discriminates legitimate indexed vertex/edge adjacency from additional intersections and fails closed on all ignored/ambiguous or resource-limited pairs. Only after source-verified full coverage could the code contribute to a broader manufacturing gate, never replace physical QA.
