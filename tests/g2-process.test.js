import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createTripoSRAdapter } from '../server/triposr-adapter.js';

const win=process.platform==='win32';
const root=path.resolve(import.meta.dirname,'..');
const worker=path.join(root,'tests','fixtures','g2-fake-worker.cjs');
const tinyPng=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAAY0lEQVR4nO3PQQ3AIADAQMAOrvCF14ngcVnSU9DOfe74s6UDXjWgNaA1oDWgNaA1oDWgNaA1oDWgNaA1oDWgNaA1oDWgNaA1oDWgNaA1oDWgNaA1oDWgNaA1oDWgNaA1oDWgfWv2AaqHnAIRAAAAAElFTkSuQmCC'.replace(/_/g,'/'),'base64');
const gpu=()=>({used:4500,free:11300,util:10});
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

async function sandbox(mode='ok', overrides={}){
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'l3d-g2-child-'));
  const jobDir=path.join(dir,'job');
  await fs.mkdir(jobDir);
  const inputPath=path.join(jobDir,'input.png');
  const weights=path.join(dir,'fake-weights.txt');
  await fs.writeFile(inputPath,tinyPng);
  await fs.writeFile(weights,'EMPTY FAKE TEST ONLY');
  const previous=process.env.G2_FAKE_MODE;
  process.env.G2_FAKE_MODE=mode;
  const adapter=createTripoSRAdapter({
    python:process.execPath,worker,weights,
    gpuSample:async()=>gpu(),officeIdle:async()=>true,...overrides
  });
  return {
    jobDir,inputPath,adapter,
    async close(){
      if(previous===undefined)delete process.env.G2_FAKE_MODE;
      else process.env.G2_FAKE_MODE=previous;
      await fs.rm(dir,{recursive:true,force:true});
    }
  };
}
test('native isolated adapter accepts a child result with no GPU (mock subprocess)',{skip:!win},async()=>{
  const s=await sandbox();
  try{
    const steps=[];
    const out=await s.adapter.run({jobDir:s.jobDir,inputPath:s.inputPath,onStage:stage=>steps.push(stage)});
    assert.equal(out.qa.gpu,'NONE_FAKE_WORKER');
    assert.equal(out.qa.coordinateSystem,'Y_UP');
    assert.equal(out.glb.toString('ascii',0,4),'glTF');
    assert.ok(steps.includes('verify_sources'));
    assert.ok(steps.includes('export_glb'));
  }finally{await s.close()}
});
test('manual GPU gate blocks Office model without spawning child (mock subprocess)',{skip:!win},async()=>{
  const s=await sandbox('ok',{officeIdle:async()=>false});
  try{
    await assert.rejects(s.adapter.run({jobDir:s.jobDir,inputPath:s.inputPath}),e=>e.code==='G2_OFFICE_BUSY');
    await assert.rejects(fs.stat(path.join(s.jobDir,'test-worker.pid')),{code:'ENOENT'});
  }finally{await s.close()}
});
test('GPU budget deficiency blocks child before allocation (mock subprocess)',{skip:!win},async()=>{
  const s=await sandbox('ok',{gpuSample:async()=>({used:12000,free:3000,util:30})});
  try{
    await assert.rejects(s.adapter.run({jobDir:s.jobDir,inputPath:s.inputPath}),e=>e.code==='G2_GPU_BUSY');
    await assert.rejects(fs.stat(path.join(s.jobDir,'test-worker.pid')),{code:'ENOENT'});
  }finally{await s.close()}
});
test('AbortController kills native worker and waits for its exit (mock subprocess)',{skip:!win},async()=>{
  const s=await sandbox('hang');
  const controller=new AbortController();
  try{
    const stages=[];
    const run=s.adapter.run({
      jobDir:s.jobDir,inputPath:s.inputPath,signal:controller.signal,
      onStage:stage=>{stages.push(stage);if(stage==='verify_sources')controller.abort()}
    });
    await assert.rejects(run,e=>e.code==='CANCELLED');
    assert.ok(stages.includes('verify_sources'));
    const pid=Number(await fs.readFile(path.join(s.jobDir,'test-worker.pid'),'utf8'));
    await sleep(160);
    assert.throws(()=>process.kill(pid,0),{code:'ESRCH'});
  }finally{await s.close()}
});
test('runtime GPU pressure terminates child (mock subprocess)',{skip:!win},async()=>{
  let samples=0;
  const s=await sandbox('hang',{gpuSample:async()=>{
    samples++;
    return samples<=3?gpu():{used:14500,free:1500,util:80};
  }});
  try{
    await assert.rejects(s.adapter.run({jobDir:s.jobDir,inputPath:s.inputPath}),
      e=>e.code==='G2_GPU_LIMIT');
    assert.ok(samples>=4);
  }finally{await s.close()}
});

test('G3.4 native mock worker preserves shared-host NVIDIA snapshots separate from CUDA-reserved memory', {skip:!win}, async()=>{
  let samples=0;
  const s=await sandbox('delayed-ok',{gpuSample:async()=>{
    samples++;
    return samples<=3
      ?{used:4500,free:11300,util:10}
      :{used:5400,free:10400,util:36};
  }});
  try{
    const output=await s.adapter.run({jobDir:s.jobDir,inputPath:s.inputPath});
    const host=output.qa.hostGpuTelemetry;
    assert.equal(host.schema,'local3d.g3.host-gpu-telemetry.v1');
    assert.equal(host.initialUsedMiB,4500);
    assert.equal(host.initialFreeMiB,11300);
    assert.ok(host.runtimeSamples>=1,'The deliberately delayed mock worker must be observed');
    assert.equal(host.peakObservedUsedMiB,5400);
    assert.equal(host.minimumObservedFreeMiB,10400);
    assert.equal(host.peakObservedUtilizationPercent,36);
    assert.equal(host.peakIsExact,false);
    assert.equal(host.measurement,'NVIDIA_SMI_PERIODIC_SNAPSHOTS_NOT_EXCLUSIVE_VRAM_RESERVATION');
    assert.equal(output.qa.peakCudaReservedMiB,0,'No GPU/torch allocated by fixture');
  } finally {await s.close()}
});
