/** G3.46 REAL createTripoSRAdapter integration with Node-only mock
 * worker, synthetic owned directories, injected Office/GPU observations.
 * No live TripoSR/Python/CUDA, OS service, printer, network, customer media.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createTripoSRAdapter} from '../server/triposr-adapter.js';

const worker=path.resolve(import.meta.dirname,'fixtures','g346-fake-artifact-worker.cjs');
const input=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAAY0lEQVR4nO3PQQ3AIADAQMAOrvCF14ngcVnSU9DOfe74s6UDXjWgNaA1oDWgNaA1oDWgNaA1oDWgNaA1oDWgNaA1oDWgfWv2AaqHnAIRAAAAAElFTkSuQmCC','base64');
const gpu=async()=>({used:4500,free:11300,util:10});
async function env(mode='HEALTHY',overrides={}){
 const tmp=await fs.realpath(os.tmpdir());
 const root=await fs.mkdtemp(path.join(tmp,'local3d-g346-worker-owned-'));
 const jobDir=path.join(root,'job');
 await fs.mkdir(jobDir);
 const inputPath=path.join(jobDir,'input.png');
 const weights=path.join(root,'owned-placeholder-weights.txt');
 await fs.writeFile(inputPath,input);
 await fs.writeFile(weights,'SYNTHETIC PLACEHOLDER; NO TORCH');
 const old=process.env.G346_FAKE_POISON;
 process.env.G346_FAKE_POISON=mode;
 const stage=[];
 const adapter=createTripoSRAdapter({
  python:process.execPath,worker,weights,gpuSample:gpu,
  officeIdle:async()=>true,...overrides
 });
 return {root,jobDir,inputPath,stage,
  run:()=>adapter.run({jobDir,inputPath,onStage:x=>stage.push(x)}),
  close:async()=>{
   if(old===undefined)delete process.env.G346_FAKE_POISON;
   else process.env.G346_FAKE_POISON=old;
   await fs.rm(root,{recursive:true,force:true});
  }
 };
}
test('G3.46 unchanged valid synthetic node worker still produces correctly SHA-matched DRAFT GLB',async()=>{
 const e=await env();
 try{
  const out=await e.run();
  assert.equal(out.glb.toString('ascii',0,4),'glTF');
  assert.equal(out.qa.gpu,'NONE_FAKE_WORKER');
  assert.equal(out.qa.printQualified,false);
  assert.equal(out.qa.status,'DRAFT');
  assert.ok(e.stage.includes('export_glb'));
 }finally{await e.close();}
});
for(const scenario of ['HARDLINK_MODEL','HARDLINK_QA','HARDLINK_INPUT','JUNCTION_OUTPUT']){
 test('G3.46 actual worker adapter refuses synthetic owned '+scenario+' artifact after child exits',async()=>{
  const e=await env(scenario);
  try{
   await assert.rejects(e.run(),err=>err?.code==='G2_INVALID_ARTIFACT');
   assert.ok(e.stage.includes('export_glb'),'worker must have completed BEFORE result was denied');
  }finally{await e.close();}
 });
}
test('G3.46 source SHA admitted BEFORE launch rejects source rewrite by worker after exit',async()=>{
 const e=await env('INPUT_DRIFT');
 try{
  await assert.rejects(e.run(),err=>err?.code==='G2_INVALID_REPORT');
  assert.ok(e.stage.includes('export_glb'),'worker really ran, but changed source result was rejected');
 }finally{await e.close();}
});
test('G3.46 multi-link source is rejected BEFORE office/gpu sample or Node mock worker',async()=>{
 let gpuChecks=0;
 const e=await env('HEALTHY',{gpuSample:async()=>{gpuChecks++;return gpu();}});
 try{
  await fs.link(e.inputPath,path.join(e.root,'owned-hardlinked-source'));
  await assert.rejects(e.run(),err=>err?.code==='G2_INVALID_PATH');
  assert.equal(gpuChecks,0);
  assert.equal(e.stage.length,0);
  await assert.rejects(fs.lstat(path.join(e.jobDir,'engine-output')),{code:'ENOENT'});
 }finally{await e.close();}
});
test('G3.46 input SHA changed DURING Office preflight is rejected before any worker',async()=>{
 let gpuChecks=0,mutated=false;
 const e=await env('HEALTHY',{
  gpuSample:async()=>{gpuChecks++;return gpu();},
  officeIdle:async()=>{
   if(!mutated){
    await fs.writeFile(e.inputPath,Buffer.alloc(input.length,33));
    mutated=true;
   }
   return true;
  }
 });
 try{
  await assert.rejects(e.run(),err=>err?.code==='G2_INVALID_PATH');
  assert.equal(mutated,true);
  assert.equal(gpuChecks,3,'normal CPU-only preflight telemetry is permitted');
  await assert.rejects(fs.lstat(path.join(e.jobDir,'engine-output')),{code:'ENOENT'});
 }finally{await e.close();}
});
test('G3.46 already-occupied output JUNCTION blocks the mock worker before subprocess spawn',async()=>{
 const e=await env('HEALTHY');
 try{
  const other=path.join(e.root,'owned-output-target');
  await fs.mkdir(other);
  const out=path.join(e.jobDir,'engine-output');
  await fs.symlink(other,out,process.platform==='win32'?'junction':'dir');
  await assert.rejects(e.run(),err=>err?.code==='G2_OUTPUT_EXISTS');
  assert.equal((await fs.lstat(out)).isSymbolicLink(),true);
  assert.ok(!e.stage.includes('export_glb'));
 }finally{await e.close();}
});
