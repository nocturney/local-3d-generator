# LOCAL3D G3.32 — canonical Microsoft VGpu Windows Sandbox candidate XML (NO VM launch)

2026-10-11 | v0.2.32-g3-canonical-wsb-xml-readonly-cpu

## Motivation: documented configuration spelling

G3.29 produced a deliberately disconnected, networking-disabled Windows Sandbox XML candidate with a lowercase-v uppercase-GPU tag (vGPU). Microsoft's official Windows Sandbox example uses the exact tag name VGpu. XML names are normally case-sensitive; therefore G3.32 eliminates this avoidable compatibility ambiguity by making a NEW candidate matching Microsoft's published example. We do NOT claim the G3.29 spelling would fail in an actual Sandbox; neither variant was launched.

Official example: https://learn.microsoft.com/en-us/windows/security/application-security/application-isolation/windows-sandbox/windows-sandbox-sample-configuration

## Verified in code and via read-only host .NET XML parse

The new candidate docs/security/g332-canonical-networkless-nohost-share.wsb differs from the G3.29 .wsb profile by exactly the capitalization of its opening and closing VGpu tags; all other bytes after line-ending normalization are identical. This candidate explicitly requests VGpu Disable, Networking Disable, AudioInput Disable, VideoInput Disable, ProtectedClient Enable, PrinterRedirection Disable, ClipboardRedirection Disable and MemoryInMB 4096. It maps ZERO host folders, contains no LogonCommand, no customer paths, and no scripts.

server/g332-canonical-wsb-contract.js implements a strict, fail-closed exact-text candidate profile validator. Unexpected XML, missing/duplicated tags, unsafe values, changed case/whitespace or host mapping fail. Its return value never implies a guest was launched or that no-network/host-file/clipboard security actually worked.

scripts/g3-32-verify-wsb-xml-readonly.ps1 reads only this known local file with Windows .NET XmlReader configured with DtdProcessing Prohibit and a null XmlResolver. The actual Chris read-only test passed: exactly eight element children, six explicitly Disable values, one ProtectedClient Enable and a 4096 MB memory value; no host maps and no boot command. This only validates local XML syntax/tree, NOT that Windows Sandbox accepts or enforces the candidate. Zero VM launches.

Immutable proof scripts/g3-32-assemble-canonical-wsb-proof.mjs SHA-links the prior G3.31 public proof, historical G3.29 .wsb source, new candidate, validator and .NET checker. No earlier public evidence or historical files are modified. One-time creation uses --write-public, later no-flag runs replay exact bytes. docs/evidence/g3/g3-32-canonical-wsb-xml-static-review.json contains only public SHA strings, aggregate policy flags and explicit refusal to authorize guest use, untrusted images, GPU or printer. tests/g332-canonical-wsb-xml.test.js covers exact source identity, negative mutations, immutable SHA ancestry and security nonapproval.

## CPU-only verification

From Chris authorized repo root:

    node scripts/g3-32-assemble-canonical-wsb-proof.mjs
    node --test tests/g332-canonical-wsb-xml.test.js
    .\scripts\g3-32-verify-wsb-xml-readonly.ps1
    npm run test:all

## Boundaries, next work and open Issues

Windows Sandbox optional feature Enabled and hypervisor observed; actual Sandbox application command, AppX or interactive user registration still not qualified from Session 0. The guest has never been launched/tested; native Pillow decoder remains on host and old pinned OSV dependency advisories unresolved. Real guest egress, host share and clipboard isolation, safe image one-way transfer and guest output provenance remain OPEN in Security Issue #4. No customer image upload approval or production GPU. Manufacturing Issue #3 OPEN; no physical mm/wall/material/slicer/printer qualification, every output DRAFT and printQualified=false.

No OS policy edits, Windows Store installs, optional feature toggles, VM launches, remote Office/4178, old G1/4177 restart, G2/4179 start, GPU inference or fabrication occurred in G3.32.

G3.33 permitted next: CPU-only contract/verification runbook for an explicitly approved future interactive Windows Sandbox synthetic-only smoke test, with falsifiable runtime isolation observations. A *live* guest test or application install requires separate authorization; do not assume a well-formed .wsb is OS-enforced security.
