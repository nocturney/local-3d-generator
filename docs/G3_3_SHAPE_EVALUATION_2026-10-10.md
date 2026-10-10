# LOCAL3D G3.3 — CPU shape comparison and guided benchmark input
Date: 2026-10-10 · release v0.2.3-g3-shape-preview.

## Scope / actual result

**Implemented:** deterministic CPU-only surface comparison between a candidate model and one of the eight original synthetic reference 3D models, licensed reference-photo loader in the Hebrew UI and private scoring of hash-linked completed G2 manual jobs.

**Not done:** NO NEW TripoSR GPU inference, NO 8-image model results, NO second provider install, NO print release or calibrated physical dimensions. The only previously observed real model is still the upstream chair from G2; that chair has NO original reference 3D, so there is no legitimate ground-truth 3D score for it.

## Evaluation algorithm and sources

Source: engines/quality/shape_metrics.py, using the existing isolated Python 3.11 Trimesh/NumPy/SciPy CPU environment (no Torch import or CUDA allocation).

1. Verify the G3 source catalog, source photograph SHA256, mask SHA256, original 3D SHA256 and licensed project-original category.
2. Verify GLB v2 structural header/length, decode with Trimesh in fixed max 64 MB, 64 objects, 1M faces and 500k vertices. Do not repair geometry or infer physical units.
3. Sample 1,536 deterministic surface points per source mesh, weighted by triangle area, with a fixed RNG seed. Translate each AABB center to the origin and normalize each AABB diagonal separately to 1.
4. Compare a candidate against the reference over exactly eight candidate yaw angles (0,45,...315 degrees) with SciPy cKDTree bidirectional nearest-neighbor distances. Select the **minimum post-hoc** normalized symmetric Chamfer-L1 value, and report precision/recall within 2% and 5% of normalized diagonal and an F1 at 2%.
5. Report connected components/face counts separately from surface proximity. Preserve raw model/input SHA256 and record the exact evidence lane.

**Interpretation:** lower normalized Chamfer is closer as a finite-surface diagnostic, but it is NOT objective true-CAD reconstruction accuracy: independently normalizing shapes hides absolute size errors, post-hoc yaw search optimistically fits orientation, partial/occluded/unseen geometry is ambiguous, and sample distance cannot assess inside-out winding or watertight printability. This cannot rank models without independently recorded runs on the same data, consistent settings, and a manually reviewed error rubric.

## Controls run, no AI

- Eight original-ground-truth-versus-identical-original **positive controls**: Chamfer exactly 0.0 and F1@2%=1.0 by construction. This confirms deterministic same-input behavior, NOT TripoSR model quality.
- Four deliberately wrong **negative controls** (orb vs torus, torus vs orb, separated spheres vs orb, thin chair vs gear): normalized Chamfer from **0.07222630 to 0.09840595**, F1@2% from approximately 0.075 to 0.218. This confirms gross-shape mismatches can be detected on this tiny sample set, not a general benchmark threshold.
- Additional tests verify translation/isotropic scale/yaw limitations, that a mesh with inward-oriented faces may still have good surface similarity while topology fails, source hash rejection, forged GT-copy rejection, no GT on upstream chair, and no leakage of client metadata.
- Reports: docs/evidence/g3/shape-positive-controls.json and shape-negative-controls.json; both plainly state no AI inference and printQualified=false.

## Private scoring of an already completed manual G2 job

On Chris, after **you explicitly create and approve ONE TripoSR image job in G2 manual session**, obtain the full job UUID by copying the Manifest:

    npm run score:g3 -- --job-id <full-job-uuid>

This is a CPU-only, non-destructive, fixed-command subprocess. It validates stored source image SHA, source/GLB/QA manifest hashes, pinned TripoSR commit/weights revision/SHA, completed status, per-job type and original G3 licensed source entry. Invalid or nonmatching jobs are rejected. The only accepted source photos are from the nine licensed catalog inputs.

Results are private in gitignored runtime/qa/g3/manual-scores/<model-sha>-<fixture-id>.json. Records are **HASH-LINKED LOCAL JOBS**, not independently attested GPU executions. Customer source filenames, job UUID, prompts and local paths are never copied into the score. If the candidate output is byte-identical to original source ground-truth GLB, it is explicitly rejected as an invalid AI result.

- If the photo belongs to one of the 8 project-original synthetic cases: the CPU-only source-geometry comparison is computed and labelled POST_HOC_NORMALIZED_3D_SHAPE_DIAGNOSTIC.
- If it is the ninth upstream chair: NO_GROUND_TRUTH_3D, so only independent topology is measured; no fake reference score.
- No job is launched or resumed; does not trigger OpenAI, cloud, printer, Torch or CUDA.

Optionally merge only hash-matching private scores into a PRIVATE (non-GitHub) benchmark report with:

    node scripts/g3-collect-benchmark.mjs --jobs-dir runtime/data-g2-manual/jobs

The collector keeps real G2 E2E observations separate from local records, rejects unverified score records, does not publish names/IDs/prompts, and stores a SHA-fingerprinted report under gitignored runtime/qa/g3. The **public 1/9 report remains the reviewed, fixed historical snapshot** rather than silently absorbing private work.

## Licensed reference image selector in web UI

- New GET /v1/benchmarks/g3/sources/:fixtureId returns exactly one licensed PNG from the nine pinned catalog sources; checks rights classification, fixed allowlisted file path, PNG magic, local file size and source SHA256. No arbitrary URL/filesystem input or GPU endpoint.
- Hebrew UI G3 fixture picker on the image input lets the operator choose any of nine licensed photos and click **טען תמונה לטופס בלבד**. A File object is built in memory and passed to the existing upload UI. This is not a job POST; image selection alone cannot start inference.
- Important safety fix: changing or clearing ANY image (manual file, drag/drop or catalog source) unchecks the GPU consent. A new deliberate consent check is necessary for the newly selected image.
- Chrome G1 and mock-provider G2 browser tests verify source selection, zero job creation / zero model worker invocation, consent reset, no external requests and baseline separation.

## Pending gates

- Run the eight synthetic inputs through the **actual** G2 provider, one manually consented image at a time, live Office idle and GPU preflight, and record source/weights/GLB/GPU telemetry without sharing private media.
- Real-image quality assessment on additional appropriately licensed non-synthetic images with diverse lighting, backgrounds and occlusion; benchmark synthetic fixtures alone do not generalize to customers.
- Second separately licensed local engine, after model/revision/weights/license/VRAM screening; not installed now.
- Broader geometry/intersection/physical scale/wall-thickness/supportability checks and a separate manufacturing qualification gate. No STL print release or printer control.
- OS-level process/network sandbox, dependency CVE review and multi-user/privacy retention hardening.

Issue #3 remains OPEN. G3.3 is a quality-measurement/UX **precursor**, not proof that any model works well across the test set.
