/**
 * LOCAL3D G3.29 immutable public-only Windows Sandbox READINESS report.
 * --write-public: ONE read-only CIM/feature probe and writes sanitized proof.
 * no-flag: deterministic replay using the frozen host snapshot in that report.
 * Does not start Windows Sandbox, edit OS settings, run models or access media.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {
 WSB_CANDIDATE_PROFILE,validateOfflineSandboxProfile,
 decideIsolatedDecodeReadiness
} from '../server/isolation-readiness-contract.js';
import {probeWindowsHostReadOnly} from './g3-29-host-readonly-probe.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const files={
 parent:path.join(root,'docs/evidence/g3/g3-28-integrated-structural-image-admission.json'),
 contract:path.join(root,'server/isolation-readiness-contract.js'),
 probe:path.join(root,'scripts/g3-29-host-readonly-probe.mjs'),
 profile:path.join(root,'docs/security/g329-candidate-networkless-nohost-share.wsb'),
 worker:path.join(root,'engines/triposr/worker.py'),
 output:path.join(root,'docs/evidence/g3/g3-29-windows-sandbox-readiness-not-attestation.json')
};
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const normalized=buf=>Buffer.from(buf.toString('utf8').replace(/\r\n/g,'\n'),'utf8');
async function safe(name){
 const s=await fs.lstat(files[name]);
 if(s.isSymbolicLink()||!s.isFile()||s.size<12||s.size>120000)
  throw new Error('G3.29 unsafe/missing source '+name);
 return fs.readFile(files[name]);
}
const [parentRaw,contractRaw,probeRaw,profileRaw,workerRaw]=await Promise.all(
 ['parent','contract','probe','profile','worker'].map(safe));
const parent=JSON.parse(parentRaw);
if(parent.schema!=='local3d.g3.28.integrated-bounded-image-admission-not-native-sandbox.v1'||
   parent.nativePillowSandboxImplemented!==false||
   parent.securityIssue4Resolved!==false||parent.manufacturingIssue3Resolved!==false||
   parent.existing4177ServiceRestarted!==false||
   parent.printQualified!==false||
   parent.originalProductionPythonWorkerStillUnmodifiedSha256!==sha(workerRaw))
 throw new Error('G3.29 FAIL CLOSED: altered G3.28 historical parent or worker');
const profileString=profileRaw.toString('utf8').replace(/\r\n/g,'\n');
if(profileString!==WSB_CANDIDATE_PROFILE)
 throw new Error('G3.29 FAIL CLOSED: candidate .wsb profile drift');
const policy=validateOfflineSandboxProfile(profileString);
const existing=await fs.lstat(files.output).catch(e=>e.code==='ENOENT'?null:Promise.reject(e));
if(!existing&&!process.argv.includes('--write-public'))
 throw new Error('G3.29 missing historical snapshot: --write-public first once');
if(existing&&(!existing.isFile()||existing.isSymbolicLink()||existing.size>12000))
 throw new Error('G3.29 invalid immutable proof output');
const prior=existing?JSON.parse(await fs.readFile(files.output,'utf8')):null;
const host=prior?prior.readOnlyHostCapabilitySnapshot:probeWindowsHostReadOnly();
const decision=decideIsolatedDecodeReadiness(host,policy);
const proof={
 schema:'local3d.g3.29.windows-sandbox-capability-only-not-isolation-attestation.v1',
 reviewedDate:'2026-10-10',
 previousG328PublicSHA256:sha(parentRaw),
 previousG328VersionTag:'v0.2.28-g3-integrated-image-container-admission-cpu',
 currentPolicySourceNormalizedSHA256:sha(normalized(contractRaw)),
 readonlyProbeSourceNormalizedSHA256:sha(normalized(probeRaw)),
 candidateWsbProfileNormalizedSHA256:sha(normalized(profileRaw)),
 trackedProductionG2WorkerUnmodifiedSHA256:sha(workerRaw),
 candidatePolicy:policy,
 readOnlyHostCapabilitySnapshot:host,
 readinessDecision:decision,
 officialMicrosoftConfigurationReference:'https://learn.microsoft.com/en-us/windows/security/application-security/application-isolation/windows-sandbox/windows-sandbox-configure-using-wsb-file',
 sandboxFeatureEnabledAloneIsInsufficient:true,
 sandboxGuestActuallyLaunched:false,
 OSNetworkEgressTested:false,
 OSHostFilesystemConfinementTested:false,
 secureGuestIngressOrResultChannelImplemented:false,
 nativePillowDecoderExploitsRuledOut:false,
 productionTripoSRWorkerIsolationImplemented:false,
 userUntrustedInputAccessApproved:false,
 existingG1Port4177Restarted:false,
 officeOrFirewallOrDefenderOrUacChanged:false,
 VMOrSandboxStarted:false,
 gpuInferenceRuns:0,
 newDependenciesInstalled:0,
 securityIssue4Resolved:false,
 manufacturingIssue3Resolved:false,
 printQualified:false,approvedForPrinter:false,fabricationAction:'NONE'
};
const bytes=Buffer.from(JSON.stringify(proof,null,2)+'\n');
if(existing){
 if(!(await fs.readFile(files.output)).equals(bytes))
  throw new Error('G3.29 immutable report changed');
}else{
 await fs.writeFile(files.output,bytes,{flag:'wx'});
}
console.log('G3_29_READINESS_CONTRACT_PASS '+JSON.stringify({
 optionalFeatureState:host.optionalFeatureState,
 hypervisorPresent:host.hypervisorPresent,
 launcherResolvable:host.clientLauncherResolvable,
 capabilityOnly:decision.capabilityOnlyCandidate,
 securityRelease:false,
 sandboxLaunched:false,
 reportSHA256:sha(bytes)
}));
