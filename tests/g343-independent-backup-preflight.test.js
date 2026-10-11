import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {BackupReviewError,reviewBackupTargetObservation} from '../server/g343-backup-target-review-contract.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFile(path.join(root,p));
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const norm=x=>sha(Buffer.from(x.toString('utf8').replace(/\r\n/g,'\n')));
const copy=x=>structuredClone(x);
async function parents(){
 return Promise.all([
  read('docs/evidence/g3/g3-42-full-venv-same-host-real-offline-restore.json').then(JSON.parse),
  read('docs/evidence/g3/g3-39-disabled-g1-boot-review-no-task-installed.json').then(JSON.parse)
 ]);
}
function synthetic(){
 return {
  schema:'local3d.g343.readonly-backup-destination-inventory.v1',
  observedDate:'2026-10-11',
  sourceDriveRole:'LOCAL_PRIVATE_G341_BACKUP',
  candidateDriveRole:'OTHER_INTERNAL_WINDOWS_DISK',
  sourceDriveLetter:'D',candidateDriveLetter:'C',
  sourceDiskNumber:0,candidateDiskNumber:1,physicalDisksAreDistinct:true,
  sourceDiskBusType:'NVMe',candidateDiskBusType:'NVMe',
  candidateFreeBytes:200000000000,expectedPrivateBackupBytes:5086619721,
  originalPrivateBackupFolderExists:true,originalPrivateManifestFileExists:true,
  sourceProtectionState:'Off',candidateProtectionState:'Off',
  mappedConnectedSmbShareCount:0,attachedOnlineUsbDiskCount:0,
  externalOrOffHostEncryptedDestinationValidated:false,
  operatorScopedReplicationApprovalRecorded:false,
  escrowAndRecoveryKeyCustodyVerified:false,
  independentDestinationRestoreReadbackCompleted:false,
  thisProbeCopiedBackupBytes:false,thisProbeChangedOsSecurityOrEncryption:false,
  thisProbeInstalledServiceOrStartedG1:false,
  thisProbeRanGpuOrModel:false,thisProbeModifiedOfficeOrPrinter:false
 };
}
const deny=(a,b,c)=>assert.throws(()=>reviewBackupTargetObservation(a,b,c),
 e=>e instanceof BackupReviewError&&e.code==='G343_BACKUP_REVIEW_BLOCKED');

test('G3.43 actual read-only context remains blocked despite distinct local disks and room',async()=>{
 const [g342,g339]=await parents();
 const x=reviewBackupTargetObservation(synthetic(),g342,g339);
 assert.equal(x.schema,'local3d.g343.offdisk-backup-preflight-decision.v1');
 assert.equal(x.sourceBackupFolderAndManifestPresent,true);
 assert.equal(x.localAlternativeUsesDifferentPhysicalDisk,true);
 assert.equal(x.localAlternativeHasAtLeastDoubleBackupBytesFree,true);
 assert.equal(x.localAlternativeEncryptionVerified,false);
 assert.equal(x.offHostEncryptedTargetValidated,false);
 assert.equal(x.independentOffHostRestoreVerified,false);
 assert.equal(x.backupTransferredToAnotherDiskOrHost,false);
 assert.equal(x.decision,'BLOCKED_NO_APPROVED_ENCRYPTED_OFFHOST_RECOVERY');
 assert.equal(x.requirements.length,9);
 assert.equal(x.printQualified,false);
 assert.equal(Object.isFrozen(x),true);
});
test('G3.43 refuses forged transport/encryption approval, OS/service/GPU/Office changes',async()=>{
 const [b,c]=await parents(),a=synthetic();
 for(const k of [
   'externalOrOffHostEncryptedDestinationValidated',
   'operatorScopedReplicationApprovalRecorded','escrowAndRecoveryKeyCustodyVerified',
   'independentDestinationRestoreReadbackCompleted','thisProbeCopiedBackupBytes',
   'thisProbeChangedOsSecurityOrEncryption','thisProbeInstalledServiceOrStartedG1',
   'thisProbeRanGpuOrModel','thisProbeModifiedOfficeOrPrinter'
 ]){const v=copy(a);v[k]=true;deny(v,b,c);}
});
test('G3.43 rejects fabricated disk separation, volume identity and privacy fields',async()=>{
 const [b,c]=await parents(),a=synthetic();
 for(const [k,v] of [['physicalDisksAreDistinct',false],['candidateDriveLetter','Z'],
  ['sourceDriveRole','CUSTOMER_UPLOADS'],['candidateFreeBytes',Infinity],
  ['mappedConnectedSmbShareCount',-2],['sourceProtectionState','Encrypted'],
  ['originalPrivateManifestFileExists','yes']]){
  const t=copy(a);t[k]=v;deny(t,b,c);
 }
 for(const k of ['machineSid','cloudToken','customerFilePath','apiKey']){
  const t=copy(a);t[k]='sensitive';deny(t,b,c);
 }
});
test('G3.43 same-disk or unknown inventory cannot masquerade as offsite',async()=>{
 const [b,c]=await parents();
 const t=synthetic();t.candidateDiskNumber=t.sourceDiskNumber;t.physicalDisksAreDistinct=false;
 const out=reviewBackupTargetObservation(t,b,c);
 assert.equal(out.localAlternativeUsesDifferentPhysicalDisk,false);
 assert.equal(out.independentOffHostRestoreVerified,false);
 t.mappedConnectedSmbShareCount=-1;t.attachedOnlineUsbDiskCount=-1;
 assert.equal(reviewBackupTargetObservation(t,b,c).mappedSmbAndUsbInventoryComplete,false);
});
test('G3.43 hypothetical encrypted other disk still cannot authorize replication or off-host DR',async()=>{
 const [b,c]=await parents();const a=synthetic();
 a.candidateProtectionState='On';a.sourceProtectionState='On';
 const out=reviewBackupTargetObservation(a,b,c);
 assert.equal(out.localAlternativeEncryptionVerified,true);
 assert.equal(out.operatorAuthorizedReplication,false);
 assert.equal(out.offHostEncryptedTargetValidated,false);
 assert.equal(out.independentOffHostRestoreVerified,false);
});
test('G3.43 parent source proof tampering and premature boot gate closure are fail-closed',async()=>{
 const [b,c]=await parents(),a=synthetic();
 let w=copy(b);w.completeRestoredPython269CpuTestsPassed=false;deny(a,w,c);
 w=copy(b);w.originalPrivateWholeFileManifestSha256='0'.repeat(64);deny(a,w,c);
 let x=copy(c);x.noG1PersistentStartupPerformed=false;deny(a,b,x);
 x=copy(c);x.noScheduledTaskXmlRegistered=false;deny(a,b,x);
});
test('G3.43 immutable public evidence binds exactly G3.42/G3.39 and current read-only sources',async()=>{
 const report=JSON.parse(await read('docs/evidence/g3/g3-43-independent-encrypted-backup-readiness-not-replicated.json'));
 assert.equal(report.schema,'local3d.g343.actual-readonly-independent-backup-preflight-not-replication.v1');
 for(const [field,p] of [
  ['parentG342SameHostRestorePublicSha256','docs/evidence/g3/g3-42-full-venv-same-host-real-offline-restore.json'],
  ['parentG339DisabledG1StartupPublicSha256','docs/evidence/g3/g3-39-disabled-g1-boot-review-no-task-installed.json']
 ]) assert.equal(report[field],sha(await read(p)));
 for(const [field,p] of [
  ['readOnlyWindowsHostProbeNormalizedSha256','scripts/g3-43-readonly-backup-targets.ps1'],
  ['failClosedReviewCodeNormalizedSha256','server/g343-backup-target-review-contract.js']
 ]) assert.equal(report[field],norm(await read(p)));
 assert.equal(report.privateOriginalBackupManifestSha256,
  '2c87d7cc2e7f1703a6c5c92521036f21630737ede2376020897faec94459df9d');
 assert.equal(report.decision.decision,'BLOCKED_NO_APPROVED_ENCRYPTED_OFFHOST_RECOVERY');
});
test('G3.43 public evidence is sanitized, read-only, and cannot imply security or print release',async()=>{
 const bytes=await read('docs/evidence/g3/g3-43-independent-encrypted-backup-readiness-not-replicated.json');
 const o=JSON.parse(bytes);
 for(const k of ['anyBackupFilesCopiedOrTransmitted','anyDestinationRestoredAndVerified',
  'targetIsOffMachineIndependentlyVerified','targetEncryptedAndKeyRecoveryVerified',
  'G1Port4177BootActivated','office4178Modified','pythonProductionModified',
  'fullNativeOsConfinementAttested','printQualified','approvedForPrinter'])
  assert.equal(o[k],false,k);
 assert.equal(o.modelGpuInferenceCount,0);
 assert.equal(o.observedPhysicallyDifferentInternalDisks,true);
 assert.equal(o.observedOtherInternalDiskBitLockerProtectionOn,false);
 assert.equal(o.securityIssue4Open,true);assert.equal(o.G1OperationalIssue5Open,true);
 assert.equal(o.manufacturingIssue3Open,true);
 assert.doesNotMatch(bytes.toString('utf8'),/[CD]:[/\\]|S-1-5-[0-9]+|password|credential|privateKey|apiToken|clientEmail|customerJobId/i);
});
