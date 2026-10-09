import http from 'node:http';
import fs from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID, createHash } from 'node:crypto';
import { ensureFixture } from './fixture.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_DATA_DIR = path.join(ROOT, 'runtime', 'data');
const DEFAULT_FIXTURE = path.join(ROOT, 'fixtures', 'demo-sculpture.glb');
const MAX_BODY_BYTES = 12 * 1024 * 1024;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_QUEUE = 30;
const ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const IMPORT_MAP = '{"imports":{"three":"/vendor/three/build/three.module.js"}}';
const IMPORT_HASH = createHash('sha256').update(IMPORT_MAP).digest('base64');
const PROVIDERS = Object.freeze([
  {
    id: 'fixture-demo', name: 'Fixture Lab', version: 'g1.0', status: 'DEMO_ONLY',
    inputTypes: ['image', 'text'], outputTypes: ['glb'],
    licenseLane: 'original-test-fixture', hardwareNeeds: 'CPU / no GPU', simulation: true,
    canStart: true, canCancel: true, deterministicSeed: true
  },
  {
    id: 'triposr-local', name: 'TripoSR Local', version: 'not-installed', status: 'CANDIDATE_G2',
    inputTypes: ['image'], outputTypes: ['glb'], licenseLane: 'review-required',
    hardwareNeeds: 'GPU / validate locally', simulation: false, canStart: false, canCancel: false
  },
  {
    id: 'hunyuan-shape', name: 'Hunyuan3D Shape', version: 'not-installed', status: 'RESEARCH_G3',
    inputTypes: ['image'], outputTypes: ['glb'], licenseLane: 'territory-and-commercial-review',
    hardwareNeeds: 'VRAM / benchmark required', simulation: false, canStart: false, canCancel: false
  }
]);

class HttpError extends Error {
  constructor(code, status, message) { super(message); this.code = code; this.status = status; }
}
function fail(code, status, message) { throw new HttpError(code, status, message); }
function sha(bytes) { return createHash('sha256').update(bytes).digest('hex'); }
function isUuid(s) { return ID_PATTERN.test(s || ''); }
function now() { return new Date().toISOString(); }
function sniffImage(bytes) {
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return { mime: 'image/png', ext: '.png' };
  if (bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return { mime: 'image/jpeg', ext: '.jpg' };
  if (bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') return { mime: 'image/webp', ext: '.webp' };
  return null;
}
function reply(res, status, body, method = 'GET') {
  const raw = Buffer.from(JSON.stringify(body));
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': raw.length, 'Cache-Control': 'no-store' });
  if (method === 'HEAD') res.end(); else res.end(raw);
}
function errorReply(res, e) {
  if (res.headersSent || res.writableEnded) return;
  const status = e instanceof HttpError ? e.status : 500;
  reply(res, status, { error: { code: e.code || 'INTERNAL_ERROR', message: status === 500 ? 'Unexpected local server error' : e.message } });
}
function readBody(req) {
  if (!/^application\/json(?:;|$)/i.test(req.headers['content-type'] || '')) fail('CONTENT_TYPE', 415, 'Expected application/json');
  if (Number(req.headers['content-length'] || 0) > MAX_BODY_BYTES) fail('BODY_TOO_LARGE', 413, 'Request exceeds size limit');
  return new Promise((resolve, reject) => {
    let len = 0; const chunks = [];
    req.on('data', part => {
      len += part.length;
      if (len > MAX_BODY_BYTES) {
        reject(new HttpError('BODY_TOO_LARGE', 413, 'Request exceeds size limit'));
        req.pause();
        return;
      }
      chunks.push(part);
    });
    req.on('end', () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); }
      catch { reject(new HttpError('BAD_JSON', 400, 'Malformed JSON')); }
    });
    req.on('error', reject);
  });
}
function sanitizeFileName(name) {
  return String(name || 'image').replace(/\\/g, '/').split('/').pop().replace(/[^\p{L}\p{N}._ -]/gu, '_').slice(0, 100);
}

export async function createApp(options = {}) {
  const dataDir = path.resolve(options.dataDir || process.env.L3D_DATA_DIR || DEFAULT_DATA_DIR);
  const fixtureFile = path.resolve(options.fixtureFile || DEFAULT_FIXTURE);
  const stepMs = options.stepMs ?? 850;
  const jobsDir = path.join(dataDir, 'jobs');
  const logsDir = path.join(dataDir, 'audit');
  await fs.mkdir(jobsDir, { recursive: true });
  await fs.mkdir(logsDir, { recursive: true });
  await ensureFixture(fixtureFile);
  const jobs = new Map();
  const pending = [];
  let activeId = null, activeTimer = null, saving = Promise.resolve(), closing = false;
  const jobFile = id => path.join(jobsDir, id, 'job.json');
  const jobFolder = id => path.join(jobsDir, id);
  async function audit(event, jobId, extra = {}) {
    await fs.appendFile(path.join(logsDir, 'events.jsonl'), JSON.stringify({ at: now(), event, jobId, ...extra }) + '\n').catch(() => {});
  }
  function persist(job) {
    const snapshot = JSON.stringify(job, null, 2) + '\n';
    saving = saving.catch(() => {}).then(async () => {
      await fs.mkdir(jobFolder(job.id), { recursive: true });
      const tmp = path.join(jobFolder(job.id), '.job-' + randomUUID() + '.tmp');
      await fs.writeFile(tmp, snapshot, { flag: 'wx' });
      try { await fs.rename(tmp, jobFile(job.id)); }
      catch (e) { await fs.unlink(tmp).catch(() => {}); throw e; }
    });
    return saving;
  }
  const folders = await fs.readdir(jobsDir, { withFileTypes: true });
  for (const dir of folders) {
    if (!dir.isDirectory() || !isUuid(dir.name)) continue;
    try {
      const j = JSON.parse(await fs.readFile(jobFile(dir.name), 'utf8'));
      if (j.id !== dir.name) continue;
      if (j.status === 'running' || j.status === 'queued') {
        j.status = 'interrupted'; j.progress = 0; j.stage = 'interrupted';
        j.error = { code: 'RESTART_INTERRUPTED', message: 'Previous simulated job did not finish before restart' };
        j.updatedAt = now(); await persist(j); await audit('recovered_as_interrupted', j.id);
      }
      jobs.set(j.id, j);
    } catch { /* unreadable records are ignored, never trusted as paths */ }
  }

  const publicJob = j => JSON.parse(JSON.stringify(j));
  const recordAsset = (id, kind, mime, bytes, label) => ({ id, kind, mime, bytes: bytes.length, sha256: sha(bytes), label });
  async function finish(job) {
    if (job.status !== 'running' || activeId !== job.id) return;
    const glb = await fs.readFile(fixtureFile);
    await fs.writeFile(path.join(jobFolder(job.id), 'output.glb'), glb);
    const report = Buffer.from(JSON.stringify({
      schema: 'local3d.qa.v1', jobId: job.id, mode: 'DEMO',
      source: 'deterministic bundled fixture, unrelated to prompt/image',
      geometryStatus: 'DRAFT', manifoldCheck: 'NOT_RUN', wallThicknessCheck: 'NOT_RUN',
      dimensions: 'UNMEASURED', printQualified: false, approvedForPrinter: false
    }, null, 2) + '\n');
    await fs.writeFile(path.join(jobFolder(job.id), 'qa-report.json'), report);
    if (job.status !== 'running') return;
    job.assets.push(recordAsset('preview-glb', 'model', 'model/gltf-binary', glb, 'Demo sculpture — GLB'));
    job.assets.push(recordAsset('qa-report', 'report', 'application/json', report, 'Geometry status — DRAFT'));
    job.status = 'completed'; job.progress = 100; job.stage = 'fixture_ready';
    job.updatedAt = now(); job.completedAt = now();
    await persist(job); await audit('fixture_completed', job.id);
  }
  function queueNext() {
    if (closing || activeId) return;
    const nextId = pending.shift();
    if (!nextId) return;
    const job = jobs.get(nextId);
    if (!job || job.status !== 'queued') { queueMicrotask(queueNext); return; }
    activeId = nextId;
    void (async () => {
      job.status = 'running'; job.stage = 'demo_intake'; job.progress = 15;
      job.updatedAt = now(); await persist(job); await audit('simulation_started', job.id);
      scheduleStep(job, 0);
    })().catch(e => markFailed(job, e));
  }
  function markFailed(job, error) {
    void (async () => {
      if (job.status === 'running') {
        job.status = 'failed'; job.stage = 'error'; job.updatedAt = now();
        job.error = { code: 'FIXTURE_ERROR', message: 'Local demonstration could not finish' };
        await persist(job); await audit('job_failed', job.id);
      }
      if (activeId === job.id) { activeId = null; queueNext(); }
    })();
    console.error('Local fixture failure:', error.message);
  }
  function scheduleStep(job, stage) {
    if (job.status !== 'running' || activeId !== job.id || closing) return;
    activeTimer = setTimeout(() => {
      void (async () => {
        if (job.status !== 'running' || activeId !== job.id) return;
        if (stage === 0) { job.stage = 'demo_processing'; job.progress = 55; }
        else if (stage === 1) { job.stage = 'demo_packaging'; job.progress = 85; }
        else { await finish(job); if (activeId === job.id) { activeId = null; queueNext(); } return; }
        job.updatedAt = now(); await persist(job); scheduleStep(job, stage + 1);
      })().catch(e => markFailed(job, e));
    }, stepMs);
  }
  async function createJob(payload) {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) fail('BAD_REQUEST', 400, 'Expected job object');
    if (payload.providerId !== 'fixture-demo') fail('PROVIDER_UNAVAILABLE', 422, 'Only fixture-demo is enabled in G1');
    if (!['image', 'text'].includes(payload.mode)) fail('BAD_MODE', 422, 'Expected mode image or text');
    if (jobs.size >= 1000 || pending.length >= MAX_QUEUE) fail('CAPACITY', 429, 'Local job limit reached');
    const prompt = typeof payload.prompt === 'string' ? payload.prompt.trim() : '';
    if (prompt.length > 1200) fail('PROMPT_TOO_LONG', 422, 'Maximum 1200 characters');
    if (payload.mode === 'text' && prompt.length < 3) fail('PROMPT_REQUIRED', 422, 'Enter a text description');
    if (payload.url || payload.webhook || payload.remotePath || payload.command) fail('FORBIDDEN_REMOTE_INPUT', 422, 'Remote URLs and filesystem paths are not accepted');
    let image = null, imageInfo = null;
    if (payload.mode === 'image') {
      if (!payload.image || typeof payload.image.base64 !== 'string' || payload.image.base64.length > MAX_IMAGE_BYTES * 1.4 + 16) fail('IMAGE_REQUIRED', 422, 'A local PNG, JPEG or WebP is required (8 MiB max)');
      if (!/^[A-Za-z0-9+/]+={0,2}$/.test(payload.image.base64) || payload.image.base64.length % 4 === 1) fail('BAD_IMAGE', 422, 'Invalid image encoding');
      image = Buffer.from(payload.image.base64, 'base64');
      imageInfo = sniffImage(image);
      if (!imageInfo || image.length > MAX_IMAGE_BYTES || payload.image.mime !== imageInfo.mime) fail('BAD_IMAGE', 422, 'Image signature, MIME or size not supported');
    }
    const id = randomUUID();
    const j = {
      schema: 'local3d.job.v1', id, providerId: 'fixture-demo', mode: payload.mode, prompt,
      simulation: true, seed: 12026, status: 'queued', stage: 'queued', progress: 0,
      createdAt: now(), updatedAt: now(), completedAt: null, error: null,
      source: image ? { name: sanitizeFileName(payload.image.filename), mime: imageInfo.mime, bytes: image.length } : null,
      assets: []
    };
    // No user-provided path or URL is used to construct a disk location.
    await fs.mkdir(jobFolder(id), { recursive: true });
    if (image) {
      await fs.writeFile(path.join(jobFolder(id), 'input' + imageInfo.ext), image, { flag: 'wx' });
      j.assets.push(recordAsset('source-image', 'source', imageInfo.mime, image, 'Original reference image'));
    }
    jobs.set(id, j);
    await persist(j); await audit('job_created', id, { provider: 'fixture-demo', mode: j.mode });
    pending.push(id); queueNext();
    return publicJob(j);
  }
  async function cancelJob(job) {
    if (!['queued', 'running'].includes(job.status)) fail('ALREADY_FINISHED', 409, 'Job is no longer cancellable');
    const wasActive = job.id === activeId;
    if (wasActive && activeTimer) { clearTimeout(activeTimer); activeTimer = null; }
    job.status = 'cancelled'; job.stage = 'cancelled'; job.progress = 0;
    job.updatedAt = now(); await persist(job); await audit('cancelled', job.id);
    const idx = pending.indexOf(job.id);
    if (idx >= 0) pending.splice(idx, 1);
    if (wasActive) { activeId = null; queueNext(); }
    return publicJob(job);
  }

  async function serveFile(res, file, contentType, method = 'GET', cache = false) {
    const stat = await fs.stat(file).catch(() => null);
    if (!stat || !stat.isFile()) fail('NOT_FOUND', 404, 'Asset not found');
    res.writeHead(200, {
      'Content-Type': contentType, 'Content-Length': stat.size,
      'Content-Disposition': 'inline', 'Cache-Control': cache ? 'public, max-age=3600' : 'no-store',
      'X-Content-Type-Options': 'nosniff'
    });
    if (method === 'HEAD') { res.end(); return; }
    const stream = createReadStream(file);
    stream.on('error', () => res.destroy());
    stream.pipe(res);
  }
  const staticPaths = new Map([
    ['/', [path.join(ROOT, 'public', 'index.html'), 'text/html; charset=utf-8']],
    ['/app.js', [path.join(ROOT, 'public', 'app.js'), 'text/javascript; charset=utf-8']],
    ['/styles.css', [path.join(ROOT, 'public', 'styles.css'), 'text/css; charset=utf-8']],
    ['/vendor/three/build/three.module.js', [path.join(ROOT, 'node_modules', 'three', 'build', 'three.module.js'), 'text/javascript; charset=utf-8']],
    ['/vendor/three/examples/jsm/controls/OrbitControls.js', [path.join(ROOT, 'node_modules', 'three', 'examples', 'jsm', 'controls', 'OrbitControls.js'), 'text/javascript; charset=utf-8']],
    ['/vendor/three/examples/jsm/loaders/GLTFLoader.js', [path.join(ROOT, 'node_modules', 'three', 'examples', 'jsm', 'loaders', 'GLTFLoader.js'), 'text/javascript; charset=utf-8']],
    ['/vendor/three/examples/jsm/utils/BufferGeometryUtils.js', [path.join(ROOT, 'node_modules', 'three', 'examples', 'jsm', 'utils', 'BufferGeometryUtils.js'), 'text/javascript; charset=utf-8']]
  ]);
  const server = http.createServer(async (req, res) => {
    try {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('Referrer-Policy', 'no-referrer');
      res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
      res.setHeader('Content-Security-Policy', "default-src 'none'; script-src 'self' 'sha256-" + IMPORT_HASH + "'; style-src 'self'; img-src 'self' blob: data:; connect-src 'self'; worker-src 'none'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
      const host = String(req.headers.host || '');
      if (!/^(127\.0\.0\.1|localhost|\[::1\])(:\d+)?$/i.test(host)) fail('HOST_DENIED', 403, 'Loopback host required');
      const requested = new URL(req.url, 'http://localhost');
      const pathname = requested.pathname;
      if (pathname.length > 150 || pathname.includes('\\') || /%2f|%5c/i.test(req.url || '')) fail('INVALID_PATH', 400, 'Invalid URL path');
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        const origin = req.headers.origin;
        if (origin && origin !== 'http://' + host) fail('ORIGIN_DENIED', 403, 'Cross-origin mutation rejected');
      }
      if (req.method === 'GET' && pathname === '/v1/health') return reply(res, 200, { schema: 'local3d.health.v1', service: 'ready', localOnly: true, inference: false, status: 'G1_DEMO', jobs: jobs.size });
      if (req.method === 'GET' && pathname === '/v1/providers') return reply(res, 200, { schema: 'local3d.providers.v1', providers: PROVIDERS });
      if (req.method === 'GET' && pathname === '/v1/jobs') {
        const all = [...jobs.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 50);
        return reply(res, 200, { schema: 'local3d.jobs.v1', jobs: all.map(publicJob) });
      }
      if (req.method === 'POST' && pathname === '/v1/jobs') return reply(res, 201, await createJob(await readBody(req)));
      const match = pathname.match(/^\/v1\/jobs\/([^/]+)(?:\/(cancel|assets\/([^/]+)))?$/);
      if (match) {
        const id = match[1]; if (!isUuid(id)) fail('INVALID_JOB_ID', 404, 'Job not found');
        const job = jobs.get(id); if (!job) fail('NOT_FOUND', 404, 'Job not found');
        if (req.method === 'GET' && !match[2]) return reply(res, 200, publicJob(job));
        if (req.method === 'POST' && match[2] === 'cancel') return reply(res, 200, await cancelJob(job));
        if (['GET', 'HEAD'].includes(req.method) && match[3]) {
          const asset = job.assets.find(x => x.id === match[3]);
          if (!asset) fail('NOT_FOUND', 404, 'Asset not found');
          const leaf = asset.id === 'preview-glb' ? 'output.glb' : asset.id === 'qa-report' ? 'qa-report.json' : asset.id === 'source-image' && job.source ? 'input' + sniffMimeExt(job.source.mime) : null;
          if (!leaf) fail('NOT_FOUND', 404, 'Asset not found');
          return await serveFile(res, path.join(jobFolder(id), leaf), asset.mime, req.method);
        }
      }
      if (['GET', 'HEAD'].includes(req.method) && staticPaths.has(pathname)) {
        const [file, mime] = staticPaths.get(pathname);
        return await serveFile(res, file, mime, req.method, pathname !== '/');
      }
      fail('NOT_FOUND', 404, 'Route not found');
    } catch (e) {
      if (!(e instanceof HttpError)) console.error('Local 3D service:', e);
      errorReply(res, e);
    }
  });
  function sniffMimeExt(mime) { return mime === 'image/png' ? '.png' : mime === 'image/webp' ? '.webp' : '.jpg'; }
  const close = async () => {
    closing = true;
    if (activeTimer) clearTimeout(activeTimer);
    for (const job of jobs.values()) {
      if (job.status === 'running' || job.status === 'queued') {
        job.status = 'interrupted'; job.stage = 'interrupted'; job.progress = 0;
        job.updatedAt = now();
        job.error = { code: 'SHUTDOWN', message: 'Simulation stopped before completion' };
        await persist(job);
      }
    }
    await new Promise(resolve => server.close(resolve));
  };
  return { server, close, dataDir, jobs };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const host = '127.0.0.1';
  const port = Number(process.env.L3D_PORT || 4177);
  if (!Number.isInteger(port) || port < 1024 || port > 65535) { console.error('Invalid local port'); process.exit(1); }
  const app = await createApp();
  app.server.listen(port, host, () => console.log('LOCAL3D_READY http://' + host + ':' + port + '  G1 fixture-only, no AI inference'));
  for (const sig of ['SIGINT', 'SIGTERM']) process.once(sig, async () => { await app.close(); process.exit(0); });
}
