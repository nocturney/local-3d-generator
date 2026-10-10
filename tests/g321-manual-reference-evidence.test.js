import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const E=path.join(ROOT,'docs','evidence','g3');
const read=async name=>JSON.parse(await fs.readFile(path.join(E,name),'utf8'));

test('G3.21 evidence contains four blocked source SHAs linked to unchanged G3.20 public bytes',async()=>{
  const next=await read('orb-01-g321-physical-calibration-missing.json');
  const oldName='orb-01-g320-unit-chord-cpu.json';
  const old=await read(oldName);
  const raw=await fs.readFile(path.join(E,oldName));
  const sha=crypto.createHash('sha256').update(raw).digest('hex');
  assert.equal(next.schema,'local3d.g3.21.four-existing-models-missing-mm-reference.v1');
  assert.equal(next.priorG320PublicEvidenceSha256,sha);
  assert.equal(next.sourceScope,'PRIOR_PUBLIC_SHA_PROOF_ONLY_NO_PRIVATE_SOURCE_REREAD');
  const pairs=[
    [next.modelResults.realTripoSR,old.realHistoricTripoSROrbModelSha256],
    [next.modelResults.positiveWindingDerivative,old.sameSurfaceWindingOnlyDerivativeSha256],
    [next.modelResults.proceduralGT,old.originalProceduralSphereGTSha256],
    [next.modelResults.historicalChair,old.historicLicensedMITChairSha256]
  ];
  assert.equal(pairs.length,4);
  for(const [r,hash] of pairs){
    assert.equal(r.modelSha256,hash);
    assert.equal(r.status,'BLOCKED_MISSING_EXTERNAL_REFERENCE');
    assert.equal(r.candidateOperatorReferenceStructurallyValid,false);
    assert.equal(r.measurementSourceIndependentlyVerified,false);
    assert.equal(r.sourceLandmarkPhysicalCorrespondenceIndependentlyVerified,false);
    assert.equal(r.modelToPhysicalScaleIndependentlyVerified,false);
    assert.equal(r.millimetersPerGLBUnit,null);
    assert.equal(r.physicalDimensionMm,null);
    assert.equal(r.physicalMinimumWallThicknessMm,null);
    assert.equal(r.printQualified,false);
    assert.equal(r.approvedForPrinter,false);
    assert.equal(r.fabricationAction,'NONE');
  }
});

test('G3.21 cannot promote fake operator evidence to approved print or physical mm',async()=>{
  const r=await read('orb-01-g321-physical-calibration-missing.json');
  assert.equal(r.reviewedSubmissions,0);
  assert.equal(r.allRegisteredModelsMissingVerifiedPhysicalScale,true);
  assert.equal(r.untrustedGLBMetadataCannotAutoCreateSubmission,true);
  assert.equal(r.physicalMmScaleCertified,false);
  assert.equal(r.minimumWallThicknessCertified,false);
  assert.equal(r.printQualified,false);
  assert.equal(r.approvedForPrinter,false);
  assert.equal(r.fabricationAction,'NONE');
  assert.equal(r.newAiInference,false);
  assert.equal(r.containsUserNamesOrMeasurementMedia,false);
});

test('G3.21 public proof does not contain private UUID, source media, calibration operator PII',async()=>{
  const raw=await fs.readFile(path.join(E,'orb-01-g321-physical-calibration-missing.json'),'utf8');
  assert.doesNotMatch(raw,/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  assert.doesNotMatch(raw,/D:[/\\]|runtime[/\\]|"jobId"|"operatorName"|"customerEmail"|"measuredLengthMm"|"approvalSignature"/i);
  assert.doesNotMatch(raw,/approvedForPrinter": true|printQualified": true/i);
  await assert.rejects(fs.access(path.join(E,'orb-01-g321-private-measurement.jpg')));
});
