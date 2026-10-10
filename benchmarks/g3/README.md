# LOCAL3D G3 benchmark fixtures (2026-10-10)

This is a **source-provenance dataset**, not results claiming that any AI model generated all nine objects. All assets are local and SHA-locked; the generator runs only on CPU.

- **8 project-original procedural 3D scenes**, produced by scripts/g3_make_fixtures.py, without importing third-party photos or shapes. Each has input.png (synthetic render), foreground-mask.png (pixel-level reference) and ground-truth.glb (the generated **source 3D geometry**, NOT an AI prediction).
- **1 licensed upstream TripoSR chair photo** (docs/evidence/g2/source-chair.png, original source from the TripoSR MIT project), plus its alpha-derived foreground-mask.png. No ground-truth original CAD mesh exists for it. An existing separately verified TripoSR real GPU output is linked in its manifest.
- 9 distinct categories: convex simple orb, identical geometry on opaque background, open-mouth vase, torus through-hole, disconnected components, thin chair legs/back, toothed gear, arch gap/overhang, real upstream chair.

## Exact fixture files and rights

The **manifest.json** records fixture ID, source-rights claim, category, file names, original source SHA256, exact reference mask SHA256 and ground-truth GLB SHA256 (for the eight originals). This document's source/rights classification is an engineering attestation, not a formal legal opinion. There is no redistribution of third-party models other than the tiny already-licensed example photo from TripoSR MIT. The project-original shapes have no claimed real-world manufacturing units.

To reproducibly validate original sources on Windows:
    runtime\engines\triposr\venv\Scripts\python.exe scripts\g3_make_fixtures.py

The generator refuses to overwrite any existing changed fixture. A repeat run was verified byte-for-byte, identical manifest SHA256 763ba54272b2b09f89346521e786c1a698423c4c07b64b554e389ac964bc1d0a. This is a stable source set, not model outputs.

## Public scorecard generated from recorded outputs, not AI simulation

The SHA-verified, read-only coverage ledger is stored at docs/evidence/g3/benchmark-coverage.json. It deliberately counts only the previous TripoSR MIT chair real E2E output (**1 of 9**) and records eight NO-AI-YET references. It distinguishes original synthetic GT from AI reconstructions and marks post-hoc silhouette views exploratory, not calibrated accuracy. The CLI is npm run benchmark:g3; optionally scan private local G2 jobs with --jobs-dir runtime/data-g2-manual/jobs to produce a **gitignored** private report. No model runs or original source media are uploaded externally.

## Current evaluation state

- Eight original source/GT pairs have an **exact-camera, positive-control silhouette** verification (not AI inference). Minimum projected-mask IoU: 0.935812 after consistent bounding-box normalization. See docs/evidence/g3/silhouette-positive-controls.json.
- Existing real TripoSR output for ninth upstream chair was scanned **only after it already existed**. A diagnostic search across 24 yaw/elevation views gave provisional best normalized silhouette IoU 0.82448. This is NOT a calibrated accuracy benchmark, not camera-aligned ground truth, and not production QA.
- **No G3 synthetic image has been run through TripoSR or another AI provider.** The existing real chair was run previously in G2. There are no comparative provider ranking results yet.
- Geometry of the existing real chair was independently scanned: 1 component, 19972 triangles, watertight-index topology true, consistent triangle winding, negative signed volume -0.0613843 arbitrary cubic units. Thus positive-volume check FAIL despite watertight true. Not print-qualified.

## Repeatable CPU-only audit

    runtime\engines\triposr\venv\Scripts\python.exe engines\quality\geometry_qa.py --model docs\evidence\g2-app\real-app-output.glb --out docs\evidence\g3\chair-geometry.json

    runtime\engines\triposr\venv\Scripts\python.exe engines\quality\silhouette.py --positive-controls --out docs\evidence\g3\silhouette-positive-controls.json

    runtime\engines\triposr\venv\Scripts\python.exe engines\quality\silhouette.py --fixture 09-upstream-chair --model docs\evidence\g2-app\real-app-output.glb --out docs\evidence\g3\chair-silhouette-exploratory.json

    runtime\engines\triposr\venv\Scripts\python.exe -m unittest discover -s engines\quality -p test_quality.py -v

Commands are idempotent for unchanged already-generated reports. No torch import or CUDA inference is done by these scripts.

## What can and cannot be scored

Measured: binary mask, reference projection, mesh triangle count, disconnected components, indexed-edge incidence, signed volume, winding, positive/negative volume, approximate view-specific silhouette overlap and source SHA.

**Not measured:** actual millimeter dimensions, structural integrity, minimum wall thickness, supportability, interpenetrations/self-intersections, per-surface aesthetic quality, calibrated single-view camera reconstruction or print readiness. Positive controls are generated from the same source geometry and are therefore NOT predictions of AI model accuracy.

## Future GPU benchmark protocol (NOT EXECUTED)

If new per-job model-use approval and a live no-conflict check are obtained, submit the 8 new original images one at a time through G2 manual UI. No unattended queues. For each: capture input SHA/model config/seed (if supported), output SHA, worker wall time, NVIDIA shared-VRAM preflight/peak, CPU geometry report and provisional silhouette metric; compare to known GT dimensions only in arbitrary normalized synthetic units. Review the actual 3D geometry and human visual fidelity. Then repeat under the same protocol with a license-qualified second provider, if any.

Never infer a winner from one sample or print release from watertightness.
