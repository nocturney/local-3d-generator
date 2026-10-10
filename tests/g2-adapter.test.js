import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createApp } from '../server/index.js';
import { parseGpuTelemetry } from '../server/triposr-adapter.js';
import { listenFixtureSafePort } from './safe-loopback-fixture.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const glbFixture = await fs.readFile(path.join(ROOT, 'docs/evidence/g2/chair-yup.glb'));
const tinyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAAY0lEQVR4nO3PQQ3AIADAQMAOrvCF14ngcVnSU9DOfe74s6UDXjWgNaA1oDWgNaA1oDWgNaA1oDWgNaA1oDWgNaA1oDWgNaA1oDWgNaA1oDWgNaA1oDWgNaA1oDWgNaA1oDWgfWv2AaqHnAIRAAAAAElFTkSuQmCC'.replace(/_/g,'/'),'base64');
const hash = b => createHash('sha256').update(b).digest('hex');
const sleep = ms => new Promise(r => setTimeout(r,ms));

function fakeAdapter({ wait = 120, error = null } = {}) {
  const trace = { started: 0, cancelled: 0, concurrent: 0, peak: 0 };
  return {
    trace,
    async run({ inputPath, signal, onStage }) {
      trace.started++; trace.concurrent++; trace.peak=Math.max(trace.peak,trace.concurrent);
      try {
        onStage('gpu_guard');
        await new Promise((resolve,reject)=>{
          const timer=setTimeout(resolve,wait);
          if(signal.aborted){clearTimeout(timer);reject(Object.assign(new Error('cancelled'),{code:'CANCELLED'}));}
          signal.addEventListener('abort',()=>{
            clearTimeout(timer); trace.cancelled++;
            reject(Object.assign(new Error('cancelled'),{code:'CANCELLED'}));
          },{once:true});
        });
        onStage('export_glb');
        if(error) throw Object.assign(new Error('mocked worker failure'),{code:error});
        return {
          glb:glbFixture,
          qa:{
            simulation:false, mode:'LOCAL_REAL_INFERENCE',status:'DRAFT',printQualified:false,
            sourceCommit:'107cefdc244c39106fa830359024f6a2f1c78871',
            weightsRevision:'5b521936b01fbe1890f6f9baed0254ab6351c04a',
            weightsSha256:'429e2c6b22a0923967459de24d67f05962b235f79cde6b032aa7ed2ffcd970ee',
            inputSha256:hash(await fs.readFile(inputPath)),artifactSha256:hash(glbFixture),
            gpu:'MOCK_NO_GPU',peakCudaReservedMiB:0,elapsedSeconds:0,
            vertices:9986,faces:19972,coordinateSystem:'Y_UP',watertight:true,
            preprocessing:'MOCK_TEST_ONLY'
          }
        };
      } finally { trace.concurrent--; }
    }
  };
}

async function fixtureEnv(adapter, geometryReviewer, benchmarkReviewer) {
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'local3d-g2-api-'));
  const app=await createApp({
    dataDir:path.join(dir,'data'),
    fixtureFile:path.join(dir,'fixture.glb'),
    stepMs:25,triposrAdapter:adapter,geometryReviewer,benchmarkReviewer,
    gpuLeaseRoot:path.join(dir,'gpu-coordination')
  });
  await listenFixtureSafePort(app.server);
  const base='http://127.0.0.1:'+app.server.address().port;
  const request=async (url,method='GET',data)=>{
    const res=await fetch(base+url,{method,headers:data?{'Content-Type':'application/json'}:{},body:data?JSON.stringify(data):undefined});
    const kind=res.headers.get('content-type')||'';
    return {status:res.status,body:kind.includes('json')?await res.json():Buffer.from(await res.arrayBuffer())};
  };
  return {app,base,dir,request,async close(){await app.close();await fs.rm(dir,{force:true,recursive:true})}};
}
const payload = () => ({providerId:'triposr-local',mode:'image',prompt:'manual isolated GPU action',
  confirmGpu:true,image:{mime:'image/png',filename:'test.png',base64:tinyPng.toString('base64')}});
async function waitStatus(request,id,status,timeout=4000){
  const deadline=Date.now()+timeout;
  while(Date.now()<deadline){
    const r=await request('/v1/jobs/'+id);
    if(r.body.status===status)return r.body;
    await sleep(15);
  }
  throw new Error('Timed out waiting for '+status);
}

test('GPU telemetry parser fails closed on malformed and ambiguous values',()=>{
  assert.deepEqual(parseGpuTelemetry('4000, 12000, 22'),{used:4000,free:12000,util:22});
  assert.equal(parseGpuTelemetry('4000 MiB,12000,22'),null);
  assert.equal(parseGpuTelemetry('4000,12000,200'),null);
  assert.equal(parseGpuTelemetry('4000,12000,22\n4000,12000,22'),null);
});

test('manual G2 opt-in never queues or starts without per-job GPU consent and image',async()=>{
  const a=fakeAdapter(),env=await fixtureEnv(a);
  try{
    const p=(await env.request('/v1/providers')).body.providers.find(p=>p.id==='triposr-local');
    assert.equal(p.status,'MANUAL_OPT_IN');assert.equal(p.canStart,true);
    const health=(await env.request('/v1/health')).body;
    assert.equal(health.autoGpuQueue,false);
    assert.equal(health.printing,false);
    const missing=payload();delete missing.confirmGpu;
    const noConsent=await env.request('/v1/jobs','POST',missing);
    assert.equal(noConsent.status,422);assert.equal(noConsent.body.error.code,'G2_CONFIRM_REQUIRED');
    const txt=await env.request('/v1/jobs','POST',{...payload(),mode:'text',prompt:'a chair'});
    assert.equal(txt.status,422);assert.equal(txt.body.error.code,'G2_IMAGE_ONLY');
    assert.equal(a.trace.started,0);
    assert.equal((await env.request('/v1/jobs')).body.jobs.length,0);
  } finally {await env.close()}
});

test('G2 manually confirmed job has real-mode manifests and validated DRAFT assets',async()=>{
  const a=fakeAdapter({wait:65}),env=await fixtureEnv(a);
  try{
    const made=await env.request('/v1/jobs','POST',payload());
    assert.equal(made.status,201);
    assert.equal(made.body.simulation,false);
    const done=await waitStatus(env.request,made.body.id,'completed');
    assert.equal(done.providerId,'triposr-local');
    assert.equal(done.stage,'g2_ready_draft');
    assert.equal(done.progress,100);
    assert.equal(done.assets.length,3);
    assert.equal(done.assets.find(x=>x.id==='source-image').sha256,hash(tinyPng));
    const model=await env.request('/v1/jobs/'+done.id+'/assets/preview-glb');
    assert.equal(model.status,200);
    assert.equal(hash(model.body),hash(glbFixture));
    const report=(await env.request('/v1/jobs/'+done.id+'/assets/qa-report')).body;
    assert.equal(report.realInference,true);
    assert.equal(report.printQualified,false);
    assert.equal(report.geometryStatus,'DRAFT');
    assert.equal(report.provenance.coordinateSystem,'Y_UP');
    assert.equal(report.provenance.sourceSha256,hash(tinyPng));
    assert.equal(a.trace.peak,1);
  }finally{await env.close()}
});

test('simultaneous GPU submissions cannot create two workers (atomic reservation)',async()=>{
  const a=fakeAdapter({wait:300}),env=await fixtureEnv(a);
  try{
    const results=await Promise.all([
      env.request('/v1/jobs','POST',payload()),env.request('/v1/jobs','POST',payload())
    ]);
    assert.deepEqual(results.map(x=>x.status).sort((a,b)=>a-b),[201,409]);
    assert.equal(results.find(x=>x.status===409).body.error.code,'G2_BUSY');
    const id=results.find(x=>x.status===201).body.id;
    await waitStatus(env.request,id,'completed');
    assert.equal(a.trace.started,1);assert.equal(a.trace.peak,1);
  }finally{await env.close()}
});

test('real worker cancel keeps permit reserved until process finishes and exposes no model',async()=>{
  const a=fakeAdapter({wait:1000}),env=await fixtureEnv(a);
  try{
    const created=await env.request('/v1/jobs','POST',payload());
    assert.equal(created.status,201);
    const id=created.body.id;
    await waitStatus(env.request,id,'running');
    const cancel=await env.request('/v1/jobs/'+id+'/cancel','POST');
    assert.equal(cancel.status,200);
    assert.equal(cancel.body.status,'cancelling');
    await waitStatus(env.request,id,'cancelled');
    const blocked=await env.request('/v1/jobs/'+id+'/assets/preview-glb');
    assert.equal(blocked.status,404);
    assert.ok(a.trace.cancelled>=1);
    assert.equal(a.trace.concurrent,0);
  }finally{await env.close()}
});

test('real worker failure is recorded without publishing partial artifacts',async()=>{
  const a=fakeAdapter({wait:35,error:'G2_GPU_LIMIT'}),env=await fixtureEnv(a);
  try{
    const made=await env.request('/v1/jobs','POST',payload());
    assert.equal(made.status,201);
    const fail=await waitStatus(env.request,made.body.id,'failed');
    assert.equal(fail.error.code,'G2_GPU_LIMIT');
    assert.ok(!fail.assets.some(x=>x.id==='preview-glb'));
    assert.equal((await env.request('/v1/jobs/'+made.body.id+'/assets/qa-report')).status,404);
    // A FAILED record can appear before the final lease cleanup; never rush a
    // second GPU allocation until health confirms the worker has exited.
    const deadline=Date.now()+3000;
    while((await env.request('/v1/health')).body.gpuBusy && Date.now()<deadline) await sleep(20);
    assert.equal((await env.request('/v1/health')).body.gpuBusy,false);
    const next=await env.request('/v1/jobs','POST',payload());
    assert.equal(next.status,201,'GPU lease must release after failure');
  }finally{await env.close()}
});

test('shutdown aborts a running G2 job before service closes',async()=>{
  const a=fakeAdapter({wait:5000}),env=await fixtureEnv(a);
  try{
    const made=await env.request('/v1/jobs','POST',payload());
    assert.equal(made.status,201);
    await waitStatus(env.request,made.body.id,'running');
    await env.app.close();
    assert.equal(a.trace.concurrent,0);
    // Shutdown may abort between run() entry and mock abort-listener setup.
    // The invariant is no active worker, not a particular callback sequence.
    assert.equal(a.trace.concurrent,0);
    const raw=JSON.parse(await fs.readFile(path.join(env.dir,'data','jobs',made.body.id,'job.json'),'utf8'));
    assert.ok(['cancelled','interrupted'].includes(raw.status));
    // No automatic resume on later app restart.
    const second=await createApp({dataDir:path.join(env.dir,'data'),fixtureFile:path.join(env.dir,'fixture.glb')});
    assert.equal(second.jobs.get(made.body.id).status,raw.status);
    await second.close();
  }finally{await fs.rm(env.dir,{recursive:true,force:true})}
});

function fakeReviewer({wait=0,invalid=false}={}){
  const track={calls:0};
  return {
    track,
    async review({modelFile,outputFile}){
      track.calls++;
      if(wait) await sleep(wait);
      const bytes=await fs.readFile(modelFile);
      const report={
        schema:'local3d.g3.geometry-qa.v1',
        modelSha256:hash(bytes),
        classification:'DRAFT_REQUIRES_HUMAN_REVIEW',
        topology:{everyObjectWatertight:true,everyObjectPositiveVolume:false,componentCount:1},
        notEvaluated:{realWorldScaleAndUnits:'UNKNOWN_UNCALIBRATED',wallThickness:'NOT_TESTED'},
        printQualified:invalid?true:false,approvedForPrinter:false,fabricationAction:'NONE'
      };
      const raw=Buffer.from(JSON.stringify(report,null,2)+'\n');
      await fs.writeFile(outputFile,raw,{flag:'wx'});
      return {raw,report};
    }
  };
}

test('G3 CPU geometry review is manual, only for completed real model, persisted as DRAFT asset',async()=>{
  const mock=fakeReviewer(),adapter=fakeAdapter({wait:80}),env=await fixtureEnv(adapter,mock.review);
  try{
    const created=await env.request('/v1/jobs','POST',payload());
    const id=created.body.id;
    const premature=await env.request('/v1/jobs/'+id+'/review','POST');
    assert.equal(premature.status,422);
    assert.equal(premature.body.error.code,'G3_REVIEW_UNAVAILABLE');
    await waitStatus(env.request,id,'completed');
    const r=await env.request('/v1/jobs/'+id+'/review','POST');
    assert.equal(r.status,200);
    assert.equal(mock.track.calls,1);
    assert.equal(r.body.status,'completed');
    assert.ok(r.body.assets.some(x=>x.id==='geometry-qa'));
    const asset=await env.request('/v1/jobs/'+id+'/assets/geometry-qa');
    assert.equal(asset.status,200);
    assert.equal(asset.body.classification,'DRAFT_REQUIRES_HUMAN_REVIEW');
    assert.equal(asset.body.printQualified,false);
    assert.equal(asset.body.topology.everyObjectPositiveVolume,false);
    const repeat=await env.request('/v1/jobs/'+id+'/review','POST');
    assert.equal(repeat.status,200);
    assert.equal(mock.track.calls,1,'report must be idempotent');
    assert.equal(adapter.trace.started,1,'CPU review must not start new GPU workers');
  }finally{await env.close()}
});

test('G3 simultaneous review requests share one permit (not two scanners)',async()=>{
  const mock=fakeReviewer({wait:180}),env=await fixtureEnv(fakeAdapter({wait:30}),mock.review);
  try{
    const created=await env.request('/v1/jobs','POST',payload());
    const id=created.body.id;
    await waitStatus(env.request,id,'completed');
    const both=await Promise.all([
      env.request('/v1/jobs/'+id+'/review','POST'),
      env.request('/v1/jobs/'+id+'/review','POST')
    ]);
    assert.deepEqual(both.map(x=>x.status).sort((a,b)=>a-b),[200,409]);
    assert.equal(mock.track.calls,1);
    assert.equal(both.find(x=>x.status===409).body.error.code,'G3_REVIEW_BUSY');
  }finally{await env.close()}
});

test('G3 refuses tampered GLB or falsely print-qualified review',async()=>{
  const mock=fakeReviewer({invalid:true}),env=await fixtureEnv(fakeAdapter({wait:40}),mock.review);
  try{
    const created=await env.request('/v1/jobs','POST',payload());
    const id=created.body.id;
    await waitStatus(env.request,id,'completed');
    const modelPath=path.join(env.dir,'data','jobs',id,'output.glb');
    const original=await fs.readFile(modelPath);
    await fs.writeFile(modelPath,Buffer.from('tampered'));
    const bad=await env.request('/v1/jobs/'+id+'/review','POST');
    assert.equal(bad.status,422);assert.equal(bad.body.error.code,'G3_UNVERIFIED_MODEL');
    assert.equal(mock.track.calls,0);
    await fs.writeFile(modelPath,original);
    const unsafe=await env.request('/v1/jobs/'+id+'/review','POST');
    assert.equal(unsafe.status,422);assert.equal(unsafe.body.error.code,'G3_BAD_REPORT');
    assert.equal((await env.request('/v1/jobs/'+id+'/assets/geometry-qa')).status,404);
  }finally{await env.close()}
});

const licensedChairImage = await fs.readFile(path.join(ROOT,'docs/evidence/g2/source-chair.png'));
const licensedChairPayload = () => ({
  ...payload(),
  image:{mime:'image/png',filename:'licensed-g3-chair.png',base64:licensedChairImage.toString('base64')}
});

function mockCpuBenchmark({wait=0, falselyPrintQualified=false, fakeThreeDimensionalGT=false}={}){
  const trace={calls:0};
  return {
    trace,
    async run({outputFile,sourceSha,modelSha}){
      trace.calls++;
      if(wait)await sleep(wait);
      const report={
        schema:'local3d.g3.manual-job-shape-evaluation.v1',
        fixtureId:'09-upstream-chair',
        imageSha256:sourceSha,
        modelSha256:modelSha,
        candidateEvidenceLane:'HASH_LINKED_LOCAL_COMPLETED_JOB_NOT_INDEPENDENT_GPU_ATTESTATION',
        evaluation:fakeThreeDimensionalGT?'POST_HOC_NORMALIZED_3D_SHAPE_DIAGNOSTIC':'NO_GROUND_TRUTH_3D',
        hasOriginalGroundTruth3d:fakeThreeDimensionalGT,
        shape:fakeThreeDimensionalGT?{
          sameInputBinary:false,referenceSelfSimilarityOnly:false,
          bestView:{chamferL1Normalized:0.0001}
        }:null,
        topology:{componentCount:1,watertight:true,positiveVolume:false},
        modelInferenceExecuted:false,
        printQualified:falselyPrintQualified,
        approvedForPrinter:false,
        fabricationAction:'NONE'
      };
      const raw=Buffer.from(JSON.stringify(report,null,2)+'\n');
      await fs.writeFile(outputFile,raw,{flag:'wx'});
      return {raw,report};
    }
  };
}

test('G3.4 CPU benchmark rejects DEMO, unfinished or unlicensed real jobs',async()=>{
  const fake=mockCpuBenchmark(),adapter=fakeAdapter({wait:120});
  const env=await fixtureEnv(adapter,null,fake.run);
  try{
    const g2=await env.request('/v1/jobs','POST',licensedChairPayload());
    assert.equal(g2.status,201);
    const notYet=await env.request('/v1/jobs/'+g2.body.id+'/benchmark','POST');
    assert.equal(notYet.status,422);
    assert.equal(notYet.body.error.code,'G3_BENCHMARK_UNAVAILABLE');
    await waitStatus(env.request,g2.body.id,'completed');
    const unknown=await env.request('/v1/jobs','POST',payload());
    assert.equal(unknown.status,201);
    await waitStatus(env.request,unknown.body.id,'completed');
    const denied=await env.request('/v1/jobs/'+unknown.body.id+'/benchmark','POST');
    assert.equal(denied.status,422);
    assert.equal(denied.body.error.code,'G3_BENCHMARK_NO_REFERENCE');
    assert.equal(fake.trace.calls,0);
    assert.equal(adapter.trace.started,2,'Only the two original mock submissions can run');
  }finally{await env.close()}
});

test('G3.4 explicit CPU review reports missing GT honestly, SHA-locks artifact, idempotent and no extra AI',async()=>{
  const fake=mockCpuBenchmark(),adapter=fakeAdapter({wait:70}),env=await fixtureEnv(adapter,null,fake.run);
  try{
    const j=await env.request('/v1/jobs','POST',licensedChairPayload());
    assert.equal(j.status,201);
    await waitStatus(env.request,j.body.id,'completed');
    const done=await env.request('/v1/jobs/'+j.body.id+'/benchmark','POST');
    assert.equal(done.status,200);
    assert.equal(done.body.status,'completed');
    assert.equal(fake.trace.calls,1);
    assert.ok(done.body.assets.some(a=>a.id==='benchmark-shape'));
    const result=await env.request('/v1/jobs/'+j.body.id+'/assets/benchmark-shape');
    assert.equal(result.status,200);
    assert.equal(result.body.evaluation,'NO_GROUND_TRUTH_3D');
    assert.equal(result.body.shape,null);
    assert.equal(result.body.printQualified,false);
    const twice=await env.request('/v1/jobs/'+j.body.id+'/benchmark','POST');
    assert.equal(twice.status,200);
    assert.equal(fake.trace.calls,1);
    assert.equal(adapter.trace.started,1,'CPU diagnostic MUST NOT run a second model worker');
  }finally{await env.close()}
});

test('G3.4 concurrent same-job CPU scoring rejects duplicate, source tampering and false print authority',async()=>{
  const fake=mockCpuBenchmark({wait:160}),adapter=fakeAdapter({wait:40}),env=await fixtureEnv(adapter,null,fake.run);
  try{
    const j=await env.request('/v1/jobs','POST',licensedChairPayload());
    await waitStatus(env.request,j.body.id,'completed');
    const simultaneous=await Promise.all([
      env.request('/v1/jobs/'+j.body.id+'/benchmark','POST'),
      env.request('/v1/jobs/'+j.body.id+'/benchmark','POST')
    ]);
    assert.deepEqual(simultaneous.map(x=>x.status).sort((a,b)=>a-b),[200,409]);
    assert.equal(simultaneous.find(x=>x.status===409).body.error.code,'G3_BENCHMARK_BUSY');
    assert.equal(fake.trace.calls,1);
  }finally{await env.close()}
  const wrong=mockCpuBenchmark({falselyPrintQualified:true});
  const env2=await fixtureEnv(fakeAdapter({wait:40}),null,wrong.run);
  try{
    const j=await env2.request('/v1/jobs','POST',licensedChairPayload());
    await waitStatus(env2.request,j.body.id,'completed');
    const model=path.join(env2.dir,'data','jobs',j.body.id,'output.glb');
    const saved=await fs.readFile(model);
    await fs.writeFile(model,Buffer.from('unsafe source bytes'));
    const fail=await env2.request('/v1/jobs/'+j.body.id+'/benchmark','POST');
    assert.equal(fail.status,422);
    assert.equal(fail.body.error.code,'G3_BENCHMARK_UNVERIFIED');
    assert.equal(wrong.trace.calls,0);
    await fs.writeFile(model,saved);
    const unsafe=await env2.request('/v1/jobs/'+j.body.id+'/benchmark','POST');
    assert.equal(unsafe.status,422);
    assert.equal(unsafe.body.error.code,'G3_BAD_BENCHMARK');
    assert.equal((await env2.request('/v1/jobs/'+j.body.id+'/assets/benchmark-shape')).status,404);
  }finally{await env2.close()}
});

test('G3.4 Python verification errors never expose internal paths to a web client',async()=>{
  const env=await fixtureEnv(fakeAdapter({wait:35}),null,async()=>{
    throw new Error('PRIVATE_PATH_OR_WEIGHTS_MUST_NOT_REACH_BROWSER');
  });
  try{
    const job=await env.request('/v1/jobs','POST',licensedChairPayload());
    await waitStatus(env.request,job.body.id,'completed');
    const result=await env.request('/v1/jobs/'+job.body.id+'/benchmark','POST');
    assert.equal(result.status,422);
    assert.equal(result.body.error.code,'G3_BENCHMARK_UNVERIFIED');
    assert.doesNotMatch(JSON.stringify(result.body),/PRIVATE_PATH_OR_WEIGHTS_MUST_NOT_REACH_BROWSER/);
    assert.equal((await env.request('/v1/jobs/'+job.body.id+'/assets/benchmark-shape')).status,404);
  }finally{await env.close()}
});

test('G3.5 cross-type CPU reviews have one process-local permit, no hidden queue',async()=>{
  const geometry=fakeReviewer({wait:450});
  const benchmark=mockCpuBenchmark({wait:80});
  const adapter=fakeAdapter({wait:40});
  const env=await fixtureEnv(adapter,geometry.review,benchmark.run);
  try{
    const first=await env.request('/v1/jobs','POST',licensedChairPayload());
    assert.equal(first.status,201);
    await waitStatus(env.request,first.body.id,'completed');
    const deadline=Date.now()+2000;
    while((await env.request('/v1/health')).body.gpuBusy && Date.now()<deadline)await sleep(15);
    const second=await env.request('/v1/jobs','POST',licensedChairPayload());
    assert.equal(second.status,201);
    await waitStatus(env.request,second.body.id,'completed');
    const running=env.request('/v1/jobs/'+first.body.id+'/review','POST');
    const startDeadline=Date.now()+2000;
    while(!(await env.request('/v1/health')).body.cpuReviewBusy && Date.now()<startDeadline)await sleep(10);
    assert.equal((await env.request('/v1/health')).body.cpuReviewBusy,true);
    const otherGeometry=await env.request('/v1/jobs/'+second.body.id+'/review','POST');
    const otherBenchmark=await env.request('/v1/jobs/'+second.body.id+'/benchmark','POST');
    assert.equal(otherGeometry.status,409);
    assert.equal(otherGeometry.body.error.code,'G3_CPU_BUSY');
    assert.equal(otherBenchmark.status,409);
    assert.equal(otherBenchmark.body.error.code,'G3_CPU_BUSY');
    assert.equal(benchmark.trace.calls,0,'The benchmark scorer must never spawn while geometry is active');
    const done=await running;
    assert.equal(done.status,200);
    assert.equal((await env.request('/v1/health')).body.cpuReviewBusy,false);
    const b=await env.request('/v1/jobs/'+second.body.id+'/benchmark','POST');
    assert.equal(b.status,200);
    assert.equal(benchmark.trace.calls,1);
    assert.equal(adapter.trace.started,2,'No new inference is triggered by CPU quality review');
  }finally{await env.close()}
});

test('G3.5 CPU permit releases even when a reviewer refuses unsafe print approval',async()=>{
  const badGeometry=fakeReviewer({invalid:true,wait:35});
  const cpuBenchmark=mockCpuBenchmark();
  const env=await fixtureEnv(fakeAdapter({wait:40}),badGeometry.review,cpuBenchmark.run);
  try{
    const j=await env.request('/v1/jobs','POST',licensedChairPayload());
    assert.equal(j.status,201);
    await waitStatus(env.request,j.body.id,'completed');
    const rejected=await env.request('/v1/jobs/'+j.body.id+'/review','POST');
    assert.equal(rejected.status,422);
    assert.equal(rejected.body.error.code,'G3_BAD_REPORT');
    assert.equal((await env.request('/v1/health')).body.cpuReviewBusy,false);
    const accepted=await env.request('/v1/jobs/'+j.body.id+'/benchmark','POST');
    assert.equal(accepted.status,200);
    assert.equal(cpuBenchmark.trace.calls,1);
    assert.equal((await env.request('/v1/jobs/'+j.body.id+'/assets/geometry-qa')).status,404);
  }finally{await env.close()}
});
