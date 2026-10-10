# G3 verified CPU-only geometry / benchmark evidence

**All outputs below analyze an existing real TripoSR chair GLB or original synthetic ground-truth shapes. NO new neural inference was performed to create these reports.** The one real TripoSR chair input/output pair originated in G2 and is SHA-linked here. All future G3 synthetic-image AI runs remain **NOT STARTED**.

- chair-geometry.json: independent offline Trimesh inspection of docs/evidence/g2-app/real-app-output.glb. 19,972 faces, 1 connected component, zero open boundary edges, consistent winding but **negative signed volume −0.0613843**, positiveVolume=false. No real-world units/wall thickness.
- chair-silhouette-exploratory.json: 24-view post-hoc orthographic 2D silhouette search, best normalized IoU 0.82448. This is **pose-searched, not calibrated ground truth**, so never classify as product accuracy.
- silhouette-positive-controls.json: **8 original procedural source/GT pairs**, exact camera, all known geometry; minimum self-consistency IoU 0.935812. These are not AI generated models.
- chair-positive-winding.glb: optional, independent CPU-only derivative of actual real G2 GLB; triangle winding inverted after guard verifies closed/consistent negative volume. **DOES NOT OVERWRITE ORIGINAL.** Faces and bounds preserved; volume positive +0.0613843 arbitrary units, still DRAFT.
- chair-orientation-derivative.json: original/derived SHA-256, counts, before/after signed volume and explicit printQualified=false.
- chair-positive-winding-qa.json: independent second QA on derived GLB.
- real-chair-cpu-review-ui.png: unretouched Chrome screenshot of LOCAL3D G3 **CPU-only** topology review of an already generated real GLB; no new GPU/model execution.
- real-chair-cpu-review-proof.json: supporting report, 0 GPU worker calls, 0 JS errors and 0 external browser requests, temporary API process closed after proof.

For original reference fixture files and license manifest: ../../../benchmarks/g3/README.md.
Implementation: ../../G3_PROGRESS_2026-10-10.md and ../../../engines/quality.
No model here is approved for printing or for manufacturing without further dimensional/material testing.
