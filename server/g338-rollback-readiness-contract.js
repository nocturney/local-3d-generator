/**
 * LOCAL3D G3.38 conservative transaction gate for a future Pillow upgrade.
 * No package, GPU, OS, network or Task Scheduler operations: pure validation.
 * Real upgrades always require a separate operator-authorized implementation.
 */
export class RollbackGateError extends Error{
 constructor(message){super(message);this.name='RollbackGateError';this.code='G338_INVALID_BASELINE';}
}
const stop=m=>{throw new RollbackGateError(m);};
const req=(condition,message)=>{if(!condition)stop(message);};
const hex=value=>typeof value==='string'&&/^[0-9a-f]{64}$/.test(value);
const checkpoints=Object.freeze([
 'PIN_ALL_34_PRODUCTION_REQUIREMENTS_AND_INTERPRETER_SHA',
 'VERIFY_ORIGINAL_PINNED_OFFLINE_ROLLBACK_WHEELS_AND_FULL_VENV_BACKUP',
 'PROVE_BACKUP_RESTORE_ON_ISOLATED_FULL_VENV_CLONE',
 'RUN_COMPLETE_CANDIDATE_MODEL_AND_TORCH_TRANSFORMERS_CUDA_REGRESSION_WITH_SEPARATE_GPU_APPROVAL',
 'ATTEST_OS_ISOLATED_NATIVE_IMAGE_PARSER_NETWORK_FILESYSTEM_CLIPBOARD',
 'REVIEW_RELEVANT_ADVISORIES_AND_LICENSE_RELEASE_REQUIREMENTS',
 'AUTHORIZE_EXPLICIT_PRODUCTION_CHANGE_WINDOW_AND_ROLLBACK',
 'REVERIFY_SERVICE_G1_PORT4177_HEALTH_AND_PRESERVE_OFFICE4178',
 'POST_DEPLOY_TESTS_AND_ROLLBACK_IF_ANY_CHECKPOINT_FAILS'
]);
export function assessReadOnlyRollbackBaseline(record, priorG337, priorG335){
 req(record&&typeof record==='object'&&!Array.isArray(record),'bad G338 receipt');
 req(record.schema==='local3d.g338.pinned-python-readonly-rollback-dryrun.v1','bad G338 schema');
 req(record.windowsPy311ProductionInterpreterVerified===true,'not pinned Python3.11');
 req(record.requirementCount===34&&record.installedRequirementsMatched===34,'production environment drift');
 req(hex(record.exactFrozenRequirementsSHA256),'bad manifest hash');
 req(JSON.stringify(record.criticalProductionVersions)===JSON.stringify({
  pillow:'10.1.0',torch:'2.5.1+cu121',transformers:'4.35.0'
 }),'critical installed version drift');
 req(record.existingPillow12_3ShadowWheelVerifiedSHA256==='8e95e1385e4998ae9694eeaa4730ba5457ff61185b3a55e2e7bea0880aef452a','shadow wheel hash wrong');
 req(Number.isSafeInteger(record.scopedLocalWheelDirectoriesChecked)&&record.scopedLocalWheelDirectoriesChecked===1,'unexpected rollback wheel scan scope');
 req(record.pinnedPillow10_1OfflineWheelFoundInCheckedDirs===false,'must not assert recovered backup without external validation');
 req(Array.isArray(record.matchedOfflineRollbackWheelSha256)&&record.matchedOfflineRollbackWheelSha256.length===0,'rollbacks supposedly verified without authentic hash');
 req(JSON.stringify(record.syntheticRehearsalOutcomes)===JSON.stringify([
  'STAGED_DIFFERENT_VERSION_THEN_BASELINE_SHA_RESTORED',
  'TAMPER_DETECTED_AND_ORIGINAL_SHA_RESTORED'
 ]),'synthetic rollback did not restore manifest');
 req(record.syntheticRehearsalRestoredOriginalManifestSHA256===record.exactFrozenRequirementsSHA256,'manifest rollback mismatch');
 for(const field of [
  'productionInstallOrRollbackActuallyPerformed','realProductionPackageBackupVerified',
  'productionVenvPackagesChanged','newDownloadOrNetworkRequest',
  'nativeDecoderSandboxEstablished','productionUpgradeAuthorized','printQualified'
 ])req(record[field]===false,'invalid release assertion '+field);
 req(record.gpuOrModelRuns===0,'unexpected GPU');
 req(record.deploymentReadiness==='BLOCKED_NO_APPROVED_ROLLBACK_OR_GPU_SECURITY_CLEARANCE','invalid current decision');
 req(priorG337?.schema==='local3d.g337.pillow12-3-shadow-qa-with-explicit-historical-version-exclusions.v1'&&
  priorG337.validation?.selectedShadow12_3CasesPassed===242&&
  priorG337.validation?.explicitHistorical10_1CaseExclusions===20&&
  priorG337.validation?.originalFullUnfilteredShadowSuiteFailedWithFiveVersionLockErrors===true&&
  priorG337.validation?.PillowProductionUpgradeAllowed===false,
  'old shadow suite scope or release gate changed');
 req(priorG335?.schema==='local3d.g335.pillow-version-compatibility-matrix-not-upgrade-authorization.v1'&&
  priorG335.releaseDecision?.productionUpgradeReadiness==='BLOCKED_SHADOW_ONLY'&&
  priorG335.releaseDecision?.canUpgradeProductionPillowAutomatically===false,
  'prior source upgrade denial changed');
 return Object.freeze({
  schema:'local3d.g338.production-pillow-migration-rollback-readiness.v1',
  baselinePython:'3.11',baselinePillow:'10.1.0',
  existingCandidateShadowPillow:'12.3.0',
  pinnedProductionDistributionCount:34,
  checkedRollbackWheelStores:1,
  missingOriginalPillowOfflineRollbackWheelInCheckedStores:true,
  syntheticOnlyManifestRollbackScenariosPassed:2,
  actualVenvCopyAndRestoreTested:false,
  actualProductionUpgradePerformed:false,
  completeCandidateGpuModelCompatibilityVerified:false,
  nativeOSDecoderIsolationVerified:false,
  sourceAdvisoryFixesVerified:false,
  permanentG1RecoveryVerified:false,
  independentOffice4178UnchangedByThisEvaluation:true,
  automaticRollbackOrUpgradeAllowed:false,
  humanChangeApprovalRecorded:false,
  deploymentDecision:'BLOCKED_SCOPE_LIMITED_READONLY_PREPARATION',
  releaseCheckpoints:checkpoints,
  issue4SecurityStillOpen:true,issue5OperationalStillOpen:true,
  issue3PrintStillOpen:true,
  printQualified:false,approvedForPrinter:false,fabricationAction:'NONE'
 });
}
