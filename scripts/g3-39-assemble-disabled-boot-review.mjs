/**
 * G3.39 one-time frozen read-only Windows G1 boot observation + disabled draft.
 * Later replays never re-probe Windows or touch Task Scheduler/4177/4178.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {reviewDisabledBootCandidate} from '../server/g339-g1-autostart-review-contract.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const p={
 g338:'docs/evidence/g3/g3-38-python-upgrade-readiness-and-synthetic-rollback.json',
 g336:'docs/evidence/g3/g3-36-g1-ephemeral-recovery-readiness-not-live-activation.json',
 g328:'docs/evidence/g3/g3-28-integrated-structural-image-admission.json',
 server:'server/index.js',
 ps:'scripts/g3-39-readonly-g1-boot-probe.ps1',
 draft:'docs/security/g339-g1-disabled-autostart-review.json',
 contract:'server/g339-g1-autostart-review-contract.js',
 private:'runtime/qa/g3/g339-g1-boot-readonly-observation.json',
 public:'docs/evidence/g3/g3-39-g1-boot-readonly-observation.json',
 proof:'docs/evidence/g3/g3-39-disabled-g1-boot-review-no-task-installed.json'
};
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const lf=b=>Buffer.from(b.toString('utf8').replace(/\r\n/g,'\n'));
async function read(k){
 const path_=path.join(root,p[k]),stat=await fs.lstat(path_);
 if(!stat.isFile()||stat.isSymbolicLink()||stat.size<12||stat.size>200000)
  throw Error('G339 invalid read-only input '+k);
 return fs.readFile(path_);
}
const names=['g338','g336','g328','server','ps','draft','contract','private'];
const reads=await Promise.all(names.map(read)),d=Object.fromEntries(names.map((k,i)=>[k,reads[i]]));
const historicG338=JSON.parse(d.g338),historicG336=JSON.parse(d.g336),historicG328=JSON.parse(d.g328);
const draft=JSON.parse(d.draft);
const observed=JSON.parse(d.private.toString('utf8').replace(/^\uFEFF/,''));
const allowed=[
 'schema','observedDate','sourceG328ExactSHA256Verified','verifiedNodeVersion',
 'nodeExecutableResolved','expectedBindLocalhostOnly',
 'listener4177Count','listener4178Count','listener4179Count',
 'office4178ObservedOnlyLoopback','repoRootAclReadable','persistentDataDirExists','persistentDataAclReadable',
 'taskInventorySucceeded','relatedExistingTaskActionCount','serviceInventorySucceeded',
 'relatedExistingNamedServiceCount','startupCommandInventorySucceeded',
 'relatedExistingStartupCommandCount','serviceAccountRuntimeIdentityAndRightsAttested',
 'safeBootAutostartActuallyTested','canStartWithoutInteractiveLoginProven',
 'taskCreatedOrModified','persistentG1Started','gpuEnabledOrModelExecuted',
 'office4178Modified','osSecuritySettingsModified','eligibilityForAutomaticG1Activation'
];
if(Object.keys(observed).sort().join('|')!==allowed.sort().join('|')||
   historicG338.schema!=='local3d.g338.pillow-upgrade-preflight-and-rollback-simulation-not-deployment.v1'||
   historicG338.productionUpgradePerformed!==false||
   historicG336.schema!=='local3d.g336.fixture-only-g1-post-reboot-smoke-not-service-restoration.v1'||
   historicG328.currentIntegratedWindowsServerSha256!==
   sha(Buffer.from(lf(d.server).toString('utf8').replace(/\n/g,'\r\n'),'utf8')))
 throw Error('G339 source ancestry or observed output structure changed');
const assessment=reviewDisabledBootCandidate(draft,observed,historicG336);
const snapshot=Buffer.from(JSON.stringify(observed,null,2)+'\n','utf8');
const publicPath=path.join(root,p.public),existing=await fs.lstat(publicPath).catch(e=>e.code==='ENOENT'?null:Promise.reject(e));
if(existing){
 if(!existing.isFile()||existing.isSymbolicLink()||!(await fs.readFile(publicPath)).equals(snapshot))
  throw Error('G339 frozen public boot snapshot mismatch');
}else{
 if(!process.argv.includes('--write-public'))throw Error('G339 first creation requires --write-public');
 await fs.writeFile(publicPath,snapshot,{flag:'wx'});
}
const proof={
 schema:'local3d.g339.actual-readonly-g1-boot-discovery-disabled-task-proposal.v1',
 date:'2026-10-11',
 latestPriorG338ImmutableSha256:sha(d.g338),
 earlierG336EphemeralG1Sha256:sha(d.g336),
 earlierG328AdmissionSha256:sha(d.g328),
 sourceCurrentG1NormalizedSha256:sha(lf(d.server)),
 readonlyWindowsBootProbeNormalizedSourceSha256:sha(lf(d.ps)),
 explicitlyDisabledDraftTaskJsonSha256:sha(d.draft),
 offlineFailClosedReviewSourceNormalizedSha256:sha(lf(d.contract)),
 sanitizedWindowsObservationSha256:sha(snapshot),
 subsequentReplayDoesNotProbeHost:true,
 observationIsSessionScopedNotWindowsBootProof:true,
 noScheduledTaskXmlRegistered:true,
 noPrivilegedPrincipalSelected:true,
 noPasswordOrSidPublished:true,
 noG1PersistentStartupPerformed:true,
 noG2GpuOrOffice4178Changes:true,
 actualGpuInferenceRuns:0,
 securityIssue4StillOpen:true,manufacturingIssue3StillOpen:true,
 g1OperationalIssue5StillOpen:true,
 printQualified:false,approvedForPrinter:false,fabricationAction:'NONE',
 review:assessment
};
const bytes=Buffer.from(JSON.stringify(proof,null,2)+'\n','utf8');
const dest=path.join(root,p.proof),old=await fs.lstat(dest).catch(e=>e.code==='ENOENT'?null:Promise.reject(e));
if(old){
 if(!old.isFile()||old.isSymbolicLink()||!(await fs.readFile(dest)).equals(bytes))
  throw Error('G339 public review proof drift');
}else{
 if(!process.argv.includes('--write-public'))throw Error('G339 first snapshot requires --write-public');
 await fs.writeFile(dest,bytes,{flag:'wx'});
}
console.log('G339_WINDOWS_G1_DISABLED_BOOT_REVIEW_PASS '+JSON.stringify({
 current4177:observed.listener4177Count,
 current4178:observed.listener4178Count,
 potentialNamedTask:observed.relatedExistingTaskActionCount,
 principalAttested:false,taskInstalled:false,
 decision:assessment.candidateStatus,gpu:0,
 reportSHA256:sha(bytes)
}));
