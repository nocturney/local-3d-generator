# LOCAL3D G3.22 — read-only static Python advisory/code-path triage

2026-10-10 | v0.2.22-g3-pinned-python-static-triage-cpu

**Only static/security evidence classification. No remediation, full reachability proof or untrusted-upload clearance.** No dependency installation, live vulnerability query, model inference, GPU, printer, Office/OS security configuration, or cloud processing is performed.

## Source provenance and gaps in the earlier OSV snapshot

The immutable G3.5 OSV.dev PyPI version-level query dated 2026-10-10T10:27:21Z recorded **104 package/version advisory matches** in the pinned 34-package Python runtime:
- Transformers 4.35.0: 50 matches.
- Pillow 10.1.0: 32 matches.
- Torch 2.5.1+cu121: 22 matches; queried against the public PyPI base version 2.5.1, not the separate CUDA build.
- Remaining 31 packages: zero matches **as of that old query**, not a current clean bill of health.

The G3.5 report kept only **12 actual advisory IDs per affected package**. Thus 36 sampled IDs survive, while **68 unmatched-detail advisory records are OMITTED** (38 Transformers, 20 Pillow, 10 torch). These 68 are UNKNOWN and cannot be triaged individually without a new public advisory inventory. Version matches are NOT 104 established exploitable app vulnerabilities, and advisory aliases could duplicate underlying weaknesses. No fresh all-IDs retrieval was undertaken here.

G3.22 verified frozen requirements SHA, original OSV JSON byte SHA, G3.6 shadow-Pillow proof SHA, installed Python distribution metadata **34/34 exact pinned versions**, and clean SHA-locked upstream TripoSR source commit using narrowly scoped read-only Git directory trust. It performed static AST inspection of **63 first-party Python sources plus 2 selected upstream TSR files**, and reports sanitized relative source call-sites only.

## Three advisory examples compared with real paths

| Public advisory | Advisory trigger and first patched version | What the application actually calls | Conservative classification |
| --- | --- | --- | --- |
| [Pillow GHSA-3f63-hfp8-52jq](https://github.com/advisories/GHSA-3f63-hfp8-52jq) | PIL.ImageMath.eval with unsafe environment parameter; 10.2.0 | Direct REAL image path: Image.open + ImageOps.exif_transpose; no literal ImageMath.eval call in reviewed source | This PARTICULAR API call was not directly observed, but native Pillow input parsing IS a real attack surface. Do not clear 32 advisories. |
| [Transformers GHSA-29pf-2h5f-8g72](https://github.com/advisories/GHSA-29pf-2h5f-8g72) | Untrusted config injecting attention-kernel download via AutoModelForCausalLM.from_pretrained; 5.3.0 | Pinned TSR uses ViTModel.config_class.from_pretrained from locally pinned DINO config; direct AutoModelForCausalLM call absent | Conditional direct trigger not observed. OTHER Transformers internals and 49+ advisories remain unreviewed. Offline env var and local config override are not OS egress controls. |
| [Torch GHSA-3749-ghw9-m3mg](https://github.com/advisories/GHSA-3749-ghw9-m3mg) | torch.mkldnn_max_pool2d local denial-of-service; 2.7.1-rc1 | Pinned TSR system invokes torch.load for old pinned checkpoint; worker wraps it with weights_only=True in try/finally; no literal mkldnn API call | No direct trigger observed; indirect/native kernel reachability unproven. OSV base-version matching does not validate CUDA wheel feature impacts. |

Descriptions and patch-version examples checked against their official GitHub advisories, but each is a sample only. The static scan is NOT a whole-program call graph and cannot resolve dependencies' internals, dynamic imports, tensor kernels or malicious library file/format code. No advisory was marked “not affected” or “fixed”.

## Security mechanisms observed, not certifications

- G2 is manual, loopback-only and requires per-image GPU consent. This limits routine exposure, but user-provided image bytes DO reach the Pillow decoder. The image parser lacks an independently verified OS-level filesystem/network sandbox.
- Worker checks SHA-locked source, config and weights before loading. Hub download for DINO config is redirected to locally pinned config with constrained repo/filename, and offline environment flags are set. This is application logic, not an OS network deny policy.
- Pinned tsr/system.py uses torch.load. Local worker sets a weights_only=True wrapper temporarily during TSR.from_pretrained and restores it in finally. This is a conditional narrow mitigation, not a guarantee that torch and Transformers are vulnerability-free.
- G3.6's Pillow 12.3.0 candidate was installed only in a SHADOW overlay. Its then-existing tests covered CPU image preprocessing and import-only compatibility, not full CUDA inference or all modern QA. Live pinned Pillow remains **10.1.0**; the production risk count remains untouched.

## New implementation, evidence and tests

New engines/quality/g322_dependency_reachability.py performs offline bounded AST source scans, verifies all 34 installed metadata versions WITHOUT importing torch/Pillow/Transformers, source-head cleanliness and original SHA proofs, and requires presence of crucial worker safety guards. Missing Image.open/exif path, checkpoint source validation, weights-only wrapper or pinned DINO config override fails CLOSED rather than claiming mitigation. Truncated/malformed OSV samples or a modified frozen manifest are refused.

New scripts/g3-22-security-static-proof.py generates and read-only replays an immutable sanitized public SHA evidence report. New test_g322_static_security.py adversarial tests check package drift, OSV count/ID tampering, syntactic source guard deletion, false security clearance, symlinks/oversized input and AST parsing. New Node tests check prior file SHA links, exact 104/36/68 split, the three sampled advisory scopes and public privacy.

Public report: [G3.22 previous OSV and static source proof](evidence/g3/g3-22-pinned-python-static-triage.json).

Run from Chris project root in the existing pinned CPU-only interpreter:

    runtime\engines\triposr\venv\Scripts\python.exe -m unittest discover -s engines\quality -p test_g322_static_security.py
    runtime\engines\triposr\venv\Scripts\python.exe scripts\g3-22-security-static-proof.py

The report requires no private model image or G2 job, makes no network query and contains no private path or UUID. It is historical and should be renewed if the source, pinned manifest or vulnerability database changes.

## Open gates and next actions

**Security Issue #4 remains OPEN.** Need exact full advisory IDs with aliases and per-advisory preconditions/fixed versions, then isolated compatible dependency changes and CPU/import acceptance followed only by separately authorized GPU acceptance. Need OS-backed filesystem and network/egress confinement and an explicit data-retention policy before untrusted/commercial rollout. Direct Pillow image decoding remains a high-priority concern.

G3.22 does not upgrade live PyTorch/Transformers/Pillow, does not approve untrusted inputs, and does not permit Windows firewall/UAC or GPU changes. Manufacturing Issue #3 remains OPEN; four historical GLBs DRAFT/unscaled/unqualified, only 2/9 original real AI models completed, seven new GPU runs require separate authorizations.

Next G3.23: full public advisory ID/alias enumeration as an explicit publicly sourced, version-pinned STATIC inventory (no source-code, customer-data or dependency changes), or bounded pre-upgrade conflict analysis in a separate shadow environment. Never infer 68 omitted IDs.
