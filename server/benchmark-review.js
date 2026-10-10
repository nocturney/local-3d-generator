/**
 * Explicit, bounded, offline CPU benchmarking of a completed job, no GPU.
 * No client-supplied paths, no print release, no weights/model execution.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';

const execAsync = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const PYTHON = path.join(ROOT,'runtime','engines','triposr','venv','Scripts','python.exe');
const SCRIPT = path.join(ROOT,'engines','quality','job_review.py');
const hash = b => createHash('sha256').update(b).digest('hex');
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;

export function createBenchmarkReviewer(overrides={}){
  const python=overrides.python||PYTHON;
  const script=overrides.script||SCRIPT;
  return async function benchmarkReview({jobsRoot,jobId,outputFile,sourceSha,modelSha}){
    if(process.platform!=='win32')throw new Error('G3.4 CPU reviewer requires pinned Windows environment');
    if(!UUID.test(jobId)||!/^[a-f0-9]{64}$/.test(sourceSha||'')||
       !/^[a-f0-9]{64}$/.test(modelSha||'')){
      throw new Error('G3.4 unverified benchmark identifiers');
    }
    const jobs=path.resolve(jobsRoot);
    const job=path.join(jobs,jobId);
    const output=path.resolve(outputFile);
    const trustedRuntime=path.join(ROOT,'runtime')+path.sep;
    if(!jobs.startsWith(trustedRuntime)||path.basename(jobs)!=='jobs'||
       path.dirname(output)!==job||path.basename(output)!=='benchmark-shape.json'){
      throw new Error('G3.4 job benchmark cannot access arbitrary filesystem paths');
    }
    for(const executable of [python,script]){
      const st=await fs.lstat(executable);
      if(!st.isFile()||st.isSymbolicLink())throw new Error('G3.4 pinned CPU runtime not available');
    }
    const {stdout}=await execAsync(python,[script,'--jobs-root',jobs,'--job-id',jobId,'--out',output],{
      timeout:45000,windowsHide:true,maxBuffer:8192,
      env:{
        ...process.env,
        CUDA_VISIBLE_DEVICES:'-1',
        HF_HUB_OFFLINE:'1',
        TRANSFORMERS_OFFLINE:'1',
        HF_HUB_DISABLE_TELEMETRY:'1',
        PYTHONNOUSERSITE:'1'
      }
    });
    if(!stdout.includes('G3_CPU_BENCHMARK_REVIEW_DRAFT ')){
      throw new Error('G3.4 CPU reviewer completion could not be verified');
    }
    const stat=await fs.lstat(output);
    if(!stat.isFile()||stat.isSymbolicLink()||stat.size>128*1024||
       stat.size<50)throw new Error('G3.4 CPU report file was not safely created');
    const raw=await fs.readFile(output);
    const report=JSON.parse(raw.toString('utf8'));
    if(report.schema!=='local3d.g3.manual-job-shape-evaluation.v1'||
       report.imageSha256!==sourceSha||report.modelSha256!==modelSha||
       report.candidateEvidenceLane!=='HASH_LINKED_LOCAL_COMPLETED_JOB_NOT_INDEPENDENT_GPU_ATTESTATION'||
       report.printQualified!==false||report.approvedForPrinter!==false||
       report.modelInferenceExecuted!==false||report.fabricationAction!=='NONE'||
       !['NO_GROUND_TRUTH_3D','POST_HOC_NORMALIZED_3D_SHAPE_DIAGNOSTIC'].includes(report.evaluation)||
       typeof report.fixtureId!=='string'){
      throw new Error('G3.4 CPU report provenance/qualification mismatch');
    }
    const gt=report.evaluation==='POST_HOC_NORMALIZED_3D_SHAPE_DIAGNOSTIC';
    if(gt !== (report.hasOriginalGroundTruth3d===true)||
       (gt && (
         !report.shape||report.shape.candidateSha256!==modelSha||
         report.shape.referenceSelfSimilarityOnly!==false||
         report.shape.sameInputBinary!==false||
         report.shape.measuresAbsoluteScale!==false||
         report.shape.selectionPolicy!=='MIN_CHAMFER_OVER_POST_HOC_YAW_SEARCH'||
         !Number.isFinite(report.shape.bestView?.chamferL1Normalized)||
         report.shape.bestView.chamferL1Normalized<0)) ||
       (!gt && report.shape!==null)){
      throw new Error('G3.4 CPU reference data is missing or falsely claimed');
    }
    if(hash(raw)!==hash(await fs.readFile(output))){
      throw new Error('G3.4 CPU report mutated while validating');
    }
    return {raw,report};
  };
}
