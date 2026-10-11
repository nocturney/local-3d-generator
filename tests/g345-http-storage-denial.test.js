/** G3.45 extra HTTP-path integration, deliberately outside the frozen
 * nine-native-path SHA proof. Only temp synthetic input, no actual CUDA.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {createApp} from '../server/index.js';
import {listenFixtureSafePort} from './safe-loopback-fixture.mjs';

const png=Buffer.from(
 'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAAY0lEQVR4nO3PQQ3AIADAQMAOrvCF14ngcVnSU9DOfe74s6UDXjWgNaA1oDWgNaA1oDWgNaA1oDWgNaA1oDWgNaA1oDWgNaA1oDWgNaA1oDWgNaA1oDWgNaA1oDWgNaA1oDWgfWv2AaqHnAIRAAAAAElFTkSuQmCC',
 'base64');
async function temp(){
 const realTemp=await fs.realpath(os.tmpdir());
 const root=await fs.mkdtemp(path.join(realTemp,'local3d-g345-http-owned-'));
 return {root,cleanup:()=>fs.rm(root,{recursive:true,force:true})};
}
async function simulateBlockedReal(app){
 await listenFixtureSafePort(app.server);
 const base='http://127.0.0.1:'+app.server.address().port;
 const response=await fetch(base+'/v1/jobs',{
  method:'POST',headers:{'Content-Type':'application/json'},
  body:JSON.stringify({providerId:'triposr-local',mode:'image',
    confirmGpu:true,image:{mime:'image/png',filename:'synthetic.png',
     base64:png.toString('base64')}})
 });
 const body=await response.json();
 return {response,body,base};
}
function guards(){
 let lease=0,worker=0;
 return {
  triposrAdapter:{async run(){worker++;throw Error('GPU EXECUTION FORBIDDEN')}},
  gpuLease:{async acquire(){lease++;throw Error('LEASE EXECUTION FORBIDDEN')}},
  counts:()=>({lease,worker})
 };
}
test('G3.45 actual HTTP G2 admission refuses Windows parent Junction BEFORE GPU lease',async t=>{
 const env=await temp();
 let app;
 try{
  const target=path.join(env.root,'ordinary-real-parent');
  await fs.mkdir(target);
  const redirect=path.join(env.root,'redirect-parent');
  try{await fs.symlink(target,redirect,process.platform==='win32'?'junction':'dir');}
  catch(e){if(['EPERM','EACCES','ENOSYS'].includes(e.code)){t.skip('Junction unavailable');return;}throw e;}
  const gated=guards();
  app=await createApp({
   dataDir:path.join(redirect,'app-data'),fixtureFile:path.join(env.root,'demo.glb'),
   stepMs:10,triposrAdapter:gated.triposrAdapter,gpuLease:gated.gpuLease
  });
  const {response,body,base}=await simulateBlockedReal(app);
  assert.equal(response.status,503);
  assert.equal(body.error.code,'G3_STORAGE_UNVERIFIED');
  assert.deepEqual(gated.counts(),{lease:0,worker:0});
  const jobs=await fetch(base+'/v1/jobs').then(r=>r.json());
  assert.equal(jobs.jobs.length,0);
  assert.equal((await fs.lstat(redirect)).isSymbolicLink(),true);
 }finally{if(app)await app.close();await env.cleanup();}
});
test('G3.45 actual HTTP G2 admission refuses linked manifest BEFORE GPU lease',async()=>{
 const env=await temp();
 let app;
 try{
  const dataDir=path.join(env.root,'data'),jobsDir=path.join(dataDir,'jobs');
  const id=randomUUID(),jobDir=path.join(jobsDir,id);
  await fs.mkdir(jobDir,{recursive:true});
  const outside=path.join(env.root,'synthetic-reference-owned.json');
  await fs.writeFile(outside,JSON.stringify({id,status:'completed',
   updatedAt:'2026-10-11T10:00:00Z'}));
  await fs.link(outside,path.join(jobDir,'job.json'));
  const gated=guards();
  app=await createApp({dataDir,fixtureFile:path.join(env.root,'fixture.glb'),
   triposrAdapter:gated.triposrAdapter,gpuLease:gated.gpuLease,stepMs:10});
  const {response,body}=await simulateBlockedReal(app);
  assert.equal(response.status,503);
  assert.equal(body.error.code,'G3_STORAGE_UNVERIFIED');
  assert.deepEqual(gated.counts(),{lease:0,worker:0});
  assert.ok((await fs.stat(outside)).isFile());
 }finally{if(app)await app.close();await env.cleanup();}
});
