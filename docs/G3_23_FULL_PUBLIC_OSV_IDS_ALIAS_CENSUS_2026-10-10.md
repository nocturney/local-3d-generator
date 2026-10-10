# LOCAL3D G3.23 — full public OSV version-ID inventory and alias cross-reference census

2026-10-10 | v0.2.23-g3-full-osv-alias-census-public

## Why and precise scope

G3.22 found that the original 104 OSV public version matches from G3.5 had only 36 saved advisory IDs: the earlier report cut each library's list after its first 12 IDs and omitted the other 68 from persistent evidence.

G3.23 conducted ONE explicit, privacy-bounded **PUBLIC-ONLY** fresh OSV.dev query on three known PyPI name/version pairs:
- Pillow 10.1.0
- Transformers 4.35.0
- torch 2.5.1 (base public version for existing 2.5.1+cu121 CUDA wheel)

Only those package names and versions were sent to https://api.osv.dev/v1/query. No source, customer files, images, GLB models, checkpoint weights, OS/machine data, tokens or credentials were transmitted. No packages were downloaded/installed/upgraded; no G2 engine, GPU inference, printer, Windows firewall/egress, Office or unrelated 4178 changes.

The fresh public OSV response was recorded at **2026-10-10T17:02:01.923Z**. This is point-in-time public metadata; a new future advisory or withdrawn/re-aliased record can change the result. Do not claim indefinitely current audit status.

## New public data and findings

| Frozen dependency queried | Historical OSV version matches | Fresh full public records | Old 12 sample IDs present in fresh query |
| --- | ---: | ---: | ---: |
| Pillow 10.1.0 | 32 | **32** | 12/12 |
| Transformers 4.35.0 | 50 | **50** | 12/12 |
| PyTorch public 2.5.1 | 22 | **22** | 12/12 |
| **Total** | **104** | **104** | **36/36** |

The newly retrieved public source preserves all 104 returned record IDs, their public aliases and any fixed-version range events the OSV API returned (90 of 104 records include a fixed-version event; 14 did not). These fields are historical upstream advisory metadata, not tests of a real fixed/compatible Windows/CUDA installation. A missing fixed-version event is UNKNOWN, not proof of no remedy; a fixed-version event does NOT mean the current old venv was upgraded.

Using a conservative union of any records sharing one explicit OSV/GHSA/CVE/PYSEC or other public alias identifier, the **104 returned records form 64 alias-connected GROUPS**. This is useful to avoid treating aliases as automatically independent reports. However, **64 is NOT independently established to be the number of distinct flaws or exploitable LOCAL3D vulnerabilities**. Distinct related bugs might share a generic upstream alias or separate records for the same root bug might lack an alias; only a domain-specific assessment can settle identity.

The 36 historic sampled identifiers were independently matched in the fresh response for the identical three public versions. The other 68 current full-response records are now concretely listed, but the 68 UNSAVED G3.5 historical IDs cannot be reconstructed with certainty: we have no persisted old list to compare, despite matching the current total and all 36 old examples. Keep this distinction explicit.

## Implementation / reproduction

New, explicitly invoked research code:
- scripts/g3-23-fetch-public-osv-full.mjs: checks original G3.22 sanitized proof, posts only three public version queries to the exact OSV endpoint with timeouts and response size caps. Serializes ONLY validated public ID/alias/fixed-event information, strips arbitrary returned descriptions/code/content, and writes one immutable source JSON under gitignored runtime/qa/g3/osv-full-g323/full-public-osv-query.json. It REFUSES overwriting existing source or running as part of app startup/tests. This is the ONLY new code path with public internet usage, and it is never automatic.
- scripts/g3-23-osv-census-lib.mjs: pure offline strict schema validator and public alias-linked ID grouping, deliberately never reaching a vulnerable-patched conclusion.
- scripts/g3-23-assemble-osv-full.mjs: separate **OFFLINE** SHA-validated public assembly. Verifies source raw JSON SHA256, G3.22 public proof SHA256, original G3.5 public snapshot SHA256, pinned package name/version/count, all historic 36 sample IDs in the new list and limits/flags; reports identifier groups, fixed-event metadata and static UNKNOWN risk flags. First proof creation uses --write-public; without flags immutable proof byte-for-byte comparison is read-only.

Public sanitized four-file historical provenance is linked to:
[G3.23 full OSV public ID and alias census](evidence/g3/g3-23-full-public-osv-id-census.json)

This file includes all 104 public IDs and alias group data; the gitignored local public-only source response has a cryptographic SHA in the published report. It contains no private filenames, job UUIDs, credentials, source models or device paths.

Reproduce the immutable sanitized proof (OFFLINE) on authorized Chris checkout:

    node scripts/g3-23-assemble-osv-full.mjs

A separate explicit future public OSV query may be run only if re-screening is desired. The one-time fetch script deliberately REFUSES overwriting previous fetched evidence; preserve old evidence and create a new versioned screen for future dates.

## Tests and security limits

New Node regression tests verify three public queries and SHA chain, exact 104 record data and 36 historical sample IDs, cross-package alias union on a synthetic adversarial positive case, expected failure on forged advisory/patch statuses, invalid/duplicate IDs and query-version mismatch, no private data in public report and no claim of security or manufacturing approval. App and prior CPU/G1/G2 mocked Chrome suites must pass unchanged.

During the first full v0.2.23 regression, four older G2 HTTP tests failed because the ephemeral OS-assigned port picked by server.listen(0) was a URL "bad port" for Node WHATWG fetch. This exposed a preexisting test-fixture nondeterminism unrelated to the OSV code, not a G2 GPU/inference failure. It was fixed ONLY in the test suite: tests/safe-loopback-fixture.mjs allocates a loopback address with a bounded explicit nonprivileged port range 20000..29999 and retries EADDRINUSE/EACCES. tests/api.test.js, g2-adapter.test.js, multi-instance-gpu.test.js and storage-admission.test.js use it; tests/safe-loopback-fixture.test.js checks a successful loopback HTTP fetch, occupied-port retry and unsafe-port refusal. The focused previously failing cases + helper tests passed 19/19 and the subsequent full Node/Chrome regression passed. NO OS firewall, kernel networking, server listener or production service port changed.

**Issue #4 remains OPEN.** Full ID availability does NOT establish actual reachable package APIs, sample-specific mitigation, exploitability, priority/severity, OS-level parser isolation or compatibility with newer safe package releases. G3.22 found that Pillow directly processes source images; it is still a high-priority native-input exposure even if one ImageMath.eval API trigger is absent in direct source. Transformers/PyTorch remain pinned old versions with conditional package/native exposure requiring further expert triage. The previous Pillow 12.3.0 candidate is shadow-only, not a production upgrade or CUDA model compatibility proof.

Follow-up should select high/critical entries among these alias-connected groups with actual affected call-path triggers and remediation versions and test only OFFLINE isolated package candidates, not modify the operational venv or Windows security until explicitly authorized.

Manufacturing Issue #3 remains OPEN; original GLBs are DRAFT and neither physical mm-scale, actual min wall thickness, material nor printer QA is qualified. 2/9 real AI fixture outputs exist; seven unrun model inferences need explicit per-image GPU authorization.
