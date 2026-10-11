/** G3.43 immutable SHA-linked public record from a bounded PRIVATE host observation.
 * No probe, network, copy, encryption, GPU, G1 boot or OS mutation happens here. */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {reviewBackupTargetObservation} from '../server/g343-backup-target-review-contract.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = {
  parentG342:'docs/evidence/g3/g3-42-full-venv-same-host-real-offline-restore.json',
  parentG339:'docs/evidence/g3/g3-39-disabled-g1-boot-review-no-task-installed.json',
  privateManifest:'runtime/qa/g3/venv-recovery/production-py311-pillow101-complete-packages-manifest.json',
  observation:'runtime/qa/g3/g343-readonly-backup-host-observation.json',
  probe:'scripts/g3-43-readonly-backup-targets.ps1',
  gate:'server/g343-backup-target-review-contract.js',
  evidence:'docs/evidence/g3/g3-43-independent-encrypted-backup-readiness-not-replicated.json'
};
const hash = b => crypto.createHash('sha256').update(b).digest('hex');
const norm = b => Buffer.from(b.toString('utf8').replace(/\r\n/g,'\n'),'utf8');
async function read(key) {
  const file = path.join(root,src[key]), s = await fs.lstat(file);
  const max = key==='privateManifest' ? 12000000 : 300000;
  if (!s.isFile() || s.isSymbolicLink() || s.size<10 || s.size>max) {
    throw new Error('G343 source missing, link or too large: '+key);
  }
  return fs.readFile(file);
}
const keys = ['parentG342','parentG339','privateManifest','observation','probe','gate'];
const bytes = await Promise.all(keys.map(read));
const b = Object.fromEntries(keys.map((k,i)=>[k,bytes[i]]));
const prev = JSON.parse(b.parentG342);
const g1 = JSON.parse(b.parentG339);
const observed = JSON.parse(b.observation.toString('utf8').replace(/^\uFEFF/,''));
if (hash(b.parentG342)!=='f40092675b7f0f42a312b65f3be032098f7696dae68f74134c07ed6ce09b17b7' ||
    hash(b.parentG339)!=='87205d068435937e2c55c0fdd5da55daa93dd155e2f91baf37213667ba68561c' ||
    hash(b.privateManifest)!==prev.originalPrivateWholeFileManifestSha256) {
  throw new Error('G343 prior public/private SHA provenance changed');
}
const decision = reviewBackupTargetObservation(observed,prev,g1);
const proof = {
  schema:'local3d.g343.actual-readonly-independent-backup-preflight-not-replication.v1',
  date: observed.observedDate,
  parentG342SameHostRestorePublicSha256:hash(b.parentG342),
  parentG339DisabledG1StartupPublicSha256:hash(b.parentG339),
  privateOriginalBackupManifestSha256:hash(b.privateManifest),
  privateObservationReceiptSha256:hash(b.observation),
  readOnlyWindowsHostProbeNormalizedSha256:hash(norm(b.probe)),
  failClosedReviewCodeNormalizedSha256:hash(norm(b.gate)),
  observedOnAuthorizedWindowsHost:true,
  observedLocalBackupAndPrivateManifestExist:observed.originalPrivateBackupFolderExists &&
    observed.originalPrivateManifestFileExists,
  observedPhysicallyDifferentInternalDisks:observed.physicalDisksAreDistinct,
  observedOtherInternalDiskHasEnoughBytes:observed.candidateFreeBytes >=
    2*observed.expectedPrivateBackupBytes,
  observedSourceBitLockerProtectionOn:observed.sourceProtectionState==='On',
  observedOtherInternalDiskBitLockerProtectionOn:observed.candidateProtectionState==='On',
  observedConnectedMappedSmbTargets:observed.mappedConnectedSmbShareCount,
  observedAttachedOnlineUsbTargetDisks:observed.attachedOnlineUsbDiskCount,
  targetIsOffMachineIndependentlyVerified:false,
  targetEncryptedAndKeyRecoveryVerified:false,
  anyBackupFilesCopiedOrTransmitted:false,
  anyDestinationRestoredAndVerified:false,
  observedResultIsReadOnlySessionSnapshotNotAutomatedBackup:true,
  G1Port4177BootActivated:false,
  office4178Modified:false,
  pythonProductionModified:false,
  fullNativeOsConfinementAttested:false,
  modelGpuInferenceCount:0,
  securityIssue4Open:true, G1OperationalIssue5Open:true, manufacturingIssue3Open:true,
  printQualified:false, approvedForPrinter:false, fabricationAction:'NONE',
  decision
};
const data = Buffer.from(JSON.stringify(proof,null,2)+'\n');
const dst = path.join(root,src.evidence);
const old = await fs.lstat(dst).catch(e=>e.code==='ENOENT'?null:Promise.reject(e));
if (old) {
  if (!old.isFile() || old.isSymbolicLink() || !(await fs.readFile(dst)).equals(data)) {
    throw new Error('G343 immutable public evidence mismatches source');
  }
} else {
  if (!process.argv.includes('--write-public')) {
    throw new Error('G343 first evidence creation requires --write-public');
  }
  await fs.writeFile(dst,data,{flag:'wx'});
}
console.log('G343_OFFDISK_BACKUP_PREFLIGHT_PASS '+JSON.stringify({
  localOtherPhysicalDisk:proof.observedPhysicallyDifferentInternalDisks,
  otherDiskEncrypted:proof.observedOtherInternalDiskBitLockerProtectionOn,
  offHostRecoveryProven:false,copiedBytes:0,startedG1:false,
  blocked:decision.decision,publicEvidenceSHA256:hash(data)
}));
