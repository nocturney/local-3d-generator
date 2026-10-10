/** G3.11 SHA-verifiable sanitized *existing-model* edge coplanarity evidence.
 * No new inference, read source images only to validate SHA, no printer/cloud.
 * Private per-face examples and UUID are never included in public JSON.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const PRIVATE=path.join(ROOT,'runtime','qa','g3','orb-01-positive-winding');
const PUBLIC=path.join(ROOT,'docs','evidence','g3');
const SHA={
  input:'9cb2f41de1b0239570068b055dc06bf941491559e11942b5bbc5757adb3d886a',
  original:'f37a812bc4414ddee34bcb19d2e7535f25d219a3731c14f2dcc89c2c7ba030e2',
  corrected:'ab2e5aeb55598624209eeca3e700abef93a69a52886c63ecad6a840e62d8d68f',
  reference:'c8834b2668210e58a73ff8b2ab3bcf2d0bc5d2df9a09b3dd0313b425b3664749',
  chair:'48ee912229ad73fcbda1a6b455dbcc39d396bdf2c752ccabc90a29097b09b6ec'
};
const ensure=(value,why)=>{if(!value)throw new Error('G3_11_PROVENANCE_REFUSED: '+why)};
const digest=b=>createHash('sha256').update(b).digest('hex');
async function raw(file,max=64*1024*1024){
  const st=await fs.lstat(file);
  ensure(st.isFile()&&!st.isSymbolicLink()&&st.size>0&&st.size<=max,
    'INVALID_LOCAL_INPUT_OR_LINK');
  return fs.readFile(file);
}
const json=async file=>JSON.parse((await raw(file,512*1024)).toString('utf8'));
const args=process.argv.slice(2);
ensure(args.length===2&&args[0]==='--job-id'&&
  /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(args[1]),
  'PREVIOUSLY_COMPLETED_JOB_UUID_REQUIRED');
const folder=path.join(ROOT,'runtime','data-g2-manual','jobs',args[1]);
ensure((await fs.realpath(folder)).toLowerCase()===path.resolve(folder).toLowerCase(),
  'NO_SYMLINKED_JOB_FOLDER');
const job=await json(path.join(folder,'job.json'));
ensure(job.id===args[1]&&job.status==='completed'&&
  job.providerId==='triposr-local'&&job.simulation===false&&
  Array.isArray(job.assets),'NOT_GENUINE_COMPLETED_JOB');
const catalog=await json(path.join(ROOT,'benchmarks','g3','fixtures','manifest.json'));
const reference=catalog.fixtures.find(x=>x.id==='01-orb-alpha');
ensure(reference?.sourceRights==='PROJECT_ORIGINAL_PROCEDURAL'&&
  reference?.imageSha256===SHA.input&&
  reference?.groundTruthSha256===SHA.reference,'LICENSED_SOURCE_SHA_CHANGED');
for(const [id,file,sha] of [
  ['source-image','input.png',SHA.input],
  ['preview-glb','output.glb',SHA.original],
  ['qa-report','qa-report.json',null],
  ['geometry-qa','geometry-qa.json',null],
  ['benchmark-shape','benchmark-shape.json',null]
]){
  const blob=await raw(path.join(folder,file));
  const recorded=job.assets.find(x=>x.id===id);
  ensure(recorded?.sha256===digest(blob)&&recorded?.bytes===blob.length,
    'REAL_JOB_ASSET_'+id);
  if(sha)ensure(digest(blob)===sha,'ORIGINAL_REAL_FIXTURE_CHANGED_'+id);
}
for(const [kind,file] of Object.entries({
  corrected:path.join(PRIVATE,'orb-positive-winding.glb'),
  reference:path.join(ROOT,'benchmarks','g3','fixtures','01-orb-alpha','ground-truth.glb'),
  chair:path.join(PUBLIC,'chair-positive-winding.glb')
})){
  ensure(digest(await raw(file))===SHA[kind],'MODEL_SHA_CHANGED_'+kind);
}
const older39=await json(path.join(PUBLIC,'orb-01-g39-adjacent-angles.json'));
const older310=await json(path.join(PUBLIC,'orb-01-g310-shared-vertex-ray-screen.json'));
ensure(older39.previouslyGeneratedRealModelSha256===SHA.original&&
  older39.windingOnlyDerivativeSha256===SHA.corrected&&
  older39.originalRealTripoSR.indexedEdgeAdjacentPairs===60528&&
  older39.copyOnlyCorrectedTripoSR.indexedEdgeAdjacentPairs===60528&&
  older39.printQualified===false&&
  older310.originalRealTripoSRModelSha256===SHA.original&&
  older310.unchangedWindingOnlyCopySha256===SHA.corrected&&
  older310.originalRealTripoSR.vertexOnlyPairsExamined===190860&&
  older310.selfIntersectionFreeCertified===false,
  'PREVIOUS_SAFE_G3_9_G3_10_EVIDENCE_CHANGED');
const data={};
for(const [kind,name] of Object.entries({
  original:'original-edge-backfold.json',
  corrected:'corrected-edge-backfold.json',
  reference:'reference-edge-backfold.json',
  chair:'chair-edge-backfold.json'
})){
  const value=await json(path.join(PRIVATE,name));
  ensure(value.schema==='local3d.g3.11.edge-coplanar-backfold-screen.v1'&&
    value.modelSha256===SHA[kind]&&
    value.indexedSharedEdgeFacePairs===value.faceCount*3/2&&
    value.allProvidedIndexedSharedEdgePairsExamined===true&&
    value.possibleCoplanarSameSideAreaOverlapPairs===0&&
    value.nearAntiparallelNormalsAtOrAbove175Degrees===0&&
    value.backturnPairsSameSideAbove150Degrees===0&&
    value.nearCoplanarBorderlineLateralSidePairsUnresolved===0&&
    value.edgeSharedGeometryCertifiedNoBackfold===false&&
    value.completeMeshSelfIntersectionFreeCertified===false&&
    value.printQualified===false&&value.newAiInference===false,
    'G3_11_LOCAL_DIAGNOSTIC_MISMATCH_'+kind);
  data[kind]=value;
}
ensure(data.original.indexedSharedEdgeFacePairs===60528&&
  data.corrected.indexedSharedEdgeFacePairs===60528&&
  data.reference.indexedSharedEdgeFacePairs===1920&&
  data.chair.indexedSharedEdgeFacePairs===29958,
  'KNOWN_INDEXED_SHARED_EDGE_COUNTS_MISMATCH');
for(const key of [
  'possibleCoplanarSameSideAreaOverlapPairs',
  'nearAntiparallelNormalsAtOrAbove175Degrees',
  'backturnPairsSameSideAbove150Degrees',
  'nearCoplanarBorderlineLateralSidePairsUnresolved',
  'facePairsWithThirdVerticesOnSameLateralSide',
  'facePairsWithThirdVerticesOnOppositeLateralSides',
  'maxFaceNormalAngleDegrees'
]){
  ensure(data.original[key]===data.corrected[key],
    'COPY_ONLY_WINDING_CHANGED_EDGE_GEOMETRY_'+key);
}
const safe=x=>({
  triangleCount:x.faceCount,
  indexedSharedEdgeFacePairs:x.indexedSharedEdgeFacePairs,
  everyIndexedSharedEdgePairExamined:x.allProvidedIndexedSharedEdgePairsExamined,
  potentialCoplanarSameSideOverlapPairs:x.possibleCoplanarSameSideAreaOverlapPairs,
  nearAntiparallelOver175Pairs:x.nearAntiparallelNormalsAtOrAbove175Degrees,
  backturnSameSideOver150Pairs:x.backturnPairsSameSideAbove150Degrees,
  nearCoplanarBorderlineSideUnresolvedPairs:x.nearCoplanarBorderlineLateralSidePairsUnresolved,
  maxAngleDegrees:x.maxFaceNormalAngleDegrees,
  canCertifyNoEdgeFold:false,
  numericalToleranceInOriginalArbitraryUnits:x.coplanarityToleranceArbitraryUnits
});
const report={
  schema:'local3d.g3.11.real-orb-shared-edge-coplanar-risk.v1',
  fixtureId:'01-orb-alpha',
  sourceRights:'PROJECT_ORIGINAL_PROCEDURAL',
  originalImageSha256:SHA.input,
  priorRealTripoSRModelSha256:SHA.original,
  priorCPUOrientationDerivativeSha256:SHA.corrected,
  proceduralGroundTruthSha256:SHA.reference,
  earlierRealChairDerivativeSha256:SHA.chair,
  modelSource:'PREVIOUSLY_COMPLETED_EXPLICITLY_APPROVED_REAL_TRIPOSR_JOB',
  additionalAiInferenceThisMilestone:false,
  originalRealTripoSR:safe(data.original),
  sameSurfaceWindingOnlyCopy:safe(data.corrected),
  originalProceduralGroundTruth:safe(data.reference),
  earlierRealChairDerivative:safe(data.chair),
  originalVsCopyEdgeGeometryIndicatorsIdentical:true,
  method:'SHARED_INDEXED_EDGE_NEAR_COPLANAR_AND_SAME_SIDE_SURFACE_BACKFOLD_SCREEN',
  criterion:'THIRD_VERTICES_SAME_SIDE_OF_FULL_SHARED_EDGE_AND_TRIANGLES_COPLANAR_AND_NORMALS_ANTIPARALLEL',
  alreadySharedEdgeItselfIsNormalMeshContact:true,
  sharpAnglesCanBeIntentionalAndNotIndicateCollision:true,
  differentPlaneTrianglesCanOnlyMeetOnTheirSharedSupportLineInExactGeometry:true,
  notExactRobustIntersectionOrSelfIntersectionCertificate:true,
  coincidentDifferentIndicesStillUntested:true,
  physicalMillimeterScale:'UNKNOWN_UNCALIBRATED',
  wallThickness:'NOT_TESTED',
  supports:'NOT_TESTED',
  materialStrength:'NOT_TESTED',
  printQualified:false,approvedForPrinter:false,
  fabricationAction:'NONE',
  originalPrivateModelsAndJobIdsNotPublished:true
};
const out=path.join(PUBLIC,'orb-01-g311-edge-coplanar-screen.json');
const expected=JSON.stringify(report,null,2)+'\n';
const existing=await fs.readFile(out,'utf8').catch(e=>{
  if(e.code==='ENOENT')return null;throw e;
});
ensure(existing===null||existing===expected,'EXISTING_EVIDENCE_DIFFERS');
if(existing===null)await fs.writeFile(out,expected,{flag:'wx'});
console.log('G3_11_EDGE_COPLANAR_SHA_PROOF_PASS '+JSON.stringify({
  realOrbSharedEdges:data.original.indexedSharedEdgeFacePairs,
  realOrbPotentialCoplanarBackfolds:data.original.possibleCoplanarSameSideAreaOverlapPairs,
  detectedSuspiciousNearAntiPairs:data.original.nearAntiparallelNormalsAtOrAbove175Degrees,
  sourceAndCopyConsistent:true,
  newGpuInference:false,
  printQualified:false,
  output:path.relative(ROOT,out)
}));
