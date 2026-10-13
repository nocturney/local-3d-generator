/** G3.48: real createApp GET+HEAD must retain G3.47's HTTP 409 for corrupt persisted size.
 * Synthetic G1 fixture only; no network egress, GPU, native decoder, customer assets or print.
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {createApp} from "../server/index.js";
import {listenFixtureSafePort} from "./safe-loopback-fixture.mjs";

async function start(root) {
 const app=await createApp({dataDir:path.join(root,"data"),fixtureFile:path.join(root,"fixture.glb"),stepMs:5});
 await listenFixtureSafePort(app.server);
 return {app,base:"http://127.0.0.1:"+app.server.address().port};
}
async function completed(base,id) {
 for(let i=0;i<200;i++){
  const response=await fetch(base+"/v1/jobs/"+id);
  const value=await response.json();
  if(value.status==="completed")return value;
  await new Promise(resolve=>setTimeout(resolve,10));
 }
 throw new Error("fixture job did not complete");
}
for(const [description, corrupt] of [
 ["negative", -1],
 ["too large", 100*1024*1024+1],
 ["not an integer", 3.5]
]) {
 test("G348 API invalid persisted "+description+" asset length retains 409 for GET and HEAD",async()=>{
  const root=await fs.mkdtemp(path.join(os.tmpdir(),"l3d-g348-http-corrupt-"));
  let live=null;
  try{
   live=await start(root);
   const create=await fetch(live.base+"/v1/jobs",{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({providerId:"fixture-demo",mode:"text",prompt:"synthetic draft sculpture"})});
   assert.equal(create.status,201);
   const record=await create.json();
   const done=await completed(live.base,record.id);
   assert.equal(done.simulation,true);
   assert.ok(done.assets.some(x=>x.id==="preview-glb"));
   await live.app.close();live=null;
   const file=path.join(root,"data","jobs",record.id,"job.json");
   const manifest=JSON.parse(await fs.readFile(file,"utf8"));
   const asset=manifest.assets.find(x=>x.id==="preview-glb");
   asset.bytes=corrupt;
   await fs.writeFile(file,JSON.stringify(manifest));
   live=await start(root);
   const url=live.base+"/v1/jobs/"+record.id+"/assets/preview-glb";
   for(const method of ["GET","HEAD"]){
    const res=await fetch(url,{method});
    assert.equal(res.status,409);
    if(method==="GET") assert.equal((await res.json()).error.code,"G347_ASSET_UNVERIFIED");
    else assert.equal((await res.arrayBuffer()).byteLength,0);
   }
  }finally{
   if(live)await live.app.close();
   await fs.rm(root,{recursive:true,force:true});
  }
 });
}
