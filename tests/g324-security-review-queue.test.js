import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {buildReviewQueue} from '../scripts/g3-24-advisory-priority-lib.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ev=path.join(ROOT,'docs','evidence','g3');
const files={
 full:path.join(ev,'g3-23-full-public-osv-id-census.json'),
 static:path.join(ev,'g3-22-pinned-python-static-triage.json'),
 queue:path.join(ev,'g3-24-security-review-queue.json')
};
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const context=async()=>{
 const [a,b]=await Promise.all([fs.readFile(files.full),fs.readFile(files.static)]);
 return {a:JSON.parse(a),b:JSON.parse(b),opts:{fullSha:sha(a),staticSha:sha(b)}};
};

test('G3.24 104 public records accounted in 64 priority groups without false clearance',async()=>{
 const queue=await read(files.queue);
 const {a,b,opts}=await context();
 assert.equal(queue.schema,'local3d.g3.24.security-review-queue-not-remediation.v1');
 assert.equal(queue.previousFullG323EvidenceSha256,opts.fullSha);
 assert.equal(queue.previousStaticG322EvidenceSha256,opts.staticSha);
 assert.equal(queue.sourceSnapshotDatetime,a.queriedAt);
 assert.equal(queue.fullPublicRecordsAccountedFor,104);
 assert.equal(queue.publicAliasGroupsAccountedFor,64);
 assert.equal(queue.queue.length,64);
 const ids=new Set(queue.queue.flatMap(row=>row.sortedAliasGroupRecordIds));
 assert.equal(ids.size,104);
 assert.deepEqual([...ids].sort(),
   a.allPublicVersionMatchingAdvisoryRecords.map(x=>x.advisoryId).sort());
 assert.deepEqual(queue.groupTierCounts,{
   REVIEW_FIRST_REAL_IMAGE_DECODER:16,
   REVIEW_PINNED_MODEL_CONFIG_AND_DYNAMIC_LOADER:29,
   REVIEW_PINNED_CHECKPOINT_AND_NATIVE_TENSOR_RUNTIME:19
 });
 assert.equal(queue.priorityIsTriageOrderNotSeverityOrConfirmedExploit,true);
 assert.equal(queue.individuallyValidated104Reachability,false);
 assert.equal(queue.securityIssue4Resolved,false);
 assert.equal(queue.packagesInstalled,0);
 assert.equal(queue.GPUInferenceRuns,0);
 assert.equal(queue.printQualified,false);
 assert.equal(queue.approvedForPrinter,false);
 assert.equal(queue.fabricationAction,'NONE');
 assert.deepEqual(buildReviewQueue(a,b,opts),queue);
});

test('G3.24 Pillow first is a source-input review order, not a verified CVSS score or exploit',async()=>{
 const q=await read(files.queue);
 assert.ok(q.queue.slice(0,16).every(x=>
  x.reviewTier==='REVIEW_FIRST_REAL_IMAGE_DECODER' &&
  x.affectedPublicPackageNames.includes('Pillow') &&
  x.tierRank===1));
 assert.ok(q.queue.slice(16).every(x=>x.tierRank===2 &&
   !x.affectedPublicPackageNames.includes('Pillow')));
 assert.ok(q.queue.every(x=>
   x.perAdvisoryTriggerReachability==='UNKNOWN_NEEDS_MANUAL_TRIAGE' &&
   x.actualExploitableApplicationBugConfirmed===false &&
   x.productionPatchedOrSecure===false &&
   x.individualGHSAOrCveSeverityNotInferred===true));
 assert.equal(q.modelCompatibilityProvenForPatchedStack,false);
 assert.equal(q.osEnforcedNativeParserSandboxReady,false);
 assert.equal(q.authorizedRealGPUAcceptance,false);
 assert.equal(q.newUntrustedInputsAuthorized,false);
 assert.equal(q.exampleSeverityCannotBeExtrapolatedToRemaining101Records,true);
});

test('G3.24 3 official GHSA examples have only personally verified severity and patched metadata',async()=>{
 const q=await read(files.queue);
 assert.equal(q.threeRepresentativeVerifiedPublicGHSAExamples.length,3);
 const byPackage=Object.fromEntries(q.threeRepresentativeVerifiedPublicGHSAExamples
     .map(x=>[x.packageName,x]));
 const expected={
   Pillow:['GHSA-3f63-hfp8-52jq','CRITICAL',9.3,'10.2.0'],
   transformers:['GHSA-29pf-2h5f-8g72','HIGH',7.8,'5.3.0'],
   torch:['GHSA-3749-ghw9-m3mg','LOW',1.9,'2.7.1-rc1']
 };
 for(const [pkg,[id,severity,cvss,fix]] of Object.entries(expected)){
   const x=byPackage[pkg];
   assert.equal(x.representativeAdvisoryId,id);
   assert.equal(x.officialSeverity,severity);
   assert.equal(x.officialPublishedCvss,cvss);
   assert.equal(x.officialPublishedPatchedVersion,fix);
   assert.equal(x.officialAdvisoryUrl,'https://github.com/advisories/'+id);
   assert.equal(x.directTargetApiObservedInG322,false);
   assert.equal(x.noActualExploitProven,true);
   assert.equal(x.livePinRemainsOld,true);
   assert.equal(x.noClaimThatCVSSReflectsLOCAL3DExploitability,true);
 }
 assert.equal(byPackage.Pillow.userImageByteParserDirectlyUsed,true);
});

test('G3.24 mutated public source alias group or security statuses fail closed',async()=>{
 for(const mode of ['fixed','missing','source','safety','maliciousTrigger']){
   const {a,b,opts}=await context();
   if(mode==='fixed')a.unsafePackageVulnerabilitiesProvenResolved=true;
   if(mode==='missing')a.aliasLinkedGroups[0].returnedPublicRecordIds.pop();
   if(mode==='source')b.observedSourceGuardCode.weightsOnlyMonkeypatchCodePresent=false;
   if(mode==='safety')a.allPublicVersionMatchingAdvisoryRecords[0].status='VERIFIED_NOT_AFFECTED';
   if(mode==='maliciousTrigger'){
     const match=a.allPublicVersionMatchingAdvisoryRecords.find(
       x=>x.advisoryId==='GHSA-3f63-hfp8-52jq');
     match.publicAffectedRangeFixedEvents=[];
   }
   assert.throws(()=>buildReviewQueue(a,b,opts),/FAIL CLOSED/,mode);
 }
});

test('G3.24 public SHA queue excludes job, private paths, GPU and printer authorization',async()=>{
 const raw=await fs.readFile(files.queue,'utf8');
 assert.doesNotMatch(raw,/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
 assert.doesNotMatch(raw,/D:[/\\]|runtime[/\\]qa|customerEmail|jobId|sourceImagePath|modelWeightsPath|apiToken/i);
 assert.doesNotMatch(raw,/"securityIssue4Resolved": true|"newUntrustedInputsAuthorized": true|"printQualified": true/i);
 const x=JSON.parse(raw);
 assert.equal(x.cloudModelOrWeightsDownload,false);
 assert.equal(x.osEnforcedNativeParserSandboxReady,false);
 assert.equal(x.newUntrustedInputsAuthorized,false);
 assert.equal(x.activePackageVersionsUnchanged,true);
});
