import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const E=path.join(ROOT,'docs','evidence','g3');
const load=async name=>JSON.parse(await fs.readFile(path.join(E,name),'utf8'));

test('G3.19 independent second exact oracle follows same four preexisting licensed source SHAs',async()=>{
  const r=await load('orb-01-g319-second-exact-oracle-proof.json');
  const o=await load('orb-01-g318-exact-axis-sweep-proof.json');
  const a=await load('orb-01-g317-exact-noindex-aabb-pairs.json');
  assert.equal(r.schema,'local3d.g3.19.independent-second-triangle-oracle-four-source.v1');
  assert.equal(r.fixtureId,'01-orb-alpha');
  assert.equal(r.sourceRights,'PROJECT_ORIGINAL_PROCEDURAL');
  assert.equal(r.historicalOriginalImageSha256,o.priorSourceImageSha256);
  assert.equal(r.historicRealOrbTripoSRModelSha256,a.realHistoricTripoSRModelSha256);
  assert.equal(r.unchangedWindingOnlyCopySha256,o.previousWindingOnlyModelSha256);
  assert.equal(r.originalProceduralGroundTruthSha256,o.previousProceduralGTModelSha256);
  assert.equal(r.historicLicensedMITChairSha256,o.previousLicensedChairModelSha256);
  assert.equal(r.historicalG2CompletedJobAssetsAndOriginalSourceRightsVerified,true);
  assert.equal(r.twoDifferentExactNarrowphaseImplementationsAgreeForEveryNoIndexAabbCandidate,true);
  assert.equal(r.notFullIndependentIndexedAdjacencyOracle,true);
  assert.equal(r.noNewGpuAiInference,true);
  assert.equal(r.globalSelfIntersectionFreeCertified,false);
  assert.equal(r.printQualified,false);
  assert.equal(r.approvedForPrinter,false);
  assert.equal(r.fabricationAction,'NONE');
});

test('G3.19 all no-index candidates SECOND exact checked, only 256 indexed-edge & vertex sampled',async()=>{
  const r=await load('orb-01-g319-second-exact-oracle-proof.json');
  const z=await load('orb-01-g317-exact-noindex-aabb-pairs.json');
  const a=await load('orb-01-g314-full-aabb-census.json');
  const cases=[
    [r.realTripoSR,z.realTripoSR,a.realTripoSR,40352,43107,60528,190860],
    [r.windingOnlySameSurface,z.windingOnlySameSurface,a.unchangedWindingOnlyCopy,40352,43107,60528,190860],
    [r.originalProceduralGT,z.originalProceduralGT,a.projectOriginalGT,1280,216,1920,5730],
    [r.historicalLicensedChair,z.historicLicensedChair,a.historicalChair,19972,28593,29958,92629]
  ];
  for(const [x,old,legacy,faces,noindex,edge,vertex] of cases) {
    assert.equal(x.faces,faces);
    assert.equal(x.G317NoIndexPairCandidates,noindex);
    assert.equal(x.G319NoIndexIndependentOracleClassified,noindex);
    assert.equal(x.independentSecondExactOracleClassificationCounts.EXACT_DISJOINT,noindex);
    assert.equal(Object.values(x.independentSecondExactOracleClassificationCounts).reduce((a,b)=>a+b,0),noindex);
    assert.equal(x.indexedFullSharedEdgePairsTotal,edge);
    assert.equal(x.indexedSingleVertexPairsTotal,vertex);
    assert.equal(x.indexedFullEdgeOracleSampleCount,256);
    assert.equal(x.indexedOneVertexOracleSampleCount,256);
    assert.equal(Object.values(x.indexedFullEdgeSampleClassificationCounts).reduce((a,b)=>a+b,0),256);
    assert.equal(x.indexedSingleVertexSampleClassificationCounts.EXACT_SINGLE_POINT_BOUNDARY_CONTACT,256);
    assert.equal(x.completeNoIndexDifferentialExactEveryCandidate,true);
    assert.equal(x.onlySelectedIndexedAdjacencyDifferentialNotEntire,true);
    assert.equal(x.printQualified,false);
    assert.equal(old.nonindexedAabbExactCandidateCount,noindex);
    assert.equal(legacy.pairsSharingIndexedEdge,edge);
    assert.equal(legacy.pairsSharingExactlyOneIndexedVertex,vertex);
  }
  assert.deepEqual(r.realTripoSR,r.windingOnlySameSurface);
  assert.equal(r.identicalGeometricOriginalAndWindingCopyCounts,true);
  assert.equal(r.decodedGeometryNotUnquantizedCAD,true);
  assert.equal(r.globalSelfIntersectionFreeCertified,false);
  assert.equal(r.wallThickness,'NOT_TESTED');
});

test('G3.19 public SHA proof excludes private face pair examples, GLBs and job UUID',async()=>{
  const raw=await fs.readFile(path.join(E,'orb-01-g319-second-exact-oracle-proof.json'),'utf8');
  assert.doesNotMatch(raw,/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  assert.doesNotMatch(raw,/D:[/\\]|runtime[/\\]|"jobId"|"facePairIds"|"privateExample"|"prompt"|"customerEmail"/i);
  const data=JSON.parse(raw);
  assert.equal(data.rawModelImagePrivateJobUUIDAndSampleFaceIndicesExcluded,true);
  assert.equal(data.printQualified,false);
  await assert.rejects(fs.access(path.join(E,'orb-01-g319-private-pairs.glb')));
});
