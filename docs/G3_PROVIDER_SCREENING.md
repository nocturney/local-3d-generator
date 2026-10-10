# G3 second-engine research screen — 2026-10-10 (NO INSTALLATION)

**Goal:** find a second independently qualified *local image-to-3D* engine for use on Chris' RTX 4080 SUPER while honoring the existing Office GPU priority and truthful model licensing. This is documentation from official upstream repositories/model cards/licenses, **not** benchmarking or a decision to install. A user-specific commercial/license determination must be confirmed before any downloaded model is used in Velvet Factory.

## Preliminary shortlist

| Candidate | Officially stated approximate demand | Relevant license / dependency gate | Status |
|---|---|---|---|
| Stability AI Stable Fast 3D (SF3D) | ~6GB VRAM default per upstream, Windows experimental / VS2022 | Stability AI Community License, gated Hugging Face weights; commercial use requires registration and revenue check, notice/attribution | **RESEARCH / FIRST TECHNICAL ALTERNATIVE**, not installed |
| Stability AI SPAR3D | ~10.5GB VRAM, low-VRAM mode ~7GB slower; Windows experimental / VS2022 | Same Community License lane; gated weights and registration/commercial conditions; third-party runtime components need audit | **RESEARCH / GEOMETRY COMPARISON**, not installed |
| TencentARC InstantMesh | GPU demand not established from verified local measurement; published older Python/CUDA/xformers stack and Zero123++ multi-view preprocessing | Main repo and model card say Apache-2.0; *entire dependency/third-party weights chain*, including Zero123++, must be separately checked. Download logic is automatic upstream — prohibited in qualified offline worker | **RESEARCH / LICENSE CHAIN INCOMPLETE**, not installed |
| Tencent Hunyuan3D-2.1 Shape-only | ~10GB VRAM claimed for shape, 21GB texture, 29GB combined | Tencent Hunyuan 3D 2.1 Community License is NOT Apache/MIT. Territory excludes EU, UK and South Korea; outside-territory use/output forbidden. >1M monthly active users is a special licensing gate; redistribution/hosting obligations apply | **RESEARCH / NOT FIRST FOR SHARED 16GB GPU**, not installed |
| 3DTopia OpenLRM weights | Not qualified | Code Apache-2.0 BUT released pretrained weights CC BY-NC 4.0, noncommercial; other NVIDIA proprietary dependency notices | **NO COMMERCIAL BENCHMARK with provided weights**, no install |

## Why SF3D is the next conditional comparison

Stable Fast 3D is an incremental conceptual follow-up to TripoSR, with UV unwrapping and remeshing support in upstream documentation and a published ~6GB envelope. This makes it a better first **technical investigation** than allocating 10GB+ to Hunyuan Shape on a GPU already in shared use. However the license and gated model weights create a *separate approval/compliance check*; the source code being public does not mean an unrestricted MIT/Apache model. SPAR3D has a plausible separate point-aware reconstruction approach, but higher default VRAM and Windows experimental status. Neither is proven better by LOCAL3D benchmarks.

InstantMesh is attractive on main source/model licenses, but its upstream inference uses customized Zero123++ plus xformers/older CUDA stack, may auto-download checkpoints and depends on multiple third-party components. Until exact pinned checkpoints and their notices are audited, mark the full local pipeline **LICENSE_CHAIN_UNVERIFIED**, not automatically "commercially open".

Hunyuan Shape only could be profiled in a separate isolated environment after a resource and territorial-license review; 10GB published VRAM does not guarantee headroom with Windows GUI + Office + other GPU applications. Full texture pipeline published demand exceeds 16GB VRAM. Never install Hunyuan components or bypass P0 resource budgets based on these upstream numbers.

OpenLRM demonstrates why code-only licenses are insufficient: a permissive repository does not make NC weights commercially usable.

## Primary upstream sources checked

- SF3D source/requirements/~6GB / Windows experimental: https://github.com/Stability-AI/stable-fast-3d
- SPAR3D source/low-VRAM (~7GB) / Windows experimental: https://github.com/Stability-AI/stable-point-aware-3d
- Exact Stability AI Community License: https://github.com/Stability-AI/stable-point-aware-3d/blob/main/LICENSE.md (commercial registration; free below US$1M revenue subject to conditions, attribution, restricted outputs)
- InstantMesh official repo/license/dependencies: https://github.com/TencentARC/InstantMesh and model card https://huggingface.co/TencentARC/InstantMesh
- Tencent Hunyuan3D 2.1 requirements/demand: https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1
- Tencent 2.1 model license and territorial/MAU terms: https://huggingface.co/tencent/Hunyuan3D-2.1/blob/main/LICENSE
- OpenLRM code vs weights: https://github.com/3DTopia/OpenLRM/blob/main/README.md

## Required next gate — NOT GRANTED BY THIS RESEARCH

1. Check specific currently accessible commercial model terms, exact Hugging Face revision, gated access, all third-party weights/dependencies and redistribution obligations; obtain appropriate user/organization approval.
2. Pin source revision/SHA/config and prepare separate Python venv, without touching installed TripoSR/Office/global CUDA or fetching unapproved packages.
3. Live Office-model idle + GPU capacity audit. New GPU inference must be explicitly authorized per model/image and remain 1-at-a-time manual only.
4. Run the nine license-cleared G3 references, report actual peak VRAM/time/topology/silhouette; avoid quality/print claims based on upstream promotional results.

This is engineering source review, not legal advice. No model installations or GPU pilots were triggered.
