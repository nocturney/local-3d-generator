import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFile(path.join(root,p));
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const normalized=x=>sha(Buffer.from(x.toString('utf8').replace(/\r\n/g,'\n')));
const reportPath='docs/evidence/g3/g3-33-pillow-12-3-shadow-cpu-compatibility.json';
test('G3.33 public source chain and two offline lane outputs are SHA-bound',async()=>{
 const p=JSON.parse(await read(reportPath));
 assert.equal(p.schema,'local3d.g333.pillow-12-3-existing-overlay-cpu-only-preprocessor-compatibility.v1');
 assert.equal(p.parentG332PublicSha256,sha(await read('docs/evidence/g3/g3-32-canonical-wsb-xml-static-review.json')));
 assert.equal(p.sourceManifestSha256,sha(await read('benchmarks/g3/fixtures/manifest.json')));
 assert.equal(p.originalSyntheticInputsSha256,sha(await read('tests/fixtures/g327-synthetic-images.json')));
 assert.equal(p.pinnedProductionWorkerUnchangedSha256,sha(await read('engines/triposr/worker.py')));
 assert.equal(p.laneCodeNormalizedSha256,normalized(await read('scripts/g3-33-cpu-pillow-lane.py')));
 assert.equal(p.productionPrivateCpuLaneRecordSha256,sha(await read('runtime/qa/g3/g333-pillow-lanes/production.json')));
 assert.equal(p.shadowPrivateCpuLaneRecordSha256,sha(await read('runtime/qa/g3/g333-pillow-lanes/shadow.json')));
});
test('G3.33 all 12 public licensed/original images match exact RGB bytes',async()=>{
 const p=JSON.parse(await read(reportPath));
 assert.deepEqual(p.versions,{production:'10.1.0',shadow:'12.3.0'});
 for(const key of ['sameDimensionsCount','pixelShaIdenticalCount','alphaCompositionLaneSameCount','totalPreviouslyLicensedOrOriginalInputs'])
  assert.equal(p[key],12,key);
 assert.equal(p.projectGeneratedOrSyntheticInputs,11);
 assert.equal(p.upstreamMitLicensedSampleInputs,1);
 assert.equal(p.caseComparison.length,12);
 assert.equal(new Set(p.caseComparison.map(x=>x.sourceId)).size,12);
 for(const c of p.caseComparison)
  for(const key of ['licensedOrProjectOriginal','sameWidthAndHeight','sameRgbOutputBytesSha256','sameAlphaCompositionLane'])
   assert.equal(c[key],true,key);
});
test('G3.33 success on trusted CPU files cannot grant model GPU or parser security approval',async()=>{
 const p=JSON.parse(await read(reportPath));
 for(const key of ['historicalFullGpuModelCompatibilityDemonstrated','compatibilityOfAllOtherPackageModulesDemonstrated','productionPillowUpgraded','productionVenvOrWeightsChanged','packagesInstalledOrDownloaded','hostOSNetworkOrSecurityChanged','sandboxGuestLaunched','untrustedImagesProcessed','nativeParserSecurityOrUntrustedUploadClearance','securityIssue4Resolved','manufacturingIssue3Resolved','printQualified','approvedForPrinter'])
  assert.equal(p[key],false,key);
 assert.equal(p.modelOrGpuRuns,0);
 assert.equal(p.fabricationAction,'NONE');
});
test('G3.33 independently recorded CPU lane identities and rights match',async()=>{
 const [a,b]=await Promise.all(['production','shadow'].map(n=>read('runtime/qa/g3/g333-pillow-lanes/'+n+'.json').then(JSON.parse)));
 assert.equal(a.pillowVersion,'10.1.0');
 assert.equal(b.pillowVersion,'12.3.0');
 assert.equal(a.fixtureCount,12);
 assert.equal(b.fixtureCount,12);
 for(const field of ['publicSourceId','publicSourceSha256','sourceRights','resultRgbBytesSha256'])
  assert.deepEqual(a.rows.map(x=>x[field]),b.rows.map(x=>x[field]),field);
 assert.equal(a.gpuInferenceRuns,0);
 assert.equal(b.gpuInferenceRuns,0);
});
