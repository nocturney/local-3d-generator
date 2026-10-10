/**
 * G3.9 sanitize existing, authenticated real-orb and GT edge-angle CPU
 * reports. Completely read-only except writing a NEW immutable public JSON.
 * NO GPU, model invocation, customer artifacts, printer or runtime edits.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const JOBS=path.join(ROOT,'runtime','data-g2-manual','jobs');
const QA=path.join(ROOT,'runtime','qa','g3','orb-01-positive-winding');
const PUB=path.join(ROOT,'docs','evidence','g3');
const expectedSha={
  original:'f37a812bc4414ddee34bcb19d2e7535f25d219a3731c14f2dcc89c2c7ba030e2',
  corrected:'ab2e5aeb55598624209eeca3e700abef93a69a52886c63ecad6a840e62d8d68f',
  reference:'c8834b2668210e58a73ff8b2ab3bcf2d0bc5d2df9a09b3dd0313b425b3664749',
  input:'9cb2f41de1b0239570068b055dc06bf941491559e11942b5bbc5757adb3d886a'
};
const ok=(x,what)=>{if(!x)throw new Error('G3.9 PROVENANCE REFUSED: '+what)};
const digest=x=>createHash('sha256').update(x).digest('hex');
async function bytes(p,limit=64*1024*1024){
  const stat=await fs.lstat(p);
  ok(stat.isFile()&&!stat.isSymbolicLink()&&stat.size>0&&stat.size<=limit,'INVALID_FILE');
  return fs.readFile(p);
}
const read=async p=>JSON.parse((await bytes(p,262144)).toString('utf8'));
const args=process.argv.slice(2);
ok(args.length===2&&args[0]==='--job-id'&&/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(args[1]),
  'ONLY_EXISTING_REAL_JOB_UUID');
const folder=path.join(JOBS,args[1]);
ok((await fs.realpath(folder)).toLowerCase()===path.resolve(folder).toLowerCase(),
  'NO_JOB_FOLDER_LINKS');
const job=await read(path.join(folder,'job.json'));
ok(job.id===args[1]&&job.providerId==='triposr-local'&&
   job.status==='completed'&&job.simulation===false&&
   Array.isArray(job.assets),'REAL_JOB_ONLY');
const manifest=await read(path.join(ROOT,'benchmarks','g3','fixtures','manifest.json'));
const licensed=manifest.fixtures.find(x=>x.id==='01-orb-alpha');
ok(licensed?.imageSha256===expectedSha.input&&
  licensed?.groundTruthSha256===expectedSha.reference&&
  licensed?.sourceRights==='PROJECT_ORIGINAL_PROCEDURAL','LICENSED_REFERENCE');
for(const [id,file,expected] of [
  ['source-image','input.png',expectedSha.input],
  ['preview-glb','output.glb',expectedSha.original],
  ['qa-report','qa-report.json',null],
  ['geometry-qa','geometry-qa.json',null],
  ['benchmark-shape','benchmark-shape.json',null]
]){
  const blob=await bytes(path.join(folder,file));
  const asset=job.assets.find(x=>x.id===id);
  ok(asset?.sha256===digest(blob)&&asset?.bytes===blob.length,'ACTUAL_JOB_ASSET_'+id);
  if(expected)ok(digest(blob)===expected,'PINNED_'+id);
}
const der=await bytes(path.join(QA,'orb-positive-winding.glb'));
const source=await bytes(path.join(ROOT,'benchmarks','g3','fixtures','01-orb-alpha','ground-truth.glb'));
ok(digest(der)===expectedSha.corrected&&digest(source)===expectedSha.reference,
  'CORRECTED_OR_REFERENCE_SHA');
const prior=await read(path.join(PUB,'orb-01-g38-cpu-risk-screen.json'));
const exact=await read(path.join(PUB,'orb-01-exact-winding-proof.json'));
ok(prior.realOriginalOutputSha256===expectedSha.original&&
   prior.previousOrientationOnlyDerivativeSha256===expectedSha.corrected&&
   prior.contacts.original.screenCompleted===true&&
   prior.contacts.corrected.screenCompleted===true&&
   prior.printQualified===false&&exact.sameVertexCoordinatesExact===true&&
   exact.sameTriangleGeometryExceptExactReversal===true,
   'G3_7_AND_G3_8_GEOMETRY_GATES');
const inputs={
  original:await read(path.join(QA,'original-edge-angle.json')),
  corrected:await read(path.join(QA,'corrected-edge-angle.json')),
  reference:await read(path.join(QA,'reference-edge-angle.json'))
};
for(const [kind,row] of Object.entries(inputs)){
  ok(row.schema==='local3d.g3.9.adjacent-face-normal-angles.v1'&&
    row.modelSha256===expectedSha[kind]&&
    row.allIndexedTwoFaceEdgesExamined===true&&
    row.notPrintQualified===true&&row.printQualified===false&&
    row.gpuInferenceExecuted===false&&
    row.doesNotProveNoFaceFoldover===true&&
    row.doesNotProveSelfIntersectionFree===true&&
    row.doesNotTestVertexOnlyAdjacency===true&&
    row.edgeAdjacentFacePairs===row.faceCount*3/2,'ANGLE_REPORT_'+kind);
}
const fromOriginal=inputs.original;
const fromCorrected=inputs.corrected;
ok(JSON.stringify(fromOriginal.angleDegrees)===JSON.stringify(fromCorrected.angleDegrees)&&
   JSON.stringify(fromOriginal.edgeCountsOverAngleThreshold)===
     JSON.stringify(fromCorrected.edgeCountsOverAngleThreshold)&&
   fromOriginal.edgeAdjacentFacePairs===60528&&
   fromOriginal.angleDegrees.p95===33.01876&&
   fromOriginal.edgeCountsOverAngleThreshold.over45Deg===312&&
   fromOriginal.edgeCountsOverAngleThreshold.over90Deg===0&&
   inputs.reference.angleDegrees.p95===5.731991&&
   inputs.reference.edgeAdjacentFacePairs===1920,
   'PRESERVED_ANGLE_DISTRIBUTION');
const summary=row=>({
  triangleFaces:row.faceCount,
  indexedEdgeAdjacentPairs:row.edgeAdjacentFacePairs,
  allIndexedTwoFaceEdgesExamined:row.allIndexedTwoFaceEdgesExamined,
  angleDegrees:row.angleDegrees,
  countsAboveAngleThresholds:row.edgeCountsOverAngleThreshold,
  fractionAbove45Deg:row.fractionOver45Deg,
  sharpIntentionalFeaturesArePossible:row.intentionalSharpCreasesCanExceedThresholds,
  faceOnlyEdgeAdjacentScope:row.scope
});
const evidence={
  schema:'local3d.g3.9.real-orb-adjacent-face-angle-evidence.v1',
  fixtureId:'01-orb-alpha',
  rights:'PROJECT_ORIGINAL_PROCEDURAL',
  fixtureSourceImageSha256:expectedSha.input,
  previouslyGeneratedRealModelSha256:expectedSha.original,
  windingOnlyDerivativeSha256:expectedSha.corrected,
  originalSourceGtSha256:expectedSha.reference,
  modelOutputSource:'SINGLE_PREVIOUSLY_APPROVED_REAL_TRIPOSR_INFERENCE',
  newAiInferenceExecuted:false,
  originalRealTripoSR:summary(inputs.original),
  copyOnlyCorrectedTripoSR:summary(inputs.corrected),
  proceduralSourceGroundTruth:summary(inputs.reference),
  allPriorOrientationChangesPreserveAnglesExactly:true,
  mayHaveIntentionalHighAngleCreases:true,
  differentFaceDensityMakesAnglePercentilesNonComparableAsAbsoluteQuality:true,
  subjectToVertexOnlyFoldoverNotCovered:true,
  notProofOfSelfIntersectionFree:true,
  notAManufacturingNormalOrThicknessGuarantee:true,
  noPhysicalUnitsOrStrengthMeasurements:true,
  meaning:'MEASURES_LOCAL_EDGE_ADJACENT_FACE_NORMAL_DIFFERENCES_ONLY',
  remainingBlindspots:[
    'Vertex-only triangle adjacency not analyzed for 3D collision',
    'True neighboring-surface foldover and near-zero nonadjacent proximity not certified',
    'GT and prediction differ strongly in tessellation density and triangle size',
    'Intentional sharp edges can be legitimate; high dihedral alone not a defect',
    'No wall thickness, mm-scale, mechanical/material/slicer/print evaluation'
  ],
  privateAssetsNeverPublished:true,
  printQualified:false,
  approvedForPrinter:false,
  fabricationAction:'NONE'
};
const target=path.join(PUB,'orb-01-g39-adjacent-angles.json');
const raw=JSON.stringify(evidence,null,2)+'\n';
const existing=await fs.readFile(target,'utf8').catch(e=>{
  if(e.code==='ENOENT')return null;throw e;
});
ok(existing===null||existing===raw,'MISMATCH_WITH_PRIOR_PUBLIC_REPORT');
if(existing===null)await fs.writeFile(target,raw,{flag:'wx'});
console.log('G3_9_REAL_ORB_CPU_ADJACENCY_PROVENANCE_PASS '+JSON.stringify({
  originalSha:expectedSha.original,
  correctionSha:expectedSha.corrected,
  realEdgePairs:evidence.originalRealTripoSR.indexedEdgeAdjacentPairs,
  aiP95Degrees:evidence.originalRealTripoSR.angleDegrees.p95,
  gtP95Degrees:evidence.proceduralSourceGroundTruth.angleDegrees.p95,
  realOver45:evidence.originalRealTripoSR.countsAboveAngleThresholds.over45Deg,
  over90:evidence.originalRealTripoSR.countsAboveAngleThresholds.over90Deg,
  noNewGpu:true,printQualified:false,
  output:path.relative(ROOT,target)
}));
