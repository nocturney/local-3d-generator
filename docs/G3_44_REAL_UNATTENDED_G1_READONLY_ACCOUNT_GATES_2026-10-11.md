# LOCAL3D G3.44 — ACTUAL Windows G1 unattended startup preflight: principal NOT proven

2026-10-11 | v0.2.44-g3-g1-unattended-readonly-principal-blocked

## Scope and why G3.44 follows G3.43

Issue #5: independent Windows Office/4178 resumed after reboot but LOCAL3D fixture-only G1/4177 did NOT. G3.39 was an actual read-only discovery of this failure plus an explicitly **DISABLED, UNREGISTERED and NONINSTALLABLE** Task Scheduler draft. G3.43 added an actual host encrypted backup-target probe (both internal BitLocker volumes OFF; no off-host encrypted copy). Both proofs are frozen and referenced by hash. There is no approval to deploy G1 permanently or to change Windows accounts, scheduled tasks or the OS.

**New G3.44 value, NOT repetition of G3.39:** a more comprehensive *actual* Windows startup inventory via task action forms, Win32_Service PathName and Win32_StartupCommand; observation of the Node binary digest and Machine PATH; read-only ACL metadata for five G1 startup dependency paths; reparse-point checks; latest OS boot date; exact source integrity. An offline strict, allowlisted fail-closed reviewer refuses confusing these current-probe conditions with verified access for a future noninteractive account.

## Real Chris Windows read-only observation

`scripts/g3-44-readonly-unattended-g1-host.ps1` was actually executed on authorized Chris and a fixed-field, PRIVATE observation stored only under ignored `runtime/qa/g3/g344-unattended-g1-host-observation.json`. It neither stores nor publishes account names, SIDs, task definitions/command lines, secret environment variables, absolute local paths or individual ACL ACEs. It never registers/starts a task, touches Windows policies, changes a file ACL, starts G1, copies backup bytes, accesses customer media or runs GPU/AI/print. On first pass it identified an ordinary PowerShell edge case: Windows includes non-executable Task Scheduler action types that have no Execute/Arguments properties. The **read-only collector was fixed** to process those action types without assuming Execute exists, then re-run successfully. No OS change.

Actual scoped observations as captured:
- **372** Windows Scheduled Tasks inspected; **344** Win32_Service entries inspected; **29** Win32_StartupCommand entries inspected. Zero entries matched the narrowly defined LOCAL3D patterns in task name and action executable/arguments, service Name/DisplayName/PathName or startup Name/Command. This does NOT prove there are no renamed/generic dispatchers; the scan is pattern-bound and observation-time-bound.
- G1/4177: **0** listeners. Office/4178: **1 loopback** listener, left untouched. Manual-only G2/4179: **0** listeners.
- G1 `server/index.js` SHA still matches the frozen source established at G3.39/G3.28. Process-context Node is **v24.19.0**; its binary SHA256 was calculated and the executable directory also appeared in the Machine PATH. **Machine PATH does not certify a particular scheduled-task service principal or postboot process environment.**
- Current probe account could inspect ACL **metadata** on the Node directory and the LOCAL3D repository, G1 server script, `runtime/data`, `runtime/data/jobs`, and `runtime/data/audit`. All five project entries exist and are not direct reparse points. This is NOT an effective access check, and especially not under any future intended low-privilege account.
- The Windows last-boot date was observed as 2026-10-11. This is not an unattended loginless G1 boot execution witness, and no reboot was performed.
- Windows task/service/startup inventory was read-only. **No G1 task was installed, configured, enabled or launched**. Office/4178 was not modified. G2/GPU/model/printing remained off.

## Testable fail-closed proof

New artifacts:
- `scripts/g3-44-readonly-unattended-g1-host.ps1` — purely READ-ONLY machine observation; defaults to JSON stdout with no filesystem writes.
- `server/g344-unattended-g1-gate.js` — zero-side-effect strict allowlisted gate; both current-state and historical frozen G3.39/G3.43 sources must match, and attempts to mark the intended principal/rights, noninteractive logon, Task installation, post-boot health or Office/GPU changes as proven are rejected.
- `scripts/g3-44-assemble-unattended-g1-readonly-proof.mjs` — verifies SHA256 of frozen G3.39 and G3.43 proofs and disabled G3.39 draft, canonical G1 code SHA, SHA of the private read-only receipt; creates or rechecks the single **immutable sanitized public evidence**. Subsequent replay NEVER scans Windows again.
- `docs/evidence/g3/g3-44-actual-readonly-unattended-g1-account-not-proven.json` — source SHA-linked proof containing only aggregate counts, explicit missing rights and zero side effects. Initial public evidence SHA256: `9cccf5bbab5c2dd7dd820e8836e1c27fa2c2ec72c175fa2de2de6d63ecfecff0`.
- `tests/g344-windows-unattended-g1-gates.test.js` — **10 adversarial Node tests**: forged principal rights, task registration, os/service/GPU changes, ACL observations vs actual rights, missing Machine PATH/Node hash, unexpected listeners, incomplete/overlapping launchers, altered historical sources and public privacy. **Actual complete Chris regression PASS**: 254/254 Node (including 10 new tests), 262/262 G3 pinned Python quality + 7/7 G2 offline Python (269/269), 8/8 G1 Chrome + 8/8 G2/G3 MOCK Chrome (16/16). Python unittest progress printed via PowerShell stderr (NativeCommandError wrapper), both suites said OK and exit code 0. No model/CUDA inference in the regression.

Read-only outputs and offline tests are **not** a substitute for a real dedicated service account's effective rights and noninteractive behavior.

## Allowed operator-run verification (no service or GPU)

From the verified LOCAL3D repo on Chris:

    .\scripts\g3-44-readonly-unattended-g1-host.ps1
    node scripts/g3-44-assemble-unattended-g1-readonly-proof.mjs
    node --test tests/g344-windows-unattended-g1-gates.test.js
    npm test
    npm run qa:browser
    npm run qa:browser-g2-mock

The PowerShell command merely **prints** a fresh, bounded read-only snapshot. The assembly command validates the PRIVATE fixed first observation and the immutable published report, and does not refresh current Windows state.

## Remaining mandatory approvals and live proofs before Issue #5 can close

1. Obtain operator's **new explicit approval** for exactly which limited Windows principal/service identity and how logon without an interactive Windows desktop will work. No default SYSTEM/HIGHEST; no credentials in files/repo/chat, no OS security bypass.
2. Verify canonical Node binary path and digest, executable permissions, a minimal explicit process-only G1 environment (`L3D_PORT=4177`, `L3D_ENABLE_TRIPOSR=0`), PATH independence, working directory and no Office/4178/G2/4179 collision.
3. Verify the **effective read/write/create and append rights** for the EXACT intended account to the private LOCAL3D data/jobs/audit directories. Current-session `Get-Acl` output does not prove this. Assess unattended logon policy/denies without exposing identities.
4. Separately approve deployment design for one disabled/installable task with LIMITED rights, single-instance guard, bounded logging and a realistic stop/rollback path, then separately authorize installing or enabling it.
5. Before launch and after launch, prove port 4177 binds **127.0.0.1 only** and `/v1/health` reports `G1_DEMO` and inference=false; G2 provider `STAGED_DISABLED`, invalid/truncated synthetic image rejected 422 before job with zero new jobs. Prove Office/4178 unchanged, G2/4179 off, no GPU/print.
6. With separate reboot approval, perform real Windows boot **without anyone logging in**, observe live G1 health and 422 and a clean stop/restart/rollback. Only then consider closing Issue #5.

No machine-account identity or authorization can be inferred from this milestone; `docs/security/g339-g1-disabled-autostart-review.json` remains unchanged and noninstallable.

## Security / production limits

G3.43 off-host encrypted backup remains **BLOCKED**, with both inspected internal disks BitLocker OFF. G3.42 same-host 34-package Python packages restore passed previously; this milestone does not repeat it. Python production Pillow 10.1.0 unchanged, Pillow 12.3 shadow not full CUDA or native-decoder guest isolation. Native OS isolation and untrusted input handling #4 remain OPEN. #3 is OPEN for uncalibrated physical mm, walls and print; historical real model source coverage still 2/9. All GLBs DRAFT, `printQualified=false`, `approvedForPrinter=false`, `fabricationAction=NONE`. NO GPU, cloud transfer, customer media, Office modification, OS/BitLocker/security changes, reboot, or physical printing.
