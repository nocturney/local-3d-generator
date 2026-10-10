import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const E=path.join(ROOT,'docs','evidence','g3');
const get=async name=>JSON.parse(await fs.readFile(path.join(E,name),'utf8'));

test('G3.15 all shared-index-edge exact evidence SHA-locked against G3.14',async()=>{
  const a=await get('orb-01-g314-full-aabb-census.json');
  const e=await get('orb-01-g315-exact-indexed-edge.json');
  assert.equal(e.schema,'local3d.g3.15.exact-real-indexed-edge-geometry.v1');
  assert.equal(e.sourceRights,a.sourceRights);
  assert.equal(e.originalImageSha256,a.originalFixtureImageSha256);
  assert.equal(e.originalRealModelSha256,a.priorRealTripoSRModelSha256);
  assert.equal(e.sameGeometryWindingDerivativeSha256,a.sameGeometryWindingDerivativeSha256);
  assert.equal(e.proceduralGroundTruthSha256,a.originalProceduralGroundTruthSha256);
  assert.equal(e.historicalChairDerivativeSha256,a.historicalChairDerivativeSha256);
  assert.equal(e.originalCopyExactEdgeStatisticsIdentical,true);
  assert.deepEqual(e.realTripoSR,e.sameSurfaceWindingOnlyCopy);
  assert.equal(e.allIndexedSharedEdgePairsAcrossEachModelClassified,true);
  assert.equal(e.newAiInference,false);
  assert.equal(e.printQualified,false);
  assert.equal(e.approvedForPrinter,false);
  assert.equal(e.fabricationAction,'NONE');
});

test('G3.15 every indexed shared edge is exact classified but no global clearance',async()=>{
  const e=await get('orb-01-g315-exact-indexed-edge.json');
  const a=await get('orb-01-g314-full-aabb-census.json');
  const entries=[
    [e.realTripoSR,a.realTripoSR,40352,60528],
    [e.sameSurfaceWindingOnlyCopy,a.unchangedWindingOnlyCopy,40352,60528],
    [e.originalProceduralGT,a.projectOriginalGT,1280,1920],
    [e.historicalChair,a.historicalChair,19972,29958]
  ];
  for(const [x,b,faces,pairs] of entries){
    assert.equal(x.triangleCount,faces);
    assert.equal(x.allIndexedSharedEdgePairs,pairs);
    assert.equal(x.allIndexedSharedEdgePairs,b.pairsSharingIndexedEdge);
    assert.equal(x.exactPairsExamined,pairs);
    assert.equal(x.everyIndexedEdgeClassified,true);
    assert.equal(x.noncoplanarExpectedEdgeOnlyPairs+
      x.coplanarOppositeSideExpectedEdgeOnlyPairs+
      x.coplanarSameSidePositiveAreaOverlapPairs,pairs);
    assert.equal(x.coplanarSameSidePositiveAreaOverlapPairs,0);
    assert.equal(x.globalSelfIntersectionFreeCertified,false);
    assert.equal(x.printQualified,false);
  }
  assert.equal(e.exactnessScope,'ONLY_DECODED_IEEE754_INDEXED_FULL_EDGE_ADJACENT_FACE_PAIRS');
  assert.equal(e.indexedVertexOnlyPairsRemainUnresolvedByThisExactTest,true);
  assert.equal(e.noSharedIndexPairsNotReclassifiedHere,true);
  assert.equal(e.globalSelfIntersectionFreeCertified,false);
  assert.equal(e.physicalMillimeterScale,'UNKNOWN_UNCALIBRATED');
  assert.equal(e.wallThickness,'NOT_TESTED');
});

test('G3.15 evidence has only public source SHA and aggregate exact edge counts',async()=>{
  const text=await fs.readFile(path.join(E,
    'orb-01-g315-exact-indexed-edge.json'),'utf8');
  assert.doesNotMatch(text,/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  assert.doesNotMatch(text,/D:[/\\]|runtime[/\\]|"jobId"|"privateExample"|"prompt"|"customerEmail"/i);
  const d=JSON.parse(text);
  assert.equal(d.privateUUIDAndRawIndexedFacePairExamplesNotPublished,true);
  assert.equal(d.sourceDataFromPreviouslyCompletedRealModelOnly,true);
  await assert.rejects(fs.access(path.join(E,'orb-01-g315-edge-pair-private.glb')));
});
