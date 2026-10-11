import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {assessUnattendedG1Observation,UnattendedG1ReviewError}
  from '../server/g344-unattended-g1-gate.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFile(path.join(root,p));
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const norm=x=>sha(Buffer.from(x.toString('utf8').replace(/\r\n/g,'\n')));
const copy=x=>structuredClone(x);
async function parents(){
 return Promise.all([
  read('docs/evidence/g3/g3-39-disabled-g1-boot-review-no-task-installed.json').then(JSON.parse),
  read('docs/evidence/g3/g3-43-independent-encrypted-backup-readiness-not-replicated.json').then(JSON.parse),
  read('docs/security/g339-g1-disabled-autostart-review.json').then(JSON.parse)
 ]);
}
const f=()=>{
 const o={
  schema:'local3d.g344.actual-readonly-unattended-g1-host-constraints.v1',
  observedDate:'2026-10-11',windowsLastBootDate:'2026-10-11',
  exactG339ServerSourceSha256Verified:true,processContextNodeResolved:true,
  processContextNodeVersion:'v24.19.0',
  processContextNodeBinarySha256:'3602f2bb1a10f2cbab4c36886218a33c1ab3db87290e73b033c46c77147d0237',
  nodeExecutableNotReparsePoint:true,
  nodeExecutableDirectoryAclReadableAsCurrentProbeUser:true,
  nodeExecutableDirectoryPresentInMachinePath:true,
  repoSourceDataJobsAuditAclMetadataReadableAsCurrentProbeUser:true,
  repoSourceDataJobsAuditNoDirectReparsePoint:true,
  persistentG1DataDirectoryExists:true,
  persistentG1JobsDirectoryExists:true,
  persistentG1AuditDirectoryExists:true,
  listener4177Count:0,listener4178Count:1,office4178OnlyLoopback:true,listener4179Count:0,
  scheduledTasksInventoryComplete:true,allScheduledTasksSeenCount:372,scopedMatchedScheduledTasksCount:0,
  servicesCimInventoryComplete:true,allServicesSeenCount:344,scopedMatchedServicesCount:0,
  startupCommandsInventoryComplete:true,allStartupCommandsSeenCount:29,scopedMatchedStartupCommandsCount:0,
  hasVerifiedIntendedLowPrivilegePrincipal:false,
  hasVerifiedNoninteractiveLogonForIntendedPrincipal:false,
  hasTestedFilesystemRightsAsIntendedPrincipal:false,
  hasVerifiedMachineBootPathUnderIntendedPrincipal:false,
  hasApprovedServiceInstallOrBootRestart:false,
  hasActuallyTestedG1WithoutLogin:false,hasActuallyTestedG1AfterReboot:false,
  hasVerifiedUnattendedStopAndRollback:false,
  thisProbeRegisteredOrModifiedWindowsTask:false,
  thisProbeStartedPersistentG1:false,
  thisProbeChangedOffice4178:false,
  thisProbeChangedOsAclFirewallUacOrDefender:false,
  thisProbeExecutedGpuOrModel:false,
  thisProbeModifiedPythonOrPrinter:false,
  eligibility:'BLOCKED_UNATTESTED_NONINTERACTIVE_PRINCIPAL'
 };
 return o;
};
const deny=(o,a,b,c)=>assert.throws(()=>assessUnattendedG1Observation(o,a,b,c),
 e=>e instanceof UnattendedG1ReviewError&&
  e.code==='G344_UNATTENDED_G1_REVIEW_BLOCKED');
test('G3.44 real-count synthetic fixture accepts only blocked review',async()=>{
 const [a,b,c]=await parents();const result=assessUnattendedG1Observation(f(),a,b,c);
 assert.equal(result.decision,'BLOCKED_UNATTESTED_NONINTERACTIVE_PRINCIPAL');
 assert.deepEqual([result.scheduledTasksReadOnlyEnumerated,
   result.servicesReadOnlyEnumerated,result.startupCommandsReadOnlyEnumerated],[372,344,29]);
 assert.equal(result.currentProbeAclMetadataAvailableNotEffectiveRights,true);
 for(const key of ['intendedLeastPrivilegePrincipalSelected',
  'intendedPrincipalNoninteractiveLogonVerified','effectiveWriteRightsAsIntendedPrincipalVerified',
  'nonInteractiveBootG1HealthG2DisabledAnd422Observed','bootWithoutLoginAndRollbackProven',
  'taskRegistered','taskEnabled','installAuthorized','allowPersistentG1','allowGpuOrModel',
  'allowPrint','printQualified','approvedForPrinter'])
  assert.equal(result[key],false,key);
 assert.equal(result.nextRequiredProofs.length,9);
 assert.equal(Object.isFrozen(result),true);
});
test('G3.44 rejects fake principal approval, OS modifications and G1 run claims',async()=>{
 const [a,b,c]=await parents();
 const keys=['hasVerifiedIntendedLowPrivilegePrincipal',
 'hasVerifiedNoninteractiveLogonForIntendedPrincipal',
 'hasTestedFilesystemRightsAsIntendedPrincipal',
 'hasVerifiedMachineBootPathUnderIntendedPrincipal',
 'hasApprovedServiceInstallOrBootRestart',
 'hasActuallyTestedG1WithoutLogin','hasActuallyTestedG1AfterReboot',
 'hasVerifiedUnattendedStopAndRollback','thisProbeRegisteredOrModifiedWindowsTask',
 'thisProbeStartedPersistentG1','thisProbeChangedOffice4178',
 'thisProbeChangedOsAclFirewallUacOrDefender','thisProbeExecutedGpuOrModel',
 'thisProbeModifiedPythonOrPrinter'];
 for(const key of keys){const o=f();o[key]=true;deny(o,a,b,c);}
});
test('G3.44 cannot upgrade CURRENT probe-user ACL metadata into service account rights',async()=>{
 const [a,b,c]=await parents();
 for(const key of ['nodeExecutableDirectoryAclReadableAsCurrentProbeUser',
 'repoSourceDataJobsAuditAclMetadataReadableAsCurrentProbeUser',
 'repoSourceDataJobsAuditNoDirectReparsePoint','nodeExecutableNotReparsePoint',
 'nodeExecutableDirectoryPresentInMachinePath','persistentG1DataDirectoryExists',
 'persistentG1JobsDirectoryExists','persistentG1AuditDirectoryExists']){
  const o=f();o[key]=false;deny(o,a,b,c);
 }
});
test('G3.44 checks frozen exact G1 source, Node version and Node binary digest',async()=>{
 const [a,b,c]=await parents();
 for(const [key,val] of [
  ['exactG339ServerSourceSha256Verified',false],
  ['processContextNodeResolved',false],
  ['processContextNodeVersion','v25.0.0'],
  ['processContextNodeBinarySha256','abcd'],
  ['processContextNodeBinarySha256','X'.repeat(64)]]){
  const o=f();o[key]=val;deny(o,a,b,c);
 }
});
test('G3.44 denies listener changes, Office address exposure and partial enumerations',async()=>{
 const [a,b,c]=await parents();
 for(const [key,val] of [
 ['listener4177Count',1],['listener4178Count',0],['listener4179Count',1],
 ['office4178OnlyLoopback',false],['scheduledTasksInventoryComplete',false],
 ['servicesCimInventoryComplete',false],['startupCommandsInventoryComplete',false],
 ['scopedMatchedScheduledTasksCount',1],['scopedMatchedServicesCount',1],
 ['scopedMatchedStartupCommandsCount',1],['allScheduledTasksSeenCount',0],
 ['allServicesSeenCount',0],['allStartupCommandsSeenCount',0]]){
  const o=f();o[key]=val;deny(o,a,b,c);
 }
});
test('G3.44 rejects invalid numeric/count/date and unknown sensitive fields',async()=>{
 const [a,b,c]=await parents();
 for(const [key,val] of [
  ['allScheduledTasksSeenCount',-1],['allServicesSeenCount',null],
  ['scopedMatchedServicesCount',Infinity],['listener4177Count','0'],
  ['windowsLastBootDate','2026-10-12'],['observedDate','yesterday'],
  ['eligibility','READY_INSTALL'],['schema','broken']]){
  const o=f();o[key]=val;deny(o,a,b,c);
 }
 for(const key of ['sid','username','password','machineAbsolutePath','secret']){
  const o=f();o[key]='private';deny(o,a,b,c);
 }
});
test('G3.44 rejects parent G3.39 or G3.43 becoming installable or closing issue 5',async()=>{
 const [a,b,c]=await parents();
 for(const [parentKey,parentVal] of [
 ['noScheduledTaskXmlRegistered',false],['noG1PersistentStartupPerformed',false],
 ['g1OperationalIssue5StillOpen',false]
 ]){const w=copy(a);w[parentKey]=parentVal;deny(f(),w,b,c);}
 for(const [k,v] of [
  ['G1Port4177BootActivated',true],['office4178Modified',true],
  ['modelGpuInferenceCount',1],['G1OperationalIssue5Open',false]
 ]){const w=copy(b);w[k]=v;deny(f(),a,w,c);}
});
test('G3.44 rejects G3.39 disabled draft switching to executable privileged task',async()=>{
 const [a,b,c]=await parents();
 for(const [key,val] of [
 ['enabled',true],['registrationState','REGISTERED'],
 ['taskSchedulerPrincipal','SYSTEM'],['logonType','SERVICE_ACCOUNT_PROVEN'],
 ['runLevel','HIGHEST'],['humanOperatorActivationApproved',true],
 ['safeRollbackAndStopApproved',true],['taskXmlCanBeRegisteredAsIs',true],
 ['taskInstallExecutionActions','INSTALL_NOW']]){
  const w=copy(c);w[key]=val;deny(f(),a,b,w);
 }
 const w=copy(c);w.environmentRules.L3D_ENABLE_TRIPOSR='1';deny(f(),a,b,w);
});
test('G3.44 public report links unchanged G3.39/G3.43/draft/source/probe and code SHA',async()=>{
 const proof=JSON.parse(await read('docs/evidence/g3/g3-44-actual-readonly-unattended-g1-account-not-proven.json'));
 assert.equal(proof.schema,'local3d.g344.actual-readonly-windows-g1-unattended-review-no-service.v1');
 for(const [field,file] of [
  ['parentG339DisabledG1PublicSha256','docs/evidence/g3/g3-39-disabled-g1-boot-review-no-task-installed.json'],
  ['parentG343BackupReadOnlyGatePublicSha256','docs/evidence/g3/g3-43-independent-encrypted-backup-readiness-not-replicated.json'],
  ['frozenDisabledG1DraftSha256','docs/security/g339-g1-disabled-autostart-review.json']
 ])assert.equal(proof[field],sha(await read(file)),field);
 for(const [field,file] of [
 ['frozenServerIndexNormalizedSha256','server/index.js'],
 ['readOnlyHostInventoryProbeNormalizedSha256','scripts/g3-44-readonly-unattended-g1-host.ps1'],
 ['failClosedGateSourceNormalizedSha256','server/g344-unattended-g1-gate.js']
 ])assert.equal(proof[field],norm(await read(file)),field);
 assert.equal(proof.decision.decision,'BLOCKED_UNATTESTED_NONINTERACTIVE_PRINCIPAL');
 assert.equal(proof.privateHostObservationReceiptSha256.length,64);
});
test('G3.44 public evidence is privacy-bounded and cannot claim real boot or print',async()=>{
 const buf=await read('docs/evidence/g3/g3-44-actual-readonly-unattended-g1-account-not-proven.json');
 const o=JSON.parse(buf);
 for(const key of ['futureServicePrincipalSelectedOrRightsProven',
 'futureBootNoLoginHealthOr422Proven','WindowsTaskRegisteredOrG1Port4177Started',
 'sourceCopiedOrHostAclChanged','office4178Modified','g2OrGpuStarted',
 'printQualified','approvedForPrinter'])
  assert.equal(o[key],false,key);
 assert.equal(o.printerActions,0);
 assert.equal(o.historicalG343OffHostRecoveryStillBlocked,true);
 assert.equal(o.githubIssue5StillOpen,true);
 assert.deepEqual([o.observedWindowsTaskCount,o.observedWindowsServiceCount,
  o.observedWindowsStartupCommandCount],[372,344,29]);
 assert.doesNotMatch(buf.toString('utf8'),/[CD]:[/\\]|S-1-5-[0-9]|Password=|clientEmail|apiToken|privateKey|userProfile|customerJobId/i);
});
