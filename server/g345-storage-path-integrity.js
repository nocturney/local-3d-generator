/** G3.45: fail-closed, point-in-time filesystem metadata validation for
 * MANUAL G2 job storage only. No data mutation, cleanup, CUDA or I/O beyond
 * lstat checks. Symlinks/junctions and multi-link regular files are denied.
 *
 * IMPORTANT: path checks do NOT replace OS ACLs, exclusive file handles,
 * sandboxing, or race-safe directory-relative Windows native APIs.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

export class G345UntrustedStoragePath extends Error {
  constructor() {
    super('Cannot verify the physical ownership of the local G2 storage path');
    this.name='G345UntrustedStoragePath';
    this.code='G345_STORAGE_PATH_UNTRUSTED';
  }
}
function refuse(){throw new G345UntrustedStoragePath();}

export async function verifyUnlinkedDirectoryAncestors(dir,{allowMissingLeaf=false}={}){
  if(typeof dir!=='string'||!path.isAbsolute(dir)||dir.includes('\0'))refuse();
  // Windows UNC/network shares are not qualified as the local GPU job store.
  if(process.platform==='win32'&&(dir.startsWith('\\\\')||dir.startsWith('//')))refuse();
  const final=path.resolve(dir);
  const volume=path.parse(final).root;
  const rel=path.relative(volume,final);
  if(rel==='..'||rel.startsWith('..'+path.sep))refuse();
  const parts=rel ? rel.split(path.sep).filter(Boolean) : [];
  if(parts.length>64)refuse();
  let current=volume;
  const paths=[current];
  for(const part of parts){current=path.join(current,part);paths.push(current);}
  for(let i=0;i<paths.length;i++){
    let stat;
    try{stat=await fs.lstat(paths[i]);}
    catch(e){
      if(e?.code==='ENOENT'&&allowMissingLeaf&&i===paths.length-1)return false;
      refuse();
    }
    if(!stat.isDirectory()||stat.isSymbolicLink())refuse();
  }
  return true;
}
export function isExclusiveOrdinaryStoredFile(stat){
  return !!stat&&stat.isFile()&&!stat.isSymbolicLink()&&
    Number.isSafeInteger(stat.nlink)&&stat.nlink===1 &&
    Number.isSafeInteger(stat.size)&&stat.size>=0;
}
