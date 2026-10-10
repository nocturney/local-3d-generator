import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sha=b=>createHash('sha256').update(b).digest('hex');
const proof=JSON.parse(await fs.readFile(path.join(ROOT,'docs','evidence','g3','g3-6-shadow-pillow-cpu-proof.json'),'utf8'));
const catalogBytes=await fs.readFile(path.join(ROOT,'benchmarks','g3','fixtures','manifest.json'));
const freezeBytes=await fs.readFile(path.join(ROOT,'engines','triposr','requirements-resolved-win-py311.txt'));

test('G3.6 public shadow Pillow proof preserves pinned, known-source CPU evidence, no inference',()=>{
  const fixtures=JSON.parse(catalogBytes.toString('utf8')).fixtures;
  assert.equal(proof.schema,'local3d.g3-6.shadow-pillow-release-evidence.v1');
  assert.equal(proof.candidateShadowPillow,'12.3.0');
  assert.equal(proof.currentProductionPillow,'10.1.0');
  assert.equal(proof.productionDependencyManifestSha256,sha(freezeBytes));
  assert.equal(proof.sourceCatalogSha256,sha(catalogBytes));
  assert.equal(proof.benchmarkInputCases,9);
  assert.deepEqual([...proof.benchmarkCaseIds].sort(),fixtures.map(f=>f.id).sort());
  assert.equal(proof.sourceSha256VerifiedForEachInput,true);
  assert.ok(Object.values(proof.preprocessingRegressionChecks).every(x=>x==='PASS'));
  assert.deepEqual(proof.cpuTestCounts,{g2:5,g3:18,total:23});
  assert.equal(proof.tripoSRSourceImportOnly.importedPinnedSource,true);
  assert.equal(proof.tripoSRSourceImportOnly.importedSystem,true);
  assert.equal(proof.tripoSRSourceImportOnly.modelInferenceExecuted,false);
  assert.equal(proof.tripoSRSourceImportOnly.modelWeightsLoaded,false);
  assert.equal(proof.tripoSRSourceImportOnly.cudaVisible,false);
  assert.equal(proof.productionVenvModified,false);
  assert.equal(proof.customerSourceMediaUsed,false);
  assert.equal(proof.printerCommandsSent,false);
  assert.equal(proof.outputPrintQualified,false);
  assert.equal(proof.securityQualification,'NOT_GRANTED');
  assert.match(freezeBytes.toString('utf8'),/^Pillow==10\.1\.0$/m,'Production Python freeze must remain on old version');
});

test('G3.6 wheel and public OSV screen are explicit evidence, not a security guarantee',()=>{
  assert.equal(proof.publicPyPiWheel.name,'pillow-12.3.0-cp311-cp311-win_amd64.whl');
  assert.equal(proof.publicPyPiWheel.sha256,'8e95e1385e4998ae9694eeaa4730ba5457ff61185b3a55e2e7bea0880aef452a');
  assert.equal(proof.publicPyPiWheel.officialPyPiAndDownloadedMatch,true);
  assert.deepEqual(proof.osvVersionAdvisoryMatches.map(v=>v.version),['10.1.0','12.3.0']);
  assert.ok(proof.osvVersionAdvisoryMatches[0].osvAdvisoryMatches>0);
  assert.equal(proof.osvVersionAdvisoryMatches[1].osvAdvisoryMatches,0);
  assert.match(proof.nextGate,/isolated model compatibility/i);
  const text=JSON.stringify(proof);
  assert.doesNotMatch(text,/[A-Z]:\\|\/Users\/|\/home\/|\"jobId\":|\"prompt\":|\"filename\":/);
});

test('v0.2.6 Node audit evidence is separate from historical v0.2.5 snapshot',async()=>{
  const bytes=await fs.readFile(path.join(ROOT,'docs','evidence','g3','g3-6-npm-audit-summary.json'));
  const report=JSON.parse(bytes.toString('utf8'));
  const lock=await fs.readFile(path.join(ROOT,'package-lock.json'));
  const meta=JSON.parse(lock.toString('utf8'));
  const packageJson=JSON.parse(await fs.readFile(path.join(ROOT,'package.json'),'utf8'));
  // A prior release audit is an immutable historical snapshot. It MUST NOT
  // be falsely attributed to a newer release just because dependencies are
  // similar; after a version bump, the lockfile SHA naturally changes.
  assert.equal(meta.version,packageJson.version);
  assert.equal(report.schema,'local3d.g3-6.npm-audit-summary.v1');
  assert.equal(report.applicationVersion,'0.2.6');
  assert.match(report.packageLockSha256,/^[a-f0-9]{64}$/);
  if(meta.version===report.applicationVersion) {
    assert.equal(report.packageLockSha256,sha(lock));
  } else {
    assert.notEqual(report.packageLockSha256,sha(lock),
      'Historical v0.2.6 audit must not be silently re-labeled as current');
  }
  assert.equal(report.modelInferenceExecuted,false);
  assert.equal(report.dependenciesInstalled,false);
  assert.equal(report.noSecurityGuarantee,true);
  assert.equal(report.results.length,2);
  assert.deepEqual(report.results.map(x=>x.scope),['production-only','production-and-dev']);
  for(const result of report.results){
    assert.equal(result.vulnerabilities.total,
      result.vulnerabilities.info+result.vulnerabilities.low+
      result.vulnerabilities.moderate+result.vulnerabilities.high+
      result.vulnerabilities.critical);
  }
});
