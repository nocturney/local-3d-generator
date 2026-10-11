# LOCAL3D G3.31 — Windows Sandbox launcher / Store app registration diagnostics (READ-ONLY)

2026-10-11 | v0.2.31-g3-windows-sandbox-client-discovery-cpu

## Grounded finding on Chris

From a remote service-context process (Windows Session 0), Windows 11 Pro build 26300 reported Containers-DisposableClientVM Enabled and HypervisorPresent=true. VirtualMachinePlatform feature was Enabled; the separate Microsoft-Hyper-V-Hypervisor optional feature was Disabled. Do NOT infer that the disabled component means no functioning hypervisor: the separate live HypervisorPresent observation is true. These are separate facts, and no VM was started to test practical availability.

New G3.31 read-only checks covered **both** WindowsSandbox.exe (legacy entrypoint) and **wsb** (Microsoft's documented Windows Sandbox CLI on Windows 11 24H2+). In the current remote service context: neither command name resolved, neither the System32 legacy executable nor the per-user wsb.exe alias was found, and read-only current-user, all-users and provisioned AppX queries, StartApps and SystemApps enumeration each returned zero matching Windows Sandbox registrations (all query statuses OK). This is a scope-limited negative observation, **not a definitive claim that an interactive operator session cannot see a Sandbox app**. The probe itself runs in Windows Session 0. It did not launch a Sandbox, install Store apps, trigger an upgrade, change Windows features, change policy or run any model.

Microsoft's published Windows Sandbox CLI documentation names the command wsb and the subcommands start, list, exec, share, connect, stop; these can create or modify guest and host state. G3.31 **does NOT execute any of them**:
https://learn.microsoft.com/en-us/windows/security/application-security/application-isolation/windows-sandbox/windows-sandbox-cli

Microsoft's Windows Sandbox versions/FAQ documentation explains the newer Windows 11 24H2+ app updates through Microsoft Store, while older versions and service/interactive contexts may differ. We did not assume either edition/version is actually installed:
https://learn.microsoft.com/en-us/windows/security/application-security/application-isolation/windows-sandbox/windows-sandbox-versions
https://learn.microsoft.com/en-us/windows/security/application-security/application-isolation/windows-sandbox/windows-sandbox-faq

## Implemented

- scripts/g3-31-readonly-launcher-inventory.mjs: bounded Windows PowerShell read-only probe; reports only booleans, bounded matching counts and probe-query statuses. It omits machine name, usernames, package paths, package IDs, credentials and private media. It checks Get-Command, optional features, Get-AppxPackage (current/all users), Get-AppxProvisionedPackage, Get-StartApps, SystemApps folder-name existence and service Session 0. No package installation or guest operations.
- server/g331-sandbox-launch-route-contract.js: strict key/type validation, rejects fake readiness fields and malformed/unavailable inventory. If no route is visible returns NOT_FOUND_IN_CURRENT_READ_ONLY_PROBE_SCOPE, not a claim of system-wide absence. Even if a route IS visible, result remains CANDIDATE_ROUTE_DISCOVERED_NOT_TESTED and **all security/guest/GPU authorizations remain false**.
- docs/evidence/g3/g3-31-readonly-host-observation.json: sanitized frozen record transcribed from a successful direct, read-only Remote Desktop Commander host-probe output. A subsequent nested PowerShell attempt timed out without a successful new observation; **no fresh live scan is claimed by the report assembler**. The record is not a signed OS attestation.
- scripts/g3-31-assemble-launch-route-evidence.mjs: immutable SHA-linked public proof against the frozen observation, G3.30/G3.29 public reports and unchanged production Node server / G2 Python worker source. First proof file is created with --write-public; later no-flag SHA replays reproduce the source snapshot without touching Windows.
- tests/g331-sandbox-launch-route.test.js: positive and adversarial structural, classification, spoofed authorization, source lineage/privacy tests.
- docs/evidence/g3/g3-31-windows-sandbox-launch-discovery-only.json: public historical observation plus source SHAs and explicit NO native OS sandbox/production release.

## Decision and controlled next work

Practical blocker in the current remote tooling context: **no supported Sandbox app launch route was discovered**. Before any VM smoke test, an operator/integrated GUI with an interactive Windows user session must identify the app, confirm any Store client install/upgrade state and obtain explicit permission for a controlled **trusted synthetic CPU-only** guest session. Installation/upgrading an app, initiating an OS restart, changing an OS feature/policy, creating a VM, granting any host folder access, allowing Sandbox networking, or deploying a guest agent are separate activities not authorized in G3.31.

Do NOT fall back to a default Windows Sandbox profile: its networking, clipboard and vGPU may be enabled. G3.29's static .wsb candidate disabled those features but has not been executed or OS-attested; G3.30 host-generated synthetic receipts are NOT guest proof.

No changes to running G1 4177, Office's independent 4178, manual G2 4179, Windows security/UAC/Defender/Firewall, model/GPU inference, TripoSR package/weights, customer assets, cloud, printer or fabrication. Security Issue #4 OPEN: real native Pillow decoder confinement and compatibility/patches unresolved. Manufacturing Issue #3 OPEN: all outputs DRAFT; no physical mm/wall/material/slicer/printer QA. Existing two of nine historical model images only; seven further GPU runs each require explicit separate approval.

**G3.32 next:** a CPU-only *attestation prerequisite and falsifiable evidence contract* that distinguishes caller-provided log text from verifiable independent OS guest/network/file confinement. Do not accept a fabricated guest receipt as real OS isolation. No Sandbox launch before separate authorization.
