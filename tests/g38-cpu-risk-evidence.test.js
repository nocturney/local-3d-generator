import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const E=path.join(ROOT,'docs','evidence','g3');
const EXPECTED={
  input:'9cb2f41de1b0239570068b055dc06bf941491559e11942b5bbc5757adb3d886a',
  original:'f37a812bc4414ddee34bcb19d2e7535f25d219a3731c14f2dcc89c2c7ba030e2',
  corrected:'ab2e5aeb55598624209eeca3e700abef93a69a52886c63ecad6a840e62d8d68f',
  ref:'c8834b2668210e58a73ff8b2ab3bcf2d0bc5d2df9a09b3dd0313b425b3664749'
};
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));

test('G3.8 published CPU model risk scan is real-G3 SHA-linked and NOT a print-clearance',async()=>{
  const risk=await read(path.join(E,'orb-01-g38-cpu-risk-screen.json'));
  const prev=await read(path.join(E,'orb-01-cpu-quality-milestone.json'));
  const catalog=await read(path.join(ROOT,'benchmarks','g3','fixtures','manifest.json'));
  const orb=catalog.fixtures.find(x=>x.id==='01-orb-alpha');
  assert.equal(risk.schema,'local3d.g3.8.real-orb-cpu-risk-diagnostic.v1');
  assert.equal(orb.imageSha256,EXPECTED.input);
  assert.equal(orb.groundTruthSha256,EXPECTED.ref);
  assert.equal(risk.sourceImageSha256,EXPECTED.input);
  assert.equal(risk.realOriginalOutputSha256,EXPECTED.original);
  assert.equal(risk.previousOrientationOnlyDerivativeSha256,EXPECTED.corrected);
  assert.equal(risk.originalGroundTruthSha256,EXPECTED.ref);
  assert.equal(prev.modelOriginalSha256,risk.realOriginalOutputSha256);
  assert.equal(prev.derivativeSha256,risk.previousOrientationOnlyDerivativeSha256);
  assert.equal(risk.modelEvidenceLane,'PREVIOUSLY_APPROVED_REAL_TRIPOSR_INFERENCE');
  assert.equal(risk.newNeuralInferenceThisMilestone,false);
  assert.equal(risk.geometricSurfaceSameAfterWindingCorrection,true);
  assert.equal(risk.status,'DIAGNOSTIC_ONLY_NO_MANUFACTURING_CLEARANCE');
  assert.equal(risk.printQualified,false);
  assert.equal(risk.approvedForPrinter,false);
  assert.equal(risk.noPrinterAction,true);
  assert.equal(risk.noPrivateJobIdsPathsPromptsOrOriginalGlbsInOutput,true);
  assert.equal(risk.manufacturingSelfIntersectionCertification,'NOT_AVAILABLE');
  assert.equal(risk.adjacentFaceFoldover,'NOT_TESTED');
  assert.equal(risk.wallThickness,'NOT_TESTED');
  assert.equal(risk.realWorldUnits,'UNKNOWN_UNCALIBRATED');
  assert.equal(risk.fabricationAction,'NONE');
});

test('G3.8 triangle SAT outcomes are bounded, complete on eligible pairs, never a zero-intersection guarantee',async()=>{
  const report=await read(path.join(E,'orb-01-g38-cpu-risk-screen.json'));
  const {original,corrected,originalProceduralGroundTruth:gt}=report.contacts;
  for(const record of [original,corrected,gt]){
    assert.equal(record.status,'NO_NONADJACENT_CONTACTS_DETECTED_WITHIN_NUMERICAL_TOLERANCE');
    assert.equal(record.screenCompleted,true);
    assert.equal(record.potentialContactsLowerBound,0);
    assert.equal(record.noIntersectionCertification,true);
    assert.ok(Number.isInteger(record.broadphasePairs)&&record.broadphasePairs>=0);
    assert.ok(Number.isInteger(record.aabbPairs)&&record.aabbPairs>=0);
    assert.ok(Number.isInteger(record.conservativeSatPairChecks)&&record.conservativeSatPairChecks>=0);
    assert.ok(record.boundedCaps.maxTriangles>=record.faces);
    assert.ok(record.boundedCaps.maxSeconds>0);
    assert.ok(record.boundedCaps.maxNarrowPairs>=record.conservativeSatPairChecks);
  }
  assert.equal(original.faces,40352);
  assert.equal(corrected.faces,40352);
  assert.equal(original.conservativeSatPairChecks,43025);
  assert.equal(corrected.conservativeSatPairChecks,43025);
  assert.equal(original.vertexAdjacentPairsExcluded,corrected.vertexAdjacentPairsExcluded);
  assert.ok(original.vertexAdjacentPairsExcluded>0);
  assert.match(report.contacts.criticalBlindSpot,/SHARING_ANY_VERTEX_INDEX/);
  assert.match(report.contacts.collisionPredicate,/FLOATING_POINT/);
  assert.equal(report.contacts.zeroContactsDoesNotProveSelfIntersectionFree,true);
  assert.ok(gt.faces>0);
});

test('G3.8 deterministic 4096-point radial fit shows orb departure without inventing mm or smoother mesh',async()=>{
  const report=await read(path.join(E,'orb-01-g38-cpu-risk-screen.json'));
  const {proceduralGroundTruth:gt,previouslyGeneratedTripoSRModel:pred}=report.radial;
  assert.equal(gt.sampleCount,4096);
  assert.equal(pred.sampleCount,4096);
  assert.equal(gt.seed,20261010);
  assert.equal(pred.seed,20261010);
  assert.equal(gt.sampleDistribution,'AREA_WEIGHTED_TRIANGLES_DETERMINISTIC');
  assert.equal(pred.sampleDistribution,'AREA_WEIGHTED_TRIANGLES_DETERMINISTIC');
  assert.equal(gt.absoluteRadialResidualMeanRelativeToRadius,0.00062476);
  assert.equal(pred.absoluteRadialResidualMeanRelativeToRadius,0.04973669);
  assert.ok(pred.absoluteRadialResidualMeanRelativeToRadius>gt.absoluteRadialResidualMeanRelativeToRadius);
  assert.ok(report.radial.modelToGroundTruthMeanRadialResidualRatio>70);
  assert.ok(report.radial.modelToGroundTruthMeanRadialResidualRatio<90);
  assert.equal(report.radial.derivativeExactlySameSurfaceSoNotScoredAsNewImprovement,true);
  assert.equal(report.radial.lowerRadialErrorMeansCloserToBestFitSphereNotImageAccuracy,true);
  assert.match(JSON.stringify(report.radial.methodCaveats),/physical scale/);
  const raw=JSON.stringify(report);
  assert.doesNotMatch(raw,/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  assert.doesNotMatch(raw,/D:\\\\Velvet|runtime[/\\]data-g2-manual|ONE_TIME_APPROVAL/i);
  assert.doesNotMatch(raw,/\"(?:clientName|prompt|jobId|absolutePath|customerEmail)\"\s*:/i);
  await assert.rejects(fs.access(path.join(E,'orb-01-new-triposr-result.glb')));
});
