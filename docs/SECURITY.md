# Threat Model - G0/G1

## Trust boundaries
Browser on the same physical host -> loopback HTTP server -> local job folder -> deterministic GLB fixture. There is no network model provider, cloud backend, printer, G-code, workspace registry write, arbitrary client URL download or API key entry.

## Protected assets
Uploaded source photos, user text, generated demo GLB, audit log, local job IDs, host CPU/memory and filesystem integrity.

## Threats and defenses
1. SSRF: no fetch/proxy endpoint and remote URLs, webhooks, commands and remotePath inputs are rejected. Output files are selected by known artifact IDs, not URLs.
2. Traversal and cross-job read: UUID-only route, server-side job lookup, fixed asset-to-filename map. No user-supplied filesystem path reaches fs.readFile.
3. DNS rebinding / exposure: bind 127.0.0.1 only; Host must be 127.0.0.1, localhost or [::1] with optional port. Cross-origin writes reject mismatched Origin. No CORS headers.
4. Upload attacks: JSON size <=12 MiB; image <=8 MiB; strict allowed MIME and file signature; input filename never used as stored filename.
5. Browser injection: prompt/name displayed via textContent, no HTML interpolation. CSP disables external resources and workers; frame embedding denied. Three.js modules served locally.
6. Orphaned jobs: G1 has no subprocesses. Cancellation clears timer. Startup converts queued/running job records into interrupted state; no invented output.
7. Cost, privacy, fabrication: no credentials, telemetry, cloud calls, payment or hardware operations. QA report is DRAFT, printQualified=false.

## Known G1 limits
- Designed for trusted single-user loopback use; NO authentication/authorization for multiple local OS users. Do not expose the port via reverse proxy or LAN binding.
- Magic-byte checking does not validate full image structure or guarantee decompression safety. Real model adapters require independent sandboxing/limits for uploaded assets.
- Queue limit 30 and 1000-record cap are basic DoS guards, not full quotas/GC.
- Job directory security inherits local OS file permissions. Guard against malicious local processes and symlink swaps before multi-user release.
- No signed binary installers or auto-update channel. npm dependency is pinned and installed with scripts disabled.
- Browser GLB preview is a visual inspection aid, not manifold, dimension, watertightness, structural or wall-thickness proof.
- Server has not been independently penetration-tested. Threat controls are implementation safeguards, not formal certification.

## Future G2 hardening
Isolate runtime per provider, enforce real timeout/CPU/VRAM quotas, structured logs with retention, security dependency review, model-weight provenance and checksum, local access control if sharing, cancellation of worker processes, engine crash recovery and repeatable adversarial tests.
