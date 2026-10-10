/** G3.12 sanitized SHA-pinned *existing* model spatial-index proximity evidence.
 * Validates private completed job/assets and 4 immutable CPU-only scans.
 * Never publishes local IDs, face/vertex examples, paths or private GLB.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const PRIVATE=path.join(ROOT,'runtime','qa','g3','orb-01-positive-winding');
const E=path.join(ROOT,'docs','evidence','g3');
const SHA={
  input:'9cb2f41de1b0239570068b055dc06bf941491559e11942b5bbc5757adb3d886a',
  original:'f37a812bc4414ddee34bcb19d2e7535f25d219a3731c14f2dcc89c2c7ba030e2',
  corrected:'ab2e5aeb55598624209eeca3e700abef93a69a52886c63ecad6a840e62d8d68f',
  reference:'c8834b2668210e58a73ff8b2ab3bcf2d0bc5d2df9a09b3dd0313b425b3664749',
  chair:'48ee912229ad73fcbda1a6b455dbcc39d396bdf2c752ccabc90a29097b09b6ec'
};
const ensure=(v,why)=>{if(!v)throw new Error('G3_12_PROVENANCE_REFUSED: '+why)};
const digest=v=>createHash('sha256').update(v).digest('hex');
async function raw(file,max=64*1024*1024){
  const st=await fs.lstat(file);
  ensure(st.isFile()&&!st.isSymbolicLink()&&st.size>0&&st.size<=max,'INVALID_INPUT_OR_LINK');
  return fs.readFile(file);
}
const json=async f=>JSON.parse((await raw(f,512*1024)).toString('utf8'));
const args=process.argv.slice(2);
ensure(args.length===2&&args[0]==='--job-id'&&
  /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(args[1]),
  'COMPLETED_PRIVATE_JOB_ID_REQUIRED');
const folder=path.join(ROOT,'runtime','data-g2-manual','jobs',args[1]);
ensure((await fs.realpath(folder)).toLowerCase()===path.resolve(folder).toLowerCase(),
  'SYMLINKED_JOB_ROOT');
const job=await json(path.join(folder,'job.json'));
ensure(job.id===args[1]&&job.status==='completed'&&job.simulation===false&&
  job.providerId==='triposr-local'&&Array.isArray(job.assets),'AUTHENTIC_REAL_JOB_REQUIRED');
const catalog=await json(path.join(ROOT,'benchmarks','g3','fixtures','manifest.json'));
const fixture=catalog.fixtures.find(x=>x.id==='01-orb-alpha');
ensure(fixture?.sourceRights==='PROJECT_ORIGINAL_PROCEDURAL'&&
  fixture?.imageSha256===SHA.input&&fixture?.groundTruthSha256===SHA.reference,
  'LICENSED_FIXTURE_RIGHTS_OR_SHA_CHANGED');
for(const [id,name,expected] of [
  ['source-image','input.png',SHA.input],
  ['preview-glb','output.glb',SHA.original],
  ['qa-report','qa-report.json',null],
  ['geometry-qa','geometry-qa.json',null],
  ['benchmark-shape','benchmark-shape.json',null]
]){
  const blob=await raw(path.join(folder,name));
  const a=job.assets.find(x=>x.id===id);
  ensure(a?.sha256===digest(blob)&&a?.bytes===blob.length,'JOB_ASSET_CHANGED_'+id);
  if(expected)ensure(digest(blob)===expected,'PINNED_MODEL_OR_SOURCE_'+id);
}
for(const [id,file] of Object.entries({
  corrected:path.join(PRIVATE,'orb-positive-winding.glb'),
  reference:path.join(ROOT,'benchmarks','g3','fixtures','01-orb-alpha','ground-truth.glb'),
  chair:path.join(E,'chair-positive-winding.glb')
})){
  ensure(digest(await raw(file))===SHA[id],'OTHER_PINNED_MODEL_SHA_'+id);
}
const old=await json(path.join(E,'orb-01-g311-edge-coplanar-screen.json'));
ensure(old.priorRealTripoSRModelSha256===SHA.original&&
  old.priorCPUOrientationDerivativeSha256===SHA.corrected&&
  old.proceduralGroundTruthSha256===SHA.reference&&
  old.originalRealTripoSR.indexedSharedEdgeFacePairs===60528&&
  old.coincidentDifferentIndicesStillUntested===true&&
  old.printQualified===false,'PRIOR_G3_11_SOURCE_EVIDENCE_CHANGED');

const data={};
for(const key of ['original','corrected','reference','chair']){
  const v=await json(path.join(PRIVATE,key+'-spatial-index.json'));
  ensure(v.schema==='local3d.g3.12.spatial-index-proximity-screen.v1'&&
    v.modelSha256===SHA[key]&&v.completeDifferentIndexProximityCensus===true&&
    v.incompleteReason===null&&v.proximityPairsEnumerated===
      v.exactCoincidentDifferentIndexPairs+v.nearCoincidentDifferentIndexPairs&&
    v.acrossIndexedComponentsPairs===
      v.acrossIndexedComponentsExactPairs+v.acrossIndexedComponentsNearPairs&&
    v.proximityPairsEnumerated===0&&v.acrossIndexedComponentsPairs===0&&
    v.indexedConnectedComponents===1&&v.privateExampleVertexPairs.length===0&&
    v.globalSelfIntersectionFreeCertified===false&&
    v.disconnectedShellsContactFreeCertified===false&&
    v.absenceCannotExcludeFaceInteriorShellContact===true&&
    v.printQualified===false&&v.approvedForPrinter===false&&
    v.fabricationAction==='NONE'&&v.newAiInference===false,
    'INCOMPLETE_OR_UNSAFE_PRIVATE_SPATIAL_CENSUS_'+key);
  data[key]=v;
}
ensure(data.original.vertexCount===20178&&data.original.triangleCount===40352&&
  data.corrected.vertexCount===20178&&data.corrected.triangleCount===40352&&
  data.reference.vertexCount===642&&data.reference.triangleCount===1280&&
  data.chair.vertexCount===9986&&data.chair.triangleCount===19972,
  'EXPECTED_SOURCE_MESH_COUNTS_CHANGED');
const stripped=x=>Object.fromEntries(Object.entries(x).filter(
  ([key])=>!['modelSha256','modelBytes','signedVolumeArbitraryUnitsCubed'].includes(key)
));
ensure(JSON.stringify(stripped(data.original))===JSON.stringify(stripped(data.corrected)),
  'WINDING_COPY_SPATIAL_DATA_CHANGED');

const safe=x=>({
  vertexCount:x.vertexCount,triangleCount:x.triangleCount,
  indexedConnectedComponents:x.indexedConnectedComponents,
  completedAllDifferentIndexVertexPairCandidates:x.completeDifferentIndexProximityCensus,
  pairsWithinRelativeTolerance:x.proximityPairsEnumerated,
  exactlyEqualXYZDifferentIndexPairs:x.exactCoincidentDifferentIndexPairs,
  nearButNotEqualXYZDifferentIndexPairs:x.nearCoincidentDifferentIndexPairs,
  crossIndexedComponentVertexProximityPairs:x.acrossIndexedComponentsPairs,
  componentPairsWithVertexProximity:x.componentPairsWithVertexProximity,
  toleranceRelativeToBoundingDiagonal:x.nearToleranceRelativeToDiagonal,
  toleranceArbitraryModelUnits:x.nearToleranceArbitraryUnits,
  numericStatus:x.status,
  certifiesNoShellContacts:false,certifiesNoSelfIntersections:false
});
const result={
  schema:'local3d.g3.12.existing-model-spatial-index-proximity.v1',
  fixtureId:'01-orb-alpha',
  rights:'PROJECT_ORIGINAL_PROCEDURAL',
  fixtureImageSha256:SHA.input,
  existingRealTripoSRModelSha256:SHA.original,
  unmodifiedSurfaceWindingOnlyCopySha256:SHA.corrected,
  knownOriginalGroundTruthSha256:SHA.reference,
  historicalRealChairDerivativeSha256:SHA.chair,
  licensedModelSource:'PREVIOUSLY_COMPLETED_MANUAL_GPU_JOB_ONLY',
  additionalAiInferenceThisMilestone:false,
  originalRealTripoSR:safe(data.original),
  unchangedWindingOnlyCopy:safe(data.corrected),
  knownProceduralSource:safe(data.reference),
  historicalRealChairCopy:safe(data.chair),
  originalAndDerivativeIdenticalSpatialRiskIndicators:true,
  diagnosis:'DIFFERENT_INDEX_VERTEX_XYZ_COINCIDENCE_AND_RELATIVE_NEARNESS_CPU',
  crossIndexedComponentProximityIsOnlyAVertexBasedTouchingShellCandidate:true,
  indexedAdjacencyIsNotPhysicalSpatialCoincidence:true,
  distinctIndexExactlyCoincidentVerticesMayBeLegitimateSeams:true,
  zeroVertexCandidatesDoNotExcludeTriangleInteriorIntersections:true,
  completeGlobalRobustSelfIntersectionTest:false,
  faceInteriorShellContactTest:'NOT_PERFORMED',
  physicalMillimeterScale:'UNKNOWN_UNCALIBRATED',
  wallThickness:'NOT_TESTED',
  materialStrength:'NOT_TESTED',
  noAutomaticVertexWeldingOrGeometryRepair:true,
  stillDraft:true,printQualified:false,approvedForPrinter:false,
  fabricationAction:'NONE',privateJobOrVertexIndicesNotPublished:true
};
const payload=JSON.stringify(result,null,2)+'\n';
ensure(!/[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}/i.test(payload),
  'PRIVATE_JOB_ID_WOULD_BE_LEAKED');
ensure(!/runtime[/\\]|D:[/\\]|privateExampleVertexPairs|customer|prompt/i.test(payload),
  'PRIVATE_FILENAME_OR_DETAIL_WOULD_BE_LEAKED');
const out=path.join(E,'orb-01-g312-spatial-index-proximity.json');
const existing=await fs.readFile(out,'utf8').catch(err=>{
  if(err.code==='ENOENT')return null;throw err;
});
ensure(existing===null||existing===payload,'REFUSING_OVERWRITE_EXISTING_DIFFERENT_PUBLIC_EVIDENCE');
if(existing===null)await fs.writeFile(out,payload,{flag:'wx'});
console.log('G3_12_SPATIAL_SOURCE_LOCKED_PUBLIC_EVIDENCE_PASS '+JSON.stringify({
  actualRealModelVertexCount:data.original.vertexCount,
  realOrbExactDifferentIndexPairs:data.original.exactCoincidentDifferentIndexPairs,
  realOrbNearDifferentIndexPairs:data.original.nearCoincidentDifferentIndexPairs,
  allFourModelSourcesVerified:true,allFourCpuCensusesComplete:true,
  gpuInference:false,printQualified:false,
  output:path.relative(ROOT,out)
}));
