# LOCAL3D G3.45 — ACTUAL G2 storage-boundary hardening for Windows junctions and hardlinks

2026-10-11 | v0.2.45-g3-native-storage-path-hardening-cpu

## Why this is substantive functional hardening

G3.43 and G3.44 finished read-only host preflights; neither enables off-host encrypted recovery nor an unattended G1 service. G3.45 instead hardens an ACTUAL production code path in the already-existing MANUAL-ONLY G2 storage-admission and storage-audit modules. Previous G3.5 checks refused direct symlinks and unexpected names in the jobs folder, but did not walk parent directories for reparse/symlink redirection, and did not reject NTFS regular files that are hard-linked to other locations. A future manual G2 GPU job should be rejected if storage cannot be accounted for from a single, ordinary ownership path.

No G1 `server/index.js` source change was made (protects frozen G3.28/G3.39/G3.44 chain), no printer/geometry qualification and no standing GPU authorization.

## Actual code changes

- **New** `server/g345-storage-path-integrity.js`: walks every path component from drive root through the candidate local jobs directory using `lstat`, rejects direct symbolic links, Windows junctions/reparse points presented as symlinks, non-directories, UNC job-root paths and an excessive parent-component chain. Allows a missing **last leaf only** for the historical read-only empty-storage audit, not for GPU admission. Classifies regular stored files as admissible only with exactly one hardlink (`nlink===1`), non-negative safe byte count and no symlink.
- **Hardened existing** `server/storage-admission.js`: runs the strict ancestor-chain metadata guard **before** quota/status/space checks. Any unsafe path maps to its existing `G3_STORAGE_UNVERIFIED` fail-closed error, before GPU lease or Python worker acquisition.
- **Hardened existing** `server/storage-audit.js`: applies the same protection to audit root and nested job/engine-output directories, considers hard-linked `job.json`, GLBs and engine-output files unsafe, and refuses their admission. Reads a normal `job.json` using one open file handle and validates opened `fstat` device/inode/link-count/size against the prior `lstat`, reducing the lstat-to-readFile symlink-swap window. Existing aggregate audit schema and privacy bounds remain unchanged; no cleanup, deletion, migration or model execution.
- **New** `tests/g345-manual-storage-path-integrity.test.js`: 9 ACTUAL Windows filesystem synthetic tests (owned temporary directories only). They cover legitimate files, a directly linked jobs root, a real **parent Junction** with ordinary jobs leaf, hard-linked manifest, hard-linked output GLB, nested engine-output hardlink, clean nested model, missing/interposed parent file and no private-data name leakage. Native Windows tests were executed with **9/9 pass, 0 failed, 0 skipped**. Synthetic external reference files are created/removed ONLY under the same owned temporary QA root.
- **New** `scripts/g3-45-assemble-native-storage-hardening-proof.mjs`: reruns all nine Windows-native negative controls in a bounded CPU-only child process, verifies fixed SHA256 ancestry of **G3.43 backup gate** and **G3.44 unattended G1 gate**, verifies original `server/index.js` unchanged, hashes new/updated production source and tests, and creates one immutable sanitized public report. The launcher explicitly sets CUDA invisible, TripoSR off and Transformers/HuggingFace offline.
- **New** `docs/evidence/g3/g3-45-g2-storage-junction-hardlink-native-cpu.json`: public immutable SHA-linked result, with **no test temp paths**, job IDs, model data, passwords, user names, task actions or customer images. Initial SHA256 of proof: `c1349fe585a4697f17dc8b5d09af6d321e84989a287389a8df8f77901a845331`.

**Additional actual HTTP assurance:** `tests/g345-http-storage-denial.test.js` tests two disposable loopback G2 HTTP POST paths with real `server/index.js` (source left unchanged) and injected nonexecuting GPU/adapter counters. A redirected parent Junction and hard-linked existing job manifest both return **503 `G3_STORAGE_UNVERIFIED`** with **ZERO GPU lease or worker calls**, 2/2 passed. `scripts/g3-45-assemble-http-storage-denial-proof.mjs` separately SHA-links the exact HTTP test source to the frozen first G3.45 native evidence report and already-hardened G2 code; immutable public output: `docs/evidence/g3/g3-45-g2-http-storage-denial-before-gpu.json` SHA256 `4031e200ad345b8d5a352ffbe7ebbb2a7c06082136f91c2c0fe57fff33823986`. Full Chris regression PASS: **265/265 Node, 269/269 pinned CPU Python and 16/16 Chrome**. This is actual synthetic HTTP request enforcement, not an inference execution or security approval for customer images.

A fresh read-only **ancestor-only** check on actual Chris `runtime/data-g2-manual/jobs` returned present/unlinked, without enumerating jobs, reading manifests, media or inspecting any private file contents. This check was separate from the synthetic tests, and is a point-in-time observation, not a lifetime guarantee.

## What was *actually* tested and what is still NOT proven

The nine native synthetic cases passed on Windows Chris, including creating a real Windows Junction and NTFS hardlinks. A once-legitimate jobs leaf under a redirected parent now fails even though `lstat(jobsLeaf).isDirectory()` would otherwise pass. An `nlink=2` file also fails accounting/admission instead of silently being counted as ordinary job-owned data. Ordinary job directories including `engine-output` continue to pass. Historic G3.5 storage-audit and admission tests also continue to pass; original G2 manual model execution is still NOT started.

**Boundary limitations, deliberately NOT overstated:** these are point-in-time Node filesystem metadata checks. Between a check and later job execution, another process with filesystem write permissions can still swap directories/files. They do not provide race-free OS-enforced directory handles, atomic private-job creation, independently attested Windows ACL containment, an isolated native Pillow parser, outbound network restrictions, malicious-file decode safety, server authentication, or encryption-at-rest. Hardlinks under current NTFS may be refused even if an operator created them for benign storage sharing; this is intentional conservative G2 admission, not an automatic repair. No filesystem ACLs or NTFS ownership were changed.

## Reproducible CPU-only verification

On approved Windows Chris project checkout:

    node --test tests/g345-manual-storage-path-integrity.test.js
    node --test tests/g345-http-storage-denial.test.js
    node --test tests/storage-admission.test.js tests/storage-audit.test.js
    node scripts/g3-45-assemble-native-storage-hardening-proof.mjs
    node scripts/g3-45-assemble-http-storage-denial-proof.mjs
    npm test
    npm run qa:browser
    npm run qa:browser-g2-mock

The assembler runs only nine owned-temp native tests and checks the immutable public proof; normal replay never rewrites public evidence. Parent G3.43/G3.44 JSON proofs remain exactly byte-for-byte untouched.

## Production blockers still open

- **#4 Security** remains OPEN: no untrusted customer image release, native decoder Windows sandbox isolation/egress authorization, complete CVE remediation, full safe G2 CUDA upgrade or **encrypted off-host backup**. G3.42 actual 34-distribution Python venv restore was on the same PC only, while G3.43 found both inspected internal disks had BitLocker OFF.
- **#5 G1 autostart** remains OPEN: 127.0.0.1:4177 is still off, independently owned Office 4178 must remain untouched. G3.44 has no future low-privilege principal/noninteractive rights proof, Task Scheduler install, reboot or postboot loginless health/422.
- **#3 Manufacturing** remains OPEN: historical 2/9 completed real-source models only; seven new GPU images each require a fresh operator approval. No calibrated dimensions in millimeters, measured walls, slicer settings or physical print. Every GLB stays DRAFT; `printQualified=false`, `approvedForPrinter=false`, `fabricationAction=NONE`.

This milestone operates solely on synthetic local filesystem fixtures and CPU. It performs no live Office changes, GPU inference, Windows security changes, Windows Task/service edits, customer-media access or printing.
