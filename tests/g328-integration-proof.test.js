import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {readHistoricalServerBytes,HISTORICAL_SERVER_SHA} from '../scripts/g3-28-historical-server-source.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ev=path.join(root,'docs/evidence/g3');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const data=()=>fs.readFile(path.join(ev,'g3-28-integrated-structural-image-admission.json'),'utf8').then(JSON.parse);
test('G3.28 code SHA identifies NEW admission and preserves exact three historical report hashes',async()=>{
 const p=await data();
 assert.equal(p.schema,'local3d.g3.28.integrated-bounded-image-admission-not-native-sandbox.v1');
 assert.equal(p.previousHistoricWindowsServerSha256,HISTORICAL_SERVER_SHA);
 assert.equal(sha(readHistoricalServerBytes()),HISTORICAL_SERVER_SHA);
 const oldNames=['g325','g326','g327'],files=[
  'g3-25-pillow-format-review.json',
  'g3-26-harmless-image-boundary.json',
  'g3-27-image-structure-preflight-contract.json'
 ];
 for(let i=0;i<files.length;i++)
  assert.equal(p.historicalPublicProofSha256[oldNames[i]],
    sha(await fs.readFile(path.join(ev,files[i]))));
 const current=await fs.readFile(path.join(root,'server/index.js'));
 assert.equal(p.currentIntegratedWindowsServerSha256,sha(current));
 assert.notEqual(sha(current),HISTORICAL_SERVER_SHA);
 assert.equal(p.currentImageStructureModuleSha256,
  sha(await fs.readFile(path.join(root,'server/image-structure-preflight.js'))));
 assert.equal(p.currentOriginalSyntheticFixturesSha256,
  sha(await fs.readFile(path.join(root,'tests/fixtures/g327-synthetic-images.json'))));
 assert.equal(p.originalProductionPythonWorkerStillUnmodifiedSha256,
  sha(await fs.readFile(path.join(root,'engines/triposr/worker.py'))));
 assert.equal(p.parserIsInvokedBeforeNewJobIdStorageAndGpuLease,true);
 assert.equal(p.serverRejectsIncompleteStructureWithHttp422,true);
 assert.equal(p.g2Requires64PixelMinimum,true);
 assert.equal(p.acceptedSafeOriginalSyntheticFixtures,3);
 assert.equal(p.rejectedSafeTruncatedVariants,9);
});
test('G3.28 historical snapshot and new live source are explicitly different, never rewritten',async()=>{
 const newSource=await fs.readFile(path.join(root,'server/index.js'),'utf8');
 const oldSource=readHistoricalServerBytes().toString('utf8');
 assert.doesNotMatch(oldSource,/preflightImageStructure/);
 assert.match(newSource,/preflightImageStructure\(image, imageInfo.mime, \{minDimension:isReal \? 64 : 1\}\);/);
 assert.match(newSource,/BAD_IMAGE_STRUCTURE/);
 const oldCheck=oldSource.indexOf('imageInfo = sniffImage(image);');
 const newCheck=newSource.indexOf('imageInfo = sniffImage(image);');
 const newGuard=newSource.indexOf('preflightImageStructure(image, imageInfo.mime');
 const newJob=newSource.indexOf('const id = randomUUID();');
 assert.ok(oldCheck>=0&&newCheck>=0&&newCheck<newGuard&&newGuard<newJob);
});
test('G3.28 public report has no customer media or incorrect security/print approvals',async()=>{
 const raw=await fs.readFile(path.join(ev,'g3-28-integrated-structural-image-admission.json'),'utf8');
 const p=JSON.parse(raw);
 assert.doesNotMatch(raw,/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
 assert.doesNotMatch(raw,/D:[/\\]|"jobId"\s*:|customerEmail|sourceImagePath|checkpointPath|accessToken/i);
 assert.equal(p.nativePillowSandboxImplemented,false);
 assert.equal(p.OSFilesystemNetworkContainmentEstablished,false);
 assert.equal(p.fullPillowDecodeProvenForArbitraryAcceptedFiles,false);
 assert.equal(p.securityIssue4Resolved,false);
 assert.equal(p.manufacturingIssue3Resolved,false);
 assert.equal(p.newUntrustedUserUploadPermission,false);
 assert.equal(p.existing4177ServiceRestarted,false);
 assert.equal(p.packageOrWeightsInstall,false);
 assert.equal(p.gpuInferenceRuns,0);
 assert.equal(p.modelExecutions,0);
 assert.equal(p.printQualified,false);
 assert.equal(p.approvedForPrinter,false);
 assert.equal(p.fabricationAction,'NONE');
});
