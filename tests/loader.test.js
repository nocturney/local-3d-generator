import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Box3, Vector3 } from 'three';
import { createFixtureBuffer } from '../server/fixture.js';

test('bundled GLB parses in the actual Three.js GLTFLoader', async () => {
  const bytes = createFixtureBuffer();
  const binary = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  const parsed = await new Promise((resolve,reject) => new GLTFLoader().parse(binary, '', resolve, reject));
  let meshes = 0, triangles = 0;
  parsed.scene.traverse(obj => {
    if (obj.isMesh) {
      meshes++;
      assert.ok(obj.geometry.getAttribute('position').count > 0);
      assert.ok(obj.geometry.getAttribute('normal'));
      triangles += obj.geometry.index.count / 3;
    }
  });
  const size = new Box3().setFromObject(parsed.scene).getSize(new Vector3());
  assert.equal(meshes, 4);
  assert.ok(triangles > 500);
  assert.ok(size.x > 1 && size.y > 1 && size.z > 1);
});
