import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {createApp} from '../server/index.js';
import {listenFixtureSafePort} from './safe-loopback-fixture.mjs';

const probes=[
 {name:'PNG',mime:'image/png',bytes:Buffer.concat([
   Buffer.from([137,80,78,71,13,10,26,10]),Buffer.alloc(24)])},
 {name:'JPEG',mime:'image/jpeg',bytes:Buffer.concat([
   Buffer.from([255,216,255]),Buffer.alloc(24)])},
 {name:'WEBP',mime:'image/webp',bytes:Buffer.concat([
   Buffer.from('RIFF'),Buffer.alloc(4),Buffer.from('WEBP'),Buffer.alloc(24)])}
];
async function withFixtureServer(callback){
 const temp=await fs.mkdtemp(path.join(os.tmpdir(),'local3d-g326-safe-'));
 let app;
 try{
   app=await createApp({dataDir:path.join(temp,'data'),fixtureFile:path.join(temp,'fixture.glb'),stepMs:1000});
   await listenFixtureSafePort(app.server);
   const base='http://127.0.0.1:'+app.server.address().port;
   const post=async(bytes,mime)=>{
     const response=await fetch(base+'/v1/jobs',{
       method:'POST',headers:{'content-type':'application/json'},
       body:JSON.stringify({providerId:'fixture-demo',mode:'image',
         image:{filename:'synthetic-example.png',mime,base64:bytes.toString('base64')}})
     });
     return {status:response.status,body:await response.json()};
   };
   const health=await fetch(base+'/v1/health');
   assert.equal(health.status,200);
   assert.equal((await health.json()).inference,false);
   await callback(post);
 }finally{
   if(app)await app.close();
   await fs.rm(temp,{recursive:true,force:true});
 }
}
test('G3.26 REAL G1 HTTP admission: short magic alone admits harmless incomplete synthetic buffers',async()=>{
 await withFixtureServer(async(post)=>{
   for(const {name,mime,bytes} of probes){
     const got=await post(bytes,mime);
     assert.equal(got.status,201,name);
     assert.equal(got.body.simulation,true,name);
     assert.equal(got.body.providerId,'fixture-demo',name);
     assert.ok(got.body.id,name);
   }
 });
});

test('G3.26 REAL G1 HTTP admission: wrong declared MIME or unknown prefix fails before any job',async()=>{
 await withFixtureServer(async(post)=>{
   for(const {name,mime,bytes} of probes){
     const wrong=mime==='image/png'?'image/jpeg':'image/png';
     const got=await post(bytes,wrong);
     assert.equal(got.status,422,name);
     assert.equal(got.body.error.code,'BAD_IMAGE',name);
   }
   const unknown=await post(Buffer.from('harmless-not-a-format'),'image/png');
   assert.equal(unknown.status,422);
   assert.equal(unknown.body.error.code,'BAD_IMAGE');
 });
});

test('G3.26 source-linked public Pillow fixture proof says format sniffing is not security clearance',async()=>{
 const root=path.resolve(import.meta.dirname,'..');
 const p=JSON.parse(await fs.readFile(path.join(root,'docs/evidence/g3/g3-26-harmless-image-boundary.json'),'utf8'));
 const parentBytes=await fs.readFile(path.join(root,'docs/evidence/g3/g3-25-pillow-format-review.json'));
 assert.equal(p.previousG325SanitizedProofSha256,crypto.createHash('sha256').update(parentBytes).digest('hex'));
 assert.deepEqual(p.pillowSourceTests.results.map(x=>x.format),['PNG','JPEG','WEBP']);
 assert.ok(p.pillowSourceTests.results.every(x=>
  x.syntheticPixelDimensions.join('x')==='64x64'&&x.dangerousParserPayloadUsed===false));
 assert.equal(p.pillowSourceTests.sourceImageFormatCount,3);
 assert.equal(p.headerCheckNotFullImageValidation,true);
 assert.equal(p.workerAndApiIntegrationNotCertifiedByInMemoryPillowProbe,true);
 assert.equal(p.all32PillowAdvisoryApplicabilityUnresolved,true);
 assert.equal(p.securityIssue4Resolved,false);
 assert.equal(p.newUntrustedUploadsAllowed,false);
 assert.equal(p.nativeParserOSConfinementVerified,false);
 assert.equal(p.modelExecutions,0);
 assert.equal(p.gpuInferenceRuns,0);
 assert.equal(p.printQualified,false);
 assert.equal(p.approvedForPrinter,false);
 assert.equal(p.fabricationAction,'NONE');
 const raw=await fs.readFile(path.join(root,'docs/evidence/g3/g3-26-harmless-image-boundary.json'),'utf8');
 assert.doesNotMatch(raw,/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
 assert.doesNotMatch(raw,/D:[/\\]|privateJob|customerEmail|apiToken|sourceImagePath/i);
});
