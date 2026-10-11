/**
 * LOCAL3D G2 opt-in, single-job, local-only engine adapter.
 *
 * The server never starts this worker unless an operator explicitly sets
 * L3D_ENABLE_TRIPOSR=1 before launching a local-only session and a user
 * explicitly confirms the GPU action in the UI for EACH submitted job.
 * It never installs a model, changes Office, connects to printers, queues
 * unattended GPU runs or performs cloud inference.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import { setTimeout as delay } from 'node:timers/promises';
import {readExclusiveG2JobArtifact} from './g346-worker-artifact-readback.js';

const execAsync = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WORKER = path.join(ROOT, 'engines', 'triposr', 'worker.py');
const PYTHON = path.join(ROOT, 'runtime', 'engines', 'triposr', 'venv', 'Scripts', 'python.exe');
const WEIGHTS = path.join(ROOT, 'runtime', 'engines', 'triposr', 'weights', 'model.ckpt');
const ACCEPTED_STAGES = new Set(['verify_sources', 'preprocess_image', 'loading_model', 'infer_image', 'extract_mesh', 'export_glb', 'completed']);
const GPU_LIMITS = Object.freeze({
  requiredFreeMiB: 10000, maxInitialUtilization: 65, maxAdditionalUsedMiB: 8500,
  criticalFreeMiB: 2500, maxDurationMs: 240_000, sampleDelayMs: 350, pollMs: 1500
});

export class EngineError extends Error {
  constructor(code, message) { super(message); this.code = code; }
}

function hash(buffer) { return createHash('sha256').update(buffer).digest('hex'); }

export function parseGpuTelemetry(line) {
  const values = String(line || '').trim().split(',').map(x => x.trim());
  if (values.length !== 3 || values.some(x => !/^\d+$/.test(x))) return null;
  const [used, free, util] = values.map(Number);
  return used >= 0 && free >= 0 && util >= 0 && util <= 100 ? {used, free, util} : null;
}

async function gpuSample() {
  let result;
  try {
    result = await execAsync('nvidia-smi', [
      '--query-gpu=memory.used,memory.free,utilization.gpu',
      '--format=csv,noheader,nounits'
    ], { timeout: 4500, windowsHide: true, maxBuffer: 16384 });
  } catch { throw new EngineError('G2_GPU_UNAVAILABLE', 'Cannot verify NVIDIA GPU status'); }
  const lines = result.stdout.trim().split(/\r?\n/);
  if (lines.length !== 1) throw new EngineError('G2_GPU_AMBIGUOUS', 'Expected exactly one GPU');
  const parsed = parseGpuTelemetry(lines[0]);
  if (!parsed) throw new EngineError('G2_GPU_AMBIGUOUS', 'GPU telemetry is invalid');
  return parsed;
}

async function officeIdle() {
  let response;
  try {
    response = await fetch('http://127.0.0.1:11555/api/ps', {
      signal: AbortSignal.timeout(3000), cache: 'no-store'
    });
    if (!response.ok) throw new Error('Unhealthy Office endpoint');
    const contentLength = Number(response.headers.get('content-length') || '0');
    if (contentLength > 65536) throw new Error('Oversized status');
    const payload = await response.json();
    if (!Array.isArray(payload.models)) throw new Error('Unknown Office state');
    return payload.models.length === 0;
  } catch {
    throw new EngineError('G2_OFFICE_UNVERIFIED', 'Cannot prove Office model is idle');
  }
}

async function liveGate(signal, readGpu = gpuSample, checkOffice = officeIdle) {
  let baseline = null;
  for (let i = 0; i < 3; i++) {
    if (signal?.aborted) throw new EngineError('CANCELLED', 'Worker cancelled before GPU reservation');
    if (!await checkOffice()) throw new EngineError('G2_OFFICE_BUSY', 'Office has a loaded Ollama model');
    const gpu = await readGpu();
    if (gpu.free < GPU_LIMITS.requiredFreeMiB || gpu.util > GPU_LIMITS.maxInitialUtilization) {
      throw new EngineError('G2_GPU_BUSY', 'Shared GPU capacity is below the approved budget');
    }
    baseline = gpu;
    if (i < 2) await delay(GPU_LIMITS.sampleDelayMs, undefined, { signal }).catch(() => {
      throw new EngineError('CANCELLED', 'Reservation cancelled');
    });
  }
  return baseline;
}

async function stopTree(child) {
  if (!child || child.exitCode !== null || !child.pid) return;
  if (process.platform === 'win32') {
    try {
      await execAsync('taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], {
        timeout: 5000, windowsHide: true, maxBuffer: 4096
      });
    } catch { try { child.kill('SIGKILL'); } catch { /* already exited */ } }
  } else {
    try { process.kill(-child.pid, 'SIGKILL'); }
    catch { try { child.kill('SIGKILL'); } catch { /* already exited */ } }
  }
}

async function verifyResult(jobDir, inputPath, admittedInputSha256) {
  // Every file is read through one checked native file handle. In particular,
  // fs.stat + fs.readFile would follow symlinks/hardlinks placed AFTER worker
  // exit, potentially reading content OUTSIDE this job folder.
  const [glb, qaBytes, source] = await Promise.all([
    readExclusiveG2JobArtifact({jobDir,filename:'model.glb'}),
    readExclusiveG2JobArtifact({jobDir,filename:'qa-report.json'}),
    readExclusiveG2JobArtifact({jobDir,filename:path.basename(inputPath)})
  ]);
  const qaRaw=qaBytes.toString('utf8');
  if (glb.length < 1024 || glb.length > 100 * 1024 * 1024 ||
      glb.toString('ascii', 0, 4) !== 'glTF' || glb.readUInt32LE(4) !== 2 ||
      glb.readUInt32LE(8) !== glb.length) {
    throw new EngineError('G2_INVALID_GLB', 'Engine returned invalid GLB geometry');
  }
  let qa;
  try { qa = JSON.parse(qaRaw); }
  catch { throw new EngineError('G2_INVALID_REPORT', 'Engine returned invalid QA report'); }
  if (qa.simulation !== false || qa.mode !== 'LOCAL_REAL_INFERENCE' ||
      qa.printQualified !== false || qa.status !== 'DRAFT' ||
      qa.inputSha256 !== hash(source) || hash(source)!==admittedInputSha256 ||
      qa.artifactSha256 !== hash(glb) ||
      qa.artifactBytes !== glb.length || !(qa.faces > 0) || !(qa.vertices > 0) ||
      qa.coordinateSystem !== 'Y_UP') {
    throw new EngineError('G2_INVALID_REPORT', 'Engine provenance or geometry failed verification');
  }
  return { glb, qa };
}

export function createTripoSRAdapter(overrides = {}) {
  const python = overrides.python || PYTHON;
  const worker = overrides.worker || WORKER;
  const weightsFile = overrides.weights || WEIGHTS;
  // Injectable checks are for trusted local test harnesses only; the CLI/server
  // production entrypoint always creates the adapter without overrides.
  const readGpu = overrides.gpuSample || gpuSample;
  const checkOffice = overrides.officeIdle || officeIdle;
  return {
    limits: GPU_LIMITS,
    async run({ jobDir, inputPath, signal, onStage = () => {} }) {
      if (process.platform !== 'win32') throw new EngineError('G2_WINDOWS_ONLY', 'G2 worker is qualified only on Windows');
      if (signal?.aborted) throw new EngineError('CANCELLED', 'Cancelled before starting');
      const resolvedDir = path.resolve(jobDir);
      const resolvedInput = path.resolve(inputPath);
      if (path.dirname(resolvedInput) !== resolvedDir ||
          !/^input\.(png|jpg|webp)$/.test(path.basename(resolvedInput))) {
        throw new EngineError('G2_INVALID_PATH', 'Untrusted input path');
      }
      // Verify directory ANCESTORS, not merely the immediate parent. Read
      // the approved original input from a bounded single file handle and
      // remember its SHA before any live Office/GPU checks or worker spawn.
      let admittedInputSha256;
      try {
        admittedInputSha256 = hash(await readExclusiveG2JobArtifact({
          jobDir:resolvedDir,filename:path.basename(resolvedInput)
        }));
      } catch {
        throw new EngineError('G2_INVALID_PATH', 'Untrusted job directory or source image');
      }
      for (const file of [python, worker, weightsFile]) {
        try { await fs.access(file); }
        catch { throw new EngineError('G2_NOT_INSTALLED', 'TripoSR isolated runtime is incomplete'); }
      }
      onStage('gpu_guard');
      const baseline = await liveGate(signal, readGpu, checkOffice);
      const hostGpuTelemetry = {
        schema:'local3d.g3.host-gpu-telemetry.v1',
        measurement:'NVIDIA_SMI_PERIODIC_SNAPSHOTS_NOT_EXCLUSIVE_VRAM_RESERVATION',
        initialUsedMiB:baseline.used,
        initialFreeMiB:baseline.free,
        initialUtilizationPercent:baseline.util,
        peakObservedUsedMiB:baseline.used,
        minimumObservedFreeMiB:baseline.free,
        peakObservedUtilizationPercent:baseline.util,
        runtimeSamples:0,
        intervalMilliseconds:GPU_LIMITS.pollMs,
        peakIsExact:false
      };
      const observeGpu = snapshot => {
        hostGpuTelemetry.runtimeSamples++;
        hostGpuTelemetry.peakObservedUsedMiB = Math.max(hostGpuTelemetry.peakObservedUsedMiB,snapshot.used);
        hostGpuTelemetry.minimumObservedFreeMiB = Math.min(hostGpuTelemetry.minimumObservedFreeMiB,snapshot.free);
        hostGpuTelemetry.peakObservedUtilizationPercent = Math.max(hostGpuTelemetry.peakObservedUtilizationPercent,snapshot.util);
      };
      const out = path.join(resolvedDir, 'engine-output');
      // fs.stat follows a dangling symlink and wrongly reports "not exists".
      // A symlink/junction occupying this destination must block execution.
      try {
        await fs.lstat(out);
        throw new EngineError('G2_OUTPUT_EXISTS', 'Job output path was already used');
      } catch(error) {
        if(error?.code!=='ENOENT') {
          if(error instanceof EngineError)throw error;
          throw new EngineError('G2_INVALID_PATH','Cannot safely inspect worker output path');
        }
      }
      // Recheck immediately before the worker starts; not a replacement for
      // race-free Windows directory handles or a sandbox.
      try {
        const beforeSpawn=await readExclusiveG2JobArtifact({
          jobDir:resolvedDir,filename:path.basename(resolvedInput)
        });
        if(hash(beforeSpawn)!==admittedInputSha256) {
          throw new Error('Original input changed during safety preflight');
        }
      } catch {
        throw new EngineError('G2_INVALID_PATH','Job source changed before worker startup');
      }
      const args = [worker, '--job-dir', resolvedDir, '--image', resolvedInput,
        '--output-dir', out, '--resolution', '128', '--chunk-size', '2048'];
      let child;
      let stopReason = null;
      let collected = '';
      let partialLine = '';
      const requestStop = reason => {
        if (stopReason) return;
        stopReason = reason;
        void stopTree(child);
      };
      const abort = () => requestStop('CANCELLED');
      try {
        child = spawn(python, args, {
          windowsHide: true, detached: process.platform !== 'win32',
          stdio: ['ignore', 'pipe', 'pipe'],
          env: {
            ...process.env,
            HF_HUB_OFFLINE: '1', TRANSFORMERS_OFFLINE: '1',
            HF_HUB_DISABLE_TELEMETRY: '1',
            DO_NOT_TRACK: '1',
            PYTHONNOUSERSITE: '1',
            PYTHONUNBUFFERED: '1'
          }
        });
      } catch { throw new EngineError('G2_START_FAILED', 'Cannot start isolated model worker'); }
      signal?.addEventListener('abort', abort, { once: true });
      if (signal?.aborted) abort();
      child.stdout.on('data', chunk => {
        const str = String(chunk);
        collected = (collected + str).slice(-32768);
        partialLine = (partialLine + str).slice(-32768);
        const lines = partialLine.split(/\r?\n/); partialLine = lines.pop() || '';
        for (const line of lines) {
          const m = /^TRIPOSR_STAGE ([a-z_]+)$/.exec(line.trim());
          if (m && ACCEPTED_STAGES.has(m[1])) onStage(m[1]);
        }
      });
      // Never return worker stderr to users: paths or imported package details
      // can expose local filesystem information.
      child.stderr.on('data', () => {});
      let checking = false;
      const timer = setInterval(() => {
        if (checking || stopReason || child.exitCode !== null) return;
        checking = true;
        void (async () => {
          try {
            const snapshot = await readGpu();
            observeGpu(snapshot);
            if (snapshot.free < GPU_LIMITS.criticalFreeMiB ||
                snapshot.used - baseline.used > GPU_LIMITS.maxAdditionalUsedMiB) {
              requestStop('G2_GPU_LIMIT');
              return;
            }
            if (!await checkOffice()) requestStop('G2_OFFICE_BUSY');
          } catch (error) { requestStop(error.code || 'G2_GUARD_FAILED'); }
          finally { checking = false; }
        })();
      }, GPU_LIMITS.pollMs);
      const timeout = setTimeout(() => requestStop('G2_TIMEOUT'), GPU_LIMITS.maxDurationMs);
      try {
        const code = await new Promise((resolve, reject) => {
          child.once('error', reject);
          child.once('close', resolve);
        });
        if (stopReason) {
          throw new EngineError(stopReason, stopReason === 'CANCELLED' ? 'Job was cancelled' : 'GPU run interrupted by local safety guard');
        }
        if (code !== 0 || !collected.includes('TRIPOSR_PILOT_SUCCESS ')) {
          throw new EngineError('G2_WORKER_FAILED', 'Local inference worker did not complete');
        }
        const produced = await verifyResult(resolvedDir, resolvedInput, admittedInputSha256);
        // These are observations from the shared GPU, NOT exclusive model VRAM
        // and NOT proof that LOCAL3D caused every observed change.
        produced.qa.hostGpuTelemetry = hostGpuTelemetry;
        return produced;
      } finally {
        clearTimeout(timeout);
        clearInterval(timer);
        signal?.removeEventListener('abort', abort);
        if (child.exitCode === null && !child.killed) await stopTree(child);
      }
    }
  };
}
