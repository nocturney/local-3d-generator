import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const E=path.join(ROOT,'docs','evidence','g3');
const get=async p=>JSON.parse(await fs.readFile(p,'utf8'));

test('G3.11 edge-shared real-orb coplanar risk evidence is SHA-pinned and not a print authorization',async()=>{
  const data=await get(path.join(E,'orb-01-g311-edge-coplanar-screen.json'));
  const v10=await get(path.join(E,'orb-01-g310-shared-vertex-ray-screen.json'));
  const v9=await get(path.join(E,'orb-01-g39-adjacent-angles.json'));
  assert.equal(data.schema,'local3d.g3.11.real-orb-shared-edge-coplanar-risk.v1');
  assert.equal(data.fixtureId,'01-orb-alpha');
  assert.equal(data.sourceRights,'PROJECT_ORIGINAL_PROCEDURAL');
  assert.equal(data.originalImageSha256,v10.fixtureImageSha256);
  assert.equal(data.priorRealTripoSRModelSha256,v10.originalRealTripoSRModelSha256);
  assert.equal(data.priorCPUOrientationDerivativeSha256,v10.unchangedWindingOnlyCopySha256);
  assert.equal(data.proceduralGroundTruthSha256,v10.originalProceduralSourceGtSha256);
  assert.equal(data.originalRealTripoSR.indexedSharedEdgeFacePairs,
               v9.originalRealTripoSR.indexedEdgeAdjacentPairs);
  assert.equal(data.additionalAiInferenceThisMilestone,false);
  assert.equal(data.originalVsCopyEdgeGeometryIndicatorsIdentical,true);
  assert.equal(data.notExactRobustIntersectionOrSelfIntersectionCertificate,true);
  assert.equal(data.printQualified,false);
  assert.equal(data.approvedForPrinter,false);
  assert.equal(data.fabricationAction,'NONE');
  assert.equal(data.wallThickness,'NOT_TESTED');
  assert.equal(data.physicalMillimeterScale,'UNKNOWN_UNCALIBRATED');
  assert.equal(data.originalPrivateModelsAndJobIdsNotPublished,true);
  assert.equal(data.sharpAnglesCanBeIntentionalAndNotIndicateCollision,true);
  assert.match(data.criterion,/SAME_SIDE/);
  const str=JSON.stringify(data);
  assert.doesNotMatch(str,/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  assert.doesNotMatch(str,/D:\\\\Velvet|runtime[/\\]data-g2-manual|ONE_TIME_APPROVAL/i);
  assert.doesNotMatch(str,/"(?:jobId|prompt|clientName|customerEmail|privateExamplePossibleOverlapFaceIndices)"\s*:/i);
  await assert.rejects(fs.access(path.join(E,'orb-01-g311-derivative.glb')));
});

test('G3.11 all known indexed shared edges checked, coplanar overlap controls remain diagnostics',async()=>{
  const data=await get(path.join(E,'orb-01-g311-edge-coplanar-screen.json'));
  const real=data.originalRealTripoSR;
  const copy=data.sameSurfaceWindingOnlyCopy;
  const gt=data.originalProceduralGroundTruth;
  const chair=data.earlierRealChairDerivative;
  assert.deepEqual(real,copy);
  assert.equal(real.triangleCount,40352);
  assert.equal(real.indexedSharedEdgeFacePairs,60528);
  assert.equal(gt.triangleCount,1280);
  assert.equal(gt.indexedSharedEdgeFacePairs,1920);
  assert.equal(chair.triangleCount,19972);
  assert.equal(chair.indexedSharedEdgeFacePairs,29958);
  for(const model of [real,copy,gt,chair]){
    assert.equal(model.everyIndexedSharedEdgePairExamined,true);
    assert.equal(model.potentialCoplanarSameSideOverlapPairs,0);
    assert.equal(model.nearAntiparallelOver175Pairs,0);
    assert.equal(model.backturnSameSideOver150Pairs,0);
    assert.equal(model.nearCoplanarBorderlineSideUnresolvedPairs,0);
    assert.equal(model.canCertifyNoEdgeFold,false);
    assert.ok(model.numericalToleranceInOriginalArbitraryUnits>0);
    assert.ok(model.indexedSharedEdgeFacePairs<=model.triangleCount*3/2);
  }
  assert.equal(data.notExactRobustIntersectionOrSelfIntersectionCertificate,true);
  assert.equal(data.coincidentDifferentIndicesStillUntested,true);
  assert.equal(data.fabricationAction,'NONE');
});
