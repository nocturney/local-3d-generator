# LOCAL3D G3.37 — expanded Pillow12.3 shadow quality suite, explicit historical-version isolation

2026-10-11 | v0.2.37-g3-pillow-shadow-quality-classification

## Result: truthful distinction between an unfiltered failure and a useful compatibility pass

The **existing** Windows Python3.11 + Pillow12.3.0 isolated shadow overlay (without changing production Pillow10.1.0) was used to run the larger engines/quality Python unit test suite with CUDA explicitly invisible, G2 disabled and dependency network fetching disabled. The wheel was the already locally available SHA-locked Pillow12.3.0 binary; no installation or download.

**The ordinary full suite under Pillow12.3.0 did NOT pass.** It reported 246 tests run, 5 errors. Four errors are version-locked historical fixtures that intentionally demand Pillow10.1.0:
- Three G3.26 canonical safe-image and immutable historical proof tests.
- One G3.30 pinned canonical output fixture generator test.

A fifth error is the setUpClass for the G3.22 original production distribution metadata security-audit test class, which checks the exact installed production dependency inventory and expects Pillow10.1.0. That setup error prevented its 16 methods from individually running under the shadow environment. **Those historical tests are valid and must NOT be rewritten to pretend the old evidence came from the new Pillow version.** Their status in the original production Python suite remains independently PASS.

## Deliberately classified CPU-only shadow run

scripts/g3-37-shadow-pillow-quality-subset.py discovers all 262 named quality tests and requires an exact known identity count. It refuses to execute when Pillow is not the pinned 12.3.0 shadow import, when the original local wheel hash differs, GPU has not been disabled, or HF_HUB_OFFLINE and TRANSFORMERS_OFFLINE are not set. Its explicit exclusions are:

- 16 tests of test_g322_static_security.G322StaticSecurityTests, because class setup verifies pinned production distribution metadata.
- 3 historical Pillow10.1.0-only tests of test_g326_safe_image_boundary.G326SafeImageTests, with exact method IDs.
- 1 Pillow10.1.0-only immutable canonical conversion test in test_g330_trusted_exchange.G330TrustedCanonicalPython, with exact method ID.

The runner rejects any changes in the 262-test inventory, any deviation from the **20 explicitly named excluded historical methods**, and any unexpected failure in the 242 remaining tests.

**Observed actual Windows Chris outcome:** 242/242 selected Pillow12.3.0 shadow CPU quality tests PASS. The unfiltered suite still has the documented five deliberate historical-version errors. The correct statement is therefore **242 shadow-compatible passed + 20 historical-version-bound methods not run in shadow** — NOT "262/262 passed with Pillow12.3". The pinned production Pillow10.1.0 original 262/262 Python quality suite has been independently verified in G3.36. No GPU inference or model weights loaded.

A PowerShell wrapper scripts/g3-37-run-shadow-quality.ps1 sets/restores environment variables within the launched process only. It verifies the version before test execution and restores each prior environment value afterward. It does NOT edit machine/user environment, Windows services, Firewall/UAC, Office/4178, Windows Sandbox, Python virtualenv packages or printer settings.

## SHA-linked audit trail

The private CPU test result resides under ignored runtime/qa/g3/g337-shadow-quality-classification.json. A sanitized report docs/evidence/g3/g3-37-shadow-pillow-historical-test-isolation.json is assembled by scripts/g3-37-assemble-shadow-quality-proof.mjs. The report SHA-links:
- The immutable G3.36 public proof and G3.35 BLOCKED_SHADOW_ONLY compatibility gate.
- The exact observed shadow test inventory and curated pass result.
- The shadow quality runner and process-local PowerShell wrapper source.
- The three unchanged historical test modules containing the version-locked guards.
- The unchanged production G2 worker source.

Four additional Node test cases in tests/g337-shadow-pillow-quality-isolation.test.js assert full disclosure of the historical errors, correct 242+20 partition, proof source SHA and disabled production-release flags. Prior public G3.25–G3.36 proofs are not modified.

## Safe replay

On the verified authorized Windows Chris checkout:

    .\scripts\g3-37-run-shadow-quality.ps1
    node scripts/g3-37-assemble-shadow-quality-proof.mjs
    node --test tests/g337-shadow-pillow-quality-isolation.test.js
    npm run test:all

The wrapper executes only CPU tests in the existing shadow environment and does NOT run the full unfiltered historical suite. The report replay validates frozen previous results; it does not rerun Python or prove current host state.

## Still blocked

Do NOT install/activate Pillow12.3.0 into the real G2 Python venv based on these tests. The complete TripoSR Torch/Transformers model with this version has not been run on GPU; native parsing of hostile images lacks tested OS confinement; dependency security advisories have not been comprehensively remediated; no user-untrusted input approved. Original Pillow10.1.0 production tests still must pass to keep historical proofs valid. Production upgrade remains BLOCKED_SHADOW_ONLY, Security Issue #4 OPEN.

The Windows reboot missing persistent G1 4177 remains Issue #5 OPEN, although G3.36 proved current G1 source on disposable loopback port; independent Office 4178 must not be touched. Manufacturing Issue #3 OPEN, only 2/9 real historic model outputs, all DRAFT and physical printQualified=false.

Next G3.38: only CPU-safe developer work to document an explicit, isolated production-upgrade rollback strategy and a separate per-model GPU authorization gate; do not change the live venv, autostart Windows task or launch Sandbox without the specific operator scopes.
