# LOCAL3D G3.29 — Windows Sandbox capability evidence and offline-deny default security contract

2026-10-10 | v0.2.29-g3-windows-sandbox-readiness-contract-cpu

## Finding: feature readiness is not verified security isolation

The authorized Chris Windows 11 Pro host, build 26300, was inspected READ-ONLY. Windows optional feature Containers-DisposableClientVM reports **Enabled**; the host reports **HypervisorPresent=True**. The usual WindowsSandbox.exe/WindowsSandboxClient.exe launcher names were NOT resolved through Get-Command; this is NOT definitive proof that the app is missing or unusable, merely that the probe did not resolve those command names. No Windows Sandbox VM was launched or torn down, and no guest networking, filesystem, clipboard or RDP channel controls were actually tested. The previous handoff observed Sandbox disabled; this latest live feature-state observation supersedes that limited historical observation, but does not supersede the requirement for OS-enforced sandbox proof.

Microsoft's Windows Sandbox default configuration permits networking, clipboard and vGPU; these are not safe defaults for untrusted media. Official reference:
https://learn.microsoft.com/en-us/windows/security/application-security/application-isolation/windows-sandbox/windows-sandbox-configure-using-wsb-file
Prerequisite reference:
https://learn.microsoft.com/en-us/windows/security/application-security/application-isolation/windows-sandbox/windows-sandbox-install

## Candidate .wsb safety profile: NOT YET EXECUTED

A deterministic, exact-byte Windows Sandbox XML profile lives in docs/security/g329-candidate-networkless-nohost-share.wsb. It explicitly asks for:
- vGPU Disable: NO host CUDA/TripoSR inference in sandbox
- Networking Disable (do not rely on default)
- AudioInput/VideoInput Disable
- ProtectedClient Enable
- PrinterRedirection Disable
- ClipboardRedirection Disable
- MemoryInMB 4096 (requested capacity, not verified allocation)
- NO MappedFolders, NO LogonCommand, NO host paths/credentials, NO script execution

It is a DISCONNECTED BLANK GUEST CANDIDATE; it CANNOT parse an input image or return an output yet. Deliberately, no host read/write mapping, output folder, PowerShell guest boot script, client/customer upload or preinstalled Python runtime is included. A static profile is not an active OS policy until separately launched/tested, and even a launched Sandbox cannot protect GPU-powered G2 outside the guest by itself.

## Fail-closed readiness gate (source code, NOT live OS enforcement)

- server/isolation-readiness-contract.js: exact allowlisted .wsb profile validation (no dynamic XML interpolations, entities, host file paths or hidden defaults). Any changed Networking/vGPU/clipboard/ProtectedClient, guest logon command, mapped path, missing/duplicate tag, value or trailing content raises G329_FAIL_CLOSED.
- decides BLOCKED_NO_RUNTIME_OS_ATTESTATION regardless of favorable feature booleans. Emits explicit actionable blockers for guest launch/teardown proof, effective network egress, host filesystem/clipboard boundaries, a trusted synthetic guest decoding test, one-way transfer/provenance, independent G2 CPU-to-GPU path restrictions and pinned Python package advisories.
- scripts/g3-29-host-readonly-probe.mjs runs CIM/Get-WindowsOptionalFeature/Get-Command ONLY, emits a small allowlisted, sanitized host capabilities JSON; no machine or user names, no path, no model data or Windows settings edits.
- scripts/g3-29-assemble-sandbox-readiness.mjs links prior immutable G3.28 public report byte SHA, current policy/probe/profile normalized-line-ending source SHAs, unchanged G2 Python worker SHA and one-time sanitized host observation. First creation is explicit --write-public, subsequent no-flag immutable replays use the frozen historical host snapshot rather than falsely claiming a new probe. Probe can independently be rerun without altering the historical proof.
- tests/g329-windows-sandbox-readiness.test.js: all-profile controls, 22+ malicious/accidental profile mutations, fake runtime approval, omitted/extra fields, disabled capability and immutable privacy assertions; 8 new CPU-only tests.

## Design for future isolated CPU parser stage

Desired future dataflow (design only, not implemented):

  Node G2 API -> bounded structural preflight -> stage a single separately approved image in a temporary *untrusted ingress* boundary -> separately launched OS-isolated CPU decoder -> verified, re-encoded canonical image with new guest receipt -> host output verifier with SHA/size/type/depth/source provenance -> per-image operator consent and independent Office/GPU gates -> G2 worker.

Security prerequisites before any actual untrusted image:
1. A real guest starts with OS isolation, no effective egress, no mounted host user/Office directories, clipboard/printer/microphone/webcam redirection absent, with a trustworthy check of guest configuration and teardown.
2. Design a one-way least-privilege ingress and output channel without writable host mappings or clipboard. Mapping a host directory read-only into a guest does NOT itself provide a safe return channel; a writable mapping can persist malicious output and is explicitly forbidden in this G3.29 blank profile.
3. Install/ship a verified CPU-only decoder in the isolated guest by a separately authorized route; trust model, signing/hash pin, native decoder patch fixes and regression required.
4. Re-encoding canonical output is not a complete substitute for a hardened host GPU/image parser. The existing Pillow 10.1.0 worker still executes on the Windows host and remains open to dependency vulnerabilities.
5. Keep model/GPU inference outside the CPU sandbox, manually gated with separate per-image approval and the existing Office state/VRAM lease checks. Windows Sandbox vGPU is disabled.
6. The current optional feature Enabled flag and a formalized .wsb file alone NEVER grant an untrusted-upload, native-code-security, GPU or production print release.

## Existing gates and status

The running 4177 G1 service was not restarted, 4178 is an unrelated service, 4179 manual G2 off, no TripoSR process/GPU lease/new inference or Cloud/OS/Defender/Firewall/UAC/Office/printer action. Existing G3.28 real localhost API structural admission changes remain in checked-in code and fresh test instances, not proven on the old 4177 process. All 32 currently version-matched Pillow records remain unresolved for end-to-end exploitability, security Issue #4 OPEN. Manufacturing Issue #3 OPEN; 2/9 historical AI model runs, no verified mm/minimum wall/material/slicer/print QA; all outputs DRAFT, printQualified=false, approvedForPrinter=false, fabricationAction=NONE.

**Next G3.30:** CPU-only *future* sandbox ingress/egress protocol with SHA-pinned synthetic-only fixtures, format/size constraints, offline receipt and output validator, explicit denial when OS guest attestation is missing. No host OS security changes, downloads, GPU, new imaging packages, Windows Sandbox VM launch or customer uploads permitted until authorized and tested.
