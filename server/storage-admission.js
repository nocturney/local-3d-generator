/**
 * G3.5 manual G2 job storage admission (CPU + filesystem only).
 *
 * This is NOT a retention/cleanup mechanism. It never deletes, moves or
 * modifies existing jobs. Rejects a fresh REAL image job when capacity or
 * directory safety cannot be verified. Fixture-demo behavior is unchanged.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { auditJobStorage } from './storage-audit.js';

const GiB=1024**3;
const MiB=1024**2;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const DEFAULT_G3_STORAGE_POLICY=Object.freeze({
  maxStoredBytes: 8*GiB,
  reservePerJobBytes: 128*MiB,
  minFreeBytesAfterReservation: 3*GiB,
  maxJobFolders: 400
});

export class StorageAdmissionError extends Error {
  constructor(code, message){super(message);this.name='StorageAdmissionError';this.code=code;}
}
function rejected(code, message){throw new StorageAdmissionError(code,message);}
function validatePolicy(policy){
  const keys=['maxStoredBytes','reservePerJobBytes','minFreeBytesAfterReservation','maxJobFolders'];
  if(!policy || keys.some(k=>!Number.isSafeInteger(policy[k])||policy[k]<=0)){
    throw new TypeError('Storage admission policy must contain positive safe integer limits');
  }
  if(policy.reservePerJobBytes>policy.maxStoredBytes)throw new TypeError('Reservation exceeds storage quota');
}
function availableOnDisk(stats){
  if(!stats || typeof stats.bsize!=='bigint' || typeof stats.bavail!=='bigint' ||
      stats.bsize<=0n || stats.bavail<0n) {
    rejected('G3_STORAGE_UNVERIFIED','Cannot verify free space for manual inference');
  }
  return stats.bsize*stats.bavail;
}

export async function admitRealJobStorage({
  jobsDir,
  sourceBytes,
  policy=DEFAULT_G3_STORAGE_POLICY,
  statfs=fs.statfs
}){
  validatePolicy(policy);
  if(typeof jobsDir!=='string'||!path.isAbsolute(jobsDir)||
      !Number.isSafeInteger(sourceBytes)||sourceBytes<1||sourceBytes>8*MiB){
    rejected('G3_STORAGE_UNVERIFIED','Invalid local storage admission parameters');
  }
  const root=path.resolve(jobsDir);
  try{
    const lst=await fs.lstat(root);
    if(!lst.isDirectory()||lst.isSymbolicLink()) {
      rejected('G3_STORAGE_UNVERIFIED','Untrusted manual job storage directory');
    }
    // Unlike the historical read-only audit, an admission gate must not
    // silently ignore rogue top-level entries or a symlinked UUID.
    const entries=await fs.readdir(root,{withFileTypes:true});
    if(entries.some(item=>!UUID.test(item.name)||!item.isDirectory()||item.isSymbolicLink())){
      rejected('G3_STORAGE_UNVERIFIED','Untrusted entries in manual job storage');
    }
    if(entries.length>=policy.maxJobFolders){
      rejected('G3_STORAGE_QUOTA','Manual job storage has reached the configured job cap');
    }
    const audit=await auditJobStorage({jobsDir:root});
    if(audit.unsafeFilesystemEntries>0 || audit.unknownManifests>0 ||
       audit.foldersScanned!==entries.length ||
       !Number.isSafeInteger(audit.totalBytes)||audit.totalBytes<0){
      rejected('G3_STORAGE_UNVERIFIED','Cannot account for all stored manual job data');
    }
    const reserve=BigInt(Math.max(policy.reservePerJobBytes,sourceBytes+16*MiB));
    if(BigInt(audit.totalBytes)+reserve>BigInt(policy.maxStoredBytes)){
      rejected('G3_STORAGE_QUOTA','Manual job storage quota would be exceeded');
    }
    const free=availableOnDisk(await statfs(root,{bigint:true}));
    if(free-reserve<BigInt(policy.minFreeBytesAfterReservation)){
      rejected('G3_LOW_DISK_SPACE','Not enough free disk space for a safe GPU job');
    }
    return {
      schema:'local3d.g3.storage-admission.v1',
      outcome:'ADMITTED',
      readOnly:true,deletedFiles:0,
      jobsObserved:audit.foldersScanned,storedBytesObserved:audit.totalBytes,
      reserveBytes:Number(reserve),
      freeBytesObserved:Number(free>BigInt(Number.MAX_SAFE_INTEGER)?BigInt(Number.MAX_SAFE_INTEGER):free),
      policy:{
        maxStoredBytes:policy.maxStoredBytes,
        minFreeBytesAfterReservation:policy.minFreeBytesAfterReservation,
        maxJobFolders:policy.maxJobFolders
      },
      note:'Point-in-time check for one manually confirmed real image job, not a guarantee of exclusive disk reservation'
    };
  } catch(error){
    if(error instanceof StorageAdmissionError)throw error;
    rejected('G3_STORAGE_UNVERIFIED','Unable to verify manual G2 storage safety');
  }
}
