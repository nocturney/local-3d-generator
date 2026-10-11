import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {readShaVerifiedJobAsset,G347JobAssetIntegrityError} from '../server/g347-http-asset-integrity.js';

const digest=b=>createHash('sha256').update(b).digest('hex');
const refused=e=>e instanceof G347JobAssetIntegrityError&&e.code==='G347_ASSET_UNVERIFIED';
async function fixture(){
 const temp=await fs.realpath(os.tmpdir());
 const root=await fs.mkdtemp(path.join(temp,'l3d-g347-owned-'));
 const jobDir=path.join(root,randomUUID());
 await fs.mkdir(jobDir);
 const data=Buffer.alloc(4096,37);data.write('glTF',0,'ascii');
 const name='output.glb',full=path.join(jobDir,name);
 await fs.writeFile(full,data);
 const asset={id:'preview-glb',kind:'model',mime:'model/gltf-binary',
   bytes:data.length,sha256:digest(data)};
 return {root,jobDir,data,full,asset,close:()=>fs.rm(root,{force:true,recursive:true})};
}
test('G3.47 ordinary GLB bytes survive exact size/hash native readback',async()=>{
 const a=await fixture();
 try{assert.deepEqual(await readShaVerifiedJobAsset({jobDir:a.jobDir,asset:a.asset}),a.data);}
 finally{await a.close();}
});
test('G3.47 same-length tamper fails SHA even though lstat, fstat, and size match',async()=>{
 const a=await fixture();
 try{
  await fs.writeFile(a.full,Buffer.alloc(a.data.length,18));
  await assert.rejects(readShaVerifiedJobAsset({jobDir:a.jobDir,asset:a.asset}),refused);
 }finally{await a.close();}
});
test('G3.47 hardlink to a synthetic external-owned copy is denied',async()=>{
 const a=await fixture();
 try{
  await fs.link(a.full,path.join(a.root,'synthetic-twin'));
  await assert.rejects(readShaVerifiedJobAsset({jobDir:a.jobDir,asset:a.asset}),refused);
 }finally{await a.close();}
});
test('G3.47 symlink to synthetic external-owned content is denied before read',async()=>{
 const a=await fixture();
 try{
  const other=path.join(a.root,'canary-data');
  await fs.rename(a.full,other);
  await fs.symlink(other,a.full,'file');
  await assert.rejects(readShaVerifiedJobAsset({jobDir:a.jobDir,asset:a.asset}),refused);
  assert.deepEqual(await fs.readFile(other),a.data);
 }finally{await a.close();}
});
test('G3.47 Windows Junction parent denies source even if file leaf is regular',async()=>{
 const a=await fixture();
 try{
  const relocated=path.join(a.root,'owned-target');
  await fs.rename(a.jobDir,relocated);
  await fs.symlink(relocated,a.jobDir,process.platform==='win32'?'junction':'dir');
  await assert.rejects(readShaVerifiedJobAsset({jobDir:a.jobDir,asset:a.asset}),refused);
 }finally{await a.close();}
});
test('G3.47 deterministic lstat-to-open link swap blocks BEFORE any bytes read',async()=>{
 const a=await fixture();
 try{
  const other=path.join(a.root,'outside-owned');
  await fs.writeFile(other,a.data);
  let switched=false,readCalls=0;
  const io={
   ...fs,
   async lstat(file,opts){
    const before=await fs.lstat(file,opts);
    if(file===a.full&&!switched){
     switched=true;
     await fs.unlink(a.full);await fs.link(other,a.full);
    }
    return before;
   },
   async open(file,flags){
    const h=await fs.open(file,flags);
    return {
     stat:(...args)=>h.stat(...args),
     read:async(...args)=>{readCalls++;return h.read(...args)},
     close:()=>h.close()
    };
   }
  };
  await assert.rejects(readShaVerifiedJobAsset({jobDir:a.jobDir,asset:a.asset,io}),refused);
  assert.equal(switched,true);assert.equal(readCalls,0);
 }finally{await a.close();}
});
test('G3.47 post-read pathname replacement is rejected before bytes are returned',async()=>{
 const a=await fixture();
 try{
  const other=path.join(a.root,'owned-replacement');
  await fs.writeFile(other,Buffer.alloc(a.data.length,9));
  let switched=false;
  const io={
   ...fs,
   async open(file,flags){
    const h=await fs.open(file,flags);
    return {
     stat:(...args)=>h.stat(...args),
     async read(...args){
      const result=await h.read(...args);
      if(!switched){
       switched=true;
       await fs.unlink(a.full);
       await fs.copyFile(other,a.full);
      }
      return result;
     },
     close:()=>h.close()
    };
   }
  };
  await assert.rejects(readShaVerifiedJobAsset({jobDir:a.jobDir,asset:a.asset,io}),refused);
  assert.equal(switched,true);
 }finally{await a.close();}
});
test('G3.47 byte append during open-read is rejected despite initially valid asset SHA',async()=>{
 const a=await fixture();
 try{
  let appended=false;
  const io={
   ...fs,
   async open(file,flags){
    const h=await fs.open(file,flags);
    return {
     stat:(...args)=>h.stat(...args),
     async read(...args){
      if(!appended){appended=true;await fs.appendFile(a.full,Buffer.from('APPENDED'));}
      return h.read(...args);
     },
     close:()=>h.close()
    };
   }
  };
  await assert.rejects(readShaVerifiedJobAsset({jobDir:a.jobDir,asset:a.asset,io}),refused);
  assert.equal(appended,true);
 }finally{await a.close();}
});
test('G3.47 reject unknown asset kind, size, digest, ID, mime, names and path',async()=>{
 const a=await fixture();
 try{
  const alters=[
   {id:'../../outside'},{id:'qa-report'},{kind:'source'},
   {bytes:0},{bytes:a.data.length+1},{bytes:'4096'},{sha256:'a'.repeat(63)},
   {sha256:'A'.repeat(64)},{sha256:digest(Buffer.from('wrong'))},
   {mime:'text/html'},{label:'extra',kind:'report'}
  ];
  for(const change of alters)
   await assert.rejects(readShaVerifiedJobAsset({jobDir:a.jobDir,asset:{...a.asset,...change}}),refused);
  await assert.rejects(readShaVerifiedJobAsset({jobDir:path.join(a.root,'..','bad'),asset:a.asset}),refused);
  await assert.rejects(readShaVerifiedJobAsset({jobDir:a.jobDir,asset:null}),refused);
 }finally{await a.close();}
});
test('G3.47 allowlisted source-image and CPU review report succeed with manifest SHA',async()=>{
 const a=await fixture();
 try{
  const image=Buffer.alloc(64,7),report=Buffer.from('{"printQualified":false}');
  await fs.writeFile(path.join(a.jobDir,'input.png'),image);
  await fs.writeFile(path.join(a.jobDir,'geometry-qa.json'),report);
  const i={id:'source-image',kind:'source',mime:'image/png',bytes:image.length,sha256:digest(image)};
  const j={id:'geometry-qa',kind:'report',mime:'application/json',bytes:report.length,sha256:digest(report)};
  assert.deepEqual(await readShaVerifiedJobAsset({jobDir:a.jobDir,asset:i}),image);
  assert.deepEqual(await readShaVerifiedJobAsset({jobDir:a.jobDir,asset:j}),report);
  await fs.writeFile(path.join(a.jobDir,'benchmark-shape.json'),report);
  const b={...j,id:'benchmark-shape'};
  assert.deepEqual(await readShaVerifiedJobAsset({jobDir:a.jobDir,asset:b}),report);
 }finally{await a.close();}
});
test('G3.47 error has no file path, username, media or hash leak',async()=>{
 const a=await fixture();
 try{
  await fs.unlink(a.full);
  try{await readShaVerifiedJobAsset({jobDir:a.jobDir,asset:a.asset});assert.fail('expected rejection');}
  catch(e){
   assert.ok(refused(e));
   assert.doesNotMatch(JSON.stringify({code:e.code,message:e.message}),
    /C:[/\\]|D:[/\\]|local3d-g347|l3d-g347|canary|private|sha256/i);
  }
 }finally{await a.close();}
});
