import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {assessPrivateFullVenvSnapshot,SnapshotEvidenceError} from '../server/g341-full-venv-snapshot-contract.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=f=>fs.readFile(path.join(root,f));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const norm=b=>sha(Buffer.from(b.toString('utf8').replace(/\r\n/g,'\n')));
const inputs=()=>Promise.all([
 read('runtime/qa/g3/g341-real-full-venv-backup.json').then(JSON.parse),
 read('docs/evidence/g3/g3-40-verified-official-wheel-and-real-isolated-rollback.json').then(JSON.parse)
]);
const mutate=x=>JSON.parse(JSON.stringify(x));
const denied=(a,b)=>assert.throws(()=>assessPrivateFullVenvSnapshot(a,b),
 e=>e instanceof SnapshotEvidenceError&&e.code==='G341_UNVERIFIED_SNAPSHOT');
test('G3.41 actual 34-package Python private snapshot full file SHA and independent clone interpreter accepted',async()=>{
 const [a,b]=await inputs(),r=assessPrivateFullVenvSnapshot(a,b);
 assert.equal(r.schema,'local3d.g341.full-python-venv-private-snapshot-cpu-validated.v1');
 assert.equal(r.realAllPackageVenvFilesystemSnapshotVerified,true);
 assert.equal(r.clonedPythonInterpreterExecutesFromSnapshot,true);
 assert.equal(r.clonedPinnedProductionPackageMetadataCount,34);
 assert.equal(r.clonedPillow101NativeSafeFormatsTested,3);
 assert.ok(r.snapshotFiles>=25000);
 assert.ok(r.snapshotBytes>4*1024**3);
 assert.equal(r.fullInstalledEnvironmentRestoreToAnotherMachineVerified,false);
 assert.equal(r.standaloneCopyOfFullSystemPythonOrOS,false);
 assert.equal(r.decision,'FULL_LOCAL_VENV_SNAPSHOT_VALIDATED_GPU_OS_SECURITY_GATES_STILL_OPEN');
});
test('G3.41 false production writes, hostile inputs, OS/GPU and remote disaster-recovery claims must fail',async()=>{
 const [a,b]=await inputs();
 for(const [k,v] of [
  ['allSourceSnapshotFilesHashVerified',false],['totalSnapshotFileCount',0],
  ['totalSnapshotFileBytes',3],['all34PinnedDistributionsAccessibleFromClone',false],
  ['snapshotContainsFullPythonVenvPackages',false],
  ['modelWeightsOrCustomerDataIncluded',true],
  ['productionVenvFilesModifiedOrReinstalled',true],
  ['backupACLAndHardwarePortabilityFullyQualified',true],
  ['actualCompleteOSDisasterRecoveryQualified',true],
  ['productionPillowUpgradeAuthorized',true],
  ['gpuOrModelRuns',1],['nativeDecoderOSSandboxAttested',true],['printQualified',true]
 ]){
  const x=mutate(a);x[k]=v;denied(x,b);
 }
});
test('G3.41 backup must execute its own Python not accidentally production and all 34 packages preserved',async()=>{
 const [a,b]=await inputs();
 for(const [k,v] of [
  ['cloneInterpreterProven',false],['originalVenvImported',true],
  ['pinnedInstalledDistributionsVerified',33],['pillowVersion','12.3.0']
 ]){
  const x=mutate(a);x.isolatedClonedInterpreterChecks[k]=v;denied(x,b);
 }
 const x=mutate(a);delete x.isolatedClonedInterpreterChecks.originalThreeTrustedRgbSamples.PNG;denied(x,b);
});
test('G3.41 original official Pillow source proof and SHA-pinned 34-package requirements cannot be substituted',async()=>{
 const [a,b]=await inputs(),z=mutate(a);
 z.originalOfficialPillowRecoveryWheelSHA256='0'.repeat(64);denied(z,b);
 const t=mutate(a);t.snapshotSourceRequirementsSHA256='1'.repeat(64);denied(t,b);
 const u=mutate(b);u.upstreamPyPiPublishedSha256='2'.repeat(64);denied(a,u);
});
test('G3.41 immutable public proof references local private manifest SHA, prior evidence and clone source',async()=>{
 const p=JSON.parse(await read('docs/evidence/g3/g3-41-real-private-full-python-venv-snapshot-cpu-readback.json'));
 assert.equal(p.schema,'local3d.g341.actual-complete-python-venv-private-copy-cpu-revalidated.v1');
 for(const [k,f] of [
  ['precedingG340OfficialPillowRestoreProofSha256','docs/evidence/g3/g3-40-verified-official-wheel-and-real-isolated-rollback.json'],
  ['originalPinnedProductionRequirementsSha256','engines/triposr/requirements-resolved-win-py311.txt'],
  ['originalWorkerUnchangedSha256','engines/triposr/worker.py'],
  ['originalPillowOfficialWheelSha256','runtime/qa/g3/rollback-wheelhouse/Pillow-10.1.0-cp311-cp311-win_amd64.whl'],
  ['privateFullVenvManifestSha256','runtime/qa/g3/venv-recovery/production-py311-pillow101-complete-packages-manifest.json'],
  ['privateCloneNativeCpuReadbackReceiptSha256','runtime/qa/g3/g341-real-full-venv-backup.json']
 ])assert.equal(p[k],sha(await read(f)),k);
 for(const [k,f] of [
  ['backupSourceNormalizedSha256','scripts/g3-41-private-full-venv-backup.py'],
  ['clonedInterpreterCheckSourceNormalizedSha256','scripts/g3-41-full-clone-runtime-smoke.py'],
  ['pureReleaseGateNormalizedSha256','server/g341-full-venv-snapshot-contract.js']
 ])assert.equal(p[k],norm(await read(f)),k);
 assert.deepEqual(p.decision,assessPrivateFullVenvSnapshot(...await inputs()));
});
test('G3.41 public receipt does not expose private filenames or machine paths and does not qualify printer',async()=>{
 const b=await read('docs/evidence/g3/g3-41-real-private-full-python-venv-snapshot-cpu-readback.json'),p=JSON.parse(b);
 assert.equal(p.privateSnapshotFileCount,(await inputs())[0]?.totalSnapshotFileCount);
 assert.equal(p.originalPythonFullVenvBackupActualFilesCopied,true);
 assert.equal(p.publicReportDoesNotContainFileList,true);
 assert.equal(p.fullModelWeightsOrUserDataNotBackedUp,true);
 assert.equal(p.actualOffMachineDisasterRecoveryNotValidated,true);
 assert.equal(p.productionVenvUnmodified,true);
 assert.equal(p.noOffice4178OrPersistentG14177Changes,true);
 assert.equal(p.printQualified,false);
 assert.equal(p.fabricationAction,'NONE');
 assert.doesNotMatch(b.toString('utf8'),/C:[/\\]|D:[/\\]|Lib\/site-packages|Scripts\/python|credential|password|privateKey|customerEmail/i);
});
