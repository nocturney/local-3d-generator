# LOCAL3D G3.7 — Real 01-orb-alpha CPU-only winding derivative and exact surface proof

Date: 2026-10-10 | Release: v0.2.7-g3-orb-cpu-evidence

## Executive scope

An explicitly approved, single-use, real TripoSR CUDA run **already completed prior to G3.7**, yielding the first licensed project-original G3 test model, 01-orb-alpha. The earlier failed trial had hit a Windows Git dubious-ownership protection; the subsequent independently approved retry included the scoped Git-owner fix and genuinely reached the Python worker's completed stage.

**G3.7 itself uses CPU mesh inspection and Chrome SwiftShader software rendering ONLY. There was no new AI inference, cloud request, printer or slicer action.**

The already-created model and all original user job assets remain gitignored on Chris. Only sanitized SHA-linked engineering evidence and a local screenshot are committed; no job UUID, prompt, model binary or customer source photo is published.

## 1. The previously completed real model

- Fixture: 01-orb-alpha; input SHA256 9cb2f41de1b0239570068b055dc06bf941491559e11942b5bbc5757adb3d886a (project-original procedural source).
- Original real TripoSR GLB SHA256 f37a812bc4414ddee34bcb19d2e7535f25d219a3731c14f2dcc89c2c7ba030e2; **808,092 bytes, 20,178 vertices, 40,352 triangles**.
- Real engine inference was **12.59 seconds**, PyTorch CUDA peak reserved **2,058 MiB** on the Windows RTX 4080 SUPER. These metrics describe the PREVIOUSLY approved run, not G3.7. Shared NVIDIA GPU samples are not model-exclusive memory.
- CPU topology of the original: one watertight winding-consistent component, no indexed open/non-manifold edges; however signed volume is **−0.3691746 arbitrary units cubed**, so positive-volume validation fails and the result is DRAFT.
- The original-versus-known procedural source shape diagnostic reported symmetric normalized Chamfer-L1 **0.02209413** and F1 within 2%-of-AABB-diagonal **0.4836679**, using 1,536 sampled surface points, separate size normalization and best-of-eight post-hoc yaw search (180 degrees). This is NOT physical dimension accuracy or a product-quality percentage.

## 2. Copy-only winding correction

The already existing conservative CPU function in engines/quality/orientation_derivative.py first validated one closed component, internally consistent inward-facing triangles, no degenerates or nonmanifold edges and negative signed volume. It refused overwriting any files, then wrote a SEPARATE derivative in the private gitignored local runtime area:

    runtime/qa/g3/orb-01-positive-winding/orb-positive-winding.glb

- Derived SHA256 **ab2e5aeb55598624209eeca3e700abef93a69a52886c63ecad6a840e62d8d68f**, size 808,176 bytes.
- Independent topology QA: **+0.3691746** signed volume, one watertight connected mesh, 20,178 vertices, 40,352 triangles, no boundary/nonmanifold edges.
- The original previously inferred GLB was NOT modified. Its SHA256 was reconfirmed after derivation.

## 3. Independent exact-surface/color invariance verification

The new reusable, CPU-only engines/quality/winding_equivalence.py checks BOTH files independently of the derivative generator and fails closed unless:
1. Source and derivative SHA differ; both are one closed single-component GLB, with clean topology and opposite signed-volume signs but matching absolute volume.
2. Every vertex-coordinate array element is **bitwise identical**, in the same order, and each derivative triangle's indices are **exactly the three original face indices reversed**.
3. Triangle face normals are opposite, spatial bounding extents are equal, and original vertex RGBA colors are **byte-for-byte identical**. Unreviewed textured/face-color material formats are rejected instead of silently accepted.
4. The report is immutable and marks printQualified=false, approvedForPrinter=false and fabricationAction=NONE.

The genuine orb derivative passed all of these checks. Therefore the geometric surface was NOT altered. Its original-vs-GT surface Chamfer score **must NOT be described as improved** merely because winding changed; G3.7 did NOT rerun the model or claim a new AI reconstruction.

New CPU-only automated tests also validate the previous licensed chair derivative and synthetic vertex-colored meshes; changed colors, moved vertices, different triangle ordering, positive-volume input, incomplete/open mesh and report overwrites are rejected. These unit tests are portable and do not require private G3 orb files.

## 4. Three-way software visualization

A localhost-only temporary static server provided exactly three SHA-pinned GLBs (procedural 3D source, previous AI output, winding-only derivative) and bundled local Three.js modules to headless Chrome in **SwiftShader/ANGLE software-rendering** mode. All models are shown at an equivalent view angle and scale, with double-sided materials for fair SHAPE visualization rather than backface-culling bias.

- [Three-way screenshot](evidence/g3/orb-01-threeway-preview.png)
- [Browser evidence](evidence/g3/orb-01-threeway-browser-proof.json)

The second browser run passed: zero external browser requests, zero JavaScript errors and no neural inference. The initial viewer attempt was blocked by a missing static Three.js core import, and did not generate any misleading screenshot or inference; the viewer import map was then corrected privately.

**Visual review:** The reconstructed sphere-like surface has obvious visible ripples/roughness relative to the smooth original source sphere. The repaired output has the SAME surface and vertex colors as the unmodified original TripoSR prediction. Orientation correction is NOT smoothing.

## 5. Evidence records and private data boundary

Sanitized SHA-linked artifacts:
- orb-01-cpu-quality-milestone.json — aggregate source and model SHA, original/draft QA, existing shape diagnostic, signed-volume correction, exact geometry preservation. Contains NO private job ID or local file path.
- orb-01-winding-provenance.json — original/derived SHA256, triangle counts, before/after signed volumes.
- orb-01-positive-volume-qa.json — independently verified derivative topology, manufacture flags still false.
- orb-01-exact-winding-proof.json — strict position/color/face orientation equivalence.
- orb-01-threeway-preview.png — browser software-rendering screenshot, no customer data.
- orb-01-threeway-browser-proof.json — screenshot SHA and locality/zero-inference record.

These proofs are validated against the private source job and ignored derivative before publication by an immutable, fixed-case, CPU-only script:

    node scripts/g3-7-assemble-orb-evidence.mjs --job-id <already-completed-private-job-UUID>

This script never allocates CUDA, copies private GLBs into the repo or triggers printer output. It refuses to overwrite a changed report or accept mismatching model/source/derivative/file hashes.

At this milestone **private licensed-input coverage is 2/9 with observed real model output**: the original upstream chair plus the newly generated 01 orb; **seven** remain without model output. The checked-in public fixed legacy scorecard still reports its reviewed historical 1/9. Do not misinterpret that immutable baseline as the private live counter. The synthetic GT meshes are original geometry, never counted as AI output.

## 6. Still open — no manufacturing release

A positive signed volume and watertight indexed topology do NOT validate self-intersections, physical millimeter dimensions, minimum wall thickness, unsupported features, strength, slicer compatibility or machine/printer calibration. The rough surface seen in the screenshot is still present.

A future GPU trial for any remaining input requires **new explicit per-image user consent**, live Office idle/GPU/lease gates and no unattended queue. A second model needs independent license and weight qualification. OS-level network sandbox, dependency-vulnerability triage (Issue #4), multi-user authentication and data retention remain open.

No Office 2.0 P0, VelvetOS, Windows security policy, model weights or printer controls were changed.

**Result:** one actual already-generated G3 TripoSR model now has a separately stored, independently verified, exactly orientation-reversed DRAFT derivative with unchanged geometry/colors. It is NOT print-qualified.
