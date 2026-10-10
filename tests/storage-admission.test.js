import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createApp } from '../server/index.js';
import { listenFixtureSafePort } from './safe-loopback-fixture.mjs';
import {
  admitRealJobStorage, StorageAdmissionError, DEFAULT_G3_STORAGE_POLICY
} from '../server/storage-admission.js';

const MiB=1024*1024;
const GiB=1024**3;
const ID='22222222-2222-4222-8222-222222222222';
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function tempDir(){
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'local3d-g35-storage-'));
  const jobsDir=path.join(dir,'jobs');
  await fs.mkdir(jobsDir);
  return {dir,jobsDir,remove:()=>fs.rm(dir,{recursive:true,force:true})};
}
async function addJob(jobsDir,{valid=true,extraBytes=0}={}){
  const dir=path.join(jobsDir,ID);
  await fs.mkdir(dir);
  await fs.writeFile(path.join(dir,'job.json'),valid?
    JSON.stringify({id:ID,status:'completed',updatedAt:new Date().toISOString()}):'NOT_JSON');
  if(extraBytes)await fs.writeFile(path.join(dir,'output.glb'),Buffer.alloc(extraBytes));
}
const allowSpace=async()=>({bsize:4096n,bavail:BigInt(12*GiB/4096)});
function denied(error,code){return error instanceof StorageAdmissionError&&error.code===code;}

test('G3.5 storage admission accepts verified empty location without changing any files',async()=>{
  const env=await tempDir();
  try {
    const before=await fs.readdir(env.jobsDir);
    const result=await admitRealJobStorage({jobsDir:env.jobsDir,sourceBytes:145000,statfs:allowSpace});
    assert.equal(result.outcome,'ADMITTED');
    assert.equal(result.readOnly,true);
    assert.equal(result.deletedFiles,0);
    assert.equal(result.reserveBytes,DEFAULT_G3_STORAGE_POLICY.reservePerJobBytes);
    assert.deepEqual(await fs.readdir(env.jobsDir),before);
    assert.ok(!JSON.stringify(result).includes(env.dir));
  }finally{await env.remove()}
});

test('G3.5 storage admission rejects low disk free space without touching jobs',async()=>{
  const env=await tempDir();
  try {
    await addJob(env.jobsDir);
    const statfs=async()=>({bsize:4096n,bavail:BigInt(3*GiB/4096)});
    await assert.rejects(admitRealJobStorage({
      jobsDir:env.jobsDir,sourceBytes:1024,statfs
    }),e=>denied(e,'G3_LOW_DISK_SPACE'));
    assert.ok((await fs.stat(path.join(env.jobsDir,ID,'job.json'))).isFile());
  }finally{await env.remove()}
});

test('G3.5 storage cap reserves worst-case output before authorizing a GPU job',async()=>{
  const env=await tempDir();
  try {
    await addJob(env.jobsDir,{extraBytes:4*MiB});
    const policy={
      maxStoredBytes:18*MiB,reservePerJobBytes:16*MiB,
      minFreeBytesAfterReservation:1024,maxJobFolders:400
    };
    await assert.rejects(admitRealJobStorage({
      jobsDir:env.jobsDir,sourceBytes:1024,policy,statfs:allowSpace
    }),e=>denied(e,'G3_STORAGE_QUOTA'));
    assert.equal((await fs.stat(path.join(env.jobsDir,ID,'output.glb'))).size,4*MiB);
  }finally{await env.remove()}
});

test('G3.5 storage refuses unknown manifest, rogue file and invalid disk telemetry',async()=>{
  const env=await tempDir();
  try {
    await addJob(env.jobsDir,{valid:false});
    await assert.rejects(admitRealJobStorage({
      jobsDir:env.jobsDir,sourceBytes:1024,statfs:allowSpace
    }),e=>denied(e,'G3_STORAGE_UNVERIFIED'));
    await fs.writeFile(path.join(env.jobsDir,ID,'job.json'),
      JSON.stringify({id:ID,status:'completed',updatedAt:'2026-10-10T10:00:00Z'}));
    await fs.writeFile(path.join(env.jobsDir,'unexpected.txt'),'NO');
    await assert.rejects(admitRealJobStorage({
      jobsDir:env.jobsDir,sourceBytes:1024,statfs:allowSpace
    }),e=>denied(e,'G3_STORAGE_UNVERIFIED'));
    await fs.unlink(path.join(env.jobsDir,'unexpected.txt'));
    await assert.rejects(admitRealJobStorage({
      jobsDir:env.jobsDir,sourceBytes:1024,statfs:async()=>({bsize:0n,bavail:5n})
    }),e=>denied(e,'G3_STORAGE_UNVERIFIED'));
  }finally{await env.remove()}
});

test('G3.5 job-folder limit and filesystem failure are fail-closed, no deletion',async()=>{
  const env=await tempDir();
  try {
    await addJob(env.jobsDir);
    const policy={...DEFAULT_G3_STORAGE_POLICY,maxJobFolders:1};
    await assert.rejects(admitRealJobStorage({
      jobsDir:env.jobsDir,sourceBytes:1024,policy,statfs:allowSpace
    }),e=>denied(e,'G3_STORAGE_QUOTA'));
    await assert.rejects(admitRealJobStorage({
      jobsDir:env.jobsDir,sourceBytes:1024,statfs:async()=>{throw new Error('disk probe failed')}
    }),e=>denied(e,'G3_STORAGE_UNVERIFIED'));
    assert.ok((await fs.stat(path.join(env.jobsDir,ID,'job.json'))).isFile());
  }finally{await env.remove()}
});

test('Storage admission is G2-only, blocks before lease or Python; G1 remains usable',async()=>{
  const env=await tempDir();
  let app,leases=0,workers=0;
  try{
    app=await createApp({
      dataDir:path.join(env.dir,'data'),
      fixtureFile:path.join(env.dir,'fixture.glb'),
      stepMs:10,
      triposrAdapter:{async run(){workers++;throw new Error('SHOULD_NEVER_RUN')}},
      gpuLease:{async acquire(){leases++;throw new Error('SHOULD_NEVER_ACQUIRE')}},
      storageAdmission:async()=>{throw new StorageAdmissionError('G3_STORAGE_QUOTA','Cap reached')}
    });
    await listenFixtureSafePort(app.server);
    const base='http://127.0.0.1:'+app.server.address().port;
    const json=async(body)=> {
      const r=await fetch(base+'/v1/jobs',{method:'POST',
        headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      return {status:r.status,body:await r.json()};
    };
    const source=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAAY0lEQVR4nO3PQQ3AIADAQMAOrvCF14ngcVnSU9DOfe74s6UDXjWgNaA1oDWgNaA1oDWgNaA1oDWgNaA1oDWgNaA1oDWgNaA1oDWgNaA1oDWgNaA1oDWgNaA1oDWgNaA1oDWgfWv2AaqHnAIRAAAAAElFTkSuQmCC','base64');
    const deniedResponse=await json({
      providerId:'triposr-local',mode:'image',confirmGpu:true,
      image:{mime:'image/png',filename:'safe.png',base64:source.toString('base64')}
    });
    assert.equal(deniedResponse.status,507);
    assert.equal(deniedResponse.body.error.code,'G3_STORAGE_QUOTA');
    assert.equal(leases,0);assert.equal(workers,0);
    const noJobs=await fetch(base+'/v1/jobs').then(r=>r.json());
    assert.equal(noJobs.jobs.length,0);
    const health=await fetch(base+'/v1/health').then(r=>r.json());
    assert.equal(health.gpuBusy,false);
    const demo=await json({providerId:'fixture-demo',mode:'text',prompt:'simple demo'});
    assert.equal(demo.status,201);
    await sleep(100);
    assert.equal(workers,0);assert.equal(leases,0);
  }finally{if(app)await app.close();await env.remove()}
});
