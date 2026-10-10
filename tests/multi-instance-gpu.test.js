import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createApp } from '../server/index.js';
import { listenFixtureSafePort } from './safe-loopback-fixture.mjs';

const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const tinyPng=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI_ScL_nwAAAABJRU5ErkJggg'.replace(/_/g,'/'),'base64');
const requestPayload={
  providerId:'triposr-local',confirmGpu:true,mode:'image',prompt:'Simulated child; no GPU',
  image:{filename:'test.png',mime:'image/png',base64:tinyPng.toString('base64')}
};
const stub=duration=>{
  const state={calls:0};
  return {
    state,
    async run({signal,onStage}){
      state.calls++;
      onStage('gpu_guard');
      await new Promise((resolve,reject)=>{
        const timer=setTimeout(resolve,duration);
        signal.addEventListener('abort',()=>{
          clearTimeout(timer);reject(Object.assign(new Error('cancelled'),{code:'CANCELLED'}));
        },{once:true});
      });
      throw Object.assign(new Error('No GPU used. Deliberate fake-child terminal state'),
        {code:'G2_MOCK_NO_GPU'});
    }
  };
};
test('two separate LOCAL3D HTTP app instances on different ports cannot overlap GPU reservations',async()=>{
  const base=await fs.mkdtemp(path.join(os.tmpdir(),'local3d-gpu-multi-app-'));
  const root=path.join(base,'SHARED-GPU');
  const aStub=stub(420),bStub=stub(60);
  const servers=[];
  try{
    for(const [i,engine] of [aStub,bStub].entries()){
      const app=await createApp({
        dataDir:path.join(base,'instance-'+i),
        fixtureFile:path.join(base,'fixture-'+i+'.glb'),
        gpuLeaseRoot:root,triposrAdapter:engine
      });
      await listenFixtureSafePort(app.server);
      servers.push({app,base:'http://127.0.0.1:'+app.server.address().port});
    }
    async function post(server){
      const res=await fetch(server.base+'/v1/jobs',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify(requestPayload)
      });
      return {status:res.status,body:await res.json()};
    }
    async function waitFinished(server,id){
      const stop=Date.now()+5000;
      while(Date.now()<stop){
        const r=await fetch(server.base+'/v1/jobs/'+id);
        const job=await r.json();
        const health=await (await fetch(server.base+'/v1/health')).json();
        if(job.status==='failed'&&!health.gpuBusy)return job;
        await sleep(20);
      }
      throw new Error('Timed out waiting for mock process release');
    }
    const first=await post(servers[0]);
    assert.equal(first.status,201);
    const next=await post(servers[1]);
    assert.equal(next.status,409);
    assert.equal(next.body.error.code,'G2_SHARED_GPU_BUSY');
    assert.equal(bStub.state.calls,0,'second app must not allocate fake worker');
    assert.deepEqual((await(await fetch(servers[1].base+'/v1/jobs')).json()).jobs,[],
      'blocked second app must not store a ghost job');
    const failed=await waitFinished(servers[0],first.body.id);
    assert.equal(failed.error.code,'G2_MOCK_NO_GPU');
    const after=await post(servers[1]);
    assert.equal(after.status,201,'lease must become available after actual runner termination');
    await waitFinished(servers[1],after.body.id);
    assert.equal(aStub.state.calls,1);assert.equal(bStub.state.calls,1);
  }finally{
    for(const server of servers)await server.app.close().catch(()=>{});
    await fs.rm(base,{recursive:true,force:true});
  }
});
