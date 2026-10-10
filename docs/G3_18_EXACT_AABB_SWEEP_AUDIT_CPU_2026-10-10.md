# LOCAL3D G3.18 — independent exact-AABB sorted-X sweep corroborates numerical KD-tree candidate coverage (CPU only)

Date: 2026-10-10 | Release: v0.2.18-g3-exact-aabb-sweep-cpu

## Scope, model rights and safety

Independent spatial-candidate completeness audit for four SHA-pinned, previously licensed, existing GLBs. Works with finite decoded IEEE-754 vertex coordinates already present in GLB. It does not recover ideal CAD precision, establish physical millimeters, evaluate wall thickness or approve 3D printing. No inference, GPU, cloud, installer, printer or Office operations.

Starting source: previous G3.14 conservative numerical AABB set; G3.15 exact indexed full-edge contact; G3.16 exact single-index-vertex contact; G3.17 exact rational triangle contact on every no-index numerical AABB candidate. The prior source-job rights and SHA verifiers remain in force.

## What changed: mathematically exact AABB comparisons, independent enumeration

New CPU module: engines/quality/exact_aabb_sweep_audit.py

1. Verify one closed, consistently wound connected indexed manifold from a trusted SHA source. Decode finite XYZ; compute per-triangle min/max 3D boxes. Enforce max 75k faces, 100k vertices, absolute XYZ <=1e9, 30 million X-axis candidates, 750k rational AABB candidates, 300k no-index pairs and 105s CPU per model.
2. Independently sort triangle boxes by minimum X. For each, visit every later X-min overlapping its maximum X within declared fixed binary-float margin max(1e-12, mesh-diagonal * 1e-9). This spatial pass NEVER queries SciPy cKDTree.
3. The margin additions used in X/Y/Z prefilters are first rounded OUTWARD with nextafter(approximate_sum,+infinity), to avoid rejecting an exact-binary-float candidate prematurely. For each 3D candidate surviving cheap conservative Y/Z prefilters, convert AABB endpoint floats and the tolerance to Fraction.from_float, run six mathematically exact rational interval comparisons for the fixed tolerance, and separately run six exact comparisons with ZERO margin to count strict AABB overlaps.
4. Independently categorize every AABB pair into 0/1/2 shared original indexed vertex IDs; verify aggregate totals against SHA-pinned G3.14. Retain the exact no-index pair IDs only in PRIVATE memory, compare the whole membership set (not only total count) to the separate prior G3.17 numerical KDTree candidate set.
5. Any exact toleranced or strict no-index candidate missing from G3.17 is INDETERMINATE, never falsely "geometry clear". Exhausted CPU budget, invalid/malformed model, unexpected SHA, nonidentical private immutable evidence or changed prior proof also fail closed. Source image/private job UUID/model binary/face pair indices NEVER published, even in error messages.

A strict, zero-margin rational AABB overlap is NECESSARY for two finite triangles in already-decoded GLB coordinates to intersect. The outward-rounded prefilters + sorted-X enumeration preserve every strict exact-AABB candidate for the finite bounded decoded XYZ under this declared arithmetic model. This does NOT independently certify all prior full triangle-triangle narrowphase math, re-create unquantized original CAD precision, or establish physical printability.

## PREVIOUS real sources — measured exact AABB coverage

| SHA-verified historic GLB | Indexed faces | Exact toleranced 3D AABB candidates | Indexed shared-edge | Indexed one-vertex | Exact no-index | Exact no-index candidate IDs missed by G3.17 |
|---|---:|---:|---:|---:|---:|---:|
| Previously generated real 01-orb-alpha TripoSR orb | 40,352 | 294,495 | 60,528 | 190,860 | 43,107 | 0 |
| G3.7 same-surface winding derivative | 40,352 | 294,495 | 60,528 | 190,860 | 43,107 | 0 |
| Project original procedural GT sphere | 1,280 | 7,866 | 1,920 | 5,730 | 216 | 0 |
| Previously licensed MIT chair derivative | 19,972 | 151,180 | 29,958 | 92,629 | 28,593 | 0 |

The 40,352-face real orb contains 23,579,289 X-axis potential pairs. Independent exact 3D AABB tests narrowed this to 294,495, with a no-index set of 43,107 that is IDENTICAL BY PAIR MEMBERSHIP to the G3.17 numerical KDTree stage. These 43,107 already received exact rational narrowphase in G3.17, all EXACT_DISJOINT. The G3.7 winding-only derivative reproduces the same counts; original procedural GT contains 99,340 X-axis potential pairs, 7,866 exact toleranced 3D AABB candidates.

Four immutable source GLB SHA values, historic successfully completed G2 source job assets, project image rights, G3.14/15/16/17 trusted aggregate proofs and source SHA were revalidated. Public summary: [sanitized G3.18 four-source exact-axis report](evidence/g3/orb-01-g318-exact-axis-sweep-proof.json). Private canonical pair ID sets and source identifiers stay in ignored runtime only; public data is aggregates and preexisting model/image SHA.

## Adversarial verification

17 new G3.18 Python adversarial tests compare sorted-X exact AABB enumeration with an INDEPENDENT brute-force O(n²) full all-pair Fraction-based reference on small 3D meshes. Cases cover true line/area intersections, indexed full-edge and single-vertex topologies, coincident XYZ with different IDs, tolerance-only AABB near-cases vs strict zero-margin, distant planes, winding/reindexing/translation invariance, existing sphere and chair source SHA, forced omission of one exact candidate from a simulated numeric KDTree response (must fail INDETERMINATE), X/box/no-index/time resource caps, invalid geometry and immutable evidence tampering. Three new Node checks enforce source SHA history, all G3.14/17 aggregate counts, exact membership boolean and no leakage of job/model/face-pair identifiers. Full pinned CPU Node, Python and Chrome regressions are required before release.

On Chris under D:\Velvet\Projects\local-3d-generator, ONLY local CPU:

    runtime\engines\triposr\venv\Scripts\python.exe -m unittest discover -s engines\quality -p test_g318_exact_aabb_sweep.py

Read-only previously licensed model SHA-provenance replay (private historic actual G2 job identifier NEVER included in docs or public log):

    runtime\engines\triposr\venv\Scripts\python.exe scripts\g3-18-exact-aabb-replay.py --job-id <HISTORIC_COMPLETED_PRIVATE_ORB_JOB_ID>

Only the first immutable local private proof and public sanitized proof were created with --prepare-private --write-public; later verification MUST run without these flags and will fail if source/evidence bytes differ.

## OPEN: print/manufacturing and OS security gates

This milestone corroborates candidate completeness and exact narrowphase coverage within the specified decoded-coordinate GLB and bounded CPU model. Still missing: independently corroborated alternative triangle intersection kernel / broad adversarial differential fuzz, unquantized CAD precision, physical mm calibration, smallest wall thickness/feature, internal voids, supports/material strength, slicer/printer specifics, physical print quality and user-untrusted parser sandbox.

Issues #3 geometry/manufacture and #4 pinned Python advisories/OS confinement/egress remain OPEN. Real inference benchmark still **2/9** historic outputs; seven distinct remaining images each require independent explicit GPU authorization. This work grants no GPU, cloud, printer, model weight install, Office or unrelated service 4178 rights. All outputs DRAFT. globalSelfIntersectionFreeCertified=false, printQualified=false, approvedForPrinter=false, fabricationAction=NONE.

Next G3.19: independent differential exact triangle contact predicate audit against a second implementation, bounded randomized adversarial suites, and later physical-scale + minimum-wall-thickness validation after measurement input. Do NOT conflate decoded-geometry diagnostic evidence with real manufacturing certification.
