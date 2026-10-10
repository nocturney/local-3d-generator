import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const E=path.join(ROOT,'docs','evidence','g3');
const read=async f=>JSON.parse(await fs.readFile(path.join(E,f),'utf8'));

test('G3.13 exact binary-float selected-pair only evidence is SHA-bound to G3.12',async()=>{
  const last=await read('orb-01-g312-spatial-index-proximity.json');
  const now=await read('orb-01-g313-selected-exact-pair-predicate.json');
  assert.equal(now.schema,'local3d.g3.13.exact-predicate-selected-real-model-pairs.v1');
  assert.equal(now.original.sourceModelSha256,last.existingRealTripoSRModelSha256);
  assert.equal(now.orientationOnlyDerivative.sourceModelSha256,last.unmodifiedSurfaceWindingOnlyCopySha256);
  assert.equal(now.proceduralReference.sourceModelSha256,last.knownOriginalGroundTruthSha256);
  assert.equal(now.historicChair.sourceModelSha256,last.historicalRealChairDerivativeSha256);
  assert.equal(now.onlySelectedPairsNotWholeMesh,true);
  assert.equal(now.reducedModelSelectionIsNotAStatisticalSample,true);
  assert.equal(now.notCrossFaceGlobalSelfIntersectionExhaustion,true);
  assert.equal(now.notTrueCADOrManufacturingPrecision,true);
  assert.equal(now.windingOnlyPairClassificationsIdentical,true);
  assert.equal(now.newAiInference,false);
  assert.equal(now.printQualified,false);
  assert.equal(now.approvedForPrinter,false);
  assert.equal(now.fabricationAction,'NONE');
});

test('G3.13 selected known indexed shared edges are NOT a full collision test',async()=>{
  const d=await read('orb-01-g313-selected-exact-pair-predicate.json');
  for(const [value,total] of [[d.original,60528],
    [d.orientationOnlyDerivative,60528],[d.proceduralReference,1920],
    [d.historicChair,29958]]){
    assert.equal(value.selectedIndexedSharedEdgePairs,24);
    assert.equal(value.totalIndexedEdgeAdjacentPairsNotAllScreened,total);
    assert.equal(value.fullModelIntersectionCensusComplete,false);
    assert.equal(value.printQualified,false);
    const counts=value.selectedPairClassifications;
    assert.equal(Object.values(counts).reduce((sum,n)=>sum+n,0),24);
    assert.equal(counts.UNRESOLVED_EXACT_BOUNDARY_OR_PARTIAL_COINCIDENCE,24);
    // The 24 selected adjacent faces necessarily meet on indexed edges:
    // unresolved contact is NOT a new physical surface defect.
  }
  assert.deepEqual(d.original.selectedPairClassifications,
                   d.orientationOnlyDerivative.selectedPairClassifications);
  assert.equal(d.completeGlobalSelfIntersectionFreeCertified,false);
});

test('G3.13 only sanitized public counts and existing SHA appear',async()=>{
  const text=await fs.readFile(path.join(E,
    'orb-01-g313-selected-exact-pair-predicate.json'),'utf8');
  assert.doesNotMatch(text,/[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}/i);
  assert.doesNotMatch(text,/D:[/\\]|runtime[/\\]|\"(?:privateExample|faceIndices|jobId|customer|prompt)\"\s*:/i);
  const data=JSON.parse(text);
  assert.equal(data.privateJobIdsOrFaceIndicesPublished,false);
  await assert.rejects(fs.access(path.join(E,'g313-private-face-pairs.json')));
});
