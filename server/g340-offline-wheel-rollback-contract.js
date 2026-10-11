/**
 * G3.40 zero-side-effect offline Pillow isolated restore receipt validation.
 * Forbid claiming full Python venv security/production rollbacks.
 */
export class IsolatedRestoreError extends Error {
 constructor(message){super(message);this.name='IsolatedRestoreError';this.code='G340_BAD_RESTORE_RECEIPT';}
}
const assert=(ok,m)=>{if(!ok)throw new IsolatedRestoreError(m);};
const isSHA=x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x);
const STAGES=['BASELINE_ISOLATED','CANDIDATE_ISOLATED','RESTORED_BASELINE_ISOLATED'];
const VERSIONS=['10.1.0','12.3.0','10.1.0'];
export function checkIsolatedPillowRestore(record, earlierG339){
 assert(record?.schema==='local3d.g340.real-isolated-pillow-wheel-rollback-only.v1','record schema');
 assert(record.trustedOriginalSyntheticFixtureSha256==='171c9b8cc010cd8f05620a70617122a5c97ec074c951cc0ef27ad35ccf1cdbdb','original samples');
 assert(record.productionRequirementsSha256==='887970cf973af2a619bfa6d09ab5a28bf6cd9cc3f24867eefaf35e73f72c21a7','req baseline');
 assert(record.pillow101OfficialPyPiSha256==='0f7c276c05a9767e877a0b4c5050c8bee6a6d960d7f0c11ebda6b99746068c2a','wheel baseline SHA');
 assert(record.pillow123OfficialShadowSha256==='8e95e1385e4998ae9694eeaa4730ba5457ff61185b3a55e2e7bea0880aef452a','wheel candidate SHA');
 assert(record.productionPillowUnchanged==='10.1.0'&&isSHA(record.productionPillowImagePyUnchangedSha256),'runtime baseline drift');
 assert(record.cleanIndependentVenvCreated===true&&record.realPillowNativeDecoderStagesPassed===3&&
  record.threeTrustedOriginalFormatsPixelShaMatchAcrossStages===true&&
  record.offlineWheelRestorePerformedInDisposableVenv===true,'no real trusted isolated reinstallation');
 for(const key of [
  'full34PackageTripoSRVenvCopiedOrRestored','productionPipInstallOrUninstall',
  'productionPythonModified','networkAccessOrDownloadDuringRestore',
  'osNativeDecoderSandboxVerified','untrustedMediaProcessed',
  'productionPillowUpgradeAuthorized','printerApproved'
 ])assert(record[key]===false,'forged production authorization '+key);
 assert(record.gpuOrModelInferenceRuns===0,'GPU unexpectedly enabled');
 const rows=record.isolatedWheelStages;
 assert(Array.isArray(rows)&&rows.length===3,'stage count');
 for(let i=0;i<3;i++){
  const row=rows[i];
  assert(row.stage===STAGES[i]&&row.pillowVersion===VERSIONS[i]&&
   row.isolatedCleanPython===true&&row.actualWheelPackageFilesInstalledOnlyInOwnedTemp===true,
   'inconsistent stage');
  assert(row.pixelSha256ByFormat!==null&&typeof row.pixelSha256ByFormat==='object'&&!Array.isArray(row.pixelSha256ByFormat),'RGB sample results missing');
  assert(Object.keys(row.pixelSha256ByFormat).sort().join('|')==='JPEG|PNG|WEBP','source format coverage not locked');
  for(const v of Object.values(row.pixelSha256ByFormat))assert(isSHA(v),'sample RGB hash invalid');
  assert(JSON.stringify(row.pixelSha256ByFormat)===JSON.stringify(rows[0].pixelSha256ByFormat),'RGB bytes not invariant');
 }
 assert(earlierG339?.schema==='local3d.g339.actual-readonly-g1-boot-discovery-disabled-task-proposal.v1'&&
  earlierG339.noG1PersistentStartupPerformed===true&&
  earlierG339.g1OperationalIssue5StillOpen===true&&
  earlierG339.actualGpuInferenceRuns===0,
  'preceding G1/Office availability not attested');
 return Object.freeze({
  schema:'local3d.g340.offline-restored-pillow-wheel-verified-not-full-venv.v1',
  baselineWheelReacquiredFromOfficialPyPiWithPinnedSHA:true,
  baselineOriginalWheelBytes:2609067,
  originalRollbackWheelIsLocallyAvailable:true,
  exactThreeNativePillowStageRestoresVerified:true,
  trustedFormatRgbParity:'3_FORMATS_IDENTICAL_ALL_3_STAGES',
  isolatedPythonHadNoPillowOrTorchBeforeInstall:true,
  full34PackageVenvRestored:false,
  fullCudaModelCompatibilityWithCandidateVerified:false,
  OSIsolatedNativeDecoderAttested:false,
  productionPythonUpgraded:false,
  permanentG1Restored:false,
  printQualified:false,
  canInstallCandidateToProductionAutomatically:false,
  issue4StillOpen:true,issue5StillOpen:true,issue3StillOpen:true,
  decision:'REAL_OFFLINE_PILLOW_RESTORE_PASS_FULL_PRODUCTION_UPGRADE_BLOCKED'
 });
}
