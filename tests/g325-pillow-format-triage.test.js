import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildPillowFormatTriage} from '../scripts/g3-25-pillow-format-triage-lib.mjs';
import {readHistoricalServerBytes} from '../scripts/g3-28-historical-server-source.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const paths={
 full:path.join(ROOT,'docs/evidence/g3/g3-23-full-public-osv-id-census.json'),
 prior:path.join(ROOT,'docs/evidence/g3/g3-24-security-review-queue.json'),
 server:path.join(ROOT,'server/index.js'),
 worker:path.join(ROOT,'engines/triposr/worker.py'),
 proof:path.join(ROOT,'docs/evidence/g3/g3-25-pillow-format-review.json')
};
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const clone=x=>JSON.parse(JSON.stringify(x));
async function input(){
 const [f,p,w]=await Promise.all(['full','prior','worker'].map(k=>fs.readFile(paths[k])));
 const s=readHistoricalServerBytes();
 return {f:JSON.parse(f),p:JSON.parse(p),s:s.toString('utf8'),w:w.toString('utf8'),
   opts:{full:sha(f),prior:sha(p),server:sha(s),worker:sha(w)}};
}
const build=x=>buildPillowFormatTriage(x.f,x.p,x.s,x.w,x.opts);

test('G3.25 all 32 public Pillow records covered by 16 GHSA/PYSEC groups without resolution',async()=>{
 const x=await input();
 const actual=JSON.parse(await fs.readFile(paths.proof,'utf8'));
 assert.deepEqual(build(x),actual);
 assert.equal(actual.schema,'local3d.g3.25.pillow-format-and-api-triage-not-clearance.v1');
 assert.equal(actual.publicPillowRecordsAccountedFor,32);
 assert.equal(actual.aliasLinkedPillowGroupsReviewed,16);
 assert.equal(actual.pillowReviewCases.length,16);
 assert.equal(new Set(actual.pillowReviewCases.flatMap(t=>t.publicOsVRecordIds)).size,32);
 assert.equal(actual.perAdvisoryActualReachabilityCertified,0);
 assert.ok(actual.pillowReviewCases.every(t=>
   t.appExploitabilityStatus==='UNRESOLVED_STATIC_SOURCE_REVIEW_ONLY'&&
   t.nativeOrTransitiveApplicability==='UNKNOWN_NOT_AUDITED_END_TO_END'&&
   t.patchedProductionVerified===false));
});

test('G3.25 formats: only three top-level signatures, decoder remains a native risk',async()=>{
 const proof=JSON.parse(await fs.readFile(paths.proof,'utf8'));
 const a=proof.actualInputPath;
 assert.deepEqual(a.admittedTopLevelImageMimeTypes,['image/jpeg','image/png','image/webp']);
 assert.equal(a.submittedPayloadLimitBytes,8*1024*1024);
 assert.equal(a.declaredPixelLimit,16_000_000);
 assert.equal(a.imageLoadAndExifProcessingDirectlyActive,true);
 assert.equal(a.validatedWholeFileCodecContentBeforePillow,false);
 assert.equal(a.OSNativeParserConfinementVerified,false);
 const alternate=proof.pillowReviewCases.filter(t=>t.triggerClass==='OTHER_CODEC');
 assert.deepEqual(alternate.map(t=>t.reviewedGHSAId).sort(),
   ['GHSA-62p4-gmf7-7g93','GHSA-vjc4-5qp5-m44j']);
 assert.ok(alternate.every(t=>t.ordinaryDirectUploadMatchesNamedAlternateCodec===false));
 assert.equal(proof.formatWhitelistAloneMakesNativeParsersSafe,false);
});

test('G3.25 named upstream conditions are not widened into fabricated exploit claims',async()=>{
 const p=JSON.parse(await fs.readFile(paths.proof,'utf8'));
 const get=id=>p.pillowReviewCases.find(c=>c.reviewedGHSAId===id);
 assert.match(get('GHSA-r73j-pqj5-w3x7').upstreamNamedTrigger,/PdfParser/);
 assert.match(get('GHSA-jjj6-mw9f-p565').upstreamNamedTrigger,/FlateDecode/);
 assert.match(get('GHSA-3f63-hfp8-52jq').upstreamNamedTrigger,/ImageMath/);
 assert.match(get('GHSA-fj7v-r99m-22gq').upstreamNamedTrigger,/TGA/);
 assert.match(get('GHSA-9hw9-ch79-4vh6').upstreamNamedTrigger,/ImageCmsTransform/);
 assert.match(get('GHSA-vjc4-5qp5-m44j').upstreamNamedTrigger,/JPEG2000/);
 assert.match(get('GHSA-44wm-f244-xhp3').upstreamNamedTrigger,/unverified/);
 assert.equal(p.productionDependenciesModified,false);
 assert.equal(p.livePillowVersion,'10.1.0');
 assert.equal(p.g3ShadowPillow12_3DoesNotUpgradeProduction,true);
});

test('G3.25 fail closed on missing public IDs or changed source lineage',async()=>{
 for(const mutation of ['missingId','relabel','falseSafety','wrongPriorSha','forgedFix']){
  const x=await input();x.f=clone(x.f);x.p=clone(x.p);
  if(mutation==='missingId')x.f.allPublicVersionMatchingAdvisoryRecords.pop();
  if(mutation==='relabel')x.p.queue[0].sortedAliasGroupRecordIds[0]='GHSA-fake-id';
  if(mutation==='falseSafety')x.p.securityIssue4Resolved=true;
  if(mutation==='wrongPriorSha')x.p.previousFullG323EvidenceSha256='0'.repeat(64);
  if(mutation==='forgedFix'){
   const c=x.f.allPublicVersionMatchingAdvisoryRecords.find(z=>z.advisoryId==='GHSA-vjc4-5qp5-m44j');
   c.publicAffectedRangeFixedEvents=['99.0.0'];
  }
  assert.throws(()=>build(x),/G3.25 FAIL CLOSED/,mutation);
 }
});

test('G3.25 fail closed when server starts accepting other media or weakens signature/MIME gate',async()=>{
 for(const mutation of ['newFormat','mimeCheck','byteLimit','signature']){
  const x=await input();
  if(mutation==='newFormat')x.s=x.s.replace("mime: 'image/png'","mime: 'image/jp2'")+
   "\n// image/png change must be detected";
  if(mutation==='mimeCheck')x.s=x.s.replace('payload.image.mime !== imageInfo.mime','false');
  if(mutation==='byteLimit')x.s=x.s.replace('8 * 1024 * 1024','16 * 1024 * 1024');
  if(mutation==='signature')x.s=x.s.replace("bytes[0] === 255","bytes[0] === 1");
  assert.throws(()=>build(x),/G3.25 FAIL CLOSED/,mutation);
 }
});

test('G3.25 fail closed when actual Python decode/pixel limits or file allowlist changes',async()=>{
 for(const [oldValue,newValue] of [
  ['src.load()','pass'],
  ['ImageOps.exif_transpose(src)','src'],
  ['16_000_000','160_000_000'],
  ['("input.png", "input.jpg", "input.webp")','("input.png", "input.jpg", "input.webp", "input.jp2")']
 ]){
  const x=await input();x.w=x.w.replace(oldValue,newValue);
  assert.throws(()=>build(x),/G3.25 FAIL CLOSED/,oldValue);
 }
});

test('G3.25 immutable proof is sanitized and grants no OS/GPU/image/printing authorization',async()=>{
 const raw=await fs.readFile(paths.proof,'utf8');
 assert.doesNotMatch(raw,/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
 assert.doesNotMatch(raw,/D:[/\\]|runtime[/\\]qa|customerEmail|jobId|sourceImagePath|checkpointPath|secretToken/i);
 const p=JSON.parse(raw);
 assert.equal(p.newUntrustedUserFilesApproved,false);
 assert.equal(p.OSRestrictionsModified,false);
 assert.equal(p.GPUInferenceRuns,0);
 assert.equal(p.modelExecutions,0);
 assert.equal(p.securityIssue4Resolved,false);
 assert.equal(p.manufacturingIssue3Resolved,false);
 assert.equal(p.printQualified,false);
 assert.equal(p.approvedForPrinter,false);
 assert.equal(p.fabricationAction,'NONE');
});
