/**
 * Explicit operator-only CPU scorer for an ALREADY COMPLETED local G2 job.
 *
 * No model execution, GPU reservation, remote fetch, print command or job
 * creation. Offline Python subprocess is limited to fixed trusted entrypoint.
 */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const python=path.join(root,'runtime','engines','triposr','venv','Scripts','python.exe');
const script=path.join(root,'engines','quality','manual_job_score.py');
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const args=process.argv.slice(2);
if(process.platform!=='win32'||args.length!==2||args[0]!=='--job-id'||!uuid.test(args[1])){
  console.error('Usage (Windows only): npm run score:g3 -- --job-id <complete-local-G2-job-UUID>');
  process.exitCode=2;
}else{
  try{
    const {stdout}=await promisify(execFile)(python,[script,'--job-id',args[1]],{
      cwd:root,timeout:120000,maxBuffer:65536,windowsHide:true,
      env:{
        ...process.env,
        CUDA_VISIBLE_DEVICES:'-1',
        HF_HUB_OFFLINE:'1',
        TRANSFORMERS_OFFLINE:'1',
        PYTHONNOUSERSITE:'1',
        PYTHONUNBUFFERED:'1'
      }
    });
    if(!stdout.includes('G3_PRIVATE_JOB_EVALUATION ')){
      throw new Error('CPU scorer did not publish a verified result');
    }
    process.stdout.write(stdout);
    console.log('G3 manual quality report stored under private gitignored runtime/qa/g3/manual-scores. No GPU job started.');
  }catch{
    console.error('G3_CPU_SCORE_FAILED: source/model is unverified, missing, incomplete or outside licensed benchmark input set. No output was approved.');
    process.exitCode=1;
  }
}
