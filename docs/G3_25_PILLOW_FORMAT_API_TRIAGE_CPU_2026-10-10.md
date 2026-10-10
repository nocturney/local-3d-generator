# LOCAL3D G3.25 — Pillow codec/format/API advisory conditions, CPU static gate

2026-10-10 | v0.2.25-g3-pillow-format-path-triage-cpu

## Why this milestone exists

G3.24 prioritized Pillow because the live **manual** G2 worker decodes input image bytes using Pillow 10.1.0. The G3.23 public snapshot contains **32 Pillow version-level OSV records** in **16 alias-linked GHSA/PYSEC groups**. G3.25 reviews the *named upstream trigger conditions* for all 16 groups against the actual current Node HTTP signature gate and Python image preprocessing entrypoint. It is not a vulnerability exploit test, exhaustive reachable-code analysis, native C audit, upgrade or claim of safe untrusted uploads. All 32 per-record application exploitability dispositions remain **UNRESOLVED**.

No customer media, synthetic attack payload or model file was opened. Official upstream public GHSA advisory descriptions were manually reviewed on 2026-10-10; their compact trigger descriptions here are human summaries, not full independent reproduction or guarantee that every transitive/native path has been ruled out. Fixed-version values are verified against the already SHA-locked G3.23 public range-event snapshot; they do not establish any installed fix or Windows/CUDA compatibility.

## Verified current input boundary (not a sandbox)

The current localhost manual G2 API accepts declared MIME only when it agrees with a *short signature check* for **PNG, JPEG or WebP**, and limits encoded image bytes to **8 MiB**. This signature check is NOT a complete parser, content validation, file polyglot defense or OS sandbox. The worker restricts its job filenames to input.png/input.jpg/input.webp. After that, Pillow **Image.open**, **src.load**, **ImageOps.exif_transpose** and conversion/compositing operate on decoded image bytes; the Python worker sets MAX_IMAGE_PIXELS=16,000,000 and a size check, but Pillow's native parsing begins before full pixel-load validation. These controls do not establish absence of parser bugs.

Critically **JPEG2000 is not ordinary JPEG**. McIdas AREA and JPEG2000 fail the current ordinary top-level signature allowlist, but a format mismatch does not prove no indirect/native internal attack route; nor does it authorize a general-purpose user-upload service.

## Upstream individual group review (ALL STATIC / NONE CLEARED)

| Public upstream GHSA | Named condition/format (official GHSA summary) | First fixed event (G3.23 public metadata) | Current entrypoint assessment |
| --- | --- | --- | --- |
| [GHSA-3f63-hfp8-52jq](https://github.com/advisories/GHSA-3f63-hfp8-52jq) | ImageMath.eval with attacker-controlled evaluation environment | 10.2.0 | Named API not directly observed in worker/server entrypoints |
| [GHSA-44wm-f244-xhp3](https://github.com/advisories/GHSA-44wm-f244-xhp3) | _imagingcms.c unsafe strcpy; exact app conditions still uncertain | 10.3.0 | Native ImageCms applicability unresolved |
| [GHSA-45hq-cxwh-f6vc](https://github.com/advisories/GHSA-45hq-cxwh-f6vc) | BDF bitmap-font glyph dimension expansion | 12.3.0 | Specialized font loader not directly observed |
| [GHSA-4x4j-2g7c-83w6](https://github.com/advisories/GHSA-4x4j-2g7c-83w6) | ImageShow WindowsViewer file-path shell interpolation | 12.3.0 | ImageShow viewer path not directly observed |
| [GHSA-5x94-69rx-g8h2](https://github.com/advisories/GHSA-5x94-69rx-g8h2) | FontFile.compile glyph atlas from BDF/PCF | 12.3.0 | Specialized font compiler not directly observed |
| [GHSA-62p4-gmf7-7g93](https://github.com/advisories/GHSA-62p4-gmf7-7g93) | McIdas AREA mmap raw-row-stride read | 12.3.0 | Named top-level codec differs from allowed PNG/JPEG/WebP |
| [GHSA-6r8x-57c9-28j4](https://github.com/advisories/GHSA-6r8x-57c9-28j4) | Image.paste/Image.crop with extreme signed coordinates | 12.3.0 | Caller-controlled coordinate API not directly observed |
| [GHSA-8v84-f9pq-wr9x](https://github.com/advisories/GHSA-8v84-f9pq-wr9x) | PCF font bitmap glyph allocation | 12.3.0 | Specialized font loader not directly observed |
| [GHSA-9hw9-ch79-4vh6](https://github.com/advisories/GHSA-9hw9-ch79-4vh6) | ImageCmsTransform.apply with mismatched output image mode | 12.3.0 | Caller-configured CMS API not directly observed |
| [GHSA-fj7v-r99m-22gq](https://github.com/advisories/GHSA-fj7v-r99m-22gq) | TGA mode-1 RLE **encoding** out-of-bounds read | 12.3.0 | Output TGA encoder is not the documented input decode path |
| [GHSA-jjj6-mw9f-p565](https://github.com/advisories/GHSA-jjj6-mw9f-p565) | PdfParser.PdfStream.decode FlateDecode expansion | 12.3.0 | PDF parser not directly observed |
| [GHSA-phj9-mv4w-65pm](https://github.com/advisories/GHSA-phj9-mv4w-65pm) | GdImageFile.open large GD image dimensions | 12.3.0 | Direct GD specialized plugin not observed |
| [GHSA-r73j-pqj5-w3x7](https://github.com/advisories/GHSA-r73j-pqj5-w3x7) | PdfParser trailer Prev-pointer loop | 12.2.0 | PDF parser not directly observed |
| [GHSA-vjc4-5qp5-m44j](https://github.com/advisories/GHSA-vjc4-5qp5-m44j) | JPEG2000 tiled decode scratch-buffer growth | 12.3.0 | Named top-level JPEG2000 differs from allowed JPEG |
| [GHSA-wjx4-4jcj-g98j](https://github.com/advisories/GHSA-wjx4-4jcj-g98j) | Font glyph advance position integer overflow | 12.2.0 | Font rendering API not directly observed |
| [GHSA-xj96-63gp-2gmr](https://github.com/advisories/GHSA-xj96-63gp-2gmr) | ImageFilter.RankFilter with giant odd filter size | 12.3.0 | Caller-configured filter not directly observed |

**All 16 rows have disposition UNRESOLVED_STATIC_SOURCE_REVIEW_ONLY.** The 16 rows correspond to **32 public OSV records** because of paired GHSA/PYSEC aliasing, NOT 32 independently tested defects. In particular, "not directly observed" means only *in the two inspected entrypoint files*; it never proves an upstream library, transitive import, native extension, maliciously malformed valid PNG/JPEG/WebP or C path safe. The complete GHSA pages linked above are the evidence for named upstream conditions; the exact OSV fixed-event/version/alias mapping is from G3.23.

## Implemented deterministic proof and adversarial controls

- scripts/g3-25-pillow-format-triage-lib.mjs checks **all 16 GHSA/PYSEC groups/32 exact public IDs**, G3.23/G3.24 ancestry and all retained fail-closed security flags, plus literal current Node signature/MIME/byte and Python Pillow image-load, EXIF and dimension boundary anchors.
- scripts/g3-25-assemble-pillow-format-review.mjs computes bytewise SHA256 of four tracked sources (G3.23 public, G3.24 public, server/index.js, engines/triposr/worker.py); first proof creation is explicit --write-public, subsequent no-flag execution is read-only immutable equality verification.
- docs/evidence/g3/g3-25-pillow-format-review.json is a source-linked sanitized public report: no private jobs, image bytes, model assets, personal paths, secrets or input filename.
- tests/g325-pillow-format-triage.test.js covers source/record completeness, exact MIME/codec boundary, representative GHSA per-condition classification, forged fixed range/alias/safety status, deliberately weakened HTTP signature/byte guard, weakened Python worker decode/dimension/filename controls, privacy and nonrelease flags.

On Chris from repo root, CPU only:

    node scripts/g3-25-assemble-pillow-format-review.mjs
    node --test tests/g325-pillow-format-triage.test.js
    npm run test:all
    runtime\engines\triposr\venv\Scripts\python.exe -m unittest discover -s engines\triposr -p test_offline.py
    runtime\engines\triposr\venv\Scripts\python.exe -m unittest discover -s engines\quality -p "test_*.py"

The report is an immutable snapshot of specific source bytes. Later product changes to accepted codecs, Node file validation, worker preprocessing or dependencies **must** trigger a new review, not silent reuse of this snapshot.

## Remaining gates and next step

Security Issue #4 **OPEN**: true reachable native/transitive codepaths for each condition, remaining Transformers/Torch groups, older Pillow 10.1.0 upgrade resolution, OS-enforced file/network parser confinement, and untrusted-input/retention policy remain unverified. A separate authorized **isolated shadow environment** and CPU compatibility plan can be pursued; do not alter live production Python/CUDA without explicit approval. No new package/network query, image fuzz/exploit, CUDA inference, Office/4178, Windows security/firewall, cloud model or printer actions in this milestone.

Manufacturing Issue #3 **OPEN**: 2/9 historical actual AI outputs and seven missing per-run GPU approvals; all outputs DRAFT and printQualified=false/approvedForPrinter=false/fabricationAction=NONE; unknown physical millimeters and wall properties.

**Recommended G3.26:** CPU-only independent image signature vs Pillow detected-format discrepancy study using harmless synthetic PNG/JPEG/WebP fixtures and deliberate *safe* MIME/extension confusion controls; also check whether the upload allows a polyglot/declared-mime mismatch by failing closed. Do not use malicious native parser payloads or treat mock-only checks as OS security approval.
