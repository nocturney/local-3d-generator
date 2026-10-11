import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {checkIsolatedPillowRestore,IsolatedRestoreError} from '../server/g340-offline-wheel-rollback-contract.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=name=>fs.readFile(path.join(root,name));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const normalized=b=>sha(Buffer.from(b.toString('utf8').replace(/\r\n/g,'\n')));
const inputs=()=>Promise.all([
 read('runtime/qa/g3/g340-pillow-isolated-offline-rollback.json').then(JSON.parse),
 read('docs/evidence/g3/g3-39-disabled-g1-boot-review-no-task-installed.json').then(JSON.parse)
]);
const clone=v=>JSON.parse(JSON.stringify(v));
const bad=(a,b)=>assert.throws(()=>checkIsolatedPillowRestore(a,b),
 e=>e instanceof IsolatedRestoreError&&e.code==='G340_BAD_RESTORE_RECEIPT');
test('G3.40 verified original Pillow wheel, true offline baseline > candidate > restored original in CLEAN venv',async()=>{
 const [a,b]=await inputs(),got=checkIsolatedPillowRestore(a,b);
 assert.equal(got.schema,'local3d.g340.offline-restored-pillow-wheel-verified-not-full-venv.v1');
 assert.equal(got.baselineWheelReacquiredFromOfficialPyPiWithPinnedSHA,true);
 assert.equal(got.baselineOriginalWheelBytes,2609067);
 assert.equal(got.exactThreeNativePillowStageRestoresVerified,true);
 assert.equal(got.trustedFormatRgbParity,'3_FORMATS_IDENTICAL_ALL_3_STAGES');
 assert.equal(got.full34PackageVenvRestored,false);
 assert.equal(got.productionPythonUpgraded,false);
 assert.equal(got.canInstallCandidateToProductionAutomatically,false);
 assert.equal(got.decision,'REAL_OFFLINE_PILLOW_RESTORE_PASS_FULL_PRODUCTION_UPGRADE_BLOCKED');
 assert.equal(Object.isFrozen(got),true);
});
test('G3.40 refuses fabricated G2/GPU, full TripoSR venv restore or customer security clearance',async()=>{
 const [a,b]=await inputs();
 for(const [k,v] of [
  ['full34PackageTripoSRVenvCopiedOrRestored',true],
  ['productionPipInstallOrUninstall',true],['productionPythonModified',true],
  ['networkAccessOrDownloadDuringRestore',true],['osNativeDecoderSandboxVerified',true],
  ['untrustedMediaProcessed',true],['productionPillowUpgradeAuthorized',true],
  ['printerApproved',true],['gpuOrModelInferenceRuns',1]
 ]){const t=clone(a);t[k]=v;bad(t,b);}
});
test('G3.40 actual Pillow wheel stage versions, case ordering and raw RGB SHA parity cannot be spoofed',async()=>{
 const [a,b]=await inputs(),rows=a.isolatedWheelStages;
 let t=clone(a);t.isolatedWheelStages[1].pillowVersion='11.0.0';bad(t,b);
 t=clone(a);t.isolatedWheelStages[2].stage='BASELINE_ISOLATED';bad(t,b);
 t=clone(a);t.isolatedWheelStages[0].pixelSha256ByFormat.PNG='0'.repeat(64);bad(t,b);
 t=clone(a);delete t.isolatedWheelStages[1].pixelSha256ByFormat.WEBP;bad(t,b);
 t=clone(a);t.isolatedWheelStages[0].isolatedCleanPython=false;bad(t,b);
 assert.deepEqual(rows.map(x=>x.pillowVersion),['10.1.0','12.3.0','10.1.0']);
});
test('G3.40 parent G1 service outage must remain distinct from tested temporary Pillow rollback',async()=>{
 const [a,b]=await inputs();
 let t=clone(b);t.noG1PersistentStartupPerformed=false;bad(a,t);
 t=clone(b);t.g1OperationalIssue5StillOpen=false;bad(a,t);
 t=clone(b);t.actualGpuInferenceRuns=1;bad(a,t);
});
test('G3.40 SHA-linked public proof binds official actual wheel BYTES, prior security and original manifest',async()=>{
 const proof=JSON.parse(await read('docs/evidence/g3/g3-40-verified-official-wheel-and-real-isolated-rollback.json'));
 const raw=['runtime/qa/g3/rollback-wheelhouse/Pillow-10.1.0-cp311-cp311-win_amd64.whl',
  'runtime/qa/g3/pillow-shadow/wheels/pillow-12.3.0-cp311-cp311-win_amd64.whl'];
 assert.equal(proof.upstreamPyPiPublishedSha256,sha(await read(raw[0])));
 assert.equal(proof.existingShadowPillow123WheelSha256,sha(await read(raw[1])));
 assert.equal(proof.upstreamWheelBytes,(await read(raw[0])).length);
 for(const [k,f] of [
  ['parentG339ImmutableSha256','docs/evidence/g3/g3-39-disabled-g1-boot-review-no-task-installed.json'],
  ['earlierG338ReadOnlyUpgradeGateSha256','docs/evidence/g3/g3-38-python-upgrade-readiness-and-synthetic-rollback.json'],
  ['unchangedActualProductionWorkerSha256','engines/triposr/worker.py'],
  ['originalTrustedThreeImageManifestSha256','tests/fixtures/g327-synthetic-images.json'],
  ['pinnedProductionRequirementsSha256','engines/triposr/requirements-resolved-win-py311.txt'],
  ['privateRealIsolatedWheelRollbackReceiptSha256','runtime/qa/g3/g340-pillow-isolated-offline-rollback.json']
 ])assert.equal(proof[k],sha(await read(f)),k);
 for(const [k,f] of [
  ['downloadSource','scripts/g3-40-verified-official-pillow-wheel.py'],
  ['cacheSource','scripts/g3-40-readonly-pip-cache.py'],
  ['cleanSource','scripts/g3-40-clean-isolated-pillow-check.py'],
  ['exerciseSource','scripts/g3-40-offline-isolated-pillow-rollback.py'],
  ['contract','server/g340-offline-wheel-rollback-contract.js']
 ])assert.equal(proof.sourceNormalizedSha256[k],normalized(await read(f)),k);
 assert.deepEqual(proof.decision,checkIsolatedPillowRestore(...await inputs()));
});
test('G3.40 wheel remains ignored/local, production untouched, no OS or printing claims',async()=>{
 const b=await read('docs/evidence/g3/g3-40-verified-official-wheel-and-real-isolated-rollback.json');
 const p=JSON.parse(b);
 assert.equal(p.localWheelPrivateIgnoredNotCommitted,true);
 assert.equal(p.verifiedActualOfflineInstallThreeStages,true);
 assert.equal(p.fullOriginal34PackageEnvironmentNotRestored,true);
 assert.equal(p.productionPackageChanges,false);
 assert.equal(p.cloudModelOrGpuJobs,0);
 for(const k of ['customerUntrustedMediaParsed','OSNativeParserIsolationAttested',
  'office4178Touched','G1Permanent4177Restored','newOSStartupTaskInstalled',
  'productionPillowUpgradeApproved','securityIssue4Resolved',
  'manufacturingIssue3Resolved','operationalIssue5Resolved','printQualified','approvedForPrinter'])
 assert.equal(p[k],false,k);
 assert.equal(p.fabricationAction,'NONE');
 assert.doesNotMatch(b.toString('utf8'),/C:[/\\]|D:[/\\]|cacheRelativeKey|customerEmail|rawImageBase64|password|privateKey/i);
});
