import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {
 WSB_CANDIDATE_PROFILE,validateOfflineSandboxProfile,
 decideIsolatedDecodeReadiness,SandboxPolicyError
} from '../server/isolation-readiness-contract.js';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const files={
 wsb:path.join(ROOT,'docs/security/g329-candidate-networkless-nohost-share.wsb'),
 report:path.join(ROOT,'docs/evidence/g3/g3-29-windows-sandbox-readiness-not-attestation.json'),
 parent:path.join(ROOT,'docs/evidence/g3/g3-28-integrated-structural-image-admission.json'),
 policy:path.join(ROOT,'server/isolation-readiness-contract.js'),
 probe:path.join(ROOT,'scripts/g3-29-host-readonly-probe.mjs'),
 worker:path.join(ROOT,'engines/triposr/worker.py')
};
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const stable=b=>sha(Buffer.from(b.toString('utf8').replace(/\r\n/g,'\n')));
const cap=()=>({
 schema:'local3d.g329.host-capability-readonly.v1',
 probeReadOnly:true,hostOsWindows:true,hostBuild:26300,
 optionalFeatureState:'Enabled',hypervisorPresent:true,
 clientLauncherResolvable:true
});
test('G3.29 proposed Microsoft .wsb candidate explicitly disables every host escape',async()=>{
 const text=(await fs.readFile(files.wsb,'utf8')).replace(/\r\n/g,'\n');
 assert.equal(text,WSB_CANDIDATE_PROFILE);
 const p=validateOfflineSandboxProfile(text);
 assert.equal(p.networking,'Disable');
 assert.equal(p.virtualizedGPU,'Disable');
 assert.equal(p.clipboard,'Disable');
 assert.equal(p.printer,'Disable');
 assert.equal(p.microphone,'Disable');
 assert.equal(p.webcam,'Disable');
 assert.equal(p.protectedClient,'Enable');
 assert.equal(p.hostMappedFolderCount,0);
 assert.equal(p.guestLogonCommandCount,0);
 assert.equal(p.guestLaunchAttempted,false);
 assert.equal(p.nativeDecoderContained,false);
 assert.equal(p.untrustedInputAllowed,false);
 assert.ok(!text.includes('<MappedFolders>')&&!text.includes('<LogonCommand>'));
});
test('G3.29 deny profile mutations including default networking GPU mapped host writable folder and guest command',()=>{
 const base=WSB_CANDIDATE_PROFILE;
 const mutations=[
  base.replace('<Networking>Disable','<Networking>Default'),
  base.replace('<Networking>Disable','<Networking>Enable'),
  base.replace('<vGPU>Disable','<vGPU>Enable'),
  base.replace('<ProtectedClient>Enable','<ProtectedClient>Disable'),
  base.replace('<ClipboardRedirection>Disable','<ClipboardRedirection>Default'),
  base.replace('<AudioInput>Disable','<AudioInput>Enable'),
  base.replace('<VideoInput>Disable','<VideoInput>Enable'),
  base.replace('<PrinterRedirection>Disable','<PrinterRedirection>Enable'),
  base.replace('</Configuration>', '<MappedFolders><MappedFolder><HostFolder>C:\\</HostFolder><ReadOnly>false</ReadOnly></MappedFolder></MappedFolders></Configuration>'),
  base.replace('</Configuration>', '<LogonCommand><Command>cmd.exe</Command></LogonCommand></Configuration>'),
  base.replace('4096','65000'),
  base.replace('4096','1024'),
  base.replace('</Configuration>','<!DOCTYPE foo></Configuration>'),
  base.replace('<Networking>Disable</Networking>',''),
  base.replace('<Networking>Disable</Networking>','<Networking>Disable</Networking><Networking>Default</Networking>'),
  base.replace(/  <vGPU>Disable<\/vGPU>\n/,''),
  base.replace('<Configuration>','<Configuration xmlns:x="urn:evil">'),
  base.trim(),
  '\ufeff'+base,
  base.replace(/\n/g,'\r\n'),
  base+'more',
  JSON.stringify(base)
 ];
 for(const [i,x] of mutations.entries())
  assert.throws(()=>validateOfflineSandboxProfile(x),
   e=>e instanceof SandboxPolicyError&&e.code==='G329_FAIL_CLOSED',String(i));
 for(const invalid of ['',undefined,null,Buffer.from(base),{},[]])
  assert.throws(()=>validateOfflineSandboxProfile(invalid),/invalid candidate policy/);
});
test('G3.29 even all host capability booleans cannot authorize a decoder security sandbox',()=>{
 const c=cap(),profile=validateOfflineSandboxProfile(WSB_CANDIDATE_PROFILE);
 const result=decideIsolatedDecodeReadiness(c,profile);
 assert.equal(result.capabilityOnlyCandidate,true);
 assert.equal(result.result,'BLOCKED_NO_RUNTIME_OS_ATTESTATION');
 assert.equal(result.allRequiredRuntimeSecurityGatesMet,false);
 assert.equal(result.readinessForTrustedSyntheticGuestExperiment,false);
 assert.equal(result.readinessForUntrustedCustomerImages,false);
 assert.equal(result.canEnableG2ImageInferenceAutomatically,false);
 assert.equal(result.canSetSecurityIssue4Resolved,false);
 assert.equal(result.canSetPrintQualified,false);
 assert.ok(result.blockers.includes('ACTUAL_GUEST_START_AND_TEARDOWN_UNVERIFIED'));
 assert.ok(result.blockers.includes('EFFECTIVE_GUEST_NETWORK_EGRESS_UNVERIFIED'));
 assert.ok(result.blockers.includes('PRODUCTION_G2_GPU_WORKER_NOT_CONFINED'));
 assert.ok(!result.blockers.includes('CLIENT_LAUNCHER_NOT_RESOLVED'));
 assert.equal(Object.isFrozen(result),true);
});
test('G3.29 feature missing, unknown, disabled or hypervisor absent blocks all clearance',()=>{
 const profile=validateOfflineSandboxProfile(WSB_CANDIDATE_PROFILE);
 for(const c of [
  {...cap(),optionalFeatureState:'Disabled'},
  {...cap(),optionalFeatureState:'EnablePending'},
  {...cap(),optionalFeatureState:'Unknown'},
  {...cap(),hypervisorPresent:false},
  {...cap(),hostOsWindows:false},
  {...cap(),hostBuild:0}
 ]){
  const x=decideIsolatedDecodeReadiness(c,profile);
  assert.equal(x.capabilityOnlyCandidate,false);
  assert.equal(x.readinessForUntrustedCustomerImages,false);
  assert.equal(x.canEnableG2ImageInferenceAutomatically,false);
 }
});
test('G3.29 refuse crafted schema, fake authorized flags and incomplete environment',()=>{
 const p=validateOfflineSandboxProfile(WSB_CANDIDATE_PROFILE);
 for(const c of [
  {...cap(),schema:'bad'},
  {...cap(),probeReadOnly:false},
  {...cap(),readinessForUntrustedCustomerImages:true},
  {...cap(),clientLauncherResolvable:'true'},
  {...cap(),hypervisorPresent:'true'},
  {...cap(),hostBuild:NaN},
  {...cap(),optionalFeatureState:'Ready'},
  {...cap(),hypervisorPresent:null},
  {schema:'local3d.g329.host-capability-readonly.v1'}
 ]){
  assert.throws(()=>decideIsolatedDecodeReadiness(c,p),
   e=>e instanceof SandboxPolicyError);
 }
 assert.throws(()=>decideIsolatedDecodeReadiness(cap(),{...p,hostMappedFolderCount:1}),SandboxPolicyError);
 assert.throws(()=>decideIsolatedDecodeReadiness(cap(),{...p,networking:'Enable'}),SandboxPolicyError);
});
test('G3.29 immutable public evidence links parent/worker/policy/host probe & explicitly leaves both Issues OPEN',async()=>{
 const raw=await fs.readFile(files.report);
 const p=JSON.parse(raw);
 assert.equal(p.schema,'local3d.g3.29.windows-sandbox-capability-only-not-isolation-attestation.v1');
 assert.equal(p.previousG328PublicSHA256,sha(await fs.readFile(files.parent)));
 assert.equal(p.trackedProductionG2WorkerUnmodifiedSHA256,sha(await fs.readFile(files.worker)));
 assert.equal(p.currentPolicySourceNormalizedSHA256,stable(await fs.readFile(files.policy)));
 assert.equal(p.readonlyProbeSourceNormalizedSHA256,stable(await fs.readFile(files.probe)));
 assert.equal(p.candidateWsbProfileNormalizedSHA256,stable(await fs.readFile(files.wsb)));
 assert.equal(p.readinessDecision.result,'BLOCKED_NO_RUNTIME_OS_ATTESTATION');
 assert.equal(p.readinessDecision.readinessForUntrustedCustomerImages,false);
 assert.equal(p.sandboxGuestActuallyLaunched,false);
 assert.equal(p.secureGuestIngressOrResultChannelImplemented,false);
 assert.equal(p.userUntrustedInputAccessApproved,false);
 assert.equal(p.existingG1Port4177Restarted,false);
 assert.equal(p.nativePillowDecoderExploitsRuledOut,false);
 assert.equal(p.productionTripoSRWorkerIsolationImplemented,false);
 assert.equal(p.securityIssue4Resolved,false);
 assert.equal(p.manufacturingIssue3Resolved,false);
 assert.equal(p.printQualified,false);
 assert.equal(p.approvedForPrinter,false);
 assert.equal(p.fabricationAction,'NONE');
 assert.equal(p.gpuInferenceRuns,0);
});
test('G3.29 sanitized report contains no usernames, tokens, host paths or machine identity',async()=>{
 const raw=await fs.readFile(files.report,'utf8');
 assert.doesNotMatch(raw,/D:[/\\]|C:[/\\]|\\\\Users\\\\|\\\\CHRIS\\\\|customerEmail|apiKey|secretToken|jobId|checkpointPath/);
 assert.doesNotMatch(raw,/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
 const p=JSON.parse(raw);
 assert.deepEqual(
  Object.keys(p.readOnlyHostCapabilitySnapshot).sort(),
  ['schema','probeReadOnly','hostOsWindows','hostBuild','optionalFeatureState','hypervisorPresent','clientLauncherResolvable'].sort()
 );
});
test('G3.29 live host probe source only queries capabilities (no Sandbox or GPU spawn)',async()=>{
 const src=await fs.readFile(files.probe,'utf8');
 assert.match(src,/Get-WindowsOptionalFeature/);
 assert.match(src,/Get-CimInstance/);
 assert.match(src,/Get-Command WindowsSandbox/);
 assert.doesNotMatch(src,/Enable-WindowsOptionalFeature|Disable-WindowsOptionalFeature|Set-WindowsOptionalFeature|Start-VM|Invoke-Item|Start-Process|Enable-NetFirewallRule|Set-MpPreference/);
 const prev=JSON.parse(await fs.readFile(files.report,'utf8'));
 assert.equal(prev.readOnlyHostCapabilitySnapshot.probeReadOnly,true);
});
