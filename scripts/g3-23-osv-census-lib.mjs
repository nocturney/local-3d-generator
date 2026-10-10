/**
 * G3.23 pure OFFLINE public OSV ID/alias linked-census aggregator.
 * Data source is explicit bounded public-only query; no live network here.
 *
 * Alias-sharing is a group of related advisory identifiers, not proof
 * of a single distinct root cause, severity, remediation or reachability.
 */
const EXPECTED=[['Pillow','10.1.0'],['transformers','4.35.0'],['torch','2.5.1']];
const canonical=s=>String(s).toLowerCase().replace(/[-_.]+/g,'-');
const SAFE_ID=/^[A-Za-z][A-Za-z0-9_-]{2,119}$/;
const FIXED=/^[A-Za-z0-9._+~-]{1,80}$/;
const strict=(ok,why)=>{if(!ok)throw new Error('G3.23 FAIL CLOSED: '+why);};
export function buildFullCensus(current,old,{sourceSha,priorSha}={}){
  strict(current&&typeof current==='object'&&current.schema===
    'local3d.g3.23.public-only-full-osv-sampled-version-inventory.v1',
    'unexpected public full version inventory schema');
  strict(old&&old.schema==='local3d.g3.22.pinned-python-sampled-advisory-codepath-static.v1'
    &&old.packagesEnumerated===34&&old.historicalVersionLevelMatches===104
    &&old.advisoryIdsActuallyRetainedInPreviousSnapshot===36
    &&old.advisoryIdsOmittedByPreviousSnapshot===68,'historical SHA source mismatch');
  strict(current.priorG322PublicProofSha256===priorSha,'raw public query prior proof SHA mismatch');
  strict(current.endpoint==='https://api.osv.dev/v1/query'
    &&current.requestPolicy==='ONLY_THREE_PUBLIC_PYPI_PACKAGE_VERSION_PAIRS_NO_PRIVATE_FILES'
    &&current.queryCount===3&&Array.isArray(current.packages)
    &&current.packages.length===3&&current.noCredentialsOrUserDataTransferred===true
    &&current.productionPackagesModified===false&&current.noPackagesInstalled===true
    &&current.modelInferenceRuns===0&&current.gpuAllocated===false,
    'public query input scope or no-install safety mismatch');
  strict(typeof current.fetchedAt==='string'
    &&/^\d{4}-\d{2}-\d{2}T/.test(current.fetchedAt)
    &&Number.isFinite(Date.parse(current.fetchedAt)),
    'unreliable OSV query timestamp');
  strict(typeof sourceSha==='string'&&/^[a-f0-9]{64}$/.test(sourceSha)
    &&typeof priorSha==='string'&&/^[a-f0-9]{64}$/.test(priorSha),
    'invalid public proof source hash');

  const oldVersions=Object.fromEntries(old.priorSnapshotRows.map(r=>
    [canonical(r.packageName),r]));
  const records=[];
  let all=0;
  let oldPresent=0;
  let oldMissing=0;
  const perPackage=[];
  for(let p=0;p<EXPECTED.length;p++){
    const [expectedName,expectedVersion]=EXPECTED[p];
    const item=current.packages[p];
    strict(item&&item.packageName===expectedName
      &&item.publicVersionQueried===expectedVersion
      &&Number.isInteger(item.currentQueryRecordCount)
      &&item.currentQueryRecordCount>0&&item.currentQueryRecordCount<=250
      &&Array.isArray(item.records)
      &&item.currentQueryRecordCount===item.records.length
      &&item.oldSnapshotVersionMatches===oldVersions[canonical(expectedName)].snapshotVersionMatches,
      'public OSV package/version or records mismatched');
    const seen=new Set();
    const identifiers=new Set();
    let fixedEventRecords=0;
    let aliases=0;
    for(const entry of item.records){
      strict(entry&&SAFE_ID.test(entry.id)&&!seen.has(entry.id)
        &&Array.isArray(entry.aliases)&&entry.aliases.length<=60
        &&entry.aliases.every(x=>SAFE_ID.test(x)&&x!==entry.id)
        &&new Set(entry.aliases).size===entry.aliases.length
        &&Array.isArray(entry.fixedVersionEventsInThisPublicRecord)
        &&entry.fixedVersionEventsInThisPublicRecord.length<=30
        &&entry.fixedVersionEventsInThisPublicRecord.every(x=>FIXED.test(x))
        &&entry.conditionOrCodePathReachability==='NOT_TRIAGED_INDIVIDUALLY',
        'invalid/duplicate public advisory ID or hidden reachability qualification');
      seen.add(entry.id);
      for(const id of [entry.id,...entry.aliases])identifiers.add(id);
      aliases+=entry.aliases.length;
      if(entry.fixedVersionEventsInThisPublicRecord.length)fixedEventRecords++;
      records.push({
        packageName:expectedName,publicVersionQueried:expectedVersion,
        advisoryId:entry.id,publicAliases:entry.aliases,
        publicAffectedRangeFixedEvents:entry.fixedVersionEventsInThisPublicRecord,
        publicFixedEventDoesNotCertifyPatchCompatibility:true,
        appCodePathReachability:'UNASSESSED_PER_ADVISORY',
        status:'VERSION_MATCH_NOT_CONFIRMED_EXPLOIT_OR_FIXED',
      });
    }
    strict(item.aliasIdentifierOccurrences===aliases,
      'per-package alias public metadata drift');
    const oldRow=oldVersions[canonical(expectedName)];
    const legacy=oldRow.sampledAdvisoryIdsAvailable;
    // Recover historical IDs from prior public G3.5 subset, NOT only counts:
    // G3.22 does not embed IDs in its proof, so this lib cannot assert
    // historical subset membership; the assembler verifies old G3.5 JSON.
    perPackage.push({
      packageName:expectedName,
      historicalVersionMatchCount:item.oldSnapshotVersionMatches,
      newCurrentFullRecordCount:item.records.length,
      publicAliasesAcrossRecords:aliases,
      recordsWithExplicitFixedRangeEvents:fixedEventRecords,
      recordsWithoutExplicitFixedRangeEvents:item.records.length-fixedEventRecords,
      historicalIdsPersistedPreviously:legacy,
      historicIdsOmittedPreviously:oldRow.advisoryIdsNotRetainedInOldSnapshot,
      advisoryReachabilityStatus:'NOT_TRIAGED_INDIVIDUALLY',
      pinProductionUpgradePerformed:false
    });
    all+=item.records.length;
  }
  strict(all===current.liveTotalReturnedRecords&&all<=750,
    'OSV public returned count mismatch');

  // Merge returned records based on a SHARED public advisory ID or alias.
  // This is cross-reference clustering, NOT guaranteed distinct CVEs.
  const parent=records.map((_,i)=>i);
  const find=i=>parent[i]===i?i:(parent[i]=find(parent[i]));
  const union=(i,j)=>{const a=find(i),b=find(j);if(a!==b)parent[b]=a;};
  const owner=new Map();
  for(let i=0;i<records.length;i++){
    const aliases=[records[i].advisoryId,...records[i].publicAliases];
    for(const raw of aliases){
      const id=raw.toUpperCase();
      if(owner.has(id))union(i,owner.get(id));
      else owner.set(id,i);
    }
  }
  const linked=new Map();
  for(let i=0;i<records.length;i++){
    const k=find(i);
    if(!linked.has(k))linked.set(k,[]);
    linked.get(k).push(records[i]);
  }
  const groups=[...linked.values()].map(items=>{
    const ids=items.map(x=>x.advisoryId).sort();
    const aliases=[...new Set(items.flatMap(x=>x.publicAliases))].sort();
    const packages=[...new Set(items.map(x=>x.packageName))].sort();
    return {
      returnedPublicRecordIds:ids,
      overlappingIdentifierAliases:aliases,
      affectedPublicPackageNames:packages,
      recordCount:items.length,
      groupSemantics:'SHARED_PUBLIC_IDENTIFIER_OR_ALIAS_NOT_PROVEN_SINGLE_ROOT_CAUSE',
      allAdvisoryConditionsReviewed:false,
      remediationOrExploitability:'NOT_DETERMINED'
    };
  }).sort((a,b)=>a.returnedPublicRecordIds[0].localeCompare(b.returnedPublicRecordIds[0]));
  return {
    schema:'local3d.g3.23.full-public-osv-advisory-alias-census.v1',
    queriedAt:current.fetchedAt,
    queryEndpoint:current.endpoint,
    publicNameVersionOnlyRequests:true,
    priorG322StaticTriageProofSha256:priorSha,
    freshPublicOSVSourceJsonSha256:sourceSha,
    previousG35VersionLevelMatches:104,
    previousG35IndividualIDsRetained:36,
    previousG35IndividualIDsNotRetained:68,
    newFullPublicVersionResultCount:all,
    newFullPublicReturnedIdsCount:records.length,
    newAliasLinkedPublicRecordGroupCount:groups.length,
    aliasLinkedGroupsCannotBeAssumedUniqueConfirmedCves:true,
    previous36SampleIdMembershipVerifiedSeparatelyByAssembler:true,
    individualAdvisoryDetailsAvailableForCurrentReturnedRecords:true,
    everyAdvisoryActualApplicationReachabilityTriaged:false,
    deduplicationIsAliasCrossReferenceNotExploitableVulnerabilityCount:true,
    perPackage,
    allPublicVersionMatchingAdvisoryRecords:records.sort(
      (a,b)=>a.packageName.localeCompare(b.packageName)||a.advisoryId.localeCompare(b.advisoryId)),
    aliasLinkedGroups:groups,
    noCustomerMediaOrRepoFilesSentToAdvisoryService:true,
    noNewOperatingSystemOrProductionDependenciesChanges:true,
    osNativeImageParserSandboxImplemented:false,
    unsafePackageVulnerabilitiesProvenResolved:false,
    securityIssue4Resolved:false,
    untrustedUserImageUploadsAuthorized:false,
    newGPUInference:false,
    printQualified:false
  };
}
