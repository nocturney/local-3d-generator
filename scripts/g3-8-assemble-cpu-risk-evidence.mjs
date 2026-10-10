/**
 * G3.8 immutable sanitized report from CPU-only private triangle and radial
 * diagnostics on a PREVIOUSLY GENERATED licensed G3 model. This script
 * NEVER invokes TripoSR/GPU or imports private images into the Git tree.
 *
 * --job-id accepts a UUID for the existing completed PRIVATE local job;
 * the report deliberately omits that UUID, prompts and OS paths.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const J_ROOT=path.join(ROOT,'runtime','data-g2-manual','jobs');
const PRIVATE=path.join(ROOT,'runtime','qa','g3','orb-01-positive-winding');
const PUBLIC=path.join(ROOT,'docs','evidence','g3');
const ID='01-orb-alpha';
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SHA={
  input:'9cb2f41de1b0239570068b055dc06bf941491559e11942b5bbc5757adb3d886a',
  original:'f37a812bc4414ddee34bcb19d2e7535f25d219a3731c14f2dcc89c2c7ba030e2',
  derivative:'ab2e5aeb55598624209eeca3e700abef93a69a52886c63ecad6a840e62d8d68f',
  reference:'c8834b2668210e58a73ff8b2ab3bcf2d0bc5d2df9a09b3dd0313b425b3664749'
};
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const ensure=(test,message)=>{if(!test)throw new Error('G3_8_EVIDENCE_REFUSED: '+message)};
async function bytes(file,limit=64*1024*1024){
  const stat=await fs.lstat(file);
  ensure(stat.isFile()&&!stat.isSymbolicLink()&&stat.size>0&&stat.size<=limit,
    'INVALID_OR_LINKED_FILE');
  return fs.readFile(file);
}
async function json(file){return JSON.parse((await bytes(file,256*1024)).toString('utf8'))}
const args=process.argv.slice(2);
ensure(args.length===2&&args[0]==='--job-id'&&UUID.test(args[1]),
  'EXACT_UUID_ARG_REQUIRED');
const jobpath=path.join(J_ROOT,args[1]);
ensure((await fs.realpath(jobpath)).toLowerCase()===
  path.resolve(jobpath).toLowerCase(),'NO_SYMLINK_JOB_DIR');
const job=await json(path.join(jobpath,'job.json'));
ensure(job.id===args[1]&&job.status==='completed'&&
  job.providerId==='triposr-local'&&job.simulation===false&&
  Array.isArray(job.assets),'ONLY_COMPLETED_REAL_JOB');
const manifest=await json(path.join(ROOT,'benchmarks','g3','fixtures','manifest.json'));
const licensed=manifest.fixtures.find(f=>f.id===ID);
ensure(licensed?.imageSha256===SHA.input&&
  licensed?.groundTruthSha256===SHA.reference&&
  licensed.sourceRights==='PROJECT_ORIGINAL_PROCEDURAL','LICENSED_PINNED_FIXTURE');
const verifyAsset=async(id,file,max)=>{
  const data=await bytes(file,max);
  const record=job.assets.find(a=>a.id===id);
  ensure(record?.bytes===data.length&&record.sha256===sha(data),
    'REAL_JOB_ASSET_HASH_OR_SIZE_'+id);
  return data;
};
const image=await verifyAsset('source-image',path.join(jobpath,'input.png'),8*1024*1024);
const original=await verifyAsset('preview-glb',path.join(jobpath,'output.glb'),64*1024*1024);
await verifyAsset('qa-report',path.join(jobpath,'qa-report.json'),256*1024);
await verifyAsset('geometry-qa',path.join(jobpath,'geometry-qa.json'),256*1024);
await verifyAsset('benchmark-shape',path.join(jobpath,'benchmark-shape.json'),256*1024);
ensure(sha(image)===SHA.input&&sha(original)===SHA.original,
  'SOURCE_MODEL_CHANGED');
const gt=await bytes(path.join(ROOT,'benchmarks','g3','fixtures','01-orb-alpha','ground-truth.glb'));
const der=await bytes(path.join(PRIVATE,'orb-positive-winding.glb'));
ensure(sha(gt)===SHA.reference&&sha(der)===SHA.derivative,
  'REFERENCE_OR_DERIVATIVE_CHANGED');
const prior=await json(path.join(PUBLIC,'orb-01-cpu-quality-milestone.json'));
const equivalence=await json(path.join(PUBLIC,'orb-01-exact-winding-proof.json'));
ensure(prior.modelOriginalSha256===SHA.original&&prior.derivativeSha256===SHA.derivative&&
  prior.printQualified===false&&equivalence.sameVertexCoordinatesExact===true&&
  equivalence.vertexColorsExactlyPreserved===true&&
  equivalence.sameTriangleGeometryExceptExactReversal===true,
  'OLDER_WINDING_GATES_MISSING');
const screens={
  original:await json(path.join(PRIVATE,'original-contact-screen.json')),
  corrected:await json(path.join(PRIVATE,'contact-screen-cpu.json')),
  reference:await json(path.join(PRIVATE,'ground-truth-contact-screen.json'))
};
const expected={
  original:SHA.original,corrected:SHA.derivative,reference:SHA.reference
};
for(const [key,value] of Object.entries(screens)){
  ensure(value.schema==='local3d.g3.8.nonadjacent-triangle-contact-screen.v1'&&
    value.modelSha256===expected[key]&&value.completeBroadphaseAndSATForEligiblePairs===true&&
    value.screen==='NO_NONADJACENT_CONTACTS_DETECTED_WITHIN_NUMERICAL_TOLERANCE'&&
    value.potentialNonadjacentContactCountLowerBound===0&&
    value.selfIntersectionFreeCertified===false&&value.printQualified===false&&
    value.modelInferenceExecuted===false,'CONTACT_SCAN_'+key);
}
ensure(screens.original.pairsExaminedByConservativeSAT===
       screens.corrected.pairsExaminedByConservativeSAT&&
       screens.original.skippedPairsSharingAnyVertexIndex===
       screens.corrected.skippedPairsSharingAnyVertexIndex&&
       screens.original.triangleCount===40352&&
       screens.corrected.triangleCount===40352,
       'WINDING_MUST_NOT_CHANGE_CONTACT_ELIGIBILITY');
const radial=await json(path.join(PRIVATE,'orb-radial-cpu.json'));
ensure(radial.schema==='local3d.g3.8.orb-radial-irregularity.v1'&&
  radial.fixtureId===ID&&radial.originalReferenceSha256===SHA.reference&&
  radial.previousRealPredictionSha256===SHA.original&&
  radial.orientationDerivativeSha256===SHA.derivative&&
  radial.derivativeSameExactVertexAndSurfaceGeometryAsPrediction===true&&
  radial.newAiInference===false&&radial.printQualified===false&&
  radial.sampleMethodIdenticalForBoth===true&&
  radial.referenceRoundness.sampleCount===4096&&
  radial.actualModelRoundness.sampleCount===4096,'RADIAL_SHA_AND_METHOD');
const pick=metric=>({
  ...Object.fromEntries(['absoluteRadialResidualMeanRelativeToRadius',
      'absoluteRadialResidualP95RelativeToRadius',
      'radialResidualRmsRelativeToRadius',
      'radialSpreadP95MinusP5RelativeToRadius',
      'sampleCount','seed','fit','coordinates','sampleDistribution'].map(k=>[k,metric[k]]))
});
const compactScreen=r=>({
  status:r.screen,
  screenCompleted:r.completeBroadphaseAndSATForEligiblePairs,
  faces:r.triangleCount,
  broadphasePairs:r.candidatePairsBeforeAabb,
  aabbPairs:r.aabbOverlappingPairs,
  vertexAdjacentPairsExcluded:r.skippedPairsSharingAnyVertexIndex,
  conservativeSatPairChecks:r.pairsExaminedByConservativeSAT,
  potentialContactsLowerBound:r.potentialNonadjacentContactCountLowerBound,
  geometricToleranceInOriginalArbitraryUnits:r.geometricToleranceArbitraryUnits,
  noIntersectionCertification:r.selfIntersectionFreeCertified===false,
  boundedCaps:r.boundedCaps
});
const evidence={
  schema:'local3d.g3.8.real-orb-cpu-risk-diagnostic.v1',
  fixtureId:ID,
  inputRights:'PROJECT_ORIGINAL_PROCEDURAL',
  sourceImageSha256:SHA.input,
  realOriginalOutputSha256:SHA.original,
  previousOrientationOnlyDerivativeSha256:SHA.derivative,
  originalGroundTruthSha256:SHA.reference,
  modelEvidenceLane:'PREVIOUSLY_APPROVED_REAL_TRIPOSR_INFERENCE',
  newNeuralInferenceThisMilestone:false,
  geometricSurfaceSameAfterWindingCorrection:true,
  contacts:{
    original:compactScreen(screens.original),
    corrected:compactScreen(screens.corrected),
    originalProceduralGroundTruth:compactScreen(screens.reference),
    interpretation:'CONSERVATIVE_NONADJACENT_TRIANGLE_SAT_CONTACT_SCREEN_NOT_GEOMETRIC_CERTIFICATION',
    criticalBlindSpot:'TRIANGLES_SHARING_ANY_VERTEX_INDEX_ARE_EXCLUDED_EVEN_IF_THEY_SELF_FOLD',
    collisionPredicate:'FLOATING_POINT_SEPARATING_AXIS_AND_AABB_WITH_TOLERANCE',
    zeroContactsDoesNotProveSelfIntersectionFree:true
  },
  radial:{
    proceduralGroundTruth:pick(radial.referenceRoundness),
    previouslyGeneratedTripoSRModel:pick(radial.actualModelRoundness),
    modelToGroundTruthMeanRadialResidualRatio:
      radial.predictionAbsoluteResidualMeanToReferenceRatio,
    lowerRadialErrorMeansCloserToBestFitSphereNotImageAccuracy:true,
    derivativeExactlySameSurfaceSoNotScoredAsNewImprovement:true,
    methodCaveats:radial.interpretation
  },
  status:'DIAGNOSTIC_ONLY_NO_MANUFACTURING_CLEARANCE',
  realWorldUnits:'UNKNOWN_UNCALIBRATED',
  wallThickness:'NOT_TESTED',
  adjacentFaceFoldover:'NOT_TESTED',
  manufacturingSelfIntersectionCertification:'NOT_AVAILABLE',
  supports:'NOT_TESTED',materialStrength:'NOT_TESTED',
  noPrinterAction:true,printQualified:false,approvedForPrinter:false,
  fabricationAction:'NONE',
  noPrivateJobIdsPathsPromptsOrOriginalGlbsInOutput:true
};
ensure(evidence.radial.previouslyGeneratedTripoSRModel.absoluteRadialResidualMeanRelativeToRadius>
       evidence.radial.proceduralGroundTruth.absoluteRadialResidualMeanRelativeToRadius,
       'EXPECTED_ORB_ROUNDNESS_CONTROL');
const target=path.join(PUBLIC,'orb-01-g38-cpu-risk-screen.json');
const raw=JSON.stringify(evidence,null,2)+'\n';
const prev=await fs.readFile(target,'utf8').catch(e=>{
  if(e.code==='ENOENT')return null;throw e;
});
ensure(prev===null||prev===raw,'REFUSING_DIFFERENT_REPORT_OVERWRITE');
if(prev===null)await fs.writeFile(target,raw,{flag:'wx'});
console.log('G3_8_ORB_CPU_RISK_EVIDENCE_PASS '+JSON.stringify({
  original:SHA.original,corrected:SHA.derivative,
  satPairChecks:evidence.contacts.corrected.conservativeSatPairChecks,
  potentialContacts:0,screenComplete:true,
  meanRadialReference:evidence.radial.proceduralGroundTruth.absoluteRadialResidualMeanRelativeToRadius,
  meanRadialAI:evidence.radial.previouslyGeneratedTripoSRModel.absoluteRadialResidualMeanRelativeToRadius,
  printQualified:false,newGpuJobs:0,
  output:path.relative(ROOT,target)
}));
