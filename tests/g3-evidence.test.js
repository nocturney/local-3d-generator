import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const bench=path.join(root,'benchmarks','g3','fixtures');
const ev=path.join(root,'docs','evidence','g3');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const readJson=file=>fs.readFile(file,'utf8').then(JSON.parse);
const blob=file=>fs.readFile(file);

test('G3 nine benchmark source images and masks are SHA-locked, original GT GLBs are locally parseable',async()=>{
  const catalog=await readJson(path.join(bench,'manifest.json'));
  assert.equal(catalog.schema,'local3d.g3.fixture-catalog.v1');
  assert.equal(catalog.fixtureCount,9);
  assert.equal(catalog.requiresGpu,false);
  assert.equal(catalog.hasRealInference,false);
  const rights=new Set();
  for(const item of catalog.fixtures){
    rights.add(item.sourceRights);
    const original=item.sourceRights==='PROJECT_ORIGINAL_PROCEDURAL';
    const src=path.join(original?bench:root,item.files.image);
    const mask=path.join(original?bench:root,item.files.mask);
    assert.equal(sha(await blob(src)),item.imageSha256,item.id+' source SHA');
    assert.equal(sha(await blob(mask)),item.maskSha256,item.id+' mask SHA');
    if(!original){
      assert.equal(item.files.groundTruth,null);
      continue;
    }
    const glb=await blob(path.join(bench,item.files.groundTruth));
    assert.equal(sha(glb),item.groundTruthSha256,item.id+' GT SHA');
    assert.equal(glb.toString('ascii',0,4),'glTF');
    assert.equal(glb.readUInt32LE(8),glb.length);
    const buffer=glb.buffer.slice(glb.byteOffset,glb.byteOffset+glb.byteLength);
    const model=await new Promise((resolve,reject)=>new GLTFLoader().parse(buffer,'',resolve,reject));
    let faces=0;model.scene.traverse(o=>{if(o.isMesh)faces+=o.geometry.index?.count/3||o.geometry.attributes.position.count/3});
    assert.ok(faces>=12,item.id+' valid topology');
  }
  assert.deepEqual([...rights].sort(),['PROJECT_ORIGINAL_PROCEDURAL','UPSTREAM_TRIPOSR_MIT_SAMPLE']);
});

test('G3 existing real chair geometry flags negative volume, has no print qualification',async()=>{
  const raw=await blob(path.join(root,'docs','evidence','g2-app','real-app-output.glb'));
  const result=await readJson(path.join(ev,'chair-geometry.json'));
  assert.equal(result.modelSha256,sha(raw));
  assert.equal(result.totalTriangles,19972);
  assert.equal(result.topology.everyObjectWatertight,true);
  assert.equal(result.topology.everyObjectPositiveVolume,false);
  assert.ok(result.parts[0].signedVolumeArbitraryUnitsCubed<0);
  assert.equal(result.classification,'DRAFT_REQUIRES_HUMAN_REVIEW');
  assert.equal(result.notEvaluated.wallThickness,'NOT_TESTED');
  assert.equal(result.printQualified,false);
  assert.equal(result.approvedForPrinter,false);
});

test('G3 separate CPU winding derivative has positive volume but remains DRAFT',async()=>{
  const original=await blob(path.join(root,'docs','evidence','g2-app','real-app-output.glb'));
  const corrected=await blob(path.join(ev,'chair-positive-winding.glb'));
  const trace=await readJson(path.join(ev,'chair-orientation-derivative.json'));
  const report=await readJson(path.join(ev,'chair-positive-winding-qa.json'));
  assert.equal(trace.sourceSha256,sha(original));
  assert.equal(trace.derivedSha256,sha(corrected));
  assert.notEqual(trace.sourceSha256,trace.derivedSha256);
  assert.equal(trace.triangles,19972);
  assert.equal(trace.sourcePositiveVolume,false);
  assert.equal(trace.derivedPositiveVolume,true);
  assert.equal(trace.printQualified,false);
  assert.equal(report.topology.everyObjectPositiveVolume,true);
  assert.equal(report.totalTriangles,19972);
  assert.equal(report.notEvaluated.realWorldScaleAndUnits,'UNKNOWN_UNCALIBRATED');
});

test('G3 source-silhouette positive controls and existing real sample are not fabricated model benchmarks',async()=>{
  const controls=await readJson(path.join(ev,'silhouette-positive-controls.json'));
  const chair=await readJson(path.join(ev,'chair-silhouette-exploratory.json'));
  const browser=await readJson(path.join(ev,'real-chair-cpu-review-proof.json'));
  assert.equal(controls.controlCount,8);
  assert.ok(controls.minimumIoU>.93);
  assert.equal(controls.notAiInference,true);
  assert.equal(chair.fixtureId,'09-upstream-chair');
  assert.equal(chair.testedViews,24);
  assert.match(chair.metricInterpretation,/EXPLORATORY_UPPER_BOUND/);
  assert.equal(chair.printQualified,false);
  assert.equal(browser.success,true);
  assert.equal(browser.newGpuInference,false);
  assert.equal(browser.workerCalls,0);
  assert.equal(browser.positiveVolume,false);
  assert.deepEqual(browser.browserErrors,[]);
  assert.deepEqual(browser.externalRequests,[]);
});
