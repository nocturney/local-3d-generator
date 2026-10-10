/**
 * G3.25 proof assembly: OFFLINE, read-only by default. --write-public only once.
 * Reads two existing sanitized public reports and two tracked entrypoint sources.
 * No native image parsing, model/weights/job reads, installs or network.
 */
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildPillowFormatTriage} from './g3-25-pillow-format-triage-lib.mjs';
import {readHistoricalServerBytes} from './g3-28-historical-server-source.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const P={
 full:path.join(ROOT,'docs','evidence','g3','g3-23-full-public-osv-id-census.json'),
 prior:path.join(ROOT,'docs','evidence','g3','g3-24-security-review-queue.json'),
 server:path.join(ROOT,'server','index.js'),
 worker:path.join(ROOT,'engines','triposr','worker.py'),
 out:path.join(ROOT,'docs','evidence','g3','g3-25-pillow-format-review.json')
};
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
async function safeRead(p){
 const s=await fs.lstat(p);
 if(!s.isFile()||s.isSymbolicLink()||s.size<50||s.size>850000)
   throw new Error('G3.25 invalid, symlinked or oversized public/source input');
 return fs.readFile(p);
}
const [f,q,w]=await Promise.all([safeRead(P.full),safeRead(P.prior),safeRead(P.worker)]);
const s=readHistoricalServerBytes(); // immutable, SHA-recovered old CRLF source
const opts={full:hash(f),prior:hash(q),server:hash(s),worker:hash(w)};
const report=buildPillowFormatTriage(JSON.parse(f),JSON.parse(q),
 s.toString('utf8'),w.toString('utf8'),opts);
const out=JSON.stringify(report,null,2)+'\n';
if(Buffer.byteLength(out)>90000)throw new Error('G3.25 report budget exceeded');
const existing=await fs.lstat(P.out).catch(e=>e.code==='ENOENT'?null:Promise.reject(e));
if(existing){
 if(!existing.isFile()||existing.isSymbolicLink()
   ||await fs.readFile(P.out,'utf8')!==out)
   throw new Error('G3.25 immutable public source-triage proof changed');
}else{
 if(!process.argv.includes('--write-public'))
   throw new Error('G3.25 no-flag replay requires immutable previous public proof');
 await fs.writeFile(P.out,out,{encoding:'utf8',flag:'wx'});
}
console.log('G3_25_PILLOW_FORMAT_REVIEW_PASS '+JSON.stringify({
 publicVersionRecords:report.publicPillowRecordsAccountedFor,
 reviewedAliasGroups:report.aliasLinkedPillowGroupsReviewed,
 applicationReachabilityProven:report.perAdvisoryActualReachabilityCertified,
 sourceByteSha256:opts,
 immutablePublicProofSha256:hash(Buffer.from(out)),
 changedRuntimeOrOperatingSystem:false, GPUInferenceRuns:0,printQualified:false
}));
