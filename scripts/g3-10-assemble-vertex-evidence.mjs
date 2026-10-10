/** G3.10 immutable, sanitized, SHA-pinned real-orb shared-one-vertex
 * CPU ray-risk evidence. NO neural inference, printer/network action.
 * A local completed-job UUID is accepted ONLY for private provenance, and
 * never appears in the published report.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const PRIVATE=path.join(ROOT,'runtime','qa','g3','orb-01-positive-winding');
const PUBLIC=path.join(ROOT,'docs','evidence','g3');
const FIXTURE='01-orb-alpha';
const SHA={
  input:'9cb2f41de1b0239570068b055dc06bf941491559e11942b5bbc5757adb3d886a',
  original:'f37a812bc4414ddee34bcb19d2e7535f25d219a3731c14f2dcc89c2c7ba030e2',
  corrected:'ab2e5aeb55598624209eeca3e700abef93a69a52886c63ecad6a840e62d8d68f',
  reference:'c8834b2668210e58a73ff8b2ab3bcf2d0bc5d2df9a09b3dd0313b425b3664749',
  chair:'48ee912229ad73fcbda1a6b455dbcc39d396bdf2c752ccabc90a29097b09b6ec'
};
const digest=b=>createHash('sha256').update(b).digest('hex');
const ensure=(value,code)=>{if(!value)throw new Error('G3_10_PROVENANCE_REFUSED: '+code)};
async function bytes(file,limit=64*1024*1024){
  const st=await fs.lstat(file);
  ensure(st.isFile()&&!st.isSymbolicLink()&&st.size>0&&st.size<=limit,
    'INVALID_EVIDENCE_FILE');
  return fs.readFile(file);
}
const json=async file=>JSON.parse((await bytes(file,262144)).toString('utf8'));
const args=process.argv.slice(2);
ensure(args.length===2&&args[0]==='--job-id'&&
  /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(args[1]),
  'COMPLETED_LOCAL_UUID_REQUIRED');
const jobfolder=path.join(ROOT,'runtime','data-g2-manual','jobs',args[1]);
ensure((await fs.realpath(jobfolder)).toLowerCase()===path.resolve(jobfolder).toLowerCase(),
  'JOB_SYMLINK_REFUSED');
const job=await json(path.join(jobfolder,'job.json'));
ensure(job.id===args[1]&&job.status==='completed'&&
  job.providerId==='triposr-local'&&job.simulation===false&&
  Array.isArray(job.assets),'NOT_A_REAL_COMPLETED_JOB');
const catalog=await json(path.join(ROOT,'benchmarks','g3','fixtures','manifest.json'));
const orb=catalog.fixtures.find(x=>x.id===FIXTURE);
ensure(orb?.imageSha256===SHA.input&&orb?.groundTruthSha256===SHA.reference&&
  orb?.sourceRights==='PROJECT_ORIGINAL_PROCEDURAL','UNLICENSED_OR_CHANGED_REFERENCE');
for(const [id,file,pinned] of [
  ['source-image','input.png',SHA.input],
  ['preview-glb','output.glb',SHA.original],
  ['qa-report','qa-report.json',null],
  ['geometry-qa','geometry-qa.json',null],
  ['benchmark-shape','benchmark-shape.json',null]
]){
  const data=await bytes(path.join(jobfolder,file));
  const asset=job.assets.find(x=>x.id===id);
  ensure(asset?.sha256===digest(data)&&asset?.bytes===data.length,
    'REAL_JOB_MISSING_ASSET_'+id);
  if(pinned)ensure(digest(data)===pinned,'REAL_SOURCE_SHA_CHANGED_'+id);
}
const modelPaths={
  corrected:path.join(PRIVATE,'orb-positive-winding.glb'),
  reference:path.join(ROOT,'benchmarks','g3','fixtures',FIXTURE,'ground-truth.glb'),
  chair:path.join(PUBLIC,'chair-positive-winding.glb')
};
for(const [name,file] of Object.entries(modelPaths)){
  ensure(digest(await bytes(file))===SHA[name],'KNOWN_MODEL_SHA_CHANGED_'+name);
}
const old38=await json(path.join(PUBLIC,'orb-01-g38-cpu-risk-screen.json'));
const old39=await json(path.join(PUBLIC,'orb-01-g39-adjacent-angles.json'));
const exact=await json(path.join(PUBLIC,'orb-01-exact-winding-proof.json'));
ensure(old38.realOriginalOutputSha256===SHA.original&&
  old38.previousOrientationOnlyDerivativeSha256===SHA.corrected&&
  old38.printQualified===false&&
  old39.previouslyGeneratedRealModelSha256===SHA.original&&
  old39.windingOnlyDerivativeSha256===SHA.corrected&&
  old39.newAiInferenceExecuted===false&&
  exact.sameVertexCoordinatesExact===true&&
  exact.sameTriangleGeometryExceptExactReversal===true,
  'PREVIOUS_SOURCE_AND_TOPOLOGY_GATES');
const privateFiles={
  original:'original-vertex-ray-screen.json',
  corrected:'corrected-vertex-ray-screen.json',
  reference:'reference-vertex-ray-screen.json',
  chair:'historic-chair-vertex-ray-screen.json'
};
const data={};
for(const [name,file] of Object.entries(privateFiles)){
  const row=await json(path.join(PRIVATE,file));
  ensure(row.schema==='local3d.g3.10.shared-one-vertex-ray-screen.v1'&&
    row.modelSha256===SHA[name]&&
    row.completeVertexOnlyPairClassification===true&&
    row.vertexOnlyPairsEnumerated===row.vertexOnlyPairsExamined&&
    row.incompleteReason===null&&
    row.classification?.potentialExtraContactAlongNonzeroCommonRay===0&&
    row.classification?.nearParallelOrCoplanarUnresolvedPairs===0&&
    row.classification?.edgeAlignedRayUncertainPairs===0&&
    row.classification?.nearZeroLengthRayUncertainPairs===0&&
    row.classification?.separatedRaySectorsWithinNumericalTolerance===
       row.vertexOnlyPairsExamined&&
    row.trueSelfIntersectionFreeCertified===false&&
    row.printQualified===false&&row.newAiInference===false,
    'UNCERTAIN_OR_DIFFERENT_PRIVATE_TRIANGLE_RESULT_'+name);
  data[name]=row;
}
ensure(data.original.vertexOnlyPairsExamined===190860&&
  data.corrected.vertexOnlyPairsExamined===190860&&
  data.reference.vertexOnlyPairsExamined===5730&&
  data.chair.vertexOnlyPairsExamined===92629&&
  data.original.fullEdgePairDoubleIncidencesSkipped===121056&&
  data.corrected.fullEdgePairDoubleIncidencesSkipped===121056,
  'KNOWN_REAL_TRIANGLE_COVERAGE_CHANGED');
const comparable=[
  'triangleCount','vertexCount','vertexOnlyPairsEnumerated',
  'vertexOnlyPairsExamined','fullEdgePairDoubleIncidencesSkipped',
  'status','classification'
];
for(const field of comparable)ensure(
  JSON.stringify(data.original[field])===JSON.stringify(data.corrected[field]),
  'WINDING_CORRECTION_CHANGED_GEOMETRY_RAY_STAT_'+field);
const screen=row=>({
  triangles:row.triangleCount,
  vertices:row.vertexCount,
  vertexOnlyPairsEnumerated:row.vertexOnlyPairsEnumerated,
  vertexOnlyPairsExamined:row.vertexOnlyPairsExamined,
  skippedFullEdgePairsDoubleIncidence:row.fullEdgePairDoubleIncidencesSkipped,
  highestObservedVertexValence:row.maxObservedIndexedVertexValence,
  completedEligiblePairs:row.completeVertexOnlyPairClassification,
  status:row.status,
  candidateBeyondVertexCommonRayPairs:
      row.classification.potentialExtraContactAlongNonzeroCommonRay,
  nearCoplanarUnresolvedPairs:
      row.classification.nearParallelOrCoplanarUnresolvedPairs,
  edgeAlignedUnresolvedPairs:
      row.classification.edgeAlignedRayUncertainPairs,
  shortRayUnresolvedPairs:
      row.classification.nearZeroLengthRayUncertainPairs,
  numericallySeparatedRaySectors:
      row.classification.separatedRaySectorsWithinNumericalTolerance,
  actualSelfIntersectionFreeCertified:false,
  resourceCaps:row.resourceCaps
});
const evidence={
  schema:'local3d.g3.10.real-orb-shared-one-vertex-ray-screen.v1',
  rights:'PROJECT_ORIGINAL_PROCEDURAL',
  fixtureId:FIXTURE,
  fixtureImageSha256:SHA.input,
  originalRealTripoSRModelSha256:SHA.original,
  unchangedWindingOnlyCopySha256:SHA.corrected,
  originalProceduralSourceGtSha256:SHA.reference,
  priorRealChairDerivativeSha256:SHA.chair,
  source:'PREVIOUSLY_COMPLETED_USER_APPROVED_REAL_TRIPOSR_GPU_RUN',
  noNewModelInferenceDuringThisMilestone:true,
  originalRealTripoSR:screen(data.original),
  copyOnlyWindingDerivative:screen(data.corrected),
  proceduralSourceGroundTruth:screen(data.reference),
  historicalRealChairDerivative:screen(data.chair),
  method:'SHARED_ONE_VERTEX_TRIANGLE_NONCOPLANAR_PLANE_INTERSECTION_RAY',
  measuredPairCondition:'TWO_TRIANGLES_SHARE_EXACTLY_ONE_INDEXED_VERTEX',
  naturallySharedVertexIsNotCountedAsADefect:true,
  allUniqueVertexOnlyPairsInValidatedMeshEnumerated:true,
  originalAndDerivativeRaysRemainIdentical:true,
  nearCoplanarRemainsExplicitUnresolvedCategory:true,
  edgeAdjacentTrueFoldoverNotCovered:true,
  duplicateCoordinatesAcrossDifferentIndicesNotCertified:true,
  toleranceSensitiveNotAnExactCollisionPredicate:true,
  intersectionOrPrintCertificationGranted:false,
  selfIntersectionFreeCertified:false,
  printQualified:false,
  approvedForPrinter:false,
  absoluteMillimeterScale:'UNKNOWN_UNCALIBRATED',
  wallThickness:'NOT_TESTED',
  strength:'NOT_TESTED',
  slicer:'NOT_USED',
  fabricationAction:'NONE',
  localCustomerJobIdOrModelBinaryNotPublished:true
};
const output=path.join(PUBLIC,'orb-01-g310-shared-vertex-ray-screen.json');
const result=JSON.stringify(evidence,null,2)+'\n';
const prev=await fs.readFile(output,'utf8').catch(e=>{
  if(e.code==='ENOENT')return null;throw e;
});
ensure(prev===null||prev===result,'EXISTING_PUBLIC_REPORT_DIFFERS');
if(prev===null)await fs.writeFile(output,result,{flag:'wx'});
console.log('G3_10_REAL_ORB_CPU_VERTEX_RAY_EVIDENCE_PASS '+JSON.stringify({
  realOrbUniqueVertexOnlyPairs:data.original.vertexOnlyPairsExamined,
  realOrbPotentialExtraContacts:
    data.original.classification.potentialExtraContactAlongNonzeroCommonRay,
  realOrbUnresolvedParallel:
    data.original.classification.nearParallelOrCoplanarUnresolvedPairs,
  realChairPairs:data.chair.vertexOnlyPairsExamined,
  originalAndCopyIdentical:true,
  printQualified:false,noNewGPU:true,
  output:path.relative(ROOT,output)
}));
