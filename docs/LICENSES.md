# G0 License Manifest (2026-10-09)

This record is an engineering screening, not legal advice. One explicitly approved MIT checkpoint was downloaded into an isolated, gitignored G2 runtime and cryptographically verified; other candidate models remain uninstalled.

## Source inspiration
Upstream: https://github.com/ctate/3d-model-generator
Readme confirms the app is an interface around Hyper3D Rodin API, not a local inference implementation. No explicit root LICENSE was visible in the upstream review. Do NOT interpret public GitHub visibility as permission to fork, reuse source, or redistribute original assets. This project is a clean-room implementation using independent HTML, CSS, JavaScript and a deterministic GLB fixture. No upstream code is copied.

## Dependency in G1
Three.js: https://github.com/mrdoob/three.js
Dependency version pinned: 0.180.0, MIT License; preserve copyright/license on redistribution. Installed using npm scripts disabled. Keep package-lock.json and provenance in repo. Original GLB geometry generator and app code are independently authored for this project.

Playwright-core browser QA dependency: https://github.com/microsoft/playwright, Apache License 2.0; dev/test-only, Chrome browser installed separately. Preserve applicable third-party notices.

## G2 verified local candidate: TripoSR
Canonical source: https://github.com/VAST-AI-Research/TripoSR
Pinned source commit 107cefdc244c39106fa830359024f6a2f1c78871, MIT. Model source: https://huggingface.co/stabilityai/TripoSR at revision 5b521936b01fbe1890f6f9baed0254ab6351c04a, MIT, SHA256 verified against local model.ckpt bytes. DINO tokenizer configuration from facebook/dino-vitb16, Apache-2.0, pinned locally. Custom isolated CPU marching-cubes alternative uses scikit-image (BSD-3-Clause); original unpinned torchmcubes extension is not installed. Dependencies and sublicenses still require distribution-specific review before any public or commercial redistribution. Real local pilot passed, but app provider remains disabled. See docs/G2_RESULTS.md.

## Future candidate: Tencent Hunyuan3D 2.1
Canonical source: https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1
Model license: https://huggingface.co/tencent/Hunyuan3D-2.1/blob/main/LICENSE
Tencent Hunyuan 3D 2.1 Community License Agreement excludes EU, UK and South Korea from its defined Territory; contains acceptable-use, derivative, distribution and commercial terms (including a >1-million-MAU condition). Geography and the exact version matter. No blanket commercial permission is presumed. No weights installed and no integration approved.

## Other research candidates
TripoSG, SPAR3D, Pixal3D, TRELLIS and others: unreviewed for this product. Preserve registry as CANDIDATE/RESEARCH, no implicit source/weights rights or hardware feasibility.

## Cloud providers
Hyper3D Rodin, Meshy and Tripo cloud services are explicitly NOT silent fallbacks; any future use requires separate approval, commercial/territorial rights, API key protection and cost controls.

## This repository
Private G1/G2 engineering project; no public redistribution license has been selected. Avoid copying 3rd-party branding, textures, web code, downloaded models or sample art without explicit review. Separate licenses of model source, weights, datasets, runtime packages and generated output must each be checked.
