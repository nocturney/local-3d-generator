import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fork } from 'node:child_process';
import { createGpuLease } from '../server/gpu-lease.js';

async function sandbox() {
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'local3d-cooperative-lease-'));
  return {dir,root:path.join(dir,'global-gpu'),close:()=>fs.rm(dir,{force:true,recursive:true})};
}
test('GPU lease allows one owner at a time across instances and is idempotently released',async()=>{
  const s=await sandbox();
  try{
    const a=createGpuLease({root:s.root}),b=createGpuLease({root:s.root});
    assert.deepEqual(await a.inspect(),{locked:false});
    const owner=await a.acquire({jobId:'A'});
    const active=await a.inspect();
    assert.equal(active.locked,true);
    assert.equal(active.owner?.jobId,'A');
    await assert.rejects(b.acquire({jobId:'B'}),e=>e.code==='G2_SHARED_GPU_BUSY');
    await owner.release();await owner.release();
    assert.deepEqual(await a.inspect(),{locked:false});
    const second=await b.acquire({jobId:'B'});
    assert.equal((await b.inspect()).owner.jobId,'B');
    await second.release();
    assert.equal((await a.inspect()).locked,false);
  }finally{await s.close()}
});

test('crashed/invalid lease owner is NEVER silently stolen or auto-cleared',async()=>{
  const s=await sandbox();
  try{
    const a=createGpuLease({root:s.root});
    await fs.mkdir(a.lockDir,{recursive:true});
    const before=await a.inspect();
    assert.deepEqual(before,{locked:true,owner:null});
    await assert.rejects(a.acquire({jobId:'new'}),e=>e.code==='G2_SHARED_GPU_BUSY');
    assert.ok((await fs.stat(a.lockDir)).isDirectory());
    await fs.writeFile(path.join(a.lockDir,'owner.json'),'{invalid-json');
    await assert.rejects(a.acquire({jobId:'new'}),e=>e.code==='G2_SHARED_GPU_BUSY');
    assert.equal((await a.inspect()).owner,null);
  }finally{await s.close()}
});

test('owner-id mismatch prevents dangerous release of another process lock',async()=>{
  const s=await sandbox();
  try{
    const a=createGpuLease({root:s.root});
    const one=await a.acquire({jobId:'owner'});
    const ownerFile=path.join(a.lockDir,'owner.json');
    const record=JSON.parse(await fs.readFile(ownerFile,'utf8'));
    record.leaseId='not-the-owner-id';
    await fs.writeFile(ownerFile,JSON.stringify(record));
    await assert.rejects(one.release(),e=>e.code==='G2_LEASE_OWNERSHIP');
    assert.equal((await a.inspect()).locked,true);
  }finally{await s.close()}
});

test('another Windows/Node process actually holds a shared lock and blocks this process',async()=>{
  const s=await sandbox();
  const file=path.resolve(import.meta.dirname,'fixtures/gpu-lease-holder.mjs');
  const child=fork(file,[s.root],{silent:true});
  try{
    const started=await Promise.race([
      new Promise((resolve,reject)=>{
        child.once('message',resolve);child.once('error',reject);
        child.once('exit',code=>reject(new Error('Mock child exited before ready: '+code)));
      }),
      new Promise((_,reject)=>setTimeout(()=>reject(new Error('Mock child lease setup timeout')),10000))
    ]);
    assert.equal(started.status,'locked',JSON.stringify(started));
    assert.notEqual(started.pid,process.pid);
    const lease=createGpuLease({root:s.root});
    await assert.rejects(lease.acquire({jobId:'parent'}),e=>e.code==='G2_SHARED_GPU_BUSY');
    child.send('release');
    const released=await new Promise((resolve,reject)=>{
      child.on('message',resolve);child.once('error',reject);
    });
    assert.equal(released.status,'released',JSON.stringify(released));
    await new Promise(resolve=>child.once('exit',resolve));
    assert.equal((await lease.inspect()).locked,false);
    const own=await lease.acquire({jobId:'parent'});
    await own.release();
  }finally{
    if(child.exitCode===null)child.kill('SIGKILL');
    await s.close();
  }
});
