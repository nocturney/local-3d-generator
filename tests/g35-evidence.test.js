import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const evidence=path.join(root,'docs','evidence','g3');
const json=async name=>JSON.parse(await fs.readFile(path.join(evidence,name),'utf8'));
const sha=b=>createHash('sha256').update(b).digest('hex');

test('G3.5 storage proof is read-only, private job records unchanged and zero GPU inference',async()=>{
  const r=await json('g3-5-storage-admission.json');
  assert.equal(r.schema,'local3d.g3-5.storage-admission-proof.v1');
  assert.equal(r.mode,'READ_ONLY_NO_INFERENCE');
  assert.equal(r.outcome,'ADMITTED');
  assert.equal(r.foldersBefore,r.foldersAfter);
  assert.equal(r.storedBytesBefore,r.storedBytesAfter);
  assert.equal(r.deletedJobs,0);
  assert.equal(r.gpuInferenceRuns,0);
  assert.equal(r.cpuReviewRuns,0);
  assert.equal(r.printQualified,false);
  assert.equal(r.freeSpacePassesReservationThreshold,true);
  const raw=JSON.stringify(r);
  assert.doesNotMatch(raw,/[A-Z]:\\|\/Users\/|\/home\/|"jobId":|"prompt":|"filename":/);
});

test('G3.5 PyPI advisory evidence matches exact frozen public dependency inventory',async()=>{
  const report=await json('g3-5-python-osv-screen.json');
  const manifest=await fs.readFile(path.join(root,'engines','triposr','requirements-resolved-win-py311.txt'));
  assert.equal(report.schema,'local3d.g3-5.python-dependency-screen.v1');
  assert.equal(report.frozenDependencyManifestSha256,sha(manifest));
  assert.equal(report.publicPyPiVersionPairsOnly,true);
  assert.equal(report.sensitiveUserDataTransferred,false);
  assert.equal(report.modelInferenceRuns,0);
  assert.equal(report.dependencyChanges,0);
  assert.equal(report.installationChanges,0);
  assert.equal(report.queryCount,report.packages.length);
  assert.equal(report.totalMatchedAdvisoryIds,
    report.packages.reduce((sum,p)=>sum+p.advisoryCount,0));
  assert.equal(report.packagesWithMatchedAdvisories,
    report.packages.filter(p=>p.advisoryCount>0).length);
  const names=new Set(report.packages.map(p=>p.name.toLowerCase()));
  assert.equal(names.size,report.packages.length);
  assert.ok(names.has('pillow')&&names.has('torch')&&names.has('transformers'));
  assert.doesNotMatch(JSON.stringify(report),/[A-Z]:\\|\/Users\/|\/home\/|"jobId":|"prompt":|"filename":/);
});

test('G3.5 npm advisory proof ties both scopes to the pinned lockfile; no silent install',async()=>{
  const report=await json('g3-5-npm-audit-summary.json');
  // Immutable historical v0.2.5 evidence must NOT be rewritten when the
  // current app version advances. G3.6 has a separate audit proof for v0.2.6.
  const historicalLockSha='c270d641ecb43b65fc590abf66deb136f42898ed16be820d415af7522e8978da';
  assert.equal(report.schema,'local3d.g3-5.npm-audit-summary.v1');
  assert.equal(report.npmPackageLockSha256,historicalLockSha);
  assert.equal(report.results.length,2);
  assert.equal(report.results[0].name,'npm-audit-prod');
  assert.equal(report.results[1].name,'npm-audit-all');
  assert.equal(report.dependencyChanges,0);
  assert.equal(report.modelInferenceRuns,0);
  for(const scope of report.results){
    const counts=scope.vulnerabilities;
    assert.equal(counts.total,counts.info+counts.low+counts.moderate+counts.high+counts.critical);
  }
});
