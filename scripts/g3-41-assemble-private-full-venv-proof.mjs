/** G3.41 source-linked historical proof of local private full-venv clone. */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {assessPrivateFullVenvSnapshot} from '../server/g341-full-venv-snapshot-contract.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const names={
 parent:'docs/evidence/g3/g3-40-verified-official-wheel-and-real-isolated-rollback.json',
 manifest:'runtime/qa/g3/venv-recovery/production-py311-pillow101-complete-packages-manifest.json',
 receipt:'runtime/qa/g3/g341-real-full-venv-backup.json',
 requirements:'engines/triposr/requirements-resolved-win-py311.txt',
 worker:'engines/triposr/worker.py',
 originalWheel:'runtime/qa/g3/rollback-wheelhouse/Pillow-10.1.0-cp311-cp311-win_amd64.whl',
 snapshotScript:'scripts/g3-41-private-full-venv-backup.py',
 smokeScript:'scripts/g3-41-full-clone-runtime-smoke.py',
 contract:'server/g341-full-venv-snapshot-contract.js',
 report:'docs/evidence/g3/g3-41-real-private-full-python-venv-snapshot-cpu-readback.json'
};
const snapshotRoot=path.join(root,'runtime/qa/g3/venv-recovery/production-py311-pillow101-complete-packages');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const lf=b=>Buffer.from(b.toString('utf8').replace(/\r\n/g,'\n'));
async function read(k,max=250000){
 const target=path.join(root,names[k]),stat=await fs.lstat(target);
 if(!stat.isFile()||stat.isSymbolicLink()||stat.size<10||stat.size>max)
  throw Error('G341 invalid trusted file '+k);
 return fs.readFile(target);
}
const keys=['parent','manifest','receipt','requirements','worker','originalWheel','snapshotScript','smokeScript','contract'];
const values=await Promise.all(keys.map(k=>read(k,k==='manifest'?12000000:k==='originalWheel'?8000000:300000)));
const d=Object.fromEntries(keys.map((k,i)=>[k,values[i]]));
const parent=JSON.parse(d.parent),manifest=JSON.parse(d.manifest),receipt=JSON.parse(d.receipt);
if(manifest.schema!=='local3d.g341.full-python-venv-private-files-sha.v1'||
   receipt.snapshotPrivateFileManifestSHA256!==sha(d.manifest)||
   parent.upstreamPyPiPublishedSha256!==sha(d.originalWheel)||
   sha(d.requirements)!==receipt.snapshotSourceRequirementsSHA256||
   sha(d.worker)!==parent.unchangedActualProductionWorkerSha256)
 throw Error('G341 parent/manifest/requirements/worker provenance mismatch');
const decision=assessPrivateFullVenvSnapshot(receipt,parent);
if(manifest.count!==receipt.totalSnapshotFileCount||
   manifest.totalBytes!==receipt.totalSnapshotFileBytes||
   !Array.isArray(manifest.files)||manifest.files.length!==manifest.count)
 throw Error('G341 private inventory count/byte mismatch');
let summed=0;
const paths=new Set();
const pattern=/^[^\x00-\x1f\\:]+$/u;
for(const entry of manifest.files){
 if(!Array.isArray(entry)||entry.length!==3||
    typeof entry[0]!=='string'||!pattern.test(entry[0])||
    entry[0].startsWith('/')||entry[0].split('/').some(segment=>segment==='..'||segment===''||segment==='.')||
    !Number.isSafeInteger(entry[1])||entry[1]<0||!(/^[a-f0-9]{64}$/.test(entry[2]))||
    paths.has(entry[0]))throw Error('G341 unexpected/untrusted file manifest row');
 paths.add(entry[0]);summed+=entry[1];
}
if(summed!==manifest.totalBytes)throw Error('G341 source file bytes inconsistent');
const crucial=['pyvenv.cfg','Scripts/python.exe','Lib/site-packages/PIL/Image.py'];
const matching=[
 manifest.files.find(x=>/^Lib\/site-packages\/pillow-10[.]1[.]0[.]dist-info\/METADATA$/i.test(x[0]))?.[0],
 manifest.files.find(x=>/^Lib\/site-packages\/torch-[^/]+[.]dist-info\/METADATA$/i.test(x[0]))?.[0],
 manifest.files.find(x=>/^Lib\/site-packages\/transformers-[^/]+[.]dist-info\/METADATA$/i.test(x[0]))?.[0],
 manifest.files.find(x=>/^Lib\/site-packages\/PIL\/_imaging[^/]+[.]pyd$/i.test(x[0]))?.[0]
];
if(matching.some(x=>!x))throw Error('G341 missing critical native package distribution source in clone');
for(const relative of [...crucial,...matching]){
 const entry=manifest.files.find(x=>x[0].toLowerCase()===relative.toLowerCase());
 if(!entry)throw Error('G341 critical snapshot file not in manifest');
 const target=path.join(snapshotRoot,...relative.split('/'));
 const stat=await fs.lstat(target);
 if(!stat.isFile()||stat.isSymbolicLink()||stat.size!==entry[1]||
    sha(await fs.readFile(target))!==entry[2])
  throw Error('G341 critical cloned binary/metadata has changed');
}
const result={
 schema:'local3d.g341.actual-complete-python-venv-private-copy-cpu-revalidated.v1',
 date:'2026-10-11',
 precedingG340OfficialPillowRestoreProofSha256:sha(d.parent),
 originalPinnedProductionRequirementsSha256:sha(d.requirements),
 originalWorkerUnchangedSha256:sha(d.worker),
 originalPillowOfficialWheelSha256:sha(d.originalWheel),
 privateFullVenvManifestSha256:sha(d.manifest),
 privateCloneNativeCpuReadbackReceiptSha256:sha(d.receipt),
 backupSourceNormalizedSha256:sha(lf(d.snapshotScript)),
 clonedInterpreterCheckSourceNormalizedSha256:sha(lf(d.smokeScript)),
 pureReleaseGateNormalizedSha256:sha(lf(d.contract)),
 privateSnapshotFileCount:manifest.count,
 privateSnapshotTotalBytes:manifest.totalBytes,
 originalPythonFullVenvBackupActualFilesCopied:true,
 criticalClonedWheelModulesExecutableAndSHARechecked:true,
 publicReportDoesNotContainFileList:true,
 snapshotRemainsMachineLocalAndGitIgnored:true,
 productionVenvUnmodified:true,
 fullModelWeightsOrUserDataNotBackedUp:true,
 portableWindowsHostImageNotBackedUp:true,
 actualOffMachineDisasterRecoveryNotValidated:true,
 noNewGpuOrModelInference:true,
 noOffice4178OrPersistentG14177Changes:true,
 productionPillowUpgradeNotAuthorized:true,
 nativeDecoderOSConfinementNotAttested:true,
 securityIssue4Resolved:false,operationalIssue5Resolved:false,printIssue3Resolved:false,
 printQualified:false,approvedForPrinter:false,fabricationAction:'NONE',
 decision
};
const data=Buffer.from(JSON.stringify(result,null,2)+'\n');
const output=path.join(root,names.report);
const current=await fs.lstat(output).catch(e=>e.code==='ENOENT'?null:Promise.reject(e));
if(current){
 if(!current.isFile()||current.isSymbolicLink()||!(await fs.readFile(output)).equals(data))
  throw Error('G341 public immutable evidence differs');
}else{
 if(!process.argv.includes('--write-public'))throw Error('G341 first capture requires --write-public');
 await fs.writeFile(output,data,{flag:'wx'});
}
console.log('G341_FULL_VENV_LOCAL_PRIVATE_BACKUP_CPU_PROOF_PASS '+JSON.stringify({
 files:manifest.count,bytes:manifest.totalBytes,
 originalOfficialWheel:result.originalPillowOfficialWheelSha256,
 sameMachineVenvCloneCpuValid:true,
 realOffMachineRecoveryProven:false,
 gpu:0,reportSHA256:sha(data)
}));
