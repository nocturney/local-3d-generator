/** G3.46 real Windows CPU-only native artifact guard proof.
 * Reruns only owned-temp synthetic filesystem and Node fake worker tests;
 * never starts G2 CUDA, persistent G1, Office or printer processes.
 * Public evidence is immutable and anchored to frozen G3.45 reports.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const p={
 native:'docs/evidence/g3/g3-45-g2-storage-junction-hardlink-native-cpu.json',
 http:'docs/evidence/g3/g3-45-g2-http-storage-denial-before-gpu.json',
 g1:'server/index.js',
 adapter:'server/triposr-adapter.js',
 helper:'server/g346-worker-artifact-readback.js',
 g345:'server/g345-storage-path-integrity.js',
 fake:'tests/fixtures/g346-fake-artifact-worker.cjs',
 originalFake:'tests/fixtures/g2-fake-worker.cjs',
 unit:'tests/g346-worker-artifact-boundary.test.js',
 integration:'tests/g346-native-mock-worker-result.test.js',
 regression:'tests/g2-process.test.js',
 proof:'docs/evidence/g3/g3-46-actual-g2-result-file-handle-integrity-cpu.json'
};
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const norm=b=>Buffer.from(b.toString('utf8').replace(/\r\n/g,'\n'),'utf8');
async function read(k){
 const f=path.join(root,p[k]),stat=await fs.lstat(f);
 if(!stat.isFile()||stat.isSymbolicLink()||stat.size<30||stat.size>320000)
  throw Error('G346 source missing, linked or oversized '+k);
 return fs.readFile(f);
}
const keys=['native','http','g1','adapter','helper','g345',
 'fake','originalFake','unit','integration','regression'];
const blobs=Object.fromEntries(await Promise.all(keys.map(async k=>[k,await read(k)])));
const frozenNative=JSON.parse(blobs.native),frozenHttp=JSON.parse(blobs.http);
if(sha(blobs.native)!=='c1349fe585a4697f17dc8b5d09af6d321e84989a287389a8df8f77901a845331'||
   sha(blobs.http)!=='4031e200ad345b8d5a352ffbe7ebbb2a7c06082136f91c2c0fe57fff33823986'||
   frozenHttp.parentG345WindowsNativeStorageIntegrityProofSha256!==sha(blobs.native)||
   frozenNative.originalG1ServerNormalizedSha256!==sha(norm(blobs.g1))||
   frozenNative.newG345FilesystemGuardNormalizedSha256!==sha(norm(blobs.g345))||
   frozenNative.noRealG2ImagesTransformedOrGPUExecuted!==true||
   frozenHttp.actualGpuLeaseCalls!==0||frozenHttp.actualModelWorkerCalls!==0||
   frozenNative.securityIssue4Open!==true||
   frozenHttp.githubIssue4Open!==true){
 throw Error('G346 original G3.45/native G1 locked source or safety lineage changed');
}
if(process.platform!=='win32'||process.arch!=='x64')
 throw Error('G346 real Windows native filehandle proof requires authorized Chris Windows x64');
const args=['--test','--test-reporter=tap',p.unit,p.integration,p.regression];
const result=spawnSync(process.execPath,args,{
 cwd:root,encoding:'utf8',shell:false,windowsHide:true,
 timeout:120000,maxBuffer:200000,
 env:{...process.env,L3D_ENABLE_TRIPOSR:'0',CUDA_VISIBLE_DEVICES:'-1',
  HF_HUB_OFFLINE:'1',TRANSFORMERS_OFFLINE:'1',
  HF_HUB_DISABLE_TELEMETRY:'1',PYTHONNOUSERSITE:'1'}
});
const text=String(result.stdout||'');
if(result.error||result.status!==0||
 !/(?:^|\n)# tests 24\r?(?:\n|$)/.test(text)||
 !/(?:^|\n)# pass 24\r?(?:\n|$)/.test(text)||
 !/(?:^|\n)# fail 0\r?(?:\n|$)/.test(text)||
 !/(?:^|\n)# skipped 0\r?(?:\n|$)/.test(text)||
 /(?:^|\n)not ok /.test(text))throw Error('G346 native synthetic worker/artifact or original G2 regression failed');
for(const phrase of [
 'G3.46 rejects Windows Junction replacing the nested engine-output DIRECTORY',
 'G3.46 rejects lstat-to-open replacement with a different inode',
 'G3.46 refuses same-byte-length pathname substitution AFTER filehandle read',
 'G3.46 actual worker adapter refuses synthetic owned HARDLINK_MODEL',
 'G3.46 actual worker adapter refuses synthetic owned HARDLINK_QA',
 'G3.46 actual worker adapter refuses synthetic owned HARDLINK_INPUT',
 'G3.46 actual worker adapter refuses synthetic owned JUNCTION_OUTPUT',
 'G3.46 source SHA admitted BEFORE launch rejects source rewrite',
 'G3.46 input SHA changed DURING Office preflight is rejected',
 'G3.46 unchanged valid synthetic node worker still produces',
 'native isolated adapter accepts a child result with no GPU (mock subprocess)'
])if(!text.includes(phrase))throw Error('G346 required Windows-native negative/positive proof case was absent');

const report={
 schema:'local3d.g346.actual-g2-worker-result-filehandle-artifact-integrity-cpu.v1',
 date:'2026-10-11',
 frozenG345NativeFilesystemProofSha256:sha(blobs.native),
 frozenG345RealHttpBeforeGpuProofSha256:sha(blobs.http),
 unchangedCanonicalG1ServerNormalizedSha256:sha(norm(blobs.g1)),
 actualG2EngineAdapterNormalizedSha256:sha(norm(blobs.adapter)),
 newG346FilehandleArtifactReaderNormalizedSha256:sha(norm(blobs.helper)),
 existingG345AncestorGuardNormalizedSha256:sha(norm(blobs.g345)),
 syntheticFakeWorkerNormalizedSha256:sha(norm(blobs.fake)),
 historicalG2WorkerFakeFixtureNormalizedSha256:sha(norm(blobs.originalFake)),
 newSyntheticUnitTestNormalizedSha256:sha(norm(blobs.unit)),
 newNativeAdapterIntegrationTestNormalizedSha256:sha(norm(blobs.integration)),
 historicalNativeG2WorkerRegressionNormalizedSha256:sha(norm(blobs.regression)),
 actualNativeWindowsFsJunctionAndHardlinkTestsCompleted:true,
 actualLstatToOpenAndPostReadSwapTestsCompleted:true,
 actualMockChildWorkerIntegrationCompleted:true,
 acceptedLegitimateMockGlbAndQATested:true,
 deniedHardlinkedModelQaAndSourceAfterChildExit:true,
 deniedJunctionEngineOutputAndJobDirectory:true,
 deniedInputMutationDuringPreflightAndAfterWorker:true,
 checkedWorkerArtifactBytesFromSingleFileHandles:true,
 admittedSourceShaPinnedBeforeWorker:true,
 realWorkerCudaOrTripoSRInferenceInvocations:0,
 realG2UserJobsOrCustomerMediaAccessed:false,
 actualOffice4178Modified:false,
 permanentG1Port4177Started:false,
 manualG2Port4179Started:false,
 noInstalledTaskAclSecurityOrBitLockerChanges:true,
 noPrivateBackupTransferOrUntrustedDecoderGuestLaunch:true,
 osNativeRaceFreeFilesystemConfinementProven:false,
 completeImageParserIsolationProven:false,
 productionPillowUpgradePerformed:false,
 fullOffhostEncryptedDisasterRecoveryVerified:false,
 unattendedG1NoLoginStartupVerified:false,
 real3dOutputCountAdded:0,
 printQualified:false,approvedForPrinter:false,fabricationAction:'NONE',
 securityIssue4Open:true,operationIssue5Open:true,manufacturingIssue3Open:true,
 newTests:18,existingWorkerRegressionTests:6,
 totalSyntheticCpuTests:24,testPass:24,testFail:0,testSkip:0,
 decision:'G2_FILEHANDLE_INPUT_AND_RESULT_BOUNDARIES_HARDENED_WINDOWS_CPU_NOT_OS_SANDBOX'
};
const bytes=Buffer.from(JSON.stringify(report,null,2)+'\n','utf8');
const dest=path.join(root,p.proof);
const old=await fs.lstat(dest).catch(e=>e.code==='ENOENT'?null:Promise.reject(e));
if(old){
 if(!old.isFile()||old.isSymbolicLink()||!(await fs.readFile(dest)).equals(bytes))
  throw Error('G346 immutable public proof byte drift');
}else{
 if(!process.argv.includes('--write-public'))
  throw Error('G346 first immutable evidence creation requires --write-public');
 await fs.writeFile(dest,bytes,{flag:'wx'});
}
console.log('G346_NATIVE_G2_ARTIFACT_FILEHANDLE_CPU_PASS '+JSON.stringify({
 nativeSyntheticTests:24,passed:24,skipped:0,cudaAndGpuRuns:0,
 officeChanged:false,printerActions:0,
 decision:report.decision,publicSHA256:sha(bytes)
}));
