import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { createApp } from '../server/index.js';
import { createFixtureBuffer } from '../server/fixture.js';

let app, base, tmp;
const tinyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI_ScL_nwAAAABJRU5ErkJggg'.replace(/_/g,'/'), 'base64');
async function req(url, method = 'GET', body, headers = {}) {
  const response = await fetch(base + url, { method, headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...headers }, body: body ? JSON.stringify(body) : undefined });
  const type = response.headers.get('content-type') || '';
  return { status: response.status, value: type.includes('json') ? await response.json() : await response.arrayBuffer() };
}
async function waitFor(id, wanted, timeout = 1800) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const r = await req('/v1/jobs/' + id);
    if (r.value.status === wanted) return r.value;
    await new Promise(r => setTimeout(r, 20));
  }
  throw new Error('Timeout waiting for job ' + id + ' to become ' + wanted);
}
beforeEach(async () => {
  tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'local3d-test-'));
  app = await createApp({ dataDir: path.join(tmp, 'data'), fixtureFile: path.join(tmp, 'fixture.glb'), stepMs: 32 });
  await new Promise(resolve => app.server.listen(0, '127.0.0.1', resolve));
  base = 'http://127.0.0.1:' + app.server.address().port;
});
afterEach(async () => { await app.close(); await fs.rm(tmp, { recursive:true, force:true }); });

test('health stays local, only fixture provider can run', async () => {
  const health = await req('/v1/health');
  assert.equal(health.status, 200); assert.equal(health.value.inference, false);
  const providers = await req('/v1/providers');
  assert.equal(providers.value.providers.filter(x => x.canStart).length, 1);
  assert.equal(providers.value.providers.find(x => x.id === 'triposr-local').status, 'CANDIDATE_G2');
});
test('valid image -> queued/running -> GLB + non-printable QA report', async () => {
  const created = await req('/v1/jobs', 'POST', {
    providerId:'fixture-demo', mode:'image', prompt:'ornamental sculpture',
    image:{filename:'sample.png',mime:'image/png',base64:tinyPng.toString('base64')}
  });
  assert.equal(created.status, 201);
  assert.equal(created.value.simulation, true);
  const job = await waitFor(created.value.id, 'completed');
  assert.equal(job.assets.length, 3); assert.equal(job.progress, 100);
  const glb = await req('/v1/jobs/' + job.id + '/assets/preview-glb');
  assert.equal(glb.status, 200); assert.equal(Buffer.from(glb.value).toString('ascii',0,4), 'glTF');
  const report = await req('/v1/jobs/' + job.id + '/assets/qa-report');
  assert.equal(report.value.geometryStatus,'DRAFT');
  assert.equal(report.value.printQualified,false);
  const source = await req('/v1/jobs/' + job.id + '/assets/source-image');
  assert.equal(source.status, 200);
});
test('bad inputs and remote providers fail closed', async () => {
  const candidate = await req('/v1/jobs','POST',{providerId:'triposr-local',mode:'text',prompt:'something'});
  assert.equal(candidate.status,422); assert.equal(candidate.value.error.code,'PROVIDER_UNAVAILABLE');
  const fake = await req('/v1/jobs','POST',{providerId:'fixture-demo',mode:'image',image:{mime:'image/png',base64:Buffer.from('not-an-image').toString('base64')}});
  assert.equal(fake.status,422);
  const noPrompt = await req('/v1/jobs','POST',{providerId:'fixture-demo',mode:'text',prompt:' '});
  assert.equal(noPrompt.status,422);
  const url = await req('/v1/jobs','POST',{providerId:'fixture-demo',mode:'text',prompt:'a vase',url:'https://internal/'});
  assert.equal(url.status,422); assert.equal(url.value.error.code,'FORBIDDEN_REMOTE_INPUT');
});
test('cancel active job: no output artifact and no orphan task', async () => {
  const created = await req('/v1/jobs','POST',{providerId:'fixture-demo',mode:'text',prompt:'a simple vase'});
  assert.equal(created.status,201);
  const cancel = await req('/v1/jobs/' + created.value.id + '/cancel', 'POST');
  assert.equal(cancel.status,200);
  const job = await waitFor(created.value.id,'cancelled');
  assert.ok(!job.assets.some(a => a.id === 'preview-glb'));
  const asset = await req('/v1/jobs/' + job.id + '/assets/preview-glb');
  assert.equal(asset.status,404);
});
test('host/origin checks and path traversal barriers', async () => {
  const blockedOrigin = await req('/v1/jobs','POST',{providerId:'fixture-demo',mode:'text',prompt:'three chairs'},{Origin:'http://evil.example'});
  assert.equal(blockedOrigin.status,403);
  const traversal = await req('/v1/jobs/%2e%2e/%2e%2e/secret');
  assert.notEqual(traversal.status,200);
  const randomJob = await req('/v1/jobs/11111111-1111-4111-8111-111111111111/assets/source-image');
  assert.equal(randomJob.status,404);
  const deniedHost = await new Promise((resolve,reject) => {
    const host = new URL(base);
    http.get({hostname:'127.0.0.1',port:Number(host.port),path:'/v1/health',headers:{Host:'example.com'}},response => {
      response.resume(); response.on('end',()=>resolve(response.statusCode));
    }).on('error',reject);
  });
  assert.equal(deniedHost,403);
});
test('fixture has binary GLB header and a valid length', async () => {
  const bytes = createFixtureBuffer();
  assert.equal(bytes.toString('ascii',0,4),'glTF');
  assert.equal(bytes.readUInt32LE(4),2);
  assert.equal(bytes.readUInt32LE(8),bytes.length);
});

test('restart persists records and does not falsely complete unfinished work', async () => {
  const created = await req('/v1/jobs','POST',{providerId:'fixture-demo',mode:'text',prompt:'abstract lamp'});
  assert.equal(created.status,201);
  const id = created.value.id;
  await app.close();
  app = await createApp({dataDir:path.join(tmp,'data'),fixtureFile:path.join(tmp,'fixture.glb'),stepMs:32});
  await new Promise(resolve => app.server.listen(0,'127.0.0.1',resolve));
  base = 'http://127.0.0.1:' + app.server.address().port;
  const readBack = await req('/v1/jobs/' + id);
  assert.equal(readBack.status,200);
  assert.equal(readBack.value.status,'interrupted');
  assert.ok(!readBack.value.assets.some(a => a.id === 'preview-glb'));
});

test('browser assets, Three.js imports and CSP are served locally', async () => {
  const paths = ['/', '/app.js', '/styles.css',
    '/vendor/three/build/three.module.js',
    '/vendor/three/examples/jsm/controls/OrbitControls.js',
    '/vendor/three/examples/jsm/loaders/GLTFLoader.js',
    '/vendor/three/examples/jsm/utils/BufferGeometryUtils.js'];
  for (const asset of paths) {
    const result = await fetch(base + asset);
    assert.equal(result.status, 200, asset);
    assert.equal(result.headers.get('x-content-type-options'),'nosniff');
    await result.arrayBuffer();
  }
  const page = await fetch(base + '/');
  assert.match(await page.text(), /type="importmap"/);
  assert.match(page.headers.get('content-security-policy'), /connect-src 'self'/);
});
