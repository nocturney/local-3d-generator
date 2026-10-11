/** G3.47 actual Windows local HTTP job-asset delivery SHA and file-handle
 * integrity proof. Historical public evidence must stay byte-identical.
 * Only temporary synthetic fixture HTTP servers. No CUDA, VM or printing.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {readFrozenG346Server} from '../tests/fixtures/g347-frozen-g346-server.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const norm=b=>Buffer.from(b.toString('utf8').replace(/\r\n/g,'\n'),'utf8');
const files={
 parent:'docs/evidence/g3/g3-46-actual-g2-result-file-handle-integrity-cpu.json',
 server:'server/index.js',
 guard:'server/g347-http-asset-integrity.js',
 api:'tests/api.test.js',
 unit:'tests/g347-http-asset-filehandle.test.js',
 historicalReader:'tests/fixtures/g347-frozen-g346-server.mjs',
 public:'docs/evidence/g3/g3-47-actual-persisted-http-asset-sha-filehandle-cpu.json'
};
const archives=[
 ['g328','scripts/g3-28-assemble-integration-proof.mjs','docs/evidence/g3/g3-28-integrated-structural-image-admission.json'],
 ['g330','scripts/g3-30-assemble-exchange-proof.mjs','docs/evidence/g3/g3-30-trusted-only-offline-exchange-not-sandbox.json'],
 ['g331','scripts/g3-31-assemble-launch-route-evidence.mjs','docs/evidence/g3/g3-31-windows-sandbox-launch-discovery-only.json'],
 ['g336','scripts/g3-36-assemble-fixture-recovery-readiness.mjs','docs/evidence/g3/g3-36-g1-ephemeral-recovery-readiness-not-live-activation.json'],
 ['g339','scripts/g3-39-assemble-disabled-boot-review.mjs','docs/evidence/g3/g3-39-disabled-g1-boot-review-no-task-installed.json'],
 ['g344','scripts/g3-44-assemble-unattended-g1-readonly-proof.mjs','docs/evidence/g3/g3-44-actual-readonly-unattended-g1-account-not-proven.json'],
 ['g345native','scripts/g3-45-assemble-native-storage-hardening-proof.mjs','docs/evidence/g3/g3-45-g2-storage-junction-hardlink-native-cpu.json'],
 ['g345http','scripts/g3-45-assemble-http-storage-denial-proof.mjs','docs/evidence/g3/g3-45-g2-http-storage-denial-before-gpu.json'],
 ['g346','scripts/g3-46-assemble-real-artifact-guard-proof.mjs','docs/evidence/g3/g3-46-actual-g2-result-file-handle-integrity-cpu.json']
];
async function read(k){
 const rel=files[k]||k;
 const f=path.join(root,rel),st=await fs.lstat(f);
 if(!st.isFile()||st.isSymbolicLink()||st.size<20||st.size>750000)
  throw Error('G347 public/source input absent, linked or oversized '+k);
 return fs.readFile(f);
}
const required=['parent','server','guard','api','unit','historicalReader'];
const data=Object.fromEntries(await Promise.all(required.map(async k=>[k,await read(k)])));
const previous=JSON.parse(data.parent);
if(sha(data.parent)!=='2f13915977b31994e46666bfaca8983d7366429165076d1ebf8a7eb4f20e34e0'||
 previous.schema!=='local3d.g346.actual-g2-worker-result-filehandle-artifact-integrity-cpu.v1'||
 previous.testPass!==24||previous.testFail!==0||previous.securityIssue4Open!==true||
 previous.actualOffice4178Modified!==false||
 previous.realWorkerCudaOrTripoSRInferenceInvocations!==0||
 previous.unchangedCanonicalG1ServerNormalizedSha256!==sha(norm(readFrozenG346Server()))||
 sha(norm(data.server))===previous.unchangedCanonicalG1ServerNormalizedSha256)
 throw Error('G347 frozen G3.46 parent or distinct new HTTP route source mismatch');
const live=data.server.toString('utf8');
if(!live.includes("import {readShaVerifiedJobAsset} from './g347-http-asset-integrity.js';")||
 !live.includes('readShaVerifiedJobAsset({jobDir,asset})')||
 !live.includes("fail('G347_ASSET_UNVERIFIED',409")||
 !live.includes('serveVerifiedJobAsset(res,jobFolder(id),asset,req.method)')||
 !live.includes("if (req.method === 'GET' && pathname === '/v1/health')"))
 throw Error('G347 new real HTTP route not code-linked to SHA verified readback');
if(process.platform!=='win32'||process.arch!=='x64')
 throw Error('G347 native Windows source/report proof must run on authorized Chris');

function run(label,args,timeout=120000){
 const result=spawnSync(process.execPath,args,{
  cwd:root,encoding:'utf8',shell:false,windowsHide:true,timeout,maxBuffer:400000,
  env:{...process.env,CUDA_VISIBLE_DEVICES:'-1',L3D_ENABLE_TRIPOSR:'0',
   HF_HUB_OFFLINE:'1',TRANSFORMERS_OFFLINE:'1',HF_HUB_DISABLE_TELEMETRY:'1',
   PYTHONNOUSERSITE:'1'}
 });
 if(result.status!==0||result.error)
  throw Error('G347 native CPU subprocess denied '+label+' exit='+result.status);
 return String(result.stdout||'');
}
const checks=run('native-HTTP-and-filehandle',[
 '--test','--test-reporter=tap',files.api,files.unit
],100000);
for(const n of ['tests 25','pass 25','fail 0','skipped 0'])
 if(!checks.includes('# '+n+'\n')&&!checks.includes('# '+n+'\r\n'))
  throw Error('G347 real HTTP/test count and result mismatch: '+n);
for(const proofName of [
 'G3.47 ordinary GLB bytes survive exact size/hash',
 'G3.47 deterministic lstat-to-open link swap',
 'G3.47 HTTP same-size on-disk GLB tamper',
 'G3.47 HTTP hardlinked QA refuses GET+HEAD',
 'G3.47 HTTP parent Windows Junction may not serve any job asset'
])if(!checks.includes(proofName))throw Error('G347 required native negative or positive missing');
const frozen={};
for(const [id,script,report] of archives){
 const baseline=await read(report);
 const src=await read(script);
 const stdout=run(id,[script],120000);
 if(!stdout.includes('PASS '))throw Error('G347 historical replay result missing '+id);
 const after=await read(report);
 if(!baseline.equals(after))throw Error('G347 frozen historical public report changed '+id);
 frozen[id]={sha256:sha(baseline),replaySourceSha256:sha(norm(src))};
}
const report={
 schema:'local3d.g347.actual-local-http-persisted-job-asset-sha-and-filehandle-cpu.v1',
 date:'2026-10-11',
 parentFrozenG346PublicSha256:sha(data.parent),
 parentFrozenG346ServerNormalizedSha256:previous.unchangedCanonicalG1ServerNormalizedSha256,
 latestRealServerNormalizedSha256:sha(norm(data.server)),
 realHttpAssetGuardNormalizedSha256:sha(norm(data.guard)),
 actualHttpApiTestNormalizedSha256:sha(norm(data.api)),
 actualNativeReadbackTestNormalizedSha256:sha(norm(data.unit)),
 historicalSourceReaderNormalizedSha256:sha(norm(data.historicalReader)),
 frozenHistoricalProofs:frozen,
 historicalProofsRerunAndByteIdentical:9,
 nativeWindowsSyntheticAndLoopbackHttpTests:25,
 nativeUnitTestsAdded:11,
 httpIntegrationCasesAdded:4,
 allNodeTestsPassedInThisProof:25,
 failed:0,skipped:0,
 actualGetAndHeadShaVerifiedBeforeHeaders:true,
 legitimateModelSourceAndQaStillServed:true,
 sameLengthHashTamperDeniedBothMethods:true,
 hardlinkedJobReportDeniedBothMethods:true,
 junctionedParentJobDirectoryDeniedBothMethods:true,
 pathSwapBeforeOpenOrAfterReadDenied:true,
 noAssetByteSentBeforeManifestShaVerification:true,
 verifiedAssetOnlyAfterManifestShaAndBoundedSize:true,
 manifestIntegrityIndependentlyAttested:false,
 assetBytesStrictlyComparedWithRecordedManifestSha:true,
 actualOsNativeRaceFreeContainmentProved:false,
 nativeDecoderGuestSandboxProved:false,
 untrustedCustomerMediaAllowed:false,
 noRealG2CudaOrTripoSRModelExecution:true,
 noPermanentG1Port4177OrG2Port4179Started:true,
 independentOffice4178Unaffected:true,
 noWindowsTaskAclBitLockerOrRebootChanges:true,
 noIndependentEncryptedOffhostRestore:true,
 newReal3dOutputs:0,
 printQualified:false,approvedForPrinter:false,fabricationAction:'NONE',
 issue3Open:true,issue4Open:true,issue5Open:true,
 decision:'ACTUAL_G1_G2_G3_HTTP_ASSET_BYTES_CHECKED_SHA_BEFORE_DELIVERY_NOT_OS_SANDBOX'
};
const bytes=Buffer.from(JSON.stringify(report,null,2)+'\n');
const dst=path.join(root,files.public);
const existing=await fs.lstat(dst).catch(e=>e.code==='ENOENT'?null:Promise.reject(e));
if(existing){
 if(!existing.isFile()||existing.isSymbolicLink()||!(await fs.readFile(dst)).equals(bytes))
  throw Error('G347 immutable public evidence drift');
}else{
 if(!process.argv.includes('--write-public'))throw Error('G347 first capture needs explicit --write-public');
 await fs.writeFile(dst,bytes,{flag:'wx'});
}
console.log('G347_ACTUAL_LOCAL_HTTP_ASSET_GUARD_PASS '+JSON.stringify({
 tests:25,failed:0,skipped:0,archivedProofsReplayed:9,
 serverSourceChanged:true,methodHEADChecksSha:true,
 gpuExecutions:0,officeChanged:false,printer:false,
 publicSha256:sha(bytes)
}));
