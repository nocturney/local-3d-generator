# LOCAL3D G3.38 — actual pinned Python inventory + fail-closed Pillow migration/rollback preparation

2026-10-11 | v0.2.38-g3-python-rollback-readiness-cpu

## Why and current conclusion

The project has a pinned Windows Python3.11 production runtime with **34 installed distributions**; Pillow10.1.0, torch2.5.1+cu121 and transformers4.35.0 are part of the exact checked-in requirements lock. An isolated Pillow12.3.0 wheel already exists for CPU-only shadow testing. G3.35 showed exact RGB parity for 15 trusted originals and same invalid-image rejection in one more original. G3.37 extended the separate shadow quality tests: 242/242 applicable tests passed, while 20 historical production-version-specific tests remain explicitly excluded (the unfiltered 12.3 run failed with five version-lock errors).

**This is NOT a safe production upgrade by itself.** A reliable, offline-restorable baseline and independent CUDA/OS-isolation/security authorization gates remain missing.

## New actual read-only host assessment

scripts/g3-38-prod-rollback-readonly.py was executed ON authorized Windows Chris using only the **actual existing production Python3.11 interpreter**, but importing Python stdlib metadata, hashlib and tempfile instead of Pillow/GPU/Torch. It:
- Verifies the Python executable belongs to the expected production venv.
- SHA-checks the exact checked-in 34-package requirements manifest (sha256 887970cf973af2a619bfa6d09ab5a28bf6cd9cc3f24867eefaf35e73f72c21a7).
- Reads importlib.metadata versions of ALL 34 installed distributions. Result: 34/34 match; no installed Python package change.
- Checks the existing Pillow12.3.0 Windows cp311 shadow wheel SHA (8e95e1385e4998ae9694eeaa4730ba5457ff61185b3a55e2e7bea0880aef452a).
- Searches four intentionally limited potential LOCAL3D wheel-store locations. One actual directory exists; **no pinned Pillow10.1.0 rollback wheel was found in that checked folder**. This does NOT prove none exists elsewhere, for example a pip cache or another authorized machine.
- Runs TWO safe synthetic rollback controls on copies of the **requirements manifest only**, inside a disposable owned temporary directory in ignored runtime QA: stages a simulated Pillow version change then restores exact baseline SHA; tampering is detected, and a second restore recovers the baseline exact SHA. Both pass. This is NOT copying, reinstalling, uninstalling, backing up or restoring the real Python environment, package wheels, source weights or OS files.

Private deterministic recorded output: runtime/qa/g3/g338-production-readonly-rollback-rehearsal.json (gitignored). The report contains only generic observed package versions, SHA and count metadata, not host paths/private files.

## Safe release decision

server/g338-rollback-readiness-contract.js is pure and non-mutating. It refuses any forged installed version, altered wheel inventory, claims that a real upgrade/backup/rollback/VM/GPU occurred, synthetic SHA drift or historical shadow-release escalation.

scripts/g3-38-assemble-rollback-readiness.mjs builds the immutable, sanitized docs/evidence/g3/g3-38-python-upgrade-readiness-and-synthetic-rollback.json. It is SHA-linked to:
- G3.37 historical Pillow shadow test report and G3.35 explicit upgrade refusal.
- The unchanged production requirements lock and original G2 Python worker.
- The real private host assessment and synthetic dry-run receipt SHA.
- The source of the readonly inventory test and fail-closed JS contract.

The decision is **BLOCKED_SCOPE_LIMITED_READONLY_PREPARATION**. The nine formal checkpoints remain required, with no automatic Python changes.

## Proposed future approved migration procedure — NOT implemented or run

1. Operator explicitly scopes a maintenance window, change authority, safety acceptance criteria, backup destination and ownership. Do not reuse G1/4177 temporary fixture tests as proof of production AI readiness.
2. Identify secure, offline, license-compliant **full baseline Python environment recovery artifacts** including Pillow10.1.0 exact pinned wheel and all other required dependencies, compiled binaries and CUDA compatibility. Verify the complete package wheelhouse hashes, version count and offline restore ability. The current checked store does **NOT** satisfy this requirement.
3. Snapshot or clone the complete production virtual environment into an isolated, access-controlled new location, with process owner and locking strategy checked. Do not copy credentials, user data, model weights or ignored private outputs into public Git. Never mutate the live venv as a first experiment.
4. Rehearse actual Python package rollback on **that disposable full virtualenv clone**, not on a fake manifest. Verify exact installed distribution inventory and production Pillow10.1.0 on the restored clone, and re-run the full production 262 quality + seven G2 CPU unit tests.
5. Construct an entirely separate candidate environment with pinned Pillow12.3.0 plus compatible Torch/Transformers dependencies. Resolve all meaningful advisories, run the 242 shadow-applicable quality tests, explicitly account for the 20 historical-version-bound tests without editing their frozen evidence, and verify the 16 trusted synthetic/licensed preprocessing cases.
6. After specific GPU/Office coordination and separate per-model authorization, perform genuine licensed TripoSR model output regression in that candidate environment; compare output coverage, correctness, resource usage and failures. The existing shadow compatibility tests do NOT authorize CUDA.
7. Independently attest real OS-backed native Pillow decoding isolation, guest-to-host files/clipboard/network egress boundaries. Candidate Windows Sandbox XML parse success without actual VM is insufficient for untrusted media.
8. Obtain final explicit human approval before any production package switching and preserve a proven immediate rollback switch. Keep G2 disabled by default; verify unrelated 4178 and permanent G1 4177 availability independently.
9. After change, verify real G1/G2 health and regression, roll back on any failed checkpoint, record a source/version SHA and remain DRAFT until physical printer qualification.

## Safe commands on authorized Chris

    runtime\engines\triposr\venv\Scripts\python.exe scripts\g3-38-prod-rollback-readonly.py
    node scripts/g3-38-assemble-rollback-readiness.mjs
    node --test tests/g338-python-rollback-readiness.test.js
    npm run test:all

The Python command is **read-only with respect to production** and creates only an ignored CPU QA record and ephemeral manifest-only rehearsal. It must run with G2 opt-in disabled. The Node proof replay reads frozen evidence and does not re-assess host metadata.

## Unchanged limitations

Security #4 OPEN: no OS-native decoder sandbox or untrusted media clearance; Pillow10.1.0 security advisory review incomplete. Production deploy remains BLOCKED. G1/4177 Windows reboot recovery #5 OPEN; independent Office/4178 untouched, G2/4179 manual off. Physical manufacturing #3 OPEN, no mm/printed wall/material/slicer/printer qualification. No new CUDA model inference or packages, Windows features, Task Scheduler entries or GPU lock created during G3.38.

Next CPU-only G3.39 can provide an **explicit non-installed G1 Task Scheduler candidate** with read-only owner/ACL discovery and fail-closed config tests. It must NOT install a task or restart 4177/Office/Windows.
