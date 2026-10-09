# Local 3D Engine Candidates - research-only screen (2026-10-09)

Source numbers below are upstream statements, NOT measurements on RTX 4080 SUPER or Mac Mini. No model weights or runtimes were installed by this study. Image-to-3D is separate from true text-to-3D.

| Engine | Upstream stated memory / platform | License / restriction lane | Local G2 relevance |
|---|---|---|---|
| TripoSR | ~6GB VRAM per single image; Python 3.8+, CUDA optional | MIT includes code and pretrained models per original README; check exact weight card | Preferred first LOW-RISK baseline. Does not prove best geometry or manufacturing suitability. |
| SPAR3D (Stability AI) | ~10.5GB VRAM; low-VRAM mode ~7GB at slower speed; Windows experimental | Stability AI Community License, commercial registration, revenue terms; confirm rights before use | Comparison candidate for quality if rights and Windows environment qualify. |
| Hunyuan3D 2.1 Shape | ~10GB shape-only; ~21GB paint-only; ~29GB together | Tencent Hunyuan Community License with territorial exclusions and commercial/distribution obligations | Potential shape-only benchmark on 16GB; full texture pipeline does not meet published 16GB VRAM envelope. |
| TripoSG | Exact VRAM not established in this scan | Main repo MIT, but NOTICE and nested components reference Tencent FlashVDM/community and third-party licenses; not simply MIT end-to-end | License and dependency audit before install; CANDIDATE only. |
| TRELLIS (original) | NVIDIA >=16GB; Linux tested, Windows not fully tested | Review exact source and checkpoint licenses separately | Low headroom on 16GB; deployment complexity. Research only. |
| TRELLIS.2 | NVIDIA >=24GB; Linux tested | Verify checkpoints, submodule licenses and platform | NOT a direct first-engine fit for present 16GB Windows host without independently validated optimization or another host. |

Primary sources:
- TripoSR: https://github.com/VAST-AI-Research/TripoSR
- SPAR3D and memory: https://github.com/Stability-AI/stable-point-aware-3d
- SPAR3D Community License: https://github.com/Stability-AI/stable-point-aware-3d/blob/main/LICENSE.md
- Hunyuan: https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1
- Hunyuan License: https://huggingface.co/tencent/Hunyuan3D-2.1/blob/main/LICENSE
- TripoSG: https://github.com/VAST-AI-Research/TripoSG ; NOTICE and triposg/LICENSE inside repo also matter
- TRELLIS: https://github.com/microsoft/TRELLIS
- TRELLIS.2: https://github.com/microsoft/TRELLIS.2

Decision: keep the G1 app engine-neutral. A first G2 pilot should qualify TripoSR in an isolated runtime because its upstream license and approximate memory envelope are comparatively straightforward. This is a test-order decision, NOT a best-quality declaration. Later engines must run the same golden inputs and quantitative/geometry checks. No automatic installation, paid provider, GPU allocation or Office P0 change is authorized by this file.
