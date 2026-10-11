# LOCAL3D G3.33 — original/trusted CPU Pillow 10.1.0 vs existing 12.3.0 shadow comparison

2026-10-11 | v0.2.33-g3-pillow-12-3-shadow-cpu-compatibility

## Objective

Reduce uncertainty in pinned Pillow dependency upgrade compatibility WITHOUT changing the G2 production virtual environment, installing a new package, launching any Windows Sandbox VM, GPU, model or customer input.

This milestone compares image preprocessing executed under the actual live Pillow 10.1.0 and the existing G3.6 Pillow 12.3.0 shadow overlay, each in a separate process-local Python import environment. The original G3.6 shadow wheel is already stored locally and SHA-pinned: 8e95e1385e4998ae9694eeaa4730ba5457ff61185b3a55e2e7bea0880aef452a. No download or installation happened.

## Real CPU-only comparison

scripts/g3-33-cpu-pillow-lane.py rechecks exact trusted SHA256 inputs and source rights on nine preexisting benchmark images: eight project-generated procedural renderings and the existing MIT-licensed TripoSR example chair. The script uses actual engines/triposr/worker.py prepare_image for those nine, without worker.main, model weights, Torch/CUDA or inference.

Three additional immutable original 64x64 synthetic PNG/JPEG/WebP buffers from G3.27 are decoded from memory and processed with EXIF transpose, mid-gray transparency compositing when needed, and RGB conversion, matching the worker's logic. Total: 12 trusted/allowed inputs. Each lane records strictly aggregate ID/source SHA, output dimensions, RGB raw byte SHA and alpha-composite indicator.

Observed on Chris:
- Pillow 10.1.0 production venv lane: 12 trusted inputs processed, CPU-only.
- Pillow 12.3.0 shadow overlay: 12 trusted inputs processed, CPU-only.
- ALL 12 inputs had identical dimensions, ALL 12 had identical **raw RGB pixel byte SHA256**, ALL 12 chose the same alpha compositing lane.
- Existing seven TripoSR G2 offline unit tests also passed with Pillow12.3.0 overlay using child-process PYTHONPATH only. This is still NOT GPU/CUDA/model compatibility and not proof of security fixes or OS confinement.

Both raw lane receipts live only in ignored runtime/qa/g3/g333-pillow-lanes; they are not added to Git. No raw images were copied into public proof JSON.

## Evidence chain and replay

scripts/g3-33-assemble-pillow-shadow-comparison.mjs verifies immutable previous G3.32 public proof SHA, source catalog SHA, original synthetic fixture set SHA, production Python worker SHA, both separately generated private lane receipt SHA, photo rights and exact output agreement. The immutable, sanitized docs/evidence/g3/g3-33-pillow-12-3-shadow-cpu-compatibility.json contains 12 public fixture IDs and matching booleans, no local machine paths or media bytes. First creation uses --write-public; later no-flag runs fail closed when any source identity or SHA changes.

tests/g333-pillow-shadow-compatibility.test.js and engines/quality/test_g333_shadow_lane_proof.py validate source lineage, raw output SHA agreement, rights, source order and strict non-release flags. Prior G3.25–G3.32 public evidence remains unchanged.

From authorized Chris checkout, CPU-only:

    runtime\engines\triposr\venv\Scripts\python.exe scripts\g3-33-cpu-pillow-lane.py --lane production

For SHADOW only, use process-local PYTHONPATH pointing at existing runtime/qa/g3/pillow-shadow/overlay plus repo root; run the same Python script with --lane shadow. Restore/unset the process-local variable after the command. Never change the production Python installation.

    node scripts/g3-33-assemble-pillow-shadow-comparison.mjs
    node --test tests/g333-pillow-shadow-compatibility.test.js
    npm run test:all

## What it does not establish

The native Pillow Image.open/EXIF decode on real user-supplied untrusted files still lacks OS confinement on the production host. A successful twelve-image CPU preprocessing comparison does not establish GPU TripoSR inference correctness, all third-party dependency compatibility (Transformers, Torch CUDA), full advisories remediation, malicious image decoder safety or arbitrary customer upload eligibility. The Windows Sandbox CLI is not observed in the remote Session 0 launcher audit; G3.32 XML is only a static candidate and neither guest has been started.

No source media, private photos, customer paths, model weights, packages or runtime config were modified. G1 running at 4177 retains previous unrestarted behavior, independent service 4178 untouched, G2 manual 4179 off, 0 new real inference. Security Issue #4 OPEN, fabrication #3 OPEN, all GLBs DRAFT with unknown physical mm/minimum wall/material/slicer and printQualified=false.

Suggested G3.34 (CPU only): isolated Pillow overlay compatibility of additional non-GPU image preprocessing paths (e.g. EXIF rotations, transparency, corrupted input) with same source SHA/rights and no OS/Office/printer changes. A full production Pillow upgrade and any real model GPU run require explicit review/approval.
