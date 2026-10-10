import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {auditJobStorage} from '../server/storage-audit.js';

test('G3 storage audit reports only sizes and statuses, never job IDs or private prompts',async()=>{
  const temp=await fs.mkdtemp(path.join(os.tmpdir(),'l3d-g3-storage-'));
  try{
    const id=randomUUID(),folder=path.join(temp,id);
    await fs.mkdir(folder);
    const manifest={
      id,status:'completed',updatedAt:'2026-01-01T00:00:00.000Z',
      prompt:'SECRET-SHOULD-NOT-LEAK',source:{name:'private-photo.png'}
    };
    const contents=JSON.stringify(manifest);
    await fs.writeFile(path.join(folder,'job.json'),contents);
    await fs.writeFile(path.join(folder,'output.glb'),Buffer.alloc(1024));
    await fs.mkdir(path.join(folder,'engine-output'));
    await fs.writeFile(path.join(folder,'engine-output','model.glb'),Buffer.alloc(420));
    const audit=await auditJobStorage({jobsDir:temp,now:'2026-10-10T10:00:00.000Z'});
    assert.equal(audit.foldersScanned,1);
    assert.equal(audit.statusCounts.completed,1);
    assert.equal(audit.totalBytes,Buffer.byteLength(contents)+1024+420);
    assert.equal(audit.olderThan30Days,1);
    assert.equal(audit.gpuInvocations,0);
    assert.equal(audit.deletionPerformed,false);
    assert.equal(audit.quotaEnforced,false);
    assert.doesNotMatch(JSON.stringify(audit),/SECRET-SHOULD-NOT-LEAK|private-photo|output\.glb/);
    assert.doesNotMatch(JSON.stringify(audit),new RegExp(id));
    assert.ok((await fs.stat(path.join(folder,'output.glb'))).isFile());
  }finally{await fs.rm(temp,{recursive:true,force:true})}
});

test('missing directory yields empty safe audit; unknown records never treated as valid',async()=>{
  const temp=await fs.mkdtemp(path.join(os.tmpdir(),'l3d-g3-storage-'));
  try{
    const none=await auditJobStorage({jobsDir:path.join(temp,'nonexistent')});
    assert.equal(none.foldersScanned,0);
    const folder=path.join(temp,randomUUID());await fs.mkdir(folder);
    await fs.writeFile(path.join(folder,'job.json'),'not-json');
    const audit=await auditJobStorage({jobsDir:temp});
    assert.equal(audit.foldersScanned,1);
    assert.equal(audit.unknownManifests,1);
    assert.equal(audit.deletionPerformed,false);
  }finally{await fs.rm(temp,{recursive:true,force:true})}
});
