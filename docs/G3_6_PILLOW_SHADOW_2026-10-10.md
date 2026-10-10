# LOCAL3D G3.6 — Pillow 12.3.0 shadow-compatibility screen

Date: 2026-10-10. Scope: isolated CPU-only research, **not** a production G2 model upgrade.

## Reason and original risk

G3.5 found 104 **untriaged PyPI version-level OSV advisory matches** in the frozen G2 engine: Transformers 4.35.0 (50), Pillow 10.1.0 (32), PyTorch 2.5.1+cu121 (22). Advisory matches are NOT proof of exploitable paths and may overlap or be conditional.

G3.6 examined a safer candidate **Pillow 12.3.0** without touching the existing working Python/CUDA venv. The candidate wheel was staged only under private gitignored runtime/qa/g3/pillow-shadow/wheels and installed using --target into a separate private shadow overlay, never the production venv.

## Official metadata and wheel integrity

- PyPI: https://pypi.org/pypi/Pillow/12.3.0/json. Python requirement >=3.10.
- Windows CPython3.11 amd64 wheel: pillow-12.3.0-cp311-cp311-win_amd64.whl
- PyPI SHA-256 and independently downloaded file SHA-256 both match:
  **8e95e1385e4998ae9694eeaa4730ba5457ff61185b3a55e2e7bea0880aef452a**
- Explicit public OSV.dev package/version queries at the checkpoint: old Pillow 10.1.0 **32** advisory matches; candidate 12.3.0 **0** advisory matches.
- These are PUBLIC version matching results, not exploitability analysis, a code-level fix validation, or a guarantee of zero bugs. The original G3.5 production risk totals are unchanged until the actual engine is patched.

Only public Pillow package/version identifiers were sent to OSV.dev and public package metadata retrieved from PyPI. No customer images, code, model weights, job IDs, private files, or credentials were sent.

## Tested under isolated Pillow 12.3.0 — NO CUDA inference

1. The real existing TripoSR worker's CPU prepare_image() routine opened and correctly processed **9/9** license/sha-locked benchmark sources: eight original project synthetic images and the existing licensed upstream MIT chair photo. Input file SHA checks before and after were identical.
2. Four synthetic image negative/functional tests PASS: RGBA alpha over neutral gray, JPEG EXIF rotate, alpha WebP and rejection of a corrupt PNG.
3. **All 5 G2 Python unit tests and 18 G3 quality Python unit tests (23/23)** passed using only process-local PYTHONPATH pointing to the shadow overlay and CUDA_VISIBLE_DEVICES=-1; variables were restored afterward.
4. Import-only test passed for pinned upstream TripoSR TSR system/tokenizer and existing Transformers 4.35.0/PyTorch 2.5.1+cu121. Hugging Face offline flags were set; local CPU native torchmcubes/rembg stubs used. Existing model checkpoint weights were **NOT loaded**, no forward pass, no CUDA model allocations. Import gave nonfatal Transformers/Torch deprecated API warnings.
5. Checking the original venv's Pillow before/after confirmed it **remains 10.1.0**. No Python wheel was installed into the live environment. The original freeze still pins Pillow==10.1.0.

Sanitized, independently checksum/schema/manifest-validated release proof: [G3.6 Pillow shadow evidence](evidence/g3/g3-6-shadow-pillow-cpu-proof.json). Only public-source IDs/versions, checksums, test counts and limitations are committed; the downloaded wheel, overlay and raw private reports remain gitignored.

## Reproduction controls

Scripts in the repository:
- scripts/g3-6-pillow-candidate-screen.mjs — optional read-only PUBLIC version metadata/OSV check; not in npm start/test or AI runtime.
- scripts/g3-6-pillow-shadow-check.py — fixed real image CPU preprocessing tests, requires explicit separate Pillow shadow.
- scripts/g3-6-triposr-import-probe.py — CPU-only pinned TripoSR image/tokenizer system import; not a model-load test.
- scripts/g3-6-shadow-python-regression.ps1 — 23 CPU tests with temporary process variables and explicit unchanged-production-version verification.
- scripts/g3-6-assemble-shadow-proof.mjs — offline aggregation of source checksums, shadow tests and public candidate metadata into sanitized proof, no network or GPU.

Initial private candidate staging used pip download Pillow==12.3.0 --no-deps --only-binary=:all: into gitignored wheels, SHA comparison against PyPI, then pip install --no-index --no-deps --target into gitignored overlay. There is **no unattended production upgrade**. Proof-producing scripts are intentionally append-safe and refuse overwriting an earlier verified experiment.

## Critical open gates

- Real model full-loading, CUDA inference, output mesh quality/performance and G2 runtime compatibility with Pillow 12.3 have **not** been proven. Only CPU preprocessing, imports and existing CPU suites are green.
- Actual vulnerable code-path triage and a separately locked, full clean-room upgrade of Transformers and Torch are still required. A Pillow-only shadow candidate does not resolve the 72 version-level matches in the other two pinned packages.
- No OS-enforced egress sandbox, untrusted-multiuser hosting authentication or complete commercial security qualification.
- Eight synthetic G3 images still have no real model inference; no physical dimension/wall/strength/slicer/print certification or printer commands.
- Any new CUDA compatibility experiment still needs specific user approval plus live Office idle/VRAM assessment. There was **no new GPU model run** in G3.6.

For v0.2.6 itself, a separate read-only npm audit of the current pinned Node production-only and full dependency graph returned **0 version-level matches in both scopes**; the new immutable lockfile SHA-linked result is [G3.6 Node audit evidence](evidence/g3/g3-6-npm-audit-summary.json). The historical G3.5/v0.2.5 npm audit proof was deliberately retained unchanged. Full application regression also passed **67/67 Node tests**, **8/8 G1 Chrome phases** and **8/8 G2/G3 mock Chrome phases**, none involving real neural-network inference.

Related GitHub Issue #4 (security remediation) stays OPEN. The larger G3 benchmark/manufacturing Issue #3 stays OPEN. Office 2.0 P0, VelvetOS, printers and other unrelated services remain untouched.
