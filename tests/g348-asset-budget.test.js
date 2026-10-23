import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createApp} from '../server/index.js';
import {readShaVerifiedJobAsset} from '../server/g347-http-asset-integrity.js';
import {listenFixtureSafePort} from './safe-loopback-fixture.mjs';
import {
  createAssetReadBudget,MAX_SINGLE_ASSET_BYTES,MAX_ACTIVE_ASSET_BYTES
} from '../server/g348-asset-read-budget.js';

test('G3.48 real production 128 MiB budget refuses a second 100 MiB read before allocating',()=>{
  const gate=createAssetReadBudget();
  const first=gate.reserve(MAX_SINGLE_ASSET_BYTES);
  assert.equal(typeof first,'function');
  assert.equal(gate.reserve(MAX_SINGLE_ASSET_BYTES),null);
  const second=gate.reserve(MAX_ACTIVE_ASSET_BYTES-MAX_SINGLE_ASSET_BYTES);
  assert.equal(typeof second,'function');
  assert.equal(gate.reserve(1),null);
  first();first();
  const third=gate.reserve(MAX_SINGLE_ASSET_BYTES);
  assert.equal(typeof third,'function');
  third();second();
  assert.equal(typeof gate.reserve(MAX_SINGLE_ASSET_BYTES),'function');
});

test('G3.48 slots reject a third tiny read and double release never steals another reservation',()=>{
  const gate=createAssetReadBudget();
  const a=gate.reserve(32),b=gate.reserve(32);
  assert.equal(gate.reserve(1),null);
  a();a();
  const c=gate.reserve(64);
  assert.equal(typeof c,'function');
  assert.equal(gate.reserve(1),null);
  b();c();
  const d=gate.reserve(64);
  assert.equal(typeof d,'function');
  d();
});

test('G3.48 non-integer, negative and oversized declarations fail closed',()=>{
  const gate=createAssetReadBudget();
  for(const size of [0,-1,NaN,Infinity,1.5,String(MAX_SINGLE_ASSET_BYTES),MAX_SINGLE_ASSET_BYTES+1,Number.MAX_SAFE_INTEGER]){
    assert.throws(()=>gate.reserve(size),RangeError);
  }
  for(const options of [{maxBytes:MAX_ACTIVE_ASSET_BYTES+1},{maxReads:3},
    {maxBytes:0},{maxReads:0},{maxBytes:Infinity},{maxBytes:12.5}]){
    assert.throws(()=>createAssetReadBudget(options),RangeError);
  }
  const small=createAssetReadBudget({maxBytes:10,maxReads:1});
  assert.equal(small.reserve(11),null);
  const release=small.reserve(10);
  assert.equal(typeof release,'function');
  assert.equal(small.reserve(1),null);
  release();
  assert.equal(typeof small.reserve(10),'function');
});

const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(predicate,what){
  for(let i=0;i<100;i++){
    if(predicate())return;
    await pause(20);
  }
  throw new Error('Timed out waiting for '+what);
}

test('G3.48 actual loopback GET+HEAD enforce busy denial, unrelated health and recovery',async()=>{
  const tmp=await fs.mkdtemp(path.join(await fs.realpath(os.tmpdir()),'l3d-g348-owned-'));
  const blockers=[];
  const app=await createApp({
    dataDir:path.join(tmp,'data'),fixtureFile:path.join(tmp,'fixture.glb'),stepMs:15,
    // Delay ONLY the read, then run the real SHA/filehandle verifier.
    verifiedAssetReader:async args=>{
      if(args.asset.id==='preview-glb')await new Promise(resolve=>blockers.push(resolve));
      return readShaVerifiedJobAsset(args);
    }
  });
  let first=null,second=null,third=null;
  try{
    await listenFixtureSafePort(app.server);
    const base='http://127.0.0.1:'+app.server.address().port;
    const created=await fetch(base+'/v1/jobs',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({providerId:'fixture-demo',mode:'text',prompt:'owned test fixture'})
    });
    assert.equal(created.status,201);
    const {id}=await created.json();
    let done;
    for(let n=0;n<100;n++){
      const status=await fetch(base+'/v1/jobs/'+id).then(r=>r.json());
      if(status.status==='completed'){done=status;break;}
      await pause(20);
    }
    assert.equal(done?.status,'completed');
    const model=done.assets.find(a=>a.id==='preview-glb');
    const url=base+'/v1/jobs/'+id+'/assets/preview-glb';
    first=fetch(url);
    second=fetch(url,{method:'HEAD'});
    await until(()=>blockers.length===2,'two distinct verified reads');
    const busy=await fetch(url);
    assert.equal(busy.status,503);
    assert.equal(busy.headers.get('retry-after'),'1');
    assert.equal((await busy.json()).error.code,'G348_ASSET_BUSY');
    const headBusy=await fetch(url,{method:'HEAD'});
    assert.equal(headBusy.status,503);
    assert.equal((await headBusy.arrayBuffer()).byteLength,0);
    assert.equal((await fetch(base+'/v1/health')).status,200);
    blockers.shift()();
    const success=await first;
    assert.equal(success.status,200);
    assert.equal((await success.arrayBuffer()).byteLength,model.bytes);
    third=fetch(url);
    await until(()=>blockers.length===2,'released slot reused');
    blockers.shift()();
    const head=await second;
    assert.equal(head.status,200);
    assert.equal(Number(head.headers.get('content-length')),model.bytes);
    assert.equal((await head.arrayBuffer()).byteLength,0);
    blockers.shift()();
    const recovered=await third;
    assert.equal(recovered.status,200);
    assert.equal((await recovered.arrayBuffer()).byteLength,model.bytes);
  } finally {
    while(blockers.length)blockers.shift()();
    await app.close();
    await fs.rm(tmp,{force:true,recursive:true});
  }
});
