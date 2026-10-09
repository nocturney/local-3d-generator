import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Box3, Vector3 } from 'three';
import { chromium } from 'playwright-core';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pilotRoot = path.join(ROOT, 'runtime', 'pilots');
const known = (await fs.readdir(pilotRoot, { withFileTypes: true }))
  .filter(x => x.isDirectory() && x.name.startsWith('tripo-'))
  .map(x => x.name).sort();
const requested = process.argv[2] || known.at(-1);
if (!requested || !known.includes(requested) || !/^tripo-[A-Za-z0-9-]+$/.test(requested)) {
  throw new Error('Pilot not found or invalid');
}
const dir = path.join(pilotRoot, requested);
const upright = process.argv.includes('--upright');
const baseReport = JSON.parse(await fs.readFile(path.join(dir, 'qa-report.json'), 'utf8'));
const report = upright ? JSON.parse(await fs.readFile(path.join(dir, 'upright-report.json'), 'utf8')) : baseReport;
const modelFilename = upright ? 'model-upright.glb' : 'model.glb';
const glb = await fs.readFile(path.join(dir, modelFilename));
const sha = createHash('sha256').update(glb).digest('hex');
const expectedSha = upright ? report.outputSha256 : report.artifactSha256;
if (sha !== expectedSha || report.simulation !== false || report.printQualified !== false) {
  throw new Error('GLB provenance mismatch');
}
if (glb.toString('ascii', 0, 4) !== 'glTF' || glb.readUInt32LE(8) !== glb.length) {
  throw new Error('Invalid binary GLB header/length');
}
const asset = glb.buffer.slice(glb.byteOffset, glb.byteOffset + glb.byteLength);
const parsed = await new Promise((resolve, reject) => new GLTFLoader().parse(asset, '', resolve, reject));
let meshes = 0, faces = 0, vertices = 0;
parsed.scene.traverse(obj => {
  if (!obj.isMesh) return;
  meshes++;
  vertices += obj.geometry.getAttribute('position')?.count || 0;
  faces += obj.geometry.index
    ? obj.geometry.index.count / 3
    : obj.geometry.getAttribute('position').count / 3;
});
if (meshes === 0 || faces !== report.faces || vertices !== report.vertices) {
  throw new Error('Parsed GLB mesh does not match the real inference report');
}
const bounds = new Box3().setFromObject(parsed.scene).getSize(new Vector3());
if (![bounds.x, bounds.y, bounds.z].every(x => Number.isFinite(x) && x > 0)) {
  throw new Error('Invalid mesh bounds');
}

const publicRoutes = {
  '/': path.join(ROOT, 'tests', 'g2-pilot.html'),
  '/viewer.js': path.join(ROOT, 'tests', 'g2-viewer.js'),
  '/vendor/three/build/three.module.js': path.join(ROOT, 'node_modules', 'three', 'build', 'three.module.js'),
  '/vendor/three/build/three.core.js': path.join(ROOT, 'node_modules', 'three', 'build', 'three.core.js'),
  '/vendor/three/examples/jsm/controls/OrbitControls.js': path.join(ROOT, 'node_modules', 'three', 'examples', 'jsm', 'controls', 'OrbitControls.js'),
  '/vendor/three/examples/jsm/loaders/GLTFLoader.js': path.join(ROOT, 'node_modules', 'three', 'examples', 'jsm', 'loaders', 'GLTFLoader.js'),
  '/vendor/three/examples/jsm/utils/BufferGeometryUtils.js': path.join(ROOT, 'node_modules', 'three', 'examples', 'jsm', 'utils', 'BufferGeometryUtils.js')
};
const server = http.createServer(async (req, res) => {
  try {
    let bytes;
    const route = req.url.split('?')[0];
    if (route === '/model.glb') bytes = glb;
    else if (Object.hasOwn(publicRoutes, route)) bytes = await fs.readFile(publicRoutes[route]);
    else { res.writeHead(404); res.end(); return; }
    const ext = path.extname(route);
    const type = ext === '.glb' ? 'model/gltf-binary'
      : ext === '.html' || route === '/' ? 'text/html; charset=utf-8'
      : 'text/javascript; charset=utf-8';
    res.writeHead(200, {
      'Content-Type': type,
      'Content-Length': bytes.length,
      'X-Content-Type-Options': 'nosniff'
    });
    res.end(bytes);
  } catch {
    res.writeHead(500); res.end();
  }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser;
let screenshotResult = 'NOT_ATTEMPTED';
const consoleErrors = [];
const externalRequests = [];
try {
  const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  browser = await chromium.launch({
    executablePath,
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-extensions']
  });
  const page = await browser.newPage({ viewport: { width: 1200, height: 856 }, deviceScaleFactor: 1 });
  const origin = 'http://127.0.0.1:' + server.address().port;
  page.on('pageerror', e => consoleErrors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('request', request => {
    if (!request.url().startsWith(origin + '/')) externalRequests.push(request.url());
  });
  await page.goto(origin + (upright ? '?upright=1' : ''), { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__pilotReady === true, null, { timeout: 18000 });
  await page.screenshot({ path: path.join(dir, upright ? 'pilot-preview-upright.png' : 'pilot-preview.png'), fullPage: true });
  if (consoleErrors.length || externalRequests.length) {
    throw new Error('Browser errors/external requests: ' + JSON.stringify({ consoleErrors, externalRequests }));
  }
  screenshotResult = 'PASS';
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
}
const validation = {
  schema: 'local3d.g2.glb-validation.v1',
  validatedAt: new Date().toISOString(),
  pilot: requested,
  sourceCommit: baseReport.sourceCommit,
  modelSha256: sha,
  coordinateSystem: upright ? 'Y_UP' : 'Z_UP',
  modelBytes: glb.length,
  meshes, vertices, faces,
  bounds: [bounds.x, bounds.y, bounds.z],
  realInference: true,
  printQualified: false,
  browserView: screenshotResult,
  consoleErrors, externalRequests
};
await fs.writeFile(path.join(dir, upright ? 'validation-upright.json' : 'validation.json'), JSON.stringify(validation, null, 2) + '\n');
console.log('PILOT_VALIDATED ' + JSON.stringify(validation));
