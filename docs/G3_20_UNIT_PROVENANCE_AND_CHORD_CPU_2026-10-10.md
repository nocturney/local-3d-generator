# LOCAL3D G3.20 — physical-unit provenance and sampled normal-ray chord screening (CPU only)

Date: 2026-10-10 | Planned tag: v0.2.20-g3-uncalibrated-units-chords-cpu

**No physical size calibration exists.** Source model image-to-3D generation, model export and glTF metadata cannot establish any correspondence between a GLB coordinate and a real millimeter. G3.20 is a DRAFT CPU-only analysis. It DOES NOT measure true local minimum wall thickness, identify manufacturable tiny features, certify physical dimensions, trigger a printer, or authorize new GPU inference.

## Important source finding: exporter metadata is NOT a physical unit attestation

Verified the historical TripoSR worker source (engines/triposr/worker.py) and Y-up rotation derivative (engines/triposr/reorient.py). The image-to-mesh pipeline produces model coordinates and exports GLB with a rotation for orientation; it does not ingest a known physical measurement, a camera-calibration-derived real-world dimension, a trusted ruler measurement, or a source/target millimeter ratio. G3.7 and G3.8 shape scores independently normalize AABB diagonals; those metrics intentionally cannot validate physical scale.

The SHA-locked prior real TripoSR orb GLB, G3.7 positive-winding derivative, original procedural GT sphere, and previously licensed MIT chair GLBs were individually read as structured glTF/GLB v2 binaries. A **Trimesh-generated mesh extra field "units": "meters"** appears in the G3.7 derivative and historic chair. Such a self-declared exporter hint, even if syntactically valid or reflecting a general glTF convention, is NOT a verified dimension of a subject that was reconstructed from a single input image. Similarly, a fake user-supplied "millimeters" hint cannot authorize conversion.

G3.20 therefore records metadata claims in a strictly bounded allow-list and returns:
- physicalMillimeterScale = UNKNOWN_UNCALIBRATED
- sourceVerifiedMillimetersPerGLBUnit = null
- mmPerGLBUnit = null
- independentMeasuredReferenceMm = ABSENT
- physicalMinWallThicknessMm = null
- safeToConvertToMillimeters = false
- printQualified = false

These are hard gates for all four source records, irrespective of what the GLB metadata claims. Unrecognized private text in metadata is replaced by OTHER_UNVERIFIED_STRING, never published verbatim.

## CPU diagnostic methods, not wall-thickness measurement

New module: engines/quality/unit_scale_and_chord_screen.py. It:
1. Verifies source GLB version/bounds, SHA, one closed connected watertight/manifold/winding-consistent trusted mesh, finite indexed geometry and public metadata. No repair, no vertex welding, no model creation.
2. Computes all indexed triangle edge lengths and mesh extents as ARBITRARY GLB UNITS, not an actual printable feature measurement. Triangulation edge length is influenced by tessellation and can be much smaller/larger than a real printable feature; it is never a wall-thickness threshold.
3. Only for a positively oriented closed manifold, selects up to **128 deterministically distributed triangle face barycenters**, traces a single FLOAT64 ray along the **negative oriented face normal**, excludes triangles sharing any original face vertex index, and reports the nearest interior ray hit. Points hitting triangle boundaries or ambiguous ray/face configurations are explicitly excluded, not treated as safe.
4. Returns descriptive min/p10/median/p90/max **first-hit ray chords** in native GLB units and normalized to object AABB diagonal, together with confidence/sample counts. Such chords may traverse an ENTIRE SOLID (as on a fully filled sphere): they are **not** a local wall-thickness measurement or a global minimum, even when numerically tiny. No absolute mm or printer pass/fail threshold.
5. If source signed volume is NONPOSITIVE, the direction "inward" is not verified. The original real TripoSR orb is exactly this case: **zero** inward rays are performed, status INDETERMINATE_UNVERIFIED_NORMAL_ORIENTATION. The previously proven G3.7 same-surface positively wound derivative can be sampled separately, without modifying or overwriting the original. Invalid source, orientation, CPU budgets and numeric ambiguity are explicit, fail-closed outcomes.

Budgets: up to 75,000 triangle faces and 100,000 vertices, absolute finite GLB coordinates <=1e9, 128 centroid probes and 10,000,000 source-candidate ray/triangle comparisons per mesh, 45 seconds CPU. Further bounds remain in geometry_qa and prior G3.14 input validation. Query CPU does not instantiate a GPU model, connect to the network or operate a printer. The method is numerically approximate for ray/face hits and intentionally NOT a certified geometric minimum distance.

## Historical SHA-pinned source results (no new AI output)

| Previous authorized SHA model | Faces | Positive signed volume? | glTF mesh units claim | Completed inward normal-ray samples | First-hit chord median, arbitrary GLB units |
|---|---:|---|---|---:|---:|
| Genuine historical TripoSR real orb | 40,352 | NO | None | **0 — INDETERMINATE orientation** | Unavailable |
| Same-surface G3.7 winding-only derivative | 40,352 | YES | "meters" exporter hint (unverified) | 128/128 | approximately 0.84358 |
| Project-original procedural GT sphere | 1,280 | YES | None | 128/128 | approximately 1.71371 |
| Historical licensed MIT chair derivative | 19,972 | YES | "meters" exporter hint (unverified) | 128/128 | approximately 0.09067 |

The GT sphere radius is 0.86 coordinate units, so a ray running through the solid and reaching its opposite surface has chord length around 1.71 coordinate units. It emphatically does not measure a thin/solid shell wall.

Historical source GLB SHA-256, input image license and previously completed real G2 job assets are verified using the existing rights validator, and prior G3.19 source rights/proof is crosschecked before and after calculation. Immutable private per-model reports reside only under gitignored runtime and never go to GitHub; public source-hash-only aggregate report:
[Sanitized G3.20 unit-provenance and chord evidence](evidence/g3/orb-01-g320-unit-chord-cpu.json)

## Adversarial verification and exact safety boundary

New G3.20 Python tests cover misleading meters/millimeters GLB extras, unrecognized sensitive metadata redaction, original signed-volume inversion that DISABLES normal-ray tracing, true nonzero ray samples for non-symmetric oriented meshes, a thin-looking offset rectangular prism as a CHORD proxy, a symmetric box with all ray hits ON shared triangle boundaries (explicit ambiguity, not a clear result), full sphere showing a long solid chord, 3x coordinate rescaling in native units without mm conversion, incomplete time and comparison budgets, empty/malformed/nonclosed geometry refusal, SHA-pinned historical GT/chair and immutable report tampering. New Node tests enforce source license SHA ancestry, negative/positive orientation policies, public metadata privacy and null physical millimeters.

Run with existing PINNED CPU Python interpreter from Chris LOCAL3D checkout:

    runtime\engines\triposr\venv\Scripts\python.exe -m unittest discover -s engines\quality -p test_g320_unit_chord_screen.py

Read-only four previously completed source SHA replay, using the PRIVATE original real orb job UUID known locally only (never publish or commit the UUID):

    runtime\engines\triposr\venv\Scripts\python.exe scripts\g3-20-unit-chord-replay.py --job-id <PREVIOUS_PRIVATE_COMPLETED_REAL_ORB_JOB_UUID>

Private immutable reports and public SHA aggregates were initially written with --prepare-private --write-public for existing sources only. Subsequent replay WITHOUT those flags validates bytes and source/provenance again. No new neural model, GPU, network, printer, OS configuration or Office change.

## Remaining manufacturing and security release gates

**Nothing G3.20 reports may be called minimum physical wall thickness, measured millimeters or print-safe geometry.** To calibrate, obtain an independently verified physical reference dimension with units, known mesh-coordinate landmark correspondence, controlled generation/export transforms, source-rights provenance and explicit operator approval. Even a later verified length-scale multiplier does NOT certify walls: genuine local minimum thickness may require robust opposing surface/inside/outside topology, triangle-surface spacing, tolerances, materials and printer-specific test prints. No such measurements were done.

GitHub Issues #3 geometry/manufacturing and #4 Python OSV advisory/OS sandbox/egress remain OPEN; real AI benchmark outputs remain 2/9 (seven unrun model jobs each need separate explicit GPU approval). The real original orb normal orientation and GLB meter-hint caveat must persist in handoff. Every output DRAFT, minimumWallThicknessTested=false, globalSelfIntersectionFreeCertified=false, printQualified=false, approvedForPrinter=false, fabricationAction=NONE.

Next possible G3.21: validated operator-provided physical reference and provenance contract with fail-closed absent evidence (do not invent mm); follow with bounded minimum wall-thickness geometry methods only after requirements/certification. Alternatively address Issue #4 advisories in a read-only/CPU-only classification without changing Windows security posture.
