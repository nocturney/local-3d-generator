/** G3.41 pure fail-closed machine-local full Python venv backup contract. */
export class SnapshotEvidenceError extends Error {
 constructor(message){super(message);this.name='SnapshotEvidenceError';this.code='G341_UNVERIFIED_SNAPSHOT';}
}
const must=(ok,msg)=>{if(!ok)throw new SnapshotEvidenceError(msg);};
const hex=x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x);
export function assessPrivateFullVenvSnapshot(receipt,priorG340){
 must(receipt?.schema==='local3d.g341.actual-private-full-python-venv-snapshot.v1','private snapshot schema');
 must(receipt.allSourceSnapshotFilesHashVerified===true,'missing full source-copy SHA check');
 must(Number.isSafeInteger(receipt.totalSnapshotFileCount)&&receipt.totalSnapshotFileCount>=25000&&receipt.totalSnapshotFileCount<=35000,'file count implausible');
 must(Number.isSafeInteger(receipt.totalSnapshotFileBytes)&&receipt.totalSnapshotFileBytes>4*1024**3&&receipt.totalSnapshotFileBytes<7*1024**3,'size implausible');
 must(hex(receipt.snapshotPrivateFileManifestSHA256),'manifest SHA absent');
 must(receipt.snapshotSourceRequirementsSHA256==='887970cf973af2a619bfa6d09ab5a28bf6cd9cc3f24867eefaf35e73f72c21a7','34-package pinned manifest drift');
 must(receipt.originalOfficialPillowRecoveryWheelSHA256==='0f7c276c05a9767e877a0b4c5050c8bee6a6d960d7f0c11ebda6b99746068c2a','original wheel drift');
 must(receipt.all34PinnedDistributionsAccessibleFromClone===true&&
  receipt.snapshotContainsFullPythonVenvPackages===true&&
  receipt.snapshotIsOfflineMachineLocalOnly===true,'no independent file clone');
 const cpu=receipt.isolatedClonedInterpreterChecks;
 must(cpu?.schema==='local3d.g341.full-cloned-venv-real-cpu-readback.v1'&&
  cpu?.cloneInterpreterProven===true&&cpu?.originalVenvImported===false&&
  cpu?.pinnedInstalledDistributionsVerified===34&&cpu?.pillowVersion==='10.1.0',
  'clone Python not independently qualified');
 const samples=cpu.originalThreeTrustedRgbSamples;
 must(samples&&typeof samples==='object'&&!Array.isArray(samples)&&
  Object.keys(samples).sort().join('|')==='JPEG|PNG|WEBP',
  'clone trusted three format results missing');
 for(const result of Object.values(samples))must(hex(result),'untrusted clone original sample RGB digest');
 for(const k of [
  'modelWeightsOrCustomerDataIncluded','productionVenvFilesModifiedOrReinstalled',
  'backupACLAndHardwarePortabilityFullyQualified',
  'actualCompleteOSDisasterRecoveryQualified',
  'productionPillowUpgradeAuthorized','nativeDecoderOSSandboxAttested','printQualified'
 ])must(receipt[k]===false,'invalid security/production claim '+k);
 must(receipt.gpuOrModelRuns===0,'G2 GPU run not allowed');
 must(priorG340?.schema==='local3d.g340.verified-original-pillow-wheel-and-trusted-isolated-restore.v1'&&
  priorG340?.upstreamPyPiPublishedSha256===receipt.originalOfficialPillowRecoveryWheelSHA256&&
  priorG340?.fullOriginal34PackageEnvironmentNotRestored===true&&
  priorG340?.securityIssue4Resolved===false,'prior Pillow original wheel proof absent');
 for(const [fmt,sha] of Object.entries(priorG340.decision?{
  PNG:'PNG',JPEG:'JPEG',WEBP:'WEBP'
 }:{})){
  must(hex(samples[fmt]),'invalid clone RGB SHA '+fmt);
 }
 return Object.freeze({
  schema:'local3d.g341.full-python-venv-private-snapshot-cpu-validated.v1',
  realAllPackageVenvFilesystemSnapshotVerified:true,
  clonedPythonInterpreterExecutesFromSnapshot:true,
  clonedPinnedProductionPackageMetadataCount:34,
  clonedPillow101NativeSafeFormatsTested:3,
  snapshotFiles:receipt.totalSnapshotFileCount,
  snapshotBytes:receipt.totalSnapshotFileBytes,
  sourceAndBackupShaManifestVerified:true,
  sourceReadOnly:true,
  originalOfficialPillowRollbackWheelAvailable:true,
  standaloneCopyOfFullSystemPythonOrOS:false,
  realModelWeightsOrUserDataBackupIncluded:false,
  hardwareIndependentDisasterRecoveryProven:false,
  fullInstalledEnvironmentRestoreToAnotherMachineVerified:false,
  fullTripoSRGpuModelCompatibilityAfterCandidateUpgradeVerified:false,
  productionPillowUpgradeAllowed:false,
  noUntrustedMediaNativeSandboxAttested:true,
  issue4Open:true,issue5Open:true,issue3Open:true,
  printQualified:false,approvedForPrinter:false,fabricationAction:'NONE',
  decision:'FULL_LOCAL_VENV_SNAPSHOT_VALIDATED_GPU_OS_SECURITY_GATES_STILL_OPEN'
 });
}
