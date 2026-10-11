# LOCAL3D G3.47 — ACTUAL SHA-VERIFIED persisted job-asset HTTP delivery (Chris native CPU)
2026-10-11 | v0.2.47-g3-http-assets-sha-filehandle

## Scope: one real production HTTP vulnerability, not another readiness inventory

Previously the active `server/index.js` GET/HEAD job-asset route validated that an asset *record* existed, then called `serveFile` with an on-disk pathname. `serveFile` separately performed `stat` and opened `createReadStream`. These operations could follow symbolic links or Windows Junctions and did NOT verify that the actual bytes sent still matched the recorded `sha256`. G3.46 fixed the manual G2 worker's *immediate post-worker* readback, but not the separately timed later GET/HEAD of a saved GLB, QA report or source image. G3.47 closes this concrete gap in the active fixture G1 and manually approved G2/G3 asset-serving path without enabling any model or printer.

## Actual hardened production implementation

- **New** `server/g347-http-asset-integrity.js` exports `readShaVerifiedJobAsset`. Strict file ID and MIME allowlist for `preview-glb`, `qa-report`, `geometry-qa`, `benchmark-shape`, and `source-image` (PNG/JPEG/WebP). Reject invalid manifest `bytes`/hex `sha256`, unsafe path, linked directory ancestry, NTFS hardlinks (`nlink!=1`), symbolic links and type/size mismatch. Upper bounds are GLB 100 MiB, JSON 128 KiB, image 8 MiB. **No content ever returns to the HTTP route** before verifying an exclusive regular file, `lstat({bigint:true})` identity against `fstat` from an *opened single file handle*, bounded positioned reads, EOF/overgrowth checks, post-read fstat, complete SHA256 against the persisted asset manifest, and final directory/filename identity.
- **Modified active** `server/index.js`: the real `/v1/jobs/:id/assets/:asset` route invokes that reader for **both GET and HEAD**, responds `409 G347_ASSET_UNVERIFIED` on any mismatch **before writing 200 headers or asset bytes**. Legitimate assets continue with correct MIME, Content-Length, `Cache-Control: no-store`, `X-Content-Type-Options: nosniff`. Existing static web assets intentionally keep their independent `serveFile` path, so this change applies specifically to persisted jobs; no HTML/GitHub/cloud route was added. The server source SHA changes in G3.47 *intentionally*; G1/4177 persistent startup still OFF, actual Office/4178 unchanged and G2/4179 manual-only OFF.
- **Tests:** `tests/g347-http-asset-filehandle.test.js` adds 11 native Windows owned-temp file cases (legitimate GLB, same-length SHA tamper, hardlink, symlink, parent Windows Junction, deterministic lstat→open swap without byte read, post-read pathname replacement, file append during read, asset-allowlist negative cases, valid source/review JSON, error privacy). `tests/api.test.js` adds four **real ephemeral loopback HTTP** integration cases: valid GET and HEAD must agree with the manifest SHA and lengths; same-size GLB edit must return 409 on both methods; a hard-linked QA report must return 409 while source remains intact; a Windows Junction replacing a job folder must deny every persisted asset. These run only fixture/demo and synthetic files, NEVER CUDA or TripoSR.
- **Historical frozen evidence:** changing `server/index.js` would invalidate SHA comparisons in earlier G3.28/G3.30/G3.31/G3.36/G3.39/G3.44 tests/assemblers and G3.45/G3.46 SHA-replay scripts. Rather than rewrite or restamp frozen reports, `tests/fixtures/g347-frozen-g346-server.mjs` retrieves the exact **pinned G3.46 Git blob** (`01090f2226cc96f6217836b3ff05cbcb14ac530e:server/index.js`) and verifies both historical Git LF SHA and Windows checkout CRLF SHA before returning bytes. Historical test/assembler source comparisons now explicitly mean the **historical frozen source**, while the new G3.47 evidence links the **current** server and new guard. G3.36 assembler also reads its historical tagged 0.2.36 `package.json` instead of mistaking the present release version for a historical observation. No original evidence report bytes changed.

## Actual bounded proof and tests (read-only with owned temporary synthetic fixtures)

`scripts/g3-47-assemble-local-http-asset-proof.mjs` verifies G3.46 parent public SHA `2f13915977b31994e46666bfaca8983d7366429165076d1ebf8a7eb4f20e34e0`, ensures G3.46 production source is deliberately distinct from the real new G3.47 HTTP route, performs **25/25 native Node tests** from `tests/api.test.js` and `tests/g347-http-asset-filehandle.test.js` (15 newly added; 0 failed/skipped), then replays and SHA/byte-compares **nine frozen historical evidence assemblers** from G3.28 through G3.46 without overwriting them. These nine assembler replays can include their previously approved owned-synthetic Windows CPU tests; they do not re-probe remote Windows, launch persistent services or repeat the large G3.42 backup restore. Public immutable evidence:

`docs/evidence/g3/g3-47-actual-persisted-http-asset-sha-filehandle-cpu.json`

Initial SHA256 `44abfdf3bca6113fd6200a8e1254dab03247c7db8f2f67bd97f174a6318bd349`. The JSON exposes only counts, source and public evidence SHA, explicit unresolved limitations and failure modes, not Windows usernames, actual job IDs, customer file paths, raw images or secrets.

## Known limitations — NOT A SECURITY OR PRINT RELEASE

These checks validate **one request's bytes against its persisted asset record**. They do **not** independently authenticate the manifest from a compromised privileged host user: if both the file and its digest in a manifest are maliciously changed, SHA matching alone cannot authenticate origin. They also don't provide atomic Windows directory-handle confinement against a hostile concurrent process with write permissions; they temporarily buffer up to 100 MiB *per request*, which still warrants concurrency limits/OS process isolation before opening to untrusted clients. They are not Windows Sandbox native Pillow decoding, egress control, a patch to production Pillow 10.1, full TripoSR GPU upgrade, or an assurance about actual customer-upload parsing. GitHub Security #4 OPEN, including encrypted independent off-host recovery and native parser isolation. G1 without-login service principal/TaskScheduler issue #5 OPEN and manufacturing geometry/millimetre/print issue #3 OPEN. All GLBs DRAFT, `printQualified=false`, `approvedForPrinter=false`, `fabricationAction=NONE`. No GPU, printer, Office, BitLocker/Defender/UAC/Firewall/ACL, Task Scheduler or OS reboot action has been authorized or performed here.

## Reproducible CPU-only verification on authorized Chris Windows

    node --test tests/api.test.js tests/g347-http-asset-filehandle.test.js
    node scripts/g3-47-assemble-local-http-asset-proof.mjs
    npm test
    npm run qa:browser
    npm run qa:browser-g2-mock

The assembler explicitly requires `--write-public` ONLY for one initial publication. Later invocations compare the immutable bytes and fail closed. It replays nine original public reports unchanged. Python quality/offline CPU regression uses the existing pinned local environment with CUDA/Transformers/HuggingFace disabled; production Python packages remain unchanged.

## Shared development program: AI Development Studio + LOCAL3D (proposed integration, NOT LIVE)

Both projects can be managed in one conversation and one coordinated roadmap, with **separate repositories, tests, releases, operational ownership and security gates**. A future LOCAL_ONLY capability adapter could let AI Development Studio discover LOCAL3D status and request authorized 3D jobs; it must never treat the Studio sandbox, GPU approvals, Office/4178, or any cloud provider policy as implicitly granting LOCAL3D authority. The first integration phase should be read-only status and stable shared job/result contracts, then opt-in task submission only after separately approved authentication, resource arbitration and model/image-scoped consent. This is **architecture intent only**; G3.47 does not integrate or modify AI Development Studio.

## Next concrete security target

Preflight review G3.48 for an OS-backed least-privilege per-job storage/manifest provenance boundary or a bounded request-concurrency limit; use owned synthetic CPU test cases until explicit new approval for Windows Sandbox/guest native decoder execution, service account ACL changes or actual GPU/printing is obtained.
