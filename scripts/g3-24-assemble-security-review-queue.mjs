/**
 * G3.24 read-only public-only SHA evidence to prioritized MANUAL security
 * review queues. No GPU, network, installs, user files or print operations.
 */
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildReviewQueue} from './g3-24-advisory-priority-lib.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const FULL=path.join(ROOT,'docs','evidence','g3','g3-23-full-public-osv-id-census.json');
const STATIC=path.join(ROOT,'docs','evidence','g3','g3-22-pinned-python-static-triage.json');
const OUT=path.join(ROOT,'docs','evidence','g3','g3-24-security-review-queue.json');
const digest=x=>crypto.createHash('sha256').update(x).digest('hex');
async function read(file){
  const stat=await fs.lstat(file);
  if(!stat.isFile()||stat.isSymbolicLink()||stat.size<10||stat.size>800000)
    throw new Error('G3.24 refused invalid, symlinked or oversized public evidence');
  const bytes=await fs.readFile(file);
  return {bytes,data:JSON.parse(bytes)};
}
const [full,prior]=await Promise.all([read(FULL),read(STATIC)]);
const result=buildReviewQueue(full.data,prior.data,{
  fullSha:digest(full.bytes),staticSha:digest(prior.bytes)
});
const raw=JSON.stringify(result,null,2)+'\n';
if(raw.length>550000)throw new Error('G3.24 review queue output budget');
const exists=await fs.lstat(OUT).catch(e=>e.code==='ENOENT'?null:Promise.reject(e));
if(exists){
  if(!exists.isFile()||exists.isSymbolicLink()
    ||await fs.readFile(OUT,'utf8')!==raw)
    throw new Error('G3.24 immutable public review queue changed');
}else{
  if(!process.argv.includes('--write-public'))
    throw new Error('G3.24 no-flag read-only replay requires previous evidence');
  await fs.writeFile(OUT,raw,{encoding:'utf8',flag:'wx'});
}
console.log('G3_24_PUBLIC_ONLY_REVIEW_QUEUE_PASS '+JSON.stringify({
  currentPublicOSVRecords:result.fullPublicRecordsAccountedFor,
  aliasGroups:result.publicAliasGroupsAccountedFor,
  order:result.groupTierCounts,
  actualCveExploitationProven:false,
  patchedRuntimeOrSandboxApproved:false,
  noNetworkOrGPUOrInstall:true,
  sourceProofSha256:digest(Buffer.from(raw))
}));
