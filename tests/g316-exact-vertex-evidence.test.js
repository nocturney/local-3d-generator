import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const E=path.join(ROOT,'docs','evidence','g3');
const read=async file=>JSON.parse(await fs.readFile(path.join(E,file),'utf8'));

test('G3.16 inherits exact licensed SHA image/model history, not a new inference',async()=>{
  const c=await read('orb-01-g316-exact-indexed-vertex-only.json');
  const a=await read('orb-01-g314-full-aabb-census.json');
  const b=await read('orb-01-g315-exact-indexed-edge.json');
  assert.equal(c.schema,'local3d.g3.16.four-model-exact-indexed-single-vertex-proof.v1');
  assert.equal(c.sourceRights,'PROJECT_ORIGINAL_PROCEDURAL');
  assert.equal(c.fixtureId,a.fixtureId);
  assert.equal(c.sourceImageSha256,b.originalImageSha256);
  assert.equal(c.realPreviouslyGeneratedTripoSRModelSha256,b.originalRealModelSha256);
  assert.equal(c.sameSurfaceWindingOnlyGLBSha256,a.sameGeometryWindingDerivativeSha256);
  assert.equal(c.proceduralReferenceGTGLBSha256,b.proceduralGroundTruthSha256);
  assert.equal(c.historicalLicensedChairGLBSha256,b.historicalChairDerivativeSha256);
  assert.equal(c.allModelsPreviousSourcesOnly,true);
  assert.equal(c.newAiInference,false);
  assert.equal(c.printQualified,false);
  assert.equal(c.approvedForPrinter,false);
  assert.equal(c.fabricationAction,'NONE');
});

test('G3.16 exhaustive exact one-index incidence matches independent G3.14 source counts',async()=>{
  const r=await read('orb-01-g316-exact-indexed-vertex-only.json');
  const a=await read('orb-01-g314-full-aabb-census.json');
  const cases=[
    [r.realTripoSR,a.realTripoSR,40352,190860],
    [r.sameSurfaceWindingOnlyCopy,a.unchangedWindingOnlyCopy,40352,190860],
    [r.proceduralReferenceGT,a.projectOriginalGT,1280,5730],
    [r.historicalLicensedChair,a.historicalChair,19972,92629],
  ];
  for(const [x,old,faces,pairs] of cases) {
    assert.equal(x.triangleCount,faces);
    assert.equal(x.allOriginalIndexSingleVertexFacePairs,pairs);
    assert.equal(old.pairsSharingExactlyOneIndexedVertex,pairs);
    assert.equal(x.exactRationalPairsClassified,pairs);
    assert.equal(x.completeExactIndexedSingleVertexCensus,true);
    assert.ok(x.sharedOriginalIndexIncidencePairVisits>=pairs);
    assert.equal(x.exactOnlySharedVertexContactPairs+
       x.exactNoncoplanarExtraLineContactPairs+
       x.exactCoplanarExtraLineContactPairs+
       x.exactCoplanarPositiveAreaOverlapPairs,pairs);
    assert.equal(x.anyExactExtraBeyondVertexContactPairs,
       x.exactNoncoplanarExtraLineContactPairs+
       x.exactCoplanarExtraLineContactPairs+
       x.exactCoplanarPositiveAreaOverlapPairs);
    assert.equal(x.printQualified,false);
  }
  assert.deepEqual(r.realTripoSR,r.sameSurfaceWindingOnlyCopy);
  assert.equal(r.realAndWindingDerivativeExactContactCountsIdentical,true);
  assert.equal(r.independentIndexTopologyEnumeration,true);
  assert.equal(r.fullyExactCensusOfEveryOneIndexedVertexOnlyFacePair,true);
  assert.equal(r.G315FullSharedEdgeExactClassificationSeparate,true);
  assert.equal(r.G314NoIndexNumericalSatNotGlobalExactProof,true);
  assert.equal(r.notAnExactAllFacePairsGlobalIntersectionCertificate,true);
  assert.equal(r.globalSelfIntersectionFreeCertified,false);
  assert.equal(r.mmPhysicalScale,'UNKNOWN_UNCALIBRATED');
  assert.equal(r.wallThickness,'NOT_TESTED');
  assert.equal(r.printerValidation,'NOT_PERFORMED');
  assert.equal(r.realTripoSR.anyExactExtraBeyondVertexContactPairs,0);
});

test('G3.16 public SHA aggregate evidence contains no private job, photo, GLB or face indices',async()=>{
  const raw=await fs.readFile(path.join(E,
    'orb-01-g316-exact-indexed-vertex-only.json'),'utf8');
  assert.doesNotMatch(raw,/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  assert.doesNotMatch(raw,/D:[/\\]|runtime[/\\]|"jobId"|"privateExample"|"prompt"|"customerEmail"|"facePairs"/i);
  const c=JSON.parse(raw);
  assert.equal(c.privateJobUUIDAndExactFacePairIndicesNotPublished,true);
  assert.equal(c.globalSelfIntersectionFreeCertified,false);
  await assert.rejects(fs.access(path.join(E,
    'orb-01-g316-private-vertex-pairs.glb')));
});
