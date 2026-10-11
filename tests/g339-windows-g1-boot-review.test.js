import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {readFrozenG346Server} from './fixtures/g347-frozen-g346-server.mjs';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {BootReviewError,reviewDisabledBootCandidate} from '../server/g339-g1-autostart-review-contract.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFile(path.join(root,p));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const norm=b=>sha(Buffer.from(b.toString('utf8').replace(/\r\n/g,'\n')));
const fixtures=()=>Promise.all([
 read('docs/security/g339-g1-disabled-autostart-review.json').then(JSON.parse),
 read('docs/evidence/g3/g3-39-g1-boot-readonly-observation.json').then(JSON.parse),
 read('docs/evidence/g3/g3-36-g1-ephemeral-recovery-readiness-not-live-activation.json').then(JSON.parse)
]);
const deny=(draft,obs,parent)=>assert.throws(()=>reviewDisabledBootCandidate(draft,obs,parent),
 e=>e instanceof BootReviewError&&e.code==='G339_BOOT_REVIEW_UNSAFE');
test('G3.39 review is disabled, least-privilege unresolved and cannot install or start 4177',async()=>{
 const r=reviewDisabledBootCandidate(...await fixtures());
 assert.equal(r.schema,'local3d.g339.g1-disabled-autostart-review-only.v1');
 assert.equal(r.candidateStatus,'SAFE_TO_REVIEW_NOT_INSTALLABLE');
 assert.equal(r.loopbackG1Port4177CurrentlyNoListener,true);
 assert.equal(r.independentOffice4178ListenerMustNeverBeRebound,true);
 assert.equal(r.unknownTaskOwnersOrOtherNamesMayStillExist,true);
 for(const key of ['resolvedServicePrincipalOrNoninteractiveRights','verifiedG1ServiceBootAfterLogout',
  'candidateRegistered','canInstallScheduledTaskAutomatically',
  'canLaunchPersistent4177Automatically','canEnableG2Automatically',
  'canCloseIssue5','canCloseIssue4','canApprovePrinter'])
  assert.equal(r[key],false,key);
 assert.equal(r.preActivationRequirements.length,9);
 assert.equal(Object.isFrozen(r),true);
});
test('G3.39 draft refuses privileged SYSTEM/start-enabled/G2/GPU/Office/nonloopback edits',async()=>{
 const [a,b,c]=await fixtures(),copy=x=>JSON.parse(JSON.stringify(x));
 for(const [key,value] of [
  ['enabled',true],['registrationState','INSTALLED'],['taskXmlCanBeRegisteredAsIs',true],
  ['runLevel','HIGHEST'],['taskSchedulerPrincipal','SYSTEM'],
  ['executableCandidate','powershell.exe'],['bindHost','0.0.0.0'],
  ['gpuEngine','ENABLED'],['simulatorOnly',false],
  ['independentPort4178MustRemainUntouched',false],
  ['humanOperatorActivationApproved',true],
  ['startupWithoutLoggedInUserVerified',true],['storageAclUnderIntendedPrincipalVerified',true]
 ]){
  const v=copy(a);v[key]=value;deny(v,b,c);
 }
 let v=copy(a);v.argvCandidate=['server/index.js','--enable-gpu'];deny(v,b,c);
 v=copy(a);v.environmentRules.L3D_ENABLE_TRIPOSR='1';deny(v,b,c);
 v=copy(a);v.environmentRules.L3D_PORT='4178';deny(v,b,c);
});
test('G3.39 host observation needs exact 4178 preservation, 4177 vacant, complete scoped scans',async()=>{
 const [a,b,c]=await fixtures(),copy=x=>JSON.parse(JSON.stringify(x));
 for(const [key,value] of [
  ['listener4177Count',1],['listener4178Count',0],['listener4179Count',1],
  ['taskInventorySucceeded',false],['relatedExistingTaskActionCount',1],
  ['persistentDataAclReadable',false],['repoRootAclReadable',false],
  ['serviceAccountRuntimeIdentityAndRightsAttested',true],
  ['persistentG1Started',true],['taskCreatedOrModified',true],
  ['office4178Modified',true],['canStartWithoutInteractiveLoginProven',true]
 ]){
  const v=copy(b);v[key]=value;deny(a,v,c);
 }
});
test('G3.39 no forged previous temporary G1 proof can imply a permanent G1 restoration',async()=>{
 const [a,b,c]=await fixtures(),clone=x=>JSON.parse(JSON.stringify(x));
 let t=clone(c);t.permanentAutostartInstalled=true;deny(a,b,t);
 t=clone(c);t.observation.malformedInput422BeforeJobCount=0;deny(a,b,t);
 t=clone(c);t.existingG1Port4177ReopenedByMilestone=true;deny(a,b,t);
});
test('G3.39 read-only proof SHA binds previous G3.38, G3.36, original G3.28 and unmodified server',async()=>{
 const x=JSON.parse(await read('docs/evidence/g3/g3-39-disabled-g1-boot-review-no-task-installed.json'));
 const inputs=[
 ['latestPriorG338ImmutableSha256','docs/evidence/g3/g3-38-python-upgrade-readiness-and-synthetic-rollback.json'],
 ['earlierG336EphemeralG1Sha256','docs/evidence/g3/g3-36-g1-ephemeral-recovery-readiness-not-live-activation.json'],
 ['earlierG328AdmissionSha256','docs/evidence/g3/g3-28-integrated-structural-image-admission.json'],
 ['explicitlyDisabledDraftTaskJsonSha256','docs/security/g339-g1-disabled-autostart-review.json'],
 ['sanitizedWindowsObservationSha256','docs/evidence/g3/g3-39-g1-boot-readonly-observation.json']
 ];
 for(const [key,name] of inputs)assert.equal(x[key],sha(await read(name)),key);
 for(const [key,name] of [
 ['readonlyWindowsBootProbeNormalizedSourceSha256','scripts/g3-39-readonly-g1-boot-probe.ps1'],
 ['offlineFailClosedReviewSourceNormalizedSha256','server/g339-g1-autostart-review-contract.js']
 ])assert.equal(x[key],norm(await read(name)),key);
 assert.equal(x.sourceCurrentG1NormalizedSha256,norm(readFrozenG346Server()),'frozen historic G3.39 source');
 assert.deepEqual(x.review,reviewDisabledBootCandidate(...await fixtures()));
});
test('G3.39 evidence discloses offline review only and does not publish machine identity or credentials',async()=>{
 const bytes=await read('docs/evidence/g3/g3-39-disabled-g1-boot-review-no-task-installed.json');
 const report=JSON.parse(bytes);
 for(const key of ['noScheduledTaskXmlRegistered','noPrivilegedPrincipalSelected','noPasswordOrSidPublished',
  'noG1PersistentStartupPerformed','noG2GpuOrOffice4178Changes','actualGpuInferenceRuns'])
  assert.equal(report[key],key==='actualGpuInferenceRuns'?0:true,key);
 assert.equal(report.observationIsSessionScopedNotWindowsBootProof,true);
 assert.equal(report.securityIssue4StillOpen,true);
 assert.equal(report.g1OperationalIssue5StillOpen,true);
 assert.equal(report.printQualified,false);
 assert.doesNotMatch(bytes.toString('utf8'),/[CD]:[/\\]|S-1-5-\d|Password=|clientEmail|apiToken|privateKey/i);
});
