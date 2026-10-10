import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {buildFullCensus} from '../scripts/g3-23-osv-census-lib.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const E=path.join(ROOT,'docs','evidence','g3');
const R=path.join(ROOT,'runtime','qa','g3','osv-full-g323');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const get=async file=>fs.readFile(file);
const read=async file=>JSON.parse(await get(file));
const newer=path.join(E,'g3-23-full-public-osv-id-census.json');
const source=path.join(R,'full-public-osv-query.json');
const prior=path.join(E,'g3-22-pinned-python-static-triage.json');
const old=path.join(E,'g3-5-python-osv-screen.json');

test('G3.23 full public ID list is SHA-grounded to G3.22, 3 public versions and old OSV',async()=>{
  const r=await read(newer);
  assert.equal(r.schema,'local3d.g3.23.full-public-osv-advisory-alias-census.v1');
  assert.equal(r.priorG322StaticTriageProofSha256,sha(await get(prior)));
  assert.equal(r.freshPublicOSVSourceJsonSha256,sha(await get(source)));
  assert.equal(r.previousOSVPublicSourceJsonSha256,sha(await get(old)));
  assert.equal(r.previousG35VersionLevelMatches,104);
  assert.equal(r.previousG35IndividualIDsRetained,36);
  assert.equal(r.previousG35IndividualIDsNotRetained,68);
  assert.equal(r.newFullPublicVersionResultCount,104);
  assert.equal(r.newFullPublicReturnedIdsCount,104);
  assert.equal(r.previousSaved36AdvisoryIdsFoundInCurrentPublicResponse,36);
  assert.equal(r.fullReconstructionOfUnrecordedHistorical68IdsProven,false);
  assert.equal(r.queryEndpoint,'https://api.osv.dev/v1/query');
  assert.equal(r.publicNameVersionOnlyRequests,true);
  assert.equal(r.historicalSampleMembershipByPackage.length,3);
  for(const x of r.historicalSampleMembershipByPackage){
    assert.equal(x.historicalRetainedSampledAdvisoryIds,12);
    assert.equal(x.historicalIdsResolvedInFreshVersionInventory,12);
    assert.equal(x.missingHistoricalSampleCount,0);
    assert.equal(x.historicalFullAdvisoryIdSetReconstructionImpossible,true);
  }
});

test('G3.23 104 official records are clustered ONLY by shared public identifiers, not exploitability',async()=>{
  const r=await read(newer);
  assert.equal(r.allPublicVersionMatchingAdvisoryRecords.length,104);
  assert.equal(r.newAliasLinkedPublicRecordGroupCount,r.aliasLinkedGroups.length);
  assert.equal(r.newAliasLinkedPublicRecordGroupCount,64);
  assert.ok(r.newAliasLinkedPublicRecordGroupCount<=r.newFullPublicReturnedIdsCount);
  const keys=new Set();
  for(const row of r.allPublicVersionMatchingAdvisoryRecords){
    assert.ok(row.packageName==='Pillow'||row.packageName==='transformers'||row.packageName==='torch');
    assert.match(row.advisoryId,/^[A-Za-z][A-Za-z0-9_-]{2,119}$/);
    const key=row.packageName+'|'+row.advisoryId;
    assert.equal(keys.has(key),false);
    keys.add(key);
    assert.ok(Array.isArray(row.publicAliases));
    assert.ok(Array.isArray(row.publicAffectedRangeFixedEvents));
    assert.equal(row.publicFixedEventDoesNotCertifyPatchCompatibility,true);
    assert.equal(row.appCodePathReachability,'UNASSESSED_PER_ADVISORY');
    assert.equal(row.status,'VERSION_MATCH_NOT_CONFIRMED_EXPLOIT_OR_FIXED');
  }
  const summed=r.aliasLinkedGroups.reduce((n,g)=>n+g.recordCount,0);
  assert.equal(summed,104);
  for(const group of r.aliasLinkedGroups){
    assert.equal(group.groupSemantics,'SHARED_PUBLIC_IDENTIFIER_OR_ALIAS_NOT_PROVEN_SINGLE_ROOT_CAUSE');
    assert.equal(group.allAdvisoryConditionsReviewed,false);
    assert.equal(group.remediationOrExploitability,'NOT_DETERMINED');
    assert.ok(group.recordCount>=1);
  }
  assert.equal(r.aliasLinkedGroupsCannotBeAssumedUniqueConfirmedCves,true);
  assert.equal(r.deduplicationIsAliasCrossReferenceNotExploitableVulnerabilityCount,true);
  assert.equal(r.everyAdvisoryActualApplicationReachabilityTriaged,false);
  assert.equal(r.securityIssue4Resolved,false);
});

test('G3.23 package totals and published patch metadata are VERSION advisory evidence only',async()=>{
  const r=await read(newer);
  const pk=Object.fromEntries(r.perPackage.map(x=>[x.packageName,x]));
  assert.equal(pk.Pillow.newCurrentFullRecordCount,32);
  assert.equal(pk.transformers.newCurrentFullRecordCount,50);
  assert.equal(pk.torch.newCurrentFullRecordCount,22);
  for(const x of r.perPackage){
    assert.equal(x.pinProductionUpgradePerformed,false);
    assert.equal(x.advisoryReachabilityStatus,'NOT_TRIAGED_INDIVIDUALLY');
    assert.equal(x.historicalIdsPersistedPreviously,12);
    assert.equal(x.recordsWithExplicitFixedRangeEvents+x.recordsWithoutExplicitFixedRangeEvents,
      x.newCurrentFullRecordCount);
  }
  const historical=await read(old);
  const sample=historical.packages.filter(x=>x.advisoryCount>0);
  for(const oldPkg of sample){
    const recordSet=new Set(r.allPublicVersionMatchingAdvisoryRecords
      .filter(x=>x.packageName.toLowerCase()===oldPkg.name.toLowerCase())
      .flatMap(x=>[x.advisoryId,...x.publicAliases]));
    assert.ok(oldPkg.sampleAdvisoryIds.every(id=>recordSet.has(id)));
  }
  assert.equal(r.unsafePackageVulnerabilitiesProvenResolved,false);
  assert.equal(r.untrustedUserImageUploadsAuthorized,false);
  assert.equal(r.osNativeImageParserSandboxImplemented,false);
  assert.equal(r.newGPUInference,false);
  assert.equal(r.printQualified,false);
});

function fake(){
  const versions=[['Pillow','10.1.0'],['transformers','4.35.0'],['torch','2.5.1']];
  const data={
    schema:'local3d.g3.23.public-only-full-osv-sampled-version-inventory.v1',
    fetchedAt:'2026-10-10T17:02:01.923Z',
    endpoint:'https://api.osv.dev/v1/query',
    requestPolicy:'ONLY_THREE_PUBLIC_PYPI_PACKAGE_VERSION_PAIRS_NO_PRIVATE_FILES',
    priorG322PublicProofSha256:'a'.repeat(64),
    queryCount:3, noCredentialsOrUserDataTransferred:true,
    productionPackagesModified:false,noPackagesInstalled:true,
    modelInferenceRuns:0,gpuAllocated:false,
    packages:versions.map(([name,version],i)=>({
      packageName:name,publicVersionQueried:version,
      oldSnapshotVersionMatches:[32,50,22][i],
      currentQueryRecordCount:1,
      aliasIdentifierOccurrences:i<2?1:0,
      records:[{
        id:['GHSA-a1-b1-c1','GHSA-a2-b2-c2','GHSA-a3-b3-c3'][i],
        aliases:i<2?['CVE-2026-1000']:[],
        fixedVersionEventsInThisPublicRecord:i===0?['10.2.0']:[],
        conditionOrCodePathReachability:'NOT_TRIAGED_INDIVIDUALLY'
      }]
    })),liveTotalReturnedRecords:3
  };
  const oldData={
    schema:'local3d.g3.22.pinned-python-sampled-advisory-codepath-static.v1',
    packagesEnumerated:34,historicalVersionLevelMatches:104,
    advisoryIdsActuallyRetainedInPreviousSnapshot:36,
    advisoryIdsOmittedByPreviousSnapshot:68,
    priorSnapshotRows:versions.map(([name,version],i)=>({
      packageName:name,publicVersionQueried:version,
      snapshotVersionMatches:[32,50,22][i],
      sampledAdvisoryIdsAvailable:12,
      advisoryIdsNotRetainedInOldSnapshot:[20,38,10][i]
    }))
  };
  return {data,oldData,opts:{sourceSha:'b'.repeat(64),priorSha:'a'.repeat(64)}};
}

test('G3.23 synthetic cross-package alias collision groups records without certifying one CVE',()=>{
  const {data,oldData,opts}=fake();
  const r=buildFullCensus(data,oldData,opts);
  assert.equal(r.newFullPublicVersionResultCount,3);
  assert.equal(r.newAliasLinkedPublicRecordGroupCount,2);
  const merged=r.aliasLinkedGroups.find(x=>x.recordCount===2);
  assert.ok(merged);
  assert.deepEqual(merged.affectedPublicPackageNames,['Pillow','transformers']);
  assert.equal(merged.remediationOrExploitability,'NOT_DETERMINED');
  assert.equal(r.allPublicVersionMatchingAdvisoryRecords[0].publicFixedEventDoesNotCertifyPatchCompatibility,true);
});

test('G3.23 fail closed on query version drift, fake security result and invalid/duplicate IDs',()=>{
  for(const alteration of ['wrongVersion','goodClaim','duplicate','brokenHash','missingRecords']){
    const {data,oldData,opts}=fake();
    if(alteration==='wrongVersion')data.packages[0].publicVersionQueried='10.2.0';
    if(alteration==='goodClaim')data.packages[0].records[0].conditionOrCodePathReachability='SAFE';
    if(alteration==='duplicate'){
      data.packages[0].records.push({...data.packages[0].records[0]});
      data.packages[0].currentQueryRecordCount=2;data.liveTotalReturnedRecords=4;
    }
    if(alteration==='brokenHash')data.priorG322PublicProofSha256='f'.repeat(64);
    if(alteration==='missingRecords')data.packages[1].records=[];
    assert.throws(()=>buildFullCensus(data,oldData,opts),/FAIL CLOSED/,alteration);
  }
});

test('G3.23 public evidence excludes all private input/model records and never claims security approval',async()=>{
  const text=(await get(newer)).toString('utf8');
  assert.doesNotMatch(text,/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  assert.doesNotMatch(text,/D:[/\\]|runtime[/\\]qa|customerEmail|jobId|sourceImage|modelWeightsPath|secretToken|accessToken/i);
  assert.doesNotMatch(text,/"securityIssue4Resolved": true|"newGPUInference": true|"printQualified": true/i);
  const r=JSON.parse(text);
  assert.equal(r.noCustomerMediaOrRepoFilesSentToAdvisoryService,true);
  assert.equal(r.noNewOperatingSystemOrProductionDependenciesChanges,true);
  assert.equal(r.unsafePackageVulnerabilitiesProvenResolved,false);
});
