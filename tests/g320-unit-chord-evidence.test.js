import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const E=path.join(ROOT,'docs','evidence','g3');
const load=async name=>JSON.parse(await fs.readFile(path.join(E,name),'utf8'));

test('G3.20 source units unknown despite misleading GLB exporter meters extras',async()=>{
  const r=await load('orb-01-g320-unit-chord-cpu.json');
  const prior=await load('orb-01-g319-second-exact-oracle-proof.json');
  assert.equal(r.schema,'local3d.g3.20.historical-scale-provenance-normal-ray-chord-four-models.v1');
  assert.equal(r.fixtureId,'01-orb-alpha');
  assert.equal(r.projectOriginalImageRights,'PROJECT_ORIGINAL_PROCEDURAL');
  assert.equal(r.originalImageSha256,prior.historicalOriginalImageSha256);
  assert.equal(r.realHistoricTripoSROrbModelSha256,prior.historicRealOrbTripoSRModelSha256);
  assert.equal(r.sameSurfaceWindingOnlyDerivativeSha256,prior.unchangedWindingOnlyCopySha256);
  assert.equal(r.originalProceduralSphereGTSha256,prior.originalProceduralGroundTruthSha256);
  assert.equal(r.historicLicensedMITChairSha256,prior.historicLicensedMITChairSha256);
  assert.equal(r.meshMetadataUnitsNotAcceptedAsVerifiedPhysicalScale,true);
  assert.equal(r.noMillimeterConversionOrWallThicknessClaim,true);
  assert.equal(r.modelImagesProvideNoIndependentKnownMmDimensions,true);
  assert.equal(r.realWorldReferenceCalibrationAbsent,true);
  assert.equal(r.physicalMillimeterScale,'UNKNOWN_UNCALIBRATED');
  assert.equal(r.mmPerGLBUnit,null);
  assert.equal(r.minimumPhysicalWallThicknessMm,null);
  assert.equal(r.printQualified,false);
  assert.equal(r.approvedForPrinter,false);
  assert.equal(r.fabricationAction,'NONE');
  assert.equal(r.newAiInference,false);
});

test('G3.20 inverted original forbids ray; 3 positive-volume prior GLBs only produce chord samples',async()=>{
  const r=await load('orb-01-g320-unit-chord-cpu.json');
  const original=r.realTripoSR;
  const derivative=r.sameGeometryPositiveWindingDerivative;
  const sphere=r.originalProceduralGT;
  const chair=r.historicLicensedChair;
  assert.equal(original.faces,40352);
  assert.equal(derivative.faces,40352);
  assert.equal(sphere.faces,1280);
  assert.equal(chair.faces,19972);
  assert.equal(original.sourcePositiveSignedVolumeForInwardRays,false);
  assert.equal(original.status,'INDETERMINATE_UNVERIFIED_NORMAL_ORIENTATION');
  assert.equal(original.raySamplesExamined,0);
  assert.equal(original.firstHitChordsArbitraryUnits,null);
  assert.equal(r.noNormalRayProbeOnNonpositiveSignedVolumeOriginal,true);
  assert.deepEqual(original.meshExtentsArbitraryUnits,derivative.meshExtentsArbitraryUnits);
  assert.deepEqual(original.triangulationEdgeLengthsArbitraryUnits,derivative.triangulationEdgeLengthsArbitraryUnits);
  for(const row of [derivative,sphere,chair]){
    assert.equal(row.sourcePositiveSignedVolumeForInwardRays,true);
    assert.equal(row.rayStatus,'SAMPLED_NORMAL_RAY_CHORD_DIAGNOSTIC_COMPLETE');
    assert.equal(row.raySamplesExamined,128);
    assert.ok(row.confidentFirstHitSamples>0);
    assert.ok(row.firstHitChordsArbitraryUnits?.min>0);
    assert.equal(row.realPhysicalMillimetersVerified,false);
    assert.equal(row.minimumLocalWallThicknessMeasured,false);
    assert.equal(row.physicalWallThicknessMm,null);
    assert.equal(row.rayChordsMayTraverseEntireSolidNotWallThickness,true);
    assert.equal(row.printQualified,false);
    assert.equal(row.approvedForPrinter,false);
  }
  for(const row of [derivative,chair]){
    assert.ok(row.meshUnitClaimsFromUnverifiedExporterMetadata.some(
      x=>x.field==='units'&&x.claim==='meters'));
    assert.equal(row.sourceVerifiedMillimetersPerGLBUnit,null);
  }
  assert.equal(sphere.meshUnitClaimsFromUnverifiedExporterMetadata.length,0);
  assert.ok(sphere.firstHitChordsArbitraryUnits.median>1.5);
  assert.equal(r.normalRayChordsAreNotLocalWallThickness,true);
  assert.equal(r.triangulationEdgesAreNotPhysicalFeatures,true);
});

test('G3.20 public SHA provenance omits private IDs/GLB binaries/face samples',async()=>{
  const raw=await fs.readFile(path.join(E,'orb-01-g320-unit-chord-cpu.json'),'utf8');
  assert.doesNotMatch(raw,/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  assert.doesNotMatch(raw,/D:[/\\]|runtime[/\\]|"jobId"|"privateExample"|"facePairIds"|"customerEmail"|"prompt"/i);
  const proof=JSON.parse(raw);
  assert.equal(proof.privateRawModelJobIdAndFaceSamplesExcluded,true);
  assert.equal(proof.globalSelfIntersectionFreeCertified,false);
  assert.equal(proof.minimumWallThicknessCertified,false);
  await assert.rejects(fs.access(path.join(E,'orb-01-g320-private-model.glb')));
});
