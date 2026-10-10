/**
 * G3.2 honest, CPU-only read-only benchmark coverage ledger.
 *
 * Inputs: SHA-locked original-source fixture manifest, already existing
 * local TripoSR G2 output/QA, and optionally explicitly selected LOCAL3D
 * completed-job directories. NEVER executes Python, CUDA or 3D inference.
 *
 * The ledger does not expose local paths, job IDs, image filenames or prompts.
 * Hash-verified logs are still not tamperproof hardware attestation.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

export const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sha=b=>createHash('sha256').update(b).digest('hex');
const HEX=/^[a-f0-9]{64}$/;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const FIXTURE=/^[0-9]{2}-[a-z0-9-]+$/;

const readJson=async (file,max=128*1024)=>{
  const st=await fs.lstat(file);
  if(!st.isFile()||st.isSymbolicLink()||st.size>max||st.size<2)
    throw new Error('BENCHMARK_INVALID_JSON_SOURCE');
  return JSON.parse(await fs.readFile(file,'utf8'));
};
const readBytes=async (file,max=64*1024*1024)=>{
  const st=await fs.lstat(file);
  if(!st.isFile()||st.isSymbolicLink()||st.size>max||st.size<10)
    throw new Error('BENCHMARK_INVALID_BINARY_SOURCE');
  return fs.readFile(file);
};

function requireSha(actual,expected,code){
  if(!HEX.test(expected||'')||sha(actual)!==expected)throw new Error(code);
}
function checkRun(qa, glb, inputSha, lock) {
  const p=qa?.provenance;
  if(qa?.schema!=='local3d.qa.v1'||
      qa.mode!=='REAL_INFERENCE'||qa.provider!=='TripoSR'||
      qa.realInference!==true||qa.simulation!==false||
      qa.printQualified!==false||qa.approvedForPrinter!==false||
      qa.geometryStatus!=='DRAFT'||qa.dimensions!=='UNCALIBRATED'||
      p?.sourceSha256!==inputSha||p?.artifactSha256!==sha(glb)||
      p?.weightsSha256!==lock.weights.sha256||
      p?.weightsRevision!==lock.weights.revision||
      p?.sourceCommit!==lock.source.commit||
      p?.coordinateSystem!=='Y_UP'||!Number.isFinite(p.elapsedSeconds)||
      p.elapsedSeconds<=0 || p.elapsedSeconds>240 ||
      !Number.isFinite(p.peakCudaReservedMiB) || p.peakCudaReservedMiB<=0 ||
      p.peakCudaReservedMiB>16384 ||
      !Number.isSafeInteger(p.faces)||p.faces<20||
      !Number.isSafeInteger(p.vertices)||p.vertices<20||
      typeof p.gpu!=='string'||p.gpu.length>128||
      !/NVIDIA/i.test(p.gpu)||/MOCK|FAKE|TEST/i.test(p.gpu))
    throw new Error('BENCHMARK_INVALID_REAL_PROVENANCE');
  if(glb.toString('ascii',0,4)!=='glTF'||
     glb.readUInt32LE(4)!==2||
     glb.readUInt32LE(8)!==glb.length)
    throw new Error('BENCHMARK_INVALID_GLB');
  let hostGpuTelemetry=null;
  if(p.hostGpuTelemetry!=null){
    const h=p.hostGpuTelemetry;
    const numeric=[
      h.initialUsedMiB,h.initialFreeMiB,h.initialUtilizationPercent,
      h.peakObservedUsedMiB,h.minimumObservedFreeMiB,
      h.peakObservedUtilizationPercent,h.runtimeSamples
    ];
    if(h.schema!=='local3d.g3.host-gpu-telemetry.v1'||
       h.measurement!=='NVIDIA_SMI_PERIODIC_SNAPSHOTS_NOT_EXCLUSIVE_VRAM_RESERVATION'||
       h.peakIsExact!==false||h.intervalMilliseconds!==1500||
       numeric.some(x=>!Number.isSafeInteger(x)||x<0)||
       h.runtimeSamples>300||
       h.initialUtilizationPercent>100||
       h.peakObservedUtilizationPercent>100||
       h.peakObservedUsedMiB<h.initialUsedMiB||
       h.minimumObservedFreeMiB>h.initialFreeMiB){
      throw new Error('BENCHMARK_INVALID_HOST_GPU_TELEMETRY');
    }
    hostGpuTelemetry={
      classification:'OBSERVED_SHARED_GPU_NOT_MODEL_EXCLUSIVE_MEMORY',
      initialFreeMiB:h.initialFreeMiB,
      initialUsedMiB:h.initialUsedMiB,
      peakObservedUsedMiB:h.peakObservedUsedMiB,
      minimumObservedFreeMiB:h.minimumObservedFreeMiB,
      peakObservedUtilizationPercent:h.peakObservedUtilizationPercent,
      runtimeSamples:h.runtimeSamples,
      intervalMilliseconds:h.intervalMilliseconds,
      peakIsExact:false
    };
  }
  return {
    providerId:'triposr-local',
    providerPinnedSourceCommit:p.sourceCommit,
    weightsRevision:p.weightsRevision,
    weightsSha256:p.weightsSha256,
    sourceSha256:inputSha,
    modelSha256:sha(glb),
    modelBytes:glb.length,
    elapsedSeconds:p.elapsedSeconds,
    peakCudaReservedMiB:p.peakCudaReservedMiB,
    ...(hostGpuTelemetry ? {hostGpuTelemetry} : {}),
    gpuName:p.gpu,
    vertices:p.vertices,
    triangles:p.faces,
    geometryUnits:'UNKNOWN_UNCALIBRATED',
    printQualified:false
  };
}
function checkGeometry(q,run) {
  if(q?.schema!=='local3d.g3.geometry-qa.v1'||
     q.modelSha256!==run.modelSha256||q.printQualified!==false||
     q.approvedForPrinter!==false||
     q.classification!=='DRAFT_REQUIRES_HUMAN_REVIEW'||
     q.totalTriangles!==run.triangles||
     !q.topology||typeof q.topology.everyObjectWatertight!=='boolean'||
     typeof q.topology.everyObjectPositiveVolume!=='boolean') {
    throw new Error('BENCHMARK_INVALID_GEOMETRY');
  }
  return {
    audit:'INDEPENDENT_OFFLINE_CPU_TOPOLOGY',
    objectCount:q.geometryObjectCount,
    connectedComponents:q.topology.componentCount,
    boundaryEdges:q.topology.boundaryEdges,
    nonManifoldEdges:q.topology.nonManifoldEdges,
    watertight:q.topology.everyObjectWatertight,
    positiveVolume:q.topology.everyObjectPositiveVolume,
    wallThickness:'NOT_TESTED',
    realWorldScale:'UNKNOWN_UNCALIBRATED',
    selfIntersections:'NOT_TESTED',
    printQualified:false
  };
}

export async function buildBenchmarkCoverage({root=ROOT,jobsDir=null,scoresDir=null}={}) {
  root=path.resolve(root);
  const manifest=await readJson(path.join(root,'benchmarks','g3','fixtures','manifest.json'));
  const lock=await readJson(path.join(root,'docs','TRIPOSR_SOURCE_LOCK.json'));
  if(manifest.schema!=='local3d.g3.fixture-catalog.v1'||
     manifest.fixtureCount!==9||manifest.fixtures?.length!==9||
     lock.schema!=='local3d.triposr.source-lock.v1')
    throw new Error('BENCHMARK_CATALOG_UNVERIFIED');
  const records=new Map();
  for(const entry of manifest.fixtures) {
    if(!FIXTURE.test(entry.id)||records.has(entry.id))
      throw new Error('BENCHMARK_DUPLICATE_OR_INVALID_FIXTURE');
    const original=entry.sourceRights==='PROJECT_ORIGINAL_PROCEDURAL';
    if(!original&&entry.sourceRights!=='UPSTREAM_TRIPOSR_MIT_SAMPLE')
      throw new Error('BENCHMARK_UNREVIEWED_RIGHTS');
    const source=path.join(original?path.join(root,'benchmarks','g3','fixtures'):root,entry.files.image);
    const mask=path.join(original?path.join(root,'benchmarks','g3','fixtures'):root,entry.files.mask);
    requireSha(await readBytes(source,8*1024*1024),entry.imageSha256,'BENCHMARK_SOURCE_CHANGED');
    requireSha(await readBytes(mask,8*1024*1024),entry.maskSha256,'BENCHMARK_MASK_CHANGED');
    if(original){
      const ground=path.join(root,'benchmarks','g3','fixtures',entry.files.groundTruth);
      requireSha(await readBytes(ground),entry.groundTruthSha256,'BENCHMARK_GROUND_TRUTH_CHANGED');
    }else if(entry.files.groundTruth!==null||entry.groundTruthSha256!==null)
      throw new Error('BENCHMARK_UPSTREAM_GROUND_TRUTH_FABRICATED');
    records.set(entry.id,{
      fixtureId:entry.id,category:entry.category,sourceRights:entry.sourceRights,
      sourceSha256:entry.imageSha256,
      sourceReference3d:original?'ORIGINAL_SYNTHETIC_SCENE_NOT_MODEL_PREDICTION':'NOT_AVAILABLE',
      runs:[]
    });
  }
  const baselineId='09-upstream-chair';
  const baseline=records.get(baselineId);
  if(!baseline)throw new Error('BENCHMARK_CHAIR_MISSING');
  const ev=path.join(root,'docs','evidence');
  const baselineBytes=await readBytes(path.join(ev,'g2-app','real-app-output.glb'));
  const baselineQa=await readJson(path.join(ev,'g2-app','qa-report.json'));
  const e2e=await readJson(path.join(ev,'g2-app','e2e-report.json'),256*1024);
  if(e2e?.success!==true||e2e?.mode!=='REAL_LOCAL_INFERENCE'||
     e2e?.trigger!=='MANUAL_ONCE'||e2e.outputHash!==sha(baselineBytes)||
     e2e.jobId!==baselineQa.jobId||
     e2e.browser!=='REAL_CHROME_GLTF_RENDER_PASS')
    throw new Error('BENCHMARK_BASELINE_E2E_UNVERIFIED');
  const baselineRun=checkRun(baselineQa,baselineBytes,baseline.sourceSha256,lock);
  baselineRun.evidenceLane='G2_PREVIOUS_REAL_LOCAL_API_CHROME_PROOF';
  baselineRun.geometry=checkGeometry(
    await readJson(path.join(ev,'g3','chair-geometry.json')),baselineRun);
  const silhouette=await readJson(path.join(ev,'g3','chair-silhouette-exploratory.json'));
  if(silhouette.schema!=='local3d.g3.silhouette-diagnostic.v1'||
     silhouette.fixtureId!==baselineId||
     silhouette.modelSha256!==baselineRun.modelSha256||
     silhouette.imageSha256!==baseline.sourceSha256||
     silhouette.evaluation!=='pose_search'||silhouette.testedViews!==24||
     !Number.isFinite(silhouette.bestProjectedView?.silhouetteIoU)||
     silhouette.printQualified!==false)
    throw new Error('BENCHMARK_BASELINE_SILHOUETTE_UNVERIFIED');
  baselineRun.silhouette={
    status:'POST_HOC_BEST_OF_24_VIEWS_EXPLORATORY_ONLY',
    bestIoU:silhouette.bestProjectedView.silhouetteIoU,
    testedViews:silhouette.testedViews,
    calibratedCamera:false,
    independentGroundTruth3d:false
  };
  baseline.runs.push(baselineRun);

  let excludedManualJobs=0;
  let excludedPrivateScores=0;
  if(jobsDir){
    const entries=await fs.readdir(jobsDir,{withFileTypes:true});
    if(entries.length>1000)throw new Error('BENCHMARK_TOO_MANY_LOCAL_JOBS');
    for(const folder of entries.sort((a,b)=>a.name.localeCompare(b.name))){
      if(!folder.isDirectory()||!UUID.test(folder.name))continue;
      const dir=path.join(jobsDir,folder.name);
      try{
        const job=await readJson(path.join(dir,'job.json'));
        if(job.id!==folder.name||job.status!=='completed'||
          job.providerId!=='triposr-local'||job.simulation!==false||
          !Array.isArray(job.assets))throw new Error('BENCHMARK_NOT_COMPLETE');
        const sourceAsset=job.assets.find(x=>x.id==='source-image');
        const modelAsset=job.assets.find(x=>x.id==='preview-glb');
        const qaAsset=job.assets.find(x=>x.id==='qa-report');
        if(!sourceAsset||!modelAsset||!qaAsset)throw new Error('BENCHMARK_MANIFEST_MISSING_ASSET');
        const entry=[...records.values()].find(x=>x.sourceSha256===sourceAsset.sha256);
        if(!entry)throw new Error('BENCHMARK_SOURCE_NOT_IN_LICENSED_CATALOG');
        const extension=job.source?.mime==='image/png'?'.png':
          job.source?.mime==='image/jpeg'?'.jpg':
          job.source?.mime==='image/webp'?'.webp':null;
        if(!extension)throw new Error('BENCHMARK_BAD_SOURCE_MIME');
        const [input,output,reportBytes]=await Promise.all([
          readBytes(path.join(dir,'input'+extension),8*1024*1024),
          readBytes(path.join(dir,'output.glb')),
          readBytes(path.join(dir,'qa-report.json'),256*1024)
        ]);
        for(const [bytes,asset] of [[input,sourceAsset],[output,modelAsset],[reportBytes,qaAsset]]){
          requireSha(bytes,asset.sha256,'BENCHMARK_MANIFEST_ASSET_CHANGED');
          if(bytes.length!==asset.bytes)throw new Error('BENCHMARK_MANIFEST_ASSET_BYTES_CHANGED');
        }
        const qa=JSON.parse(reportBytes.toString('utf8'));
        const run=checkRun(qa,output,entry.sourceSha256,lock);
        run.evidenceLane='LOCAL_COMPLETED_JOB_HASH_MATCHED_NOT_EXTERNAL_GPU_ATTESTATION';
        const gasset=job.assets.find(x=>x.id==='geometry-qa');
        if(gasset){
          const gb=await readBytes(path.join(dir,'geometry-qa.json'),256*1024);
          requireSha(gb,gasset.sha256,'BENCHMARK_GEOMETRY_MANIFEST_CHANGED');
          if(gb.length!==gasset.bytes)throw new Error('BENCHMARK_GEOMETRY_BYTES_CHANGED');
          run.geometry=checkGeometry(JSON.parse(gb.toString('utf8')),run);
        }else run.geometry={audit:'NOT_RUN'};
        run.silhouette={status:'NOT_SCORED',bestIoU:null};
        if(scoresDir) {
          const scoreFile=path.join(scoresDir,run.modelSha256+'-'+entry.fixtureId+'.json');
          const stat=await fs.lstat(scoreFile).catch(e=>{
            if(e.code==='ENOENT')return null;throw e;
          });
          if(stat) {
            try{
              const score=await readJson(scoreFile,64*1024);
              const shape=score.shape;
              const valid=(
                score.schema==='local3d.g3.manual-job-shape-evaluation.v1' &&
                score.fixtureId===entry.fixtureId &&
                score.imageSha256===entry.sourceSha256 &&
                score.modelSha256===run.modelSha256 &&
                score.candidateEvidenceLane==='HASH_LINKED_LOCAL_COMPLETED_JOB_NOT_INDEPENDENT_GPU_ATTESTATION' &&
                score.printQualified===false &&
                score.approvedForPrinter===false &&
                score.modelInferenceExecuted===false &&
                ((score.hasOriginalGroundTruth3d===true &&
                  score.evaluation==='POST_HOC_NORMALIZED_3D_SHAPE_DIAGNOSTIC' &&
                  shape?.candidateSha256===run.modelSha256 &&
                  shape?.referenceSelfSimilarityOnly===false &&
                  shape?.sameInputBinary===false &&
                  shape?.scalePolicy==='EACH_AABB_DIAGONAL_NORMALIZED_TO_ONE_INDEPENDENTLY' &&
                  shape?.selectionPolicy==='MIN_CHAMFER_OVER_POST_HOC_YAW_SEARCH' &&
                  Number.isFinite(shape.bestView?.chamferL1Normalized) &&
                  shape.bestView.chamferL1Normalized>=0 &&
                  Number.isFinite(shape.bestView?.f1At2Pct) &&
                  shape.bestView.f1At2Pct>=0 && shape.bestView.f1At2Pct<=1) ||
                (score.hasOriginalGroundTruth3d===false &&
                  score.evaluation==='NO_GROUND_TRUTH_3D' && shape===null))
              );
              if(!valid)throw new Error('Invalid private score provenance');
              run.originalSyntheticReferenceComparison=shape?
                {
                  classification:'POST_HOC_NORMALIZED_3D_SHAPE_DIAGNOSTIC',
                  chamferL1Normalized:shape.bestView.chamferL1Normalized,
                  f1At2Pct:shape.bestView.f1At2Pct,
                  bestYawDegrees:shape.bestView.candidateYawDegrees,
                  independentlyAttestedGpu:false,
                  printQualified:false
                }:
                {classification:'NO_ORIGINAL_SOURCE_GROUND_TRUTH_3D',printQualified:false};
            }catch{excludedPrivateScores++;}
          }
        }
        if(!entry.runs.some(x=>x.modelSha256===run.modelSha256)){
          entry.runs.push(run);
        }
      }catch{
        // Unknown, private or unverified job: never include user input names,
        // prompts, job IDs, paths, or artifacts in published ledger.
        excludedManualJobs++;
      }
    }
  }
  const cases=[...records.values()];
  const completed=cases.filter(x=>x.runs.length>0).length;
  return {
    schema:'local3d.g3.benchmark-coverage.v1',
    source:'SHA_LOCKED_NINE_REFERENCE_FIXTURES',
    modelInferenceExecuted:false,
    originalSyntheticSources:8,
    upstreamLicensedSourceCount:1,
    fixtureCount:cases.length,
    fixturesWithRecordedOutput:completed,
    fixturesWithPreviouslyObservedE2ERun:cases.filter(x=>x.runs.some(r=>r.evidenceLane==='G2_PREVIOUS_REAL_LOCAL_API_CHROME_PROOF')).length,
    fixturesAwaitingRecordedOutput:cases.length-completed,
    excludedUnverifiedLocalJobs:excludedManualJobs,
    excludedInvalidPrivateScores:excludedPrivateScores,
    providersRepresented:['triposr-local'],
    reportingCaveats:[
      'Existing G2 chair is a single previous licensed true-local run, NOT a multi-image benchmark',
      'Original synthetic ground-truth GLBs are the SOURCE scenes, never AI-generated predictions',
      'Searched-view silhouette IoU is a post-hoc exploratory metric, not known-camera accuracy',
      'PyTorch peak reserved VRAM is NOT total GPU utilization or an exclusive GPU reservation',
      'SHA-linked local job records are not independent hardware-execution attestations',
      'No known physical unit, wall-thickness, structural-strength or printing qualification',
      'Private candidate-vs-original-3D metrics, when present, are post-hoc normalized diagnostics, not fixed-camera or physical scale measurements',
      'No external engine was installed or benchmarked in this coverage report'
    ],
    printQualified:false,
    fixtureResults:cases.map(x=>({
      ...x,coverage:x.runs.length?(
        x.runs.some(r=>r.evidenceLane==='G2_PREVIOUS_REAL_LOCAL_API_CHROME_PROOF')?
          'PREVIOUSLY_OBSERVED_REAL_E2E_OUTPUT':'HASHED_LOCAL_JOB_NO_INDEPENDENT_GPU_ATTESTATION'
      ):'AWAITING_EXPLICIT_MANUAL_GPU_RUN',
      runs:x.runs.sort((a,b)=>a.modelSha256.localeCompare(b.modelSha256))
    }))
  };
}
