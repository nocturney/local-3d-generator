import {test} from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {randomInt} from 'node:crypto';
import {listenFixtureSafePort,SAFE_MIN,SAFE_MAX} from './safe-loopback-fixture.mjs';

const close=s=>new Promise((resolve,reject)=>s.close(e=>e?reject(e):resolve()));
const make=()=>http.createServer((_req,res)=>{
  res.writeHead(200,{'Content-Type':'text/plain'});res.end('safe-loopback-only');
});

test('test helper only allocates loopback HTTP ports outside WHATWG forbidden ranges',async()=>{
  const s=make();
  try{
    const port=await listenFixtureSafePort(s);
    assert.ok(port>=SAFE_MIN&&port<SAFE_MAX);
    assert.equal(s.address().address,'127.0.0.1');
    const response=await fetch('http://127.0.0.1:'+port+'/probe');
    assert.equal(response.status,200);
    assert.equal(await response.text(),'safe-loopback-only');
    await assert.rejects(()=>listenFixtureSafePort(s),/fresh, unbound/);
  }finally{if(s.listening)await close(s);}
});

test('test helper retries an actual occupied safe port without altering OS ranges',async()=>{
  const first=make(),second=make();
  try{
    const occupied=await listenFixtureSafePort(first);
    let attempts=0;
    const newPort=await listenFixtureSafePort(second,{
      nextPort:()=>{
        if(attempts++===0)return occupied;
        let candidate=randomInt(SAFE_MIN,SAFE_MAX);
        while(candidate===occupied)candidate=randomInt(SAFE_MIN,SAFE_MAX);
        return candidate;
      }
    });
    assert.ok(attempts>=2);
    assert.notEqual(newPort,occupied);
    assert.ok(newPort>=SAFE_MIN&&newPort<SAFE_MAX);
    assert.equal((await fetch('http://127.0.0.1:'+newPort+'/')).status,200);
  }finally{
    if(second.listening)await close(second);
    if(first.listening)await close(first);
  }
});

test('test helper rejects caller-chosen unsafe port instead of probing it',async()=>{
  const s=make();
  try{
    await assert.rejects(()=>listenFixtureSafePort(s,{nextPort:()=>6000}),/Unsafe test HTTP port/);
    await assert.rejects(()=>listenFixtureSafePort(s,{nextPort:()=>10080}),/Unsafe test HTTP port/);
    assert.equal(s.listening,false);
  }finally{if(s.listening)await close(s);}
});
