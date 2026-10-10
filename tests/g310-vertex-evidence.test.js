import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const E=path.join(ROOT,'docs','evidence','g3');
const get=async p=>JSON.parse(await fs.readFile(p,'utf8'));

test('G3.10 genuine orb vertex-only ray summary is SHA-pinned and non-printable',async()=>{
  const m=await get(path.join(E,'orb-01-g310-shared-vertex-ray-screen.json'));
  const prev=await get(path.join(E,'orb-01-g39-adjacent-angles.json'));
  const gt=await get(path.join(ROOT,'benchmarks','g3','fixtures','manifest.json'));
  const source=gt.fixtures.find(x=>x.id==='01-orb-alpha');
  assert.equal(m.schema,'local3d.g3.10.real-orb-shared-one-vertex-ray-screen.v1');
  assert.equal(m.rights,'PROJECT_ORIGINAL_PROCEDURAL');
  assert.equal(m.fixtureId,'01-orb-alpha');
  assert.equal(m.fixtureImageSha256,source.imageSha256);
  assert.equal(m.originalProceduralSourceGtSha256,source.groundTruthSha256);
  assert.equal(m.originalRealTripoSRModelSha256,prev.previouslyGeneratedRealModelSha256);
  assert.equal(m.unchangedWindingOnlyCopySha256,prev.windingOnlyDerivativeSha256);
  assert.equal(m.noNewModelInferenceDuringThisMilestone,true);
  assert.equal(m.naturallySharedVertexIsNotCountedAsADefect,true);
  assert.equal(m.intersectionOrPrintCertificationGranted,false);
  assert.equal(m.selfIntersectionFreeCertified,false);
  assert.equal(m.printQualified,false);
  assert.equal(m.approvedForPrinter,false);
  assert.equal(m.fabricationAction,'NONE');
  assert.equal(m.absoluteMillimeterScale,'UNKNOWN_UNCALIBRATED');
  assert.equal(m.wallThickness,'NOT_TESTED');
  assert.equal(m.localCustomerJobIdOrModelBinaryNotPublished,true);
  assert.equal(m.originalAndDerivativeRaysRemainIdentical,true);
  assert.equal(m.nearCoplanarRemainsExplicitUnresolvedCategory,true);
  assert.equal(m.edgeAdjacentTrueFoldoverNotCovered,true);
  assert.equal(m.duplicateCoordinatesAcrossDifferentIndicesNotCertified,true);
  const raw=JSON.stringify(m);
  assert.doesNotMatch(raw,/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  assert.doesNotMatch(raw,/D:\\\\Velvet|runtime[/\\]data-g2-manual|ONE_TIME_APPROVAL/i);
  assert.doesNotMatch(raw,/"(?:jobId|prompt|clientName|customerEmail|privatePotentialExampleFaceAndVertexIndices)"\s*:/i);
  await assert.rejects(fs.access(path.join(E,'orb-01-g310-ai-output.glb')));
});

test('G3.10 enumerates every unique one-vertex pair and never treats ordinary contact as proof of defect',async()=>{
  const m=await get(path.join(E,'orb-01-g310-shared-vertex-ray-screen.json'));
  const a=m.originalRealTripoSR;
  const b=m.copyOnlyWindingDerivative;
  const ref=m.proceduralSourceGroundTruth;
  const chair=m.historicalRealChairDerivative;
  assert.equal(a.triangles,40352);
  assert.equal(a.vertices,20178);
  assert.equal(a.vertexOnlyPairsEnumerated,190860);
  assert.equal(a.vertexOnlyPairsExamined,190860);
  assert.equal(a.skippedFullEdgePairsDoubleIncidence,121056);
  assert.equal(a.candidateBeyondVertexCommonRayPairs,0);
  assert.equal(a.nearCoplanarUnresolvedPairs,0);
  assert.equal(a.edgeAlignedUnresolvedPairs,0);
  assert.equal(a.shortRayUnresolvedPairs,0);
  assert.equal(a.numericallySeparatedRaySectors,190860);
  assert.equal(a.completedEligiblePairs,true);
  assert.equal(a.actualSelfIntersectionFreeCertified,false);
  assert.deepEqual(a,b);
  assert.equal(ref.vertexOnlyPairsEnumerated,5730);
  assert.equal(ref.candidateBeyondVertexCommonRayPairs,0);
  assert.equal(chair.vertexOnlyPairsEnumerated,92629);
  assert.equal(chair.candidateBeyondVertexCommonRayPairs,0);
  for(const record of [a,b,ref,chair]){
    assert.ok(record.resourceCaps.maxVertexOnlyPairs>=record.vertexOnlyPairsExamined);
    assert.ok(record.resourceCaps.maxValence>=record.highestObservedVertexValence);
    assert.equal(record.completedEligiblePairs,true);
    assert.equal(record.actualSelfIntersectionFreeCertified,false);
    assert.equal(record.numericallySeparatedRaySectors+
       record.candidateBeyondVertexCommonRayPairs+
       record.nearCoplanarUnresolvedPairs+
       record.edgeAlignedUnresolvedPairs+
       record.shortRayUnresolvedPairs,record.vertexOnlyPairsExamined);
  }
  assert.equal(m.allUniqueVertexOnlyPairsInValidatedMeshEnumerated,true);
  assert.match(m.method,/NONCOPLANAR/);
  assert.equal(m.toleranceSensitiveNotAnExactCollisionPredicate,true);
});
