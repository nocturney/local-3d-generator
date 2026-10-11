# LOCAL3D G3.41 — real PRIVATE full 34-distribution Windows Python venv snapshot and CPU-readback

2026-10-11 | v0.2.41-g3-real-private-full-python-venv-snapshot

## Outcome (separate from production, cloud and OS disaster recovery)

G3.40 recovered an original **official SHA-verified Pillow10.1.0 CPython3.11 Windows** offline wheel and validated installing and restoring that package in an empty disposable isolated virtualenv. G3.41 now provides a much more meaningful source-proven snapshot: the COMPLETE Python virtual environment directory used by LOCAL3D G2 on Chris (all pinned 34 packages and their Windows native libraries) was copied to a separate **private, ignored QA directory** on the same authorized Windows machine, without changing any production files, package versions, CUDA drivers, services or OS settings.

Actual completed snapshot on Chris:

- 27,966 regular source files and exactly 5,086,619,721 bytes (around 4.74GiB).
- Existing pinned requirements manifest unchanged, all 34 requirements match the installed distribution versions.
- A complete SHA-256 digest was calculated for EACH source file and its copy and all 27,966 comparisons passed. No reparse points/symlinks or flagged private config filenames were in the venv preflight inventory. A large private SHA manifest holds relative filenames and hashes and is **not committed to Git**.
- At the time of snapshot, D: had around 573GiB free and the source to copy is about 4.74GiB. A disk-budget and source/type/size/file-count safety bound is enforced.
- Snapshot is stored at runtime/qa/g3/venv-recovery/production-py311-pillow101-complete-packages under the repo, ignored by Git. Per-file SHA manifest is next to it. These are real local files, not public GitHub artifacts.
- An ACTUAL Windows Python interpreter was started FROM THE COPIED venv, and verified sys.prefix/PIL library path are in the copied QA directory with no access to original production venv site packages. All 34 pinned distribution metadata versions were read and verified within the clone, not the source runtime. Pillow10.1 native backend successfully decoded the same three original SHA-pinned synthetic PNG/JPEG/WebP examples with identical expected original RGB hashes.
- Snapshot creation terminated with normal success; its private receipt and file manifest hash were recorded. Subsequent no-change verifier reruns are read-only and verify existing snapshot file hashes; they do not overwrite the original snapshot.

Private immutable data:
- runtime/qa/g3/venv-recovery/production-py311-pillow101-complete-packages-manifest.json (file names/sizes/per-file SHA; do not publish).
- runtime/qa/g3/g341-real-full-venv-backup.json (safe summary/clone readback).
- G3.40 private original rollback wheel remains separately at runtime/qa/g3/rollback-wheelhouse/Pillow-10.1.0-cp311-cp311-win_amd64.whl, exact official SHA 0f7c276c05a9767e877a0b4c5050c8bee6a6d960d7f0c11ebda6b99746068c2a.

## Independent full cloned-Python unit testing

Run BOTH actual cloned Python CPU suites (without G2 running or CUDA visible):

    $env:CUDA_VISIBLE_DEVICES='-1'
    $env:HF_HUB_OFFLINE='1'
    $env:TRANSFORMERS_OFFLINE='1'
    $env:L3D_ENABLE_TRIPOSR='0'
    & 'runtime\qa\g3\venv-recovery\production-py311-pillow101-complete-packages\Scripts\python.exe' -m unittest discover -s engines\quality -p 'test_*.py'
    & 'runtime\qa\g3\venv-recovery\production-py311-pillow101-complete-packages\Scripts\python.exe' -m unittest discover -s engines\triposr -p test_offline.py

The cloned venv uses Pillow10.1.0 as in production, not isolated shadow Pillow12.3. **Actual completed Chris cloned-venv results: 262/262 G3 quality tests PASS (55.06 sec) and 7/7 G2 offline tests PASS (1.14 sec); both exit code 0.** No AI weights or real GPU inference were run; all 269 tests were independently executed with the cloned interpreter, not inferred from matching files.

## Proof and safeguards

scripts/g3-41-private-full-venv-backup.py performs preflight, creates the SHA manifest, creates an owned staging directory, copies the venv without following symlinks, verifies EVERY source/copy file content SHA, then commits the snapshot to a stable private local path and verifies the cloned interpreter. A failure during staging cleans up only its owned staging directory and does not delete production. A preexisting private snapshot is never overwritten; a rerun verifies the private manifest and readback only.

scripts/g3-41-full-clone-runtime-smoke.py runs using cloned Python only, rejects any sys.prefix/library path pointing to production, checks the pinned requirements and all 34 distribution metadata locations, and validates original trusted-only image decoding. No GPU/model.

server/g341-full-venv-snapshot-contract.js is a pure fail-closed decision gate that explicitly refuses claims of restoring the whole OS, proving hardware-independent portability, approving a candidate production Pillow upgrade, native decoder sandbox attestation, G1 startup recovery or printer approval.

scripts/g3-41-assemble-private-full-venv-proof.mjs publishes a sanitized SHA-linked immutable public report docs/evidence/g3/g3-41-real-private-full-python-venv-snapshot-cpu-readback.json. It binds earlier G3.40 Pillow wheel/provenance, original unchanged G2 worker, pinned requirements, the PRIVATE whole-tree SHA manifest digest and CPU receipt and the exact JS/Python verifier sources, without exposing individual private filenames, usernames, local machine paths or customer assets. Six new adversarial Node tests check this contract, source lineage and privacy.

## Important limitations

This is a **real all-package virtualenv filesystem snapshot** and independently executable same-machine clone, NOT yet a validated full restore to a different Windows computer. pyvenv.cfg still depends on the separate base CPython3.11 installation (C: host base), while CUDA driver, operating system, native CUDA runtime, model weights and user/customer data are intentionally OUTSIDE this backup. Same-disk local QA backup will not protect against failure of the entire D drive. Copying venv binaries to another system with different drivers/Python may fail; that has NOT been proven.

The backup must not be placed into public GitHub. Any storage on a different drive/cloud with user data/credentials or permissions needs its own safe scope. Pillow10.1.0 remains the original production dependency and is NOT automatically made secure by backup. Security Issue #4 (native decoder OS containment/advisories), operational G1 4177 Issue #5 and manufacturing/print Issue #3 stay OPEN, with all GLBs DRAFT. No untrusted images, real model/CUDA jobs, Windows Task Scheduler/service/Defender/Firewall/UAC or printer actions performed.

## Next safe milestone

G3.42: perform a **second independent restore rehearsal** from the private full-venv backup into an owned disposable QA location, prove restored Python and 34 package versions, execute full pinned CPU suites there and CLEAN UP only the second disposable restore. That test would establish real same-machine all-package restore (still NOT cross-machine disaster recovery or native decoder isolation). Protect original backup and live production from any deletes/overwrites.
