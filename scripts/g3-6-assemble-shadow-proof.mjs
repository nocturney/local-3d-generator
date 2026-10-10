/**
 * Offline G3.6: assemble sanitized Pillow shadow CPU proof.
 * Reads previously collected gitignored QA reports, never invokes Python/GPU
 * or makes a network request. Commits NO wheel, overlay or runtime files.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SHADOW=path.join(ROOT,'runtime','qa','g3','pillow-shadow');
const EXPECTED_SHA='8e95e1385e4998ae9694eeaa4730ba5457ff61185b3a55e2e7bea0880aef452a';
const sha=b=>createHash('sha256').update(b).digest('hex');
const read=async name=>JSON.parse(await fs.readFile(path.join(SHADOW,name),'utf8'));
const [comparison,cpu,importProbe,unit,catalogBytes,freezeBytes] = await Promise.all([
  read('osv-candidate-comparison.json'),
  read('shadow-cpu-report.json'),
  read('shadow-triposr-import.json'),
  read('shadow-python-regression.json'),
  fs.readFile(path.join(ROOT,'benchmarks','g3','fixtures','manifest.json')),
  fs.readFile(path.join(ROOT,'engines','triposr','requirements-resolved-win-py311.txt'))
]);
const catalog=JSON.parse(catalogBytes.toString('utf8'));
const fixtureIDs=catalog.fixtures.map(x=>x.id).sort();
const proofIDs=cpu.fixtures.map(x=>x.fixtureId).sort();
if(comparison.schema!=='local3d.g3-6.pillow-candidate-public-screen.v1'||
  cpu.schema!=='local3d.g3-6.pillow-shadow-cpu-compatibility.v1'||
  importProbe.schema!=='local3d.g3-6.pillow-triposr-import-only.v1'||
  unit.schema!=='local3d.g3-6.shadow-python-regression.v1'||
  comparison.publicVersionComparisons.length!==2||
  comparison.currentPinnedVersion!=='10.1.0'||
  comparison.proposedShadowVersion!=='12.3.0'||
  comparison.publicVersionComparisons[0].version!=='10.1.0'||
  comparison.publicVersionComparisons[1].version!=='12.3.0'||
  comparison.publicVersionComparisons[0].osvAdvisoryMatches<1||
  comparison.publicVersionComparisons[1].osvAdvisoryMatches!==0||
  comparison.shadowWheelOfficialSha256!==EXPECTED_SHA||
  cpu.wheelSha256!==EXPECTED_SHA||cpu.pypiWheelSha256Matches!==true||
  cpu.sourceCatalogSha256!==sha(catalogBytes)||
  JSON.stringify(fixtureIDs)!==JSON.stringify(proofIDs)||
  !cpu.fixtures.every(x=>x.sourceSha256Verified===true&&x.mode==='RGB')||
  !Object.values(cpu.extraTests).every(v=>v==='PASS')||
  importProbe.shadowPillowVersion!=='12.3.0'||
  !importProbe.importedPinnedTripoSRSource||
  !importProbe.importedTripoSRTokenizer||
  !importProbe.importedTripoSRSystem||
  importProbe.modelWeightsLoaded!==false||
  importProbe.modelInferenceExecuted!==false||
  importProbe.torchCudaVisible!==false||
  unit.g2CpuUnittestPasses!==5||unit.g3CpuUnittestPasses!==18||
  unit.productionPillowBefore!=='10.1.0'||
  unit.productionPillowAfter!=='10.1.0'||
  unit.productionEnvironmentModified!==false||
  !/^Pillow==10\.1\.0$/mi.test(freezeBytes.toString('utf8'))) {
  throw new Error('Shadow CPU/provenance evidence not independently reconcilable');
}
const output={
  schema:'local3d.g3-6.shadow-pillow-release-evidence.v1',
  observedDate:'2026-10-10',
  lane:'PUBLIC_WHEEL_CHECKSUM_AND_ISOLATED_CPU_COMPATIBILITY_ONLY',
  currentProductionPillow:'10.1.0',
  candidateShadowPillow:'12.3.0',
  productionDependencyManifestSha256:sha(freezeBytes),
  sourceCatalogSha256:sha(catalogBytes),
  publicPyPiWheel:{
    name:comparison.shadowWheelFilename,
    sha256:EXPECTED_SHA,officialPyPiAndDownloadedMatch:true,
    interpreterCompatibility:comparison.interpreterCompatibility
  },
  osvVersionAdvisoryMatches:comparison.publicVersionComparisons,
  benchmarkInputCases:cpu.fixtures.length,
  benchmarkCaseIds:fixtureIDs,
  sourceSha256VerifiedForEachInput:true,
  preprocessingRegressionChecks:cpu.extraTests,
  tripoSRSourceImportOnly:{
    importedPinnedSource:true,importedTokenizer:true,importedSystem:true,
    pinnedTransformersVersion:importProbe.pinnedTransformersVersion,
    pinnedTorchVersion:importProbe.pinnedTorchVersion,
    modelWeightsLoaded:false,modelInferenceExecuted:false,cudaVisible:false
  },
  cpuTestCounts:{g2:unit.g2CpuUnittestPasses,g3:unit.g3CpuUnittestPasses,total:unit.g2CpuUnittestPasses+unit.g3CpuUnittestPasses},
  productionVersionBefore:unit.productionPillowBefore,
  productionVersionAfter:unit.productionPillowAfter,
  productionVenvModified:false,
  customerSourceMediaUsed:false,
  modelInferenceExecuted:false,
  printerCommandsSent:false,
  outputPrintQualified:false,
  securityQualification:'NOT_GRANTED',
  nextGate:'Codepath triage and fully isolated model compatibility tests before an explicitly authorized GPU inference acceptance and/or production package change.',
  note:'OSV zero-match on a candidate version is not proof of safe parsing, no vulnerabilities, or model compatibility with real CUDA inference.'
};
const dest=path.join(ROOT,'docs','evidence','g3','g3-6-shadow-pillow-cpu-proof.json');
await fs.writeFile(dest,JSON.stringify(output,null,2)+'\n',{flag:'wx'});
console.log('G36_CURATED_SHADOW_PROOF_PASS '+JSON.stringify({
  oldVersionMatches:output.osvVersionAdvisoryMatches[0].osvAdvisoryMatches,
  candidateVersionMatches:output.osvVersionAdvisoryMatches[1].osvAdvisoryMatches,
  sourceImages:output.benchmarkInputCases,
  cpuTests:output.cpuTestCounts.total,
  productionChanged:false,realGpuRuns:0,
  sha256:sha(await fs.readFile(dest))
}));
