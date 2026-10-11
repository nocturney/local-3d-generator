# LOCAL3D G3.43 — Real READ-ONLY encrypted/off-host backup destination preflight

2026-10-11 | v0.2.43-g3-offhost-backup-readiness-cpu

## Why this milestone follows G3.42

G3.40 acquired the SHA-verified original official Pillow 10.1.0 Windows CPython3.11 x64 wheel and proved a temporary OFFLINE Pillow-only reinstall. G3.41 actually backed up all 27,966 production Python venv files (5,086,619,721 bytes, 34 pinned distributions), and verified cloned CPU execution. G3.42 actually restored a SECOND entire cloned Python venv from that private backup, verified all source/restored/post-test file SHA256 and successfully executed the complete 262 quality + 7 G2 offline tests. The temporary restore was removed; the private source backup stayed on Chris D:.

**Those milestones are complete; G3.43 does not repeat the 5 GB full restore.** The missing protection is an approved, encrypted, independently recoverable external copy. An additional disk inside the SAME machine is not an off-host disaster-recovery destination.

## Actual read-only Windows Chris inventory

The bounded PowerShell script `scripts/g3-43-readonly-backup-targets.ps1` was executed on the authorized Windows host and captured a PRIVATE observation in ignored `runtime/qa/g3/g343-readonly-backup-host-observation.json`. It contains no account names, file list, credentials, keys or customer content.

The real observed facts at capture time:

- Original private Python backup folder and frozen private manifest both existed. The manifest's SHA256 was rechecked against G3.42's public immutable evidence: `2c87d7cc2e7f1703a6c5c92521036f21630737ede2376020897faec94459df9d`.
- Source D: = physical NVMe disk 0; alternative C: = distinct physical NVMe disk 1. C: had approximately 215.9 GB free, sufficient for the 5.09 GB venv plus headroom. This only isolates a **single-drive failure**, not whole-host failure.
- BitLocker on **both** C: and D: reported `ProtectionStatus=Off` / fully decrypted, so neither is a verified encrypted-at-rest destination.
- The narrowly scoped session identified zero connected SMB mappings and zero attached online USB disks. This does NOT prove there is no separate NAS, storage service, spare disk, tape or backup software elsewhere.
- The original Windows restart at 06:42:27 remains the last observed boot; live G1 loopback 4177 is DOWN, independent Office 4178 is active and was not changed, and manual G2 4179 is OFF. G1 no-login autostart remains unapproved.
- G3.43 **copied zero private backup bytes**, never configured BitLocker/encryption, never authenticated to cloud or NAS, never registered a Task Scheduler job, never enabled a GPU worker, never started G1/4177 and never interacted with Office/4178 or printers.

The script must be invoked intentionally to capture a fresh observation. Replaying the source-linked public JSON proof does **not** probe the Windows host again. If a disk/backup destination changes, do not re-label this immutable report as new evidence.

## Strict CPU contract and immutable proof

`server/g343-backup-target-review-contract.js` validates an exact, allowlisted Windows inventory schema. Unexpected fields, unverifiable encryption states, internally contradictory disk identities, non-integer counts, changed historical 27,966-file size, forged approval, copied data, OS/network/security changes or claims of live GPU/G1/Office changes fail closed. It links to actual published G3.42 full Python restore proof and G3.39 G1 disabled autostart proof. It never treats local spare capacity or an encrypted SECOND INTERNAL disk as off-host disaster recovery.

`scripts/g3-43-assemble-independent-backup-proof.mjs` validates the historical frozen G3.42 and G3.39 SHA256 chain, verifies the PRIVATE original manifest SHA, consumes only the privately captured read-only observation and emits a new sanitized immutable public proof with no private filenames, disk IDs, account/SID, absolute paths, keys or customer data:

`docs/evidence/g3/g3-43-independent-encrypted-backup-readiness-not-replicated.json`

The assembly process has no side-effectful backup, network, encryption, Windows-task, printer or model functionality. Public report creation requires `--write-public` once, and any later replay requires byte-identical immutable source output. Eight adversarial Node tests passed, including forged transfer/restore authorization, contradictory disk identities, assumed encryption, false G1 activation and SHA lineage changes. **Complete Chris regression PASS:** 244/244 Node, 262/262 pinned G3 Python quality + 7/7 G2 offline CPU (269/269), and 8/8 G1 Chrome + 8/8 G2/G3 MOCK Chrome (16/16). The Python progress text on stderr was harmless; exit status was 0 and both unittest suites said OK.

## Real follow-up gates before ANY private replica is allowed

1. Operator separately approves the **exact target**, ownership and scope (only the approved Python venv backup and private SHA manifest unless expanded intentionally). Do not accidentally include real customer data, model weights, runtime jobs, private keys or all of `runtime/`.
2. Validate true destination failure-domain separation: a dedicated removable encrypted volume stored offline, or an independently secured off-host system; same-host C: is not enough for whole-machine disaster recovery.
3. Independently verify encryption-at-rest, authenticated destination access, key recovery/escrow and the restoration procedure **without writing secrets to this repo, reports, PowerShell history or ChatGPT**. Do not enable/challenge BitLocker or modify OS policy during this milestone.
4. Plan quotas, minimum required capacity, filesystem metadata, ACLs, lock/no-reparse-point rules, abort and rollback. Provide clearly bounded copy commands only after specific permission.
5. Verify each destination file SHA256 against the ORIGINAL private manifest, prove file count and size, then perform a separate authorized recovery readback from the destination.
6. Separately plan CPython base `C:\Python311`, Windows OS/security policy, CUDA drivers, model source/weights, configuration and proper private data retention. Existing backup covers Python package venv files only.
7. Obtain a different explicit approval before choosing a least-privilege Windows service account and installing/running persistent fixture-only G1 at 4177. The G3.39 draft remains disabled, unregistered and noninstallable. Real no-login postboot health, invalid-media HTTP 422, fail-safe stop and no Office/4178 impact are still required.

## Safe verification (no copying and no GPU)

Run from the LOCAL3D checkout on authorized Chris:

    .\scripts\g3-43-readonly-backup-targets.ps1
    node scripts/g3-43-assemble-independent-backup-proof.mjs
    node --test tests/g343-independent-backup-preflight.test.js
    npm test
    npm run qa:browser
    npm run qa:browser-g2-mock

The PowerShell inventory prints bounded read-only facts; it does not create the private receipt. The first capture was explicitly directed into the ignored runtime QA directory. Normal report replay only verifies the existing private capture and frozen public JSON. Historical G3.25–G3.42 public proofs are left byte-for-byte unchanged.

## Truthful outcome

G3.43 is **backup destination DISCOVERY AND GATING, NOT REPLICATION**. No independently encrypted off-host copy has been made or restored. Do not assert that all files, OS or CUDA model weights are recoverable from a second computer; G3.42 establishes same-host Python packages recovery only. Production Pillow 10.1.0 is unchanged; Pillow 12.3 shadow full model GPU compatibility and native decoder Windows guest/egress confinement remain unresolved. Security Issue #4 OPEN. Persistent G1 startup Issue #5 OPEN. Manufacturing Issue #3 OPEN: two historical real outputs of nine input sources, seven future per-image GPU approvals, no physical mm/wall/slicer/printer qualification. All GLBs DRAFT; printQualified=false, approvedForPrinter=false, fabricationAction=NONE.

No GPU, model execution, untrusted input media, OS/service/encryption changes, Office modification, cloud transfer or printing was performed.
