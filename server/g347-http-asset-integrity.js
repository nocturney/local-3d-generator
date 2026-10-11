/** G3.47 — bounded, SHA-pinned HTTP serving of persisted job assets.
 * All payload bytes come from an already-verified, single native file handle.
 * Never send headers or a byte before full size, identity and SHA validation.
 * G1 fixture and manually approved G2/G3 assets share this readback path.
 *
 * This protects the bytes delivered by one request, NOT native OS sandboxing,
 * Windows directory handle atomicity, or compromised manifest/host accounts.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {verifyUnlinkedDirectoryAncestors} from './g345-storage-path-integrity.js';

const MiB=1024*1024;
const MODEL=Object.freeze({leaf:'output.glb',mime:'model/gltf-binary',kind:'model',min:12,max:100*MiB});
const REPORT=Object.freeze({mime:'application/json',kind:'report',min:2,max:128*1024});
const SPECS=Object.freeze({
 'preview-glb':MODEL,
 'qa-report':Object.freeze({...REPORT,leaf:'qa-report.json'}),
 'geometry-qa':Object.freeze({...REPORT,leaf:'geometry-qa.json'}),
 'benchmark-shape':Object.freeze({...REPORT,leaf:'benchmark-shape.json'}),
 'source-image':Object.freeze({kind:'source',min:16,max:8*MiB,
  imageFiles:Object.freeze({'image/png':'input.png','image/jpeg':'input.jpg','image/webp':'input.webp'})})
});
export class G347JobAssetIntegrityError extends Error {
 constructor(){
  super('Stored local job asset failed independent integrity verification');
  this.name='G347JobAssetIntegrityError';
  this.code='G347_ASSET_UNVERIFIED';
 }
}
const reject=()=>{throw new G347JobAssetIntegrityError();};
function same(a,b) {
 return !!a&&!!b&&a.isFile()&&b.isFile()&&
  a.nlink===1n&&b.nlink===1n&&a.size===b.size&&
  a.dev===b.dev&&a.ino===b.ino;
}
/** io is injected ONLY by deterministic own-temp adversarial tests.
 * Real HTTP uses native fs promises with no caller-controlled io or paths.
 */
export async function readShaVerifiedJobAsset({jobDir,asset,io=fs}){
 if(typeof jobDir!=='string'||!path.isAbsolute(jobDir)||
    path.resolve(jobDir)!==jobDir||jobDir.includes('\0')||
    !asset||typeof asset!=='object'||Array.isArray(asset))reject();
 const spec=SPECS[asset.id];
 if(!spec||asset.kind!==spec.kind||typeof asset.mime!=='string')reject();
 const leaf=spec.imageFiles?spec.imageFiles[asset.mime]:spec.leaf;
 if(!leaf||(!spec.imageFiles&&asset.mime!==spec.mime)||
   !Number.isSafeInteger(asset.bytes)||asset.bytes<spec.min||asset.bytes>spec.max||
   typeof asset.sha256!=='string'||!/^[a-f0-9]{64}$/.test(asset.sha256))reject();
 const full=path.join(jobDir,leaf);
 let h=null;
 try{
  await verifyUnlinkedDirectoryAncestors(jobDir);
  const before=await io.lstat(full,{bigint:true});
  if(!before.isFile()||before.nlink!==1n||before.size!==BigInt(asset.bytes))reject();
  h=await io.open(full,'r');
  const opened=await h.stat({bigint:true});
  if(!same(before,opened))reject();
  // Exact-size, bounded reads. FileHandle.readFile() may grow unbounded if
  // another process appends after lstat; cap memory using manifest byte size.
  const data=Buffer.allocUnsafe(asset.bytes);
  let pos=0;
  while(pos<data.length){
   const chunk=Math.min(1024*1024,data.length-pos);
   const result=await h.read(data,pos,chunk,pos);
   if(!Number.isSafeInteger(result?.bytesRead)||result.bytesRead<=0||
      result.bytesRead>chunk)reject();
   pos+=result.bytesRead;
  }
  const extra=await h.read(Buffer.alloc(1),0,1,data.length);
  if(extra.bytesRead!==0)reject();
  const post=await h.stat({bigint:true});
  if(!same(before,post))reject();
  if(createHash('sha256').update(data).digest('hex')!==asset.sha256)reject();
  await h.close();h=null;
  await verifyUnlinkedDirectoryAncestors(jobDir);
  const current=await io.lstat(full,{bigint:true});
  if(!same(before,current))reject();
  return data;
 }catch {
  // No private path, source media, username or OS error appears in HTTP.
  reject();
 }finally {
  if(h)await h.close().catch(()=>{});
 }
}
