import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ownDir = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_FILE = path.resolve(ownDir, '../fixtures/demo-sculpture.glb');

function torus(major, minor, height, phase = 0) {
  const positions = [], normals = [], indices = [];
  const sides = 48, tubes = 16;
  for (let i = 0; i <= sides; i++) {
    const a = 2 * Math.PI * i / sides + phase;
    for (let j = 0; j <= tubes; j++) {
      const b = 2 * Math.PI * j / tubes;
      const nx = Math.cos(a) * Math.cos(b);
      const ny = Math.sin(b);
      const nz = Math.sin(a) * Math.cos(b);
      positions.push((major + minor * Math.cos(b)) * Math.cos(a), height + minor * Math.sin(b), (major + minor * Math.cos(b)) * Math.sin(a));
      normals.push(nx, ny, nz);
    }
  }
  for (let i = 0; i < sides; i++) {
    for (let j = 0; j < tubes; j++) {
      const a = i * (tubes + 1) + j, b = a + tubes + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  return { positions, normals, indices };
}

export function createFixtureBuffer() {
  const geometries = [
    torus(.69, .21, -.60),
    torus(.75, .20, -.15, .12),
    torus(.63, .21, .30, .24),
    torus(.55, .20, .75, .36)
  ];
  const bufferViews = [], accessors = [], meshes = [], nodes = [], parts = [];
  let offset = 0;
  function append(bytes, target) {
    const padding = (4 - offset % 4) % 4;
    if (padding) { parts.push(Buffer.alloc(padding)); offset += padding; }
    const index = bufferViews.length;
    bufferViews.push({ buffer: 0, byteOffset: offset, byteLength: bytes.length, target });
    parts.push(bytes);
    offset += bytes.length;
    return index;
  }
  for (let i = 0; i < geometries.length; i++) {
    const g = geometries[i];
    const pos = append(Buffer.from(new Float32Array(g.positions).buffer), 34962);
    const norm = append(Buffer.from(new Float32Array(g.normals).buffer), 34962);
    const index = append(Buffer.from(new Uint16Array(g.indices).buffer), 34963);
    const count = g.positions.length / 3;
    const bounds = [0, 1, 2].map(axis => g.positions.filter((_, n) => n % 3 === axis));
    const pIndex = accessors.push({ bufferView: pos, componentType: 5126, count, type: 'VEC3', min: bounds.map(x => Math.min(...x)), max: bounds.map(x => Math.max(...x)) }) - 1;
    const nIndex = accessors.push({ bufferView: norm, componentType: 5126, count, type: 'VEC3' }) - 1;
    const iIndex = accessors.push({ bufferView: index, componentType: 5123, count: g.indices.length, type: 'SCALAR' }) - 1;
    const m = meshes.push({ name: 'Demo ring ' + (i + 1), primitives: [{ attributes: { POSITION: pIndex, NORMAL: nIndex }, indices: iIndex, material: i % 2 }] }) - 1;
    nodes.push({ mesh: m, name: 'fixture-layer-' + (i + 1) });
  }
  const binary = Buffer.concat(parts);
  const doc = {
    asset: { version: '2.0', generator: 'Local 3D Generator G1 deterministic fixture; NOT AI output' },
    scene: 0, scenes: [{ nodes: nodes.map((_, i) => i) }], nodes, meshes,
    materials: [
      { name: 'Ceramic white', pbrMetallicRoughness: { baseColorFactor: [.88, .91, .89, 1], metallicFactor: .04, roughnessFactor: .38 }, doubleSided: true },
      { name: 'Sea glass blue', pbrMetallicRoughness: { baseColorFactor: [.21, .58, .64, 1], metallicFactor: .10, roughnessFactor: .3 }, doubleSided: true }
    ],
    buffers: [{ byteLength: binary.length }], bufferViews, accessors
  };
  const jsonSource = Buffer.from(JSON.stringify(doc), 'utf8');
  const jsonPadded = Buffer.concat([jsonSource, Buffer.alloc((4 - jsonSource.length % 4) % 4, 0x20)]);
  const binPadded = Buffer.concat([binary, Buffer.alloc((4 - binary.length % 4) % 4)]);
  const total = 12 + 8 + jsonPadded.length + 8 + binPadded.length;
  const header = Buffer.alloc(12);
  header.write('glTF', 0, 'ascii'); header.writeUInt32LE(2, 4); header.writeUInt32LE(total, 8);
  const jHead = Buffer.alloc(8), bHead = Buffer.alloc(8);
  jHead.writeUInt32LE(jsonPadded.length, 0); jHead.write('JSON', 4, 'ascii');
  bHead.writeUInt32LE(binPadded.length, 0); bHead.write('BIN\0', 4, 'ascii');
  return Buffer.concat([header, jHead, jsonPadded, bHead, binPadded]);
}

export async function ensureFixture(file = DEFAULT_FILE) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  try { await fs.access(file); }
  catch { await fs.writeFile(file, createFixtureBuffer(), { flag: 'wx' }); }
  return file;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  ensureFixture().then(file => console.log('Fixture: ' + file)).catch(e => { console.error(e); process.exitCode = 1; });
}
