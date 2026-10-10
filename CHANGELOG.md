# Release notes

## v0.2.16 — 2026-10-10 — G3.16 exact indexed single-vertex face contact census

- Added bounded CPU exact rational triangle-pair classifier for ALL original vertex-index-only adjacency pairs. Independently enumerate face incidence, excluding shared-indexed-edge pairs, without relying on G3.14 KD-tree/AABB. Classify expected vertex-only contact, noncoplanar extra line intersection, coplanar extra line contact and coplanar positive area overlap. Exactness applies ONLY to already-decoded IEEE754 GLB XYZ, not true CAD/mm tolerances; budget and invalid sources fail closed.
- Previously generated real orb: **190,860 / 190,860** pairs exactly classified with 0 extra geometric intersections in THIS pair class. Previous G3.7 winding-only copy matches exactly; original project GT 5,730/5,730 and historical licensed chair 92,629/92,629 both 0 extras. All original source SHA/image rights and prior G3.14 pair census numbers verified; no new inference.
- Added 18 adversarial CPU Python controls for genuine positive/negative noncoplanar and coplanar examples, original vertex reindexing, independent brute-force small-mesh completeness, budget/degeneracy fail-closed and immutable private evidence. Added 3 Node evidence privacy/rights/count regression controls and four SHA-locked model reports. **Nonindexed AABB pairs are not exact-global verified**, and physical scale, wall thickness, OS sandbox, independent printer QA remain blocked (GitHub Issues #3/#4 OPEN). DRAFT, printQualified=false; no GPU, cloud, printer or Office writes.

## v0.2.15 — 2026-10-10 — G3.15 exact binary-float every shared-index-edge pair classification

- New bounded CPU exact rational geometry for ALL indexed full-edge-adjacent triangles: detects noncoplanar expected edge-only contact, coplanar opposite-side expected edge-only contact and coplanar same-side positive interior area overlap, with degenerate/time/resource cases fail-closed. Operates only on already decoded IEEE-754 GLB coordinates; no physical mm calibration or 3D printer clearance.
- Verified 60,528 actual licensed TripoSR orb shared-edge pairs and identical G3.7 winding-only copy, plus all 1,920 original GT sphere and 29,958 historical chair shared-edge pairs. Every set completes with 0 exact coplanar positive-area same-side shared-edge overlap candidates; this does NOT establish global robust self-intersection absence. Distinct-index adjacency and no-index faces require other gates.
- Added 14 adversarial Python tests (synthetic positive overlap, valid planar and sharp cube corners, winding invariance, tiny exact plane separation, malformed/time fail-closed) and 3 Node SHA/privacy/source-count assertions. Immutable private reports and sanitized SHA-linked public proof created from prior completed model. No inference, GPU, cloud, model or printer changes. Issues #3 and #4 remain OPEN.

## v0.2.14 — 2026-10-10 — G3.14 complete conservative numerical AABB candidate census

- Independently enumerates every conservative decoded-coordinate AABB-overlapping unordered pair via bounding-BOX spheres (not prior G3.8 centroid/triangle spheres), including 0/1/2 indexed shared vertex pairs. Enforces exact partition counts and checks all no-index AABB pairs with previous numerical SAT; bounded G3.13 exact refinement only on SAT positives. Conservative numerical AABB coverage is not a robust global exact 3D self-intersection certificate.
- On previously licensed real orb: 294,495 AABB overlaps (60,528 edge-indexed + 190,860 vertex-only + 43,107 non-indexed). Prior G3.8 centroid-sphere filtered AABB count 294,413 and no-index 43,025; new pass includes 82 more AABB candidate boxes, not evidence of 82 material defects. All 43,107 no-index candidates were numerical SAT negative. Winding-only derivative exactly matches; source GT and historical chair also pass SHA-locked four-source CPU replay.
- Added adversarial exhaustive brute-force comparisons on synthetic geometries, strict crossing/coplanar exact escalation, budget/time fail-closed controls, read-only immutable source model proof, public sanitized JSON and Node privacy/provenance tests. Still no physical scale, wall QA, complete indexed-adjacent exact contact classification, inference or printer authorization. Security Issue #4 / quality Issue #3 remain OPEN.

## v0.2.13 — 2026-10-10 — G3.13 exact selected triangle-pair predicates, NO whole-mesh scan

- Added CPU-only Python `Fraction` exact-binary-float oriented tetrahedral determinant and rational 2D coplanar polygon clipping, classifying explicitly supplied triangle PAIRS: strict noncoplanar edge-interior piercing, positive-area coplanar overlap, definite plane separation or unresolved boundary. This is exact arithmetic on already decoded IEEE-754 GLB vertex values, NOT true CAD scale or physical manufacture certification.
- Added 19 adversarial Python controls including strict piercing, coplanar overlap, legitimate shared-edge/corner touching, signed orientation/winding invariance, complex/NaN/invalid pairs and fail-closed time/pair budgets. No external package installation or model changes.
- SHA-verified four previous GLBs; deliberately classified only 24 deterministic indexed shared-edge-adjacent face pairs per model, each returned boundary/contact UNRESOLVED. This is an intentional **nonrepresentative selected-pair proof**, neither a global contact scan nor evidence of 24 defects; all other triangle pairs are UNTESTED by G3.13.
- Added sanitized immutable selected-pair proof + Node privacy/lineage tests and updated security/quality/operations documentation. No GPU inference, cloud, Office or printer. Production/untrusted-input and print gates still OPEN.

## v0.2.12 — 2026-10-10 — G3.12 CPU-only different-index spatial proximity and touching-shell candidates

- Added bounded CPU SciPy cKDTree diagnostic for exact-coordinate and near-coordinate matches among DIFFERENT vertex indices, including whether each vertex belongs to the same indexed connected component or separate shells. Explicit numerical tolerance 1e-7 × model AABB diagonal (arbitrary GLB units); no mm interpretation.
- Fail closed on >32 neighbors, >200k spatial pairs, invalid geometry or resource exhaustion. Legitimate duplicated seam vertices are candidate signals, not automatic defects; missing vertex coincidences cannot exclude triangle-interior contacts.
- Recomputed FOUR existing SHA-pinned licensed GLBs including previously authorized real orb (20,178 vertices/40,352 triangles): each complete with zero different-index exact or near vertex pairs; copy-only winding equivalence preserved. No new model inference, no mesh edit/weld/repair, no GPU, printer, cloud or Office.
- Added 12 adversarial Python controls (touching disjoint closed shells, same-component coincidences, tolerance thresholds, dense/invalid fail-closed cases), three Node proof/privacy assertions, immutable private CPU replay and sanitized public SHA-linked evidence. G3 and security gates remain OPEN; all models DRAFT and NOT PRINT QUALIFIED.

## v0.2.11 — 2026-10-10 — G3.11 CPU-only shared-edge coplanar backfold risk

- Added a new CPU-only geometric predicate on **every shared indexed edge**, beyond G3.9's normal-angle histogram: detect **possible coplanar SAME-SIDE interior overlaps** between triangles sharing the full edge, requiring a near-coplanar third point and >=175° antiparallel face normals. Separately count same-side >=150° backturns and numerically borderline coplanar cases. Explicitly not robust global collision or manufacturing certification.
- On prior genuine, SHA-verified TripoSR 01-orb-alpha and exact-surface winding copy: all **60,528 indexed shared-edge face pairs per GLB** screened, 0 possible coplanar same-side overlap candidates, 0 near-antiparallel >=175°, 0 high backturn >=150°, and 0 borderline. Original project procedural source sphere 1,920 edges and prior licensed real chair derivative 29,958 edges likewise screened; both had zero such findings.
- Added adversarial unit examples: intentionally overlapping two coplanar triangles sharing an edge MUST be flagged, ordinary coplanar triangles on opposite sides MUST NOT, near-noncoplanar fold not falsely labeled a coplanar overlap, near-collinear uncertainty explicit, cube/icosphere controls, winding-invariance and invalid input/immutable evidence refusal.
- Added read-only four-model CPU replay and source-locked private-to-public sanitized G3.11 proof. No new image/model inference, GPU, provider install, printer/slicer, Office/Windows changes or private model/checkpoint/source/UUID Git exposure. **Not print qualified**; still untested: exact robust nonlocal self-collision, physical mm dimensions, wall thickness, structural/material and machine suitability.

## v0.2.10 — 2026-10-10 — G3.10 CPU-only shared-one-vertex extra-contact ray screen

- Added a bounded, CPU-only shared-one-indexed-vertex **extra-ray contact candidate** diagnostic. Typical triangles touching at an existing indexed vertex are NOT flagged as mesh defects. Noncoplanar triangle planes are checked for shared positive/negative rays lying inside both triangular sectors; near-coplanar/borderline cases explicitly remain UNRESOLVED.
- On genuine previously user-approved real TripoSR `01-orb-alpha` and its G3.7 orientation-only copy, exhaustively enumerated and analyzed **190,860 unique exactly-one-vertex face pairs each**, with **0 additional noncoplanar common-ray candidates** and **0 unresolved near-parallel cases** under the chosen numerical tolerances. The known project-original GT had 5,730 such pairs and the historical real chair derivative 92,629, also with no candidate rays flagged.
- Verified earlier G3.8 nonshared-vertex SAT and G3.9 shared-edge angular metrics independently. **No full global geometric self-intersection or print certification**: edge-sharing true foldovers, differently indexed coincident coordinates, coplanar/near-zero numerical cases, mm scale, walls, supports and strength are still unqualified.
- Added adversarial positive/nonpositive crossing controls, coplanar/edge-borderline UNRESOLVED cases, indexed edge exclusions, CPU-time/valence/pair guards, poisoned-input and immutable-evidence tests; same original/copy counts prove no geometry change or fake model quality improvement.
- Added a read-only 4-model private CPU replay and strictly sanitized, SHA-verified immutable public G3.10 report. No additional AI inference/GPU authorization, cloud/Office, source model rewrite or printer actions occurred. Private actual model coverage **still 2/9**; static public earlier 1/9 remains a reviewed historical snapshot.

## v0.2.9 — 2026-10-10 — G3.9 CPU-only indexed edge-adjacent face-normal variation

- Advanced beyond G3.8's 43,025 nonadjacent SAT pairs into the adjacent-edge region: inspected all **60,528 indexed edge-adjacent face pairs** in the previously generated real 01-orb-alpha TripoSR 40,352-face model and its separate winding-reversed copy, plus all 1,920 GT source indexed edges.
- TripoSR adjacent-normal difference: p50 **8.278947°**, p95 **33.018760°**, p99 41.757141°, max 74.402674°; 312 edges above 45° (0.5155%), 18 above 60°, **zero above 90°**. Original procedural 1,280-face GT: p95 5.731991°, zero above 45°. IMPORTANT: tessellation differs greatly so these values are NOT calibrated across meshes, automated fold/defect detection or photographic accuracy.
- Orientation-only derivative preserved exact face-angle distribution. Sharp corners can be legitimate: a cube is a positive-control example with 12 intentional 90° creases. Face pairs sharing only a vertex are still NOT assessed. No proof of self-intersection freedom or print readiness.
- Added bounded CPU-only reusable indexed adjacency QA, eight synthetic/previous-chair regression controls, SHA-verified sanitized immutable G3.9 report, CPU-only private recomputation of real/derivative/reference model angle distributions and automatic Node evidence/privacy tests.
- G3.9 changes **NO GPU inference, model weights, printer, Office or Windows security policy**. Private model-output coverage stays 2/9; seven licensed G3 images require individually authorized GPU runs. Historical public 1/9 benchmark remains a fixed earlier snapshot, not current private data.

## v0.2.8 — 2026-10-10 — G3.8 CPU-only bounded contact-risk and orb roundness diagnostics

- Introduced a conservative, bounded **non-vertex-adjacent triangle contact screen** for previously generated GLBs: SciPy centroid sphere broadphase, AABB overlap, 17-axis triangle SAT including coplanar in-plane axes. Rejects degenerate coordinates/faces, resource limits or numerical incompleteness; never claims mathematically proven absence of self-intersections. Adjacent triangles are deliberately excluded and noted as an open risk.
- On actual preexisting project-original G3 `01-orb-alpha` real TripoSR model and its winding-only copy, independently screened **43,025 eligible nonadjacent triangle pairs** per model with **0 possible contacts flagged**, 40,352 triangles each; **251,388 AABB candidate pairs were skipped for sharing a vertex index**. No print certification or exact collision proof. Procedural source GT also screened (1,280 triangles, no eligible nonadjacent pairs after adjacency exclusions).
- Added reproducible 4,096-point *area-weighted best-fit sphere* radial deviation comparing known procedural GT to already created TripoSR surface: mean absolute radial residual normalized to its own fitted radius **0.00062476 vs 0.04973669**, respectively (0.0625% vs 4.974%). This is a narrow orb-roundness diagnostic, not physical surface finish, dimensional/image reconstruction accuracy or a claim of 80x overall quality difference.
- Added CPU-only negative cases for penetrating closed cubes, disjoint meshes, coplanar overlap, degenerate faces, invalid arrays, resource exhaustion, a deformed sphere and scale/translation invariance; incomplete screens are reported INDETERMINATE, never passed.
- Introduced privately reproducible, SHA-locked CPU replay of all 3 contact screens + radial metric, and immutable provenance-verified sanitized G3.8 public JSON. No new GPU inference, printer/slicer action or any private GLB/image/job UUID copied to Git.
- Benchmark private observed output coverage unchanged: **2/9**, seven pending real G3 inputs. Historic public snapshot 1/9 remains a deliberately frozen reviewed baseline, not a live count. Issue #3 stays open for engineering/manufacturing gates and #4 for Python supply-chain/sandbox.

## v0.2.7 — 2026-10-10 — G3.7 authentic orb winding correction, independent CPU-only evidence

- Used the previously successfully approved single-use real TripoSR 01-orb-alpha reconstruction (12.59s, 808,092-byte GLB, 20,178 vertices / 40,352 faces). G3.7 performed **NO NEW GPU inference**.
- Made a **private, non-destructive CPU-only winding derivative** of the inward-facing but watertight real orb model: signed volume -0.3691746 -> +0.3691746 arbitrary units cubed, same geometry, faces and bounds, source SHA unchanged.
- Added independent winding-equivalence verification requiring bit-identical vertex positions/colors, exactly reversed face indices, opposite normals, same component topology and abs(volume). Unsupported materials, altered vertices/colors/faces, positive/open inputs and overwritten reports fail closed.
- Added G3.7 provenance/independent QA records, immutable sanitized milestone generator and local-only three-way Chrome SwiftShader screenshot; real GLBs, job UUIDs, prompts and private source files remain gitignored. Browser proof: no remote URLs, no model inference, no JavaScript errors.
- The real model remains visibly uneven compared to procedural reference. Original-vs-GT normalized Chamfer=0.02209413, F1@2%=0.4836679; winding DOES NOT improve this surface metric or establish print readiness.
- **Private benchmark coverage now 2/9 actual model outputs** (historic MIT chair plus 01 orb), 7 remaining. The separate checked-in historic public ledger intentionally stays 1/9 pending independently controlled review, not a live data counter. No printer, Office or security configuration changes.
- Validation: **68/68 Node, 7/7 G2 Python, 26/26 G3 Python, 8/8 G1 Chrome, 8/8 G2/G3 mock Chrome**; immutable SHA-derived milestone and historical benchmark snapshot reproducible. No CUDA jobs were triggered by tests.

## Windows Git source-owner hotfix (included in v0.2.7) — 2026-10-10

- Confirmed a real one-time user-authorized `01-orb-alpha` job failed **before model inference**, at `verify_sources`: TripoSR source checkout is owned by Windows SYSTEM and the interactive CHRIS operator encountered Git's `detected dubious ownership` (exit 128).
- Updated `engines/triposr/worker.py` to use `git -c safe.directory=<exact resolved TripoSR source>` **only for fixed `rev-parse HEAD` and `status --porcelain` read-only checks**. No wildcard, no global safe.directory/owner change, no skipping dirty tree, commit, checkpoint, config or DINO SHA256 integrity verification.
- Added CPU-only `scripts/g3-verify-triposr-source-owner-cpu.py` to validate Git source integrity, model SHA and the licensed `01-orb-alpha` image **without CUDA, job submission, prints or network requests**.
- Added isolated Python regression cases for exact path/scoped Git commands, disallowed operations and tampered source. **Interactive CHRIS-account CPU verification subsequently passed**, and an independently user-approved one-time real 01-orb-alpha TripoSR retry then completed. The earlier failed approval was never reused.
- Preserved the failed job evidence and spent one-time approval latch. The historic v0.2.4 snapshot remains unchanged, and **no new GPU permission is implied**.

## v0.2.6 — 2026-10-10 — G3.6 isolated Pillow shadow compatibility research

- Downloaded and cryptographically verified the **official PyPI Pillow 12.3.0 Windows CPython3.11 wheel** in private gitignored runtime only, SHA256 8e95e1385e4998ae9694eeaa4730ba5457ff61185b3a55e2e7bea0880aef452a. Public OSV version matches: **0 candidate vs 32 for Pillow 10.1.0**, not codepath safety certification.
- Verified **9/9 license/SHA-locked source images**, 4 synthetic alpha/EXIF/WebP/corrupt-image input tests, 23/23 G2/G3 Python unit tests and an import-only TripoSR tokenizer/system check with pinned Transformers/Torch under shadow Pillow. No weights loaded, no CUDA inference.
- **No upgrade to the live G2 Python runtime or frozen model requirements**. Production Pillow stayed 10.1.0 before and after. Candidate is not activated by the app or startup.
- Added reproducible CPU-only shadow research scripts, public-only optional OSV/PyPI metadata screen, sanitized provenance-locked result, safety documentation and automated artifact assertions. Full regression: 67/67 Node, 23/23 pinned Python and 23/23 shadow-Pillow Python, 8 G1 and 8 G2/G3 mock Chrome phases. A separate v0.2.6 npm audit summary reports 0 Node advisory matches with its own lockfile SHA, preserving the historical G3.5 result. No new user-source images, model predictions, print commands, Office or system configuration changes.
- Open security issue #4 still requires actionable advisory codepath triage, Transformers/Torch compatibility, an isolated complete patched environment and fresh approval for any real CUDA compatibility trial. G3 quality benchmark remains 1 historical model result / 8 unrun images.

## v0.2.5 — 2026-10-10 — G3.5 manual storage safety and Python dependency-advisory screen

- Added fail-closed pre-GPU storage admission for each manually consented real TripoSR job: 8GiB maximum accounted G2 job storage, at least 3GiB remaining free after a prospective 128MiB reservation, 400-folder cap and unsafe/corrupt manifest rejection. No automatic deletion, quota reservation or behavior change for default G1 DEMO.
- Serialized manual G3 geometry and shape CPU reviewers **across review types and job IDs within a single server process**, returning 409 G3_CPU_BUSY instead of launching unbounded parallel CPU tasks.
- Validated the guard against the existing private Windows G2 storage data in read-only mode: 3 folders and identical audited data before/after, 0 deletions, no new model execution.
- Read-only Node npm audit reported 0 vulnerability matches. An optional public OSV.dev screen of 34 pinned Python package/version pairs returned 104 **untriaged public advisory matches** across Transformers, Pillow and Torch. No exploitability claim or package upgrade; manual UI explicitly warns to use only trusted image sources pending full Python security triage.
- Added storage/CPU concurrency and negative-path regression tests, sanitized public evidence, and separate audit scripts excluded from all startup, browser and inference paths. Validation: 64/64 Node, 23/23 Python, 8/8 G1 Chrome and 8/8 G2/G3 mock Chrome phases.
- G3 benchmark completeness remains **one historical true GPU chair / eight unrun synthetic cases**. No new AI model inference, printer, Office modification, OS firewall change or second engine installation.

## v0.2.4 — 2026-10-10 — G3.4 completed-job CPU benchmarking and shared-host GPU metrics

- Added an explicit **G3 CPU comparison** button/POST /v1/jobs/:uuid/benchmark for completed G2 jobs whose source SHA matches a licensed G3 fixture. The bounded, isolated local Python scorer verifies the completed job, source/GLB/QA hashes and pinned model; writes downloadable DRAFT benchmark-shape.json without allocating GPU.
- UI clearly distinguishes known procedural original GT (post-hoc normalized Chamfer diagnostic) from licensed sample photographs with **NO GROUND-TRUTH 3D**. Unlicensed, unfinished, tampered or falsely print-approved outputs fail closed.
- Actual pinned Python scorer exercised through a temporary localhost API using the **existing** historical G2 real chair GLB. No new model inference, no printing and no source-image uploads.
- Future manually approved TripoSR runs now record NVIDIA shared-host initial/lowest-free/highest-used/highest-utilization snapshots and sampling count separately from PyTorch peak CUDA reserved VRAM, with explicit nonexclusive and inexact-peak caveats. Mock child tests verified this without CUDA.
- Original G3 public benchmark coverage remains exactly 1 previously observed real chair / 8 unrun new images. Issue #3 stays open for per-image real GPU results and manufacturing validation.

## v0.2.3 — 2026-10-10 — G3.3 manual benchmark sources and CPU 3D shape diagnostics

- Added reproducible CPU-only reference mesh surface metrics for 8 project-original synthetic cases. Positive self-controls produce zero Chamfer by construction; 4 intentionally wrong-shape controls detect differences. Metrics are post-hoc yaw/scale normalized and NOT print/manufacturing qualified.
- Added strict hash-linked local G2 completed-job scoring to gitignored private runtime, without claiming independent GPU execution attestation, using existing pinned TripoSR source/weight provenance. Upstream chair has no original 3D GT, and attempts to pass original GT copies off as AI are rejected.
- Added an allowlisted SHA-verified source-image endpoint and Hebrew G3 image picker. Loading images never creates jobs or allocates GPU; changing a selected image revokes prior GPU consent.
- Connected optional private scores to the privacy-preserving benchmark collector while leaving public 1/9 coverage intentionally fixed. No new model inference, Office changes, printer actions or second engine installation.
- Regression: CPU quality and provenance negative tests plus Chrome G1/G2 per-image consent tests. Issue #3 still OPEN for actual per-image AI benchmarking and manufacturing qualifications.

## v0.2.2 — 2026-10-10 — G3.2 resource safety & honest benchmark coverage

- Introduced a cross-process LOCAL3D GPU filesystem lease shared across manual G2 server processes; concurrency rejected with 409 before allocating a GPU worker, release on completion/cancel/shutdown, stale locks never auto-recovered.
- Added read-only nine-source benchmark coverage: previous actual G2 chair output 1/9, eight unrun sources explicitly PENDING; strict source/GLB/QA/weight SHA checking and privacy-preserving optional local job scan. No new inference was executed.
- Added read-only G3 benchmark status to the Hebrew sidebar, backed by GET /v1/benchmarks/g3 fixed public evidence. This does not start GPU jobs or falsely rank engines.
- Added safe, metadata-only local job-storage audit (counts/bytes/age, no deletion or client data) and read-only GPU-lock inspection.
- Added Windows multi-process lease tests, two-live-API-instance contention, provenance-tamper tests and browser assertions. No Office, printer or OS firewall changes.
- **Still blocked:** multi-image real benchmark, second provider install/qualification, physical manufacturing checks, commercial multi-user hardening or unattended AI.

## v0.2.1 — 2026-10-10 — G3 CPU quality preview (NOT full model benchmark)

- Added a complete 9-reference source catalog with immutable SHA provenance: eight project-original procedural 3D/product-image/mask triples plus one upstream MIT chair photo. No new GPU inference or third-party model installations.
- Added offline CPU Trimesh GLB scanner (topology, edge incidence, winding, signed volume and bounded geometry) and exploratory 2D silhouette IoU with calibrated positive controls. NOT print qualified, no physical unit/wall-thickness claim.
- Connected a manual CPU-only geometry-review button and /v1/jobs/:uuid/review endpoint to completed real-model jobs; validated SHA before/after review, one review at a time, rejected compromised models and falsely print-qualified reports.
- Identified the real previous TripoSR chair's negative signed volume despite watertight mesh. Added an optional strictly guarded, *non-destructive* positive-winding GLB derivative and source/output SHA report; still DRAFT.
- Completed browser proof using existing real GLB, actual CPU reviewer and ZERO new GPU inference; 0 browser errors or external requests. Added regression tests and separate engine rights/VRAM screening.
- G3 issue remains OPEN: no new fixture inference for the eight originals, no second engine installed/benchmarked, no production/printing release.

## v0.2.0 — 2026-10-10 — Manual local TripoSR image-to-3D

- Added a **real, on-device TripoSR image-to-3D adapter** behind an explicit Windows-only manual session. It is disabled by default; G1 remains a deterministic, no-GPU demonstration.
- Added per-job GPU confirmation in the Hebrew UI, runtime provider discovery, separate demo/real labels and staged job progress. Upload supports PNG/JPEG/WebP with server-side decode/pixel limits. Text remains demo/annotation-only, not text-to-3D.
- Added live Office Accelerator/Ollama conflict checks and NVIDIA GPU headroom gates, a single atomic GPU permit, time/VRAM guards, process-tree cancellation, shutdown/restart safety and fail-closed artifact publication.
- Added dedicated G2 manual launch script on **127.0.0.1:4179** and separate runtime/data-g2-manual storage; original G1 on 4177 and existing unrelated service on 4178 remain untouched. No autostart or background GPU scheduler.
- Verified a genuine local GPU image→GLB→API→Chrome viewport run with the MIT-licensed TripoSR chair fixture: 25.51 s model worker, 2,058 MiB peak PyTorch CUDA reserved, 400,452-byte Y-up GLB, DRAFT/non-printable report, full artifact SHA256 chain.
- Added isolated offline worker preprocessing, pinned weights and DINO config, CPU marching cubes, extra test harnesses, independent model provenance, and complete security/operations documentation.
- Validation: 26 Node tests (including real Windows fake-child process termination), 5 isolated Python tests, 7 G1 browser phases, 5 G2 manual mock-browser phases and the separate one-time real inference smoke; no model inference occurs under normal npm test.

**Important limitations:** One real licensed source image only; output is not CAD, dimensionally qualified or suitable for print release without separate geometry QA. No SaaS/paid fallback, remote access, user authentication, automatic GPU jobs or Office 2.0 integration.

## v0.1.0 — 2026-10-09 — G1 standalone clean-room fixture workbench

- Built an independent Hebrew RTL localhost Node/Three.js workbench with deterministic GLB demo fixture, upload history, API job manifests, audit, download and camera controls.
- Added G1 Windows Chrome and macOS Edge acceptance with full DEMO/NOT PRINT QUALIFIED truth labeling.
- Pinned Three.js and model-engine research candidates without allowing unreviewed source reuse or cloud provider fallback.
