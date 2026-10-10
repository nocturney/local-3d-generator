# G3 verified CPU-only geometry / benchmark evidence

**All outputs below analyze an existing real TripoSR chair GLB or original synthetic ground-truth shapes. NO new neural inference was performed to create these reports.** The one real TripoSR chair input/output pair originated in G2 and is SHA-linked here. All future G3 synthetic-image AI runs remain **NOT STARTED**.

- g3-4-existing-chair-cpu-proof.json: sanitized provenance/evidence from **real pinned CPU scorer and local API** using the already-created historic G2 MIT chair GLB and a disposable reconstructed job. Explicitly no *new* AI inference; 0 GPU worker calls. Returns NO_GROUND_TRUTH_3D and no print release.
- shape-positive-controls.json: eight original synthetic ground-truth models compared to themselves using reproducible normalized bidirectional surface metrics. Exact Chamfer 0 by construction, F1@2% 1.0; these are NOT AI predictions.
- shape-negative-controls.json: four intentionally incorrect original-source cross-comparisons show nonzero normalized Chamfer 0.0722–0.0984, proving the CPU scorer can distinguish gross shape mismatch on this tiny set, not that any model was run.
- G3-licensed-source-picker.png: actual G1 Chrome screenshot with a licensed benchmark source image loaded into the input form, with zero jobs and no GPU permission.
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

### G3.5 resource/supply-chain evidence (NO NEW INFERENCE)

- g3-5-storage-admission.json: a read-only actual Windows manual-job storage readiness check for a hypothetical maximum 8MiB input; no output model generated, no job created, no file deleted, and private names/images/prompts omitted. Counts are a point-in-time observation only.
- g3-5-python-osv-screen.json: public OSV.dev version matching for the **pinned public** Python dependency manifest. 34 package versions checked; 104 UNTRIAGED matching advisory IDs across Pillow, Transformers and Torch. This is NOT proof of exploitable paths and NOT a security qualification. No packages or model weights were installed/updated.
- g3-5-npm-audit-summary.json: sanitized npm audit metadata for both production-only and all pinned Node dependencies; each returned 0 matches for the current v0.2.5 package-lock SHA. Raw npm responses stay gitignored.

Implementation and limitations: ../../G3_5_RESOURCE_SECURITY_2026-10-10.md.

### G3.6 Pillow shadow CPU compatibility (no AI inference)

- g3-6-shadow-pillow-cpu-proof.json: sanitized, SHA-verified record of one **private ignored target-overlay** experiment with official Pillow 12.3.0 CPython3.11 wheel, public old-vs-candidate OSV version matches, all nine pinned source-image CPU preprocessing checks, four synthetic edge checks, 23 G2/G3 Python CPU tests, import-only upstream TripoSR + Transformers/Torch and an unchanged production venv.
- g3-6-npm-audit-summary.json: read-only npm audit of current v0.2.6 production and development Node dependency versions, linked to the **new** package-lock SHA, 0 matches at this timestamp. Historical G3.5 npm audit is preserved unmodified.
- **Important:** All original G2 GPU source/weights/package pins remain unchanged; only CPU-level compatibility was established. No CUDA inference, new 3D predictions, remote customer images or printer actions. Zero candidate OSV version matches does NOT grant security qualification. Remaining Python dependency advisories need triage before any untrusted-media rollout.

Detailed method: ../../G3_6_PILLOW_SHADOW_2026-10-10.md.
