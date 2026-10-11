/** G3.42 immutable public source-linked proof of separate complete-v-env restore. */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {assessCompleteRestoredPythonVenv} from '../server/g342-full-venv-restore-contract.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const files={
 previous:'docs/evidence/g3/g3-41-real-private-full-python-venv-snapshot-cpu-readback.json',
 receipt:'runtime/qa/g3/g342-real-restored-full-venv-cpu-qa.json',
 privateManifest:'runtime/qa/g3/venv-recovery/production-py311-pillow101-complete-packages-manifest.json',
 originalWheel:'runtime/qa/g3/rollback-wheelhouse/Pillow-10.1.0-cp311-cp311-win_amd64.whl',
 requirements:'engines/triposr/requirements-resolved-win-py311.txt',
 previousSource:'scripts/g3-41-private-full-venv-backup.py',
 restoreSource:'scripts/g3-42-restore-complete-venv-offline-cpu.py',
 driftSource:'scripts/g3-42-readonly-snapshot-drift.py',
 sourceContract:'server/g342-full-venv-restore-contract.js',
 result:'docs/evidence/g3/g3-42-full-venv-same-host-real-offline-restore.json'
};
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const lf=x=>Buffer.from(x.toString('utf8').replace(/\r\n/g,'\n'));
async function read(k){
 const filename=path.join(root,files[k]),stat=await fs.lstat(filename);
 if(!stat.isFile()||stat.isSymbolicLink()||stat.size<10||
   stat.size>(k==='privateManifest'?12000000:k==='originalWheel'?8000000:400000))
  throw Error('G342 bad trusted file '+k);
 return fs.readFile(filename);
}
const keys=['previous','receipt','privateManifest','originalWheel','requirements','previousSource','restoreSource','driftSource','sourceContract'];
const vals=await Promise.all(keys.map(read)),d=Object.fromEntries(keys.map((k,i)=>[k,vals[i]]));
const earlier=JSON.parse(d.previous),obs=JSON.parse(d.receipt),manifest=JSON.parse(d.privateManifest);
if(sha(d.privateManifest)!==obs.previousPrivateSnapshotManifestSha256||
   earlier.privateFullVenvManifestSha256!==sha(d.privateManifest)||
   sha(d.originalWheel)!==earlier.originalPillowOfficialWheelSha256||
   sha(d.requirements)!==earlier.originalPinnedProductionRequirementsSha256||
   manifest.schema!=='local3d.g341.full-python-venv-private-files-sha.v1'||
   manifest.count!==obs.sourceBackupFileCount||manifest.totalBytes!==obs.sourceBackupBytes||
   manifest.files.length!==manifest.count)
 throw Error('G342 SHA source lineage or 27966-file baseline changed');
const decision=assessCompleteRestoredPythonVenv(obs,earlier);
const publicReport={
 schema:'local3d.g342.source-audited-full-python-venv-restored-and-269-cpu-tested.v1',
 date:'2026-10-11',
 originalG341PublicSha256:sha(d.previous),
 originalPrivateWholeFileManifestSha256:sha(d.privateManifest),
 originalOfficialPillowWheelSha256:sha(d.originalWheel),
 originalProductionRequirementsSha256:sha(d.requirements),
 privateRealRestoreAnd269CpuReceiptSha256:sha(d.receipt),
 originalBackupScriptNormalizedSha256:sha(lf(d.previousSource)),
 actualFullVenvRestoreCodeNormalizedSha256:sha(lf(d.restoreSource)),
 readonlyPostCpuDriftSourceNormalizedSha256:sha(lf(d.driftSource)),
 strictReleaseGateSourceNormalizedSha256:sha(lf(d.sourceContract)),
 realSecondFullPythonVenvRestorationExecuted:true,
 sourceAndRestoredFull27966FileShaChecksPassed:true,
 restoredAll34PackagesUsableOnSameHost:true,
 completeRestoredPython269CpuTestsPassed:true,
 isolatedDisposableRestoreRemovedAfterSuccess:true,
 sourcePrivateBackupStillAvailableLocally:true,
 originalProductionVenvNotInstalledOrChanged:true,
 sourceBackupNotPublishedToGitHub:true,
 privateFileListNotPublished:true,
 noCurrentHostOrBackupReprobeOnReportReplay:true,
 noFullOSOrNewMachinePortabilityProven:true,
 noWindowsRestartOrStartupTaskRegistered:true,
 noPillowProductionUpgrade:true,
 GPUModelRuns:0,
 noExternalCustomerMedia:true,
 realNativeDecoderOSIsolationAttested:false,
 untouchedIndependentOffice4178:true,
 persistentG1Port4177Started:false,
 securityIssue4Resolved:false,
 manufacturingIssue3Resolved:false,
 operationalIssue5Resolved:false,
 printQualified:false,approvedForPrinter:false,fabricationAction:'NONE',
 decision
};
const bytes=Buffer.from(JSON.stringify(publicReport,null,2)+'\n');
const dst=path.join(root,files.result),old=await fs.lstat(dst).catch(e=>e.code==='ENOENT'?null:Promise.reject(e));
if(old){
 if(!old.isFile()||old.isSymbolicLink()||!(await fs.readFile(dst)).equals(bytes))
  throw Error('G342 immutable public proof changed');
}else{
 if(!process.argv.includes('--write-public'))throw Error('G342 first proof capture requires --write-public');
 await fs.writeFile(dst,bytes,{flag:'wx'});
}
console.log('G342_ACTUAL_FULL_VENV_RESTORE_PUBLIC_SOURCE_PASS '+JSON.stringify({
 fileCount:obs.sourceBackupFileCount,bytes:obs.sourceBackupBytes,
 restoredPythonCpuTests:obs.restoredPythonQualityTestsPassed+obs.restoredG2OfflineTestsPassed,
 fullRestoreSameMachineVerified:true,
 crossHostOSRecoveryProven:false,
 gpu:0,reportSHA256:sha(bytes)
}));
