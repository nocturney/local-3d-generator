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

## G3.10 shared-one-vertex extra ray CPU diagnostic

The completed **real** project-original 01-orb-alpha TripoSR mesh has **190,860 unique pairs of faces sharing one indexed vertex and NOT a full edge**. They were tested in G3.10 for an additional noncoplanar common ray leaving that vertex; 0 candidates and 0 near-coplanar unresolved cases were found under bounded CPU numerical tolerances. The preserved-surface winding-only copy has identical statistics. Original synthetic GT=5,730 such pairs; historic real chair derivative=92,629. These are numerical diagnostic counts, NOT full global intersection-free, calibrated quality, wall thickness or print qualification. Source/GLB SHAs are pinned, and no new neural inference occurred. [G3.10 details](../../docs/G3_10_SHARED_VERTEX_CPU_2026-10-10.md) · [sanitized proof](../../docs/evidence/g3/orb-01-g310-shared-vertex-ray-screen.json). Private observed real model output coverage remains 2/9.

## G3.9 adjacent-face angle screen on the one real synthetic model

Separate from the nonadjacent triangle potential-contact SAT screen (G3.8), G3.9 checks **all 60,528 EDGE-adjacent two-face pairs** of the already licensed real TripoSR 01-orb-alpha model. Normal-angle p95 is **33.018760°**, with 312 pairs >45° and 0 >90°. The original procedural source GT has 1,920 shared edges, p95 **5.731991°**, but greatly different tessellation/triangle densities mean this is not a calibrated percentage of reconstruction quality. Reversing the AI mesh's triangle winding preserves angle distribution exactly. Vertex-only contacts, actual foldover and physical wall/print suitability are not certified. No new model run or consent; the real model dataset is still 2/9 observed outputs / seven pending. [G3.9 engineering method](../../docs/G3_9_ADJACENT_FACES_CPU_2026-10-10.md) and [sanitized angle evidence](../../docs/evidence/g3/orb-01-g39-adjacent-angles.json).

## G3.8 existing real orb — independent CPU-only risk checks

The already-authorized TripoSR 01-orb-alpha model and its previous orientation-only derivative were compared against the SHA-pinned project-original sphere with a finite, conservative triangle contact screen and deterministic 4,096-point normalized best-fit sphere radial diagnostic. In the **two 40,352-face** inferred/corrected meshes, **43,025 eligible non-vertex-adjacent triangle pairs** were screened with 0 possible contact findings; vertex-adjacent pairs were excluded, so this is explicitly **NOT proof of self-intersection-free or printable geometry**.

The mean relative sphere radial residual was **0.00062476 source GT vs 0.04973669 TripoSR**. This is not 80x overall image→3D error or real-world millimeter finish. Seven other G3 originals remain without real model outputs; private observed-output count 2/9, historical public fixed scorecard 1/9. See [G3.8 method](../../docs/G3_8_ORB_CPU_RISK_2026-10-10.md) and [sanitized CPU report](../../docs/evidence/g3/orb-01-g38-cpu-risk-screen.json). Zero new GPU jobs, no print release.

## CPU three-dimensional reference diagnostics (G3.3)

For the eight original procedural source meshes, engines/quality/shape_metrics.py compares deterministic surface samples using bidirectional normalized Chamfer distance and precision/recall/F1 near points within 2%/5% of independently normalized object diagonals; candidate yaw is selected from eight choices after the fact. Eight source-model identity controls score zero Chamfer; four wrong-source references differ substantially. **These are diagnostic calibration cases, not AI inference results, and physically wrong scales can be hidden by normalization.**

After manually completing a real G2 job with one of the nine licensed source images, use npm run score:g3 -- --job-id <uuid>. The validated, local SHA-linked score stays under gitignored runtime/qa/g3/manual-scores and is eligible for a PRIVATE report only. Even matching hashes cannot independently prove GPU execution. The ninth MIT chair has no actual source reference 3D and no valid ground-truth 3D score.

The Hebrew web workbench now offers a one-click fixture image input loader, not a generation control. Every source replacement resets GPU consent. See docs/G3_3_SHAPE_EVALUATION_2026-10-10.md.

## Public scorecard generated from recorded outputs, not AI simulation

The SHA-verified, read-only **historical public baseline** is stored at docs/evidence/g3/benchmark-coverage.json. Its frozen scope counts only the earlier TripoSR MIT chair result (**1 of 9**); after a later separately approved real TripoSR inference on project-original 01-orb-alpha, the vetted **private** local report now includes **2 of 9 observed real model outputs** and 7 still awaiting model execution. The public file is not a live/private data counter. It distinguishes original synthetic GT from AI reconstructions and marks post-hoc silhouette views exploratory, not calibrated accuracy. The CLI is npm run benchmark:g3; optionally scan private local G2 jobs with --jobs-dir runtime/data-g2-manual/jobs to produce a **gitignored** private report. No model runs or original source media are uploaded externally.

## Current evaluation state

- Eight original source/GT pairs have an **exact-camera, positive-control silhouette** verification (not AI inference). Minimum projected-mask IoU: 0.935812 after consistent bounding-box normalization. See docs/evidence/g3/silhouette-positive-controls.json.
- Existing real TripoSR output for ninth upstream chair was scanned **only after it already existed**. A diagnostic search across 24 yaw/elevation views gave provisional best normalized silhouette IoU 0.82448. This is NOT a calibrated accuracy benchmark, not camera-aligned ground truth, and not production QA.
- **01-orb-alpha now has one genuinely generated TripoSR model** after a fresh explicit single-image GPU approval, 12.59s engine elapsed, source SHA and GLB verified. Seven other original synthetic fixtures still have no completed AI model output. The existing licensed MIT chair is the other previously observed real model; no alternative provider has been qualified or compared.
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

## Future GPU benchmark protocol for the seven remaining inputs (NOT AUTHORIZED)

If new per-job model-use approval and a live no-conflict check are obtained, submit the remaining seven not-yet-inferred original images one at a time through G2 manual UI. No unattended queues. For each: capture input SHA/model config/seed (if supported), output SHA, worker wall time, NVIDIA shared-VRAM preflight/peak, CPU geometry report and provisional silhouette metric; compare to known GT dimensions only in arbitrary normalized synthetic units. Review the actual 3D geometry and human visual fidelity. Then repeat under the same protocol with a license-qualified second provider, if any.

Never infer a winner from one sample or print release from watertightness.
