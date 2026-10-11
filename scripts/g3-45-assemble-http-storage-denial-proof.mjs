/** G3.45 separate immutable HTTP-path proof; parent is the frozen NINE
 * native filesystem tests. This launches ONLY a disposable loopback
 * fixture server via CPU Node tests; it NEVER starts persistent G1/G2.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const files={
 parent:'docs/evidence/g3/g3-45-g2-storage-junction-hardlink-native-cpu.json',
 tests:'tests/g345-http-storage-denial.test.js',
 admission:'server/storage-admission.js',
 audit:'server/storage-audit.js',
 source:'server/index.js',
 report:'docs/evidence/g3/g3-45-g2-http-storage-denial-before-gpu.json'
};
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const normalized=b=>Buffer.from(b.toString('utf8').replace(/\r\n/g,'\n'));
async function load(k){
 const location=path.join(ROOT,files[k]),s=await fs.lstat(location);
 if(!s.isFile()||s.isSymbolicLink()||s.size<40||s.size>400000)
  throw Error('G345 HTTP proof linked or invalid file '+k);
 return fs.readFile(location);
}
const ks=['parent','tests','admission','audit','source'];
const b=Object.fromEntries(await Promise.all(ks.map(async k=>[k,await load(k)])));
const p=JSON.parse(b.parent);
if(hash(b.parent)!=='c1349fe585a4697f17dc8b5d09af6d321e84989a287389a8df8f77901a845331'||
 p.schema!=='local3d.g345.real-windows-native-g2-storage-boundary-hardening-cpu.v1'||
 p.actualWindowsNtfsTestsExecuted!==true||p.testsPassed!==9||p.testsSkipped!==0||
 hash(normalized(b.admission))!==p.hardenedExistingG2StorageAdmissionNormalizedSha256||
 hash(normalized(b.audit))!==p.hardenedExistingG2StorageAuditNormalizedSha256||
 hash(normalized(b.source))!==p.originalG1ServerNormalizedSha256)
 throw Error('G345 HTTP parent proof or immutable production source lineage mismatch');
if(process.platform!=='win32'||process.arch!=='x64')
 throw Error('G345 HTTP native Windows evidence requires authorized Chris Windows');
const result=spawnSync(process.execPath,[
 '--test','--test-reporter=tap','tests/g345-http-storage-denial.test.js'
],{
 cwd:ROOT,encoding:'utf8',timeout:60000,windowsHide:true,shell:false,maxBuffer:250000,
 env:{...process.env,L3D_ENABLE_TRIPOSR:'0',CUDA_VISIBLE_DEVICES:'-1',
  HF_HUB_OFFLINE:'1',TRANSFORMERS_OFFLINE:'1'}
});
const text=String(result.stdout||'');
if(result.error||result.status!==0||
 !/(?:^|\n)# tests 2\r?(?:\n|$)/.test(text)||
 !/(?:^|\n)# pass 2\r?(?:\n|$)/.test(text)||
 !/(?:^|\n)# fail 0\r?(?:\n|$)/.test(text)||
 !/(?:^|\n)# skipped 0\r?(?:\n|$)/.test(text)||
 /(?:^|\n)not ok /.test(text)||
 !text.includes('actual HTTP G2 admission refuses Windows parent Junction BEFORE GPU lease')||
 !text.includes('actual HTTP G2 admission refuses linked manifest BEFORE GPU lease'))
 throw Error('G345 two owned-temp ephemeral G2 HTTP fail-closed integration cases failed/skipped');
const report={
 schema:'local3d.g345.actual-ephemeral-g2-http-admission-block-before-gpu.v1',
 date:'2026-10-11',
 parentG345WindowsNativeStorageIntegrityProofSha256:hash(b.parent),
 unchangedG1SourceSha256:hash(normalized(b.source)),
 activeG2StorageAdmissionSourceSha256:hash(normalized(b.admission)),
 activeG2StorageAuditSourceSha256:hash(normalized(b.audit)),
 independentEphemeralHttpTestSourceSha256:hash(normalized(b.tests)),
 executedActualWindowsEphemeralLoopbackHttpCases:2,
 nativeParentJunctionReturned503G3StorageUnverified:true,
 hardlinkedJobManifestReturned503G3StorageUnverified:true,
 actualGpuLeaseCalls:0,actualModelWorkerCalls:0,realInputSourcesTransformed:0,
 onlyOwnedSyntheticTemporaryJobData:true,
 persistentPort4177Started:false,persistentG2Port4179Started:false,
 independentOffice4178Modified:false,
 noOsSettingsOrScheduledTaskChanges:true,
 permanentOffHostEncryptedRecoveryVerified:false,
 nativeParserOsSandboxOrRaceFreeStorageConfinementVerified:false,
 untrustedCustomerDataAuthorized:false,
 printQualified:false,approvedForPrinter:false,fabricationAction:'NONE',
 githubIssue3Open:true,githubIssue4Open:true,githubIssue5Open:true,
 testsPassed:2,testsSkipped:0,testsFailed:0,
 decision:'ACTUAL_HTTP_503_BEFORE_GPU_FOR_JUNCTION_AND_HARDLINK_NOT_NATIVE_OS_ISOLATION'
};
const bytes=Buffer.from(JSON.stringify(report,null,2)+'\n');
const out=path.join(ROOT,files.report);
const old=await fs.lstat(out).catch(e=>e.code==='ENOENT'?null:Promise.reject(e));
if(old){
 if(!old.isFile()||old.isSymbolicLink()||!(await fs.readFile(out)).equals(bytes))
  throw Error('G345 HTTP immutable public proof mismatch');
}else{
 if(!process.argv.includes('--write-public'))throw Error('G345 first HTTP proof creation requires --write-public');
 await fs.writeFile(out,bytes,{flag:'wx'});
}
console.log('G345_EPHEMERAL_G2_HTTP_STORAGE_DENIAL_PASS '+JSON.stringify({
 httpTests:2,g2HttpRejections:2,actualGpuLeaseCalls:0,actualModelCalls:0,
 publicSha256:hash(bytes)
}));
