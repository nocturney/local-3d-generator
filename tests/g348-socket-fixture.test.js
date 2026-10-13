/** G3.48 DRAFT: socket-level CPU fixture for fail-fast persisted asset delivery.
 * Loopback-only, synthetic bytes, no production listener, inference or printer.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {createAssetDeliveryBudget, deliverBudgetedVerifiedAsset,
  G348AssetDeliveryBusy} from '../server/g348-asset-delivery-budget.js';
import {listenFixtureSafePort} from './safe-loopback-fixture.mjs';
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const bytes=Buffer.from('hello');
const asset={bytes:bytes.length,mime:'text/plain'};
async function fixture(){
 const budget=createAssetDeliveryBudget({maxActive:1,maxReservedBytes:64});
 const waiting=[];let reads=0;
 const server=http.createServer(async(req,res)=>{
  try{
   await deliverBudgetedVerifiedAsset({
    res,jobDir:'/synthetic',asset,method:req.method,budget,
    readVerified:()=>{reads++;return new Promise(resolve=>waiting.push(resolve))}
   });
  }catch(error){
   if(res.destroyed||res.headersSent)return;
   res.writeHead(error instanceof G348AssetDeliveryBusy?503:500,
    {'Content-Type':'text/plain'});
   res.end('blocked');
  }
 });
 const port=await listenFixtureSafePort(server);
 return {base:'http://127.0.0.1:'+port,budget,waiting,
  get reads(){return reads},
  close:()=>new Promise(resolve=>server.close(resolve))};
}
async function until(condition){
 const deadline=Date.now()+1500;
 while(!condition()){
  if(Date.now()>deadline)throw new Error('fixture timeout');
  await sleep(5);
 }
}
test('real loopback GET: concurrent request 503 before read, then slot reopens',async()=>{
 const f=await fixture();
 try{
  const first=fetch(f.base+'/first');await until(()=>f.reads===1);
  const denied=await fetch(f.base+'/overload');
  assert.equal(denied.status,503);assert.equal(f.reads,1);
  f.waiting.shift()(bytes);
  const good=await first;assert.equal(good.status,200);
  assert.equal(await good.text(),'hello');
  await until(()=>f.budget.getState().active===0);
  const next=fetch(f.base+'/after');await until(()=>f.reads===2);
  f.waiting.shift()(bytes);
  const reopened=await next;assert.equal(reopened.status,200);
  assert.equal(await reopened.text(),'hello');
 }finally{await f.close()}
});
test('real loopback HEAD verifies the complete byte count but returns no body',async()=>{
 const f=await fixture();
 try{
  const req=fetch(f.base+'/head',{method:'HEAD'});
  await until(()=>f.reads===1);
  assert.equal(f.budget.getState().active,1);
  f.waiting.shift()(bytes);
  const response=await req;
  assert.equal(response.status,200);
  assert.equal(response.headers.get('content-length'),'5');
  assert.equal((await response.arrayBuffer()).byteLength,0);
  await until(()=>f.budget.getState().active===0);
 }finally{await f.close()}
});
test('socket disconnect during pending verification holds capacity until reader settles',async()=>{
 const f=await fixture();
 try{
  const request=http.get(f.base+'/aborted',response=>response.resume());
  request.on('error',()=>{});
  await until(()=>f.reads===1);
  request.destroy();await sleep(20);
  assert.equal(f.budget.getState().active,1);
  const denied=await fetch(f.base+'/retry');
  assert.equal(denied.status,503);assert.equal(f.reads,1);
  f.waiting.shift()(bytes);
  await until(()=>f.budget.getState().active===0);
 }finally{await f.close()}
});
