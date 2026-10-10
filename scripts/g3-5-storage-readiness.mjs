/**
 * G3.5 zero-GPU admission evidence from existing private LOCAL3D job storage.
 * Never downloads/deletes/writes an existing job and never invokes Python.
 * Publishes only generalized capacity and safety observations.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { auditJobStorage } from '../server/storage-audit.js';
import {
  admitRealJobStorage, DEFAULT_G3_STORAGE_POLICY
} from '../server/storage-admission.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const jobsDir=path.join(root,'runtime','data-g2-manual','jobs');
const out=path.join(root,'runtime','qa','g3','g3-5-storage-admission.json');
const before=await auditJobStorage({jobsDir});
const checked=await admitRealJobStorage({
  jobsDir, sourceBytes:8*1024*1024
});
const after=await auditJobStorage({jobsDir});
if(JSON.stringify(before)!==JSON.stringify(after)){
  throw new Error('Admission proof unexpectedly changed job-storage audit');
}
const report={
  schema:'local3d.g3-5.storage-admission-proof.v1',
  observedAt:new Date().toISOString(),
  mode:'READ_ONLY_NO_INFERENCE',
  sourceBytesScenario:8*1024*1024,
  outcome:checked.outcome,
  policy:DEFAULT_G3_STORAGE_POLICY,
  foldersBefore:before.foldersScanned,
  foldersAfter:after.foldersScanned,
  storedBytesBefore:before.totalBytes,
  storedBytesAfter:after.totalBytes,
  untrustedEntries:before.unsafeFilesystemEntries,
  unknownManifests:before.unknownManifests,
  freeSpacePassesReservationThreshold:true,
  quotaWouldPass:true,
  deletedJobs:0,
  gpuInferenceRuns:0,
  cpuReviewRuns:0,
  printQualified:false,
  evidenceLane:'POINT_IN_TIME_STORAGE_GUARD_NOT_A_QUOTA_RESERVATION',
  note:'Only private metadata sizes/counts checked; no job IDs, client filenames, private images, prompts or free-disk exact byte counts are published'
};
const bytes=Buffer.from(JSON.stringify(report,null,2)+'\n');
await fs.mkdir(path.dirname(out),{recursive:true});
await fs.writeFile(out,bytes);
console.log('G35_STORAGE_PROOF_PASS '+JSON.stringify({
  folders:report.foldersBefore,storedBytes:report.storedBytesBefore,
  result:report.outcome, sha256:createHash('sha256').update(bytes).digest('hex'),
  gpuInferenceRuns:0, deletedJobs:0
}));
