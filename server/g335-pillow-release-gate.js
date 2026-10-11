/**
 * LOCAL3D G3.35 fail-closed Pillow CPU evidence -> human-reviewed upgrade gates.
 * Consumes only frozen G3.33/G3.34 public, SHA-linked synthetic/licensed evidence.
 * This is advisory/release-readiness, NOT a runtime OS sandbox or GPU authorization.
 */
export class PillowGateError extends Error {
 constructor(message='G3.35 fail-closed Pillow evidence contract') {
  super(message);this.name='PillowGateError';this.code='G335_INVALID_EVIDENCE';
 }
}
const stop=m=>{throw new PillowGateError(m);};
export const BASE_IDS=Object.freeze([
 '01-orb-alpha','02-orb-opaque','03-hollow-vase','04-torus-hole',
 '05-disconnected-pair','06-thin-chair','07-gear-opaque','08-arch-opaque',
 '09-upstream-chair','trusted-synthetic-PNG','trusted-synthetic-JPEG',
 'trusted-synthetic-WEBP'
]);
export const EDGE_IDS=Object.freeze(['alpha','exif-rotation','webp-alpha','corrupted']);
const releaseBlockers=Object.freeze([
 'FULL_G2_REAL_MODEL_CUDA_AND_TORCH_TRANSFORMERS_VERSION_COMPATIBILITY_NOT_VERIFIED',
 'PRODUCTION_PILLOW_UPGRADE_AND_ROLLBACK_NOT_AUTHORIZED',
 'INDEPENDENT_NATIVE_IMAGE_DECODER_OS_CONFINEMENT_NOT_ATTESTED',
 'HOST_GUEST_NETWORK_FILE_CLIPBOARD_EGRESS_NOT_ATTESTED',
 'DEPENDENCY_SECURITY_ADVISORY_REVIEW_AND_FIXES_NOT_COMPLETED',
 'UNTRUSTED_CUSTOMER_MEDIA_NOT_APPROVED',
 'PHYSICAL_MM_WALL_SLICER_PRINTER_QA_NOT_VERIFIED'
]);
const assert=(ok,msg)=>{if(!ok)stop(msg);};
function keysOnly(x,expected,name) {
 assert(x!==null&&typeof x==='object'&&!Array.isArray(x),name+' must be object');
 assert(Object.keys(x).sort().join('|')===expected.slice().sort().join('|'),name+' unexpected/missing fields');
}
function trueFields(x,fields,name){for(const f of fields)assert(x[f]===true,name+' '+f+' must be true');}
function falseFields(x,fields,name){for(const f of fields)assert(x[f]===false,name+' '+f+' must be false');}
const hex=v=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v);
export function evaluateTrustedPillowMatrix(base,edge) {
 assert(base?.schema==='local3d.g333.pillow-12-3-existing-overlay-cpu-only-preprocessor-compatibility.v1','bad G333 schema');
 assert(edge?.schema==='local3d.g334.original-safe-image-edge-parity-not-security-clearance.v1','bad G334 schema');
 assert(JSON.stringify(base.versions)===JSON.stringify({production:'10.1.0',shadow:'12.3.0'}),'version mismatch');
 assert(JSON.stringify(edge.comparedVersions)===JSON.stringify(['10.1.0','12.3.0']),'edge version mismatch');
 for(const [field,n] of [
  ['totalPreviouslyLicensedOrOriginalInputs',12],
  ['projectGeneratedOrSyntheticInputs',11],
  ['upstreamMitLicensedSampleInputs',1],
  ['sameDimensionsCount',12],
  ['pixelShaIdenticalCount',12],
  ['alphaCompositionLaneSameCount',12]
 ])assert(base[field]===n,'base aggregate drift '+field);
 assert(edge.trustedOriginalSafeSourceCount===4&&edge.validAlphaOrExifSourcesCompared===3&&
        edge.corruptImageRejectionClassAgreementCount===1&&edge.identicalPixelShaValidSources===3,
        'edge aggregate drift');
 trueFields(base,['allTwelveInputsDecodedToRgbCpu'],'G333');
 falseFields(base,[
  'historicalFullGpuModelCompatibilityDemonstrated',
  'compatibilityOfAllOtherPackageModulesDemonstrated','productionPillowUpgraded',
  'productionVenvOrWeightsChanged','packagesInstalledOrDownloaded',
  'hostOSNetworkOrSecurityChanged','sandboxGuestLaunched','untrustedImagesProcessed',
  'nativeParserSecurityOrUntrustedUploadClearance','securityIssue4Resolved',
  'manufacturingIssue3Resolved','printQualified','approvedForPrinter'
 ],'G333');
 falseFields(edge,[
  'dependenciesInstalledOrUpgraded','hostSettingsOrOfficeChanged',
  'WindowsSandboxGuestLaunched','externalUntrustedImagesProcessed',
  'nativeParserSandboxCertified','fullModelCudaCompatibilityCertified',
  'securityIssue4Resolved','manufacturingIssue3Resolved','printQualified','approvedForPrinter'
 ],'G334');
 assert(base.modelOrGpuRuns===0&&edge.actualModelInferenceOrGpuRuns===0&&
        base.fabricationAction==='NONE'&&edge.fabricationAction==='NONE','unexpected GPU/print release');
 assert(hex(base.pinnedProductionWorkerUnchangedSha256)&&
        hex(edge.productionG2WorkerStillUnmodifiedSha256)&&
        base.pinnedProductionWorkerUnchangedSha256===edge.productionG2WorkerStillUnmodifiedSha256,
        'Python worker source does not match');
 assert(hex(edge.previousG333PublicSha256),'missing G333 lineage hash');
 assert(Array.isArray(base.caseComparison)&&base.caseComparison.length===12,'base case count');
 assert(Array.isArray(edge.comparisons)&&edge.comparisons.length===4,'edge case count');
 const cases=[];
 for(let i=0;i<BASE_IDS.length;i++) {
  const rec=base.caseComparison[i],id=BASE_IDS[i];
  keysOnly(rec,[
   'sourceId','licensedOrProjectOriginal','sameWidthAndHeight',
   'sameRgbOutputBytesSha256','sameAlphaCompositionLane'
  ],'G333 case');
  assert(rec.sourceId===id,'G333 case source/order changed');
  trueFields(rec,['licensedOrProjectOriginal','sameWidthAndHeight',
                  'sameRgbOutputBytesSha256','sameAlphaCompositionLane'],id);
  cases.push(Object.freeze({
   sourceId:id,
   lane:id==='09-upstream-chair'?'UPSTREAM_MIT_TRUSTED_SAMPLE':id.startsWith('trusted-synthetic')?
       'GENERATED_FORMAT_SAMPLE':'PROJECT_ORIGINAL_RENDER',
   expected:'ACCEPT_CPU',
   outputRgbParity:'EXACT_SHA_MATCH',
   dimensionParity:'MATCH',
   sourceRightsVerified:true
  }));
 }
 for(let i=0;i<EDGE_IDS.length;i++){
  const rec=edge.comparisons[i],id=EDGE_IDS[i];
  keysOnly(rec,['case','sourceSha256','matchedAcceptanceOrRejection',
                'sameRgbPixelsOrSameRejectedErrorClass','noUnexpectedMetadataOrUnsafeInput'],'G334 case');
  assert(rec.case===id&&hex(rec.sourceSha256),'G334 case source/order/hash changed');
  trueFields(rec,['matchedAcceptanceOrRejection','sameRgbPixelsOrSameRejectedErrorClass',
                  'noUnexpectedMetadataOrUnsafeInput'],id);
  cases.push(Object.freeze({
   sourceId:'g36-original-'+id,
   lane:'PROJECT_GENERATED_SAFE_EDGE',
   expected:id==='corrupted'?'REJECT_BAD_IMAGE':'ACCEPT_CPU',
   outputRgbParity:id==='corrupted'?'SAME_REJECTION_CLASS':'EXACT_SHA_MATCH',
   dimensionParity:id==='corrupted'?'NOT_APPLICABLE':'MATCH',
   sourceRightsVerified:true
  }));
 }
 assert(new Set(cases.map(x=>x.sourceId)).size===16,'duplicate sample ids');
 return Object.freeze({
  schema:'local3d.g335.pillow-cpu-matrix-with-explicit-upgrade-denial.v1',
  baselinePillow:'10.1.0',shadowCandidatePillow:'12.3.0',
  previousG333BaseCount:12,previousG334EdgeCount:4,
  uniqueKnownOriginalOrMitInputs:16,
  validDecodedRgbParityCount:15,
  malformedOriginalMatchedRejectionCount:1,
  cpuKnownGoodPreprocessingParity:'PASS_15_ACCEPTED_1_REJECTED',
  productionUpgradeReadiness:'BLOCKED_SHADOW_ONLY',
  osIsolatedNativeDecoderVerified:false,
  realGpuModelWithCandidateVerified:false,
  userUntrustedImageAdmissionApproved:false,
  productionPackageChangesAuthorized:false,
  canUpgradeProductionPillowAutomatically:false,
  canEnableG2Automatically:false,
  canCloseSecurityIssue4:false,
  canApprovePhysicalPrint:false,
  releaseBlockers,
  matrix:Object.freeze(cases)
 });
}
