/** G3.46 — bounded, file-handle-based G2 worker artifact readback.
 * Job files are local and manually authorized, but pathname inputs/results
 * may be altered by other host processes. Refuse links, ambiguous identity,
 * unexpected names/bytes and redirected parent directories. NO writes.
 * This is NOT an atomic Windows directory-handle sandbox or native parser.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {verifyUnlinkedDirectoryAncestors} from './g345-storage-path-integrity.js';

const MiB=1024*1024;
const SPECS=Object.freeze({
 'model.glb':Object.freeze({folder:'engine-output',min:1024,max:100*MiB}),
 'qa-report.json':Object.freeze({folder:'engine-output',min:2,max:128*1024}),
 'input.png':Object.freeze({folder:null,min:16,max:8*MiB}),
 'input.jpg':Object.freeze({folder:null,min:16,max:8*MiB}),
 'input.webp':Object.freeze({folder:null,min:16,max:8*MiB})
});
export class G346ArtifactBoundaryError extends Error {
 constructor(){
  super('G2 local worker result did not meet the bounded artifact ownership contract');
  this.name='G346ArtifactBoundaryError';
  this.code='G2_INVALID_ARTIFACT';
 }
}
const fail=()=>{throw new G346ArtifactBoundaryError();};
function matches(a,b){
 return !!a&&!!b&&a.isFile()&&b.isFile()&&
   a.nlink===1n&&b.nlink===1n&&
   a.size===b.size&&a.dev===b.dev&&a.ino===b.ino&&
   a.size>=0n;
}
function bounded(stat,spec){
 return stat?.isFile()&&stat.nlink===1n&&
  stat.size>=BigInt(spec.min)&&stat.size<=BigInt(spec.max);
}
/** The optional io is for deterministic synthetic adversarial tests ONLY.
 * Production always uses the default, native fs/promises implementation.
 */
export async function readExclusiveG2JobArtifact({jobDir,filename,io=fs}){
 const spec=SPECS[filename];
 if(!spec||typeof jobDir!=='string'||!path.isAbsolute(jobDir)||
     path.resolve(jobDir)!==jobDir||jobDir.includes('\0'))fail();
 const parent=spec.folder?path.join(jobDir,spec.folder):jobDir;
 const file=path.join(parent,filename);
 let handle;
 try {
  await verifyUnlinkedDirectoryAncestors(parent);
  const before=await io.lstat(file,{bigint:true});
  if(!bounded(before,spec))fail();
  handle=await io.open(file,'r');
  const opened=await handle.stat({bigint:true});
  if(!matches(before,opened)||!bounded(opened,spec))fail();
  const raw=await handle.readFile();
  const postRead=await handle.stat({bigint:true});
  if(!Buffer.isBuffer(raw)||raw.length!==Number(before.size)||
     !matches(before,postRead))fail();
  await handle.close();handle=null;
  await verifyUnlinkedDirectoryAncestors(parent);
  const atPath=await io.lstat(file,{bigint:true});
  if(!matches(before,atPath))fail();
  return raw;
 } catch {
  // Avoid returning Windows source/credentials/media paths in G2 public errors.
  fail();
 } finally {
  if(handle)await handle.close().catch(()=>{});
 }
}
