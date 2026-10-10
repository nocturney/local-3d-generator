import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const E=path.join(ROOT,'docs','evidence','g3');
const get=async name=>JSON.parse(await fs.readFile(path.join(E,name),'utf8'));

test('G3.12 real previous orb source and all four proximity censuses are SHA-linked',async()=>{
  const data=await get('orb-01-g312-spatial-index-proximity.json');
  const prior=await get('orb-01-g311-edge-coplanar-screen.json');
  assert.equal(data.schema,'local3d.g3.12.existing-model-spatial-index-proximity.v1');
  assert.equal(data.fixtureId,prior.fixtureId);
  assert.equal(data.rights,prior.sourceRights);
  assert.equal(data.fixtureImageSha256,prior.originalImageSha256);
  assert.equal(data.existingRealTripoSRModelSha256,prior.priorRealTripoSRModelSha256);
  assert.equal(data.unmodifiedSurfaceWindingOnlyCopySha256,prior.priorCPUOrientationDerivativeSha256);
  assert.equal(data.knownOriginalGroundTruthSha256,prior.proceduralGroundTruthSha256);
  assert.equal(data.historicalRealChairDerivativeSha256,prior.earlierRealChairDerivativeSha256);
  assert.equal(prior.coincidentDifferentIndicesStillUntested,true);
  assert.equal(data.originalAndDerivativeIdenticalSpatialRiskIndicators,true);
  assert.deepEqual(data.originalRealTripoSR,data.unchangedWindingOnlyCopy);
  assert.equal(data.additionalAiInferenceThisMilestone,false);
  assert.equal(data.noAutomaticVertexWeldingOrGeometryRepair,true);
  assert.equal(data.printQualified,false);
  assert.equal(data.approvedForPrinter,false);
  assert.equal(data.fabricationAction,'NONE');
});

test('G3.12 full four-model census has correct limits and refuses false print clearance',async()=>{
  const data=await get('orb-01-g312-spatial-index-proximity.json');
  for(const [record,vertices,triangles] of [
    [data.originalRealTripoSR,20178,40352],
    [data.unchangedWindingOnlyCopy,20178,40352],
    [data.knownProceduralSource,642,1280],
    [data.historicalRealChairCopy,9986,19972]
  ]){
    assert.equal(record.vertexCount,vertices);
    assert.equal(record.triangleCount,triangles);
    assert.equal(record.indexedConnectedComponents,1);
    assert.equal(record.completedAllDifferentIndexVertexPairCandidates,true);
    assert.equal(record.pairsWithinRelativeTolerance,0);
    assert.equal(record.exactlyEqualXYZDifferentIndexPairs,0);
    assert.equal(record.nearButNotEqualXYZDifferentIndexPairs,0);
    assert.equal(record.crossIndexedComponentVertexProximityPairs,0);
    assert.equal(record.componentPairsWithVertexProximity,0);
    assert.equal(record.certifiesNoShellContacts,false);
    assert.equal(record.certifiesNoSelfIntersections,false);
    assert.ok(record.toleranceRelativeToBoundingDiagonal>0);
    assert.ok(record.toleranceArbitraryModelUnits>0);
  }
  assert.equal(data.completeGlobalRobustSelfIntersectionTest,false);
  assert.equal(data.faceInteriorShellContactTest,'NOT_PERFORMED');
  assert.equal(data.crossIndexedComponentProximityIsOnlyAVertexBasedTouchingShellCandidate,true);
  assert.equal(data.zeroVertexCandidatesDoNotExcludeTriangleInteriorIntersections,true);
  assert.equal(data.distinctIndexExactlyCoincidentVerticesMayBeLegitimateSeams,true);
  assert.equal(data.physicalMillimeterScale,'UNKNOWN_UNCALIBRATED');
  assert.equal(data.wallThickness,'NOT_TESTED');
  assert.equal(data.printQualified,false);
});

test('G3.12 checked-in evidence contains no private job identities or raw vertex indices',async()=>{
  const payload=await fs.readFile(path.join(E,'orb-01-g312-spatial-index-proximity.json'),'utf8');
  assert.doesNotMatch(payload,/[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}/i);
  assert.doesNotMatch(payload,/D:[/\\]|runtime[/\\]|privateExampleVertexPairs|jobId|customer|prompt/i);
  await assert.rejects(fs.access(path.join(E,'orb-01-g312-unredacted.glb')));
});
