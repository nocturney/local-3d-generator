/** G3.44 SHA-chained evidence assembly from read-only, PRIVATE Chris receipt.
 * No Windows scan, task, process launch, service install or network action.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {assessUnattendedG1Observation} from '../server/g344-unattended-g1-gate.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const p={
 g339:'docs/evidence/g3/g3-39-disabled-g1-boot-review-no-task-installed.json',
 g343:'docs/evidence/g3/g3-43-independent-encrypted-backup-readiness-not-replicated.json',
 draft:'docs/security/g339-g1-disabled-autostart-review.json',
 source:'server/index.js',
 inventory:'scripts/g3-44-readonly-unattended-g1-host.ps1',
 gate:'server/g344-unattended-g1-gate.js',
 private:'runtime/qa/g3/g344-unattended-g1-host-observation.json',
 public:'docs/evidence/g3/g3-44-actual-readonly-unattended-g1-account-not-proven.json'
};
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const norm=b=>Buffer.from(b.toString('utf8').replace(/\r\n/g,'\n'),'utf8');
async function read(k){
 const dest=path.join(root,p[k]),stat=await fs.lstat(dest);
 if(!stat.isFile()||stat.isSymbolicLink()||stat.size<10||stat.size>600000)
  throw Error('G344 source absent, link or oversized: '+k);
 return fs.readFile(dest);
}
const inputs=['g339','g343','draft','source','inventory','gate','private'];
const values=await Promise.all(inputs.map(read));
const raw=Object.fromEntries(inputs.map((k,i)=>[k,values[i]]));
const prior339=JSON.parse(raw.g339),prior343=JSON.parse(raw.g343),
 draft=JSON.parse(raw.draft);
const observed=JSON.parse(raw.private.toString('utf8').replace(/^\uFEFF/,''));
if(sha(raw.g339)!=='87205d068435937e2c55c0fdd5da55daa93dd155e2f91baf37213667ba68561c' ||
 sha(raw.g343)!=='4f940e7bd32c3c11d7feaf686a23ef2ec1da68efe3bce70feb9834ee7a28b050' ||
 sha(raw.draft)!==prior339.explicitlyDisabledDraftTaskJsonSha256 ||
 sha(norm(raw.source))!==prior339.sourceCurrentG1NormalizedSha256 ||
 prior343.parentG339DisabledG1StartupPublicSha256!==sha(raw.g339) ||
 prior343.decision?.decision!=='BLOCKED_NO_APPROVED_ENCRYPTED_OFFHOST_RECOVERY'){
 throw Error('G344 immutable parent proof, G1 source or disabled draft drift');
}
const verdict=assessUnattendedG1Observation(observed,prior339,prior343,draft);
const report={
 schema:'local3d.g344.actual-readonly-windows-g1-unattended-review-no-service.v1',
 date:observed.observedDate,
 observedWindowsLastBootDate:observed.windowsLastBootDate,
 parentG339DisabledG1PublicSha256:sha(raw.g339),
 parentG343BackupReadOnlyGatePublicSha256:sha(raw.g343),
 frozenDisabledG1DraftSha256:sha(raw.draft),
 frozenServerIndexNormalizedSha256:sha(norm(raw.source)),
 readOnlyHostInventoryProbeNormalizedSha256:sha(norm(raw.inventory)),
 failClosedGateSourceNormalizedSha256:sha(norm(raw.gate)),
 privateHostObservationReceiptSha256:sha(raw.private),
 observedNodeV24BinarySha256:observed.processContextNodeBinarySha256,
 actualReadOnlyWindowsInventory:true,
 observedWindowsTaskCount:observed.allScheduledTasksSeenCount,
 observedWindowsServiceCount:observed.allServicesSeenCount,
 observedWindowsStartupCommandCount:observed.allStartupCommandsSeenCount,
 scopedMatchedLauncherCount:
  observed.scopedMatchedScheduledTasksCount+
  observed.scopedMatchedServicesCount+
  observed.scopedMatchedStartupCommandsCount,
 observedNodeInMachinePath:observed.nodeExecutableDirectoryPresentInMachinePath,
 observedRepoDataAclMetadataReadAsProbeUserOnly:true,
 futureServicePrincipalSelectedOrRightsProven:false,
 futureBootNoLoginHealthOr422Proven:false,
 WindowsTaskRegisteredOrG1Port4177Started:false,
 sourceCopiedOrHostAclChanged:false,
 office4178Modified:false,
 g2OrGpuStarted:false,
 printerActions:0,
 historicalG343OffHostRecoveryStillBlocked:true,
 githubIssue5StillOpen:true,githubIssue4StillOpen:true,githubIssue3StillOpen:true,
 printQualified:false,approvedForPrinter:false,fabricationAction:'NONE',
 decision:verdict
};
const buf=Buffer.from(JSON.stringify(report,null,2)+'\n','utf8');
const dst=path.join(root,p.public);
const existing=await fs.lstat(dst).catch(e=>e.code==='ENOENT'?null:Promise.reject(e));
if(existing){
 if(!existing.isFile()||existing.isSymbolicLink()||!(await fs.readFile(dst)).equals(buf))
  throw Error('G344 published evidence differs from read-only verified parent and private receipt');
}else{
 if(!process.argv.includes('--write-public')) throw Error('G344 initial evidence requires --write-public');
 await fs.writeFile(dst,buf,{flag:'wx'});
}
console.log('G344_REAL_HOST_UNATTENDED_G1_READONLY_PASS '+JSON.stringify({
 tasks:verdict.scheduledTasksReadOnlyEnumerated,
 services:verdict.servicesReadOnlyEnumerated,
 startupCommands:verdict.startupCommandsReadOnlyEnumerated,
 principalAttested:false,postBootHealthVerified:false,
 g1Started:false,officeChanged:false,gpuExecutions:0,
 decision:verdict.decision,publicSHA256:sha(buf)
}));
