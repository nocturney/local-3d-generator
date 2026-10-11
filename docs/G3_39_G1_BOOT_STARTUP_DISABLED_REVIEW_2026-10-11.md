# LOCAL3D G3.39 — Windows G1 boot-time recovery review: real read-only inventory, disabled candidate

2026-10-11 | v0.2.39-g3-g1-boot-autostart-disabled-review

## Context

Chris Windows restarted independently at 06:42:27 Asia/Jerusalem on 2026-10-11. The separately owned local Office service on 127.0.0.1:4178 returned, while LOCAL3D fixture-only G1 on 127.0.0.1:4177 did not, and manual-only G2 4179 is off. G3.36 established correct G1 HTTP health plus nine early media rejects on a temporary, disposable loopback instance. That is NOT production persistence or a post-reboot live-4177 test. Operational Issue #5 remains OPEN.

## Actual read-only host observations made on Chris

scripts/g3-39-readonly-g1-boot-probe.ps1 runs read-only Windows commands and optionally records a SANITIZED original observation under ignored runtime/qa/g3, with no usernames, SIDs, command lines, credentials or local absolute paths.

It verified:
- Exact current server/index.js SHA matches the source already proved by G3.28; no production server source change.
- Node v24.19.0 resolves in this Remote Desktop Commander process context.
- G1 local port 4177: no listeners; independent Office port 4178: exactly one localhost listener; G2 manual port 4179: no listeners.
- Repo root and existing LOCAL3D persisted runtime/data file ACLs are **readable** in this current session. This does NOT establish rights for a future unattended service account; do not assume noninteractive ACL permission.
- Read-only Windows Scheduled Tasks name+action arguments, named Windows services, and Win32_StartupCommand scans completed with **zero explicitly matched LOCAL3D entries**. These are scoped pattern searches, not proof there are no generically named script/service launchers.
- Noninteractive service account identity, logon policy, startup after boot without an interactive login, stop/rollback method and permanent Task Scheduler configuration remain NOT ATTESTED.

**No real Windows Task Scheduler task, service, service account, credential or OS startup option was created, installed, enabled or modified.** No startup, G1 listener, G2 worker, GPU, Windows Sandbox guest, Office/4178 change or Windows security exception was performed.

## Disabled candidate

docs/security/g339-g1-disabled-autostart-review.json is a **draft ONLY** and intentionally not a registrable Task Scheduler XML. It proposes:
- Trigger at system startup; task remains disabled/unregistered until separate approval.
- Node.js starting only server/index.js from an operator-verified project checkout; localhost 127.0.0.1:4177.
- Exact process-local environment requirements L3D_ENABLE_TRIPOSR=0 and L3D_PORT=4177; G2 disabled permanently in the fixture-only task, no inference or printer access.
- Run level LIMITED; no default SYSTEM/HIGHEST privilege. Principal and logon mode UNRESOLVED until the operator identifies a verified least-privilege account and tests access to the G1 data directory without an interactive desktop.
- Preserve independently owned port 4178, preserve manual/off G2 4179, no secrets in Git, no automatic restart from this draft.
- On a separately approved activation: require GET /v1/health with G1_DEMO + inference=false; G2 provider STAGED_DISABLED; reject incomplete synthetic image before job with HTTP422 and zero jobs; confirm 4178 remains unchanged. Test a real unattended restart/stop/rollback before closing Issue #5.

server/g339-g1-autostart-review-contract.js is a pure fail-closed validator. It refuses any candidate that claims an installed task, privileged SYSTEM principal, GPU/TripoSR opt-in, all-interface bind, Office/4178 collision, automatic customer upload/print permission or already verified service rights, and validates the exact historical G3.36 temporary fixture-only evidence.

## Public immutable, source-linked proof

scripts/g3-39-assemble-disabled-boot-review.mjs:
- On initial --write-public, emits a filtered public observation docs/evidence/g3/g3-39-g1-boot-readonly-observation.json and immutable aggregate docs/evidence/g3/g3-39-disabled-g1-boot-review-no-task-installed.json; later runs do SHA-replay only, **not a new Windows scan**.
- Verifies private raw observation is limited to an exact allowlist of sanitized fields.
- SHA-links G3.38 prior release report, historical G3.36 temporary G1 proof, original G3.28 integrated image-preflight G1 source, unchanged server/index.js source, actual read-only PowerShell probe, disabled draft and strict reviewer code.
- Contains no machine account names, SIDs, local paths, passwords or private image/job contents.

tests/g339-windows-g1-boot-review.test.js adds six Node tests including adversarial altered principal, G2, port and task-registration claims, source identity changes and privacy checking. Historical G3.25–G3.38 public reports remain untouched.

## To rerun safely on Windows Chris

    .\scripts\g3-39-readonly-g1-boot-probe.ps1
    node scripts/g3-39-assemble-disabled-boot-review.mjs
    node --test tests/g339-windows-g1-boot-review.test.js

The first command only scans current state; it does not overwrite the frozen observation unless explicitly invoked with -WritePrivateObservation, and when one already exists its bytes must have equivalent sanitized values. The Node command validates frozen observations, not live host state. Do not treat published past state as evidence the port still has no listener later.

## Separate operator-controlled deployment prerequisites (NOT DONE)

1. Identify the authorized least-privilege Windows account for a task running without interactive login; verify actual required filesystem write/create permissions in its exact security context and don't infer from an ACL readable by another principal.
2. Select and approve task registration method and secret-free fixture-only PowerShell process launcher. The current disabled JSON draft cannot be installed directly.
3. Capture live before-change ports, check for generically named existing tasks, G1 data ownership/backup and a single-instance lock. Never alter independent Office/4178 or manual/GPU G2.
4. Obtain scope-limited explicit operator approval for install/start. Configure the target Node command and process-only G1=fixture flags, with logging/output protections.
5. Prove one actual dedicated loopback 4177 startup and shutdown, /health/provider 422 structural early rejection, no model/GPU/print and 4178 unaffected.
6. Prove persistence over an actual coordinated boot WITHOUT logged-in user, with re-check of cleanup, job interruption recovery, safe shutdown and rollback. Do not reboot without a separate plan.
7. Only then consider closing Issue #5. Issues #4 security/native decoder and #3 physical print continue independently.

## Constraints

Task Scheduler is not installed by this milestone. Pillow production10.1.0 remains untouched, G3.38 upgrade still blocked (no genuine full-v-env rollback or GPU/security proof). Native decoder OS-backed sandbox and real untrusted upload safety are NOT demonstrated. No other worker or GPU has been run. ALL 3D output stays DRAFT, printQualified=false, approvedForPrinter=false, fabricationAction=NONE.
