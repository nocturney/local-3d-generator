/**
 * G3.7 sanitized, immutable evidence assembly from an already completed
 * single licensed project-original fixture. NO model execution / printing.
 * Private source/model/derivative files stay under gitignored runtime.
 *
 * Usage:
 * node scripts/g3-7-assemble-orb-evidence.mjs --job-id <UUID>
 * All file roots and source hashes are fixed; there is no arbitrary path.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const CASE='01-orb-alpha';
const SOURCE_SHA='9cb2f41de1b0239570068b055dc06bf941491559e11942b5bbc5757adb3d886a';
const ORIGINAL_SHA='f37a812bc4414ddee34bcb19d2e7535f25d219a3731c14f2dcc89c2c7ba030e2';
const DERIVATIVE_SHA='ab2e5aeb55598624209eeca3e700abef93a69a52886c63ecad6a840e62d8d68f';
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DIR=path.join(ROOT,'runtime','qa','g3','orb-01-positive-winding');
const RESULTS=path.join(ROOT,'docs','evidence','g3');
const JOBROOT=path.join(ROOT,'runtime','data-g2-manual','jobs');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');

async function regularBytes(file,max=64*1024*1024){
  const st=await fs.lstat(file);
  if(st.isSymbolicLink()||!st.isFile()||st.size<1||st.size>max)
    throw new Error('Invalid evidence file metadata');
  return fs.readFile(file);
}
async function json(file){
  return JSON.parse((await regularBytes(file,128*1024)).toString('utf8'));
}
function requireThat(condition,label){
  if(!condition)throw new Error('G3.7 invalid provenance: '+label);
}
function verify(bytes,asset,label){
  requireThat(asset&&asset.sha256===sha(bytes)&&asset.bytes===bytes.length,
    'HASH_OR_SIZE_'+label);
}
const args=process.argv.slice(2);
requireThat(args.length===2&&args[0]==='--job-id'&&UUID.test(args[1]),
  'USAGE node scripts/g3-7-assemble-orb-evidence.mjs --job-id <UUID>');
const jobDir=path.join(JOBROOT,args[1]);
requireThat((await fs.realpath(jobDir)).toLowerCase()===
  path.resolve(jobDir).toLowerCase(),'DIRECT_PRIVATE_JOB_FOLDER_ONLY');
const job=await json(path.join(jobDir,'job.json'));
requireThat(job.id===args[1]&&job.providerId==='triposr-local'&&
  job.simulation===false&&job.status==='completed'&&
  Array.isArray(job.assets),'REAL_COMPLETED_JOB');
const fixture=await json(path.join(ROOT,'benchmarks','g3','fixtures','manifest.json'));
const entry=fixture.fixtures?.find(x=>x.id===CASE);
requireThat(fixture.fixtureCount===9&&entry?.imageSha256===SOURCE_SHA&&
  entry.sourceRights==='PROJECT_ORIGINAL_PROCEDURAL','LICENSED_SOURCE');
const input=await regularBytes(path.join(jobDir,'input.png'),8*1024*1024);
const model=await regularBytes(path.join(jobDir,'output.glb'));
const qaRaw=await regularBytes(path.join(jobDir,'qa-report.json'),256*1024);
const geoRaw=await regularBytes(path.join(jobDir,'geometry-qa.json'),256*1024);
const scoreRaw=await regularBytes(path.join(jobDir,'benchmark-shape.json'),256*1024);
const asset=id=>job.assets.find(x=>x.id===id);
verify(input,asset('source-image'),'INPUT');
verify(model,asset('preview-glb'),'MODEL');
verify(qaRaw,asset('qa-report'),'QA');
verify(geoRaw,asset('geometry-qa'),'GEOMETRY');
verify(scoreRaw,asset('benchmark-shape'),'SCORE');
requireThat(sha(input)===SOURCE_SHA&&sha(model)===ORIGINAL_SHA,'ORIGINAL_SHA');
const qa=JSON.parse(qaRaw),sourceGeo=JSON.parse(geoRaw),score=JSON.parse(scoreRaw);
requireThat(qa.realInference===true&&qa.simulation===false&&
  qa.printQualified===false&&qa.approvedForPrinter===false&&
  qa.provenance?.sourceSha256===SOURCE_SHA&&
  qa.provenance?.artifactSha256===ORIGINAL_SHA,'REAL_MODEL_QA');
requireThat(sourceGeo.modelSha256===ORIGINAL_SHA&&
  sourceGeo.topology.everyObjectWatertight===true&&
  sourceGeo.topology.everyObjectPositiveVolume===false&&
  sourceGeo.printQualified===false,'SOURCE_TOPOLOGY');
requireThat(score.fixtureId===CASE&&score.imageSha256===SOURCE_SHA&&
  score.modelSha256===ORIGINAL_SHA&&
  score.evaluation==='POST_HOC_NORMALIZED_3D_SHAPE_DIAGNOSTIC'&&
  score.hasOriginalGroundTruth3d===true&&
  score.printQualified===false,'ORIGINAL_REFERENCE_DIAGNOSTIC');
const derived=await regularBytes(path.join(DIR,'orb-positive-winding.glb'));
const winding=await json(path.join(DIR,'winding-provenance.json'));
const afterGeo=await json(path.join(DIR,'positive-geometry-qa.json'));
const equivalence=await json(path.join(DIR,'exact-winding-proof.json'));
const image=await regularBytes(path.join(DIR,'orb-threeway-software-preview.png'),12*1024*1024);
const browser=await json(path.join(DIR,'orb-threeway-browser-proof-retry.json'));
requireThat(sha(derived)===DERIVATIVE_SHA&&
  winding.sourceSha256===ORIGINAL_SHA&&
  winding.derivedSha256===DERIVATIVE_SHA&&
  winding.printQualified===false,'DERIVATIVE_SHA');
requireThat(afterGeo.modelSha256===DERIVATIVE_SHA&&
  afterGeo.topology.everyObjectWatertight===true&&
  afterGeo.topology.everyObjectPositiveVolume===true&&
  afterGeo.printQualified===false,'INDEPENDENT_DERIVATIVE_QA');
requireThat(equivalence.schema==='local3d.g3.7.winding-equivalence.v1'&&
  equivalence.sourceSha256===ORIGINAL_SHA&&
  equivalence.derivativeSha256===DERIVATIVE_SHA&&
  equivalence.sameVertexCoordinatesExact===true&&
  equivalence.sameTriangleGeometryExceptExactReversal===true&&
  equivalence.faceNormalsExactlyOpposite===true&&
  equivalence.vertexColorsExactlyPreserved===true&&
  equivalence.geometricShapeChanged===false&&
  equivalence.modelInferenceExecuted===false&&
  equivalence.printQualified===false,'EXACT_WINDING_ONLY');
requireThat(browser.schema==='local3d.g3.7.browser-preview.v1'&&
  browser.success===true&&browser.modelInferenceExecuted===false&&
  browser.printQualified===false&&
  browser.errors?.length===0&&browser.externalUrls?.length===0&&
  browser.screenshotSha256===sha(image)&&
  browser.models['/source.glb']===ORIGINAL_SHA&&
  browser.models['/derivative.glb']===DERIVATIVE_SHA,'SOFTWARE_RENDER');
const chamfer=score.shape?.bestView?.chamferL1Normalized;
const f1=score.shape?.bestView?.f1At2Pct;
requireThat(chamfer===0.02209413&&f1===0.4836679,
  'PINNED_REFERENCE_BENCHMARK');
requireThat((await regularBytes(path.join(RESULTS,
  'orb-01-threeway-preview.png'),12*1024*1024)).equals(image),
  'PUBLISHED_SANITIZED_SCREENSHOT_MISMATCH');

const milestone={
  schema:'local3d.g3.7.orb-01-cpu-quality-milestone.v1',
  fixtureId:CASE,
  fixtureInputSha256:SOURCE_SHA,
  fixtureRights:'PROJECT_ORIGINAL_PROCEDURAL',
  modelSource:'ONE_PREVIOUSLY_AUTHORIZED_COMPLETED_LOCAL_TRIPOSR_RUN',
  modelOriginalSha256:ORIGINAL_SHA,
  originalModelBytes:model.length,
  derivativeSha256:DERIVATIVE_SHA,
  derivativeBytes:derived.length,
  originalSignedVolumeArbitraryUnitsCubed:
    sourceGeo.parts[0].signedVolumeArbitraryUnitsCubed,
  derivativeSignedVolumeArbitraryUnitsCubed:
    afterGeo.parts[0].signedVolumeArbitraryUnitsCubed,
  originalWatertight:sourceGeo.topology.everyObjectWatertight,
  derivativeWatertight:afterGeo.topology.everyObjectWatertight,
  originalPositiveVolume:false,
  derivativePositiveVolume:true,
  exactSourceGeometryAndColorPreserved:true,
  exactlyReversedFaceIndices:true,
  vertices:equivalence.sourceVertices,
  triangles:equivalence.sourceTriangles,
  originalVsSourceNormalizedChamferL1:chamfer,
  originalVsSourceF1At2Pct:f1,
  derivativeVsSourceInterpretation:
    'UNCHANGED_GEOMETRIC_SURFACE_SAME_FINITE_SAMPLE_DISTANCE_NOT_RECOMPUTED',
  sourceReferenceScoringMethod:'POST_HOC_YAW_AND_INDEPENDENT_AABB_SCALE',
  metricIsPhysicalAccuracy:false,
  modelInferenceDuringThisCpuMilestone:false,
  browserRenderedWith:'CHROME_SWIFTSHADER_SOFTWARE_RENDER',
  screenshotSha256:sha(image),
  noExternalBrowserRequests:true,
  sourceOriginalModelPreserved:true,
  originalAndDerivativeGlbsStayPrivate:true,
  privateJobIdentifiersIncluded:false,
  realWorldScale:'UNKNOWN_UNCALIBRATED',
  wallThickness:'NOT_TESTED',
  selfIntersections:'NOT_TESTED',
  materialStrength:'NOT_TESTED',
  supports:'NOT_TESTED',
  printQualified:false,
  approvedForPrinter:false,
  fabricationAction:'NONE'
};
requireThat(milestone.originalSignedVolumeArbitraryUnitsCubed<0&&
  milestone.derivativeSignedVolumeArbitraryUnitsCubed>0,
  'SIGNED_VOLUME');
const out=path.join(RESULTS,'orb-01-cpu-quality-milestone.json');
const raw=JSON.stringify(milestone,null,2)+'\n';
const exists=await fs.readFile(out,'utf8').catch(e=>{
  if(e.code==='ENOENT')return null;throw e;
});
if(exists!==null&&exists!==raw)throw new Error('Refusing to overwrite prior quality milestone');
if(exists===null)await fs.writeFile(out,raw,{flag:'wx'});
console.log('G3_7_ORB_CPU_MILESTONE_EVIDENCE_PASS '+JSON.stringify({
  source:ORIGINAL_SHA,derivative:DERIVATIVE_SHA,
  originalVolume:milestone.originalSignedVolumeArbitraryUnitsCubed,
  derivativeVolume:milestone.derivativeSignedVolumeArbitraryUnitsCubed,
  triangles:milestone.triangles,sameGeometry:true,
  additionalGpuRuns:0,printQualified:false,
  output:path.relative(ROOT,out)
}));
