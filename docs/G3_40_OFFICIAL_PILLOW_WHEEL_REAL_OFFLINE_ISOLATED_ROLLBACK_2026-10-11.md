# LOCAL3D G3.40 — official Pillow 10.1 Windows rollback wheel + real isolated OFFLINE restore

2026-10-11 | v0.2.40-g3-real-isolated-pillow-rollback

## Meaningful change: the pinned ORIGINAL Pillow rollback wheel is now available

G3.38 had confirmed all 34 actual production Python3.11 packages matched the frozen requirements manifest, but there was no known local authenticated Pillow10.1.0 offline rollback installer. G3.40 ran two distinct checks and a real isolated rollback:

1. scripts/g3-40-readonly-pip-cache.py used Python stdlib to inspect **2,513** pip/http-v2 cached response bodies (about 9.36GiB) for a proper Windows cp311 Pillow10.1.0 WHEEL/METADATA archive. No match was found. It did not copy, delete or modify pip cache. Private inventory: runtime/qa/g3/g340-pip-cache-pillow-10-1-inventory.json.
2. scripts/g3-40-verified-official-pillow-wheel.py pinned the exact artifact to Pillow-10.1.0-cp311-cp311-win_amd64.whl published on PyPI. Official SHA256: 0f7c276c05a9767e877a0b4c5050c8bee6a6d960d7f0c11ebda6b99746068c2a; size 2,609,067 bytes. The script queries ONLY official https://pypi.org/pypi/Pillow/10.1.0/json and accepts an exact HTTPS files.pythonhosted.org/packages URL whose release JSON declares the pre-pinned hash/size, then downloads ONLY the specific wheel to a private gitignored LOCAL3D QA directory with bounded streaming+bytes, SHA verification, archive WHEEL CPython3.11 win_amd64 tag and package METADATA Name/Version confirmation. It never executes the downloaded content in production. Once stored, subsequent runs validate the LOCAL wheel offline with no new download. Private recovery asset is runtime/qa/g3/rollback-wheelhouse/Pillow-10.1.0-cp311-cp311-win_amd64.whl. This wheel is deliberately NOT committed to public GitHub, and is NOT a patched dependency: version10.1.0 still requires independent security remediation before processing untrusted media.

## Actual reinstall/rollback in an isolated CLEAN interpreter environment

scripts/g3-40-offline-isolated-pillow-rollback.py takes the existing real Windows Python3.11 executable but creates a new *independent empty* Python venv under a freshly generated disposable owned runtime/qa/g3 directory. It first checks that the clean venv contains NO Pillow and NO Torch. It verifies the production Python source and 34-package lock SHA, the original Pillow10.1 wheel SHA and the existing shadow Pillow12.3 wheel SHA.

Then it uses production **pip as a package manager tool only** with --no-index --no-deps --no-cache-dir --target to install the actual wheel content **exclusively into an isolated temporary package TARGET**. Three sequential native Pillow stages on the SAME owned temporary package target are verified by a separate CLEAN venv interpreter:

- STAGE 1 baseline: original Pillow10.1.0 wheel, import path proven to be under isolated target.
- STAGE 2 candidate: delete isolated temporary package target and install Pillow12.3.0 wheel offline into it; prove isolated import of exactly 12.3.0.
- STAGE 3 restore: delete isolated candidate target and install Pillow10.1.0 again from the new private original wheel, entirely OFFLINE.

At EACH stage scripts/g3-40-clean-isolated-pillow-check.py loads exactly the three SHA-locked, already original/generated 64x64 safe PNG, JPEG and WEBP source fixtures and performs real native format decode. It computes the SHA-256 of raw RGB pixel bytes; all three images match byte-for-byte across all three installed Pillow stages. Production Pillow10.1.0 import metadata and its original Image.py source SHA are checked before AND after, and are unchanged. The temporary venv and packages are removed afterward. Zero real model/GPU runs; no sandbox, Windows service, OS security adjustment, Office/4178 or printer action.

**IMPORTANT SCOPE:** This proves actual offline Pillow wheel package installation/restoration in an isolated clean test environment. It does NOT clone, restore or validate the full 34-package TripoSR production venv; it does NOT qualify Torch/Transformers CUDA model behavior under Pillow12.3.0 or OS native decoder security. Pillow production remains10.1.0 and security Issue #4/print Issue #3/G1 Issue #5 stay OPEN.

## Immutable SHA-linked proof

- Private ignored receipt: runtime/qa/g3/g340-pillow-isolated-offline-rollback.json (only versions, SHA, format IDs and positive/negative flags).
- Public source-linked proof: docs/evidence/g3/g3-40-verified-official-wheel-and-real-isolated-rollback.json.
- Source contract: server/g340-offline-wheel-rollback-contract.js, deliberately fail-closed if a real full venv recovery, production package change, VM/native decoder isolation, G2/GPU or print approval is falsely claimed.
- Evidence assembler: scripts/g3-40-assemble-real-isolated-pillow-proof.mjs, matches actual private original wheel bytes to official SHA, links earlier G3.39 boot source and G3.38 Python preflight, unchanged G2 worker and original synthetic source, the read-only cache inventory and test scripts.
- New Node tests: tests/g340-offline-isolated-pillow-rollback.test.js, 6 tests with adversarial altered version/format/hash/production-GPU assertions.

## Reproducible safe actions

    runtime\engines\triposr\venv\Scripts\python.exe scripts\g3-40-verified-official-pillow-wheel.py
    runtime\engines\triposr\venv\Scripts\python.exe scripts\g3-40-offline-isolated-pillow-rollback.py
    node scripts/g3-40-assemble-real-isolated-pillow-proof.mjs
    node --test tests/g340-offline-isolated-pillow-rollback.test.js
    npm run test:all

The first command will NOT download if the private original wheel already exists and its SHA matches. The second always operates in a new disposable isolated environment, offline during each wheel install. The third command merely replays the historical frozen proof; no network or Windows probing. Never copy the wheel into production Python or upgrade Pillow without separate authorization and independent complete TripoSR stack/OS native isolation/security gates.

## Next worthwhile milestone

G3.41: check feasibility of a locally private, SHA-audited actual FULL production venv clone (around 4.74GiB, 27,966 files) on the authorized host, using available D: free space and a single owned ignored destination. If safe, create a full independently executable snapshot and validate identical 34 installed metadata versions, model-disabled CPU tests and restore behavior IN THE CLONE ONLY. No live venv package mutation, OS startup, print or GPU. Clearly distinguish a filesystem clone from a complete model/weights and Windows OS disaster-recovery snapshot.
