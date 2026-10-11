# LOCAL3D G3.35 — Pillow 10.1 vs 12.3 CPU compatibility matrix & fail-closed production-upgrade gate

2026-10-11 | v0.2.35-g3-pillow-cpu-compatibility-matrix

## Why this milestone matters

G3.33 proved byte-identical RGB results under the pinned production Pillow 10.1.0 and the existing local Pillow 12.3.0 shadow overlay for 12 allowed source images. G3.34 independently established the same outcome for three original alpha/EXIF edge images and matching rejection behavior on one original deliberately malformed short PNG. A reader must not mistake those narrow observations for full G2 model-stack compatibility, a patched native parser or approval to install Pillow 12.3.0 on the production interpreter.

G3.35 turns those immutable observations into a **machine-verifiable, source-SHA-linked compatibility matrix and explicit blocking decision**. It does not execute new native Pillow decoding, sandbox guests, models or GPU jobs.

## Matrix and observed evidence

- Baseline: original pinned production Pillow 10.1.0 versus already available isolated shadow Pillow 12.3.0.
- 8 software-rendered project-original G3 benchmark images: exact decoded RGB byte SHA match.
- 1 preexisting MIT-licensed upstream TripoSR chair example image: exact decoded RGB byte SHA match.
- 3 previously generated tiny PNG/JPEG/WebP test images: exact decoded RGB byte SHA match.
- 3 historically generated EXIF/transparent format examples: exact decoded RGB byte SHA match.
- 1 harmless intentionally malformed original PNG fragment: the two Pillow versions reject with the same error class.
- Total: 16 unique trusted/licensed known-case IDs; 15 matching positive CPU results + 1 matching expected rejection. All original evidence SHAs, source rights and result controls checked before the matrix is emitted.

## Implemented and reproducible

- server/g335-pillow-release-gate.js — zero-dependency strict public evidence parser, per-case allowlist and ordered source IDs, structural type checks and adversarial rejection of altered security/GPU/printing claims. Even a perfect CPU result explicitly returns productionUpgradeReadiness = BLOCKED_SHADOW_ONLY and seven concrete independent blockers.
- scripts/g3-35-assemble-pillow-upgrade-gate.mjs — hashes the historical G3.33 and G3.34 public proofs, licensed fixture manifest, synthetic input set, unchanged production G2 worker, all FOUR ignored private CPU lane records and the new evaluator source. Rejects mismatches, creates immutable public report only on first explicit --write-public run; all further invocations are read-only deterministic replays. Replay is **not a new live host examination**.
- tests/g335-pillow-release-gate.test.js — six focused Node tests including false release claims, corrupted sample identity, forged sample cases, version drift, source SHA lineage and privacy controls.
- docs/evidence/g3/g3-35-pillow-cpu-compatibility-and-upgrade-blockers.json — sanitized 16-row public matrix with source IDs/categories and true/false compatibility outcomes, without customer assets, source image bytes, OS credentials or raw images.
- npm run audit:g3:pillow-upgrade — convenient read-only gate replay.

Commands (after repository checkout is verified, no GPU):

    npm run audit:g3:pillow-upgrade
    node --test tests/g335-pillow-release-gate.test.js
    npm run test:all

Historical G3.25–G3.34 public proof bytes remain unchanged.

## Seven hard blockers to production deployment

1. No G2 full model CUDA output/accuracy/VRAM compatibility requalified with a Pillow12.3 shadow lane; the G2 unit tests are CPU tests and do not run weights.
2. No explicit production Pillow dependency upgrade/rollback approval or baseline.
3. No independent OS-backed confinement of native image parsing.
4. No real VM effective network egress, host filesystem and clipboard isolation measurements.
5. Dependency advisory patch/remediation and Torch/Transformers compatibility review remain incomplete.
6. No permission for untrusted customer image decoding.
7. No physically calibrated millimeter dimensions, wall thickness, material, slicer or print quality release.

The matrix is for **readiness decisions**, not a replacement for runtime isolation or approval. All outputs remain DRAFT, printQualified=false, approvedForPrinter=false and fabricationAction=NONE. Security Issue #4, physical print Issue #3, and G1/4177 operational Issue #5 remain OPEN.

## Current live service caveat

G1 loopback 4177 was found offline after Windows host restarted at 06:42:27 local time on 2026-10-11. This matrix does **not** prove the old 4177 server is back; only the fresh ephemeral QA tests exercise G3.28 structural admission. The independent Office-related port 4178 stays untouched; 4179 G2/manual off. Do not turn on either G2 or CUDA for this CPU test.

## Next useful work

G3.36: a **noninvasive loopback G1 recovery-readiness check** that identifies existing startup contracts and makes a deterministic one-shot, no-GPU fixture-only preflight with a clear human activation boundary. Verify against running and absent 4177/4178, but do not start persistent G1, install a service, set a Windows task, restart the machine, or alter the independently owned Office/4178 process.
