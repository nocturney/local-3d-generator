import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ev=path.join(ROOT,'docs','evidence','g3');
const get=async p=>JSON.parse(await fs.readFile(p,'utf8'));

test('G3.9 real orb adjacent-angle evidence is SHA-pinned, original-vs-copy invariant and private',async()=>{
  const report=await get(path.join(ev,'orb-01-g39-adjacent-angles.json'));
  const older=await get(path.join(ev,'orb-01-g38-cpu-risk-screen.json'));
  assert.equal(report.schema,'local3d.g3.9.real-orb-adjacent-face-angle-evidence.v1');
  assert.equal(report.fixtureId,'01-orb-alpha');
  assert.equal(report.rights,'PROJECT_ORIGINAL_PROCEDURAL');
  assert.equal(report.modelOutputSource,'SINGLE_PREVIOUSLY_APPROVED_REAL_TRIPOSR_INFERENCE');
  assert.equal(report.fixtureSourceImageSha256,older.sourceImageSha256);
  assert.equal(report.originalSourceGtSha256,older.originalGroundTruthSha256);
  assert.equal(report.previouslyGeneratedRealModelSha256,older.realOriginalOutputSha256);
  assert.equal(report.windingOnlyDerivativeSha256,older.previousOrientationOnlyDerivativeSha256);
  assert.equal(report.newAiInferenceExecuted,false);
  assert.equal(report.allPriorOrientationChangesPreserveAnglesExactly,true);
  assert.deepEqual(report.originalRealTripoSR.angleDegrees,
                   report.copyOnlyCorrectedTripoSR.angleDegrees);
  assert.deepEqual(report.originalRealTripoSR.countsAboveAngleThresholds,
                   report.copyOnlyCorrectedTripoSR.countsAboveAngleThresholds);
  assert.equal(report.privateAssetsNeverPublished,true);
  assert.equal(report.printQualified,false);
  assert.equal(report.approvedForPrinter,false);
  assert.equal(report.fabricationAction,'NONE');
  assert.equal(report.notProofOfSelfIntersectionFree,true);
  assert.equal(report.subjectToVertexOnlyFoldoverNotCovered,true);
  assert.equal(report.noPhysicalUnitsOrStrengthMeasurements,true);
  const raw=JSON.stringify(report);
  assert.doesNotMatch(raw,/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  assert.doesNotMatch(raw,/D:\\\\Velvet|runtime[/\\]data-g2-manual|ONE_TIME_APPROVAL/i);
  assert.doesNotMatch(raw,/"(?:jobId|prompt|clientName|customerEmail)"\s*:/i);
});

test('G3.9 all indexed shared-edge angles are accounted and no foldover guarantee invented',async()=>{
  const report=await get(path.join(ev,'orb-01-g39-adjacent-angles.json'));
  const orig=report.originalRealTripoSR;
  const copy=report.copyOnlyCorrectedTripoSR;
  const gt=report.proceduralSourceGroundTruth;
  assert.equal(orig.triangleFaces,40352);
  assert.equal(copy.triangleFaces,40352);
  assert.equal(orig.indexedEdgeAdjacentPairs,60528);
  assert.equal(copy.indexedEdgeAdjacentPairs,60528);
  assert.equal(orig.indexedEdgeAdjacentPairs,orig.triangleFaces*3/2);
  assert.equal(orig.angleDegrees.p95,33.01876);
  assert.equal(orig.countsAboveAngleThresholds.over45Deg,312);
  assert.equal(orig.countsAboveAngleThresholds.over90Deg,0);
  assert.equal(gt.triangleFaces,1280);
  assert.equal(gt.indexedEdgeAdjacentPairs,1920);
  assert.equal(gt.angleDegrees.p95,5.731991);
  assert.equal(gt.countsAboveAngleThresholds.over45Deg,0);
  assert.equal(orig.allIndexedTwoFaceEdgesExamined,true);
  assert.equal(gt.allIndexedTwoFaceEdgesExamined,true);
  assert.equal(report.differentFaceDensityMakesAnglePercentilesNonComparableAsAbsoluteQuality,true);
  assert.equal(report.mayHaveIntentionalHighAngleCreases,true);
  assert.equal(report.notAManufacturingNormalOrThicknessGuarantee,true);
  assert.match(report.meaning,/LOCAL_EDGE_ADJACENT/);
  assert.ok(report.remainingBlindspots.some(x=>x.includes('Vertex-only')));
  assert.ok(report.remainingBlindspots.some(x=>x.includes('sharp edges')));
});
