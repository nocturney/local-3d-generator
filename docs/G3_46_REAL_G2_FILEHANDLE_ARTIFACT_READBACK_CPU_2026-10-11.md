# LOCAL3D G3.46 — actual G2 worker input / output file-handle boundary hardening (Windows CPU)

2026-10-11 | v0.2.46-g3-g2-artifact-filehandle-readback-cpu

## Why this release makes a functional difference

G3.45 hardened the **PRE-WORKER** manually approved G2 storage admission and existing-job audit against Windows Junctions/hardlinks, with 9 real-native filesystem + 2 real ephemeral HTTP tests. It did **NOT** harden the independent **POST-WORKER** artifact reader. Previously `server/triposr-adapter.js` called `fs.stat(model.glb/qa-report.json)` (which follows symlinks) and later `fs.readFile` of the same paths. This could read a file aliased outside the approved job directory or an unexpected hard-linked artifact, and created a pathname-change window between metadata and use. Input source also was only checked by `lstat` for a direct symlink before the Office/GPU guard; there was no persistent preworker source digest across worker lifecycle.

G3.46 changes the existing **real MANUAL G2 adapter code**: not a new read-only Windows survey, not a fake model result or physical print release.

## Exact code changes and fail-closed behavior

- `server/g346-worker-artifact-readback.js` NEW. Read only the exact allowlisted file names `model.glb`, `qa-report.json`, `input.png/.jpg/.webp`, under `jobDir/engine-output` or `jobDir`. Reject non-absolute / noncanonical jobDir, unknown names, redirected parent directories/Junctions via the existing G3.45 ancestor guard, symlinked or hardlinked (`nlink!=1`) ordinary files, nonregular files, missing or oversized inputs. GLB 1,024–100 MiB, QA 2–128 KiB, input 16 bytes–8 MiB. Validate original `lstat(bigint)` against **the very same opened file handle** `fstat(bigint)` (`dev`, `ino`, `nlink`, `size`, type), bounded `readFile()` from that handle, check fstat after reading, then recheck ancestor and pathname identity. Race/inode substitution fails closed; no report ever contains actual filesystem paths or source bytes.
- `server/triposr-adapter.js` MODIFIED, which is the actual manual-only TripoSR adapter: independently read the source with the above bounded guard and freeze **SHA256 before** the live Office/GPU preflight or worker spawn. Re-read/compare the source before spawning and after the worker returns. Keep the existing report match `qa.inputSha256` plus original source digest; a worker-modified source cannot silently replace the operator-admitted source. Read model/QA from their verified handles after worker exit, not `fs.stat` and later path-based `readFile`. Fail closed with existing recognizable G2 error codes `G2_INVALID_PATH`, `G2_OUTPUT_EXISTS`, `G2_INVALID_ARTIFACT`, `G2_INVALID_REPORT`. A pre-existing output-directory Junction cannot pass unnoticed merely because target existence cannot be verified by `fs.stat`.
- Preserved G1 `server/index.js` byte-for-byte and the historical G3.28/G3.39/G3.44 G1 port/autostart evidence chain. Normal G2 remains manually opted in and per-image confirmed only; no automation or GPU action was added by this release. Production Pillow 10.1 and Python3.11 packages untouched.

## Actual tests run on Chris — strictly SYNTHETIC

- `tests/g346-worker-artifact-boundary.test.js`: **9 native Windows filesystem cases**. Ordinary GLB/QA/image bytes must still round-trip; hard-linked GLB/QA/input reject, owned-temp Windows Junction replacement of output directory or job directory rejects, deterministic injected `lstat→open` inode swap rejects **before reading** replaced content, same-length pathname swap after an opened handle was read rejects on final identity check, size/missing/path traversal errors reject, and errors don't leak path/user names.
- `tests/fixtures/g346-fake-artifact-worker.cjs`: **Node-only test worker** consumes the repo's public historical chair GLB fixture and an owned synthetic PNG, never imports Python, torch, CUDA or a model. It can intentionally create hardlinked GLB/QA/input, replace output directory with a Junction, rewrite source after worker, or write one normal result.
- `tests/g346-native-mock-worker-result.test.js`: **9 integration cases invoking the actual `createTripoSRAdapter` on Windows Chris** with injected fake Office-idle and GPU-telemetry observations and `python: process.execPath` (this executes NODE, NOT Python). Normal DRAFT result still passes; four malformed artifact types reject after mock child exit; changed source after worker rejects; hardlinked input before preflight blocks before any GPU sample; a deliberate source rewrite during Office preflight blocks BEFORE worker spawn; and an existing output Junction blocks a subprocess. No real GPU lease or NVIDIA CUDA work was performed.
- Existing `tests/g2-process.test.js`: six original native Windows mocked-worker tests still pass. The bounded proof assembler re-executes exactly **24/24 native CPU tests, 0 skipped** (9+9+6) with HF/Transformers offline and `CUDA_VISIBLE_DEVICES=-1`.
- **Real complete Chris QA all PASS**: 283/283 Node (including 18 new tests and all original G2/G3 security regression cases), 262/262 pinned G3 quality Python + 7/7 G2 offline Python = 269/269, Chrome G1 8/8 + Chrome G2/G3 MOCK 8/8 = 16/16. Python unittest printed progress on PowerShell stderr with a NativeCommandError wrapper, but both suites ended `OK` and exit code 0; those are not test failures. No customer jobs or real model images have been used or opened by the new test code.

`scripts/g3-46-assemble-real-artifact-guard-proof.mjs` SHA-locks the original immutable G3.45 native and HTTP evidence, unchanged canonical G1 source SHA, actual changed G2 adapter, guard and three test files (including fake worker and original existing mocked-worker harness). It reruns the native CPU tests and emits/compares an immutable sanitized public report:

`docs/evidence/g3/g3-46-actual-g2-result-file-handle-integrity-cpu.json`

Initial SHA256: `2f13915977b31994e46666bfaca8983d7366429165076d1ebf8a7eb4f20e34e0`.

No original G3.25–G3.45 published proof was changed or overwritten; the frozen new report does not expose user profiles, temp paths, per-file hashes of private objects, job IDs, source images or credentials.

## Real limitations (do not overclaim security)

This is **point-in-time** Node native filesystem inspection with a checked file handle. Windows host processes with write rights to the job tree could still race path components while the REAL Python worker is writing, or race directories between snapshots. On Windows Node `O_NOFOLLOW` is not available in this session, and even its use on an individual file would not alone prove parent-directory atomic containment. G3.46 does NOT prove OS-backed per-job directory-handle isolation, a securely contained Windows Sandbox/native Pillow decoder process, Windows egress restrictions, malicious user images being safe, multi-tenant access control, GPU compatibility for Pillow12.3, or patching pinned CVE warnings. Security issue #4 stays OPEN and external untrusted customer inputs must not be approved.

No service at port 4177 was activated or Task registered; Office's separately owned port 4178 remains unaffected, manual G2/4179 OFF. No reboot, BitLocker/ACL/Defender/UAC/Firewall changes, no encrypted independent off-host recovery and no customer-data backup. Issue #5 stays OPEN pending selected noninteractive low-privilege Windows principal, effective rights, allowed G1 install and true loginless reboot proof. Manufacturing issue #3 stays OPEN: only two historical real model-source outputs of nine, seven GPU future runs each need per-image operator authorization, no verified physical dimensions/wall/print. All artifacts DRAFT, `printQualified=false`, `approvedForPrinter=false`, `fabricationAction=NONE`.

## Rerun only safe tests on authorized Windows Chris

    node --test tests/g346-worker-artifact-boundary.test.js tests/g346-native-mock-worker-result.test.js tests/g2-process.test.js
    node scripts/g3-46-assemble-real-artifact-guard-proof.mjs
    npm test
    npm run qa:browser
    npm run qa:browser-g2-mock

The assembly step replays native synthetic fixture tests and byte-compares the published report, NEVER launches real GPU model, Windows guest, or Windows reboot. CPU Python quality/offline tests may be run under existing approved pinned Windows Python3.11 interpreter and offline flags; do not change production Pillow or packages.

## Next useful bounded engineering objective

A real OS-backed per-job path-confinement / untrusted native-decoder Windows Sandbox evaluation remains blocked pending scoped activation permissions. Without such approval, G3.47 should target further concrete CPU-reproducible attack paths (e.g. source result tampering at HTTP asset serving or persistent job restoration), not simply another identical read-only inventory, and must keep all existing G2 manual/Office/G1/printer boundaries explicit.
