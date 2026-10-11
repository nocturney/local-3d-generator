import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {assessCompleteRestoredPythonVenv,FullRestoreGateError} from '../server/g342-full-venv-restore-contract.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=f=>fs.readFile(path.join(root,f));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const norm=b=>sha(Buffer.from(b.toString('utf8').replace(/\r\n/g,'\n')));
const fixture=()=>Promise.all([
 read('runtime/qa/g3/g342-real-restored-full-venv-cpu-qa.json').then(JSON.parse),
 read('docs/evidence/g3/g3-41-real-private-full-python-venv-snapshot-cpu-readback.json').then(JSON.parse)
]);
const copy=x=>JSON.parse(JSON.stringify(x));
const deny=(r,p)=>assert.throws(()=>assessCompleteRestoredPythonVenv(r,p),
 e=>e instanceof FullRestoreGateError&&e.code==='G342_RESTORE_NOT_VERIFIED');
test('G3.42 real separate full-venv restore: all 27966 files SHA and 269 CPU tests',async()=>{
 const [x,p]=await fixture(),decision=assessCompleteRestoredPythonVenv(x,p);
 assert.equal(decision.schema,'local3d.g342.full-package-same-machine-real-restore-dryrun-cpu.v1');
 assert.equal(decision.completeRestoredCopyShaMatchesAllOriginalBackupFiles,true);
 assert.equal(decision.actualRestoredInterpreterCpuRegressionPassed,269);
 assert.equal(decision.restoredAllPinnedDistributionCount,34);
 assert.equal(decision.sourceFileCount,27966);
 assert.equal(decision.sourceTotalBytes,5086619721);
 assert.equal(decision.restoredCloneRemovedAfterAllTests,true);
 assert.equal(decision.actualOffMachineOSDisasterRecoveryQualified,false);
 assert.equal(decision.decision,'SAME_HOST_FULL_PACKAGE_RESTORE_VERIFIED_EXTERNAL_SYSTEM_RECOVERY_STILL_BLOCKED');
});
test('G3.42 refuses incomplete, tampered, or claimed externally qualified restore',async()=>{
 const [x,p]=await fixture();
 for(const [key,value] of [
  ['allSourceAndRestoredSha256Verified',false],
  ['full34PackageVenvRestoredToIndependentTemporaryDirectory',false],
  ['restoredPythonSysPrefixAndNativePillowVerified',false],
  ['all34PinnedInstalledDistributionsInRestoredVenv',false],
  ['allRestoredFilesRehashedAfterUnitTests',false],
  ['allValidationRunOfflineAndCUDAHidden',false],
  ['productionAndOriginalBackupNeverModified',false],
  ['restoredTemporaryVenvCleanedUp',false],
  ['offMachinePortableDisasterRecoveryProven',true],
  ['fullSystemOSPythonBaseGpuDriversModelWeightsIncluded',true],
  ['nativeDecoderOSConfinementAttested',true],
  ['G1Persistent4177OrOffice4178Modified',true],
  ['PythonProductionUpgradeApproved',true],
  ['modelInferenceOrCudaGpuJobs',1]
 ]){
  const t=copy(x);t[key]=value;deny(t,p);
 }
});
test('G3.42 only exact 262+7 restored Python tests and complete original size are accepted',async()=>{
 const [x,p]=await fixture();
 for(const [k,val] of [
  ['restoredPythonQualityTestsPassed',261],
  ['restoredG2OfflineTestsPassed',0],
  ['sourceBackupFileCount',27965],
  ['sourceBackupBytes',5086619720],
  ['restoredNativeTrustedPillowFormatsTested',2],
  ['previousPrivateSnapshotManifestSha256','0'.repeat(64)]
 ]){
  const t=copy(x);t[k]=val;deny(t,p);
 }
});
test('G3.42 cannot use forged G3.41 parent backup or false historical issue closure',async()=>{
 const [r,p]=await fixture();
 let t=copy(p);t.actualOffMachineDisasterRecoveryNotValidated=false;deny(r,t);
 t=copy(p);t.privateFullVenvManifestSha256='0'.repeat(64);deny(r,t);
 t=copy(p);t.originalPythonFullVenvBackupActualFilesCopied=false;deny(r,t);
});
test('G3.42 source-chain SHA proof binds actual restore runner, manifest and the prior G3.41 proof',async()=>{
 const result=JSON.parse(await read('docs/evidence/g3/g3-42-full-venv-same-host-real-offline-restore.json'));
 assert.equal(result.schema,'local3d.g342.source-audited-full-python-venv-restored-and-269-cpu-tested.v1');
 for(const [k,f] of [
 ['originalG341PublicSha256','docs/evidence/g3/g3-41-real-private-full-python-venv-snapshot-cpu-readback.json'],
 ['originalPrivateWholeFileManifestSha256','runtime/qa/g3/venv-recovery/production-py311-pillow101-complete-packages-manifest.json'],
 ['originalOfficialPillowWheelSha256','runtime/qa/g3/rollback-wheelhouse/Pillow-10.1.0-cp311-cp311-win_amd64.whl'],
 ['originalProductionRequirementsSha256','engines/triposr/requirements-resolved-win-py311.txt'],
 ['privateRealRestoreAnd269CpuReceiptSha256','runtime/qa/g3/g342-real-restored-full-venv-cpu-qa.json']
 ])assert.equal(result[k],sha(await read(f)),k);
 for(const [k,f] of [
 ['originalBackupScriptNormalizedSha256','scripts/g3-41-private-full-venv-backup.py'],
 ['actualFullVenvRestoreCodeNormalizedSha256','scripts/g3-42-restore-complete-venv-offline-cpu.py'],
 ['readonlyPostCpuDriftSourceNormalizedSha256','scripts/g3-42-readonly-snapshot-drift.py'],
 ['strictReleaseGateSourceNormalizedSha256','server/g342-full-venv-restore-contract.js']
 ])assert.equal(result[k],norm(await read(f)),k);
 assert.deepEqual(result.decision,assessCompleteRestoredPythonVenv(...await fixture()));
});
test('G3.42 public report never contains per-file backup list, credentials or false GPU/printer approval',async()=>{
 const data=await read('docs/evidence/g3/g3-42-full-venv-same-host-real-offline-restore.json'),p=JSON.parse(data);
 for(const k of ['realSecondFullPythonVenvRestorationExecuted',
  'sourceAndRestoredFull27966FileShaChecksPassed',
  'restoredAll34PackagesUsableOnSameHost',
  'completeRestoredPython269CpuTestsPassed',
  'isolatedDisposableRestoreRemovedAfterSuccess',
  'sourcePrivateBackupStillAvailableLocally',
  'originalProductionVenvNotInstalledOrChanged',
  'sourceBackupNotPublishedToGitHub',
  'privateFileListNotPublished','noCurrentHostOrBackupReprobeOnReportReplay',
  'noFullOSOrNewMachinePortabilityProven',
  'noWindowsRestartOrStartupTaskRegistered',
  'noPillowProductionUpgrade','noExternalCustomerMedia',
  'untouchedIndependentOffice4178'])
 assert.equal(p[k],true,k);
 for(const k of ['realNativeDecoderOSIsolationAttested','persistentG1Port4177Started',
  'securityIssue4Resolved','manufacturingIssue3Resolved','operationalIssue5Resolved',
  'printQualified','approvedForPrinter'])
 assert.equal(p[k],false,k);
 assert.equal(p.GPUModelRuns,0);
 assert.equal(p.fabricationAction,'NONE');
 assert.doesNotMatch(data.toString('utf8'),/C:[/\\]|D:[/\\]|Lib\/site-packages|Scripts\/python|customerEmail|password|privateKey|clientToken/i);
});
