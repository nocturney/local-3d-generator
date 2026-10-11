import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {evaluateTrustedPillowMatrix,PillowGateError,BASE_IDS,EDGE_IDS} from '../server/g335-pillow-release-gate.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const load=p=>fs.readFile(path.join(root,p));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const norm=b=>sha(Buffer.from(b.toString('utf8').replace(/\r\n/g,'\n')));
const parent=async()=>Promise.all([
 load('docs/evidence/g3/g3-33-pillow-12-3-shadow-cpu-compatibility.json').then(JSON.parse),
 load('docs/evidence/g3/g3-34-pillow-edge-cases-cpu-parity.json').then(JSON.parse)
]);
const rejects=(a,b)=>assert.throws(()=>evaluateTrustedPillowMatrix(a,b),
 e=>e instanceof PillowGateError&&e.code==='G335_INVALID_EVIDENCE');
test('G3.35 exact 12+4 identities classify known-good CPU parity and retain blocked production upgrade',async()=>{
 const [a,b]=await parent(),p=evaluateTrustedPillowMatrix(a,b);
 assert.equal(Object.isFrozen(p),true);
 assert.equal(Object.isFrozen(p.matrix),true);
 assert.equal(p.schema,'local3d.g335.pillow-cpu-matrix-with-explicit-upgrade-denial.v1');
 assert.equal(p.uniqueKnownOriginalOrMitInputs,16);
 assert.equal(p.validDecodedRgbParityCount,15);
 assert.equal(p.malformedOriginalMatchedRejectionCount,1);
 assert.equal(p.cpuKnownGoodPreprocessingParity,'PASS_15_ACCEPTED_1_REJECTED');
 assert.equal(p.productionUpgradeReadiness,'BLOCKED_SHADOW_ONLY');
 assert.deepEqual(p.matrix.slice(0,12).map(x=>x.sourceId),BASE_IDS);
 assert.deepEqual(p.matrix.slice(12).map(x=>x.sourceId),EDGE_IDS.map(x=>'g36-original-'+x));
 assert.equal(p.matrix.at(-1).outputRgbParity,'SAME_REJECTION_CLASS');
 assert.equal(p.matrix.at(-1).expected,'REJECT_BAD_IMAGE');
 assert.equal(p.releaseBlockers.length,7);
 for(const f of ['osIsolatedNativeDecoderVerified','realGpuModelWithCandidateVerified',
 'userUntrustedImageAdmissionApproved','productionPackageChangesAuthorized',
 'canUpgradeProductionPillowAutomatically','canEnableG2Automatically',
 'canCloseSecurityIssue4','canApprovePhysicalPrint'])assert.equal(p[f],false,f);
});
test('G3.35 malformed source entries cannot spoof CPU compatibility',async()=>{
 const [a,b]=await parent();
 const cloned=o=>JSON.parse(JSON.stringify(o));
 let t=cloned(a);t.caseComparison[2].sameRgbOutputBytesSha256=false;rejects(t,b);
 t=cloned(a);t.caseComparison[3].sourceId='fake-license';rejects(t,b);
 t=cloned(a);t.caseComparison.reverse();rejects(t,b);
 t=cloned(a);t.caseComparison[0].unexpectedGuestApproval=true;rejects(t,b);
 t=cloned(a);t.caseComparison[0].licensedOrProjectOriginal='true';rejects(t,b);
 t=cloned(a);t.caseComparison.pop();rejects(t,b);
 t=cloned(a);t.pixelShaIdenticalCount=11;rejects(t,b);
 t=cloned(a);t.versions.shadow='12.3.1';rejects(t,b);
});
test('G3.35 any claimed package/OS/GPU/print release in historical evidence fails closed',async()=>{
 const [a,b]=await parent(),clone=o=>JSON.parse(JSON.stringify(o));
 for(const [key,v] of [
  ['historicalFullGpuModelCompatibilityDemonstrated',true],
  ['productionPillowUpgraded',true],['sandboxGuestLaunched',true],
  ['nativeParserSecurityOrUntrustedUploadClearance',true],
  ['securityIssue4Resolved',true],['printQualified',true],
  ['modelOrGpuRuns',1]
 ]){
  const x=clone(a);x[key]=v;rejects(x,b);
 }
 for(const [key,v] of [
  ['fullModelCudaCompatibilityCertified',true],['WindowsSandboxGuestLaunched',true],
  ['dependenciesInstalledOrUpgraded',true],['securityIssue4Resolved',true],
  ['actualModelInferenceOrGpuRuns',1]
 ]){
  const x=clone(b);x[key]=v;rejects(a,x);
 }
});
test('G3.35 edge source identities, case order and exact output flags cannot be forged',async()=>{
 const [a,b]=await parent(),clone=o=>JSON.parse(JSON.stringify(o));
 let t=clone(b);t.comparisons[1].sourceSha256='g'.repeat(64);rejects(a,t);
 t=clone(b);t.comparisons[3].sameRgbPixelsOrSameRejectedErrorClass=false;rejects(a,t);
 t=clone(b);t.comparisons[1].noUnexpectedMetadataOrUnsafeInput=false;rejects(a,t);
 t=clone(b);t.comparisons[0].case='corrupted';rejects(a,t);
 t=clone(b);t.comparisons[2].hostPath='ignored';rejects(a,t);
 t=clone(b);t.corruptImageRejectionClassAgreementCount=0;rejects(a,t);
 t=clone(b);t.productionG2WorkerStillUnmodifiedSha256='f'.repeat(64);rejects(a,t);
});
test('G3.35 immutable public matrix proof pins previous evidence, worker, private input SHA and validator',async()=>{
 const out=JSON.parse(await load('docs/evidence/g3/g3-35-pillow-cpu-compatibility-and-upgrade-blockers.json'));
 assert.equal(out.schema,'local3d.g335.pillow-version-compatibility-matrix-not-upgrade-authorization.v1');
 const expected=[
  ['historicalG333Sha256','docs/evidence/g3/g3-33-pillow-12-3-shadow-cpu-compatibility.json'],
  ['historicalG334Sha256','docs/evidence/g3/g3-34-pillow-edge-cases-cpu-parity.json'],
  ['trustedBenchmarkCatalogSha256','benchmarks/g3/fixtures/manifest.json'],
  ['originalSyntheticSetSha256','tests/fixtures/g327-synthetic-images.json'],
  ['unchangedProductionG2WorkerSha256','engines/triposr/worker.py']
 ];
 for(const [k,p] of expected)assert.equal(out[k],sha(await load(p)),k);
 assert.equal(out.cpuMatrixEvaluatorNormalizedSha256,norm(await load('server/g335-pillow-release-gate.js')));
 const p=out.privateCpuComparisonReceiptsSHA256;
 for(const [k,file] of [
  ['g333Production','runtime/qa/g3/g333-pillow-lanes/production.json'],
  ['g333Shadow','runtime/qa/g3/g333-pillow-lanes/shadow.json'],
  ['g334Production','runtime/qa/g3/g334-pillow-safe-edge-cases/production.json'],
  ['g334Shadow','runtime/qa/g3/g334-pillow-safe-edge-cases/shadow.json']
 ])assert.equal(p[k],sha(await load(file)),k);
 assert.deepEqual(out.releaseDecision,evaluateTrustedPillowMatrix(...await parent()));
});
test('G3.35 no source content or private job data published; clear distinction replay vs live host',async()=>{
 const raw=(await load('docs/evidence/g3/g3-35-pillow-cpu-compatibility-and-upgrade-blockers.json')).toString();
 const p=JSON.parse(raw);
 assert.equal(p.currentLiveSystemRecheckedByThisAssembler,false);
 assert.equal(p.G1Port4177LiveAvailabilityProven,false);
 assert.equal(p.osNativeImageDecoderSandboxCertified,false);
 assert.equal(p.cudaModelCandidateCompatibilityCertified,false);
 assert.equal(p.runtimeGpuInferenceRuns,0);
 assert.equal(p.productionPythonChanged,false);
 assert.equal(p.customerUntrustedImagesProcessed,false);
 assert.equal(p.windowsSandboxGuestStarted,false);
 assert.equal(p.office4178Changed,false);
 assert.equal(p.printQualified,false);
 assert.equal(p.fabricationAction,'NONE');
 assert.doesNotMatch(raw,/C:[/\\]|D:[/\\]|customerEmail|rawImage|base64|jobPrompt|privateKey/i);
});
