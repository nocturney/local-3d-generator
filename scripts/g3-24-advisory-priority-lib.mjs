/**
 * G3.24 OFFLINE, deterministic risk REVIEW QUEUE and upgrade-gate contract.
 * This is triage-order only. NO severity inference for 101 unreviewed case
 * conditions, no actual native parser exploit test, and no install or GPU.
 */
const required=(condition,why)=>{if(!condition)throw new Error('G3.24 FAIL CLOSED: '+why);};
const hashId=x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x);
const CASES=[
  {
    packageName:'Pillow',
    representativeAdvisoryId:'GHSA-3f63-hfp8-52jq',
    officialAdvisoryUrl:'https://github.com/advisories/GHSA-3f63-hfp8-52jq',
    officialSeverity:'CRITICAL',officialPublishedCvss:9.3,
    officialPublishedPatchedVersion:'10.2.0',
    advisoryTrigger:'PIL.ImageMath.eval with attacker-influenced environment',
    directTargetApiObservedInG322:false,
    userImageByteParserDirectlyUsed:true,
    interpretation:'TARGET_IMAGEMATH_API_NOT_DIRECTLY_OBSERVED_BUT_IMAGE_DECODING_IS_ACTIVE',
    noActualExploitProven:true
  },{
    packageName:'transformers',
    representativeAdvisoryId:'GHSA-29pf-2h5f-8g72',
    officialAdvisoryUrl:'https://github.com/advisories/GHSA-29pf-2h5f-8g72',
    officialSeverity:'HIGH',officialPublishedCvss:7.8,
    officialPublishedPatchedVersion:'5.3.0',
    advisoryTrigger:'AutoModelForCausalLM.from_pretrained with attacker-controlled config attention kernel',
    directTargetApiObservedInG322:false,
    userImageByteParserDirectlyUsed:false,
    interpretation:'PINNED_VIT_CONFIG_PATH_EXISTS_BUT_THE_REPRESENTATIVE_AUTOMODEL_TRIGGER_NOT_OBSERVED',
    noActualExploitProven:true
  },{
    packageName:'torch',
    representativeAdvisoryId:'GHSA-3749-ghw9-m3mg',
    officialAdvisoryUrl:'https://github.com/advisories/GHSA-3749-ghw9-m3mg',
    officialSeverity:'LOW',officialPublishedCvss:1.9,
    officialPublishedPatchedVersion:'2.7.1-rc1',
    advisoryTrigger:'torch.mkldnn_max_pool2d local denial of service',
    directTargetApiObservedInG322:false,
    userImageByteParserDirectlyUsed:false,
    interpretation:'PINNED_TORCH_LOAD_AND_NATIVE_TENSOR_RUNTIME_EXIST_TRIGGER_NOT_DIRECTLY_OBSERVED',
    noActualExploitProven:true
  }
];
const TIERS={
  Pillow:{order:1,tag:'REVIEW_FIRST_REAL_IMAGE_DECODER',
          dueTo:'ACTUAL_SOURCE_IMAGE_BYTES_DECODED_IN_PINNED_PILLOW_LIBRARY',
          confirmedVulnerabilityReachability:false},
  transformers:{order:2,tag:'REVIEW_PINNED_MODEL_CONFIG_AND_DYNAMIC_LOADER',
          dueTo:'PINNED_LOCAL_DINO_VIT_CONFIG_IMPORT_AND_DYNAMIC_PACKAGE_IMPLEMENTATION',
          confirmedVulnerabilityReachability:false},
  torch:{order:2,tag:'REVIEW_PINNED_CHECKPOINT_AND_NATIVE_TENSOR_RUNTIME',
          dueTo:'PINNED_WEIGHT_DESERIALIZATION_AND_NATIVE_TENSOR_INFERENCE_PIPELINE',
          confirmedVulnerabilityReachability:false}
};
const steps=[
  'Preserve old 34-package frozen manifest, old G2 venv and previous source SHA rights.',
  'Group CVE aliases and prioritize each exact affected API, file format and attack precondition individually; UNKNOWN until reviewed.',
  'Resolve fixed package version ranges against pinned TripoSR ViT/tokenizer, torch CPU/GPU ABI, Python 3.11 and Windows CUDA requirements WITHOUT overriding dependency metadata silently.',
  'If separately authorized, install only into a newly versioned throwaway shadow environment, NEVER live G2 production.',
  'In isolated CPU-only mode revalidate SHA-pinned DINO ViT local config, Pillow 9/9 source preprocessing, offline imports, no checkpoint loads/inference and full Node/Python tests.',
  'Review source and parsed-image containment with OS-enforced filesystem/network isolation as a separate approved operating-system change.',
  'New explicit per-image GPU approval and Office idle/VRAM checks are REQUIRED before any real CUDA compatibility experiment.',
  'Manufacturing remains DRAFT and has separate real scale, wall, slicer, printer authorization; package fixes never print-qualify.'
];
export function buildReviewQueue(full,staticProof,{fullSha,staticSha}={}){
  required(hashId(fullSha)&&hashId(staticSha),'invalid source SHA');
  required(full?.schema==='local3d.g3.23.full-public-osv-advisory-alias-census.v1'
     && full.newFullPublicVersionResultCount===104
     && full.newAliasLinkedPublicRecordGroupCount===64
     && full.previousSaved36AdvisoryIdsFoundInCurrentPublicResponse===36
     && full.securityIssue4Resolved===false
     && full.unsafePackageVulnerabilitiesProvenResolved===false
     && full.newGPUInference===false,
     'G3.23 complete public evidence or no-clearance safety changed');
  required(staticProof?.schema==='local3d.g3.22.pinned-python-sampled-advisory-codepath-static.v1'
     && staticProof.historicalVersionLevelMatches===104
     && staticProof.pillowImageParsingDirectInputPathPresent===true
     && staticProof.securityGateResolved===false
     && staticProof.pinnedUpstreamSourceGitCleanVerified===true
     && staticProof.productionPillowStillPinned10_1_0===true
     && staticProof.observedSourceGuardCode?.weightsOnlyMonkeypatchCodePresent===true
     && staticProof.observedSourceGuardCode?.osEnforcedNetworkEgressProven===false,
     'prior pinned source guard/decoding exposure changed');
  required(Array.isArray(full.aliasLinkedGroups)&&full.aliasLinkedGroups.length===64
    &&Array.isArray(full.allPublicVersionMatchingAdvisoryRecords)
    &&full.allPublicVersionMatchingAdvisoryRecords.length===104,
    'current full advisory records incomplete');
  const seen=new Set();
  const actualById=new Map(full.allPublicVersionMatchingAdvisoryRecords.map(r=>[r.advisoryId,r]));
  required(actualById.size===104,'duplicated public advisory record IDs');
  const queue=[];
  const summary={
    REVIEW_FIRST_REAL_IMAGE_DECODER:0,
    REVIEW_PINNED_MODEL_CONFIG_AND_DYNAMIC_LOADER:0,
    REVIEW_PINNED_CHECKPOINT_AND_NATIVE_TENSOR_RUNTIME:0
  };
  for(const group of full.aliasLinkedGroups){
    required(group&&Array.isArray(group.returnedPublicRecordIds)
      &&group.returnedPublicRecordIds.length>0
      &&Array.isArray(group.affectedPublicPackageNames)
      &&group.groupSemantics==='SHARED_PUBLIC_IDENTIFIER_OR_ALIAS_NOT_PROVEN_SINGLE_ROOT_CAUSE'
      &&group.allAdvisoryConditionsReviewed===false
      &&group.remediationOrExploitability==='NOT_DETERMINED'
      &&group.returnedPublicRecordIds.length===group.recordCount,
      'untrusted group metadata or false remediation');
    const packs=[...group.affectedPublicPackageNames].sort();
    required(packs.length===1&&Object.hasOwn(TIERS,packs[0]),
      'unknown cross-package group requires manual review');
    const pkg=packs[0];
    const cfg=TIERS[pkg];
    for(const id of group.returnedPublicRecordIds){
      const record=actualById.get(id);
      required(record?.packageName===pkg&&!seen.has(id)
        &&record.appCodePathReachability==='UNASSESSED_PER_ADVISORY'
        &&record.status==='VERSION_MATCH_NOT_CONFIRMED_EXPLOIT_OR_FIXED',
        'public source record coverage or false reachability change');
      seen.add(id);
    }
    summary[cfg.tag]++;
    queue.push({
      reviewTier:cfg.tag,
      tierRank:cfg.order,
      reasonToReview:cfg.dueTo,
      affectedPublicPackageNames:packs,
      sortedAliasGroupRecordIds:[...group.returnedPublicRecordIds],
      publicGroupRecordCount:group.recordCount,
      groupTitleIdentifier:group.returnedPublicRecordIds[0],
      individualGHSAOrCveSeverityNotInferred:true,
      perAdvisoryTriggerReachability:'UNKNOWN_NEEDS_MANUAL_TRIAGE',
      actualExploitableApplicationBugConfirmed:false,
      sourceMetadataAliasesNotIndependentlyVerifiedAsSameRootCause:true,
      productionPatchedOrSecure:false
    });
  }
  required(seen.size===104,'unclassified or duplicate advisory records');
  queue.sort((a,b)=>a.tierRank-b.tierRank
      ||a.reviewTier.localeCompare(b.reviewTier)
      ||a.groupTitleIdentifier.localeCompare(b.groupTitleIdentifier));
  const examples=[];
  for(const example of CASES){
    const match=full.allPublicVersionMatchingAdvisoryRecords.find(row=>
      row.advisoryId===example.representativeAdvisoryId
      &&row.packageName===example.packageName);
    required(match&&match.publicAffectedRangeFixedEvents.includes(
      example.officialPublishedPatchedVersion),'GHSA sample/fix version absent in full public OSV proof');
    const orig=staticProof.representativeAdvisoriesReviewedForTriggerOnly?.find(row=>
      row.advisoryId===example.representativeAdvisoryId);
    required(orig&&orig.package===example.packageName
      &&orig.literallyNamedAffectedAPICallFoundInScannedSources===false
      &&orig.allPackageAdvisoriesProvenNotAffected===false
      &&orig.firstPatchedVersionFromAdvisory===example.officialPublishedPatchedVersion,
      'historical selected trigger/source guard disagrees');
    examples.push({...example,livePinRemainsOld:true,
      severitySource:'OFFICIAL_GITHUB_ADVISORY_PAGE_THREE_SAMPLES_ONLY',
      noClaimThatCVSSReflectsLOCAL3DExploitability:true});
  }
  return {
    schema:'local3d.g3.24.security-review-queue-not-remediation.v1',
    previousFullG323EvidenceSha256:fullSha,
    previousStaticG322EvidenceSha256:staticSha,
    sourceSnapshotDatetime:full.queriedAt,
    fullPublicRecordsAccountedFor:seen.size,
    publicAliasGroupsAccountedFor:queue.length,
    priorityIsTriageOrderNotSeverityOrConfirmedExploit:true,
    groupTierCounts:summary,
    queue,
    threeRepresentativeVerifiedPublicGHSAExamples:examples,
    exampleSeverityCannotBeExtrapolatedToRemaining101Records:true,
    prerequisiteUpgradeAndIsolationSteps:steps,
    activePackageVersionsUnchanged:true,
    osEnforcedNativeParserSandboxReady:false,
    modelCompatibilityProvenForPatchedStack:false,
    authorizedRealGPUAcceptance:false,
    individuallyValidated104Reachability:false,
    securityIssue4Resolved:false,
    newUntrustedInputsAuthorized:false,
    packagesInstalled:0,
    GPUInferenceRuns:0,
    cloudModelOrWeightsDownload:false,
    printQualified:false,
    approvedForPrinter:false,
    fabricationAction:'NONE'
  };
}
