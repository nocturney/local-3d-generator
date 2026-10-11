import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFile(path.join(root,p));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const nl=b=>sha(Buffer.from(b.toString('utf8').replace(/\r\n/g,'\n')));
const report=()=>read('docs/evidence/g3/g3-34-pillow-edge-cases-cpu-parity.json').then(JSON.parse);
test('G3.34 public SHA ancestry binds G3.33 and existing G3.6 trusted fixture generator',async()=>{
 const p=await report();
 assert.equal(p.schema,'local3d.g334.original-safe-image-edge-parity-not-security-clearance.v1');
 assert.equal(p.previousG333PublicSha256,sha(await read('docs/evidence/g3/g3-33-pillow-12-3-shadow-cpu-compatibility.json')));
 assert.equal(p.originalG36SafeFixtureGeneratorSha256,sha(await read('scripts/g3-6-pillow-shadow-check.py')));
 assert.equal(p.currentCpuLaneCodeNormalizedSha256,nl(await read('scripts/g3-34-safe-edge-lane.py')));
 assert.equal(p.productionG2WorkerStillUnmodifiedSha256,sha(await read('engines/triposr/worker.py')));
 assert.equal(p.pinnedProductionLanePrivateSha256,sha(await read('runtime/qa/g3/g334-pillow-safe-edge-cases/production.json')));
 assert.equal(p.pinnedShadowLanePrivateSha256,sha(await read('runtime/qa/g3/g334-pillow-safe-edge-cases/shadow.json')));
});
test('G3.34 exact RGB comparison on EXIF and alpha sources, corrupt synthetic PNG denied both lanes',async()=>{
 const p=await report();
 assert.deepEqual(p.comparedVersions,['10.1.0','12.3.0']);
 assert.equal(p.trustedOriginalSafeSourceCount,4);
 assert.equal(p.validAlphaOrExifSourcesCompared,3);
 assert.equal(p.corruptImageRejectionClassAgreementCount,1);
 assert.equal(p.identicalPixelShaValidSources,3);
 assert.deepEqual(p.comparisons.map(x=>x.case),['alpha','exif-rotation','webp-alpha','corrupted']);
 for(const c of p.comparisons){
  assert.equal(c.matchedAcceptanceOrRejection,true);
  assert.equal(c.sameRgbPixelsOrSameRejectedErrorClass,true);
  assert.equal(c.noUnexpectedMetadataOrUnsafeInput,true);
 }
});
test('G3.34 matched error handling cannot imply host sandbox, new GPU model or physical print',async()=>{
 const p=await report();
 for(const key of ['dependenciesInstalledOrUpgraded','hostSettingsOrOfficeChanged','WindowsSandboxGuestLaunched','externalUntrustedImagesProcessed','nativeParserSandboxCertified','fullModelCudaCompatibilityCertified','securityIssue4Resolved','manufacturingIssue3Resolved','printQualified','approvedForPrinter'])
  assert.equal(p[key],false,key);
 assert.equal(p.actualModelInferenceOrGpuRuns,0);
 assert.equal(p.fabricationAction,'NONE');
});
test('G3.34 safe pre-existing original file rights and private receipt lane identities match',async()=>{
 const [a,b]=await Promise.all(['production','shadow'].map(x=>read('runtime/qa/g3/g334-pillow-safe-edge-cases/'+x+'.json').then(JSON.parse)));
 assert.equal(a.pillowVersion,'10.1.0');
 assert.equal(b.pillowVersion,'12.3.0');
 assert.equal(a.originalHistoricalSourceScriptSha256,b.originalHistoricalSourceScriptSha256);
 assert.deepEqual(a.cases.map(x=>x.trustedInputSha256),b.cases.map(x=>x.trustedInputSha256));
 assert.deepEqual(a.cases.map(x=>x.status),b.cases.map(x=>x.status));
 for(let i=0;i<3;i++)assert.equal(a.cases[i].rgbPixelSha256,b.cases[i].rgbPixelSha256);
 assert.equal(a.cases[3].status,'REJECTED_CORRUPT_BY_PILLOW');
 assert.equal(a.cases[3].errorClass,b.cases[3].errorClass);
});
