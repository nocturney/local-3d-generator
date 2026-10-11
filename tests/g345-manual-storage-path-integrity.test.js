/** G3.45 native filesystem synthetic fixtures only. No GPU, model,
 * Office, customer files, printer, OS policy or task modifications.
 * Tests create/remove ONLY directories owned by this test in os.tmpdir().
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {auditJobStorage} from '../server/storage-audit.js';
import {admitRealJobStorage,StorageAdmissionError} from '../server/storage-admission.js';
import {verifyUnlinkedDirectoryAncestors,
 isExclusiveOrdinaryStoredFile,G345UntrustedStoragePath}
 from '../server/g345-storage-path-integrity.js';

const MiB=1024**2,GiB=1024**3;
const statfs=async()=>({bsize:4096n,bavail:BigInt(12*GiB/4096)});
const fail=e=>e instanceof StorageAdmissionError&&e.code==='G3_STORAGE_UNVERIFIED';
const check=jobsDir=>admitRealJobStorage({jobsDir,sourceBytes:64*1024,statfs});
async function temp(){
 const realSystemTemp=await fs.realpath(os.tmpdir());
 const root=await fs.mkdtemp(path.join(realSystemTemp,'local3d-g345-owned-'));
 return {root,cleanup:()=>fs.rm(root,{recursive:true,force:true})};
}
async function populated(root){
 const jobsDir=path.join(root,'jobs'),id=randomUUID();
 await fs.mkdir(path.join(jobsDir,id),{recursive:true});
 const job=path.join(jobsDir,id);
 await fs.writeFile(path.join(job,'job.json'),JSON.stringify({
   id,status:'completed',updatedAt:'2026-10-11T00:00:00Z'
 }));
 return {jobsDir,job,id};
}
async function symlinkDir(target,link){
 try{
  await fs.symlink(target,link,process.platform==='win32'?'junction':'dir');
  return true;
 }catch(e){
  if(['EPERM','EACCES','ENOTSUP','ENOSYS'].includes(e?.code))return false;
  throw e;
 }
}

test('G3.45 legitimate synthetic job records still admit without any mutation',async()=>{
 const e=await temp();
 try{
  const {jobsDir,job}=await populated(e.root);
  await fs.writeFile(path.join(job,'output.glb'),Buffer.alloc(512));
  const before=await fs.readdir(job);
  const verify=await verifyUnlinkedDirectoryAncestors(jobsDir);
  const audit=await auditJobStorage({jobsDir});
  const admission=await check(jobsDir);
  assert.equal(verify,true);
  assert.equal(audit.unsafeFilesystemEntries,0);
  assert.equal(audit.unknownManifests,0);
  assert.equal(admission.outcome,'ADMITTED');
  assert.equal(admission.deletedFiles,0);
  assert.deepEqual(await fs.readdir(job),before);
 }finally{await e.cleanup()}
});

test('G3.45 directly symlinked jobs root fails both audit and real admission',async t=>{
 const e=await temp();
 try{
  const {jobsDir}=await populated(path.join(e.root,'storage'));
  const alias=path.join(e.root,'alias-jobs');
  if(!(await symlinkDir(jobsDir,alias))){t.skip('symlink/junction unavailable in this Windows session');return;}
  await assert.rejects(auditJobStorage({jobsDir:alias}),e=>e instanceof G345UntrustedStoragePath);
  await assert.rejects(check(alias),fail);
  assert.equal((await fs.lstat(alias)).isSymbolicLink(),true);
 }finally{await e.cleanup()}
});

test('G3.45 parent directory JUNCTION redirection fails even though jobs leaf is a real directory',async t=>{
 const e=await temp();
 try{
  const target=path.join(e.root,'owned-real');
  const {jobsDir,job}=await populated(path.join(target,'nested'));
  await fs.writeFile(path.join(job,'output.glb'),Buffer.alloc(17));
  const alias=path.join(e.root,'redirect-parent');
  if(!(await symlinkDir(target,alias))){t.skip('symlink/junction unavailable in this Windows session');return;}
  const redirected=path.join(alias,'nested','jobs');
  assert.equal((await fs.lstat(redirected)).isDirectory(),true);
  await assert.rejects(verifyUnlinkedDirectoryAncestors(redirected),
    e=>e instanceof G345UntrustedStoragePath);
  await assert.rejects(auditJobStorage({jobsDir:redirected}),
    e=>e instanceof G345UntrustedStoragePath);
  await assert.rejects(check(redirected),fail);
  assert.equal((await fs.stat(path.join(job,'output.glb'))).size,17);
 }finally{await e.cleanup()}
});

test('G3.45 hard-linked job manifest is not trusted even with valid UUID/status',async()=>{
 const e=await temp();
 try{
  const {jobsDir,job,id}=await populated(e.root);
  const manifest=path.join(job,'job.json');
  const ownedOriginal=path.join(e.root,'owned-external-reference.json');
  await fs.rename(manifest,ownedOriginal);
  await fs.link(ownedOriginal,manifest);
  const linkStat=await fs.lstat(manifest);
  assert.ok(linkStat.nlink>1,'test requires a genuine hard link');
  assert.equal(isExclusiveOrdinaryStoredFile(linkStat),false);
  const audit=await auditJobStorage({jobsDir});
  assert.equal(audit.unsafeFilesystemEntries,1);
  assert.equal(audit.unknownManifests,1);
  await assert.rejects(check(jobsDir),fail);
  assert.ok((await fs.readFile(ownedOriginal,'utf8')).includes(id));
 }finally{await e.cleanup()}
});

test('G3.45 hard-linked GLB is excluded as unsafe rather than credited to quota',async()=>{
 const e=await temp();
 try{
  const {jobsDir,job}=await populated(e.root);
  const synthetic=path.join(e.root,'owned-payload.bin');
  await fs.writeFile(synthetic,Buffer.alloc(4096,5));
  await fs.link(synthetic,path.join(job,'output.glb'));
  const audit=await auditJobStorage({jobsDir});
  assert.equal(audit.unsafeFilesystemEntries,1);
  assert.equal(audit.totalBytes,(await fs.lstat(path.join(job,'job.json'))).size);
  await assert.rejects(check(jobsDir),fail);
  assert.equal((await fs.stat(synthetic)).size,4096);
 }finally{await e.cleanup()}
});

test('G3.45 nested engine-output hard links cannot evade G2 admission',async()=>{
 const e=await temp();
 try{
  const {jobsDir,job}=await populated(e.root);
  const outer=path.join(e.root,'owned-engine-payload.bin');
  await fs.writeFile(outer,Buffer.alloc(2048));
  const engine=path.join(job,'engine-output');
  await fs.mkdir(engine);
  await fs.link(outer,path.join(engine,'model.glb'));
  const audited=await auditJobStorage({jobsDir});
  assert.equal(audited.unsafeFilesystemEntries,1);
  await assert.rejects(check(jobsDir),fail);
  assert.equal((await fs.stat(outer)).size,2048);
 }finally{await e.cleanup()}
});

test('G3.45 ordinary nested model file still counts and permits legitimate bounded admission',async()=>{
 const e=await temp();
 try{
  const {jobsDir,job}=await populated(e.root);
  await fs.mkdir(path.join(job,'engine-output'));
  await fs.writeFile(path.join(job,'engine-output','model.glb'),Buffer.alloc(1536));
  const audited=await auditJobStorage({jobsDir});
  assert.equal(audited.unsafeFilesystemEntries,0);
  assert.equal(audited.unknownManifests,0);
  assert.equal(audited.totalBytes,1536+(await fs.lstat(path.join(job,'job.json'))).size);
  assert.equal((await check(jobsDir)).outcome,'ADMITTED');
 }finally{await e.cleanup()}
});

test('G3.45 raw parent-file mismatch and missing intermediate component fail closed',async()=>{
 const e=await temp();
 try{
  const file=path.join(e.root,'owned-not-a-directory');
  await fs.writeFile(file,'NOT_A_DIRECTORY');
  await assert.rejects(
   verifyUnlinkedDirectoryAncestors(path.join(file,'jobs')),
   err=>err instanceof G345UntrustedStoragePath
  );
  await assert.rejects(check(path.join(file,'jobs')),fail);
  await assert.rejects(
   verifyUnlinkedDirectoryAncestors(path.join(e.root,'missing-parent','jobs'),
     {allowMissingLeaf:true}),
   err=>err instanceof G345UntrustedStoragePath
  );
  assert.equal(await verifyUnlinkedDirectoryAncestors(
    path.join(e.root,'missing-leaf'),{allowMissingLeaf:true}),false);
 }finally{await e.cleanup()}
});

test('G3.45 reviewer never publishes job or external source names in aggregate result',async()=>{
 const e=await temp();
 try{
  const {jobsDir,id,job}=await populated(e.root);
  await fs.writeFile(path.join(job,'output.glb'),Buffer.alloc(256));
  const result=await auditJobStorage({jobsDir});
  assert.doesNotMatch(JSON.stringify(result),new RegExp(id));
  assert.doesNotMatch(JSON.stringify(result),/owned-external-reference|owned-payload|job[.]json|output[.]glb/);
  assert.equal(result.gpuInvocations,0);
  assert.equal(result.deletionPerformed,false);
  assert.equal(result.quotaEnforced,false);
 }finally{await e.cleanup()}
});
