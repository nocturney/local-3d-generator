# LOCAL3D G3.36 — G1 fixture-only post-reboot activation readiness (without starting live G1)

2026-10-11 | v0.2.36-g3-g1-ephemeral-recovery-readiness

## Why

After the Windows Chris reboot at 06:42:27 local time on October 11, 2026, the G1 fixture-only service normally on 127.0.0.1:4177 was no longer listening. Read-only searches of names, Windows services, startup commands and scheduled-task action strings found no explicit LOCAL3D autostart. This is NOT proof that no generic launcher exists. The independent Office-related 4178 remains in use by a separate process. LOCAL3D G2 manual port 4179 is OFF and GPU work is not permitted.

G3.36 establishes that the **current** main server/index.js (including G3.28 bounded image admission) runs safely in a new temporary CPU-only fixture G1 instance, independently of 4177. It DOES NOT start or repair the persistent Windows service or install autostart.

## One real source-verified CPU-only test on Chris

scripts/g3-36-g1-fixture-recovery-smoke.mjs:
- Refuses to construct ANY app when the running process has L3D_ENABLE_TRIPOSR=1. Normal fixture-only test leaves G2 adapter absent.
- Makes only a bounded TCP **read-only** connection attempt to localhost 4177, never to 4178. On the recorded run the result was NOT_LISTENING.
- Creates a disposable, owned temporary fixture+job directory; creates a fresh server with the **current source** via createApp and binds only to localhost 127.0.0.1 in the safe test port range 20000..29999 (never 4177, 4178 or 4179).
- Verifies GET /v1/health returns schema local3d.health.v1, status G1_DEMO, inference=false, localOnly=true, autoGpuQueue=false, printing=false.
- Verifies GET /v1/providers exposes TripoSR only as STAGED_DISABLED, canStart=false; exactly one runnable fixture-demo provider.
- Verifies each of the three already-existing SHA-locked G3.27 original 64x64 PNG/JPEG/WebP images rejects three truncated variants **422 BAD_IMAGE_STRUCTURE before any job**: 9/9 rejects and zero jobs.
- Verifies all three COMPLETE original tiny images are accepted as simulation-only G1 jobs with HTTP 201: 3/3.
- Closes its temporary listener and removes its isolated temporary files in a finally block, including when the test fails.

G3.36 does NOT contact or alter the independent port 4178, and it never binds persistent 4177.

The successful actual run generated a private raw JSON observation under ignored runtime/qa/g3/g336-g1-fixture-smoke.json. A redacted, safe observation record was also frozen and committed as docs/evidence/g3/g3-36-g1-ephemeral-fixture-only-observation.json. It contains only aggregate/pass/fail/port-state labels; no source images, job IDs, local absolute paths or credentials.

scripts/g3-36-assemble-fixture-recovery-readiness.mjs adds an immutable historical public proof, docs/evidence/g3/g3-36-g1-ephemeral-recovery-readiness-not-live-activation.json, SHA-bound to the actual frozen observation, G3.35 upgrade gate, the original G3.28 integrated 422 contract, **unchanged exact Windows server source** from G3.28, strict image parser and original G3.27 synthetic image manifest. No-flag proof replay performs no fresh port check, which is explicitly documented.

tests/g336-g1-fixture-activation-readiness.test.js includes a new real ephemeral G1 end-to-end test (not a mock), a fail-closed G2 environment guard test, evidence source guard and negative security/persistent-activation checks.

## Safe commands

From the verified authorized checkout:

    npm run smoke:g3:g1-recovery
    npm run proof:g3:g1-recovery
    npm run test:all

The smoke command creates a **temporary local server** on a non-production loopback test port and closes it. It does NOT create or start the real persistent Windows G1 instance at 4177. The proof command only replays immutable source/hash evidence and does not recheck the port.

## Proposed manual activation (NOT performed)

After an operator explicitly authorizes restoration of the dedicated fixture-only G1 service:

1. Confirm nobody else owns loopback 4177 and confirm the independently owned Office service on 4178 before and after. Make no changes to 4178.
2. Review Windows user/service account context, permissions and ownership of LOCAL3D persisted data directory, and any generic startup task not matched by the earlier read-only scoped search.
3. Pin L3D_ENABLE_TRIPOSR to 0 **for G1's process only**, ensure L3D_PORT is 4177 and the bind address remains loopback. Do not start G2 or install weights.
4. Start exactly one LOCAL3D G1 process with npm start from the verified source checkout, with an agreed hidden/autostart mechanism (no automatic OS/security/Firewall change).
5. Read GET /v1/health to confirm service=ready/status=G1_DEMO/inference=false and providers report TripoSR STAGED_DISABLED. Confirm 422 header-only media rejection and no created jobs, and verify 4178 remains stable.
6. Validate restart recovery independently, capturing clean startup and shutdown without unintended service conflicts. Reopen Issue #5 if anything is uncertain; do not claim closure from ephemeral test evidence.

No service start, task creation/update, Windows restart, system security adjustment, printer, actual model/GPU job, arbitrary customer file or cloud request was made during this milestone.

## Remaining blockers

Issue #5 stays OPEN because 127.0.0.1:4177 is not restored/live and no approved autostart mechanism has been installed or tested. Security Issue #4 OPEN, manufacturing Issue #3 OPEN, model output approval and physical mm/min wall/material/slicer/printer QA not established. G3.35 Pillow upgrade status remains BLOCKED_SHADOW_ONLY. G1 test-only success is not permission to run G2 GPU inference or pass untrusted user media to a native image decoder.

Suggested next safe milestone G3.37: durable, read-only Windows startup task/service reconciliation and a concrete candidate Task Scheduler XML/script that cannot enable G2, with offline validation and an explicit operator activation gate; do not install/enable the scheduled task without separate approval.
