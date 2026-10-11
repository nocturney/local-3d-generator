import assert from 'node:assert/strict';
import test from 'node:test';
import {EventEmitter} from 'node:events';
import {createAssetDeliveryBudget,deliverBudgetedVerifiedAsset,G348AssetDeliveryBusy} from '../server/g348-asset-delivery-budget.js';
const MiB=1024*1024;
class FakeResponse extends EventEmitter {
  destroyed=false;status=null;headers=null;body=null;
  writeHead(status,headers){this.status=status;this.headers=headers;}
  end(body){this.body=body;}
}
const asset={bytes:5,mime:'application/json'};
const reader=async()=>Buffer.from('hello');

test('default limits are bounded and initially unused',()=>{
 const state=createAssetDeliveryBudget().getState();
 assert.deepEqual(state,{active:0,reservedBytes:0,maxActive:2,maxReservedBytes:128*MiB});
});
test('max active slots are fail-fast, not queued',()=>{
 const b=createAssetDeliveryBudget({maxActive:2,maxReservedBytes:40});
 const a=b.reserve(8),c=b.reserve(7);
 assert.throws(()=>b.reserve(1),G348AssetDeliveryBusy);
 assert.deepEqual(b.getState().active,2);
 a();assert.equal(b.getState().active,1);c();assert.equal(b.getState().active,0);
});
test('aggregate bytes include 100MiB GLB and smaller report until response completion',()=>{
 const b=createAssetDeliveryBudget();const a=b.reserve(100*MiB),c=b.reserve(28*MiB);
 assert.throws(()=>b.reserve(1),G348AssetDeliveryBusy);
 a();const d=b.reserve(64*MiB);
 d();c();assert.equal(b.getState().reservedBytes,0);
});
test('max budget blocks large but individually valid asset',()=>{
 const b=createAssetDeliveryBudget({maxReservedBytes:16*MiB});
 assert.throws(()=>b.reserve(17*MiB),G348AssetDeliveryBusy);
 assert.equal(b.getState().active,0);
});
test('invalid sizes reject without mutating capacity',()=>{
 const b=createAssetDeliveryBudget();
 for(const n of [0,-1,1.5,NaN,Infinity,null,101*MiB])assert.throws(()=>b.reserve(n));
 assert.equal(b.getState().active,0);
});
test('invalid limiter construction rejected',()=>{
 for(const options of [{maxActive:0},{maxActive:33},{maxActive:1.5},{maxReservedBytes:0},{maxReservedBytes:Infinity}]) assert.throws(()=>createAssetDeliveryBudget(options));
});
test('double release is idempotent',()=>{
 const b=createAssetDeliveryBudget();const release=b.reserve(5);release();release();
 assert.equal(b.getState().reservedBytes,0);assert.equal(b.getState().active,0);
});
test('GET verified bytes sent and budget held until finish',async()=>{
 const b=createAssetDeliveryBudget();const res=new FakeResponse();
 await deliverBudgetedVerifiedAsset({res,jobDir:'/synthetic',asset,method:'GET',readVerified:reader,budget:b});
 assert.equal(res.status,200);assert.equal(res.body.toString(),'hello');
 assert.equal(res.headers['Content-Length'],5);assert.equal(b.getState().reservedBytes,5);
 res.emit('finish');assert.equal(b.getState().reservedBytes,0);
});
test('HEAD verifies content but sends no body and releases on close',async()=>{
 const b=createAssetDeliveryBudget();const res=new FakeResponse();let calls=0;
 await deliverBudgetedVerifiedAsset({res,jobDir:'/synthetic',asset,method:'HEAD',readVerified:async args=>{calls++;return reader(args);},budget:b});
 assert.equal(calls,1);assert.equal(res.body,undefined);assert.equal(res.headers['Content-Length'],5);
 res.emit('close');assert.equal(b.getState().active,0);
});
test('capacity error prevents invocation of disk verifier and response headers',async()=>{
 const b=createAssetDeliveryBudget({maxActive:1});const keep=b.reserve(5);let called=false;const res=new FakeResponse();
 await assert.rejects(deliverBudgetedVerifiedAsset({res,jobDir:'/synthetic',asset,method:'GET',readVerified:()=>{called=true;return reader();},budget:b}),G348AssetDeliveryBusy);
 assert.equal(called,false);assert.equal(res.status,null);keep();
});
test('reader failure frees slot without headers or bytes',async()=>{
 const b=createAssetDeliveryBudget();const res=new FakeResponse();
 await assert.rejects(deliverBudgetedVerifiedAsset({res,jobDir:'/synthetic',asset,method:'GET',readVerified:async()=>{throw new Error('SHA failed')},budget:b}));
 assert.equal(res.status,null);assert.equal(b.getState().active,0);
});
test('disconnect while asynchronous verification is pending does not free budget prematurely',async()=>{
 const b=createAssetDeliveryBudget({maxActive:1});const res=new FakeResponse();let resolveRead;
 const promise=deliverBudgetedVerifiedAsset({res,jobDir:'/synthetic',asset,method:'GET',readVerified:()=>new Promise(resolve=>{resolveRead=resolve}),budget:b});
 res.destroyed=true;res.emit('close');assert.equal(b.getState().active,1);
 assert.throws(()=>b.reserve(1),G348AssetDeliveryBusy);
 resolveRead(Buffer.from('hello'));await promise;
 assert.equal(res.status,null);assert.equal(b.getState().active,0);
});
test('reader returning different byte length fails closed',async()=>{
 const b=createAssetDeliveryBudget();const res=new FakeResponse();
 await assert.rejects(deliverBudgetedVerifiedAsset({res,jobDir:'/synthetic',asset,method:'GET',readVerified:async()=>Buffer.from('wrong-length'),budget:b}));
 assert.equal(b.getState().reservedBytes,0);assert.equal(res.status,null);
});
test('response write failure frees reservation and throws',async()=>{
 const b=createAssetDeliveryBudget();const res=new FakeResponse();res.writeHead=()=>{throw new Error('socket error')};
 await assert.rejects(deliverBudgetedVerifiedAsset({res,jobDir:'/synthetic',asset,method:'GET',readVerified:reader,budget:b}));
 assert.equal(b.getState().active,0);
});
