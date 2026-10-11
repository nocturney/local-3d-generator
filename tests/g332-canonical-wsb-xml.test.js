import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {validateCanonicalOfflineWsb,CANONICAL_G332_WSB_PROFILE,CanonicalWsbPolicyError} from '../server/g332-canonical-wsb-contract.js';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const local=s=>path.join(ROOT,s);
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const lf=b=>Buffer.from(b.toString('utf8').replace(/\r\n/g,'\n'));
const rejects=x=>assert.throws(()=>validateCanonicalOfflineWsb(x),e=>e instanceof CanonicalWsbPolicyError);
test('G3.32 exactly published Microsoft VGpu element and explicit restrictive values',async()=>{
 const actual=lf(await fs.readFile(local('docs/security/g332-canonical-networkless-nohost-share.wsb'))).toString();
 assert.equal(actual,CANONICAL_G332_WSB_PROFILE);
 const p=validateCanonicalOfflineWsb(actual);
 assert.equal(p.canonicalGpuElementCase,'VGpu');
 assert.equal(p.networking,'Disable');
 assert.equal(p.virtualizedGPU,'Disable');
 assert.equal(p.clipboardRedirection,'Disable');
 assert.equal(p.audioInput,'Disable');
 assert.equal(p.videoInput,'Disable');
 assert.equal(p.printerRedirection,'Disable');
 assert.equal(p.protectedClient,'Enable');
 assert.equal(p.mappedHostFolders,0);
 assert.equal(p.logonCommands,0);
 assert.equal(p.effectiveGuestPolicyProven,false);
 assert.equal(p.safeUntrustedFileRelease,false);
 assert.equal(p.actualWindowsSandboxGuestLaunched,false);
});
test('G3.32 old report and old candidate preserved; exactly GPU tag capitalization differs',async()=>{
 const old=lf(await fs.readFile(local('docs/security/g329-candidate-networkless-nohost-share.wsb'))).toString();
 const current=CANONICAL_G332_WSB_PROFILE;
 assert.ok(old.includes('<vGPU>Disable</vGPU>'));
 assert.ok(current.includes('<VGpu>Disable</VGpu>'));
 assert.equal(old.replace('<vGPU>','<VGpu>').replace('</vGPU>','</VGpu>'),current);
 rejects(old);
});
test('G3.32 candidate rejects unsafe values, XML extension, missing tags and formatting drift',()=>{
 const x=CANONICAL_G332_WSB_PROFILE;
 const variants=[
  x.replace('<VGpu>Disable','<VGpu>Enable'),
  x.replace('<Networking>Disable','<Networking>Default'),
  x.replace('<ClipboardRedirection>Disable','<ClipboardRedirection>Enable'),
  x.replace('<ProtectedClient>Enable','<ProtectedClient>Disable'),
  x.replace('<AudioInput>Disable','<AudioInput>Enable'),
  x.replace('<PrinterRedirection>Disable','<PrinterRedirection>Enable'),
  x.replace('<VGpu>','<vGPU>'),
  x.replace('<Networking>Disable</Networking>',''),
  x.replace('<Networking>Disable</Networking>','<Networking>Disable</Networking><Networking>Disable</Networking>'),
  x.replace('<Configuration>','<Configuration data="untrusted">'),
  x.replace('</Configuration>','<ExtraTag>test</ExtraTag></Configuration>'),
  x.replace('<MemoryInMB>4096','<MemoryInMB>2048'),
  x.replace(/\n/g,'\r\n'),
  x.trim(),x+' ', '\ufeff'+x
 ];
 for(const variant of variants)rejects(variant);
 for(const v of [null,undefined,{},[],Buffer.from(x),''])rejects(v);
});
test('G3.32 immutable proof binds G3.31 report, old candidate and new source',async()=>{
 const report=JSON.parse(await fs.readFile(local('docs/evidence/g3/g3-32-canonical-wsb-xml-static-review.json')));
 assert.equal(report.schema,'local3d.g332.canonical-wsb-static-xml-no-os-confinement.v1');
 assert.equal(report.previousG331ImmutableSha256,hash(await fs.readFile(local('docs/evidence/g3/g3-31-windows-sandbox-launch-discovery-only.json'))));
 assert.equal(report.historicalG329CandidateNormalizedSha256,hash(lf(await fs.readFile(local('docs/security/g329-candidate-networkless-nohost-share.wsb')))));
 assert.equal(report.newCanonicalCandidateNormalizedSha256,hash(lf(await fs.readFile(local('docs/security/g332-canonical-networkless-nohost-share.wsb')))));
 assert.equal(report.newCandidateSourceNormalizedSha256,hash(lf(await fs.readFile(local('server/g332-canonical-wsb-contract.js')))));
 assert.equal(report.dotNetReadonlyXMLVerifierNormalizedSha256,hash(lf(await fs.readFile(local('scripts/g3-32-verify-wsb-xml-readonly.ps1')))));
 assert.equal(report.canonicalCandidateDiffConfirmedExactlyTagCase,true);
 assert.equal(report.legacyCandidateRuntimeValidOrInvalid,'NOT_TESTED');
});
test('G3.32 report explicitly refuses VM safety, customer upload, GPU and printing authorization',async()=>{
 const p=JSON.parse(await fs.readFile(local('docs/evidence/g3/g3-32-canonical-wsb-xml-static-review.json')));
 assert.equal(p.dotNetReadOnlyXMLValidationPerformedSeparately,true);
 assert.equal(p.dotNetValidationNotOsEffectivePolicyAttestation,true);
 assert.equal(p.interactiveWindowsSandboxClientQualified,false);
 assert.equal(p.operatingSystemSandboxLaunched,false);
 assert.equal(p.effectiveNoNetworkOrHostIsolationProven,false);
 assert.equal(p.hostGpuGuestSharingEnabled,false);
 assert.equal(p.mappedHostFoldersAdded,false);
 assert.equal(p.newPackagesInstalled,false);
 assert.equal(p.windowsOrOfficePolicyChanged,false);
 assert.equal(p.realGpuModelRuns,0);
 assert.equal(p.securityIssue4Resolved,false);
 assert.equal(p.manufacturingIssue3Resolved,false);
 assert.equal(p.printQualified,false);
 assert.equal(p.fabricationAction,'NONE');
});
test('G3.32 .NET host XML parse source explicitly disables XML entity resolution',async()=>{
 const ps=await fs.readFile(local('scripts/g3-32-verify-wsb-xml-readonly.ps1'),'utf8');
 assert.match(ps,/DtdProcessing.*Prohibit/);
 assert.match(ps,/XmlResolver=\$null/);
 assert.match(ps,/canonicalVGpuTagFound=\$true/);
 assert.match(ps,/explicitDenyPolicyFields=6/);
 assert.match(ps,/guestLaunched=\$false/);
 assert.match(ps,/osSecurityPolicyChanged=\$false/);
});
