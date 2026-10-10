# G3 verified CPU-only geometry / benchmark evidence

**Historical G3.1–G3.6 evidence** below analyzed the earlier real TripoSR chair GLB, original synthetic GTs, and CPU-only checks. On Oct 10, a NEW, explicitly approved single TripoSR inference successfully generated the first synthetic G3 fixture, **01-orb-alpha**, recorded in separate local private evidence. **G3.7 itself did no additional inference:** it only inspected/reoriented that pre-existing G3 AI output using CPU and produced a sanitized software-browser screenshot. Original and derivative GLB files and job IDs remain locally gitignored.

### G3.10 — unique indexed shared-one-vertex candidate ray contacts (CPU only)

- orb-01-g310-shared-vertex-ray-screen.json: license+SHA-pinned sanitized result from prior genuine TripoSR 01-orb-alpha, copy-only orientation derivative, procedural GT and historic chair derivative. Real orb + copy each have **190,860** unique one-vertex-only face pairs screened, with 0 detected beyond-vertex noncoplanar common-ray candidates and 0 near-parallel unresolved at numeric tolerance. GT=5,730 and historic chair derivative=92,629. Normal touching at the shared vertex is NEVER a defect or AI failure.
- This is NOT mathematical proof of no intersections: coplanar folds, edge-sharing intersections, differently indexed duplicate vertices and finite precision remain limitations. Private per-face examples/UUID/model source remain gitignored; no new GPU inference or printer activity.
- Full method and safety scope: [G3.10 CPU shared-vertex rays](../../G3_10_SHARED_VERTEX_CPU_2026-10-10.md).

### G3.9 — edge-adjacent face-angle diagnostics (NO new inference)

- orb-01-g39-adjacent-angles.json: SHA-pinned statistics from the previously generated real 01-orb-alpha TripoSR 40,352-face GLB, the unchanged-geometry winding-reversed derivative, and procedural original reference GT. TripoSR has 60,528 edge-adjacent face pairs, p95 normal-angle difference 33.018760°, 312 pairs >45°, 0 pairs >90°. Procedural GT has 1,920 pairs p95 5.731991°; cross-mesh resolution differs, no percentage-accuracy claim. These are NOT self-fold/contact detection, wall-thickness or print qualification.
- Reports, private UUID/GLB remain under gitignored runtime; CPU replay and sanitizer prove original/derivative/GT stats, prior G3.8 conservative-contact and G3.7 position/color preservation. No new GPU worker, no private media/executable weights published.
- Full method: [G3.9 CPU edge-normal angles](../../G3_9_ADJACENT_FACES_CPU_2026-10-10.md).

### G3.8 — bounded CPU-only self-contact risk and spherical deviation (NO new inference)

- orb-01-g38-cpu-risk-screen.json: independently SHA-validated report on previous actual real 01-orb-alpha TripoSR output, its previous positive-winding derivative and original procedural GT. Bounded nonadjacent-triangle SAT screen found 0 possible contacts among 43,025 eligible pairs per AI GLB; explicitly EXCLUDES vertex-adjacent pairs and DOES NOT certify no self-intersections or print safety. The 4,096-sample radial deviation of best-fit sphere is 0.00062476 reference vs 0.04973669 AI, a narrow normalized shape diagnostic NOT calibrated photo accuracy, strength or physical printer finish.
- Private screen timings, source/job files, models and raw radial reports remain ignored under runtime; read-only in-memory CPU reproduction and immutable sanitized summary use the separately completed prior GPU job. Seven other new G3 inputs remain without actual model generation.
- Full methods and caveats: [G3.8 CPU risk screening](../../G3_8_ORB_CPU_RISK_2026-10-10.md).

### G3.7 — first genuinely reconstructed synthetic fixture (CPU-only postprocessing)

- orb-01-cpu-quality-milestone.json: sanitized SHA-validated summary of the earlier user-authorized REAL 01-orb-alpha TripoSR output and subsequent G3.7 private derivative; source+derivative SHAs, volumes, unchanged geometric surface/colors, score caveats and no print qualification. Contains no private job identifiers.
- orb-01-winding-provenance.json: CPU-only non-destructive correction record; signed volume flipped from negative to positive, unchanged face counts.
- orb-01-positive-volume-qa.json: independent offline derivative QA; watertight and positive-volume true but no physical-unit, self-intersection, wall-thickness or print certification.
- orb-01-exact-winding-proof.json: independent bitwise-equal positions/colors, exactly reversed face indices, opposite face normals and no surface movement.
- orb-01-threeway-preview.png and orb-01-threeway-browser-proof.json: headless Chrome software render of original procedural reference 3D, previously generated REAL AI GLB and CPU derivative. No outside requests, no new model inference, printQualified=false. The generated sphere looks visibly uneven relative to source; reversing winding did NOT smooth it.
- Existing actual model and corrected GLB remain LOCAL ONLY; private coverage is now 2/9 recorded models / 7 unrun, whereas immutable checked-in public legacy benchmark evidence still shows 1/9.
- Full method: [G3.7 CPU winding validation](../../G3_7_ORB_WINDING_CPU_2026-10-10.md).

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
