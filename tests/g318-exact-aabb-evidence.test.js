import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const E=path.join(ROOT,'docs','evidence','g3');
const get=async name=>JSON.parse(await fs.readFile(path.join(E,name),'utf8'));

test('G3.18 independently sorted exact axis sweep reuses only previous licensed SHAs',async()=>{
  const r=await get('orb-01-g318-exact-axis-sweep-proof.json');
  const a=await get('orb-01-g314-full-aabb-census.json');
  const z=await get('orb-01-g317-exact-noindex-aabb-pairs.json');
  assert.equal(r.schema,'local3d.g3.18.exact-aabb-axis-sweep-four-licensed-sources.v1');
  assert.equal(r.fixtureId,'01-orb-alpha');
  assert.equal(r.sourceRights,'PROJECT_ORIGINAL_PROCEDURAL');
  assert.equal(r.priorSourceImageSha256,a.originalFixtureImageSha256);
  assert.equal(r.previousRealTripoSRModelSha256,z.realHistoricTripoSRModelSha256);
  assert.equal(r.previousWindingOnlyModelSha256,a.sameGeometryWindingDerivativeSha256);
  assert.equal(r.previousProceduralGTModelSha256,z.proceduralGroundTruthSha256);
  assert.equal(r.previousLicensedChairModelSha256,z.historicLicensedChairSha256);
  assert.equal(r.noKDTreeUsedForIndependentExactSweep,true);
  assert.equal(r.zeroIndexCandidatePairIdentityComparedNotOnlyCounts,true);
  assert.equal(r.allStrictDecodedCoordinateAabbNoIndexPairsPresentInPriorExactG317,true);
  assert.equal(r.allExactToleranceDecodedCoordinateAabbNoIndexPairsPresentInG317,true);
  assert.equal(r.allFourHistoricalGLBShaAndOriginalCompletedJobAssetsVerified,true);
  assert.equal(r.noNewModelInference,true);
  assert.equal(r.printQualified,false);
  assert.equal(r.approvedForPrinter,false);
  assert.equal(r.fabricationAction,'NONE');
});

test('G3.18 every old AABB 0/1/2 count and no-index pair identity vs exact sweep',async()=>{
  const r=await get('orb-01-g318-exact-axis-sweep-proof.json');
  const a=await get('orb-01-g314-full-aabb-census.json');
  const z=await get('orb-01-g317-exact-noindex-aabb-pairs.json');
  const cases=[
    [r.realTripoSR,a.realTripoSR,z.realTripoSR,40352,294495,60528,190860,43107],
    [r.sameSurfaceWindingOnlyDerivative,a.unchangedWindingOnlyCopy,z.windingOnlySameSurface,40352,294495,60528,190860,43107],
    [r.originalProceduralGT,a.projectOriginalGT,z.originalProceduralGT,1280,7866,1920,5730,216],
    [r.previousLicensedChair,a.historicalChair,z.historicLicensedChair,19972,151180,29958,92629,28593]
  ];
  for(const [x,old,exact,faces,all,edge,one,zero] of cases){
    assert.equal(x.faces,faces);
    assert.equal(x.rationalExactToleranceAabbPairs,all);
    assert.equal(x.G317NumericAabbPairs,all);
    assert.equal(x.exactToleranceSharedIndexedEdge,edge);
    assert.equal(x.exactToleranceOneIndexedVertex,one);
    assert.equal(x.exactToleranceNoSharedIndex,zero);
    assert.equal(x.G317NumericNoIndexPairs,zero);
    assert.equal(x.rationalExactStrictAabbPairs,
        x.exactStrictSharedIndexedEdge+x.exactStrictOneIndexedVertex+x.exactStrictNoSharedIndex);
    assert.ok(x.rationalExactStrictAabbPairs<=all);
    assert.equal(x.exactToleranceNoIndexCandidatesMissingInG317,0);
    assert.equal(x.exactStrictNoIndexCandidatesMissingInG317,0);
    assert.equal(x.numericalOnlyNoIndexAabbConservativeExtras,0);
    assert.equal(x.exactNoIndexCandidateSetIdenticalToG317,true);
    assert.equal(x.completeAndNotAborted,true);
    assert.equal(x.globalSelfIntersectionFreeCertified,false);
    assert.equal(x.printQualified,false);
    assert.equal(old.aabbOverlappingFacePairs,all);
    assert.equal(old.pairsSharingIndexedEdge,edge);
    assert.equal(old.pairsSharingExactlyOneIndexedVertex,one);
    assert.equal(old.pairsSharingNoIndexedVertex,zero);
    assert.equal(exact.nonindexedAabbExactCandidateCount,zero);
    assert.equal(exact.exactDisjointPairs,zero);
  }
  assert.deepEqual(r.realTripoSR,r.sameSurfaceWindingOnlyDerivative);
  assert.equal(r.originalAndDerivativeResultsIdentical,true);
  assert.equal(r.notOriginalCADQuantizationOrPhysicalGeometryProof,true);
  assert.equal(r.physicalMillimeterScale,'UNKNOWN_UNCALIBRATED');
  assert.equal(r.wallThickness,'NOT_TESTED');
  assert.equal(r.globalSelfIntersectionFreeCertified,false);
});

test('G3.18 only aggregate source hashes, never private pair IDs, jobs or local paths',async()=>{
  const raw=await fs.readFile(path.join(E,'orb-01-g318-exact-axis-sweep-proof.json'),'utf8');
  assert.doesNotMatch(raw,/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  assert.doesNotMatch(raw,/D:[/\\]|runtime[/\\]|"jobId"|"privateExample"|"pairIds"|"customerEmail"|"prompt"/i);
  const proof=JSON.parse(raw);
  assert.equal(proof.privateJobUUIDRawModelAndPerFacePairIdsNotPublished,true);
  assert.equal(proof.globalSelfIntersectionFreeCertified,false);
  await assert.rejects(fs.access(path.join(E,'orb-01-g318-private-pair-ids.glb')));
});
