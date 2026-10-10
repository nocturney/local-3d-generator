import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const E=path.join(ROOT,'docs','evidence','g3');
const load=async file=>JSON.parse(await fs.readFile(path.join(E,file),'utf8'));

test('G3.14 new independent conservative all-AABB counts derive from prior real SHA source',async()=>{
  const now=await load('orb-01-g314-full-aabb-census.json');
  const prior=await load('orb-01-g38-cpu-risk-screen.json');
  const exact=await load('orb-01-g313-selected-exact-pair-predicate.json');
  assert.equal(now.schema,'local3d.g3.14.real-model-exhaustive-numerical-aabb-census.v1');
  assert.equal(now.fixtureId,prior.fixtureId);
  assert.equal(now.sourceRights,prior.inputRights);
  assert.equal(now.originalFixtureImageSha256,prior.sourceImageSha256);
  assert.equal(now.priorRealTripoSRModelSha256,prior.realOriginalOutputSha256);
  assert.equal(now.sameGeometryWindingDerivativeSha256,prior.previousOrientationOnlyDerivativeSha256);
  assert.equal(now.originalProceduralGroundTruthSha256,prior.originalGroundTruthSha256);
  assert.equal(now.historicalChairDerivativeSha256,exact.historicChair.sourceModelSha256);
  assert.equal(now.historicalG38RealAabbPairsAfterItsCentroidSphereFilter,prior.contacts.original.aabbPairs);
  assert.equal(now.historicalG38RealNoIndexNumericalSatPairs,prior.contacts.original.conservativeSatPairChecks);
  assert.equal(now.g314AdditionalConservativeAabbPairsOverG38,82);
  assert.equal(now.g314AdditionalNoIndexedVertexAabbPairsOverG38,82);
  assert.equal(now.originalAndDerivativeCensusesIdentical,true);
  assert.deepEqual(now.realTripoSR,now.unchangedWindingOnlyCopy);
  assert.equal(now.additionalGpuInferenceThisMilestone,false);
  assert.equal(now.printQualified,false);
  assert.equal(now.approvedForPrinter,false);
  assert.equal(now.fabricationAction,'NONE');
});

test('G3.14 all 4 previous GLB numerical AABB pair partitions and SAT completeness',async()=>{
  const r=await load('orb-01-g314-full-aabb-census.json');
  const entries=[
    [r.realTripoSR,40352,294495,60528,190860,43107],
    [r.unchangedWindingOnlyCopy,40352,294495,60528,190860,43107],
    [r.projectOriginalGT,1280,7866,1920,5730,216],
    [r.historicalChair,19972,151180,29958,92629,28593]
  ];
  for(const [x,faces,all,edge,vertex,zero] of entries){
    assert.equal(x.triangleCount,faces);
    assert.equal(x.everyPotentialAabbOverlapNumericallyEnumerated,true);
    assert.equal(x.allNumericalSATNoIndexPairsExamined,true);
    assert.equal(x.aabbOverlappingFacePairs,all);
    assert.equal(x.pairsSharingIndexedEdge,edge);
    assert.equal(x.pairsSharingExactlyOneIndexedVertex,vertex);
    assert.equal(x.pairsSharingNoIndexedVertex,zero);
    assert.equal(all,edge+vertex+zero);
    assert.equal(x.noIndexPairsCheckedByConservativeNumericalSAT,zero);
    assert.equal(x.possibleNonindexNumericalContactPairs,0);
    assert.equal(x.possibleNonindexContactsExactRefined,true);
    assert.equal(x.noPrintQualification,true);
    assert.ok(x.aabbRelativeTolerance>0);
    assert.ok(x.aabbToleranceArbitraryModelUnits>0);
    assert.ok(x.sphereBroadphaseCandidates>=all);
  }
  assert.equal(r.exactPredicateApplication,'ONLY_NUMERICAL_SAT_POSITIVE_NO_INDEX_PAIR_SUBSET');
  assert.equal(r.indexedEdgeAndVertexTouchingNotExactGloballyResolved,true);
  assert.equal(r.numericalSatCannotCertifyNoSmallIntersections,true);
  assert.equal(r.notTrueGlobalSelfIntersectionFreeCertification,true);
  assert.equal(r.physicalMillimeterScale,'UNKNOWN_UNCALIBRATED');
  assert.equal(r.wallThickness,'NOT_TESTED');
  assert.equal(r.printQualified,false);
});

test('G3.14 public SHA evidence excludes all private GLBs, paths and job UUID',async()=>{
  const p=path.join(E,'orb-01-g314-full-aabb-census.json');
  const raw=await fs.readFile(p,'utf8');
  assert.doesNotMatch(raw,/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  assert.doesNotMatch(raw,/D:[/\\]|runtime[/\\]|"privateExample"|"jobId"|"customerEmail"|"prompt"/i);
  const data=JSON.parse(raw);
  assert.equal(data.privateUUIDImagesAndFacePairIDsNotPublished,true);
  assert.equal(data.allModelsDraft,true);
  await assert.rejects(fs.access(path.join(E,'orb-01-g314-private-index-pairs.glb')));
});
