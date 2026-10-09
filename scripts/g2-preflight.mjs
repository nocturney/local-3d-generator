import fs from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceLock = JSON.parse(await fs.readFile(path.join(ROOT,'docs','TRIPOSR_SOURCE_LOCK.json'),'utf8'));
const maybeBool = v => String(v??'').trim().toLowerCase()==='true';

export function parseNvidiaRow(text) {
  const columns=String(text||'').trim().split(',').map(x=>x.trim());
  if (columns.length < 5) return null;
  const [name,total,used,free,util]=columns;
  if (![total,used,free,util].every(x=>Number.isFinite(Number(x)))) return null;
  return {name,totalMiB:Number(total),usedMiB:Number(used),freeMiB:Number(free),utilizationPercent:Number(util)};
}

export function classifyGpu(gpu, estimatedMiB=6144) {
  const reserveMiB=Math.max(estimatedMiB+2048,8192);
  if (!gpu) return {state:'UNKNOWN',reserveMiB,notes:['GPU telemetry unavailable; cannot qualify host']};
  const notes=[];
  if (gpu.freeMiB < reserveMiB) notes.push('Observed free VRAM is below the conservative test reserve');
  if (gpu.utilizationPercent > 20) notes.push('GPU is actively utilized by other software; exclusive headroom unproven');
  return {state:notes.length?'SHARED_OR_INSUFFICIENT':'HEADROOM_POSSIBLE',reserveMiB,notes};
}

function cmd(exe,args,limit=3500) {
  try {
    const output=spawnSync(exe,args,{encoding:'utf8',windowsHide:true,shell:false,timeout:limit,maxBuffer:256*1024});
    if(output.error || output.status!==0) return {ok:false,value:null,reason:output.error?.code||'EXIT_'+output.status};
    return {ok:true,value:String(output.stdout||'').trim()};
  } catch(e){ return {ok:false,value:null,reason:e.code||e.name}; }
}
function infoVersion(exe,args) {
  const r=cmd(exe,args);
  return r.ok?r.value.slice(0,250):null;
}
async function fingerprintIfPresent(file,expectedSize,expectedSha,verify=false) {
  if (!file) return {state:'NOT_CONFIGURED'};
  try {
    const stat=await fs.lstat(file);
    if (!stat.isFile() || stat.isSymbolicLink()) return {state:'UNSAFE_FILE_TYPE'};
    if(stat.size!==expectedSize) return {state:'WRONG_SIZE',size:stat.size,expectedSize};
    if(!verify) return {state:'PRESENT_UNVERIFIED',size:stat.size,hashVerified:false};
    const checksum=await new Promise((resolve,reject)=>{
      const digest=createHash('sha256'); const stream=createReadStream(file);
      stream.on('data',chunk=>digest.update(chunk)); stream.on('error',reject);
      stream.on('end',()=>resolve(digest.digest('hex')));
    });
    return {state:checksum===expectedSha?'VERIFIED':'HASH_MISMATCH',size:stat.size,hashVerified:checksum===expectedSha,sha256:checksum};
  }catch(e){return {state:e.code==='ENOENT'?'MISSING':'UNREADABLE',reason:e.code||e.name};}
}
async function getSource() {
  const dir=process.env.LOCAL3D_TRIPOSR_SOURCE;
  if(!dir) return {state:'NOT_CONFIGURED'};
  const revision=cmd('git',['-C',dir,'rev-parse','HEAD']);
  if(!revision.ok) return {state:'NOT_A_GIT_REPOSITORY',reason:revision.reason};
  const clean=cmd('git',['-C',dir,'status','--porcelain']);
  return {state:revision.value===sourceLock.source.commit&&clean.ok&&clean.value===''?'PINNED_CLEAN':'UNQUALIFIED_SOURCE',
    expectedRevision:sourceLock.source.commit,actualRevision:revision.value,clean:clean.ok?clean.value==='':null};
}

export async function collectPreflight(verifyWeights=false) {
  const rawGpu=cmd('nvidia-smi',['--query-gpu=name,memory.total,memory.used,memory.free,utilization.gpu','--format=csv,noheader,nounits']);
  const gpu=rawGpu.ok?parseNvidiaRow(rawGpu.value.split(/\r?\n/)[0]):null;
  const gpuAssessment=classifyGpu(gpu,sourceLock.upstreamVramMiB);
  const pythonExe=process.env.LOCAL3D_TRIPOSR_PYTHON||'python';
  const py=cmd(pythonExe,['-c',"import sys,importlib.util,json; print(json.dumps({'python':sys.version.split()[0],'torch':importlib.util.find_spec('torch') is not None,'PIL':importlib.util.find_spec('PIL') is not None,'rembg':importlib.util.find_spec('rembg') is not None}))"]);
  let python={state:'NOT_AVAILABLE'};
  if(py.ok){try{python={state:'PROBE_ONLY',...JSON.parse(py.value)}}catch{}}
  const weights=await fingerprintIfPresent(
    process.env.LOCAL3D_TRIPOSR_WEIGHTS?path.join(process.env.LOCAL3D_TRIPOSR_WEIGHTS,'model.ckpt'):null,
    sourceLock.weights.bytes,sourceLock.weights.sha256,verifyWeights);
  const source=await getSource();
  const nvcc=infoVersion('nvcc',['--version']);
  const approvalPath=path.join(ROOT,'docs','G2_APPROVAL_2026-10-09.json');
  const limitedApproval=await fs.readFile(approvalPath,'utf8').then(raw=>{
    const a=JSON.parse(raw);
    return a.schema==='local3d.g2.approval.v1' && a.authorized?.boundedOneTimeGpuPilot===true;
  }).catch(()=>false);
  const blockers=[];
  if (source.state!=='PINNED_CLEAN') blockers.push('SOURCE_NOT_VERIFIED');
  if (weights.state!=='VERIFIED') blockers.push('WEIGHTS_NOT_VERIFIED');
  if(!python.torch) blockers.push('ISOLATED_TORCH_NOT_PRESENT');
  if(gpuAssessment.state!=='HEADROOM_POSSIBLE') blockers.push('LIVE_GPU_CONFLICT_REVIEW_REQUIRED');
  if(!limitedApproval) blockers.push('OWNER_INSTALL_AND_GPU_ALLOCATION_APPROVAL_REQUIRED');
  blockers.push('UNATTENDED_INFERENCE_NOT_AUTHORIZED');
  const report={
    schema:'local3d.g2.preflight.v1',checkedAt:new Date().toISOString(),
    engine:'TripoSR',mode:'READ_ONLY_NO_INFERENCE',approval:limitedApproval?'LIMITED_PILOT_APPROVED_NOT_STANDING':'NOT_GRANTED',
    sourceLock:{repository:sourceLock.source.repository,commit:sourceLock.source.commit,
      weightsRevision:sourceLock.weights.revision,weightsSha256:sourceLock.weights.sha256,weightsBytes:sourceLock.weights.bytes},
    system:{platform:process.platform,arch:process.arch,node:process.version,python,cudaCompilerInstalled:nvcc!==null,
      cudaCompilerVersion:nvcc?nvcc.split(/\r?\n/).slice(-2):null},
    source,weights,gpu,gpuAssessment,readiness:'BLOCKED_FOR_UNATTENDED_INFERENCE',blockers,
    note:'Past limited pilot approval is not standing authorization. This report does not allocate CUDA, contact model APIs, start a worker or authorize general-use inference.'
  };
  return report;
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const report=await collectPreflight(process.argv.includes('--verify-weights'));
  console.log(JSON.stringify(report,null,2));
  if(process.argv.includes('--out')){
    const i=process.argv.indexOf('--out');const output=process.argv[i+1];
    if(!output)throw new Error('Missing --out path');
    await fs.mkdir(path.dirname(path.resolve(output)),{recursive:true});
    await fs.writeFile(output,JSON.stringify(report,null,2)+'\n',{flag:'w'});
  }
}
