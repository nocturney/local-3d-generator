# LOCAL3D G3.24 — deterministic public advisory triage queue and gated compatibility plan (OFFLINE)

2026-10-10 | v0.2.24-g3-static-security-review-queue-cpu

## Purpose and central distinction

G3.23 recovered all 104 current PUBLIC OSV package/version advisory records and their aliases, grouped into 64 groups by shared upstream identifiers. G3.22 had found real Pillow image parsing on the G2 worker input path and conditional pinned upstream Torch and Transformers dependency paths.

G3.24 provides an immutable SHA-linked **MANUAL REVIEW ORDER** over all 64 groups, based on which dependency is used by the app. It is **NOT** a CVSS/EPSS severity computation, a new OSV query, a per-advisory exploitability assertion, a security upgrade, a model quality result or authorization for untrusted image uploads.

| Manual review tier | Package exposure surface, observed in prior trusted source | Public alias-linked groups | Records accounted for |
| --- | --- | ---: | ---: |
| Review FIRST — real image decoder | Pillow 10.1.0 decodes source PNG/JPEG/WebP image bytes via Image.open and applies EXIF orientation | **16** | **32** |
| Review NEXT — pinned model/config loader | Transformers 4.35.0 is invoked in pinned ViT/TripoSR DINO config path, with source SHA/local override checks | **29** | **50** |
| Review NEXT — checkpoint/tensor runtime | Torch 2.5.1+cu121 loads SHA-pinned checkpoint in a local weights_only=True wrapper and runs native kernels | **19** | **22** |
| TOTAL | The 104 public version matches are not necessarily 104 distinct bugs | **64** | **104** |

These are WORKFLOW priorities only. All records have perAdvisoryTriggerReachability UNKNOWN_NEEDS_MANUAL_TRIAGE; all are kept open pending actual individual source/range/format analysis. A shared OSV/CVE/GHSA alias does not prove records share one bug, while different identifiers without shared aliases might still refer to the same root cause.

## Three officially verified illustrative examples — NOT a ranking for all 104

- **Pillow** — [GHSA-3f63-hfp8-52jq](https://github.com/advisories/GHSA-3f63-hfp8-52jq), Critical, publicly reported CVSS 9.3, first patched 10.2.0. Specific trigger: ImageMath.eval with an attacker-controlled environment parameter. G3.22 did NOT observe that named ImageMath API in the audited source; however, the app DOES use Pillow to decode input images, which can expose other decoder vulnerabilities. The advisory's severity does NOT imply this exact trigger is reachable through LOCAL3D.
- **Transformers** — [GHSA-29pf-2h5f-8g72](https://github.com/advisories/GHSA-29pf-2h5f-8g72), High, publicly reported CVSS 7.8, first patched 5.3.0. Specific trigger: malicious model config with internal attention-kernel loading via AutoModelForCausalLM.from_pretrained. G3.22 saw a different pinned ViTModel config path with a fixed local DINO config; did NOT directly observe the named AutoModel trigger. Major-version package upgrade may break TripoSR and needs isolated compatibility tests, not direct install.
- **Torch** — [GHSA-3749-ghw9-m3mg](https://github.com/advisories/GHSA-3749-ghw9-m3mg), Low, publicly reported CVSS 1.9, first patched 2.7.1-rc1. Named trigger: torch.mkldnn_max_pool2d local denial of service; that symbol was not directly observed by G3.22. Native kernel indirect dispatch cannot be ruled out, and public PyPI base-version OSV lookup is not a complete CUDA wheel configuration test.

The three GHSA severity numbers and published patch versions were corroborated via the specific OFFICIAL GitHub Advisory Database entries, and the fix events were also verified as present in the G3.23 full public OSV ID list. These three examples do NOT classify the remaining 101 returned public records, prove their exploitability, demonstrate they are safe, or establish that any current old environment was patched.

## The preparation plan is a GATE, not an upgrade

The new queue contains an eight-point prerequisite plan. It explicitly requires:
1. Preserve all prior SHA provenance for TripoSR model/weights/source/images and pinned 34-package runtime.
2. Individually match every high-priority advisory's affected API/file type/attack conditions, not just its package name or CVSS.
3. Perform a dependency-resolution and source-interface comparison for any candidate fixed Pillow/Transformers/Torch stack, including Python 3.11, Windows CUDA ABI and pinned ViT/tokenizer compatibility; do not secretly override requirements metadata.
4. Install candidate patched dependencies **only if separately approved**, into a new throwaway SHADOW runtime, never live G2.
5. Test isolated import, Pillow fixture preprocessing, DINO config/tokenizer CPU source path, read-only source hashes and all G1/G2 mock quality checks; do NOT claim real GPU inference acceptance.
6. Obtain separate OS security scope to design OS-enforced native image parser subprocess isolation and filesystem/network egress restrictions.
7. Obtain separate per-image approval/Office/GPU gates for ANY actual CUDA-inference compatibility test; no new GPU use was authorized by this static milestone.
8. Preserve physical print-quality release as an independent unknown-mm/thickness/material/printer qualification problem.

The current old pinned live Pillow 10.1.0, Transformers 4.35.0 and Torch 2.5.1+cu121 are NOT upgraded. No extra GPU/model/cloud/Office/printer/network/OS changes were made.

## Implementation and read-only reproduction

Added scripts/g3-24-advisory-priority-lib.mjs, a pure deterministic source verifier and review queue builder. It ingests ONLY previous sanitized public SHA evidence G3.22 and G3.23, validates every one of the 104 public advisory record IDs exactly once, validates each of 64 alias group memberships, and validates only the three selected official GHSA examples and first patched versions. It rejects any upstream report that claims an alert is resolved or accessible model/security gate opened without evidence. Output includes all 64 groups in stable priority and ID order, no private model/job/user inputs.

scripts/g3-24-assemble-security-review-queue.mjs emits and strict read-only replays the immutable sanitized source-linked report. It stores bytewise SHA-256 fingerprints of both parent evidence files. Creation was done only once with --write-public. Subsequent reads check for exact byte equivalence; no network call, Python package import, checkpoint load, GPU allocation or image parsing.

Public evidence: [G3.24 SHA-validated security-review queue](evidence/g3/g3-24-security-review-queue.json).

Run on authorized Chris Windows checkout, no flags for replay:

    node scripts/g3-24-assemble-security-review-queue.mjs
    node --test tests/g324-security-review-queue.test.js

New adversarial Node tests validate coverage (104 entries/64 groups), stable input-surface review-first priority (16 Pillow groups), GHSA official severity only for 3 examples, mutated proof/hypothetical false-safety status must fail CLOSED, private data exclusion and print/untrusted/GPU flags. Full preexisting Node/Python/Chrome regression must continue passing.

## Next exact blockers

GitHub Issue #4 stays OPEN. This triage ORDER does NOT change the production dependency risk, demonstrate actual exploit reachability, remove source-image native parser exposure, install a patched safe runtime or enforce Windows OS egress containment. G3.6 had tested Pillow 12.3.0 in a separate shadow CPU-only pilot; it did not establish full pinned model/CUDA compatibility and no package upgrade was made here.

Issue #3 stays OPEN: no verified physical mm calibration, wall-thickness QA, material stress, slicer constraints or real printer qualification. TripoSR still has just 2/9 prior real image-to-3D benchmark outputs, other seven need distinct explicit GPU approval.

Next G3.25: select exact Pillow decoder-specific public advisories/formats from the current full 104-ID list for individual CPU-only code-path reachability review, retaining explicit UNKNOWN where upstream per-record API/format details are not yet in the sanitized local dataset. An OS-enforced sandbox and actual patched dependency testing require separate authorization.
