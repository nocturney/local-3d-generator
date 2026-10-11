/** G3.42 fail-closed receipt for actual full-package same-host CPU restore. */
export class FullRestoreGateError extends Error{
 constructor(message){super(message);this.name='FullRestoreGateError';this.code='G342_RESTORE_NOT_VERIFIED';}
}
const assert=(ok,msg)=>{if(!ok)throw new FullRestoreGateError(msg);};
export function assessCompleteRestoredPythonVenv(receipt,priorG341){
 assert(receipt?.schema==='local3d.g342.actual-full-package-venv-restore-from-private-backup.v1','receipt schema');
 assert(receipt.previousPrivateSnapshotManifestSha256==='2c87d7cc2e7f1703a6c5c92521036f21630737ede2376020897faec94459df9d',
  'old SHA fingerprint missing');
 assert(receipt.sourceBackupBytes===5086619721&&receipt.sourceBackupFileCount===27966,'full source size differs');
 for(const field of [
  'allSourceAndRestoredSha256Verified','full34PackageVenvRestoredToIndependentTemporaryDirectory',
  'restoredPythonSysPrefixAndNativePillowVerified','all34PinnedInstalledDistributionsInRestoredVenv',
  'allRestoredFilesRehashedAfterUnitTests','allValidationRunOfflineAndCUDAHidden',
  'productionAndOriginalBackupNeverModified','restoredSourceIsSeparateFromLiveProduction',
  'restoredTemporaryVenvCleanedUp'
 ])assert(receipt[field]===true,'unverified independent full-venv recovery '+field);
 assert(receipt.restoredNativeTrustedPillowFormatsTested===3&&
  receipt.restoredPythonQualityTestsPassed===262&&receipt.restoredG2OfflineTestsPassed===7,
  'restored complete suite not certified');
 for(const key of [
  'fullSystemOSPythonBaseGpuDriversModelWeightsIncluded','offMachinePortableDisasterRecoveryProven',
  'untrustedImagesProcessed','nativeDecoderOSConfinementAttested',
  'G1Persistent4177OrOffice4178Modified','PythonProductionUpgradeApproved',
  'securityIssue4Resolved','printQualified'
 ])assert(receipt[key]===false,'unapproved production/security/disaster recovery assertion '+key);
 assert(receipt.modelInferenceOrCudaGpuJobs===0,'unexpected model/GPU run');
 assert(priorG341?.schema==='local3d.g341.actual-complete-python-venv-private-copy-cpu-revalidated.v1'&&
  priorG341.privateFullVenvManifestSha256===receipt.previousPrivateSnapshotManifestSha256&&
  priorG341.privateSnapshotFileCount===receipt.sourceBackupFileCount&&
  priorG341.privateSnapshotTotalBytes===receipt.sourceBackupBytes&&
  priorG341.originalPythonFullVenvBackupActualFilesCopied===true&&
  priorG341.actualOffMachineDisasterRecoveryNotValidated===true,
  'parent full snapshot evidence invalid');
 return Object.freeze({
  schema:'local3d.g342.full-package-same-machine-real-restore-dryrun-cpu.v1',
  completeRestoredCopyShaMatchesAllOriginalBackupFiles:true,
  restoredAllPinnedDistributionCount:34,
  actualRestoredInterpreterCpuRegressionPassed:269,
  exactProductionBaselinePillow:'10.1.0',
  copyFromBackupIntoDistinctOwnedDisposableRestore:true,
  originalPrivateBackupUnchanged:true,
  originalProductionVenvUnchanged:true,
  restoredCloneRemovedAfterAllTests:true,
  sourceFileCount:27966,
  sourceTotalBytes:5086619721,
  actualOffMachineOSDisasterRecoveryQualified:false,
  completeCudaModelDriverWeightsRecoveryQualified:false,
  productionPillowUpgradeAllowed:false,
  untrustedInputDecoderSandboxQualified:false,
  permanentG1ServiceBootQualified:false,
  manufacturingPrintQualified:false,
  issue3Open:true,issue4Open:true,issue5Open:true,
  decision:'SAME_HOST_FULL_PACKAGE_RESTORE_VERIFIED_EXTERNAL_SYSTEM_RECOVERY_STILL_BLOCKED'
 });
}
