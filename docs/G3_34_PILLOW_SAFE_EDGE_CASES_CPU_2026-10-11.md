# LOCAL3D G3.34 — original G3.6 safe edge-case parity under two pinned Pillow CPU lanes

2026-10-11 | v0.2.34-g3-pillow-safe-edge-cases-cpu-parity

## What was actually compared

G3.33 confirmed 12/12 identical raw RGB outputs between production Pillow 10.1.0 and the already-existing isolated Pillow 12.3.0 shadow overlay. G3.34 extends that narrow compatibility finding to **four additional original locally generated, SHA-pinned G3.6 test images**, with no new media sources, native parser fuzzing or customer input.

The four existing synthetic samples in the G3.6 ignored runtime shadow samples folder are:
- alpha.png: original small transparent PNG, 96x80, expected mid-gray alpha composition
- exif-rotation.jpg: original JPEG with EXIF orientation 6, expected output dimensions 80x96
- webp-alpha.webp: original transparent WebP, expected 96x80 RGB with mid-gray alpha handling
- corrupted.png: original harmless intentionally malformed short-PNG fragment, expected Image.open rejection

Each image is checked against an exact previously observed binary SHA256 and byte size. The associated old source generator script scripts/g3-6-pillow-shadow-check.py is validated to identify these four names. No private customer files, unknown uploads or arbitrary local file paths are accepted.

## Verified CPU results on authorized Windows Chris

scripts/g3-34-safe-edge-lane.py separately calls the real G2 worker prepare_image for all four existing original safe synthetic files with production Pillow10.1.0 and then with the already installed Pillow12.3.0 shadow overlay under process-local PYTHONPATH. Production venv is never modified.

- alpha PNG: accepted in both, identical raw RGB pixel SHA256, dimensions and mid-gray transparency handling.
- EXIF JPEG: accepted in both; 80x96 output orientation and identical raw RGB pixel SHA256.
- WebP alpha: accepted in both; identical raw RGB pixel SHA256/dimensions/transparency handling.
- corrupted PNG: rejected by Pillow in both, matching UnidentifiedImageError type, no local error details published.

**All 3 accepted samples are exact pixel-identical and the 1 deliberately invalid sample is rejected by both versions with the same error class.** This is CPU compatibility evidence on known safe images, not native decoder exploit mitigation or full TripoSR GPU compatibility.

The entire experiment runs locally without model weights, inference, GPU lease, printing, Windows Sandbox VM, new dependencies or network requests. Two immutable private lane receipts are saved under ignored runtime/qa/g3/g334-pillow-safe-edge-cases. Their exact hashes are referenced in source-linked public docs/evidence/g3/g3-34-pillow-edge-cases-cpu-parity.json, which contains only safe test IDs, SHAs and nonrelease assertions (no image buffers, absolute paths or private prompt/job IDs).

scripts/g3-34-assemble-safe-edge-proof.mjs refuses if prior immutable G3.33 public evidence, existing worker source hash, old G3.6 generator source SHA or per-lane results change. First report creation requires --write-public; later no-flag invocations replay read-only. Tests: tests/g334-pillow-trusted-edge-parity.test.js and engines/quality/test_g334_safe_pillow_edge_parity.py.

## Reproduce safely

From authorized Windows Chris LOCAL3D root, first check ignored existing G3.6 samples and wheel SHA. Run:

    runtime\engines\triposr\venv\Scripts\python.exe scripts\g3-34-safe-edge-lane.py --lane production

Use a process-local PYTHONPATH pointing to existing runtime/qa/g3/pillow-shadow/overlay plus repo root for separate --lane shadow. Always unset the variable after that child process. Never modify production Python or create a new model GPU job.

    node scripts/g3-34-assemble-safe-edge-proof.mjs
    node --test tests/g334-pillow-trusted-edge-parity.test.js
    npm run test:all

## Still NOT approved

Pillow12.3.0 CPU preprocessing consistency does NOT show production dependency updates, actual CUDA/TripoSR model outputs, patch safety or protection against malicious/untrusted image parsing. Real native Pillow G2 worker remains on host, OS-backed guest/file/clipboard/egress containment absent. The current running G1 4177 was not restarted (new G3.28 source behavior is only verified in fresh local test instances), Office-related 4178 untouched, manual G2 4179 off. Security Issue #4 OPEN. Manufacturing Issue #3 OPEN: only two of nine old real AI images and no independently calibrated mm/minwall/material/slicer/printer QA; all GLBs DRAFT, printQualified=false, approvedForPrinter=false, fabricationAction=NONE.

Next G3.35 permitted offline CPU work: maintain a version-specific support matrix for safe known-good format/EXIF/alpha and error-lane preprocessor contracts; separately document required full G2 inference and native OS confinement release gates before any production dependency update. Do not activate GPU or Sandbox or alter Office/Windows security without explicit additional approvals.
