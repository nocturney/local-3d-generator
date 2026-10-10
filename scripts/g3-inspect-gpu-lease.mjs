/** Read-only operator diagnostic for cross-process GPU lock. Never clears it. */
import { createGpuLease } from '../server/gpu-lease.js';
const lease=createGpuLease();
const inspection=await lease.inspect();
let pidState='NOT_APPLICABLE';
if(inspection.locked){
  if(inspection.owner?.pid){
    try { process.kill(inspection.owner.pid,0);pidState='PID_EXISTS'; }
    catch(error) { pidState=error.code==='ESRCH'?'PID_NOT_FOUND':'PID_UNVERIFIED'; }
  }else pidState='OWNER_RECORD_MISSING_OR_INVALID';
}
console.log('G3_GPU_LEASE_DIAGNOSTIC '+JSON.stringify({
  schema:'local3d.g3.gpu-lease-diagnostic.v1',
  sharedLockExists:inspection.locked,
  ownerMetadataAvailable:!!inspection.owner,
  processState:pidState,
  automaticRecovery:false,
  action:inspection.locked
    ? 'REFUSE_NEW_GPU_WORK; INSPECT_LOCAL3D_WORKERS_OFFICE_AND_GPU_BEFORE_ANY_MANUAL_CLEANUP'
    : 'NO_LOCAL3D_SHARED_LOCK_PRESENT; LIVE_OFFICE_GPU_GATES_STILL_REQUIRED'
}));
if(inspection.locked)process.exitCode=2;
