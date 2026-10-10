# LOCAL3D G3.28 — integrated bounded structural image admission and immutable historical replay

2026-10-10 | v0.2.28-g3-integrated-image-container-admission-cpu

## Summary

G3.26 observed that old G1 DEMO HTTP admission accepted short PNG/JPEG/WebP file signatures even when the file was incomplete. G3.27 implemented but did not integrate a strict zero-dependency image container syntax contract. **G3.28 integrates that contract in server/index.js for BOTH G1 demo and MANUAL G2 image jobs**, before any job ID, persistence, shared GPU lease, storage admission or worker launch.

At the real localhost HTTP API, truncated or corrupted PNG/JPEG/WebP images matching only their initial signatures now receive HTTP 422 BAD_IMAGE_STRUCTURE. Deliberate MIME mismatch and unsupported signatures retain HTTP 422 BAD_IMAGE. G2 manual image jobs also require the original per-image explicit GPU consent and the preflight 64x64 minimum; G1 demo permits structurally valid images with a side as small as 1. No model/GPU inference was performed in this milestone.

### Bounded structural checks (no native decode)

- PNG: all chunks/CRC checked, valid IHDR/IDAT/IEND order and termination, color/bit-depth/size constraints. No IDAT zlib decompression.
- JPEG: SOI, finite marker/segment lengths, SOF dimensions, SOS scans and exact EOI end. No full Huffman decoding.
- WebP: RIFF size, payload chunk framing, VP8/VP8L/VP8X dimensions, no animated WebP.
- <=8 MiB, <=16 million pixels and <=16,384 per side; strict MIME exactly matching detected type; bounded iteration. This is a *conservative format syntax check*, not full content validation, a Pillow exploitability audit or an OS-enforced isolation sandbox. Some unusual legal inputs may be rejected by policy.

### Runtime consequences and observed QA

Three original 64x64 PNG/JPEG/WebP synthetic generated images were accepted by the real G1 fixture-only API. Incomplete synthetic prefixes, half-buffers and tail-truncated variants were all rejected BEFORE a G1 job existed. A separate G2 MANUAL **mock-only** endpoint test rejected truncated images and confirmed that its mock adapter was never invoked; fresh GPU consent remains mandatory. All G1/G2 browser suites used mock/fixture paths, no real model.

Earlier tests contained two different minimal 1x1 PNG example constants with **invalid IDAT CRCs**. These were replaced ONLY in tests by identical, original, synthetic 64x64 Pillow 10.1.0 PNG bytes already recorded in the G3.27 SHA-locked trusted fixture dataset; the production GPU worker, prior source images and historical evidence remain unchanged. Actual existing 19 tracked public/licensed project input image files were checked by the new structural parser on CPU: 19 accepted, 0 structural rejects; raw bytes were not published.

### Preserving exact G3.25 / G3.26 / G3.27 history

The original, immutable public JSON proof files are NOT edited. Their original server/index.js fingerprint was computed over Windows CRLF worktree bytes (SHA256 716a9798a65965d3ac43ba37edd73dab6bdfe6a5412be11ccb84f917acd13646). Git stores LF blobs, so a new read-only pinned helper reconstructs the exact historical CRLF bytes from fixed ancestor commit 6a40a6d70d123642c53167a36655b4f24d049c9c:server/index.js and checks the old SHA. The G3.25/G3.26/G3.27 no-flag proof replayers and associated regression tests now validate their historical code rather than lying about the changed contemporary server. This requires an available local Git history including the pinned commit; it does not fetch from the internet, modify Git settings or re-stamp reports.

The NEW G3.28 public report separately records the new server source SHA, exact old G3.25/G3.26/G3.27 proof byte SHAs, preflight source SHA, current unchanged G2 worker SHA and security/print nonrelease gates. All source byte identities are verified from the current authorized Chris checkout. Re-running G3.25/G3.26/G3.27 proofs still passes byte-for-byte with their original report outputs.

## Files and safe reproduction

- server/index.js imports and invokes server/image-structure-preflight.js before job creation.
- scripts/g3-28-historical-server-source.mjs retains historical source replay without modifying historical JSON.
- scripts/g3-25-assemble-pillow-format-review.mjs, scripts/g3-26-safe-image-boundary-proof.py and scripts/g3-27-assemble-structure-proof.mjs use the pinned source for historical replay.
- tests/g328-api-image-preflight.test.js: actual G1 HTTP and G2 MOCK-only acceptance/rejection/consent.
- tests/g328-integration-proof.test.js: current/new versus immutable/historical SHA lineage, no private media or false safety authorization.
- docs/evidence/g3/g3-28-integrated-structural-image-admission.json: public sanitized SHA-linked proof.

On Chris from LOCAL3D root (CPU):

    node scripts/g3-28-assemble-integration-proof.mjs
    node --test tests/g328-api-image-preflight.test.js tests/g328-integration-proof.test.js
    node scripts/g3-25-assemble-pillow-format-review.mjs
    runtime\engines\triposr\venv\Scripts\python.exe scripts\g3-26-safe-image-boundary-proof.py
    node scripts/g3-27-assemble-structure-proof.mjs
    npm run test:all
    runtime\engines\triposr\venv\Scripts\python.exe -m unittest discover -s engines\triposr -p test_offline.py
    runtime\engines\triposr\venv\Scripts\python.exe -m unittest discover -s engines\quality -p "test_*.py"

The pre-existing G1 service on 127.0.0.1:4177 was **NOT restarted** as part of this release. The new guard is verified against newly constructed local test instances from this checkout, and will affect the normal service only after a separately coordinated restart. The 4178 separate Office-related service is unchanged. Manual G2 4179 remains off and no TripoSR workers or GPU inference were started.

## Remaining security/manufacturing gates

Issue #4 stays OPEN: the old pinned Pillow 10.1.0 native decoders and other Python dependencies still have unresolved version-matched GHSA records; no proven native parser sandbox, filesystem confinement, OS-enforced network egress, full bitstream semantics, safe arbitrary external customer uploads or supported patched GPU stack yet. Stricter structural validation alone does NOT make untrusted images safe.

Issue #3 stays OPEN: 2/9 historical real model outputs, seven new GPU inferences require explicitly scoped per-run permission, no physical mm calibration, real minimum wall-thickness/material/slicer/printer QA. All GLBs DRAFT, printQualified=false, approvedForPrinter=false, fabricationAction=NONE; zero printer/Office/OS security/weights/cloud actions.

Suggested next G3.29: architecture and CPU-only restricted parser subprocess/sandbox design with explicit OS-gate prerequisites; additionally use known-good static format samples for compatibility envelope before any manual G2 restart or new image inference. Do not change Windows Firewall/UAC/Defender or install model packages without separate authorization.
