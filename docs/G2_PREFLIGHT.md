# G2: real local inference qualification (READ-ONLY, 2026-10-09)

**Status: research and preflight only / BLOCKED from running any model.** The G1 demo is not inference. The script scripts/g2-preflight.mjs performs local system checks only; it does not download source, dependencies, or weight files, does not import torch/allocate CUDA, and never calls a cloud model provider.

## Exact upstream snapshot

- TripoSR upstream: https://github.com/VAST-AI-Research/TripoSR at commit 107cefdc244c39106fa830359024f6a2f1c78871, repository MIT. Upstream explicitly says source and pretrained weights are MIT.
- Stability AI model card: https://huggingface.co/stabilityai/TripoSR, MIT; pinned model revision 5b521936b01fbe1890f6f9baed0254ab6351c04a.
- Exact weight: model.ckpt, 1,677,246,742 bytes, claimed LFS SHA256 429e2c6b22a0923967459de24d67f05962b235f79cde6b032aa7ed2ffcd970ee. **This is an upstream metadata digest, not a digest verified against a locally downloaded file.** No weights downloaded.
- Output from upstream run.py supports --model-save-format glb (the default is obj). CLI accepts single input image(s) and --pretrained-model-name-or-path local path, --output-dir, --device and --no-remove-bg. Do not claim native text-to-3D.
- Upstream says ~6GB VRAM for one image. This is not a local benchmark or guarantee; the cited sub-second claim is for A100 hardware.

See TRIPOSR_SOURCE_LOCK.json for machine-readable pin.

## Dependencies and threats

Upstream requirements.txt includes omegaconf 2.3.0, Pillow 10.1.0, einops 0.7.0, transformers 4.35.0, trimesh 4.0.5, xatlas 0.0.9, moderngl 5.10.0, rembg, imageio[ffmpeg], gradio, huggingface-hub, and a NON-PINNED git+https://github.com/tatsy/torchmcubes.git dependency. This is NOT a fully locked environment. Runtime isolation, exact transitives, supply chain, binary wheel availability, native build/Windows support and code+weights+dependencies rights must be audited before install.

The source's troubleshooting section warns torchmcubes may compile without CUDA support if toolkit and torch major CUDA versions mismatch. Windows host has nvcc CUDA 13.2, but global Python 3.11 has no torch package. PyTorch CUDA build/version compatibility is UNVERIFIED, not automatically valid.

Preprocessing: source imports rembg and by default initializes a background-removal session which could fetch segmentation weights. A strictly offline first G2 pilot should use **already-approved / local gray-background fixtures with --no-remove-bg**, HF_HUB_OFFLINE=1 and predownloaded checksum-verified weights; any background remover must itself be approved/locked. Reject URLs, refuse network fallback.

## Windows host observed snapshot

- NVIDIA GeForce RTX 4080 SUPER 16,376 MiB reported, ~4,639 MiB in use and ~11,407 MiB free; 39-40% GPU utilization when sampled.
- Physical host currently has active workloads; free VRAM alone does NOT demonstrate nonconflicting capacity.
- D: storage ample; GPU-only pilot would still need a separate authorized time window and a bounded memory/timeout budget.
- Mac Mini with 16GB unified memory is NOT equivalent to 16GB discrete VRAM; no Mac TripoSR GPU trial has been run.

## Read-only preflight

From project root, use:
    node scripts/g2-preflight.mjs --out runtime/qa/g2-preflight.json

Optional explicit local paths, if and only if later separately installed/approved:
- LOCAL3D_TRIPOSR_SOURCE: git checkout directory, must match exact commit and be clean.
- LOCAL3D_TRIPOSR_PYTHON: isolated Python interpreter, checked for presence only.
- LOCAL3D_TRIPOSR_WEIGHTS: local directory containing model.ckpt.
- --verify-weights: stream local 1.677GB checkpoint through SHA256; without this, correct filesize is not verification.

The preflight report remains BLOCKED even if a hypothetical GPU idle snapshot passes because software license, installation, exclusive resource allocation and user authorization are separate gates.

## Conditions for first real G2

1. Confirm licensing and native dependency builds through non-running review. Pin every dependency and weight checksum. Strict clean environment and rollback.
2. Obtain explicit permission for external model downloads and isolated Python/CUDA installation. Secure a genuine non-overlapping Windows GPU reservation with Office P0.
3. Download only approved source/weights into an isolated location, verify SHA256, no credential or local customer data sent.
4. Build subprocess adapter with bounds/cancellation/restart. Start with a licensed fixture image and local --no-remove-bg path; disable all network fallback. Require actual source-derived GLB proof and mesh-manifest provenance; DRAFT only.
5. Benchmark real output quality and VRAM/time. Compare SPAR3D/Hunyuan or newer options only under their respective terms and headroom.

Do not modify P0, #613, Fabrication Router, slicer/printer profiles, shared background task scheduler or physical hardware. No automatic release to print.
