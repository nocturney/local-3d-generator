/**
 * G3.2 read-only local job-storage audit.
 * Bounded metadata-only traversal; no source images/prompts/job IDs exposed,
 * no cleanup and no inferences/print commands. Used to plan a future policy,
 * NOT to silently enforce deletion.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const MAX_JOBS=1000;
const MAX_FILES_PER_JOB=128;
const MAX_BYTES=Number.MAX_SAFE_INTEGER;
const STATUSES=new Set(['queued','running','cancelling','completed','cancelled','failed','interrupted']);
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function safeLstat(file){
  try{return await fs.lstat(file);}
  catch(error){if(error.code==='ENOENT')return null;throw error;}
}
async function safeList(dir){
  const stat=await safeLstat(dir);
  if(!stat)return [];
  if(!stat.isDirectory()||stat.isSymbolicLink())
    throw new Error('G3_STORAGE_UNTRUSTED_DIRECTORY');
  const entries=await fs.readdir(dir,{withFileTypes:true});
  if(entries.length>MAX_FILES_PER_JOB)throw new Error('G3_STORAGE_TOO_MANY_FILES');
  return entries;
}

export async function auditJobStorage({jobsDir,now=new Date()}){
  if(typeof jobsDir!=='string'||!path.isAbsolute(jobsDir))
    throw new TypeError('Expected an explicit absolute jobs directory');
  const when=new Date(now).getTime();
  if(!Number.isFinite(when))throw new TypeError('Invalid audit time');
  const entries=await fs.readdir(jobsDir,{withFileTypes:true}).catch(error=>{
    if(error.code==='ENOENT')return [];throw error;
  });
  if(entries.length>MAX_JOBS)throw new Error('G3_STORAGE_JOB_COUNT_EXCEEDED');
  let folders=0,bytes=0,staleDays30=0,unknown=0,unsafeEntries=0;
  const statuses=Object.fromEntries([...STATUSES].map(s=>[s,0]));
  for(const dirent of entries){
    if(!UUID.test(dirent.name))continue;
    if(!dirent.isDirectory()||dirent.isSymbolicLink()){
      unsafeEntries++;continue;
    }
    const folder=path.join(jobsDir,dirent.name);
    let currentBytes=0;
    let manifest=null;
    const children=await safeList(folder);
    for(const entry of children){
      if(entry.isSymbolicLink()){unsafeEntries++;continue;}
      const full=path.join(folder,entry.name);
      if(entry.isFile()){
        const stat=await safeLstat(full);
        if(!stat||stat.isSymbolicLink()||!stat.isFile()){unsafeEntries++;continue;}
        currentBytes+=stat.size;
        if(entry.name==='job.json'&&stat.size<=128*1024) {
          try{manifest=JSON.parse(await fs.readFile(full,'utf8'));}
          catch { /* malformed JSON is treated as unknown */ }
        }
      }else if(entry.isDirectory()&&entry.name==='engine-output'){
        const outChildren=await safeList(full);
        for(const out of outChildren){
          if(!out.isFile()||out.isSymbolicLink()){unsafeEntries++;continue;}
          const stat=await safeLstat(path.join(full,out.name));
          if(!stat||!stat.isFile()||stat.isSymbolicLink()){unsafeEntries++;continue;}
          currentBytes+=stat.size;
        }
      }else unsafeEntries++;
    }
    if(currentBytes>MAX_BYTES)throw new Error('G3_STORAGE_UNBOUNDED_BYTE_COUNT');
    bytes+=currentBytes;
    folders++;
    const status=manifest?.id===dirent.name&&STATUSES.has(manifest?.status)?
      manifest.status:null;
    if(status)statuses[status]++;
    else unknown++;
    const timestamp=Date.parse(manifest?.updatedAt||manifest?.createdAt||'');
    if(Number.isFinite(timestamp)&&when-timestamp>30*24*60*60*1000)staleDays30++;
  }
  return {
    schema:'local3d.g3.storage-audit.v1',readOnly:true,
    deletionPerformed:false,quotaEnforced:false,gpuInvocations:0,
    foldersScanned:folders,totalBytes:bytes,
    bytesGiB:Math.round(bytes/1024**3*1000)/1000,
    statusCounts:statuses,unknownManifests:unknown,
    unsafeFilesystemEntries:unsafeEntries,
    olderThan30Days:staleDays30,
    actionsRequired:unsafeEntries>0?
      ['REVIEW_UNTRUSTED_PATHS_MANUALLY','NO_AUTOMATIC_DELETE']:
      ['REVIEW_RETENTION_AND_QUOTAS_WITH_OWNER','NO_AUTOMATIC_DELETE'],
    note:'Metadata/size audit only. No source images or prompts are exposed; do not interpret as backup.'
  };
}
