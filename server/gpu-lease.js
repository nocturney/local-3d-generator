/**
 * G3.2 LOCAL3D advisory cross-process GPU lease.
 *
 * Cooperative only: prevents two LOCAL3D app processes on this host from
 * starting overlapping TripoSR workers. Office/other GPU apps remain
 * independently guarded by existing runtime checks.
 *
 * NEVER auto-steal a stale lease: a crashed parent can leave a GPU child alive.
 * Operator must first verify no worker/GPU conflict and explicitly clean up.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DEFAULT_GPU_LOCK_ROOT = path.join(ROOT, 'runtime', 'gpu-coordination');
const LOCK_NAME = 'triposr-gpu.lock';
const OWNER_NAME = 'owner.json';

export class LeaseUnavailable extends Error {
  constructor(code, message) { super(message); this.code = code; }
}

function validateRoot(dir) {
  if (typeof dir !== 'string' || !path.isAbsolute(dir)) {
    throw new TypeError('GPU lease root must be an absolute internal directory');
  }
  return path.resolve(dir);
}

export function createGpuLease({ root = DEFAULT_GPU_LOCK_ROOT } = {}) {
  const rootDir = validateRoot(root);
  const lockDir = path.join(rootDir, LOCK_NAME);
  const ownerFile = path.join(lockDir, OWNER_NAME);
  return {
    rootDir, lockDir,
    async inspect() {
      const stat = await fs.lstat(lockDir).catch(e => {
        if (e.code === 'ENOENT') return null;
        throw e;
      });
      if (!stat) return { locked: false };
      if (!stat.isDirectory() || stat.isSymbolicLink()) {
        return { locked: true, suspicious: true, owner: null };
      }
      let owner = null;
      try {
        const data = await fs.readFile(ownerFile, 'utf8');
        if (data.length <= 4096) {
          const parsed = JSON.parse(data);
          if (parsed.schema === 'local3d.gpu-lease.v1' &&
              Number.isSafeInteger(parsed.pid) && typeof parsed.leaseId === 'string') {
            owner = parsed;
          }
        }
      } catch {
        // Directory alone is an exclusive marker. Absent or corrupt metadata
        // MUST NOT be interpreted as permission to start inference.
      }
      return { locked: true, owner };
    },
    async acquire({ jobId } = {}) {
      await fs.mkdir(rootDir, { recursive: true });
      const stat = await fs.lstat(rootDir);
      if (!stat.isDirectory() || stat.isSymbolicLink()) {
        throw new LeaseUnavailable('G2_LEASE_UNVERIFIED', 'GPU coordination directory is untrusted');
      }
      const leaseId = randomUUID();
      try {
        await fs.mkdir(lockDir);
      } catch (error) {
        if (error.code === 'EEXIST') {
          throw new LeaseUnavailable('G2_SHARED_GPU_BUSY',
            'Another LOCAL3D process holds a GPU lease; no GPU job was started');
        }
        throw new LeaseUnavailable('G2_LEASE_UNVERIFIED',
          'GPU lease cannot be acquired safely');
      }
      const record = {
        schema: 'local3d.gpu-lease.v1', leaseId, pid: process.pid,
        jobId: typeof jobId === 'string' ? jobId : null,
        acquiredAt: new Date().toISOString(),
        policy: 'manual-cooperative-lock-no-stale-auto-recovery'
      };
      try {
        await fs.writeFile(ownerFile, JSON.stringify(record, null, 2) + '\n', { flag: 'wx' });
      } catch {
        // Only the just-created empty directory is ours in this branch.
        // Fail closed even if this cleanup fails.
        await fs.rmdir(lockDir).catch(() => {});
        throw new LeaseUnavailable('G2_LEASE_UNVERIFIED', 'GPU lease metadata could not be written');
      }
      let released = false;
      return {
        id: leaseId,
        async release() {
          if (released) return;
          const raw = await fs.readFile(ownerFile, 'utf8').catch(() => '');
          let owner;
          try { owner = JSON.parse(raw); } catch { owner = null; }
          if (owner?.leaseId !== leaseId || owner?.pid !== process.pid) {
            throw new LeaseUnavailable('G2_LEASE_OWNERSHIP',
              'GPU lease ownership changed; manual inspection required');
          }
          // Delete only our owner file and only our now-empty directory,
          // never rm recursive. A stale/conflicting lease remains blocked.
          await fs.unlink(ownerFile);
          await fs.rmdir(lockDir);
          released = true;
        }
      };
    }
  };
}
