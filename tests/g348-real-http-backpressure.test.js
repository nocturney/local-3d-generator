/**
 * G3.48: actual createApp HTTP budget test. Isolated synthetic 64MiB+ GLB,
 * not customer content, printable geometry or an AI/GPU benchmark.
 * Makes a real back-pressured socket retain the first response reservation.
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import {createReadStream} from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import {createHash} from "node:crypto";
import {once} from "node:events";
import {createApp} from "../server/index.js";
import {listenFixtureSafePort} from "./safe-loopback-fixture.mjs";

const MiB=1024*1024;
const BIG=64*MiB+4096; // Two reservations exceed the 128MiB app limit.
async function makeSyntheticEmptyGlb(file){
 const handle=await fs.open(file,"w");
 try{
  const chunk=Buffer.alloc(MiB,0x20);
  for(let at=20;at<BIG;at+=chunk.length)
   await handle.write(chunk,0,Math.min(chunk.length,BIG-at),at);
  const header=Buffer.alloc(20);
  header.write("glTF",0,"ascii");
  header.writeUInt32LE(2,4);
  header.writeUInt32LE(BIG,8);
  header.writeUInt32LE(BIG-20,12);
  header.writeUInt32LE(0x4e4f534a,16); // JSON chunk, padded with spaces.
  await handle.write(header,0,header.length,0);
  await handle.write('{"asset":{"version":"2.0"}}',20,"utf8");
 }finally{await handle.close();}
 const hash=createHash("sha256");
 for await(const bytes of createReadStream(file))hash.update(bytes);
 return hash.digest("hex");
}
async function waitPersisted(root,id){
 const filename=path.join(root,"data","jobs",id,"job.json");
 for(let i=0;i<500;i++){
  try{
   const value=JSON.parse(await fs.readFile(filename,"utf8"));
   if(value.status==="completed" && value.assets?.some(x=>x.id==="preview-glb"))
    return {filename,value};
  }catch{}
  await new Promise(r=>setTimeout(r,10));
 }
 throw Error("synthetic GLB job was not durably persisted");
}
async function start(root){
 const app=await createApp({dataDir:path.join(root,"data"),fixtureFile:path.join(root,"fixture.glb"),stepMs:5});
 await listenFixtureSafePort(app.server);
 return {app,base:"http://127.0.0.1:"+app.server.address().port};
}
async function holdResponse(url){
 return new Promise((resolve,reject)=>{
  const req=http.get(url,{agent:false},res=>{
   res.pause();
   resolve({req,res});
  });
  req.once("error",reject);
 });
}
test("G348 actual createApp HTTP GET/HEAD: paused 64MiB+ socket forces 503 then recovers",async()=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),"l3d-g348-backpressure-"));
 let live=null,first=null;
 try{
  live=await start(root);
  const created=await fetch(live.base+"/v1/jobs",{
   method:"POST",headers:{"Content-Type":"application/json"},
   body:JSON.stringify({providerId:"fixture-demo",mode:"text",prompt:"owned synthetic non-printable fixture"})
  });
  assert.equal(created.status,201);
  const {id}=await created.json();
  assert.match(id,/^[0-9a-f-]{36}$/);
  const {filename,value}=await waitPersisted(root,id);
  assert.equal(value.simulation,true);
  assert.equal(value.assets.filter(x=>x.id==="preview-glb").length,1);
  await live.app.close();live=null;
  const file=path.join(root,"data","jobs",id,"output.glb");
  const digest=await makeSyntheticEmptyGlb(file);
  const snapshot=JSON.parse(await fs.readFile(filename,"utf8"));
  const model=snapshot.assets.find(x=>x.id==="preview-glb");
  model.bytes=BIG;model.sha256=digest;
  await fs.writeFile(filename,JSON.stringify(snapshot));
  live=await start(root);
  const url=live.base+"/v1/jobs/"+id+"/assets/preview-glb";
  first=await holdResponse(url);
  assert.equal(first.res.statusCode,200);
  assert.equal(Number(first.res.headers["content-length"]),BIG);
  for(const method of ["GET","HEAD"]){
   const busy=await fetch(url,{method,signal:AbortSignal.timeout(10000)});
   assert.equal(busy.status,503,"second "+method+" must fail fast while first socket paused");
   if(method==="GET")assert.equal((await busy.json()).error.code,"G348_ASSET_BUSY");
   else assert.equal((await busy.arrayBuffer()).byteLength,0);
  }
  let byteCount=0;const received=createHash("sha256");
  first.res.on("data",buf=>{byteCount+=buf.length;received.update(buf);});
  const end=once(first.res,"end");
  first.res.resume();
  await end;
  assert.equal(byteCount,BIG);
  assert.equal(received.digest("hex"),digest);
  first=null;
  const recovered=await fetch(url,{method:"HEAD",signal:AbortSignal.timeout(10000)});
  assert.equal(recovered.status,200);
  assert.equal(Number(recovered.headers.get("content-length")),BIG);
  assert.equal((await recovered.arrayBuffer()).byteLength,0);
 }finally{
  if(first){first.res.resume();first.req.destroy();}
  if(live)await live.app.close();
  await fs.rm(root,{recursive:true,force:true,maxRetries:3,retryDelay:80});
 }
});
