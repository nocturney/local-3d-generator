# Evidence, golden fixtures, acceptance gates, benchmark plan

## G3.46 — ACTUAL G2 worker result file-handle integrity, native Windows CPU tests

- Functional G2 adapter fix (G1 server source unchanged): freeze accepted input SHA before worker, recheck before/after; verify `model.glb`, `qa-report.json` and input only via allowlisted single handle, lstat/fstat identity and bounded bytes, deny hardlinks, junctioned parent and swaps. G3.45 original preworker storage path admission remains intact.
- PASS Chris 24/24 Windows native owned synthetic tests: 9 standalone file readback/hardlink/Junction/deterministic-swap, 9 real G2 adapter with Node test worker and injected GPU/Office stubs, 6 earlier G2 worker mock tests. Complete regression 283/283 Node, 269/269 pinned Python CPU, 16/16 Chrome. [G3.46 runbook](G3_46_REAL_G2_FILEHANDLE_ARTIFACT_READBACK_CPU_2026-10-11.md) and [immutable SHA evidence](evidence/g3/g3-46-actual-g2-result-file-handle-integrity-cpu.json) link frozen G3.45 native + HTTP reports without mutating them.
- STILL BLOCKED: Windows native race-free OS containment, Pillow parser guest isolation/egress, full untrusted media approval, real GPU/QA print qualification, independently encrypted off-host recovery and G1 unattended Windows boot. Security #4, startup #5 and manufacturing #3 remain OPEN.

## G3.45 — ACTUAL Windows G2 runtime storage safety improvements, no GPU or printing

- PASS 9/9 native Windows synthetic G2 filesystem tests on Chris with zero skips, **and 2/2 ephemeral real HTTP G2 integration tests** with actual 503 before GPU lease or Python. Full QA 265/265 Node, 269/269 pinned CPU Python and 16/16 Chrome. Two immutable SHA-linked evidence files: [native Windows](evidence/g3/g3-45-g2-storage-junction-hardlink-native-cpu.json) and [HTTP before GPU](evidence/g3/g3-45-g2-http-storage-denial-before-gpu.json). All test paths are disposable owned QA. A linked PARENT folder, a direct jobs-directory link, a hard-linked `job.json`, hard-linked GLB and engine-output file are rejected. Ordinary-owned job folders and ordinary model outputs still account correctly. Original G3.5 admission/audit tests pass. G2 actual production job store parent checked with read-only ancestor metadata only, no media read.
- `server/storage-admission.js` and `server/storage-audit.js` hardened with [G3.45 guard](../server/g345-storage-path-integrity.js); [QA method](G3_45_REAL_G2_STORAGE_NATIVE_JUNCTION_HARDLINK_HARDENING_2026-10-11.md) / [immutable SHA proof](evidence/g3/g3-45-g2-storage-junction-hardlink-native-cpu.json) link G3.43/G3.44, no prior proof mutation. Filesystem violations remain G3_STORAGE_UNVERIFIED before GPU lease or Python worker, not silently repaired.
- STILL NOT PROVEN: race-free Windows file handle confinement, real native decoder sandbox/egress, untrusted customer image approval, off-host encrypted backup, G1 startup or physical print. Security #4, operations #5 and manufacturing #3 OPEN. All GLBs DRAFT.

## G3.44 — ACTUAL Windows G1 unattended-startup host inventory, principal rights remain BLOCKED

- PASS actual scoped read-only Windows Chris survey across **372 TaskScheduler tasks**, **344 Win32_Service** records and **29 startup commands**; zero explicitly matched LOCAL3D task/action/service/startup signatures. Node24 SHA computed, Node directory on Machine PATH, original G1 source SHA unchanged, ACL metadata for project/data/jobs/audit readable only for the *probe account* and no direct reparse points. G1/4177 DOWN, Office/4178 loopback active and untouched, manual G2/4179 DOWN. No task installed or service activated.
- PASS ten adversarial CPU tests reject imaginary service principal rights, noninteractive boot, Task registration, non-loopback Office or G1 collision, node tampering, task-action ambiguity and source ancestry changes. Full Chris QA PASS: 254/254 Node, 262/262 G3 Python quality + 7/7 G2 offline Python, 8/8 G1 Chrome and 8/8 G2/G3 MOCK Chrome. [Real host method](G3_44_REAL_UNATTENDED_G1_READONLY_ACCOUNT_GATES_2026-10-11.md), [immutable public proof](evidence/g3/g3-44-actual-readonly-unattended-g1-account-not-proven.json).
- BLOCKED: no operator-approved least-privilege Windows principal, no real noninteractive logon/effective ACL or after-reboot fixture G1 health/422/stop/rollback test, no authorized Task deployment. G3.39 draft stays disabled and noninstallable. No security/native-parser/print release. Issue #5 and #4/#3 remain OPEN.

## G3.43 — actual read-only host backup-target audit, fails closed on missing encryption/off-host replication

- PASS Windows Chris factual storage observation: private G3.41 backup folder + manifest present, original manifest SHA matches the frozen G3.42 source. C: is a physically different NVMe disk than D: with enough free capacity; both BitLocker protection OFF. No connected SMB/USB backup target was found in the limited scope. No bytes copied or public private-file listing.
- PASS eight strict Node negative controls for forged transfer, encryption/approval, contradictory disk identity, unknown inventory, tampered parent G3.42/G3.39, G1/Office/GPU scope and immutable privacy-linked SHA evidence. Full QA on Chris: 244/244 Node, 262/262 G3 quality + 7/7 G2 Python offline, 8/8 G1 browser + 8/8 G2/G3 mock browser. [Detailed runbook](G3_43_ENCRYPTED_OFFHOST_BACKUP_PREFLIGHT_CPU_2026-10-11.md) and [sanitized public proof](evidence/g3/g3-43-independent-encrypted-backup-readiness-not-replicated.json).
- BLOCKED: no operator-authorized encrypted OFF-HOST backup, independently verified destination SHA/restore, base OS/Python/CUDA/weights recovery, persistent G1 service, native decoder OS confinement or physical print qualification. Security #4, G1 #5, printer #3 OPEN. All GLBs DRAFT.

## G3.42 — actually RESTORED entire 34-package private backup to distinct disposable same-machine venv

- PASS SHA for EVERY one of original backup's 27,966 files / 5,086,619,721 bytes, a second independent restored venv with all restored file SHA matches, 34/34 pinned cloned versions + Pillow10.1 native trusted PNG/JPEG/WebP CPU decodes. Independently PASS full 262 G3 quality and 7 G2 offline tests from new restored interpreter; post-test every file SHA checked again and disposable restore removed. Production/source backup not changed.
- Remaining limits: entire OS/C:\Python311 base, GPU/driver, TripoSR model weights, off-host recovery still UNTESTED. This restores Python venv package files on same authorized Chris Windows, not approved Pillow12.3/real CUDA/unsafe customer uploads/printer. [Runbook](G3_42_REAL_FULL_VENV_RESTORE_269_CPU_2026-10-11.md), [source evidence](evidence/g3/g3-42-full-venv-same-host-real-offline-restore.json). Security #4, G1 boot #5, print #3 OPEN.

## G3.41 — FULL original 34-package Python venv copied to private SHA-audited local backup

- PASS actual source-to-backup content comparison of **27,966/27,966 regular files, 5,086,619,721 bytes**, in gitignored local QA. Private SHA manifest covers all files; real copied Python3.11 executable and importlib.metadata/Pillow imports proved **34/34** pinned distributions load from snapshot; 3/3 original tiny PNG/JPEG/WebP RGB decodes successful.
- Not proven: independent transfer to other PC, full OS/driver/CUDA compatibility, separate Python3.11 base installation, model weights or customers' data, actual separate restore from backup into new path (next milestone), physical calibrated printer output, native-decoder Sandbox guest security. No production package writes, G2 or Office changes. [G3.41 method](G3_41_REAL_PRIVATE_FULL_VENV_SNAPSHOT_CPU_2026-10-11.md), [public SHA evidence](evidence/g3/g3-41-real-private-full-python-venv-snapshot-cpu-readback.json). Issues #4/#5/#3 remain OPEN.

## G3.40 — real official Pillow10.1 offline wheel and isolated native-package rollback

- PASS original, official, Windows Python3.11 x64 Pillow10.1 wheel acquired into ignored/private QA. PyPI-published exact SHA256 0f7c276c05a9767e877a0b4c5050c8bee6a6d960d7f0c11ebda6b99746068c2a and wheel size 2609067 bytes verified twice; no production installation. Read-only pip cache had 2513 response body files, none contained this wheel.
- PASS **actual native Pillow binary install offline into a disposable CLEAN venv target**: 10.1 -> 12.3 -> RESTORED10.1 from the new wheel, all 3 original 64x64 PNG/JPEG/WebP media pixel RGB SHA identical across all 3 stages. Original production 10.1 version and source SHA re-verified unchanged.
- NOT TESTED: complete 34-package TripoSR env restore, licensed GPU model/Torch+Transformers compatibility, OS-native image decoder isolation, 7 further separately approved benchmark model runs, physically verified print geometry. [Full method](G3_40_OFFICIAL_PILLOW_WHEEL_REAL_OFFLINE_ISOLATED_ROLLBACK_2026-10-11.md), [public SHA proof](evidence/g3/g3-40-verified-official-wheel-and-real-isolated-rollback.json). Issues #4/#5/#3 OPEN.

## G3.39 — actual read-only G1 boot context; disabled noninstallable candidate

- PASS read-only Chris Windows observation: Node v24.19.0, original G3.28 G1 server SHA, no 4177/4179 listener, one localhost Office/4178 listener, root and G1 persistent-data ACL readable. Scans of TaskScheduler action+name, named Windows services, startup commands completed and found zero explicitly named LOCAL3D matches (generic launchers NOT excluded).
- BLOCKED: operator-selected least-privileged principal and **runtime permissions for that principal** not established, real Task Scheduler noninteractive logon/boot persistence untested. Candidate JSON is DISABLED, UNREGISTERED and NOT TASK XML, so cannot be installed as-is. G1/4177 STILL DOWN. No OS security settings or Office/4178 changes.
- Proof binds frozen host observation to G3.28 server, G3.36 temporary fixture G1, G3.38 pinned Python baseline and strict boot contract. [Method](G3_39_G1_BOOT_STARTUP_DISABLED_REVIEW_2026-10-11.md), [public report](evidence/g3/g3-39-disabled-g1-boot-review-no-task-installed.json). Operational #5, security #4, print #3 OPEN.

## G3.38 — Python 34/34 baseline vs real rollback availability

- PASS read-only installed package inventory 34/34 matches pinned requirements and exact SHA on Chris. Existing isolated Pillow12.3.0 candidate wheel checksum verified. No actual production Python site-packages write, pip network/install/uninstall or GPU.
- PASS **synthetic-only manifest control**: simulated version change and tamper detection both restored baseline text manifest SHA in a fresh temporary QA directory. This does NOT back up or restore any actual Python modules or native DLLs.
- OPEN: no verified offline Pillow10.1.0 rollback wheel in the one existing checked local wheel store (other stores/machine/pip cache not inventoried); no complete wheelhouse, full venv clone restore rehearsal, permission to change production, Torch/Transformers CUDA compatibility or OS native decode sandbox attestation. Decision BLOCKED_SCOPE_LIMITED_READONLY_PREPARATION. Security #4, G1 #5, physical print #3 OPEN. [Runbook](G3_38_PYTHON_ROLLBACK_PREFLIGHT_CPU_2026-10-11.md), [SHA proof](evidence/g3/g3-38-python-upgrade-readiness-and-synthetic-rollback.json).

## G3.37 — Pillow12.3 shadow CPU quality partition, NOT full historical-suite pass

- The **UNFILTERED** 12.3 shadow Python suite failed with 5 errors caused by exact Pillow10.1 production metadata and pinned old fixture generation: G3.22 class setup (16 test methods excluded from execution), 3 G3.26 methods and 1 G3.30 method. Do not relabel this as a 262/262 shadow success.
- The dedicated safe shadow QA runner discovers all 262 quality methods, explicitly excludes exactly the 20 old-version-specific methods, verifies actual isolated Pillow12.3 wheel/version/PYTHONPATH, offline dependency mode and disabled CUDA, and passes **242/242 remaining tests**. Production Pillow10.1 full QA suite was verified separately in G3.36 (262/262 quality). No historical tests/source evidence altered.
- New immutable evidence links G3.36/G3.35 and original historical test source SHAs, plus the curated run result; outcome remains Pillow production gate BLOCKED_SHADOW_ONLY, Security #4 OPEN, G1 #5 OPEN, Print #3 OPEN. [Method](G3_37_PILLOW_SHADOW_QUALITY_CLASSIFICATION_CPU_2026-10-11.md) / [proof](evidence/g3/g3-37-shadow-pillow-historical-test-isolation.json).

## G3.36 — G1 recovery readiness proven on temporary fixture-only loopback, persistent 4177 STILL OFF

- PASS: Real fresh G1 from production source with isolated temporary fixture+data, bound to test 127.0.0.1 only on a safe ephemeral reserved test range (not 4177/4178/4179). G1 health inference=false, printing=false, G2 staged disabled. 9/9 deliberately truncated original PNG/JPEG/WebP HTTP422 BAD_IMAGE_STRUCTURE before any jobs. 3/3 complete original SHA-pinned formats HTTP201 simulation-only.
- PROVEN LIMIT: historical direct lightweight TCP probe on localhost4177 showed NOT_LISTENING. G1 fixture-only ephemeral pass does NOT prove the actual 4177 service has been restored, nor provide Windows autostart. Exactly 0 model/GPU, no Office port4178 contact, no OS policy/Task Scheduler/service changes.
- Source proof links actual server/index.js SHA to original G3.28 admission, test+parser+original G3.27 fixture source, prior G3.35 report and safe frozen observation. [G3.36 method](G3_36_G1_EPHEMERAL_RECOVERY_READINESS_CPU_2026-10-11.md), [public proof](evidence/g3/g3-36-g1-ephemeral-recovery-readiness-not-live-activation.json). Issues #5, #4, #3 remain OPEN.

## G3.35 — Pillow 10.1/12.3 compatibility matrix and explicit production upgrade block

- PASS CPU evidence: 12 earlier G3.33 source/licensed original image cases + 4 G3.34 original safe alpha/EXIF/malformed cases = 16 distinct identified inputs. 15 accepted cases match raw RGB byte SHA, dimensions and expected format lanes; 1 short corrupt PNG is rejected by both versions with same error type. Source/input/pinned worker/private receipt SHA ancestry and rights are checked.
- DECISION: `BLOCKED_SHADOW_ONLY` despite CPU PASS. **No real G2 CUDA full-model regression under Pillow12.3, no authorized production Python change/rollback, no native parser guest OS confinement, no effective guest egress/host-share attestation, no advisory/Stack compatibility remediation, no customer upload permission, and no physically measured 3D print qualification.**
- Replay: `npm run audit:g3:pillow-upgrade`; evidence [G3.35 matrix](evidence/g3/g3-35-pillow-cpu-compatibility-and-upgrade-blockers.json), method [G3.35 QA](G3_35_PILLOW_CPU_COMPATIBILITY_AND_UPGRADE_GATES_2026-10-11.md). Issues #4/#3/#5 remain OPEN.

## G3.34 — CPU-only safe EXIF/alpha/corrupt sample parity

- PASS: 4 pre-existing original, SHA-pinned harmless G3.6 samples decoded/handled under Pillow10.1 and existing shadow12.3; 3 valid sources match exact RGB pixel hashes, dimensions and alpha/orientation handling, 1 invalid tiny PNG rejected with same Pillow error class in both.
- PASS: immutable public SHA report verifies previous G3.33 proof, historical original G3.6 generator source, G2 worker source and ignored private lane receipts. No raw image payloads, customer paths or GPU.
- OPEN: native parser sandbox, hostile-image testing and security fixes, full GPU model stack compatibility and production shadow upgrade approval; Issue #4 OPEN. Fabrication release #3 OPEN. [Method](G3_34_PILLOW_SAFE_EDGE_CASES_CPU_2026-10-11.md), [proof](evidence/g3/g3-34-pillow-edge-cases-cpu-parity.json).

## G3.33 — Pillow12.3.0 shadow CPU image-processing parity, NOT G2 GPU safety

- PASS: Two CPU-only process-local pinned Pillow lanes (production10.1 and separate shadow12.3) preprocessed nine rights-checked G3 source images plus three original previously pinned synthetic images, with source SHA verification. For all 12 inputs, raw RGB output byte SHA, dimensions and alpha processing flags exactly agree. Existing 7 G2 offline Python unit tests pass with the shadow overlay.
- PASS: Immutable public G3.33 SHA proof verifies prior G3.32 public parent, source manifest and synthetic inputs, production Python worker, privately stored lane receipt hashes, rights and no new GPU/OS/customer uploads.
- OPEN: 12 known-good images and seven CPU unit tests are NOT full CUDA/weights/Transformers compatibility, safe untrusted native decoder execution, dependency remediation or production upgrade approval. Security Issue #4 OPEN; physical geometry/min-wall/slicer/print Issue #3 OPEN. [Method](G3_33_PILLOW_12_3_SHADOW_CPU_COMPARISON_2026-10-11.md), [source-linked public proof](evidence/g3/g3-33-pillow-12-3-shadow-cpu-compatibility.json).

## G3.32 — offline Sandbox XML candidate verification

A new candidate file uses Microsoft's documented VGpu tag spelling; all other values match the historical G3.29 candidate. The trusted file passed read-only .NET XML parsing and strict Node tests. This demonstrates document structure only, not OS-enforced isolation. No guest, store installation, model inference or printing was performed. Security Issue #4 and manufacturing Issue #3 remain OPEN. [Method](G3_32_CANONICAL_WSB_XML_CPU_2026-10-11.md); [immutable report](evidence/g3/g3-32-canonical-wsb-xml-static-review.json).

## G3.31 — Windows Sandbox launcher availability NOT proven (no guest runtime)

- Chris Windows 11 Pro build 26300, remote Session 0: Sandbox optional feature Enabled, VMP Enabled, HypervisorPresent true; Hyper-V Hypervisor *optional feature* separately Disabled (do not conflate with HypervisorPresent). Microsoft's documented new CLI `wsb`, legacy WindowsSandbox.exe, aliases and registered Store AppX/StartApps/SystemApps all not found in this probe context. All AppX lookup statuses OK; counts zero. This is **not** proof about interactive logged-in user.
- FAIL-CLOSED launch contract: NOT_FOUND_IN_CURRENT_READ_ONLY_PROBE_SCOPE; no native decoder/guest OS attestation, no customer media or GPU/print clearance even if a CLI or AppX becomes visible. Source code explicitly does not run start/list/exec/share or change OS.
- Public SHA evidence linked to unchanged G3.29/G3.30 history, strict host observation record, current production worker/server SHA. Separate follow-up interactive-session discovery and approved synthetic-only guest attestation needed; Issue #4 and #3 OPEN. [Details](G3_31_WINDOWS_SANDBOX_CLIENT_DISCOVERY_CPU_2026-10-11.md) / [immutable evidence](evidence/g3/g3-31-windows-sandbox-launch-discovery-only.json).

## G3.30 — data envelope / simulated host-only receipt, NOT a guest security attestation

- PASS: Exactly 3 SHA-pinned original 64x64 generated PNG/JPEG/WebP source bytes accepted; host pinned Pillow 10.1.0 trusted-only converted them to RGB PNG, exact output SHA/format/mode/dimensions tested. Unknown, altered, mislabeled and truncated original bytes rejected. Output limit 64KiB.
- PASS: Immutable candidate ingress and receipt reject unknown keys, tampering, guest execution claims, false egress/host-file/OS sandbox attestation, fake G2 release and path metadata. Public proof linked to immutable G3.29 source & policy, locked worker + unchanged G1/G2 runtime. No guest ran, no network/host boundary was verified, no customer images consumed.
- OPEN: Actual separate OS VM launch/teardown, isolated decoder and preflight, validated one-way transport, cryptographic guest receipt/signing, OS network/host filesystem egress proof, patched native decoder, production G2 host Pillow confinement, untrusted upload permission. Issue #4 security OPEN; issue #3 print qualification OPEN.
- [Method](G3_30_TRUSTED_SYNTHETIC_EXCHANGE_CPU_2026-10-10.md), [strict public evidence](evidence/g3/g3-30-trusted-only-offline-exchange-not-sandbox.json).

## G3.29 — host Windows Sandbox feature observed; OS confinement still UNVERIFIED

- Read-only CIM/Windows Optional Feature/command discovery on Chris: Sandbox feature Enabled, HypervisorPresent=true, no resolved CLI launcher; actual guest never launched or tested. Never conflate an installed feature with verified egress, filesystem or native decoder sandbox.
- Candidate .wsb has explicit Networking/virtual GPU/clipboard/audio/video/printer Disable, ProtectedClient Enable, NO MappedFolders, NO LogonCommand. Static exact-byte allowlisting fails closed if changed. Code readiness decision always BLOCKED_NO_RUNTIME_OS_ATTESTATION even when capability flags look good.
- OPEN: actual guest launch/teardown & effective isolation test, safe one-way data channel for approved synthetic input, isolated native image decoder/patched package compatibility and independent G2 host GPU worker gate. No customer images, no GPU. Issue #4 OPEN; Issue #3 print OPEN.
- [G3.29 method and policy](G3_29_WINDOWS_SANDBOX_READINESS_CPU_2026-10-10.md) / [sanitized immutable public readiness evidence](evidence/g3/g3-29-windows-sandbox-readiness-not-attestation.json).

## G3.28 — live API source now rejects structurally incomplete image containers (not native safety)

- PASS: integrated Node server image handler invokes G3.27 structural validator after initial magic/MIME/size check and BEFORE generating a job ID, persisting bytes or taking shared GPU/storage leases; all three trusted synthetic PNG/JPEG/WebP full images accepted by new G1 test server, truncated/malformed rejected HTTP 422 BAD_IMAGE_STRUCTURE, MIME mismatch rejected BAD_IMAGE, G2 MOCK manual rejects before worker invocation and requires consent.
- PASS: G3.25/26/27 historical read-only SHA immutable proof replays pass from pinned old Git source commit with explicit CRLF normalization; no rewriting historical evidence. New G3.28 proof SHA binds actual current server source and old proof bytes; tests/code/rights/privacy verified.
- NOT YET LIVE on preexisting G1 4177 process (no restart). No native Pillow decoder sandbox, no full-image bitstream acceptance guarantee, no patched G2 GPU stack, no multi-user/untrusted upload clearance. Security Issue #4 OPEN; geometry/physical mm/wall/material/printer Issue #3 OPEN. G2 manual worker no inference ran.
- [Method, QA and limitations](G3_28_INTEGRATED_IMAGE_ADMISSION_CPU_2026-10-10.md), [source-linked public proof](evidence/g3/g3-28-integrated-structural-image-admission.json).

## G3.27 — bounded PNG/JPEG/WebP input syntax only, NOT in live request path

- PASS: pure Node preflight module covers PNG CRC/container, JPEG SOF/SOS/EOI, WebP RIFF/VP8 static framing, declared MIME mismatch, max 8 MiB/16 MP/16,384 side and bounded chunk/marker visits. Three generated source SHA-locked images pass; 18 truncated copies fail; negative malformed media tests pass. No Pillow/native image parsing or GPU.
- PASS immutable sanitized SHA proof linked to unchanged G3.26 report, G3.25/26 Node server+worker bytes, new module and synthetic fixtures. Explicit expected current G1 API still accepts short signatures; preflight not integrated yet.
- OPEN integration to actual G1/manual G2 job admission, safe handling of historic invalid demo tiny PNG fixtures and immutable historical proof replay after any source changes; sandbox/egress/patch/real native parsing Issue #4 OPEN. Print manufacturing Issue #3 OPEN, all GLBs DRAFT.
- [Method](G3_27_BOUNDED_IMAGE_STRUCTURE_PREFLIGHT_CPU_2026-10-10.md), [SHA proof](evidence/g3/g3-27-image-structure-preflight-contract.json).

## G3.26 — short HTTP file signatures are NOT full Pillow validity

- PASS CPU-only actual G1 demo API test: 3 harmless incomplete PNG/JPEG/WebP signature-only buffers admitted HTTP 201 on matching MIME; 3 wrong MIME and one unknown signature rejected HTTP 422. All jobs G1 fixture simulated, never TripoSR/GPU.
- PASS pinned Pillow 10.1.0 CPU in-memory three 64x64 self-generated encoded safe images decode PNG/JPEG/WebP correctly; incomplete header-only fragments do NOT decode. Public SHA proof bound to prior G3.25 evidence and exact tracked Node/Python code bytes.
- OPEN: full-content preadmission validation and OS-backed parser confinement, transitive/native applicability of 32 Pillow advisory version matches, runtime upgrade plans (Issue #4); physical mm/wall/material/slicer/print qualification (Issue #3). NO authorization for unsafe customer uploads or printing.
- [Experiment and limits](G3_26_SAFE_IMAGE_SIGNATURE_BOUNDARY_CPU_2026-10-10.md), [immutable sanitized evidence](evidence/g3/g3-26-harmless-image-boundary.json).

## G3.25 — individual Pillow source/format conditions are REVIEWED, not CLEARED

- PASS: 16 official upstream GHSA named-condition summaries cover exactly 32 public Pillow OSV GHSA/PYSEC version records, anchored to bytewise SHA of historical G3.23+G3.24 public reports and current Node/Python entrypoint code. Includes two alternate **non-allowlisted** top-level image codecs (McIdas AREA, JPEG2000) and specialized image editing, CMS, fonts, PDF, viewer, filter and encoder API triggers; no claim that a format signature gate is OS security containment.
- PASS: G3.25 sanitized immutable replay and adversarial guard tests reject missing/forged records, changed upload MIME byte limits or Python decode controls, and false security release statuses.
- OPEN: all 32 individual runtime/transitive/native applicability and exploitation assessments, production Pillow 10.1.0 remediation, OS parser/file/egress sandbox, untrusted input policy, frozen Torch/Transformers review. Security Issue #4 OPEN, manufacturing #3 OPEN, no GPU/printer authorization.
- [Method](G3_25_PILLOW_FORMAT_API_TRIAGE_CPU_2026-10-10.md), [source-linked proof](evidence/g3/g3-25-pillow-format-review.json).

## G3.24 — security-review triage order, NOT fixed-vulnerability acceptance

- PASS deterministic offline public source G3.22+G3.23 SHA-linked 104-record / 64-group review coverage; every public record accounted for exactly once, all 64 alias groups assigned conservative source-input review priority. Pillow real parser = 16 review-first groups, Transformers pinned config = 29 groups, Torch pinned tensor/checkpoint = 19 groups, all per-advisory app exploitability UNKNOWN.
- PASS THREE verified official GHSA sample fix/severity examples and explicit lack of directly observed named trigger API, still NOT transitive/OS vulnerability clearance or 104 per-record trigger audits. Strict tests reject tampered group IDs, source guard claims and any false safety/print status.
- OPEN Issue #4: individual GHSA/CVE affected preconditions, native image parser isolation, egress, pinned dependency remediations + Windows CUDA compatibility. G3.6 Pillow 12.3 shadow is not production upgrade. All DRAFT, Issue #3 print geometry OPEN, zero GPU/printer actions.
- [G3.24 method and gated upgrade plan](G3_24_STATIC_SECURITY_REVIEW_PRIORITY_QUEUE_2026-10-10.md), [public sanitized queue and SHA proof](evidence/g3/g3-24-security-review-queue.json).

## G3.23 — complete fresh public OSV IDs/alias crossrefs, still NOT vulnerability clearance

- PASS: explicit public-only query of three exact previously pinned PyPI names/versions, 104 current public advisory records with complete returned ID+alias lists and published affected-range fixed-event metadata. All 36 prior G3.5 sampled IDs recovered and linked to G3.22 SHA proof. Historical 68 discarded IDs cannot be independently reconstructed as the same 68, despite current matching total.
- PASS: pure offline full-ID census grouped 104 public entries by shared identifiers/aliases -> **64 related identifier groups**. These are not guaranteed unique CVEs, distinct root causes or exploitable LOCAL3D weaknesses. No per-advisory real codepath/fix/security approval. Query source gitignored and SHA-linked; public aggregate and tests contain NO private source inputs/jobs.
- OPEN: remediation/timing/high-priority reachability, frozen runtime upgrade testing, OS image parser sandbox and true enforced network egress. Security Issue #4 OPEN; print/geometry Issue #3 OPEN, no GPU/printer.
- [Method & reproducibility](G3_23_FULL_PUBLIC_OSV_IDS_ALIAS_CENSUS_2026-10-10.md), [104 public IDs / 64 alias groups SHA proof](evidence/g3/g3-23-full-public-osv-id-census.json).

## G3.22 — pinned Python advisory snapshot and static codepath controls (NOT SECURITY CLEARED)

- PASS static: read-only G3.5 OSV evidence SHA/34 exact installed dependency pins/source Git HEAD, 63 first-party + 2 selected upstream AST files. Previous OSV 104 version matches **50 Transformers, 32 Pillow, 22 torch**, but only 36 sampled advisory IDs persisted and **68 missing IDs** require new full inventory; zero evidence supports individually clearing 104.
- Direct image decoder Pillow Image.open/exif import reaches input-image bytes; expected local pinned ViTModel.config_class.from_pretrained and TSR torch.load code discovered. Worker weights_only=True temporary wrapper, SHA source/weights, DINO local override and offline env literal checks pass; no OS egress/network filesystem confinement.
- Three sample advisories checked against official GHSA trigger API descriptions: no literal targeted ImageMath.eval, AutoModelForCausalLM.from_pretrained or torch.mkldnn_max_pool2d calls in audited Python source; this is NOT transitive/no-exploit proof. Other advisories conditional and UNRESOLVED; production Pillow 10.1.0 remains unchanged.
- Security Issue #4 OPEN, no untrusted/customer image clearance, no package upgrade, no OS/firewall mutation or GPU; manufacturing Issue #3 and print release still OPEN. [Method](G3_22_PYTHON_ADVISORY_STATIC_REACHABILITY_CPU_2026-10-10.md), [public SHA evidence](evidence/g3/g3-22-pinned-python-static-triage.json).

## G3.21 — physical source-reference attestation is BLOCKED without independently verified evidence (CPU)

- PASS: strict SHA-bound schema for hypothetical external caliper/ruler physical measurement and two original decoded mesh vertex landmarks. Enforces positive finite claimed mm, source/time/hashes, valid indexed landmark pair and no unauthorized fields; fake approvedForPrinter flags, declared GLB meter metadata, untrusted image estimates, arbitrary PII and malformed evidence are REJECTED. Even valid structure is ONLY PENDING HUMAN REVIEW, not unit conversion or print approval.
- PASS: public-only SHA-256 linked proof over G3.20 sanitized report, four old trusted model SHAs all BLOCKED_MISSING_EXTERNAL_REFERENCE, zero independently supplied physical measurements, zero verified mm scale/physical thickness. No G2 private job/raw model access, no inference/GPU.
- OPEN: real independent calibrated reference measurement, signed reviewer/legal/source proof, matching physical landmarks and transform chain, true local minimum wall/material/slicer/printer QA and Issue #4 OSV advisory/OS sandbox/egress. All draft outputs printQualified=false, Issue #3 OPEN.
- [Method, contract and exact safety status](G3_21_MANUAL_MM_REFERENCE_CONTRACT_CPU_2026-10-10.md), [four-model public-only blocked SHA proof](evidence/g3/orb-01-g321-physical-calibration-missing.json).

## G3.20 — trusted source physical unit provenance and bounded CPU chord probes

- PASS: four historical licensed/source SHA models retain realPhysicalMillimeterScale UNKNOWN_UNCALIBRATED and mmPerGLBUnit NULL. glTF mesh extras.units="meters" exists in old G3.7 positive winding and licensed chair but is explicitly an UNVERIFIED exporter metadata claim, not independent subject physical scale calibration. Existing image-to-mesh worker/export has no physical mm reference or certified scaling transform.
- PASS: CPU-only sampled normal ray FIRST-HIT CHORDS (not walls) for 128 deterministic faces each on positively oriented derivative, original GT sphere and licensed chair; for the historic original real orb signed volume nonpositive, **zero normal rays cast**, INDETERMINATE_UNVERIFIED_NORMAL_ORIENTATION, no mutating original geometry. Triangle edge length distributions and sample chord statistics remain arbitrary GLB units. All physical minimum wall thickness or small printable feature fields null/false; printQualified=false.
- OPEN: source-verified physical mm correspondence, independent reference measurement, robust actual local thickness, material/printer/slicer dimensions and print QA, Windows OS sandbox/egress and Python pinned dependency advisories Issue #4. Issue #3 stays OPEN and every GLB remains DRAFT.
- [G3.20 source method and safety boundaries](G3_20_UNIT_PROVENANCE_AND_CHORD_CPU_2026-10-10.md), [four-model unit/chord sanitized SHA proof](evidence/g3/orb-01-g320-unit-chord-cpu.json).

## G3.19 — second independent exact rational triangle contact differential QA (CPU, previous SHA models)

- PASS: independently coded rational 2-triangle classification (3D edge-plane crossing and finite line interval; coplanar exact point inclusion + all nine segment/segment crossings rather than G3.13 polygon clipping). Direct full per-pair agreement against G3.17 exact math for EVERY no-index AABB candidate on four previously licensed real/reference GLBs. Zero disagreements: prior real orb 43,107/43,107, winding-only copy identical, GT 216/216, historical chair 28,593/28,593. No model inference.
- PASS but SAMPLED ONLY: second oracle agrees on first deterministic 256 shared-edge and 256 one-vertex-only pairs for EACH prior model. G3.15 and G3.16 full indexed-adjacent classifications remain separate earlier proofs; G3.19 does NOT exhaustively reconfirm all of them with second implementation. Seeded randomized adversarial and forced disagreement tests fail closed.
- OPEN: source GLB already quantized and not reconstructed CAD; second full indexed adjacency oracle, physical mm scale and min printable wall/strength/slicer/printer QA, Windows native parser sandbox/network isolation and Python OSV triage. Issue #3/#4 OPEN; never printQualified, every model DRAFT.
- [G3.19 method and scope](G3_19_SECOND_EXACT_TRIANGLE_ORACLE_CPU_2026-10-10.md), [G3.19 sanitized four-source evidence](evidence/g3/orb-01-g319-second-exact-oracle-proof.json).

## G3.18 — independent exact-axis AABB candidate completeness corroboration (CPU)

- PASS: bounded sorted-X interval sweep independent of G3.17 SciPy KDTree, followed by Y/Z OUTWARD-rounded prefilters and exact Fraction rational 3D AABB endpoint comparisons. Counts strict zero-tolerance pairs (necessary for all geometric triangle contact in finite decoded GLB XYZ), and exact fixed-margin pairs. 0/1/2 indexed partition agrees with G3.14; EXACT no-index PAIR ID membership (privately only) agrees with G3.17 numeric KDTree set, not merely counts. Any exact no-index candidate missing from numeric set is INDETERMINATE.
- PASS: prior genuine real orb 294,495 exact 3D AABB pairs incl 43,107 no-index; winding-only derivative identical, original GT 7,866/216, licensed chair 151,180/28,593; zero exact no-index missed. All prior source/license/SHA and immutable private/public proof verified without new neural inference.
- OPEN: no independent second triangle-triangle contact kernel/cross-validation yet, no unquantized original CAD coordinate recovery, physical mm calibration, wall thickness, material/slicer/printer QA, OS sandbox and Python advisory resolution. Issue #3 and #4 OPEN; globalSelfIntersectionFreeCertified=false, printQualified=false, every output DRAFT.
- [Method and finite precision caveat](G3_18_EXACT_AABB_SWEEP_AUDIT_CPU_2026-10-10.md), [four-source sanitized exact AABB evidence](evidence/g3/orb-01-g318-exact-axis-sweep-proof.json).

## G3.17 — exact NO-index triangle contacts for every conservative numerical AABB candidate (CPU)

- PASS: independent bounding-BOX-sphere cKDTree broadphase + exact 3D AABB axis checks with declared numerical tolerance enumerates candidate unordered face pairs; 0/1/2 original-index partitions exactly match pinned G3.14. Every candidate with 0 shared indexed vertices receives exact digital IEEE-754 rational triangle/plane section and interval or coplanar polygon clipping, including point/line/positive area vs disjoint. This is exact *narrowphase on each enumerated numerical AABB candidate*, NOT a universal mathematical guarantee about floating broadphase under all possible geometry.
- PASS: previous licensed real orb 43,107/43,107 exact no-index disjoint pairs; unchanged surface winding copy identical, project GT 216/216, historical chair 28,593/28,593. 15 new Python adversarial controls exercise positive actual intersections and 3 Node source SHA/privacy. No new AI job, GPU or printer.
- OPEN: independent exact broadphase completeness proof or alternative kernel audit, original CAD/quantization/real mm scale and wall thickness, print/slicer/structural tests, parser/OS network isolation and security Issue #4. G3 quality Issue #3 remains OPEN; every model DRAFT / printQualified=false.
- [G3.17 limits and CPU method](G3_17_EXACT_NOINDEX_AABB_CONTACT_CPU_2026-10-10.md), [four-source sanitized SHA proof](evidence/g3/orb-01-g317-exact-noindex-aabb-pairs.json).

## G3.16 — exact shared ONE-index vertex-only face contacts (CPU, decoded GLB only)

- PASS: raw original vertex-to-face index incidence census independently enumerates every face pair with exactly ONE shared index; it excludes full-indexed-edge neighbors. Mathematical exact signed planes/rays or exact 2D coplanar polygon clipping distinguishes expected only-point contact, extra line contact beyond that shared vertex and positive-area coplanar overlap, all on IEEE754-decoded source XYZ values. Valid synthetic overlaps MUST be flagged. Budget/time/degenerate cases never pass as clear.
- PASS: previous real orb and G3.7 same-surface copy: 190,860 exact pairs each, 0 extra contacts. Project-original GT 5,730 and earlier licensed chair 92,629, also 0. All four actual SHA/image provenance and G3.14 independent counts agree, and source reports replay immutably. No new neural job.
- OPEN: G3.14 no-index pair class has only conservative NUMERICAL SAT (43,107 previous real AABB pairs), not exact whole-mesh proof; original CAD/mm precision, wall thickness, supports/mechanics/printer suitability and OS/network sandbox/security Issue #4 not satisfied. Print release remains BLOCKED, Issue #3 OPEN and every model DRAFT / printQualified=false.
- [G3.16 exact vertex method and caveats](G3_16_EXACT_INDEXED_VERTEX_CONTACT_CPU_2026-10-10.md), [sanitized four-model SHA evidence](evidence/g3/orb-01-g316-exact-indexed-vertex-only.json).

## G3.15 — exact shared-index-edge adjacency classification (CPU, DECODED GLB COORDINATES ONLY)

- PASS: rational signed tetrahedral orientation and coplanar side-of-shared-edge classifies every indexed full-edge face pair, distinguishing expected edge-only contact from true coplanar same-side positive interior area overlap under exact IEEE-754-decoded GLB numeric geometry. Tests include positive synthetic coplanar same-side overlap, valid cube/flat seam, reversed winding and fail-closed unsafe/degenerate input.
- PASS: actual prior real orb 60,528 edges, copy 60,528, project GT 1,920 and licensed chair 29,958 all classified, zero same-side coplanar positive-area overlap candidates. Four source SHA hashes, private job provenance, previous G3.14 AABB edge counts and immutable sanitized evidence verified. Zero new AI inference.
- BLOCKED: indexed one-vertex-only extra contact remains numerical (G3.10), no-index pairs SAT floating (G3.14), original GLB float32/CAD tolerance, physical wall thickness, real-world scale and printer QA. This is NOT a full exact self-intersection clearance, all output DRAFT and printQualified=false. GitHub Issues #3/#4 remain OPEN.
- [G3.15 details](G3_15_EXACT_INDEXED_EDGE_CONTACT_CPU_2026-10-10.md), [G3.15 aggregate SHA evidence](evidence/g3/orb-01-g315-exact-indexed-edge.json).

## G3.14 — independently exhaustive AABB numerical candidate and indexed adjacency census (CPU ONLY)

- PASS: conservative bounding-box-sphere cKDTree broadphase independently accounts for every numerical AABB-overlapping face-pair candidate; explicit indexed partition into exactly-one-vertex, full-edge and no shared indexed vertices. The no-index category is fully screened by conservative numerical SAT; SAT-positive pairs would be routed to bounded G3.13 exact refinement. 12 synthetic/trusted Python controls including brute-force AABB comparisons and 3 Node public source/privacy checks pass.
- PASS: previous real 01-orb-alpha (40,352 triangles) contains 294,495 AABB candidate pairs: 60,528 shared indexed edge + 190,860 only indexed vertex + 43,107 no-index, 0 numerical SAT positives among all 43,107. This is 82 more conservative AABB candidate boxes than the G3.8 previously triangle-centroid-sphere filtered count. The G3.7 winding-only copy reproduces results exactly; GT and chair were also SHA-verified CPU replayed. NO NEW MODEL INFERENCE.
- LIMITATION: numerical SAT negatives are NOT exact proof of no microscopic intersection, and shared-edge/vertex candidate pairs are NOT globally classified for extra geometric intersections here. Candidate boxes do not equal real mesh penetrations. No wall thickness, mm scale, manufacturing or printer clearance.
- Evidence: [G3.14 numerical scope](G3_14_AABB_FULL_PAIR_CENSUS_CPU_2026-10-10.md), [sanitized SHA report](evidence/g3/orb-01-g314-full-aabb-census.json). G3 Issue #3, security Issue #4 both OPEN. Every model DRAFT / printQualified=false.

## G3.13 — exact-binary-float triangle PAIR classifier (FOUNDATION ONLY)

- PASS: new standalone CPU-only selected triangle-pair classifier with exact rational orientation and coplanar polygon clipping of *already decoded* IEEE-754 GLB coordinates. 19 adversarial Python tests for definite strict interior piercing, coplanar positive-area overlap, legitimate boundary touching/plane separation and malformed/budget-limited inputs.
- PASS: SHA-verified previous real orb, winding-only copy, known procedural GT and old chair; 24 lexicographically chosen already-indexed SHARED-EDGE adjacent triangle pairs per existing GLB analyzed. All 24 in each are **UNRESOLVED_BOUNDARY** because neighboring triangles legitimately meet on that indexed edge; NOT defects. NO OTHER PAIRS screened by G3.13 selected-pair proof.
- BLOCKED: complete mesh pair enumeration/BVH, nonadjacent pairs and degenerate boundary handling globally, exact full self-intersection-free certification, true physical mm-scale/walls, printer/structural QA. No production-code connection or automatic printer action; no new AI model or GPU.
- Evidence: [limited method](G3_13_EXACT_SELECTED_TRIANGLE_PREDICATES_CPU_2026-10-10.md), [immutable SHA-linked selection-only counts](evidence/g3/orb-01-g313-selected-exact-pair-predicate.json). `printQualified=false`; Issues #3/#4 remain OPEN.

## G3.12 — different-index spatial position and disconnected-shell proximity (CPU DIAGNOSTIC)

- PASS: on four EXISTING SHA-verified GLBs (20,178-vertex real TripoSR orb, exact-winding copy, 642-vertex procedural GT, 9,986-vertex historical chair), independently enumerated different indexed vertex IDs at distance <=1e-7 of each model's AABB diagonal. **0 exact or near pairs** in each; one indexed component each. No new model run or CUDA permission used.
- PASS: 12 adversarial Python tests flag different-index coincident/near XYZ, contact at touching separate closed box shells, prevent same-index overcount, and fail closed for dense clusters and malformed input. Three Node tests enforce previous source SHA, privacy and DRAFT/no-printer flags. Immutable reports and [G3.12 evidence](evidence/g3/orb-01-g312-spatial-index-proximity.json) verified.
- LIMITATION: this is a per-vertex spatial screen, **not** a triangle-interior/surface-surface intersection detector, physical mm threshold, automatic vertex welding/repair or proof that disconnected shells never meet; coplanar/near-zero precise geometric contacts remain unresolved.
- BLOCKED: exact robust whole-mesh collision predicates, calibrated CAD dimensions, local wall thickness, material/slicer/printer checks, remaining seven per-image GPU authorizations and production sandbox/advisory triage. Issue #3 and #4 remain OPEN. No output PRINT QUALIFIED.
- [Method](G3_12_SPATIAL_INDEX_PROXIMITY_CPU_2026-10-10.md). Nothing touches Office 2.0, printer or existing GPU inference.

## G3.11 — shared-edge same-side planar fold screening (DIAGNOSTIC ONLY)

- PASS: CPU screen over all **60,528** actual indexed two-face edge pairs in the prior real 01-orb-alpha TripoSR model and G3.7 exact-surface orientation copy, with **0 possible coplanar same-side beyond-edge overlap candidates**, 0 near-antiparallel >=175°, 0 suspicious same-side >=150° backturns and 0 borderline cases. Source procedural GT: 1,920 edge pairs; historical MIT chair: 29,958, also zero under these numerical predicates.
- PASS: adversarial coplanar same-side overlapping triangle test MUST flag; valid opposite-side planar pair, legitimate cube corners and sphere do not. Noncoplanar high-backturn pair is a separate indicator, not falsely called coplanar penetration. Four-model SHA validation/read-only CPU replay and public sanitized immutable report passed. No GPU tasks.
- NOT CERTIFIED: G3.8 SAT no shared indexed vertex, G3.9 edge-normal angle, G3.10 shared-one-vertex ray, G3.11 edge-coplanar same-side fold are *different narrow numerical screens*, not one mathematically exhaustive global geometric collision predicate.
- BLOCKED: true robust 3D intersection under degeneracies, co-located separate-index vertices, physical mm scale, local minimum thickness, supports/material strength/slicer/real-world photos, seven still-unrun G3 originals and independent second engine.
- [G3.11 scope](G3_11_EDGE_BACKFOLD_CPU_2026-10-10.md), [real model evidence](evidence/g3/orb-01-g311-edge-coplanar-screen.json). All output remains DRAFT, printQualified=false.

## G3.10 — extra-contact rays between exactly-one-vertex-adjacent faces (CPU DIAGNOSTIC)

- PASS: on prior genuinely authorized 01-orb-alpha TripoSR real output AND unchanged-surface G3.7 winding copy, enumerated all **190,860 unique vertex-only triangle pairs per GLB** and tested positive/negative possible shared noncoplanar rays away from the common indexed point. No such extra ray candidate found under finite precision. Project-original GT: 5,730 pairs; historical real chair derivative: 92,629 pairs; 0 extra candidates in those numerical screens. None of these counts constitutes a new model run.
- PASS: separate ray detection from **NORMAL shared-vertex touching**, which is not a defect; explicit near-coplanar/ray-boundary UNRESOLVED outcome, fail-closed resource exhaustion, 13 adversarial CPU controls including synthetic true extra-ray intersection, SHA-pinned immutable public proof and 4-model private read-only CPU replay. G3.7 shape is preserved.
- LIMITATION: G3.8 no-shared-vertex SAT=43,025 eligible orb pairs; G3.9 indexed SHARED-EDGE angle statistics=60,528; G3.10 shared-ONE-vertex ray candidates=190,860. These are different diagnostics, **NOT** complete exact global mesh self-intersection screening. A truly coplanar folded edge, hidden wall issue or mm tolerance still requires new independent tests.
- BLOCKED: **no** manufacturing certification, true minimum mm walls, absolute model scale, supports/material strength, slicer/physical QA, model provider licensing, seven unrun synthetic G3 images. G3 real-output private coverage remains 2/9, public historical scorecard remains earlier 1/9.
- Evidence: docs/G3_10_SHARED_VERTEX_CPU_2026-10-10.md and docs/evidence/g3/orb-01-g310-shared-vertex-ray-screen.json. Model printing remains disabled; G3.10 runs CPU-only.

## G3.9 — edge-adjacent face-normal-angle diagnostic (PARTIAL CPU PASS)

- PASS: all 60,528 indexed two-face shared-edge pairs of the existing 40,352-face real 01-orb-alpha output and its G3.7 separate winding derivative checked with deterministic CPU Trimesh face normals. Their p95 difference is 33.018760°, 312 edges >45°, 18 >60°, **0 >90°**. Underlying known original project GT has p95 5.731991°, but GT has 1,280 faces vs 40,352 model faces, so direct angle percentiles are NOT mesh-resolution invariant.
- PASS: reproducible source/model/derivative SHA-linked counts, a completely independent CPU-only replay, immutable sanitized G3.9 evidence and negative tests (including intentional cube sharp edges, open/degenerate geometry and changed winding). 0 newly launched AI workers.
- LIMITATION: this adds **full indexed edge adjacency angular coverage**, NOT a contact/collision check for edge-adjacent faces. Vertex-only adjacency, true foldover geometry and exact global self-intersections remain **NOT EXAMINED**. Sharp angles do not alone imply a defect; zero angles above 90° cannot imply print/structural safety.
- Still DRAFT / NOT PRINT QUALIFIED: physical units, walls, material/slicer/strength, mesh self-intersection certification, trusted media sandbox/security, alternative provider and seven unrun synthetic G3 images.
- Evidence: docs/G3_9_ADJACENT_FACES_CPU_2026-10-10.md and docs/evidence/g3/orb-01-g39-adjacent-angles.json.

## G3.8 — bounded triangle-contact risk + orb radial quality (CPU diagnostic ONLY)

- PASS: actual previously consented 01-orb-alpha TripoSR GLB and previous non-destructive orientation derivative both underwent bounded, conservative nonadjacent-triangle SAT screening (43,025 eligible pairs per 40,352-face mesh, 0 potential contacts flagged). Independently verified original and derivative SHA and same geometry before testing.
- LIMITATION: this is **NOT a complete self-intersection or print pass**. Excludes all pairs sharing a vertex index (251,388 AABB candidate pairs) and uses tolerant floating-point potential-contact checks. Traversal/resource budgets are explicit and INDETERMINATE if exceeded; false negatives/positives remain possible.
- PASS: licensed procedural orb GT and actual generated AI orb compared via 4096 deterministic area-weighted surface samples and separate best-fit spheres. Mean absolute radial residual relative to fitted radius: 0.00062476 GT vs 0.04973669 TripoSR. Can measure nonroundness but not millimeter thickness/finish or physical accuracy.
- PASS: synthetic intersecting/disjoint/coplanar negative controls, degenerate/over-budget/invalid-mesh refusal, deterministic private CPU-only replay of all 3 scans and the radial metric, immutable sanitized evidence SHA validated against actual completed job.
- ZERO new AI in this phase, no second provider, no cloud or printer, no Office runtime modifications. **2/9 private actual model outputs** remain unchanged, 7 G3 sources require separate new GPU approvals. Public fixed historical 1/9 baseline is not live.
- BLOCKED: adjacent-face foldover, mathematically exact global collision checking, real-world mm dimensions, thickness, supportability, mechanics, slicer validation, OS sandbox/authentication and resolved Python advisory triage. DRAFT/printQualified=false.
- Evidence: docs/G3_8_ORB_CPU_RISK_2026-10-10.md and docs/evidence/g3/orb-01-g38-cpu-risk-screen.json.

## G3.7 — one actual new G3 synthetic model + copy-only CPU QA (PARTIAL PASS)

- REAL PREEXISTING INPUT: one newly consented TripoSR 01-orb-alpha inference successfully generated an 808,092-byte GLB in 12.59s, with source/job/output SHA consistency and complete native worker stages. This real inference occurred BEFORE the G3.7 CPU-only milestone. Seven other new synthetic reference images are unrun; previous real MIT chair is the other observed output.
- PASS: new private, source-preserving GLB derivative flips only triangle winding on closed inward-facing original mesh: signed volume -0.3691746 -> +0.3691746 arbitrary units cubed, same 40,352 triangles / 20,178 vertices, one watertight component.
- PASS: independent CPU auditor demands bit-exact unchanged vertex coordinates/vertex colors, exact per-triangle reversed face indices, opposite normals and identical bounds/abs(volume). Malformed/open/reordered/mutated inputs and overwrite attempts are rejected; no CUDA inference needed.
- PASS: native three-way Chrome SwiftShader screenshot of original source 3D, generated real output and winding-only derivative with no external network calls. The AI surface visibly has roughness relative to original source. Inverted-to-positive winding does NOT improve original-vs-reference shape distance.
- EVIDENCE: private SHA-linked input, GLB and CPU QA; sanitized docs/evidence/g3/orb-01-* and docs/G3_7_ORB_WINDING_CPU_2026-10-10.md. Public fixed historical benchmark remains 1/9; private live observed-output coverage 2/9 (7 pending).
- BLOCKED: self-intersections, physical dimensions, minimum walls, strength, support/material/printer profile, second licensed provider, real-world quality generalization, OS network sandbox/authentication. PrintQualified remains FALSE and no printer action occurred.
- GPU: zero NEW TripoSR inference from G3.7; all additional model tasks require explicit per-image approval and live Office/GPU safeguards.

## G0 - Source and rights screening
- PASS: inspected ctate source reference: app is Rodin SaaS UI, no standalone inference.
- PASS: do not copy source without a verified explicit license; clean-room app chosen.
- PASS at G0: Three.js pinned, local-only fixture; G2 weights downloaded and verified later under explicit user approval.
- REVIEW LATER: exact commit, all indirect dependency licenses, TripoSR weight card, Hunyuan jurisdiction and distribution.
- PASS: existing AI3D engineering Issue #613 is P2/PARKED, not this project's scheduler.

## G1 - Fixture-only interface
Evidence (2026-10-09): Windows Chris: 12/12 Node tests + 7/7 browser phases PASS in real Chrome 154.0.8037.98. MacMiniOffice.local: 12/12 Node tests + 7/7 browser phases PASS in real Microsoft Edge 154.0.4258.53 on macOS arm64. See docs/evidence/g1/report.json, macos-report.json and Windows screenshots.
Golden fixture: fixtures/demo-sculpture.glb, generated deterministically with server/fixture.js.
- A: image upload -> persisted job -> GLB asset -> DRAFT QA report: PASS API and real Chrome browser. Screenshot and byte-for-byte source download verified.
- B: invalid image, missing prompt, disabled provider, job cancel, missing output: PASS automated. Model timeout (real engine) NOT APPLICABLE to G1.
- C: job QA report states DRAFT, no manifold/wall thickness test, printQualified false: PASS. Deliberately no positive manufacturing claim.
- D: remote URL rejected, Host/Origin blocked, unknown job/asset inaccessible: PASS automated. External independent security review pending.
- E: same input through two real engines: NOT STARTED; no second engine installed.
- Persistence: atomic job.json plus restart-interruption recovery tested PASS.
- Browser UI: 1440px desktop and 390px mobile screenshots inspected on Windows Chrome and macOS Edge; OrbitControls changed viewport pixels, reset exercised; no browser JS errors or external requests on either host. PASS for the two tested browser/OS combinations. Mac Chrome headless had a host-specific path-service crash, but Mac Edge passed. A missing Three.js core import and favicon were found/fixed by live browser QA.

## G2 - First real local inference (BOUNDED PILOT + MANUAL APP ADAPTER PASS)
Explicit user authorization covered isolated model installation and limited GPU runs. Source/weights/DINO config pinned and SHA256 verified, isolated Python3.11+torch 2.5.1 cu121. Two original standalone TripoSR pilots succeeded (improved 14.15s, 2058 MiB torch reserved). Subsequently a secure opt-in local app adapter was integrated: G1 default remains fixture-only, G2 only in manually launched Windows localhost session; per-image GPU consent, single synchronous permit, GPU/Office checks, timeout/VRAM caps, process-tree cleanup, cancellation, persistence, SHA/QA validation and Y-up GLB output. Real local end-to-end UI+API smoke passed in 25.51s, 400452 bytes, peak 2058 MiB torch reserved, model loaded in real Chrome; no printer or cloud. Tests 26/26 Node, 5/5 isolated Python, 7/7 G1 browser, 5/5 G2 mock browser; five process tests use actual zero-GPU child processes. See docs/G2_APP_INTEGRATION.md and docs/evidence/g2-app. **Limit:** only one real licensed image has been assessed; no multi-image quality baseline or print certification. No unattended schedule, general text-to-3D or Office integration.

## G3 - Licensed source catalog + CPU geometry review (PARTIAL PASS)

- PASS: nine SHA-locked source references: eight project-original synthetic image/mask/ground-truth GLB triples, plus one pre-existing TripoSR MIT chair image/mask with NO ground-truth 3D. Exact-camera source/GT silhouette positive controls >0.935 IoU. This is NOT model benchmarking.
- PASS: independent CPU GLB topology scanner and optional browser manual review for completed real G2 jobs. Existing real chair is watertight, but signed volume **negative**, caught by new positive-volume guard. Missing scale, thickness, self-intersection and strength checks remain explicit.
- PASS: optional CPU-only winding derivative produces distinct SHA, positive volume, same geometry extents; original unchanged; all printability flags remain false. Real Chrome viewed the previous GLB and its G3 CPU report without new GPU inference.
- RESEARCH ONLY: SF3D, SPAR3D, InstantMesh, Hunyuan Shape, OpenLRM licensing/VRAM comparison in docs/G3_PROVIDER_SCREENING.md. No new candidate weights installed, no commercial licensing assumed.
- OPEN: run new images through the real G2 model with *per-job authorization*, true multi-image output analysis and comparison to another independently licensed engine. Production print and multi-user hardening remain blocked.

## G3.4 — manual completed-job CPU comparison / host GPU evidence (PARTIAL PASS)

- PASS: manually initiated CPU-only benchmark on a **completed licensed-source G2** job with source/GLB/provenance verification and downloadable, DRAFT benchmark-shape JSON. Denies DEMO, unknown/unlicensed source, running, tampered model, duplicate requests and false print claims.
- PASS: actual pinned Windows CPU scorer over temporary localhost API against the **existing historical real chair GLB**; no new model inference, accurately reports NO_GROUND_TRUTH_3D, with temp evidence cleaned.
- PASS: future real-model successful G2 QA can report NVIDIA host usage as sampled shared-GPU observations distinct from model CUDA reserved MiB; the delayed native mock process tests sampling without CUDA.
- STILL OPEN: eight *new* licensed inputs have NO AI results and no cross-provider ranking; per-image GPU approval and live Office/NVIDIA checks required for each. Camera/real-world scale, self-intersection, thickness/strength/material safety, native process sandbox and OS network denial absent.
- HOLD Issue #3 OPEN. No printing, no autonomously scheduled inference, no licensing assumptions about additional engines.

## G3.3 — genuine-source shape metric readiness (PARTIAL PASS)

- PASS: SHA-locked nine-image local picker with server allowlisted image reads and browser consent reset. Selecting an image does not create a GPU job.
- PASS: independent CPU normalized-surface Chamfer/F1 diagnostics on eight original synthetic source GT models, with eight exact identity controls and four intentionally wrong-shape controls, explicit optimism/scale limits.
- PASS: private, hash-linked completed-G2-job scorer; denies unlicensed/incomplete/tampered job files, original GT copies and incorrect weights provenance. Upstream chair has no original 3D and must not get a fake 3D metric. Local records are not independent hardware attestations.
- PASS: optional private scores may enter private coverage snapshot, but public benchmark remains **1 prior observed real chair / 8 new images not yet inferred**.
- OPEN: actual G2 inference on each of the eight (requires per-job explicit consent), second local engine and fair real-output comparison, real-world dimensions/self-intersections/wall thickness/print release, and production security hardening. Issue #3 stays OPEN.

## G3.2 — management/benchmark coverage (PARTIAL PASS)

- PASS: one real pre-existing G2 model, eight untouched synthetic reference inputs; reproducible SHA-evidence ledger with explicit "pending" statuses and **no fabricated nine-model results**. Fixed read-only /v1/benchmarks/g3 response in UI.
- PASS: cross-process filesystem GPU lease with multi-process and two-HTTP-app contention tests; second local request rejected without job or GPU. Stale lock is fail-closed, inspected manually.
- PASS: aggregate storage audit, no user photo/prompt/ID disclosure, no deletion/quota claims.
- OPEN: real multi-image G2 runs require separate per-image GPU consent; second independently licensed engine not installed; OS-level egress sandbox, user isolation, formal retention quotas and print qualification not implemented.

## G3 - Multiple provider candidates (NOT APPROVED)
Hunyuan Shape, SPAR3D / TripoSG, alternatives: gate on licensing, reproducible installs, VRAM and non-conflicting scheduling. No P0 CPU/GPU resource impact without separate verified allocation.

## G4 - Fair benchmark (NOT RUN)
Run identical verified fixtures through each qualified engine. Record source image/license, seed, provider version, model SHA256, elapsed wall-clock, peak VRAM, output bytes, silhouette fidelity, multipart integrity, surface topology, normals, manifold and dimensional accuracy where source is measurable. Compare actual mesh utility, not only a pretty render.

## G5 - Optional output qualification (NOT RUN)
STL/3MF export pipeline only with independent geometry report, repair recommendation and explicit state DRAFT / GEOMETRY CHECKED / PRINT QUALIFIED. No print action or automatic release.

## G3.5 — CPU admission and supply-chain safety (PARTIAL PASS)

- PASS in CPU-only tests: a new manual G2 job is not saved or handed to GPU if existing job storage is invalid, exceeds 8GiB prospective quota, has too many job folders or cannot leave >=3GiB volume free after estimated reservation. No automatic deletion. G1 demo unaffected.
- PASS: one cross-type topology/shape CPU-review permit per server process, immediate HTTP 409 G3_CPU_BUSY without queue, released on success and rejected print-approval report. No GPU tests needed.
- PASS: read-only existing G2 manual storage preflight found 3 prior job folders and unchanged byte totals before/after. No images, paths or filenames committed.
- SCREENED / NOT REMEDIATED: npm audit found 0 Node package matches; public OSV matching of 34 frozen Python dependencies found 104 advisory entries in Pillow, Transformers and Torch. Applicability and patched-model compatibility remain unreviewed; untrusted-media/production-security gate is BLOCKED pending triage.
- STILL OPEN: 8 real TripoSR model runs on G3 synthetic fixtures (each needs new per-run approval); second-model comparison, real-world dimensions, topology/printability, system egress sandbox, OS-backed quotas and production retention. G3 issue stays OPEN. No Office, printer or model changes.

Evidence: docs/G3_5_RESOURCE_SECURITY_2026-10-10.md and docs/evidence/g3/g3-5-*.

## G3.6 — Pillow shadow candidate, CPU-only sub-gate PASS

- PASS: public official Pillow 12.3.0 Windows CPython3.11 wheel and SHA256 verified; OSV public version-query matches 0 versus 32 for working Pillow 10.1.0 at this test date. Zero OSV matches are not exploit-proof.
- PASS: 9/9 pinned licensed benchmark input preprocessing checks via actual TripoSR worker CPU helper, four alpha/EXIF/WebP/corrupt-file controls, 23/23 original Python G2/G3 CPU unit tests and import-only TripoSR tokenizer/system compatibility; CUDA not used.
- PASS: working production venv remains Pillow 10.1.0, frozen manifest/source/weights unchanged, shadow overlay stays gitignored. No new image→3D generation or OS configuration changes.
- BLOCKED: Transformers 4.35.0 and Torch 2.5.1 version-level OSV matches, true reachable vulnerability assessment, entire patched model dependency compatibility, OS sandbox, public untrusted input security and actual CUDA reconstruction qualification.
- G3 source benchmark still 1 historically real chair / 8 new source images without AI runs, no manufactured geometry release. New GPU attempts require separate authorization.

Proof: docs/G3_6_PILLOW_SHADOW_2026-10-10.md and docs/evidence/g3/g3-6-shadow-pillow-cpu-proof.json. Issue #4 remains OPEN.
