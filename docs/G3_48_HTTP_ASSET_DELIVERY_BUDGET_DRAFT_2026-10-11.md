# G3.48 engineering draft - bounded concurrent HTTP asset delivery (2026-10-11)

**NOT RELEASED, NOT WIRED TO THE HTTP ROUTE.** Based on LOCAL3D main `244577b1fb0264d295efe5121915903ac0a06ce6` / v0.2.47. Do not assign version v0.2.48, modify G3.47 frozen SHA proof, or close GitHub Issues #3/#4/#5. Both Windows Chris and MacMiniOffice.local were offline for fresh Remote Desktop Commander readback; no Windows/NTFS/browser/full-suite QA took place in this turn.

## Concrete source gap

`server/g347-http-asset-integrity.js` accepts a SHA-listed maximum of 100 MiB for `preview-glb` and allocates an exact full Buffer before GET/HEAD; `server/index.js` invokes it without an active read-budget gate. Several parallel requests could retain multiple 100 MiB Buffers until their HTTP responses flush. G3.47 verifies file hash/identity and prevents unsafe bytes from being sent; this does not alone bound process-wide memory exposure.

## Implemented, self-contained draft components

- `server/g348-asset-delivery-budget.js`: fail-fast per-createApp reservation candidate. Default max two active asset reads and 128 MiB sum of declared bytes; no waiting queue. Reservation is released idempotently only after response finish/close; disconnect during asynchronous verifier retains reservation until the reader settles. `deliverBudgetedVerifiedAsset` calls a separate trusted `readVerified` function and refuses to send any headers if verification/length fails. No network, model, filesystem or printer action is performed by this code on import.
- `tests/g348-asset-delivery-budget.test.js`: 14/14 CPU-only isolated Node tests passed in the assistant's isolated container (Node v22.16.0). These cover two slots, byte budget, malformed sizes, HEAD/GET, delayed finish, early close during SHA verification, mismatch, thrown IO and idempotent release.
- Both source files were independently read back from the GitHub draft branch and matched EXACT Git blob hashes of the locally tested bytes.

## Candidate integration steps - NOT DONE

1. In `createApp` construct `createAssetDeliveryBudget()` once per instance. Do not expose HTTP controls or untrusted env overrides for changing the limits.
2. Replace only `serveVerifiedJobAsset` so the reservation precedes `readShaVerifiedJobAsset`; map `G348_ASSET_BUSY` to HTTP 503 without a read, keep G3.47 SHA/identity failures as HTTP 409, and hold the reservation across response flush.
3. Add real ephemeral loopback GET+HEAD tests for 503-before-read, 409 hash tamper, slow clients, abort during SHA read and post-disconnect release. No permanent 4177 service or G2/GPU start.
4. Carefully preserve immutable G3.47 evidence based on prior source hashes. Historical replays must stay pinned to the original commit before any `server/index.js` change.
5. On authorized Windows Chris, run full regression and native NTFS synthetic tests; review event-loop/runtime memory effects. Gate merge, version/tag, production activation and any OS/Windows task change independently.

## Security limits

128 MiB is an **approximate sum of asset payload reservation sizes in one Node createApp instance**, not an OS-enforced hard RSS cap, network-rate limit, cross-process memory arbitration or defense against untrusted hosts. The budget does not cryptographically authenticate the manifest, provide atomic Windows directory handles, sandbox Pillow, authorize unsafe image uploads, change model/GPU scheduling or qualify anything for printing. All GLBs remain DRAFT with printQualified=false, approvedForPrinter=false, fabricationAction=NONE.
