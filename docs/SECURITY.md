# LOCAL3D security/threat model — G1 and manual-only G2

## G3.42: actual SECOND full pinned 34-package Python venv restore, CPU-only and same host

Read-only source full private G3.41 venv backup (27966 files, 4.74GiB) was itself verified against SHA manifest, then physically copied to distinct owned disposable restored venv. Every restored file matched source hash, actual restored Python independently loaded 34/34 pinned distributions and native Pillow10.1 safe synthetic PNG/JPEG/WebP images, 262 quality +7 G2 offline unit tests passed; restored file hashes checked again before temp deletion. No live environment mutation, GPU, VM, G1 startup or Office bridge changes. **NOT a complete disaster-recovery backup of base OS/C: Python installation, CUDA drivers, model weights, arbitrary untrusted native decoders, CVE remediation or 3D print release.** Keep security #4, G1 #5, print #3 OPEN. [G3.42 proof](evidence/g3/g3-42-full-venv-same-host-real-offline-restore.json).

## G3.41: real 27,966-file pinned venv snapshot with clone CPU proof; no security-production release

Original Windows Python3.11 venv (all 34 pinned distributions, 4.74GiB) was copied into private ignored machine-local QA and **27,966 source/backup file SHA** matches proven; original site packages untouched. Copied Python interpreter separately executed in its own sys.prefix, verified all 34 pinned metadata and 3 native Pillow10.1 original synthetic formats. Real official Pillow10.1 wheel from G3.40 also stored privately. This **does NOT include original CPython base C: installation, OS/network sandbox, model weights, GPU drivers, real cross-machine disaster recovery, untrusted media permission, CVE mitigation or authorized production candidate upgrade**. Source pathname/list and per-file hashes remain private; public evidence holds only an aggregate SHA linked to the private manifest. Security #4 OPEN, G1 restart/autostart #5 OPEN, physical print #3 OPEN. [G3.41 immutable report](evidence/g3/g3-41-real-private-full-python-venv-snapshot-cpu-readback.json).

## G3.40: pinned original Pillow10.1 wheel recovered and real native offline rollback on CLEAN temporary venv

Official original Pillow10.1 Windows x64 cp311 wheel SHA/metadata and release URL verified; stored ignored/private (not public Git). A full clean temporary venv installed Pillow10.1, replaced it with shadow12.3 then restored original10.1 with pip strictly offline --target. All 3 original safe PNG/JPEG/WebP native decoder RGB SHA results matched after actual reinstall; baseline production Pillow Image.py source/version unchanged. This **only** establishes narrow legitimate original-wheel recovery and Pillow-only isolated install parity, NOT a full 34-package environment backup, active CVE mitigation, actual Torch+Transformers model/CUDA compatibility, network/file/clipboard isolated hostile media decoder, approval to accept untrusted customer images or print release. Security #4, Windows G1 startup #5, physical print #3 remain OPEN. [Evidence](evidence/g3/g3-40-verified-official-wheel-and-real-isolated-rollback.json).

## G3.39: read-only post-reboot startup audit cannot be mistaken for a deployed G1 service

Chris currently has no LOCAL3D loopback4177 or G2/4179 listener; independent Office/4178 remains loopback active. Repo/data ACL readable for the scanning session, TaskScheduler/service/startup name/action searches show zero explicit matches, but do NOT attest a future least-privilege principal, unattended logon or absence of generic named launchers. A disabled, nonregistrable G1 task draft requires explicit operator authorization and measured noninteractive permissions before any Task Scheduler installation or boot restart. Strict candidate review forbids System/HIGHEST, external network bind, G2/GPU opt-in, port4178, printer, automatic task registration or claims of Issue #5 closure. No OS changes or service launch. [G3.39 method](G3_39_G1_BOOT_STARTUP_DISABLED_REVIEW_2026-10-11.md), [source SHA proof](evidence/g3/g3-39-disabled-g1-boot-review-no-task-installed.json). Security #4 and print #3 remain OPEN independently of operational #5.

## G3.38: verified 34/34 Python production baseline but production rollback safety is NOT demonstrated

The actual production Python3.11 importlib.metadata inspection exactly matched all 34 frozen requirements. An isolated Pillow12.3.0 wheel was SHA verified and one checked local project wheel store did not contain the original Pillow10.1.0 wheel; do not infer from this limited scan that no rollback wheel exists elsewhere. Two synthetic text-manifest restoration exercises ran ONLY on owned temporary QA files. They are **not** a Python environment clone/reinstall, verified dependency recovery plan, native parser isolation, advisory remediation, CUDA model validation or approval to upgrade production. The public G3.38 rollback checklist is blocked and validated against prior G3.37 partial-shadow and G3.35 refusal evidence. Security #4 OPEN, G1 uptime #5 OPEN, print #3 OPEN. [Runbook](G3_38_PYTHON_ROLLBACK_PREFLIGHT_CPU_2026-10-11.md), [SHA report](evidence/g3/g3-38-python-upgrade-readiness-and-synthetic-rollback.json).

## G3.37: 242 real Pillow12.3 shadow CPU test passes with transparent old-version exclusions, NOT security release

The first broad quality-suite attempt under existing isolated Pillow12.3 returned 5 historical-version errors, all in old security metadata or immutable Pillow10.1 fixture generation checks. This is NOT a native image parser exploit claim and the old tests must remain frozen. A strict shadow-safe unittest filter excludes exactly 20 dependent historical methods (16 G3.22, 3 G3.26, 1 G3.30) from 262 discovered tests; the remaining 242/242 passed under real Pillow12.3 shadow with CUDA invisible and offline dependency fetching. **This does not prove a complete Pillow12.3 quality-suite pass or full Torch/Transformers GPU inference compatibility.** No production venv or new packages touched, and no OS-backed native decoder isolation, customer input permission or CVE fix. Security #4/G1 #5/manufacturing #3 still OPEN. [Method](G3_37_PILLOW_SHADOW_QUALITY_CLASSIFICATION_CPU_2026-10-11.md), [evidence](evidence/g3/g3-37-shadow-pillow-historical-test-isolation.json).

## G3.36: fresh G1 fixture-only HTTP admission has been CPU-tested, but persistent G1 restart remains an independent gate

Windows reboot left the normal localhost 4177 fixture-only server OFF while independent Office/4178 continued. A safe short TCP probe established 4177 NOT_LISTENING at the observation time. The G3.36 temporary G1 instance reused actual current server/index.js and original SHA-verified three synthetic image fixtures: 9/9 truncated images rejected HTTP422 BAD_IMAGE_STRUCTURE before jobs, three valid originals admitted simulation-only 201, health G1_DEMO inference=false and G2 staged disabled. It bound a disposable loopback test port, never contacted 4178 or persisted an autostart service. This verifies current source behavior in ephemeral tests **not** actual G1 4177 availability, signed OS decoder confinement, untrusted client media eligibility or 3D print approval. Security #4, manufacturing #3 and G1 restart #5 remain OPEN. [G3.36 report](evidence/g3/g3-36-g1-ephemeral-recovery-readiness-not-live-activation.json), [runbook](G3_36_G1_EPHEMERAL_RECOVERY_READINESS_CPU_2026-10-11.md).

## G3.35 — all known-good Pillow CPU compatibility cases pass, production upgrade still denied

16 previously approved/test-generated or MIT-licensed source cases from G3.33/G3.34 are replayed through SHA-bound public evidence with 15 exact RGB matches plus one identical invalid PNG rejection between Pillow10.1.0 production and shadow12.3.0. The new fail-closed matrix intentionally cannot certify a native decoder sandbox, GPU-model stack parity, Torch/Transformers/Pillow advisory remediation, trusted host/guest file and egress isolation, arbitrary untrusted customer upload or physical print. Seven release blockers remain. The immutable public report binds earlier report SHAs and private ignored lane receipts, so a fabricated source or additional readiness claim fails instead of silently approving deployment. No production Python change or OS/Office change. [Matrix source](G3_35_PILLOW_CPU_COMPATIBILITY_AND_UPGRADE_GATES_2026-10-11.md), [SHA proof](evidence/g3/g3-35-pillow-cpu-compatibility-and-upgrade-blockers.json). #4/#3/#5 OPEN.

## G3.34: negative malformed PNG in two Pillow versions is NOT hostile parser security certification

The pinned source/original SHA/byte-size of four safe G3.6 generated images were rechecked before CPU-only workers prepared them with production Pillow10.1.0 and existing separate Pillow12.3.0 shadow. Exact RGB equality on transparent PNG, EXIF JPEG and transparent WebP, and rejection of a deliberately short harmless bad PNG, demonstrate narrow preprocessing behavioral parity ONLY. They cannot establish safe native parsing of arbitrary hostile input, eliminate version-matched advisory findings, establish actual Windows Sandbox file/network isolation or qualify CUDA/GPU inference/print. No model/weights, packages, OS security or Office/4178 actions. [G3.34 proof](evidence/g3/g3-34-pillow-edge-cases-cpu-parity.json), [method](G3_34_PILLOW_SAFE_EDGE_CASES_CPU_2026-10-11.md). Security #4 OPEN, manufacturing #3 OPEN.

## G3.33: exact 12/12 trusted Pillow preprocessing compatibility is NOT native decoder sandboxing

## G3.33: exact 12/12 trusted Pillow preprocessing compatibility is NOT native decoder sandboxing

Existing Pillow12.3 shadow overlay and pinned production Pillow10.1 were tested on 12 previously known-good SHA/rights-approved source inputs; RGB pixel hashes, dimensions and alpha path match 12/12, and 7 G2 offline unit tests passed under the shadow process-local PYTHONPATH. Production image decoder has not been upgraded; no GPU/TripoSR full model inference, new packages, network or OS security policy changes occurred. Actual hostile/untrusted media parsing by either pinned native library remains an **unverified safety risk** until genuine OS confinement and upstream advisory remediation. A successful CPU-only compatibility shadow is not proof that old native decoder bugs are fixed, nor approval to deploy Pillow12.3 production without independent GPU/complete dependency tests. Security Issue #4 OPEN, manufacturing Issue #3 OPEN. [G3.33 method](G3_33_PILLOW_12_3_SHADOW_CPU_COMPARISON_2026-10-11.md), [SHA proof](evidence/g3/g3-33-pillow-12-3-shadow-cpu-compatibility.json).

## G3.32: canonical Microsoft .wsb tag and .NET XML structure pass are NOT effective OS sandbox proof

The static G3.29 no-network/no-host-share candidate used the vGPU tag spelling; Microsoft's sample uses VGpu. G3.32 creates a NEW exact-casing candidate with this difference only, preserving all intended explicit deny settings and prior SHA evidence. A read-only .NET parser with prohibited DTD/entity resolution verified the XML document tree, and negative tests prevent unsafe profile drift. **Neither original nor new candidate has been launched.** There is no verified guest, isolation/egress/file boundary, signed guest output, patched native Pillow 10.1.0 worker or permission for untrusted image/GPU/print. Issue #4 and #3 remain OPEN. [Details](G3_32_CANONICAL_WSB_XML_CPU_2026-10-11.md) / [public proof](evidence/g3/g3-32-canonical-wsb-xml-static-review.json). No OS/Office/4178/4177 restart or downloads/weights/printer actions.

## G3.31: optional feature Enabled does NOT mean Store Sandbox CLI is registered or confinement proven

## G3.31: optional feature Enabled does NOT mean Store Sandbox CLI is registered or confinement proven

A new read-only Windows Sandbox inventory checks both Microsoft's newer `wsb` CLI and legacy WindowsSandbox.exe, AppX current/all-users, provisioned AppX, StartApps and SystemApps. The authorized Chris remote Session 0 observation returned no registered app or launcher visible, despite feature Enabled and HypervisorPresent true. This classification applies **only to the observed remote service context**, not the desktop user's possible Sandbox availability. No VM was launched; no containment or egress proof. Exact-key contract fails closed and cannot grant a guest image decoder, G2 GPU, untrusted customer images or print approval based on mere launcher presence. Source-linked immutable public proof uses the frozen direct scan output after later nested PowerShell timed out. [Full evidence](G3_31_WINDOWS_SANDBOX_CLIENT_DISCOVERY_CPU_2026-10-11.md) / [public SHA report](evidence/g3/g3-31-windows-sandbox-launch-discovery-only.json). Security Issue #4 and physical print Issue #3 OPEN. No OS/Office/4178 changes.

## G3.30: trusted synthetic-only host CPU input/output protocol, NOT an isolated decoder

## G3.30: trusted synthetic-only host CPU input/output protocol, NOT an isolated decoder

Pure Node source pinning accepts precisely the three known prior 64x64 generated SHA-locked PNG/JPEG/WebP fixture bytes and checks deterministic trusted host CPU Pillow 10.1.0 converted RGB PNG outputs. It binds source+output SHA/size/type, candidate Windows Sandbox profile SHA, explicit fake host-only processing receipt, no guest/egress/file confinement and ALWAYS releaseToRealGPUWorker=false. Forged guest/network evidence, arbitrary paths, unknown media or altered receipts fail closed. This is a *contract simulation*, not an actual guest process or separate verified Windows sandbox. Existing production G2 worker still calls Pillow on Windows host without native OS isolation, and old dependency advisories remain unresolved.
[G3.30 docs](G3_30_TRUSTED_SYNTHETIC_EXCHANGE_CPU_2026-10-10.md), [immutable public proof](evidence/g3/g3-30-trusted-only-offline-exchange-not-sandbox.json). No real image/customer inputs or GPU/OS/Office/firewall/weights/printer modifications, Issue #4 OPEN, #3 OPEN. A confirmed host feature Enabled flag or simulated candidate receipt is NEVER a native-sandbox/untrusted-image/print release.

## G3.29: Windows Sandbox feature enabled DOES NOT qualify an OS parser sandbox

## G3.29: Windows Sandbox feature enabled DOES NOT qualify an OS parser sandbox

Read-only host feature discovery on Chris Windows 11 Pro build 26300 returned Containers-DisposableClientVM Enabled and HypervisorPresent true, but ordinary WindowsSandbox.exe launcher names were unresolved. There was **NO** guest launch, CPU decode inside a VM, verified networking egress block, filesystem/clipboard confinement, safe ingress/return channel, or Pillow decoder isolation. A separate exact-byte .wsb profile candidate disables networking/vGPU/clipboard/audio/video/printer, ProtectedClient Enable and provides no mapped folders/guest startup commands. Static readiness gate RETURNS BLOCKED_NO_RUNTIME_OS_ATTESTATION regardless of favorable feature flags. It deliberately does not change G1/G2 runtime or OS state. Microsoft's default Windows Sandbox settings allow networking/clipboard/vGPU; explicit disabled values in a config file are necessary but insufficient until real isolation tests.
[Design and limitations](G3_29_WINDOWS_SANDBOX_READINESS_CPU_2026-10-10.md) / [immutable capability-only proof](evidence/g3/g3-29-windows-sandbox-readiness-not-attestation.json).
Untrusted user uploads and native parser security Issue #4 remain OPEN; manufacturing Issue #3 remains OPEN. No Office, 4178, OS security policy, GPU/TripoSR, weights, cloud or printing operations.

## G3.28: bounded image container validation added to API, but NOT untrusted-upload security

## G3.28: bounded image container validation added to API, but NOT untrusted-upload security

New server/index.js rejects structurally incomplete PNG/JPEG/WebP files via zero-dependency bounded CPU preflight **before creating jobs, writing uploads or taking a G2 GPU permit**. G1 HTTP tests accepted valid synthetic images and rejected incomplete header-only/CRC corruption; the G2 manual MOCK-only path rejected invalid media without invoking its adapter. G2 worker Python itself was NOT modified. The current source change is distinct from the old immutable G3.25/26/27 CRLF SHA proofs, now reproduced exactly via a pinned historical Git blob normalization helper; no old proof bytes were changed.

This guards format *syntax*, not full codec decoding, native parser exploitation, image polyglots, malicious metadata, filesystem/network confinement or commercial/untrusted upload safety. Pillow 10.1.0/Transformers/Torch pinned vulnerabilities unresolved, Issue #4 OPEN. G1 4177 running process was not restarted (new admission verified on ephemeral test servers only); Office/4178 unchanged. Manufacturing #3 OPEN; all output DRAFT and printQualified=false. [Implementation](G3_28_INTEGRATED_IMAGE_ADMISSION_CPU_2026-10-10.md) and [source-linked new proof](evidence/g3/g3-28-integrated-structural-image-admission.json).

## G3.27: strict bounded structural image preflight is NOT native sandbox or active G2 mitigation

A new zero-dependency Node parser validates PNG CRC/chunk layout, JPEG SOF/SOS/EOI markers and WebP RIFF static VP8 family chunk framing within 8MiB/16MP/16,384-side and bounded visits. On 3 original nonprivate 64x64 PNG/JPEG/WebP images it passes, and rejects 18 synthetic truncations plus corrupted/oversized cases. It never decompresses image data, executes a model or invokes unsafe native parsing, so a syntactically passing input still may fail Pillow decode or exploit an unremediated decoder flaw. **Not wired into server/index.js yet**, leaving historic G1/G2 admission unchanged until separate integration. OS-enforced parser network/file confinement and Pillow patch compatibility remain OPEN in #4, manufacturing in #3. [Details](G3_27_BOUNDED_IMAGE_STRUCTURE_PREFLIGHT_CPU_2026-10-10.md) and [sanitized proof](evidence/g3/g3-27-image-structure-preflight-contract.json).

## G3.26: observed G1 DEMO header acceptance is NOT content validation

The actual G1 fixture-only HTTP source-image admission returns 201 for three deliberately incomplete *harmless* PNG/JPEG/WebP initial signature-only buffers when their declared MIME matches, and 422 for mismatched MIME or an unknown prefix. Separate Pillow 10.1.0 CPU in-memory fixture experiments show that real complete original 64x64 PNG/JPEG/WebP decode correctly while the incomplete harmless bytes fail full decode. This is an observed signature/full-parse mismatch, **not** evidence of a native parser exploit, actual G2 processing, or OS confinement. No untrusted images or GPU model loads were allowed. The gap warrants explicit safe preadmission validity checks and OS-backed native decoder confinement before untrusted customer media, but a validating header alone does not remove parser vulnerabilities.

Immutable sanitized source-linked [G3.26 proof](evidence/g3/g3-26-harmless-image-boundary.json) and [documented methods](G3_26_SAFE_IMAGE_SIGNATURE_BOUNDARY_CPU_2026-10-10.md). Production Pillow/G2 unchanged, Issue #4 OPEN. Physical print Issue #3 OPEN, printQualified=false.

## G3.25: 32 Pillow version-matches have named trigger cases, zero cleared app paths

G3.25 manually reviewed the official public upstream GHSA trigger descriptions for all **16** alias-linked Pillow groups (32 current public OSV records) and statically compared them to current G2 Node 8MiB PNG/JPEG/WebP *short magic* + MIME guard and Python Pillow 16MP Image.open/src.load/EXIF. PDF, fonts, TGA *encoding*, specialized ImageMath/ImageCms/ImageFilter/ImageShow APIs and JPEG2000/McIdas alternate image formats have distinct reported preconditions. "Not directly called" or "top-level format not allowlisted" never demonstrates transitive/native codepath nonreachability, no concealed format/polyglot routes, safe malicious image handling or a working OS sandbox. All 32 record-level impact dispositions **UNRESOLVED**.

The proof is read-only SHA-linked to existing G3.23+G3.24 reports and exact server/worker code and fails closed if source controls weaken. G2 Pillow 10.1.0 remains pinned, prior Pillow 12.3 shadow does not upgrade production, and no version-match means a proven vulnerability in this application. No OS file/network confinement, native parser isolation, unknown-media permission, G2 model/GPU experiments, Office/printer action or security release. Issue #4 OPEN, Issue #3 OPEN. [Method](G3_25_PILLOW_FORMAT_API_TRIAGE_CPU_2026-10-10.md) / [public evidence](evidence/g3/g3-25-pillow-format-review.json).

## G3.24: review queue priority does not imply advisory exploitability or mitigated runtime

G3.24 cross-links 104 current public OSV records (64 alias groups) to prior SHA-verified G3.22 source calls: 16 Pillow direct-image-decoder related groups get highest REVIEW PRIORITY; 29 Transformers DINO ViT config and 19 Torch weights-only/local native tensor groups are next. This is an application workflow ordering, NOT severity, actual exploitability, 64 distinct bugs, remediation, or untrusted user input authorization. All 104 per-advisory trigger conditions remain UNKNOWN until individually verified.

Only three representative official GHSA samples have explicit published CVSS/fix versions, and the named exploit API was NOT directly called in prior narrow audited source; no assertion about transitive internals. In particular, CVSS critical Pillow ImageMath.eval finding is not proof that the project's Image.open parse API exposes THAT specific trigger; real Pillow image parser still receives input bytes and other native decoder bugs are unreviewed.

G2 live packages and DINO/TripoSR CUDA stack unchanged. A documented FUTURE shadow compatibility prereq is not an authorization to install packages, run model inference or alter OS security, firewall/egress or Office. Issue #4 and #3 OPEN, printQualified=false. [Method](G3_24_STATIC_SECURITY_REVIEW_PRIORITY_QUEUE_2026-10-10.md) / [public source SHA queue](evidence/g3/g3-24-security-review-queue.json).

## G3.23: full public OSV identity is not remediation

G3.23 explicitly retrieved PUBLIC PyPI/version-only full advisory ID+alias lists: original old G3.5 report had only 36/104 saved IDs; fresh 2026-10-10 query returned full 104 current records (Pillow 32, transformers 50, torch 22), matching all 36 prior samples. Conservative alias-link grouping yields **64 related cross-reference groups**, NOT 64 distinct physical exploits or unique vulnerabilities. Public affected-range fixed-event metadata does NOT establish the currently locked/GPU-compatible installed packages are fixed, nor does absence of a fixed event prove absence of a fix.

Only public package and version strings went to OSV.dev; query snapshot gitignored, public ID+alias grouping and source SHA proof published with no source code/media/credentials. Offline deterministic later replay does not access the network. G3.22's code-path review showed real Pillow image-decoding input exposure; no real-world unrestricted user-upload safety, package remediation, OS network egress or native image parser confinement has been implemented. Live Pillow 10.1.0, Transformers 4.35.0 and torch 2.5.1+cu121 unchanged. Security Issue #4 OPEN, manufacturing Issue #3 OPEN, no new GPU/Office/printer actions.

## G3.22: OSV historical version matches do NOT prove advisories reachable or fixed

G3.22 offline static source analysis verifies 34 pinned installed Windows Python dist versions, prior G3.5 public OSV proof, G3.6 Pillow shadow proof, pinned clean TSR source. Historical OSV returns 104 version matches (Transformers 50, Pillow 32, Torch 22) but only 36 actual IDs were saved; other 68 are NOT reviewed or individually known. Targeted examples from official advisories include ImageMath.eval, AutoModelForCausalLM.from_pretrained and torch.mkldnn_max_pool2d, which were not directly called in selected audited Python sources; THAT IS NOT A TRANSITIVE exploitability proof and DOES NOT clear those packages.

Real image input passes through Pillow Image.open; prioritize native-code parser risks. Worker source/weights SHA locks, fixed local DINO hub override, offline env literals, weights_only checkpoint wrapper and manual loopback GPU are existing mitigations, NOT OS network/file sandbox. Production still uses vulnerable-version Pillow 10.1.0; the prior Pillow 12.3.0 shadow CPU/import result does not qualify full TripoSR GPU compatibility. No packaged model/source code or dependency upgrade performed in G3.22.

Issue #4 pinned advisories, untrusted parser OS isolation, network egress and user-data retention OPEN. Do not enable untrusted/multi-user/commercial inputs based on static non-use of a named function. Issue #3 physical print/wall/manufacturing OPEN. All models DRAFT and printQualified=false. [Method](G3_22_PYTHON_ADVISORY_STATIC_REACHABILITY_CPU_2026-10-10.md), [public SHA evidence](evidence/g3/g3-22-pinned-python-static-triage.json).

## G3.21: typed operator physical measurements and hash strings cannot self-authorize physical scale

A future local evidence JSON with SHA-looking image/measurement/operator record handles, date, ruler/caliper claimed mm number and source mesh vertex indices is ONLY a structural review candidate. The strict allowlist rejects unrecognized or extra fields, fake approvedForPrinter, mmPerGLBUnit values, invalid model source SHA, PII fields, unverifiable image estimates, invalid/date/future/NaN/degenerate landmarks and symlinked/oversized JSON. Even apparently valid records remain PENDING_INDEPENDENT_HUMAN_CALIBRATION_REVIEW with sourceVerifiedUnits UNKNOWN_UNCALIBRATED, millimetersPerGLBUnit=null, physicalMinimumWallThicknessMm=null and printQualified=false. No code path approves physical mm or fabrication.

The only published G3.21 evidence uses previously sanitized public G3.20 SHA JSON (never private job/image/GLB bytes), verifies model hash ancestry and returns BLOCKED_MISSING_EXTERNAL_REFERENCE for all four old sources, as no independent physical measurement was supplied. Public proof includes SHA256 of the previous public proof bytes and excludes operator names, images, job IDs and coordinates. G3.20 extra private four-source read-only retry remains blocked by execution tool safety and MUST NOT be claimed completed.

Security Issue #4 OSV dependency reachability, OS-enforced native parser isolation and firewall egress remain OPEN. Issue #3 physical minimum-wall and print QA OPEN, 2/9 real AI benchmarks only. No installs, inference/GPU, cloud, printer, Office, 4178, Windows security changes or physical calibration inference.

## G3.20: exporter unit metadata and normal-ray chords cannot authorize production

G3.20 adds a strict physical unit provenance FAIL-CLOSED gate. Untrusted/reported mesh extras.units from a glTF/Trimesh exporter (including "meters" or "millimeters") does NOT authorize converting single-image generated model coordinates to real-world mm; only separately sourced, verified physical measurements plus transforms/landmark correspondence could do so in a future milestone. Current four existing SHA-pinned models all return physicalMillimeterScale=UNKNOWN_UNCALIBRATED, mmPerGLBUnit=null, minimumPhysicalWallThicknessMm=null and printQualified=false. No guessed prices/material tolerances or physical size claims.

A bounded CPU-only float ray screen can sample inward oriented normal **CHORDS** across a solid and triangulation edge lengths in arbitrary GLB coordinate units; neither is actual local wall thickness, tiny printable feature width nor 3D print qualification. Signed volume matters: original historic TripoSR orb has nonpositive signed volume and G3.20 refuses ALL inward ray casts for that file; G3.7 verified positive winding derivative is sampled separately and original SHA untouched. Ambiguous/boundary ray hits and resource cap failures remain INDETERMINATE, not zero thickness or false "pass". Public proof exposes only preexisting model and source image SHAs plus aggregate safe claims/counters; metadata arbitrary private text redacted.

Security Issue #4 pinned Python dependency CVEs, no OS parser isolation and no egress firewall gate remain OPEN. Manufacturing/geometry Issue #3 OPEN, 2/9 genuine G2 AI fixtures only, seven remaining GPU runs need individual explicit permission. All files DRAFT, physicalMmScale UNKNOWN, printQualified=false, no GPU/cloud/printer/Office/4178/Windows security changes.

## G3.19: second independent triangle oracle cannot certify real-world print safety

G3.19 adds a SECOND independent exact two-triangle rational contact implementation, not a second AI model or new dependencies. It checks all previous REAL orb 43,107 no-index AABB pairs (plus every no-index candidate from three other SHA-verified licensed sources) against primary G3.17 classification, with EXACT label agreement and no false negative on positive synthetic crossings. For indexed shared-edge/vertex-only faces, the second oracle was run only on 256 deterministic selected pairs per category per model, not complete duplicate validation of the 60,528/190,860 full indexed-adjacent orb counts. On discordant exact classifications or malformed source, refuse instead of granting clearance.

Exact rational arithmetic is only for GLB coordinates after lossy binary-float export; no CAD source reconstruction, physically calibrated mm, minimum wall/feature size, supports, material stress/slicer/printer data or whole-mesh commercial safety certificate. Private G2 job/source/license SHA and data remain local, public only aggregates and fixed SHAs. All model/runtime resource limits remain; compare <=100k no-index, <=256 each indexed adjacency sample, <=105s CPU per historical source. No GPU AI inference, cloud, model downloads, printer, Office, security policy or 4178 changes.

Issue #3 manufacturing and #4 pinned dependency advisories/untrusted parser OS confinement/egress remain OPEN; every result DRAFT, globalSelfIntersectionFreeCertified=false and printQualified=false.

## G3.18: independent exact-AABB spatial coverage still does not authorize printing

A new bounded CPU sorted-X sweep independently enumerates 3D AABB overlaps with strict exact binary-float-derived endpoint comparisons and conservative outward numeric prefilters; it is not dependent upon earlier KDTree geometry culling. Every real-orb exact no-index AABB candidate matches the G3.17 KDTree numeric pair ID set (in private runtime memory only), and zero missing exact no-index pairs on four licensed old sources. This strengthens **decoded-coordinate spatial broadphase completeness**, not validation of the entire independent triangle narrowphase engine, original ideal unquantized CAD, real physical mm scale, wall thickness, supportability, slicer mechanics or material strength.

Resource limits: 100k vertices, 75k faces, max 30M sorted-X candidates, max 750k exact AABBs, max 300k no-index exact candidates, 105s per source CPU, abs finite GLB coordinates <=1e9. Fail-closed if budget, time, provenance, source rights, SHA, exact membership or immutable evidence differs. Public JSON only preexisting source model/image SHA, flags and aggregate counts, no private UUID, photo binary, indexed triangle IDs or absolute machine paths.

Do NOT assume user-untrusted GLB/image parser or machine OS isolation is safe; no OS firewall/egress restrictions or pinned Python CVE remediation were applied. Security Issue #4 stays OPEN, geometry/print Issue #3 stays OPEN, all outputs DRAFT with globalSelfIntersectionFreeCertified=false and printQualified=false. No model weights, neural inference, GPU, cloud, Office, 4178, printer or operating system security changes.

## G3.17: exact selected no-index face contacts are not a formal global or print clearance

Every zero-index 3D-AABB-overlap candidate from a bounded independent numerical bounding-box-sphere selection receives rational IEEE754-decoded triangle contact classification (including coplanar and boundary) in CPU; ALL real historical orb 43,107 no-index candidates classify EXACT_DISJOINT. Source hashes and G3.14/15/16 prior count lineage/rights were verified. This is NOT a proof that arbitrary floating-based spatial broadphase can never miss candidates at all magnitude/precision extremes, nor is decoded GLB geometry unquantized ideal CAD. The test adds NO physical mm/wall/support/material/slicer/fabrication certainty, and cannot set printQualified=true.

Fail-closed caps: 75k faces, 100k vertices, 2M sphere broadphase candidates, 750k conservative numerical AABB pairs, 300k no-index exact pairs and 120 seconds CPU. Adversarial coplanar area, point-only and positive-line controls verify flagged positives. Public SHA proof contains no private job IDs, GLB binary, original image or indexed face-pair examples. Historical local job/rights are verified in ignored runtime. Untrusted image/GLB parsing has NOT obtained OS-backed confinement or no-network restrictions, and pinned Python OSV advisories remain unresolved Issue #4; geometry/manufacture Issue #3 OPEN. No inference, new dependencies, GPU, cloud, Office, 4178, Windows security, slicer or printer changes.

## G3.16: exact single-index vertex intersection diagnosis still no production/sandbox clearance

The CPU-only all-indexed-vertex-only exact rational contact module detects whether adjacent triangles that share exactly ONE original indexed vertex intersect beyond that point as a noncoplanar/coplanar line segment or a positive-area planar overlap, on decoded IEEE754 coordinates ONLY. It does not certify the whole mesh self-intersection free: G3.14's 43,107 zero-index AABB real-orb pairs were screened with NUMERICAL floating SAT but not exhaustive exact robust predicates; GLB quantization, actual CAD coordinate precision, mm-scale wall thickness and manufactured part fitness remain unproven.

Bounded CPU: 100k vertices/75k triangles/1M incidence candidate pair visits/280k one-vertex-only pairs/90s and coordinates abs <=1e9. Overflow/time/invalid input become explicit INDETERMINATE/rejection, NEVER a 'printQualified' status. Previously authorized source assets and license/G2 output SHA, earlier G3.14 count and G3.15 proof re-verified; only SHA/aggregate counts reach public Git; per-pair indices and private IDs retained in ignored local runtime. No new inference, GPU, model/weights install, cloud, network or printing. TripoSR pinned advisories, untrusted GLB/image parser OS confinement, egress and privacy controls remain UNRESOLVED in Issue #4; geometry/manufacture in Issue #3. No Office, 4178 or Windows security changes.

## G3.15: exact-binary-float shared-edge result is NOT production or print clearance

G3.15 classifies every indexed full shared-edge pair in the prior licensed GLB under exact rational arithmetic on previously decoded IEEE-754 coordinates; its zero positive-area same-side coplanar overlap result is narrow, geometric, and not physical CAD precision or proof that the whole mesh has no collisions. Indexed vertex-only additional intersections, no-index near-coplanar contact, quantization-sensitive features, multiple scene objects, real mm-scale, local wall thickness, supports, material strength and slicer/printer QA remain outside this exact shared-edge sub-gate.

The local offline module enforces max 100k vertices, 75k faces, 120k adjacent pairs and 60s CPU; time/resource issues fail INDETERMINATE. Provenance crosschecks the already verified original generated output, exact-surface winding derivative, original procedural GT and historical chair. Immutable public evidence exposes no local private UUID, raw face indices, photo or user path. It runs no model/GPU, installs no packages, does not call Office/Fabrication Router or printer, and changes no OS security policy. User-untrusted native parser sandbox, egress and pinned Python advisories remain OPEN under Issue #4, manufacturing under Issue #3. printQualified=false for every output.

## G3.14: full conservative AABB candidate coverage is NOT global contact-free proof

G3.14's independent bounded box-sphere CPU broadphase enumerates all AABB-overlapping face-pair CANDIDATES with a finite declared numerical tolerance relative to arbitrary GLB coordinates. This is a useful new count/provenance gate, NOT an exact test that surfaces do not penetrate. It counts indexed edge/vertex adjacency but does NOT classify their extra intersections globally. Non-indexed overlapping AABBs receive floating-point SAT risk screening only, exact G3.13 pair checks are limited to SAT-positive pairs; a numerical SAT negative can miss near-degenerate tiny features. True CAD mm-scale, minimum wall thickness and physical printer qualification remain BLOCKED.

Inputs are capped at 75k faces, 100k vertices, 2M bounding-sphere pairs, 750k AABB pairs, 300k numerical SAT, 64 exact flagged refinements and 45s CPU; resource failure is INDETERMINATE, never a declaration of clearance. Verified GLB SHA/provenance only from PREVIOUSLY approved local inference and licensed GT/chair assets; public JSON contains only aggregate counts and SHAs, not local job IDs, model/face binaries, prompts or customer assets.

This CPU code does not import/execute a neural model, install dependencies, take a GPU lease, change firewall/Defender/OS policy, alter Office, or command printers. Native GLB parser remains trusted-local-only; pinned Python advisory reachability/OS egress and untrusted-input isolation are still open under Issue #4. Quality Issue #3 remains OPEN; all models DRAFT and printQualified=false.

## G3.13: selected exact pair arithmetic is NOT whole-mesh clearance or untrusted-input sandbox

G3.13 only classifies **explicitly passed triangle pairs** using Fraction exact rational representation of prior GLB-decoded IEEE-754 coordinates. It does not implement exhaustive mesh broadphase, robust/global collision exclusion, physical tolerance, multiuser safe parsing, geometry repair, network isolation or manufacturing authorization. Positive strict interior/coplanar overlap results are narrow mathematical facts about supplied triangles; zero findings on a limited chosen pair list cannot rule out any unselected collisions. All 24 deterministically selected shared-indexed-edge adjacent pairs on each of the FOUR previously licensed GLBs yielded UNRESOLVED normal boundary contact; these are not 24 defects.

Inputs are bounded (pair-list <=256, selected mesh <=75k faces/100k vertices, |coordinate|<=1e9 and 15s batch budget) and rejected for invalid geometry, degenerate triangles, complex coordinates, illegal pair references and resource exhaustion. The result retains full DRAFT/no-print flags. Output code never runs a Python model, imports CUDA/Torch, merges vertices or sends files to printers. Sanitized evidence strips private job IDs and raw selected face IDs.

Caveat: exact predicate arithmetic is not an OS security sandbox, and bounded Python GLB parsing remains trusted-local-only. Python supply-chain advisories/OS-backed outbound network constraints remain open under Issue #4. Issue #3's complete global robust geometry, mm scale, walls and physical printer qualification remain blocked.

## G3.12: geometric vertex proximity evidence is NOT collision/print authority

G3.12's bounded CPU cKDTree screening of SHA-pinned existing GLBs compares different-index vertex positions at <=1e-7 of model AABB diagonal. Even a zero result does not rule out face-to-face contacts away from vertices, coplanar edge-overlaps, microscopic collisions, multi-mesh-object interactions or sub-tolerance numerical conditions. UV/material seams can legitimately have duplicate positions; candidates are review signals, not automatic defects. Physical model scale, mm wall thickness, manufacturing capability, printer/slicer/material qualification remain UNKNOWN/BLOCKED.

Denial-of-service bounds: max 100k vertices, 75k faces, 32 local neighbors, 200k pairs and 35s wall time. Incomplete scans fail INDETERMINATE and cannot publish completed-case evidence. Real GLB input must pass bounded topology/sha/source checks; G3.12 is NOT OS-enforced native-parser isolation or arbitrary third-party/untrusted GLB authorization. Private local job UUID, vertex examples and source blobs are excluded from the immutable public SHA evidence.

No CUDA/AI inference, new Python packages, Office services, physical printers, firewall/Defender rules, private images or OS policy were changed. Supply-chain advisories (Issue #4), robust geometric self-intersection and production manufacturing gates (Issue #3) remain open; all outputs DRAFT, approvedForPrinter=false.

## G3.11: zero shared-edge coplanar findings are NOT fabrication authority

CPU-only screening over previously generated real orb and licensed sources now considers shared-indexed-edge, same-side, near-coplanar third-vertex positions. A positive indicator is a **possible** overlapping planar region, not certified penetration. The numerical plane-distance tolerance is relative to unknown arbitrary AABB coordinates and can miss exact/very small/degenerate physical issues. Intentional sharp folded geometry is not automatically a defect. It does NOT make the older G3.8 nonshared pair SAT, G3.9 normal angles or G3.10 vertex-only rays a robust exact global collision library.

All original/derivative geometry and customer media remain local/ignored. The public G3.11 report is sanitized and SHA-pinned and contains no job UUID, private GLB, prompt, checkpoint, local PC path or raw example triangles. No OS sandbox, egress/privacy, pinned Python dependency advisory or multiuser security gap was closed. G3.11 is CPU-only and never authorizes a printer, slicer or Fabrication Router call.

## G3.10: single-indexed-vertex contact screening is not a full self-intersection guard

All earlier real source media and TripoSR model outputs remain under gitignored runtime. G3.10's new shared-one-vertex candidate-ray routine is CPU only. It enumerates pairs of triangles sharing exactly ONE indexed vertex and tests whether their noncoplanar plane intersection contains a positive-length segment beyond the expected shared vertex. **An ordinary valid shared indexed vertex is not considered a defect.** Near-parallel/coplanar and barycentric-boundary cases are intentionally marked UNRESOLVED, not clearance. Huge valence/input/time/pair workloads fail to INDETERMINATE instead of silently truncating and reporting safety.

Even a completed zero-finding run cannot certify missing self-intersections: geometric duplicate vertices with differing indices, edge-connected coplanar folds, tolerance-sensitive/near-zero contacts, actual millimeter units, insufficient walls and material/print conditions remain unverified. These data do NOT authorize printer/slicer/Fabrication Router. Public evidence is SHA-verified, sanitized, and contains no private job ID/model binary/customer media. No OS sandbox, egress, credentials or dependency vulnerabilities were changed or declared resolved by G3.10.

## G3.9: normal-angle statistics cannot authorize print or evade collision guards

Reusable CPU-only adjacent-face-angle inspection on already completed TripoSR and GT GLBs checks only pairs sharing an entire indexed edge. The statistics distinguish flat/high-angular mesh creases but are **not a collision predicate**, signed curvature standard, scale-invariant comparison of differently tessellated meshes or a manufacturing acceptance test. A cube can be valid at 90° creases; this real orb has 0 adjacent-edge normal differences over 90°, yet the vertex-only adjacency/foldover and self-intersection certification gaps remain.

All G3.9 public data are SHA/provenance-checked sanitized JSON, NO private job IDs, raw private GLBs/prompts/image source/customer files or model checkpoints. Model execution/printing/Office/sandbox configuration unchanged. CPU-only run does not lessen prior untrusted-input vulnerabilities, old pinned Python advisory risk or OS egress/multiuser safety limitations.

## G3.8: conservative mesh-risk checks are NOT secure manufacturing certification

Only CPU-only parsing of **already completed, SHA-verified G3 original orb + derivative + original procedural source GT** took place. The nonadjacent-triangle candidate screen uses capped SciPy cKDTree neighborhoods, AABBs and numerical SAT. Its core BLIND SPOT deliberately excludes any pair of triangles sharing a vertex index: sharp self-foldover adjacent faces may escape, as may numerically ill-conditioned contacts. A candidate positive can also represent touching rather than actual penetration. The code therefore sets selfIntersectionFreeCertified=false even if the full **eligible-pair** screen finishes with 0 flagged pairs. Hard resource limits cause INDETERMINATE, never proof of no geometric collision or printer readiness.

The sphere radial diagnostic is an independent normalized shape/roundness research metric using a known project-original test fixture and never evaluates actual structural strength, physical unit dimensions or print material conditions. G3.8 evidence includes only sanitized, SHA-linked counts, ratio and scope-limited model hashes; original customer source/model and local operator/job UUID remain private and gitignored. CPU replay and fake-geometry negative tests use no GPU, no cloud and no printer.

Original Python supply-chain advisory triage, OS network egress sandbox and future untrusted/multiuser hosting security are unchanged and still open. PrintApproved/printQualified always remain false.

## G3.7: orientation derivative evidence is NOT a manufacturing/security pass

The only new G3.7 transformation was a COPY-ONLY, CPU Trimesh winding reversal on a previously generated real 01-orb-alpha TripoSR output. The source remained locally unchanged and SHA-pinned; the derivative is gitignored and strictly separate. An independently implemented audit demands exact vertex coordinates, exact reversed face indices, original vertex colors, opposite normals and volume-sign correction, and marks printQualified=false. All new CPU audit, synthetic negative tests and Chrome SwiftShader preview require no CUDA or internet.

Only SHA-linked, **sanitized** milestone JSON and a screenshot from original project-synthetic reference/model derivatives are committed; no local UUID, prompt, source customer photo, source GLB, derivative GLB, model weights or OS path. The private observed-model coverage 2/9 must not be confused with the immutable historical public scoreboard's 1/9. Local SHA linkage is NOT independent remote hardware attestation.

**Security limits unchanged:** current Python package-version advisories from OSV screening, lack of OS-enforced network isolation and untrusted multi-user input containment, and absent retention/quotas are still open. Geometry limits also remain: positive volume does not detect self-intersections, wall thickness, physical units, supports or mechanical strength. Never use the derivative to bypass human print/slicer safety review or enable Fabrication Router writes.

LOCAL3D is a **trusted single-OS-user, loopback development application**, NOT a remotely secure multi-tenant inference service. Controls here are implementation defenses and are not a penetration-test certification.

## Trust boundaries

G1: local browser → 127.0.0.1 Node API → UUID job folder → deterministic fixture GLB. No AI process.

G2: explicitly started Windows manual local session → browser per-job GPU consent + POST confirmGpu=true → Node API → single GPU permit → Office/GPU live checks → separate hidden Python venv worker → pinned local source+model → image-derived Y-up GLB → artifact SHA/provenance check → Three.js preview. No inference service on LAN/cloud; no printer, firmware or G-code service.

## Baseline defenses

1. SSRF and command injection: no client-specified URLs, webhooks, remote paths, shell commands or generic proxy/download routes. Output access uses allowlisted artifact ID, never a client filesystem path.
2. Traversal and cross-job access: UUID-only records, internal filenames input.png/jpg/webp, output.glb and qa-report.json. No client filename is used for a disk path.
3. Local exposure / DNS rebinding: server binds 127.0.0.1 only; Host allowlisted for local names/IP; mutating browser requests reject mismatched Origin; no CORS headers. Never reverse proxy or bind to LAN without a separate authentication design.
4. Uploaded bytes: JSON <=12 MiB, image <=8 MiB, signature/MIME checked, filename sanitized. G2 Python performs real Pillow image decode, EXIF orientation, >=64px width/height and <=16MP before CUDA. No server-side remote image fetching.
5. UI injection: all prompt/filename strings use DOM textContent; Three.js is installed/served locally. CSP default-src none, scripts self+importmap hash, connect-src self, workers disabled, frames forbidden.
6. Source/license integrity: locked clean Git TripoSR commit; checkpoint/model config/DINO config SHA-verified locally before G2 worker loads weights. Isolated Python 3.11/Torch CUDA 12.1; torch.load(weights_only=True). Model source and weights are never committed to GitHub.
7. Confidentiality: job source images/prompts and internal manifests persist locally and must receive restrictive host OS permissions. No telemetry paid service or cloud model fallback is configured.

## Manual-only GPU controls

- G2 is disabled by default in npm start; no AI subprocess runs. Operator must deliberately start scripts/start-g2-manual.ps1 in a dedicated process/port/data folder; supports Windows only.
- UI requires a fresh consent checkbox on **each** selected TripoSR image job. API requires confirmGpu=true. This is UX/contract confirmation, NOT strong authentication against other local processes with host access.
- Single GPU permit is reserved synchronously before any awaited filesystem writes; second concurrent POST returns 409 and is not queued. This was regression-tested with concurrent requests.
- Before GPU launch, 3 live snapshots must show one recognized GPU, >=10GB available, <=65% utilization and Office Accelerator Ollama /api/ps with no loaded models; missing service fails closed.
- Runtime GPU monitor checks every ~1.5s for <2.5GB free, >8.5GB new VRAM use, Office model conflict, telemetry loss, or 240s timeout. It terminates the entire Windows child process tree. AbortController cancellation enters "cancelling" until worker exit; no premature "cancelled" state or false asset release.
- On process failure/cancel/restart, incomplete output is never exposed as a downloadable artifact. GLB magic, version, size, embedded byte count, source/model SHA, Y_UP coordinate and DRAFT QA are independently checked before model assets are published.
- Output is always printQualified=false, no printer, slicer or Fabrication Router write. Visual mesh preview and "watertight" single-image sample are not manufacturing approval.

## Verified threat/negative tests

- Concurrent GPU race and permit cleanup; POST without consent, text mode rejected, unknown URL/origin/job blocked.
- Process-tree termination with a real, benign Node fake-worker process via AbortController.
- GPU scarcity and Office busy fail closed before subprocess start; over-budget GPU mock triggers worker termination.
- Error paths provide no model/QA asset; restart marks jobs interrupted rather than silently resuming.
- Browser G1 and opt-in G2 mock tests have 0 page errors and no remote URL requests.
- Single real G2 local GPU image → verified GLB and DRAFT report → real Chrome 3D preview on Windows; manual server and worker exited after acceptance.

## Windows TripoSR source-owner trust boundary (October 10 hotfix)

A user-authorized 01-orb-alpha test exposed a mismatch between the SYSTEM-owned pinned TripoSR source checkout and the interactive CHRIS account. Git's `dubious ownership` protection refused `git rev-parse HEAD` at the initial `verify_sources` stage. This is an OS account/checkout trust issue; the actual original model result was a failure, not a benchmark success.

The worker now supplies **only per-Git-process** `-c safe.directory=<canonical exact checkout>`, and only for two fixed read-only metadata commands. It also uses `-c core.fsmonitor=false` to avoid invoking configured external fsmonitor helpers. There is no persistent global config change, no trust wildcard and no unverified arbitrary path from HTTP or user input. The helper refuses other Git operations and verifies the resolved checkout path; unchanged-source SHA and clean working tree plus checkpoint/config/DINO SHA256 checks remain mandatory.

**Tradeoff:** trusting a SYSTEM-owned checkout for these two Git subprocesses is still an explicit local trust exception. It is not a general OS filesystem isolation boundary and does not mean a SYSTEM-level administrator cannot modify that checkout. Do not repurpose this scope for downloading, merging, executing hooks or handling arbitrary user-supplied repos. Interactive CHRIS user-account CPU validation must pass before considering another approved GPU experiment; the previous approval remains spent.

## G3.4 read-only completed-job evaluation and telemetry

POST /v1/jobs/:uuid/benchmark is a deliberate CPU-only write of a **diagnostic JSON artifact**, not a model inference or print operation. It first checks completed real G2 status, model SHA/size, licensed image SHA and catalog integrity. The pinned local Python subprocess uses execFile (no shell), a fixed runtime-only job root and output file, 45-second timeout, offline HF flags and CUDA_VISIBLE_DEVICES=-1. It independently validates the image, model and QA against the manifest and locked TripoSR weights/source; no arbitrary URL, filename or client-provided output path is executed. Concurrent same-job reviews are rejected and a previously verified score is idempotently served.

It does **not** provide an OS process sandbox, OS-level outbound-network denial or multiuser untrusted parsing boundary; Trimesh/SciPy still run with the current logged-in user's permissions. Do not use this on untrusted network uploads or equate source/QA SHA matching with independent hardware attestation.

Optional G2 hostGpuTelemetry comes from 1.5-second NVIDIA-SMI snapshots *while a manually approved worker is running*. The stats include all GPU users (potentially Office) and are not exact peaks or exclusive GPU memory; CUDA allocations in the worker are measured and represented separately. No GPU checks or worker activity are triggered by the benchmark HTTP endpoint. Cross-process cooperative lease and live Office no-conflict gate remain mandatory for new inference.

## G3.3 source-integrity and CPU scoring trust boundary

The new G3 benchmark-source HTTP route only serves one of nine license-attested images from exact fixed repo paths, after SHA256 and PNG magic/size verification. No arbitrary filesystem path, private media, URL, third-party download, POST or GPU job is permitted by this route. The browser adds it to the existing input form without submission, and changing/clearing any selected image explicitly clears stale GPU consent.

The CPU-only manual scorer accepts only a direct UUID subfolder of LOCAL3D's fixed private manual-job storage, completed local TripoSR manifest, catalog-matching source image SHA, manifest-matching GLB/QA bytes, pinned local source/checkpoint SHA and DRAFT-only flags. Outputs go to gitignored private path without prompts, filenames, job IDs or source images. A copied original ground-truth GLB is blocked from masquerading as AI output. No 3D GT means no 3D score.

Local manifests and SHA256 prove internal record consistency, **NOT hardware execution**; no malicious local OS user sandbox or independent attestation is implemented. 3D metrics normalize size/translation and optimize yaw after observing data; they are shape diagnostics only, NOT actual dimensions, printer supportability or a general AI-quality certification. All printApproved fields remain false.

## G3.2 resource and privacy hardening

G2 now uses an additional atomic fixed project-wide runtime/gpu-coordination/triposr-gpu.lock **across distinct LOCAL3D Node servers**. Per-process atomic reservation remains. A second server receives 409 without creating a GPU job. Owner-specific release occurs after runner process exit, and an unclear/crashed lock is NEVER auto-stolen: a dead parent may leave a child worker alive. Read-only GPU lease diagnostic: npm run audit:g3:gpu-lock. This is cooperative LOCAL3D-only locking, NOT Windows GPU isolation or an Office scheduler.

The nine-fixture public benchmark report is a fixed SHA-verified licensed snapshot, read-only via GET /v1/benchmarks/g3. It contains no prompts/job IDs/client paths. Optional private local-job scans validate fixed artifact hashes and never export filenames, prompts, paths or job UUIDs; they are still NOT cryptographic hardware attestations; new local snapshots use SHA-suffixed filenames to avoid overwriting earlier audit evidence. Any unknown data is excluded.

Storage auditing (npm run audit:g3:storage) reads only aggregate metadata and writes its sanitized report into gitignored runtime/qa. It does NOT enforce quotas, delete private media or create backups. OS file permissions, process isolation, retention consent/policy, SBOM/CVE audit and sandboxing remain open.

## G3 CPU geometry reviewer boundary

An explicitly requested POST /v1/jobs/:uuid/review is allowed ONLY on completed real TripoSR GLB with manifest-matching bytes/SHA, under the already opt-in Windows session. It executes a fixed, installed Python script via execFile (no shell or client path) with a bounded 35-second timeout and 64MiB GLB size cap, and validates the output schema/sha/qualification. A second review for the same job returns 409 instead of spawning a duplicate process. No new PyTorch/CUDA import, printer, remote fetch, or GPU lease is part of G3 scanning. A new geometry-qa asset appears only after independent provenance checks and a persisted manifest update. The browser shows signed-volume/closed-shell results but keeps printQualified=false.

G3 is NOT OS-level untrusted-input sandboxing. The native Trimesh parser still processes GLB bytes in a Python subprocess under the current OS user; arbitrary third-party/multi-user GLB uploads are not supported. Physical self-intersections and wall thickness remain unmeasured. This is a single-user localhost engineering system, not a trusted multi-tenant geometry service.

## Known limits and required hardening before productization

- Single trusted user: there is no per-OS-user authentication, CSRF token or HTTP origin proof for command-line requests; any malicious local process with access to localhost may forge confirmation. Do not expose beyond localhost or run with untrusted local tenants.
- The default Windows OS account's filesystem permissions protect job folders; no fully isolated Windows Sandbox/VM is used. Python libraries process complex media and model code, so dependency review, CVEs, sandboxing, cleanup and disk quotas remain relevant.
- GPU free-memory telemetry and Ollama status are not an exclusive reservation against all other local applications. Monitor frequency is best-effort, not hardware-level preemption.
- HF_HUB_OFFLINE and local pinned model interception stop known model fetch paths, but do not prove outbound network isolation against malicious code. No firewall change performed.
- No per-user quotas, global job retention cleanup, audit log authentication or crash-safe cross-process GPU semaphore across multiple manually launched servers. The manual G2 script uses a dedicated port/data folder, but **do not start multiple G2 manual instances simultaneously**.
- No formal independent penetration test, signed installers or secure auto-update, and no geometry/manufacturing certification. No business/customer production claims yet.

Next gate: separate user authorization and hardening for multi-user use, broad content, true CAD/manufacturing output or unattended scheduling. Keep Office 2.0 P0 independent.

## G3.5 resource admission and dependency risk — 2026-10-10

Before creating a manually confirmed real G2 job, server/storage-admission.js performs a **read-only and fail-closed** trust/size/statfs audit. The 8GiB stored-data cap, 128MiB prospective job allowance, 3GiB remaining free floor and 400-folder limit are conservative development settings, not a backup or enterprise retention policy. Unexpected symlinks/files, unknown manifests and telemetry errors reject the new GPU job (503/507), without deletion, CPU model execution or altering the working GPU lease. Another process can still change storage after admission; no OS disk quota is installed.

A new process-local permit serializes G3 topology vs source-shape reviews across different completed jobs. It never queues CPU tasks and releases on failure, but multiple separate LOCAL3D servers still have no cross-process CPU semaphore or OS job object.

**Supply-chain gate remains OPEN:** npm audit (production+dev) found 0 advisories in the pinned Node packages on 2026-10-10, but public OSV batch matching of 34 pinned PyPI versions returned 104 advisory IDs across transformers 4.35.0 (50), Pillow 10.1.0 (32), PyTorch 2.5.1+cu121 (22). These are *untriaged package/version advisory matches*, not 104 confirmed exploitable application paths. Selected OSV records include high/critical code-execution advisories, but exact reachable entry points and safe patched compatibility have not been established. Do not claim LOCAL3D is safe for untrusted public image uploads or production multi-tenancy.

For now the G2 manual session is for trusted local images only; arbitrary untrusted images must not be treated as vetted. Upgrade candidates must be tested in a NEW isolated environment with pinned clean-room provenance and functionality regressions, not installed silently in the working engine. No OS network sandbox, antivirus exception, firewall change, new model weights, GPU run or printer release was performed during this phase.

Detailed proof and remediation gate: G3_5_RESOURCE_SECURITY_2026-10-10.md.

## G3.6 CPU-only Pillow patched-shadow investigation

A candidate Pillow 12.3.0 (OSV version-level matches 0 on 2026-10-10) was installed only in a **gitignored target overlay**, without changing the live Python venv's Pillow 10.1.0. The official CPython3.11 Windows wheel SHA256 was checked byte-for-byte. With process-local PYTHONPATH and CUDA_VISIBLE_DEVICES=-1, all nine pinned input source images passed the real worker preprocessing function; four RGBA/EXIF/WebP/corruption checks and 23 Python unit tests passed. Importing the pinned TripoSR/Transformers/Torch symbols also succeeded, without loading a model/checkpoint or allocating CUDA.

This is **not** an OS-isolated sandbox, proof that all vulnerabilities are gone, nor proof that the real CUDA model generates valid outputs with Pillow 12.3.0. Public OSV findings for pinned Transformers and Torch remain unresolved. The existing manual G2 engine is STILL on the older version; only trusted local source images should be used until actual advisory codepath triage, security hardening and explicit compatibility qualification are complete. No firewall/antivirus/UAC or OS permissions were changed in this milestone.

See G3_6_PILLOW_SHADOW_2026-10-10.md and GitHub Issue #4.
