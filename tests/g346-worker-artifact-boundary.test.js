/** G3.46 Windows native synthetic worker-artifact boundary controls.
 * EVERY test mutates only uniquely created os.tmpdir-owned fixtures.
 * No model, CUDA, Office, customer media, scheduled task or printer action.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {readExclusiveG2JobArtifact,G346ArtifactBoundaryError}
 from '../server/g346-worker-artifact-readback.js';
const fail=e=>e instanceof G346ArtifactBoundaryError&&e.code==='G2_INVALID_ARTIFACT';
async function owned(){
 const tmp=await fs.realpath(os.tmpdir());
 const root=await fs.mkdtemp(path.join(tmp,'local3d-g346-owned-'));
 const jobDir=path.join(root,'job');
 const out=path.join(jobDir,'engine-output');
 await fs.mkdir(out,{recursive:true});
 return {root,jobDir,out,close:()=>fs.rm(root,{recursive:true,force:true})};
}
const makeModel=()=>{const b=Buffer.alloc(1032);b.write('glTF',0,'ascii');
 b.writeUInt32LE(2,4);b.writeUInt32LE(b.length,8);return b;};
async function goodFiles(e){
 const model=makeModel(),report=Buffer.from('{"status":"DRAFT","printQualified":false}');
 const input=Buffer.alloc(80,14);
 await fs.writeFile(path.join(e.out,'model.glb'),model);
 await fs.writeFile(path.join(e.out,'qa-report.json'),report);
 await fs.writeFile(path.join(e.jobDir,'input.png'),input);
 return {model,report,input};
}
test('G3.46 accepted regular GLB, QA and input are read byte-for-byte with checked handles',async()=>{
 const e=await owned();
 try{
  const f=await goodFiles(e);
  for(const [name,expected] of [
   ['model.glb',f.model],['qa-report.json',f.report],['input.png',f.input]]){
   const actual=await readExclusiveG2JobArtifact({jobDir:e.jobDir,filename:name});
   assert.deepEqual(actual,expected);
  }
 }finally{await e.close();}
});
test('G3.46 rejects hardlinked synthetic GLB instead of following another pathname',async()=>{
 const e=await owned();
 try{
  const f=await goodFiles(e);
  const src=path.join(e.out,'model.glb');
  await fs.link(src,path.join(e.root,'external-owned-glb-copy'));
  await assert.rejects(readExclusiveG2JobArtifact({jobDir:e.jobDir,filename:'model.glb'}),fail);
  assert.equal((await fs.stat(src)).nlink,2);
  assert.deepEqual(await fs.readFile(src),f.model);
 }finally{await e.close();}
});
test('G3.46 rejects hardlinked synthetic QA and original input independently',async()=>{
 const e=await owned();
 try{
  await goodFiles(e);
  for(const [name,linked,external] of [
   ['qa-report.json',path.join(e.out,'qa-report.json'),'linked-qa-owned'],
   ['input.png',path.join(e.jobDir,'input.png'),'linked-input-owned']
  ]){
   const target=path.join(e.root,external);
   await fs.link(linked,target);
   await assert.rejects(readExclusiveG2JobArtifact({jobDir:e.jobDir,filename:name}),fail);
   await fs.unlink(target);
  }
 }finally{await e.close();}
});
test('G3.46 rejects Windows Junction replacing the nested engine-output DIRECTORY',async()=>{
 const e=await owned();
 try{
  await goodFiles(e);
  const external=path.join(e.root,'owned-elsewhere');
  await fs.rename(e.out,external);
  await fs.symlink(external,e.out,process.platform==='win32'?'junction':'dir');
  assert.equal((await fs.lstat(e.out)).isSymbolicLink(),true);
  await assert.rejects(readExclusiveG2JobArtifact({jobDir:e.jobDir,filename:'model.glb'}),fail);
  await assert.rejects(readExclusiveG2JobArtifact({jobDir:e.jobDir,filename:'qa-report.json'}),fail);
 }finally{await e.close();}
});
test('G3.46 rejects Windows Junction replacing the entire parent job directory',async()=>{
 const e=await owned();
 try{
  await goodFiles(e);
  const external=path.join(e.root,'owned-job-target');
  await fs.rename(e.jobDir,external);
  await fs.symlink(external,e.jobDir,process.platform==='win32'?'junction':'dir');
  await assert.rejects(readExclusiveG2JobArtifact({jobDir:e.jobDir,filename:'model.glb'}),fail);
  await assert.rejects(readExclusiveG2JobArtifact({jobDir:e.jobDir,filename:'input.png'}),fail);
 }finally{await e.close();}
});
test('G3.46 rejects lstat-to-open replacement with a different inode before ANY content read',async()=>{
 const e=await owned();
 try{
  await goodFiles(e);
  const victim=path.join(e.out,'model.glb'),replacement=path.join(e.root,'owned-replacement.glb');
  await fs.writeFile(replacement,makeModel());
  let swapped=false,opened=false,readCalled=false;
  const io={
   ...fs,
   async lstat(file,options){
    const snap=await fs.lstat(file,options);
    if(!swapped&&file===victim){
     swapped=true;await fs.unlink(victim);await fs.link(replacement,victim);
    }
    return snap;
   },
   async open(file,flags){
    opened=true;
    const h=await fs.open(file,flags);
    return {
      stat:(...args)=>h.stat(...args),
      readFile:async(...args)=>{readCalled=true;return h.readFile(...args);},
      close:()=>h.close()
    };
   }
  };
  await assert.rejects(readExclusiveG2JobArtifact({jobDir:e.jobDir,filename:'model.glb',io}),fail);
  assert.equal(swapped,true);assert.equal(opened,true);
  assert.equal(readCalled,false,'identity check MUST abort before reading replaced target');
 }finally{await e.close();}
});
test('G3.46 refuses same-byte-length pathname substitution AFTER filehandle read',async()=>{
 const e=await owned();
 try{
  await goodFiles(e);
  const victim=path.join(e.out,'qa-report.json'),other=path.join(e.root,'owned-other-report');
  const payload=await fs.readFile(victim);
  await fs.writeFile(other,Buffer.alloc(payload.length,8));
  let swapped=false;
  const io={
   ...fs,
   async open(file,flags){
    const h=await fs.open(file,flags);
    return {
     stat:(...args)=>h.stat(...args),
     async readFile(...args){
      const original=await h.readFile(...args);
      await fs.unlink(victim);
      await fs.copyFile(other,victim);
      swapped=true;return original;
     },
     close:()=>h.close()
    };
   }
  };
  await assert.rejects(readExclusiveG2JobArtifact({jobDir:e.jobDir,filename:'qa-report.json',io}),fail);
  assert.equal(swapped,true);
 }finally{await e.close();}
});
test('G3.46 refuses oversized artifacts, missing files and arbitrary filenames before read',async()=>{
 const e=await owned();
 try{
  await goodFiles(e);
  await fs.writeFile(path.join(e.out,'qa-report.json'),Buffer.alloc(128*1024+1));
  await assert.rejects(readExclusiveG2JobArtifact({jobDir:e.jobDir,filename:'qa-report.json'}),fail);
  await fs.unlink(path.join(e.out,'model.glb'));
  await assert.rejects(readExclusiveG2JobArtifact({jobDir:e.jobDir,filename:'model.glb'}),fail);
  for(const filename of ['../outside','model.glb/../../x','audit.json','test-worker.pid','']){
   await assert.rejects(readExclusiveG2JobArtifact({jobDir:e.jobDir,filename}),fail);
  }
 }finally{await e.close();}
});
test('G3.46 synthetic external path and Windows account names never appear in thrown errors',async()=>{
 const e=await owned();
 try{
  await goodFiles(e);
  const external=path.join(e.root,'PRIVATE_SYNTHETIC_CANARY');
  await fs.link(path.join(e.jobDir,'input.png'),external);
  try{await readExclusiveG2JobArtifact({jobDir:e.jobDir,filename:'input.png'});assert.fail('must reject');}
  catch(err){
   assert.ok(fail(err));
   assert.doesNotMatch(JSON.stringify({code:err.code,message:err.message}),/PRIVATE_SYNTHETIC_CANARY|C:[/\\]|\\\\|username|path/i);
  }
 }finally{await e.close();}
});
