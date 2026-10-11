/** G3.45 actual Windows-native synthetic junction/hardlink CPU tests, source
 * SHA-linked to immutable G3.43/G3.44. NO G2 inference, customer data,
 * Windows settings, Office, live G1 service, backup/print or Python changes.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {readFrozenG346Server} from '../tests/fixtures/g347-frozen-g346-server.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const files={
 p343:'docs/evidence/g3/g3-43-independent-encrypted-backup-readiness-not-replicated.json',
 p344:'docs/evidence/g3/g3-44-actual-readonly-unattended-g1-account-not-proven.json',
 g1:'server/index.js',
 guard:'server/g345-storage-path-integrity.js',
 audit:'server/storage-audit.js',
 admission:'server/storage-admission.js',
 tests:'tests/g345-manual-storage-path-integrity.test.js',
 proof:'docs/evidence/g3/g3-45-g2-storage-junction-hardlink-native-cpu.json'
};
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const norm=b=>Buffer.from(b.toString('utf8').replace(/\r\n/g,'\n'),'utf8');
async function load(key){
 if(key==='g1')return readFrozenG346Server();
 const file=path.join(ROOT,files[key]),s=await fs.lstat(file);
 if(!s.isFile()||s.isSymbolicLink()||s.size<40||s.size>450000)
  throw Error('G345 missing, replaced, linked or oversized source: '+key);
 return fs.readFile(file);
}
const inputs=['p343','p344','g1','guard','audit','admission','tests'];
const arr=await Promise.all(inputs.map(load));
const b=Object.fromEntries(inputs.map((k,i)=>[k,arr[i]]));
const p343=JSON.parse(b.p343),p344=JSON.parse(b.p344);
if(sha(b.p343)!=='4f940e7bd32c3c11d7feaf686a23ef2ec1da68efe3bce70feb9834ee7a28b050'||
   sha(b.p344)!=='9cccf5bbab5c2dd7dd820e8836e1c27fa2c2ec72c175fa2de2de6d63ecfecff0'||
   p344.parentG343BackupReadOnlyGatePublicSha256!==sha(b.p343)||
   p343.G1Port4177BootActivated!==false||p344.WindowsTaskRegisteredOrG1Port4177Started!==false||
   p344.frozenServerIndexNormalizedSha256!==sha(norm(b.g1))||
   p344.futureServicePrincipalSelectedOrRightsProven!==false||
   p344.g2OrGpuStarted!==false){
 throw Error('G345 frozen G3.43/G3.44/G1 provenance or safety gate drift');
}
if(process.platform!=='win32'||process.arch!=='x64'){
 throw Error('G345 native Windows NTFS junction/hardlink evidence must run on Chris Windows x64');
}
const result=spawnSync(process.execPath,[
 '--test','--test-reporter=tap','tests/g345-manual-storage-path-integrity.test.js'
],{
 cwd:ROOT,encoding:'utf8',windowsHide:true,shell:false,timeout:120000,maxBuffer:200000,
 env:{...process.env,CUDA_VISIBLE_DEVICES:'-1',L3D_ENABLE_TRIPOSR:'0',
  HF_HUB_OFFLINE:'1',TRANSFORMERS_OFFLINE:'1'}
});
const out=String(result.stdout||'');
if(result.error||result.status!==0||
 !/(?:^|\n)# tests 9\r?(?:\n|$)/.test(out)||
 !/(?:^|\n)# pass 9\r?(?:\n|$)/.test(out)||
 !/(?:^|\n)# fail 0\r?(?:\n|$)/.test(out)||
 !/(?:^|\n)# skipped 0\r?(?:\n|$)/.test(out)||
 /(?:^|\n)not ok /.test(out)){
 throw Error('G345 actual native filesystem negatives failed or skipped');
}
const expectedNames=[
 'legitimate synthetic job records still admit',
 'directly symlinked jobs root fails',
 'parent directory JUNCTION redirection fails',
 'hard-linked job manifest is not trusted',
 'hard-linked GLB is excluded as unsafe',
 'nested engine-output hard links cannot evade',
 'ordinary nested model file still counts',
 'raw parent-file mismatch and missing intermediate',
 'reviewer never publishes job or external source names'
];
for(const name of expectedNames)if(!out.includes('G3.45 '+name)){
 throw Error('G345 expected native test was missing: '+name);
}
const report={
 schema:'local3d.g345.real-windows-native-g2-storage-boundary-hardening-cpu.v1',
 date:'2026-10-11',
 parentG343EncryptedBackupGateSha256:sha(b.p343),
 parentG344G1UnattendedGateSha256:sha(b.p344),
 originalG1ServerNormalizedSha256:sha(norm(b.g1)),
 newG345FilesystemGuardNormalizedSha256:sha(norm(b.guard)),
 hardenedExistingG2StorageAuditNormalizedSha256:sha(norm(b.audit)),
 hardenedExistingG2StorageAdmissionNormalizedSha256:sha(norm(b.admission)),
 nativeSyntheticFilesystemTestNormalizedSha256:sha(norm(b.tests)),
 actualWindowsNtfsTestsExecuted:true,
 actualNativeDirectoryJunctionNegativeTestPassed:true,
 actualNativeFileHardlinkNegativeTestsPassed:true,
 directSymlinkNegativeTestPassed:true,
 legitimateOrdinaryFilesAccepted:true,
 linkedParentOrMultipleFileReferencesDenied:true,
 malformedOrIncompleteMetadataDenied:true,
 linkedJobManifestNotReadOrTrusted:true,
 syntheticOnlyTestJobs:true,
 testsRun:9,testsPassed:9,testsFailed:0,testsSkipped:0,
 noExistingManualJobContentInspectedByThisProof:true,
 noRealG2ImagesTransformedOrGPUExecuted:true,
 noProductionServerSourceChanged:true,
 noOfficePort4178OrPersistentG1Started:true,
 noOsSettingsTaskServiceOrAclChanged:true,
 noStorageFilesDeletedOrMigratedOutsideOwnedTempFixtures:true,
 noPrinterOrFabricationAction:true,
 offHostEncryptedRecoveryProven:false,
 noninteractiveG1BootProven:false,
 fullWindowsFilesystemRaceFreeIsolationProven:false,
 untrustedCustomerMediaSecurityApproved:false,
 printQualified:false,approvedForPrinter:false,fabricationAction:'NONE',
 securityIssue4Open:true,g1Issue5Open:true,manufacturingIssue3Open:true,
 decision:'G2_STORAGE_POINT_IN_TIME_SYMLINK_JUNCTION_HARDLINK_GUARD_PASS_NOT_SANDBOX'
};
const resultBytes=Buffer.from(JSON.stringify(report,null,2)+'\n','utf8');
const target=path.join(ROOT,files.proof);
const old=await fs.lstat(target).catch(e=>e.code==='ENOENT'?null:Promise.reject(e));
if(old){
 if(!old.isFile()||old.isSymbolicLink()||!(await fs.readFile(target)).equals(resultBytes))
  throw Error('G345 frozen public proof mismatch');
}else{
 if(!process.argv.includes('--write-public'))throw Error('G345 initial proof creation requires --write-public');
 await fs.writeFile(target,resultBytes,{flag:'wx'});
}
console.log('G345_NATIVE_G2_STORAGE_HARDENING_PASS '+JSON.stringify({
 nativeJunction:true,nativeHardLinks:true,testCases:9,failed:0,skipped:0,
 gpuInference:0,officeTouched:false,printer:false,
 residual:'WINDOWS_NATIVE_TOCTOU_AND_NATIVE_DECODER_ISOLATION_NOT_ATTESTED',
 publicEvidenceSHA256:sha(resultBytes)
}));
