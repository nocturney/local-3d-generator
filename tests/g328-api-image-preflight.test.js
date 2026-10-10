/**
 * G3.28 CPU-only REAL LOCAL API tests for structural admission before jobs/GPU.
 * Synthetic trusted fixtures only; mocked adapter is never called for rejects.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createApp} from '../server/index.js';
import {listenFixtureSafePort} from './safe-loopback-fixture.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=JSON.parse(await fs.readFile(path.join(root,'tests/fixtures/g327-synthetic-images.json'),'utf8'));
const original=source.images.map(x=>({...x,raw:Buffer.from(x.base64,'base64')}));
async function withApp(adapter, fn){
 const tmp=await fs.mkdtemp(path.join(os.tmpdir(),'local3d-g328-'));
 let app;
 try{
  app=await createApp({
   dataDir:path.join(tmp,'data'),fixtureFile:path.join(tmp,'fixture.glb'),
   stepMs:65,gpuLeaseRoot:path.join(tmp,'gpu-lock'),...(adapter?{triposrAdapter:adapter}:{})
  });
  await listenFixtureSafePort(app.server);
  const base='http://127.0.0.1:'+app.server.address().port;
  const request=async(url,method='GET',payload)=>{
   const resp=await fetch(base+url,{method,
    headers:payload?{'Content-Type':'application/json'}:{},
    body:payload?JSON.stringify(payload):undefined});
   return {status:resp.status,json:await resp.json()};
  };
  const post=async(bytes,mime,providerId='fixture-demo')=>request('/v1/jobs','POST',{
   providerId,mode:'image',confirmGpu:true,prompt:'trusted synthetic G3.28 only',
   image:{mime,filename:'synthetic.png',base64:bytes.toString('base64')}
  });
  await fn({post,request,app,tmp});
 }finally{
  if(app)await app.close();
  await fs.rm(tmp,{recursive:true,force:true});
 }
}
test('G3.28 actual G1 HTTP admits full, original 64x64 synthetic PNG/JPEG/WebP',async()=>{
 await withApp(null,async({post,request})=>{
  for(const x of original){
   const r=await post(x.raw,x.mime);
   assert.equal(r.status,201,x.format);
   assert.equal(r.json.simulation,true,x.format);
  }
  assert.equal((await request('/v1/jobs')).json.jobs.length,3);
 });
});
test('G3.28 real G1 API rejects header-only/truncated images BEFORE a job is created',async()=>{
 await withApp(null,async({post,request})=>{
  for(const x of original){
   for(const length of [x.format==='WEBP'?12:x.format==='PNG'?8:3,
    Math.floor(x.raw.length/2),x.raw.length-1]){
    const res=await post(x.raw.subarray(0,length),x.mime);
    assert.equal(res.status,422,x.format+' '+length);
    assert.equal(res.json.error.code,'BAD_IMAGE_STRUCTURE');
   }
  }
  assert.equal((await request('/v1/jobs')).json.jobs.length,0);
 });
});
test('G3.28 actual G1 API preserves old BAD_IMAGE MIME mismatch and rejects bad PNG CRC',async()=>{
 await withApp(null,async({post,request})=>{
  for(const x of original){
   const badMime=await post(x.raw,x.mime==='image/png'?'image/jpeg':'image/png');
   assert.equal(badMime.status,422);
   assert.equal(badMime.json.error.code,'BAD_IMAGE');
  }
  const png=original.find(x=>x.format==='PNG'),broken=Buffer.from(png.raw);
  broken[42]^=1;
  const got=await post(broken,png.mime);
  assert.equal(got.status,422);
  assert.equal(got.json.error.code,'BAD_IMAGE_STRUCTURE');
  assert.equal((await request('/v1/jobs')).json.jobs.length,0);
 });
});
test('G3.28 manual G2 MOCK rejects incomplete image before ANY mock adapter invocation or job',async()=>{
 let calls=0;
 const adapter={async run(){calls++;throw new Error('unexpected G2 fake adapter call')}};
 await withApp(adapter,async({post,request})=>{
  for(const x of original){
   const prefix=x.raw.subarray(0,x.format==='WEBP'?12:x.format==='PNG'?8:3);
   const got=await post(prefix,x.mime,'triposr-local');
   assert.equal(got.status,422,x.format);
   assert.equal(got.json.error.code,'BAD_IMAGE_STRUCTURE');
  }
  assert.equal(calls,0);
  assert.equal((await request('/v1/jobs')).json.jobs.length,0);
 });
});
test('G3.28 G2 still requires fresh GPU consent and cannot be activated with only a valid image',async()=>{
 const adapter={async run(){throw new Error('unexpected')}};
 await withApp(adapter,async({request})=>{
  const x=original[0];
  const got=await request('/v1/jobs','POST',{providerId:'triposr-local',mode:'image',confirmGpu:false,
   image:{mime:x.mime,filename:'no-consent.png',base64:x.base64}});
  assert.equal(got.status,422);
  assert.equal(got.json.error.code,'G2_CONFIRM_REQUIRED');
  assert.equal((await request('/v1/jobs')).json.jobs.length,0);
 });
});
