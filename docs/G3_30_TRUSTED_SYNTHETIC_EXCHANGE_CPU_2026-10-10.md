# LOCAL3D G3.30 — SHA-bound trusted-synthetic CPU ingress/egress and host-only receipt contract

2026-10-10 | v0.2.30-g3-trusted-synthetic-exchange-contract-cpu

## Why this milestone exists

G3.29 found that Windows Sandbox optional feature is Enabled and a hypervisor is present on Chris, but **no actual Sandbox VM, guest egress restriction or filesystem containment was tested**. Its separate static .wsb profile disables networking, GPU/clipboard/printer redirection and host mapped folders, so by design there is no actual image input or output channel. A future isolated native image decoder would need a narrowly defined data exchange, provenance, byte size and result contract BEFORE it can be connected to a safe OS boundary.

G3.30 implements and exercises **that data contract with pre-existing, SHA-locked public synthetic images only**. This is specifically not a working Windows Sandbox data transport, host/customer upload service, guest execution proof or G2 GPU capability.

## Exactly three trusted synthetic sources

Prior G3.27 original, deterministic Pillow-generated 64x64 PNG, JPEG and WebP test buffers are the ONLY accepted source identities, pinned by their format, declared MIME, complete binary SHA256 and structural PNG/JPEG/WebP preflight. All other bytes/formats, missing buffers, truncated files, altered MIME, additional trailers and even valid but non-pinned 64x64 images are rejected G330_FAIL_CLOSED.

For each original image, scripts/g3-30-build-trusted-canonical-fixtures.py uses production-pinned Pillow 10.1.0 **locally on the host, CPU ONLY, for these trusted fixtures** to load the in-memory 64x64 source, apply EXIF transpose, convert to RGB and re-encode a deterministic PNG. The three original/canonical pairs are stored only as safe synthetic fixture bytes in tests/fixtures/g330-trusted-canonical-output.json. The converted RGB PNG outputs have separately checked SHA256, canonical mode RGB, 64x64, max 64KiB bytes. The PNG source happens to match its canonical output SHA; JPEG and WebP output SHA values differ as expected.

DO NOT generalize this successful host PIL conversion to arbitrary user media: old Pillow 10.1.0 is still a native decoder without OS sandbox; the test proves only exact original trusted fixture conversions.

## CPU-only ingress and receipt (no actual VM)

server/g330-synthetic-boundary-protocol.js implements three narrowly scoped operations:
1. createSyntheticIngressCandidate: exact source SHA/MIME/byte-size/64x64 preflight against three fixed built-in trusted source identities. Binds G3.29 candidate .wsb profile SHA. Returns immutable candidate with transferImplemented=false, guestLaunched=false, hostFilesystemBoundaryVerified=false, releaseToG2Allowed=false.
2. createSyntheticHostOnlyReceipt: exact ingress keys and security flags, exact canonical RGB PNG SHA and size, immutable receipt identifying **HOST_CPU_TRUSTED_SYNTHETIC_ONLY_NOT_SANDBOX**, no guest session or OS egress/file attestation.
3. verifySyntheticHostOnlyExchange: matches a strictly allowlisted receipt and the exact source/output bytes; refuses any path, unknown field, false VM statement, forged security clearance or direct GPU approval. Output remains MATCHED_ONLY_ORIGINAL_SYNTHETIC_NOT_OS_ISOLATION and **releaseToRealGPUWorker=false**, printQualified=false.

No filesystem, process launch, subprocess, network, model or printing calls occur in this pure Node protocol. The module is **NOT imported by server/index.js or the actual G2 worker**. It is not a cryptographically attested guest receipt; the host simulator can make receipts by design and therefore no receipt currently authorizes external media.

## Reproducible immutable evidence and tests

- scripts/g3-30-build-trusted-canonical-fixtures.py: deterministic pinned host-PIL fixture generation; one-time --write-public; subsequent no-flag verifies exact bytes.
- engines/quality/test_g330_trusted_exchange.py: four Python tests, including pinned SHA/mode, determinism, adversarial source mutations, and false-approval constraints.
- server/g330-synthetic-boundary-protocol.js: pure JS candidate envelope/receipt verifier with fixed source and canonical hashes.
- tests/g330-synthetic-guest-exchange.test.js: six Node adversarial tests for source/data/identity, receipt tampering, fake guest isolation flags, format/size and production separation.
- scripts/g3-30-assemble-exchange-proof.mjs: exact parent G3.29 public report lineage and still-open security gates; compare output fixtures/Pillow source/candidate profile/production server & worker SHAs; create one-time immutable public proof with no customer data and no raw encoded image bytes.
- tests/g330-protocol-proof.test.js: three source/identity/immutability and security-assertion tests.
- docs/evidence/g3/g3-30-trusted-only-offline-exchange-not-sandbox.json: public SHA-linked immutable report, source hashes and three safe aggregate rows. No images, paths or job IDs.

Run from authorized Chris repo, G2 manual off:

    runtime\engines\triposr\venv\Scripts\python.exe scripts\g3-30-build-trusted-canonical-fixtures.py
    node scripts/g3-30-assemble-exchange-proof.mjs
    node --test tests/g330-synthetic-guest-exchange.test.js tests/g330-protocol-proof.test.js
    npm run test:all
    runtime\engines\triposr\venv\Scripts\python.exe -m unittest discover -s engines\quality -p "test_*.py"

## Fail-closed, unresolved security and fabrication gates

No OS-verified Windows Sandbox isolation, no guest launch/test, no actual guest media transfer, no outbound network test, no host filesystem barrier, no patched compatible Pillow/Transformers/Torch production stack, no G2 untrusted-user access and no printer production approval. G3.29's client launcher lookup remained unresolved at last read-only check; the feature Enabled flag alone does not certify launchability. G3.28 real API source validation remains a structural file syntax guard only, and current 4177 existing G1 process was not restarted. G2 4179 off, 4178 unchanged, no GPU inference/Office/cloud/OS changes. Issue #4 security OPEN, Issue #3 manufacturing OPEN; 2/9 historical real AI model outputs, all model GLBs DRAFT with unknown verified physical mm/wall/material/slicer/print properties, printQualified=false, approvedForPrinter=false, fabricationAction=NONE.

**Next G3.31** should examine a single trusted, locally generated, OS-isolated CPU guest smoke test *only after an explicit approval to launch a Windows Sandbox VM and a verified executable/interactive guest session route*. It must actually measure absence of egress and host clipboard/file exposure before considering real decoder staging. Never assume a static .wsb, a simulated receipt or a favorable host capability is such evidence. Do not apply Windows Firewall/Defender/UAC changes or enable any real GPU model run without their separate approvals.
