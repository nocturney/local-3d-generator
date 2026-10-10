import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const E=path.join(ROOT,'docs','evidence','g3');
const load=async n=>JSON.parse(await fs.readFile(path.join(E,n),'utf8'));

test('G3.17 prior licensed source SHA and G3.14/G3.15/G3.16 evidence lineage retained',async()=>{
  const r=await load('orb-01-g317-exact-noindex-aabb-pairs.json');
  const a=await load('orb-01-g314-full-aabb-census.json');
  const b=await load('orb-01-g315-exact-indexed-edge.json');
  const c=await load('orb-01-g316-exact-indexed-vertex-only.json');
  assert.equal(r.schema,'local3d.g3.17.exact-noindex-all-numerical-aabb-pairs-four-models.v1');
  assert.equal(r.sourceFixtureId,'01-orb-alpha');
  assert.equal(r.sourceImageRights,'PROJECT_ORIGINAL_PROCEDURAL');
  assert.equal(r.originalImageSha256,a.originalFixtureImageSha256);
  assert.equal(r.realHistoricTripoSRModelSha256,b.originalRealModelSha256);
  assert.equal(r.realHistoricTripoSRModelSha256,c.realPreviouslyGeneratedTripoSRModelSha256);
  assert.equal(r.sameGeometryWindingDerivativeSha256,a.sameGeometryWindingDerivativeSha256);
  assert.equal(r.proceduralGroundTruthSha256,b.proceduralGroundTruthSha256);
  assert.equal(r.historicLicensedChairSha256,c.historicalLicensedChairGLBSha256);
  assert.equal(r.sameHistoricallyLicensedInputAssetsNoNewAI,true);
  assert.equal(r.exactNarrowphaseOnEveryNumericalNoIndexAabbCandidate,true);
  assert.equal(r.g315FullEdgeIndexedPairsExactSeparate,true);
  assert.equal(r.g316OneVertexIndexedPairsExactSeparate,true);
  assert.equal(r.globalSelfIntersectionFreeCertified,false);
  assert.equal(r.printQualified,false);
  assert.equal(r.approvedForPrinter,false);
  assert.equal(r.fabricationAction,'NONE');
});

test('G3.17 independent AABB 0/1/2 index partitions match original G3.14 and exact totals',async()=>{
  const r=await load('orb-01-g317-exact-noindex-aabb-pairs.json');
  const a=await load('orb-01-g314-full-aabb-census.json');
  const rows=[
    [r.realTripoSR,a.realTripoSR,40352,294495,60528,190860,43107],
    [r.windingOnlySameSurface,a.unchangedWindingOnlyCopy,40352,294495,60528,190860,43107],
    [r.originalProceduralGT,a.projectOriginalGT,1280,7866,1920,5730,216],
    [r.historicLicensedChair,a.historicalChair,19972,151180,29958,92629,28593],
  ];
  for (const [x,y,faces,all,edge,vertex,zero] of rows){
    assert.equal(x.faces,faces);
    assert.equal(x.allAabbOverlapCandidates,all);
    assert.equal(x.indexedFullEdgeAabbPairCount,edge);
    assert.equal(x.indexedVertexOnlyAabbPairCount,vertex);
    assert.equal(x.nonindexedAabbExactCandidateCount,zero);
    assert.equal(x.exactNoIndexPairsExamined,zero);
    assert.equal(all,edge+vertex+zero);
    assert.equal(y.pairsSharingIndexedEdge,edge);
    assert.equal(y.pairsSharingExactlyOneIndexedVertex,vertex);
    assert.equal(y.pairsSharingNoIndexedVertex,zero);
    assert.equal(x.exactDisjointPairs+
      x.exactPointBoundaryContactPairs+
      x.exactNoncoplanarPositiveLengthPairContacts+
      x.exactCoplanarPositiveLengthBoundaryPairs+
      x.exactCoplanarPositiveAreaPairs,zero);
    assert.equal(x.totalExactCandidateContacts,
      x.exactPointBoundaryContactPairs+
      x.exactNoncoplanarPositiveLengthPairContacts+
      x.exactCoplanarPositiveLengthBoundaryPairs+
      x.exactCoplanarPositiveAreaPairs);
    assert.equal(x.completeForNumericallySelectedAabbCandidates,true);
    assert.equal(x.globalSelfIntersectionFreeCertified,false);
    assert.equal(x.printQualified,false);
  }
  assert.deepEqual(r.realTripoSR,r.windingOnlySameSurface);
  assert.equal(r.realTripoSR.exactDisjointPairs,43107);
  assert.equal(r.realTripoSR.totalExactCandidateContacts,0);
  assert.equal(r.originalProceduralGT.exactDisjointPairs,216);
  assert.equal(r.originalAndWindingDerivativeCountsIdentical,true);
  assert.equal(r.reproducedPriorG314IndependentIndexPairPartitions,true);
  assert.equal(r.notFormalArbitraryPrecisionGlobalMeshContactProof,true);
  assert.equal(r.decodedIEEE754CoordinatesNotOriginalCADPhysicalMillimeters,true);
  assert.equal(r.printerDimensionalCalibration,'NOT_PERFORMED');
  assert.equal(r.wallThickness,'NOT_TESTED');
});

test('G3.17 public exact SHA proof excludes private job/model/image/face indices',async()=>{
  const raw=await fs.readFile(path.join(E,
    'orb-01-g317-exact-noindex-aabb-pairs.json'),'utf8');
  assert.doesNotMatch(raw,/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  assert.doesNotMatch(raw,/D:[/\\]|runtime[/\\]|"jobId"|"privateExample"|"prompt"|"customerEmail"|"facePairs"/i);
  const r=JSON.parse(raw);
  assert.equal(r.privateJobIdImageBinaryAndFacePairExamplesExcluded,true);
  assert.equal(r.globalSelfIntersectionFreeCertified,false);
  await assert.rejects(fs.access(path.join(E,'orb-01-g317-private-pairs.glb')));
});
