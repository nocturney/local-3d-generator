# LOCAL3D — Local-first 3D Model Workbench

Independent clean-room project under HANDOFF 12 (2026-10-09). LOCAL3D includes a responsive Hebrew RTL workbench and a **real, locally verified TripoSR image-to-3D adapter** on Windows. No OpenAI/Codex engine, Rodin/Meshy/Tripo SaaS subscription, print service or Office 2.0 runtime dependency.

**Default is G1 DEMO, no GPU.** The real G2 engine is available ONLY in an explicitly started **manual local session** with confirmation for each image. It is not an unattended AI queue, not text-to-3D, and never automatically sends files to a printer. All generated geometry is **DRAFT / NOT PRINT QUALIFIED**.

## Quick start: safe G1 demonstration (no AI)

Windows Chris / Mac Mini with Node.js 20+:

    npm ci --ignore-scripts --no-audit --no-fund
    npm test
    npm run qa:browser
    npm start

Open http://127.0.0.1:4177 on that host. G1 fixture jobs simulate progress; the output GLB is deterministic and independent of the uploaded image or text. It never executes Python/CUDA.

Windows working directory: D:\Velvet\Projects\local-3d-generator

## G2: real image-to-3D in an intentional manual session (Windows)

Model installed locally in an isolated Python 3.11 venv with pinned/verified TripoSR weights. On Windows Chris, manually start a separate session:

    powershell -NoProfile -File scripts/start-g2-manual.ps1

Then open **http://127.0.0.1:4179** on Chris. Select **TripoSR Local**, upload one PNG/JPEG/WebP image (max 8MiB; full decode <=16MP), explicitly check the GPU consent box and click **צור מודל אמיתי (GPU)**. When completed, rotate the Y-up GLB, inspect its DRAFT report and download it. Use Cancel to terminate a running subprocess; the UI says "נעצרת" until actual cleanup. Stop the manual session with Ctrl+C.

G2 uses its own runtime/data-g2-manual directory and port, not G1 job records. Every job checks Office Accelerator idle status and GPU headroom before spawning an isolated Python process, enforces timeout/VRAM limits, and never queues another GPU task. The server remains on 127.0.0.1; there is no cloud fallback, local printer connection or scheduled inference. Models are not required or validated on macOS G2; only G1 was qualified there.

Text-to-3D remains unavailable: text input in G1 is demonstration only, and notes attached to G2 image jobs do NOT change the shape.

## Implemented

- Hebrew RTL responsive input, drag-and-drop upload, history, progress, cancellation and Three.js/OrbitControls GLB viewer.
- Persistent UUID jobs with source/model SHA256 manifests, DRAFT QA and local audit logs.
- G1 CPU deterministic fixture demonstration, fully independent of the AI installation.
- G2 manual-only guarded TripoSR image-to-3D via **start/status/cancel/result** APIs, Python worker isolation, Y-up GLB export, input validation, GPU/Office safety gates and process-tree cleanup.
- Exact pinned MIT TripoSR source/weights, pinned Apache DINO configuration, Windows CUDA PyTorch stack; no upstream unpinned torchmcubes extension or network background-removal weights.
- End-to-end G2 real CUDA proof through LOCAL3D API and Chrome UI (licensed chair example, 25.51 sec, 2058 MiB peak torch reserved); no running GPU worker left after validation.
- Current v0.2.31 CPU-only full regression on Windows Chris: **177/177 Node**, **265/265 pinned Python** (7 G2, 258 G3), **8/8 G1 Chrome** and **8/8 G2/G3 mock Chrome** phases. The earlier G3.6 Pillow shadow experiment independently covered its THEN-existing 23 Python tests and is NOT automatically re-certified for newer suites. The historical licensed CUDA chair and one previously separately authorized orb inference remain the ONLY two real completed AI outputs of nine benchmark sources. **Normal npm tests and G3.12 diagnostics never execute model inference or allocate CUDA.**

## G3.31 — Windows Sandbox client-discovery gap on Chris (v0.2.31)

[G3.31 Windows Sandbox client/CLI registration read-only audit](docs/G3_31_WINDOWS_SANDBOX_CLIENT_DISCOVERY_CPU_2026-10-11.md): Microsoft documents `wsb` as the newer Sandbox CLI on Windows 11 24H2+. The Chris remote **Session 0** read-only scan found the optional Sandbox feature Enabled and HypervisorPresent true, but neither `wsb` nor the legacy launcher, and **zero AppX, provisioned, StartApps or SystemApps Sandbox entries visible in this probe context**. It does **NOT** prove the interactive user's Sandbox app is absent. Strict fail-closed readiness stays NOT_FOUND_IN_CURRENT_READ_ONLY_PROBE_SCOPE and NEVER authorizes guest/native security or GPU. [Immutable, sanitized evidence](docs/evidence/g3/g3-31-windows-sandbox-launch-discovery-only.json) preserves the previous successful read-only observation; attempted nested recapture timed out, and no second live scan is claimed. No VM/OS settings/installer/GPU/Office/printer changes, Issues #4/#3 OPEN.

## G3.30 — trusted synthetic-only image ingress/output receipt contract (v0.2.30)

[G3.30 SHA-locked CPU-only synthetic exchange](docs/G3_30_TRUSTED_SYNTHETIC_EXCHANGE_CPU_2026-10-10.md) exercises a proposed transport envelope and immutable host-only simulated receipt for **exactly three already-pinned 64x64 PNG/JPEG/WebP synthetic images**, converted on trusted host Pillow 10.1.0 CPU to canonical RGB PNG. Byte SHA, MIME, format, 64x64 dimensions, 64 KiB output cap, locked Windows Sandbox candidate-policy SHA and receipt fields are checked. Forged VM/egress/guest approvals, paths and unknown media fail closed. The result **NEVER authorizes actual external media/G2 GPU/printing**; no Sandbox VM or guest transport was started or built. [Immutable public source evidence](docs/evidence/g3/g3-30-trusted-only-offline-exchange-not-sandbox.json). Security Issue #4, print Issue #3 OPEN.

## G3.29 — Windows Sandbox readiness audit, policy and deny-by-default gate (v0.2.29)

[G3.29 Windows Sandbox candidate and read-only host readiness](docs/G3_29_WINDOWS_SANDBOX_READINESS_CPU_2026-10-10.md): Chris Windows 11 Pro reported Sandbox optional feature Enabled and hypervisor active; expected CLI launcher not resolved, **no VM actually launched or guest confinement verified**. An exact allowlisted .wsb candidate disables networking/vGPU/clipboard/audio/video/printer, requests ProtectedClient, exposes NO host folder and NO guest logon command. Its independent code gate remains BLOCKED_NO_RUNTIME_OS_ATTESTATION **even for apparently favorable host capabilities**. Immutable SHA-linked sanitized host-feature evidence is [here](docs/evidence/g3/g3-29-windows-sandbox-readiness-not-attestation.json). **No OS security setting, Office, 4178, G2 GPU/model or printing action changed**. Security Issue #4 and manufacturing #3 remain OPEN. The subsequent G3.30 milestone adds a strict trusted-only synthetic ingress/egress data contract, not a live guest transport.

## G3.28 — bounded structure admission now in real API (v0.2.28)

[G3.28 integrated CPU-only HTTP image structure gate](docs/G3_28_INTEGRATED_IMAGE_ADMISSION_CPU_2026-10-10.md) validates PNG/JPEG/WebP image containers after size/MIME signature checks and **before job creation, media persistence or G2 GPU reservations**. Real G1 fixture-only HTTP tests reject all synthetic incomplete headers, truncated files and PNG CRC corruption with 422 BAD_IMAGE_STRUCTURE; normal original generated images pass. The G2 manual MOCK endpoint rejects invalid files before the adapter is called, and per-image GPU consent is still mandatory. **This is not full Pillow decode or a native file/network sandbox.** Old G3.25/G3.26/G3.27 public SHA proofs remain byte-for-byte unchanged; historical read-only replay now uses an exact pinned Git source snapshot with verified Windows CRLF normalization. [New sanitized G3.28 source proof](docs/evidence/g3/g3-28-integrated-structural-image-admission.json). Existing running 4177 process was not restarted, so this updated codepath is verified in NEW local test instances, not asserted live on the old listener. Security #4 and manufacturing #3 remain OPEN.

## G3.27 — bounded image-container preflight CONTRACT (v0.2.27, not integrated)

[G3.27 standalone CPU-only PNG/JPEG/WebP structural validator](docs/G3_27_BOUNDED_IMAGE_STRUCTURE_PREFLIGHT_CPU_2026-10-10.md) checks bounded image length, dimensions, MIME, PNG chunk/CRC order, JPEG framing/EOI and WebP RIFF/chunk headers WITHOUT native decoding or GPU. All three original, trusted prior G3.26 test images validate and **18 incomplete variants are rejected**; corrupt structure, format ambiguity and extreme sizes fail closed. **At the G3.27 historical release this validator was not called by G1/G2**: it was a separately tested contract and did not protect real requests until G3.28 integration. [Immutable public source proof](docs/evidence/g3/g3-27-image-structure-preflight-contract.json). Older SHA reports remain unchanged; Issue #4/#3 OPEN.

## G3.26 — actual G1 short-signature acceptance versus harmless Pillow decode (v0.2.26)

[CPU-only G3.26 trusted synthetic 64x64 PNG/JPEG/WebP boundary experiment](docs/G3_26_SAFE_IMAGE_SIGNATURE_BOUNDARY_CPU_2026-10-10.md) verified three safe self-generated formats decode successfully in the existing Pillow 10.1.0, whereas incomplete inert short-header fragments cannot be decoded. The **G3.26 historical G1 DEMO HTTP API** accepted all three incomplete short-signature buffers (201) when declared MIME matched, but rejected mismatched MIME and unknown signatures (422); G3.28 subsequently closed this structural-admission gap in new code. This is **not** a G2 runtime injection or confirmed security exploit: G1 simply recognizes prefixes, never parses images to create its deterministic fixture. [SHA-linked public proof](docs/evidence/g3/g3-26-harmless-image-boundary.json). No customer input, GPU or new package. Production untrusted-image acceptance and Issue #4 remain OPEN, print Issue #3 remains OPEN.

## G3.25 — Pillow format/API-level static advisory case review (v0.2.25)

[G3.25 Pillow format and API triage](docs/G3_25_PILLOW_FORMAT_API_TRIAGE_CPU_2026-10-10.md) reviews all **32** publicly returned Pillow records across **16** alias-linked GHSA/PYSEC groups, comparing official upstream named conditions with actual G2 Node PNG/JPEG/WebP signature/MIME/8MiB entrypoint and Python Pillow Image.open/src.load/EXIF/16MP code. McIdas AREA and JPEG2000 are not ordinary allowed top-level codecs; specialized fonts/PDF/TGA encoding/ImageCms and image API misuse have different named triggers. **NO individual app exploitability was certified or cleared**, and signature filtering is not full file validation or OS parser isolation. [Immutable SHA-source evidence](docs/evidence/g3/g3-25-pillow-format-review.json) ties public G3.23+G3.24 to server/worker code and fails closed if source controls change. Security #4 and print #3 OPEN; production Pillow 10.1.0 and CUDA dependencies unchanged.

## G3.24 — SHA-linked security review ordering and pre-upgrade prerequisites (v0.2.24)

[G3.24 deterministic public-only security review queue](docs/G3_24_STATIC_SECURITY_REVIEW_PRIORITY_QUEUE_2026-10-10.md) transforms the complete 104-record/64-alias-group G3.23 public OSV proof and G3.22 real codepath findings into 64 stable review entries: **16 Pillow input-image decoder groups FIRST**, **29 Transformers pinned ViT config loader groups**, **19 Torch pinned checkpoint/native tensor groups**. Tiers are WORKFLOW orders only, NOT verified exploitability or CVSS severity for each group. Exactly three public GHSA exemplar descriptions, severities and fixed-version events were checked against official GitHub Advisories; those DO NOT clear or rank the 101 other records. All individual triggers remain UNKNOWN pending manual review. [Public advisory source-SHA/queue proof](docs/evidence/g3/g3-24-security-review-queue.json). Adds an explicit future shadow upgrade and OS containment test-gate plan WITHOUT installing dependencies or changing G2/GPU/OS/cloud/Office/printer. Security #4 and manufacturing #3 remain OPEN.

## G3.23 — complete public OSV vulnerability IDs and alias-linked grouping (v0.2.23)

G3.22 established that the prior public OSV report retained only **36 individual IDs out of 104 version matches**. [G3.23 fresh PUBLIC-ONLY OSV re-query and offline SHA alias census](docs/G3_23_FULL_PUBLIC_OSV_IDS_ALIAS_CENSUS_2026-10-10.md) used only three public package/version strings (Pillow 10.1.0, Transformers 4.35.0, torch public 2.5.1), returned exactly 32+50+22 = **104 public advisory records with ALL current IDs and aliases**, and recovered all 36 prior saved samples. Cross-referencing shared upstream public identifiers groups those records into **64 alias-linked groups**, NOT a proof of 64 unique bugs or LOCAL3D exploits. All 104 records remain UNTRIAGED per real call path and no OS security gate or package fix is accepted. [Sanitized full public source SHA and alias groups](docs/evidence/g3/g3-23-full-public-osv-id-census.json), with gitignored one-time local public-only query; all subsequent assembly/tests OFFLINE, no GPU/cloud/Office/printer or dependency upgrade. Issue #4 still OPEN.

## G3.22 — previous 104 Python OSV matches versus actual static app call paths (v0.2.22)

[CPU-only G3.22 security source triage](docs/G3_22_PYTHON_ADVISORY_STATIC_REACHABILITY_CPU_2026-10-10.md) verified the historical **34/34 exact pinned Python installed versions**, clean pinned upstream TSR commit, and 63 first-party plus 2 pinned upstream AST source files. The previous G3.5 public OSV report said 104 **version-level advisory matches** (50 Transformers, 32 Pillow, 22 Torch), but retained only **36 concrete sample advisory IDs**; the other **68 individual IDs are not present** and MUST NOT be called triaged or resolved. Direct Pillow Image.open / ImageOps.exif_transpose parse source image bytes and remain a HIGH-PRIORITY input surface despite absence of one specific ImageMath.eval API in source. Pinned ViT config and torch.load code, weights_only=True wrapper, SHA checks and app offline flags were observed; those are not OS-enforced egress or a complete transitive vulnerability clearance. [Sanitized SHA static proof](docs/evidence/g3/g3-22-pinned-python-static-triage.json). G3.6's Pillow 12.3 shadow is NOT an actual production upgrade; live G2 stays Pillow 10.1.0. Security Issue #4 OPEN; no OS/GPU/cloud/printer/Office changes.

## G3.21 — fail-closed manual mm physical-reference contract (v0.2.21)

The new CPU-only [G3.21 operator dimensional evidence contract](docs/G3_21_MANUAL_MM_REFERENCE_CONTRACT_CPU_2026-10-10.md) defines strictly bounded, SHA-model-bound input for a future independent physical caliper/ruler reference with dated source evidence hashes and two trusted mesh vertex landmarks. Extra keys (such as self-declared approvedForPrinter, mmPerGLBUnit or private email), forged SHAs, stale dates, invalid landmarks, NaN dimensions and non-independent image estimates are REJECTED. A structurally plausible submission is **PENDING human independent verification**, NEVER an automatically approved mm calibration; a missing submission is **BLOCKED_MISSING_EXTERNAL_REFERENCE**. [Sanitized four-source public-only evidence](docs/evidence/g3/orb-01-g321-physical-calibration-missing.json) confirms ALL FOUR SHA-pinned old GLBs remain blocked, with zero operator measurements provided, no measured physical mm factor, no wall-thickness approval and no printer release. The proof reads ONLY G3.20 public SHA JSON, not private G2 model/job files; no new GPU, cloud or printer actions.

## G3.20 — uncalibrated physical-unit source provenance and CPU normal-chord diagnostics (v0.2.20)

The CPU-only [G3.20 units/chords source audit](docs/G3_20_UNIT_PROVENANCE_AND_CHORD_CPU_2026-10-10.md) explicitly rejects **Trimesh/glTF mesh extras.units="meters"** as proof of true physical measurements from single-image TripoSR. None of the four previously licensed SHA-pinned GLBs contains a verified mm-to-GLB coordinate calibration, so `mmPerGLBUnit=null`, physicalMillimeterScale=UNKNOWN_UNCALIBRATED and no printer clearance remain NON-NEGOTIABLE. G3.20 analyzes mesh tessellation edge lengths in ARBITRARY units and samples deterministic centroid-to-opposite-facing *normal-ray first-hit chords*, not physical minimum wall thickness: 128 rays on G3.7 correctly oriented prior real-orb winding derivative, GT sphere and licensed chair. The original real orb has nonpositive signed volume despite consistent topology, and **normal-ray probing is explicitly DISABLED for that source** rather than assuming an inward ray direction. The GT solid sphere's median first-hit chord ~1.714 native units confirms this proxy can span an entire solid; even a tiny chord cannot establish printability. All four prior source SHA/license records remain pinned; [sanitized four-source proof](docs/evidence/g3/orb-01-g320-unit-chord-cpu.json) has no private data. This is DRAFT, not physical mm thickness, no new inference/GPU/cloud/printer.

## G3.19 — independently coded SECOND exact rational triangle contact oracle (v0.2.19)

New CPU-only [G3.19 independently coded exact triangle contact predicates](docs/G3_19_SECOND_EXACT_TRIANGLE_ORACLE_CPU_2026-10-10.md) crosscheck G3.17's rational triangle-contact classifier using an independent mathematical approach: 3D edge-plane interpolation for noncoplanar supports and vertex-in-triangle plus all nine exact 2D edge/edge intersections for coplanar contact (not G3.13's polygon clipping). Every no-index AABB candidate on each of FOUR SHA-pinned old GLBs was checked by BOTH exact engines, face-pair-by-face-pair: real orb **43,107/43,107** labels equal, unchanged winding-only copy identical, procedural GT **216/216**, licensed chair **28,593/28,593**; zero disagreements. For indexed face pairs, only **256 shared-edge and 256 one-vertex-only selected pairs per model** were compared using this SECOND oracle; G3.15/16 remain the exhaustive single-primary-gate checks, not full second-engine independent validation. New seeded adversarial fuzz and deliberate discrepancy injection MUST fail closed. [Sanitized SHA evidence](docs/evidence/g3/orb-01-g319-second-exact-oracle-proof.json). Still NO unquantized original CAD/mm scale, wall thickness, complete indexed-adjacency second-opinion, print/slicer QA or OS sandbox authorization. Every model DRAFT / printQualified=false. No new GPU/model/cloud/printer activity.

## G3.18 — independent exact-AABB candidate completeness check (v0.2.18)

CPU-only [G3.18 sorted-X exact AABB sweep audit](docs/G3_18_EXACT_AABB_SWEEP_AUDIT_CPU_2026-10-10.md) independently enumerates all finite decoded-IEEE754 GLB 3D bounding box overlaps using a sorted X interval sweep, outward-rounded Y/Z prefilters and exact Fraction rational interval comparisons. It never uses KDTree for its independent enumeration. Exact no-index candidate PAIR MEMBERSHIP (not just totals) is compared against the preexisting G3.17 numerical KDTree candidate set. Every exact strict/toleranced no-index candidate must be accounted for or the gate is INDETERMINATE. Four prior SHA-pinned genuine/reference models passed: **real orb 294,495 exact 3D AABB candidates, including 43,107 no-index pairs, none missed by G3.17**, identical winding-only copy; GT 7,866/216 and licensed chair 151,180/28,593, also zero missed. [Four-source sanitized SHA proof](docs/evidence/g3/orb-01-g318-exact-axis-sweep-proof.json). This is stronger proof of spatial candidate completeness for already-decoded binary-float GLB coordinates within bounds, NOT reconstructed original CAD, mm wall-thickness, independent triangle-narrowphase certification, user-untrusted input isolation or printer approval. All models DRAFT / printQualified=false; zero inference, GPU, cloud or printer actions.

## G3.17 — exact rational narrowphase for ALL numerically selected ZERO-index AABB candidates (v0.2.17)

The CPU-only [G3.17 no-index AABB-exact contact stage](docs/G3_17_EXACT_NOINDEX_AABB_CONTACT_CPU_2026-10-10.md) independently enumerates all conservative numeric AABB face-pair candidates, crosschecks 0/1/2 indexed adjacency counts against G3.14, and applies exact Fraction-based plane/triangle contact classification to every pair with **NO original shared vertex index**. Unlike G3.14's floating SAT risk filter, G3.17 can distinguish exact noncoplanar line intersections, coplanar positive-area or boundary-only overlaps, point touches and exact disjoint pairs for the entire candidate subset. Previously generated TripoSR real orb: **43,107/43,107 exact nonindexed AABB pairs disjoint**; unchanged winding-only copy identical, original procedural GT 216/216 and licensed chair 28,593/28,593 disjoint. [Sanitized SHA proof](docs/evidence/g3/orb-01-g317-exact-noindex-aabb-pairs.json). Other index-adjacency classes are covered by G3.15 edge / G3.16 one-vertex exact stages, but **no formal global exact spatial-index completeness or CAD/physical print certificate** is claimed. Every output DRAFT, printQualified=false. No inference, cloud, GPU or printer.

## G3.16 — exact contact for ALL indexed single-vertex-only pairs (v0.2.16)

New local CPU-only [G3.16 exact one-index vertex-only pair census](docs/G3_16_EXACT_INDEXED_VERTEX_CONTACT_CPU_2026-10-10.md) independently enumerates **every face pair sharing exactly one original vertex index** (without an indexed edge), from raw vertex-to-face incidence. Using exact rationals on already decoded GLB IEEE-754 coordinates it distinguishes expected one-point contact, noncoplanar extra positive-length line contact, coplanar extra edge segment and coplanar positive-area overlap. The PREVIOUSLY generated real orb has **190,860** such pairs, all exactly classified: **0 extra contacts** in this narrow class. Identical winding-only copy, project-original GT (5,730 pairs) and historical licensed chair (92,629 pairs) also completed with 0 extras. Positive synthetic line/area overlaps are correctly flagged. [Four-source sanitized SHA proof](docs/evidence/g3/orb-01-g316-exact-indexed-vertex-only.json). **Not global exact self-intersection clearance**: zero-index face pairs still have only G3.14 numerical SAT screening; real CAD precision, physical millimeters/wall thickness, security sandbox and printer QA still blocked. All models DRAFT, printQualified=false. Zero inference/GPU/printer.

## G3.15 — exact geometrical classification of ALL indexed shared-edge pairs (v0.2.15)

New CPU-only [G3.15 exact shared-edge contact proof](docs/G3_15_EXACT_INDEXED_EDGE_CONTACT_CPU_2026-10-10.md) goes beyond the narrow G3.11 numerical backfold screen and the G3.13 selected-pair exact sample. It classifies ALL **60,528 indexed full-edge-adjacent face pairs** of the PREVIOUSLY generated real TripoSR orb with exact rational arithmetic on **already decoded IEEE-754 GLB coordinates**. Each pair is mathematically checked for noncoplanar expected edge-only contact, coplanar opposite-side edge-only contact, or coplanar same-side positive-area overlap. Real orb, unchanged winding-only copy, project source GT and historical chair all completed with **0 exact coplanar same-side shared-edge overlaps**; normal cube corners and normal touching edges are not marked defective. This does **NOT** certify indexed one-vertex extra ray contacts, nonindexed floating SAT negatives, original CAD/mm dimensions, wall thickness or printing. [Sanitized SHA evidence](docs/evidence/g3/orb-01-g315-exact-indexed-edge.json). No CUDA, model inference, cloud or printer involved.

## G3.14 — independent exhaustive numerical AABB-pair coverage (v0.2.14)

New CPU-only [G3.14 full AABB candidate census](docs/G3_14_AABB_FULL_PAIR_CENSUS_CPU_2026-10-10.md) independently encloses each TRIANGLE BOUNDING BOX in a conservative sphere, enumerates all numerical AABB-overlapping unordered face pairs and splits them by shared indexed vertices: none, exactly one or full edge. All zero-index pairs are rerun through the existing numerical SAT; only SAT positives are routed to bounded G3.13 exact pair predicates. **This is numerical candidate enumeration, NOT global exact self-intersection clearance.** The real previously generated 40,352-face orb has **294,495 AABB candidates**, including 60,528 shared-edge, 190,860 one-vertex and 43,107 no-index; **0 numerical no-index SAT positive candidates**. This independently broadens earlier G3.8 filtered AABB counts by **82** possible overlapping boxes, NOT by 82 proven real mesh defects. Four original SHA-pinned real/reference sources validated without any new inference or printing. [Public sanitized counts](docs/evidence/g3/orb-01-g314-full-aabb-census.json). G3 #3 and security #4 remain OPEN.

## G3.13 — exact-binary-float triangle PAIR predicates, selected pairs only (v0.2.13)

Added a bounded pure-CPU exact-rational predicate for **explicitly selected pairs of triangles**. It detects strict noncoplanar interior edge-piercings, coplanar positive-area overlaps and definite plane separation; zero/borderline exact determinants are UNRESOLVED. The exactness applies ONLY to the IEEE-754 coordinates **already decoded from GLB**, not true CAD/mm precision. This is a reusable primitive **not a full-mesh broadphase or self-intersection-free certificate**.

19 new adversarial Python tests passed. A SHA-locked proof on FOUR previously existing licensed GLBs checked exactly **24 chosen indexed shared-edge face pairs per model**: all 24 in each are **unresolved legitimate shared-edge contacts**, NOT 24 defects or a clearance of untested pairs. No fresh GPU, reconstruction, cloud or printer actions. [G3.13 scope](docs/G3_13_EXACT_SELECTED_TRIANGLE_PREDICATES_CPU_2026-10-10.md) · [Sanitized selection-only evidence](docs/evidence/g3/orb-01-g313-selected-exact-pair-predicate.json).

## G3.12 — different-index spatial vertex proximity (v0.2.12)

New offline CPU-only [G3.12 spatial index screen](docs/G3_12_SPATIAL_INDEX_PROXIMITY_CPU_2026-10-10.md) examines the gap left by G3.8–G3.11: vertex IDs that are distinct in indexed topology but occupy exactly the same or nearly the same XYZ position, and whether such vertices belong to different indexed components. **All four previously existing SHA-verified models passed the bounded census**; the real TripoSR orb (20,178 vertices), winding-only copy, GT sphere and prior chair have **0 different-index exact/near spatial pairs** within 1e-7 × their own AABB diagonal. Positive controls detect actual touching disconnected shells; dense-neighbor/pair limits are **INDETERMINATE**, never false clearance. This is not a complete face-intersection test, mm-scale measurement or manufacturing gate. [Immutable sanitized evidence](docs/evidence/g3/orb-01-g312-spatial-index-proximity.json). No new GPU inference, installation or printer access.

## G3.11 — shared-edge planar backfold risk on real orb (v0.2.11)

G3.11 checks a further geometry case not covered by the earlier adjacent-edge angle histogram: **triangles sharing the SAME complete indexed edge** whose third vertices are on the same lateral side AND nearly coplanar, potentially overlapping beyond their expected common edge. All 60,528 indexed edge-adjacent pairs in the previously generated actual `01-orb-alpha` TripoSR model and copy-only winding reversal were screened, with **0 same-side coplanar overlap candidates, 0 near-antiparallel >=175° or suspicious same-side >=150° backturns**. The original procedural GT and historical chair derivative were independently screened too.

The accompanying tests recognize deliberately coplanar overlapping triangle fixtures and avoid mistaking legitimate flat seams or intentional sharp cube corners for defects. **This remains a numerical CPU diagnostic, NOT an exact self-intersection-free or print-qualification certificate.** Coplanar numeric tolerance, mm scale, wall thickness, material strength and full collision/proximity remain open. [Method and limitations](docs/G3_11_EDGE_BACKFOLD_CPU_2026-10-10.md) · [Sanitized real-model proof](docs/evidence/g3/orb-01-g311-edge-coplanar-screen.json). No new GPU inference or printer actions.

## G3.10 — vertex-only additional contact-ray screening (v0.2.10)

G3.10 extends the CPU-only diagnostic series to triangle pairs that share **exactly ONE vertex but not an edge**. On the prior genuine TripoSR `01-orb-alpha` model and its non-destructive winding-only copy, all **190,860 unique vertex-only pairs** per model were analyzed for a possible **extra nonzero common ray beyond the ordinary shared vertex**, with 0 candidates flagged and 0 near-coplanar unresolved cases at the configured numerical tolerances. Known procedural GT and the earlier real chair derivative are additional CPU controls.

This is **not mathematical proof of no self-intersections or readiness to print**: the algorithm does not certify coplanar/near-zero numerical edge cases, coincident coordinates with different vertex IDs, true edge-adjacent foldover, physical wall thickness, scale in millimeters, materials or slicer suitability. The difference between a normal shared-vertex contact and additional overlap is explicit; uncertainty and resource exhaustion never produce a false clearance.

[**G3.10 full CPU method**](docs/G3_10_SHARED_VERTEX_CPU_2026-10-10.md) · [Sanitized SHA-linked real-model results](docs/evidence/g3/orb-01-g310-shared-vertex-ray-screen.json). Normal workflow does not allocate GPU or modify model files. The independent local model-output ledger remains 2/9 real completed cases (7 require fresh per-image authorization).

## G3.9 — indexed edge-adjacent normal-angle diagnostic (v0.2.9)

Following G3.8's nonadjacent-triangle conservative SAT contact screen, G3.9 now assesses **all 60,528 EDGE-adjacent face pairs** of the one previously generated actual 01-orb-alpha TripoSR mesh. Adjacent surface-normal angle p95 is **33.019°**, with 312 edges above 45° and none above 90°. The 1,280-triangle original procedural GT's p95 is **5.732°**, but their very different mesh densities make these percentages unsuitable as calibrated 3D prediction accuracy or physical finish metrics.

The TripoSR original and copy-only winding-fixed derivative produce **identical results**, confirming that orientation reversal did not remove the visible roughness. Sharp edges can be legitimate (e.g. a cube); pairs sharing only one vertex, true geometric foldover, wall thickness, mm dimensions, strength and print readiness are NOT resolved. All records are DRAFT. [Detailed CPU proof and limits](docs/G3_9_ADJACENT_FACES_CPU_2026-10-10.md) · [sanitized angle statistics](docs/evidence/g3/orb-01-g39-adjacent-angles.json). CPU-only independent replay operates on existing local model files, without GPU/AI or printer. Private inference coverage stays 2/9.

## G3.8 — real orb CPU-only contact risk and radial irregularity (v0.2.8)

G3.8 screens the genuinely completed `01-orb-alpha` TripoSR GLB and the previous copy-only orientation derivative for possible **non-vertex-adjacent triangle surface contacts**, using strictly bounded local CPU computation. Both 40,352-triangle versions completed an examination of **43,025 eligible triangle pairs**, with **0 potential contacts flagged**. Crucial caveat: adjacent triangles (251,388 AABB candidate pairs in each) are excluded, and the floating-point screen cannot prove absence of all intersections; printing is **still blocked**.

A second CPU-only diagnostic takes 4,096 area-weighted points from the procedural source sphere and from the previously generated TripoSR orb, fits each its own normalized best-fit sphere, then reports relative mean radial deviations of **0.0625% source vs 4.974% AI output**. This illustrates shape nonroundness, not any percentage of 3D-image accuracy, physical millimeter deviation, measured surface finish or an automatic smoothing pass. The previous winding correction makes no shape improvement.

[**G3.8 engineering method and limits**](docs/G3_8_ORB_CPU_RISK_2026-10-10.md) · [G3.8 sanitized CPU proof](docs/evidence/g3/orb-01-g38-cpu-risk-screen.json). Private results are read-only reproducible from the completed local job; no GPU, new image, printer or cloud is involved. The private original/model-output ledger stays **2/9** (historic chair + real orb) with seven pending. New model GPU authorizations are still individual.

## G3.7 — true orb model, copy-only winding and local visual verification (v0.2.7)

A genuinely generated TripoSR result now exists for the first project-original G3 fixture, **01-orb-alpha**. Its one-time authorized inference took 12.59s and produced a SHA-verified 808,092-byte GLB, 20,178 vertices and 40,352 triangles. Independent CPU QA found a **watertight but inward-facing** mesh, with negative signed volume.

G3.7 corrected **ONLY triangle winding** in a separate private/ignored copy and independently proved that vertex positions, per-vertex colors and individual triangle geometry were preserved exactly. The corrected copy has positive signed volume, but BOTH versions remain DRAFT/NOT PRINT QUALIFIED: physical dimensions, self-intersections, wall thickness and structural/material safety are untested. The reconstructed orb visibly contains surface roughness not present in the smooth procedural GT; the winding-only correction does not smooth it.

[Three-way true GLB software preview](docs/evidence/g3/orb-01-threeway-preview.png) · [G3.7 CPU evidence and safety gates](docs/G3_7_ORB_WINDING_CPU_2026-10-10.md) · [Sanitized QA/provenance](docs/evidence/g3/orb-01-cpu-quality-milestone.json). **All G3.7 computation used CPU/software-rendering; zero new inference, printer actions or Office changes.**

The private SHA-verified local benchmark now includes **2/9 real model outputs** (old MIT chair + new 01 orb), while the published fixed historical snapshot remains **1/9 by design** and is not an automatically refreshed live counter. Seven licensed fixtures still await explicit per-image GPU approval. Private GLB files stay gitignored.

## Windows source-owner Git hotfix — resolved for interactive CHRIS

An approved single-image `01-orb-alpha` G3 trial failed at the worker's first `verify_sources` step because the source checkout belongs to Windows SYSTEM but interactive CHRIS Git refused it as dubious ownership. **This run consumed its one-use permit but created no GLB.** The initial CPU-only source integrity tests under the connected system account passed, but the interactive-user run identified the trust boundary.

The patched TripoSR worker now passes an **exact, command-local Git safe.directory** only for two pinned read-only source metadata commands; it still checks clean source/expected commit and all downloaded-model SHA256 values. No global Git settings were modified. The interactive-user CPU-only proof **passed in CHRIS**, and a **new, separately authorized single-image 01-orb-alpha GPU run** subsequently completed; the earlier failed v0.2.4 approval remains spent and must never be reused.

## G3.4 — one-click CPU benchmark review after manual inference (v0.2.4)

Completed manually approved G2 jobs whose image SHA matches one of the nine licensed G3 reference inputs now show **"השוואת G3 (CPU)"**. A click runs the pinned, offline local Python scorer once and exposes a downloadable benchmark-shape.json. It validates the source, output model, QA and pinned model provenance, and is always NOT PRINT QUALIFIED. The ninth upstream chair has no actual original 3D ground truth, so the report states **NO_GROUND_TRUTH_3D** rather than a fictional 3D accuracy score. Changing a source image still revokes GPU consent.

G2 adapter now records **optional shared-host NVIDIA used/free/utilization observations** on future manually approved actual inference runs, explicitly separated from PyTorch's peak CUDA reserved memory; neither is an exclusive VRAM measurement. The actual CPU reviewer passed an end-to-end localhost proof using the **historical G2 chair GLB**, with zero new inference. The model-accuracy benchmark is still **1 historical model observed and 8 licensed sources not inferred**.

Read [G3.4 operator and measurement protocol](docs/G3_4_CPU_REVIEW_TELEMETRY_2026-10-10.md) and [prior CPU proof](docs/evidence/g3/g3-4-existing-chair-cpu-proof.json). Still no automatic model queue, second provider, OS isolation or printer release.

## G3.3 — measurable 3D shape comparison and ready-to-load test images (v0.2.3)

The G3 reference catalog can now be opened directly inside the Hebrew image input via **טען תמונה לטופס בלבד**. It loads one of nine licensed PNG inputs but **NEVER starts a job or allocates GPU**. Selecting/replacing/clearing any source image invalidates prior GPU consent, so real G2 jobs still require a fresh checkbox approval **per image**.

A CPU-only, reproducible [3D shape-distance evaluator](docs/G3_3_SHAPE_EVALUATION_2026-10-10.md) compares completed local models to the eight original synthetic source geometries after independent scale normalization and best-of-eight yaw search. Eight identical source/self controls and four deliberately wrong-shape controls prove the diagnostic responds to gross shape changes; they are NOT new AI results. The ninth upstream chair has no original 3D reference and receives no fake 3D fidelity score.

Run **npm run score:g3 -- --job-id <full-job-uuid>** only after explicitly approving and completing a manual TripoSR image job; it validates source/model/QA SHA and saves the shape score to gitignored private runtime. Optional private benchmark collector joins verified metadata without presenting it as independently verified GPU execution. **Public historical coverage remains 1/9; eight new inputs are still not inferred.** No print qualifications or new GPU model runs were introduced.

## G3.2 — benchmark coverage and shared GPU protection (v0.2.2)

Local-first safety now includes an atomic GPU lease across multiple manually started LOCAL3D Node servers, in addition to the original in-process/Office/NVIDIA guards. If another G2 server owns the lease, a new GPU request is rejected (409) without scheduling the job. After a crash, locks are **not automatically cleared**. Inspect with npm run audit:g3:gpu-lock; do not bypass it without checking for worker processes.

A read-only, SHA-verified [nine-source benchmark coverage snapshot](docs/evidence/g3/benchmark-coverage.json) reports **1 previously observed real G2 chair result and 8 unrun images**, not nine AI successes. In the UI, the new G3 QUALITY BENCHMARK panel shows these historical results, never a GPU trigger. npm run benchmark:g3 reproduces the public snapshot; an optional --jobs-dir flag writes only to gitignored private runtime. npm run audit:g3:storage reports existing job storage size/age without deleting anything.

See [G3.2 security + operations](docs/G3_2_SAFETY_BENCHMARK_2026-10-10.md). Still no print certification, multi-user OS sandbox, second provider installation or automatic benchmark run.

## G3 preview — CPU geometry quality checks (no new GPU inference)

A new manual **סריקת רשת (CPU)** button on completed TripoSR jobs runs independent topology inspection in the local isolated Python environment. It checks GLB source SHA, connected components, open/nonmanifold edges, signed volume, winding and face quality; exposes a separate downloadable **geometry-qa.json** asset, with explicit unknown real-world units and wall thickness. It NEVER print-qualifies a model.

A reproducible **9-fixture benchmark source catalog** is available under [benchmarks/g3](benchmarks/g3/README.md): 8 project-original synthetic image/mask/source-3D triples plus the already-licensed upstream chair photo and mask. At the original G3 preview checkpoint, no new synthetic image had been inferred; G3.7 now documents ONE real previously authorized TripoSR orb output, leaving seven original inputs unrun. Exact-source-camera positive controls validate the silhouette scorer, not the AI. The previous real chair's signed volume was found to be **negative despite watertightness**. A separate CPU-only optional winding derivative preserves the original and still remains DRAFT.

Read [G3 progress](docs/G3_PROGRESS_2026-10-10.md), [real-world geometry evidence](docs/evidence/g3/README.md) and [research-only engine screening](docs/G3_PROVIDER_SCREENING.md). **Issue #3 remains open** for licensed-image GPU benchmarking, actual provider comparisons, physical print geometry qualification and hardening.

## Not implemented / not claimed

No unattended GPU worker, public/multi-user authentication, arbitrary text-to-3D, cloud inference, dimensionally accurate CAD, manufacturing qualification, wall-thickness and support checks, print-ready STL/3MF release, fabrication router, machine control, or integration into Office 2.0 P0. The input model quality is not guaranteed by a single sample; further licensed-image benchmarking is needed before production use.

## Documentation and evidence

- [G2 manual integration, security and operation](docs/G2_APP_INTEGRATION.md)
- [Actual app/browser GPU proof](docs/evidence/g2-app/README.md) — real image-derived GLB, unedited Chrome screenshot, SHA and QA report
- [Original isolated TripoSR pilot](docs/G2_RESULTS.md) and [pilot evidence](docs/evidence/g2/README.md)
- [API contracts](docs/API.md) | [Security](docs/SECURITY.md) | [Operations](docs/OPERATIONS.md)
- [Licensing](docs/LICENSES.md) | [Gates and benchmarks](docs/GATES.md) | [Engine comparisons](docs/ENGINE_CANDIDATES.md)
- [G2 source lock](docs/TRIPOSR_SOURCE_LOCK.json) and [scoped original approval](docs/G2_APPROVAL_2026-10-09.json)

This is independent from nocturney/velvetos-core. Its AI3D Issue #613 remains P2/PARKED and is not activated or modified by LOCAL3D.

## G3.5 — resource admission and dependency screening (v0.2.5)

Manual G2 jobs now fail closed **before** acquiring a GPU lease or saving a new image if verified storage thresholds are exceeded (development defaults: 8GiB stored, at least 3GiB remaining after a 128MiB prospective job reservation, at most 400 existing job folders). No private data is deleted, and G1 DEMO is unaffected. G3's topology and licensed-source benchmarking share a **single in-process CPU review permit** to avoid parallel CPU spikes; extra requests return 409 instead of queuing.

**Security limitation:** A read-only public OSV.dev screening of 34 pinned PyPI package versions found 104 advisory matches across Pillow, Transformers and PyTorch. This is NOT proof of exploitability in this pinned offline inference path, but it prevents a responsible production-security clearance without detailed triage and isolated dependency remediation. The manual G2 UI now explicitly warns to use **trusted image sources only**. npm audit of the pinned Node dependency tree returned 0 matches as of this checkpoint. No model packages were changed.

Read [G3.5 resource/supply-chain screening](docs/G3_5_RESOURCE_SECURITY_2026-10-10.md). Public evidence contains only sanitized counts, package names/versions and advisory IDs, never customer images or job IDs.

## G3.6 — verified Pillow shadow experiment (v0.2.6)

The original G2 model still uses **Pillow 10.1.0**. For security evaluation only, a separately staged Windows Python3.11 Pillow **12.3.0** candidate had a verified official PyPI wheel SHA-256 and zero version-level OSV advisory matches at the test time (previous Pillow 10.1.0 had 32). The shadow code passed **9/9 pinned source image CPU preprocess checks**, four synthetic edge tests, **23/23 existing Python unit tests** and an **import-only** pinned TripoSR/Transformers/Torch smoke. **No model checkpoint loading, CUDA inference, package replacement, Office interaction, or printing occurred.** This does not prove full model or commercial security compatibility, and does not address Transformer/Torch advisory matches.

More: [G3.6 detailed offline-shadow proof](docs/G3_6_PILLOW_SHADOW_2026-10-10.md), [sanitized SHA-locked result](docs/evidence/g3/g3-6-shadow-pillow-cpu-proof.json) and [v0.2.6 Node audit proof](docs/evidence/g3/g3-6-npm-audit-summary.json). GitHub Issue #4 remains OPEN for vulnerability-path triage and a separately approved fully isolated upgrade; the candidate is NOT enabled in normal LOCAL3D.
