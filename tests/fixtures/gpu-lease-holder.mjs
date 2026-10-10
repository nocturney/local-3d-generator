/** Benign separate-process GPU lease holder. NEVER invokes AI or CUDA. */
import { createGpuLease } from '../../server/gpu-lease.js';
const lease = createGpuLease({root:process.argv[2]});
let held = null;
try {
  held = await lease.acquire({jobId:'G3-MOCK-SEPARATE-PROCESS'});
  process.send?.({status:'locked',pid:process.pid});
} catch (error) {
  process.send?.({status:'failed',code:error.code || 'ERROR'});
  process.exit(3);
}
process.on('message', async message=>{
  if(message==='release'){
    try { await held.release();process.send?.({status:'released'}); }
    catch(error){ process.send?.({status:'release-failed',code:error.code}); }
    process.exit(0);
  }
});
