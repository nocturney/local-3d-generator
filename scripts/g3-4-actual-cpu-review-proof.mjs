/**
 * One-time G3.4 CPU-only proof: feed an existing historical G2 real chair GLB
 * through the *actual* LOCAL3D manual CPU benchmark endpoint and Python code.
 *
 * The temporary job metadata is expressly reconstructed for this test.
 * This is NOT a new AI image-to-3D run, no CUDA worker is spawned, and the
 * ninth chair lacks a true original reference 3D mesh for accuracy scoring.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID, createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { createApp } from '../server/index.js';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sha=b=>createHash('sha256').update(b).digest('hex');
const dir=await fs.mkdtemp(path.join(ROOT,'runtime','qa','g3-benchmark-real-python-proof-'));
const data=path.join(dir,'data');
const jobId=randomUUID();
const folder=path.join(data,'jobs',jobId);
const evidence=path.join(ROOT,'docs','evidence');
const output=path.join(evidence,'g3','g3-4-existing-chair-cpu-proof.json');
let app=null,workerCalls=0;
const proof={
  schema:'local3d.g3.4.existing-chair-cpu-proof.v1',
  originalImageIsPreviouslyLicensed:true,
  modelSource:'PREVIOUSLY_COMPLETED_G2_REAL_E2E_CHAIR_GLB',
  temporaryManifest:'RECONSTRUCTED_FOR_CPU_REVIEW_ONLY',
  noNewAiInference:true,
  cpuScorer:'ACTUAL_PINNED_PYTHON_NOT_MOCK',
  passed:false,printQualified:false
};
try{
  await fs.mkdir(folder,{recursive:true});
  const source=await fs.readFile(path.join(evidence,'g2','source-chair.png'));
  const model=await fs.readFile(path.join(evidence,'g2-app','real-app-output.glb'));
  const qa=JSON.parse(await fs.readFile(path.join(evidence,'g2-app','qa-report.json'),'utf8'));
  qa.jobId=jobId;
  const qaRaw=Buffer.from(JSON.stringify(qa,null,2)+'\n');
  const asset=(id,mime,bytes,kind='report')=>({id,kind,mime,bytes:bytes.length,sha256:sha(bytes)});
  await fs.writeFile(path.join(folder,'input.png'),source);
  await fs.writeFile(path.join(folder,'output.glb'),model);
  await fs.writeFile(path.join(folder,'qa-report.json'),qaRaw);
  const manifest={
    schema:'local3d.job.v1',id:jobId,
    providerId:'triposr-local',mode:'image',simulation:false,
    status:'completed',stage:'g2_ready_draft',progress:100,
    createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),
    completedAt:new Date().toISOString(),error:null,
    source:{mime:'image/png',bytes:source.length,name:'g2-licensed-chair-source.png'},
    assets:[
      asset('source-image','image/png',source,'source'),
      asset('preview-glb','model/gltf-binary',model,'model'),
      asset('qa-report','application/json',qaRaw)
    ]
  };
  await fs.writeFile(path.join(folder,'job.json'),JSON.stringify(manifest,null,2)+'\n');
  app=await createApp({
    dataDir:data,
    gpuLeaseRoot:path.join(dir,'gpu-lock'),
    triposrAdapter:{
      async run(){workerCalls++;throw new Error('FORBIDDEN: no GPU jobs in G3.4 CPU proof');}
    }
  });
  await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+app.server.address().port;
  const post=await fetch(base+'/v1/jobs/'+jobId+'/benchmark',{method:'POST'});
  const body=await post.json();
  assert.equal(post.status,200,JSON.stringify(body));
  assert.equal(body.status,'completed');
  const a=body.assets.find(x=>x.id==='benchmark-shape');
  assert.ok(a);
  const res=await fetch(base+'/v1/jobs/'+jobId+'/assets/benchmark-shape');
  assert.equal(res.status,200);
  const report=await res.json();
  assert.equal(report.schema,'local3d.g3.manual-job-shape-evaluation.v1');
  assert.equal(report.fixtureId,'09-upstream-chair');
  assert.equal(report.evaluation,'NO_GROUND_TRUTH_3D');
  assert.equal(report.shape,null);
  assert.equal(report.printQualified,false);
  assert.equal(report.modelInferenceExecuted,false);
  assert.equal(report.modelSha256,sha(model));
  assert.equal(report.imageSha256,sha(source));
  assert.equal(workerCalls,0);
  const repeat=await fetch(base+'/v1/jobs/'+jobId+'/benchmark',{method:'POST'});
  assert.equal(repeat.status,200);
  assert.equal(workerCalls,0);
  proof.passed=true;
  proof.historicalModelSha256=sha(model);
  proof.historicalImageSha256=sha(source);
  proof.resultSha256=a.sha256;
  proof.resultEvaluation=report.evaluation;
  proof.gpuWorkerCalls=workerCalls;
  proof.reportServedByApi=true;
  proof.reportDownloadable=true;
  proof.secondRequestIdempotent=true;
  console.log('G3_4_ACTUAL_PYTHON_EXISTING_CHAIR_CPU_PASS '+JSON.stringify(proof));
}catch(error){
  proof.failureClass=error?.name||'Error';
  console.error('G3_4_ACTUAL_CPU_PROOF_FAILED '+String(error?.stack||error));
  process.exitCode=1;
}finally{
  if(app)await app.close().catch(()=>{});
  await fs.rm(dir,{recursive:true,force:true});
  proof.testFixtureRemoved=true;
  await fs.mkdir(path.dirname(output),{recursive:true});
  const raw=JSON.stringify(proof,null,2)+'\n';
  const prev=await fs.readFile(output,'utf8').catch(e=>{if(e.code==='ENOENT')return null;throw e});
  if(prev!==null && prev!==raw)throw new Error('Refuse to overwrite a distinct prior G3.4 proof');
  if(prev===null)await fs.writeFile(output,raw,{flag:'wx'});
}
