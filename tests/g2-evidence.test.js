import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Box3, Vector3 } from 'three';

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../docs/evidence/g2');
const digest = bytes => createHash('sha256').update(bytes).digest('hex');

test('real TripoSR G2 evidence is provenance linked, independent of G1 fixture', async () => {
  const [source, glb, qaRaw, orientationRaw, browserRaw] = await Promise.all([
    fs.readFile(path.join(dir,'source-chair.png')),
    fs.readFile(path.join(dir,'chair-yup.glb')),
    fs.readFile(path.join(dir,'inference-qa.json'),'utf8'),
    fs.readFile(path.join(dir,'upright-qa.json'),'utf8'),
    fs.readFile(path.join(dir,'browser-validation.json'),'utf8')
  ]);
  const qa = JSON.parse(qaRaw), orient = JSON.parse(orientationRaw), browser = JSON.parse(browserRaw);
  assert.equal(qa.simulation,false);
  assert.equal(qa.mode,'LOCAL_REAL_INFERENCE');
  assert.equal(qa.inputSha256,digest(source));
  assert.equal(orient.sourceSha256,qa.artifactSha256);
  assert.equal(orient.outputSha256,digest(glb));
  assert.equal(orient.coordinateSystem,'Y_UP');
  assert.equal(browser.modelSha256,orient.outputSha256);
  assert.equal(orient.printQualified,false);
  assert.equal(orient.status,'DRAFT');
  assert.equal(browser.browserView,'PASS');
  assert.deepEqual(browser.externalRequests,[]);
  assert.deepEqual(browser.consoleErrors,[]);
  assert.equal(glb.toString('ascii',0,4),'glTF');
  assert.equal(glb.readUInt32LE(8),glb.length);
});

test('verified real G2 GLB is structurally valid and upright', async () => {
  const bytes=await fs.readFile(path.join(dir,'chair-yup.glb'));
  const buffer=bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength);
  const parsed=await new Promise((resolve,reject)=>new GLTFLoader().parse(buffer,'',resolve,reject));
  let meshes=0,vertices=0,faces=0;
  parsed.scene.traverse(o=>{
    if(o.isMesh){
      meshes++;vertices+=o.geometry.getAttribute('position').count;
      faces+=o.geometry.index.count/3;
    }
  });
  assert.equal(meshes,1);
  assert.equal(vertices,9986);
  assert.equal(faces,19972);
  const bounds=new Box3().setFromObject(parsed.scene).getSize(new Vector3());
  assert.ok(bounds.y>bounds.x && bounds.y>bounds.z,'Chair must be Y-up after CPU correction');
});
