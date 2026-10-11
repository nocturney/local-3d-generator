import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {RollbackGateError,assessReadOnlyRollbackBaseline} from '../server/g338-rollback-readiness-contract.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFile(path.join(root,p));
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const normal=x=>sha(Buffer.from(x.toString('utf8').replace(/\r\n/g,'\n')));
const load=async()=>Promise.all([
 read('runtime/qa/g3/g338-production-readonly-rollback-rehearsal.json').then(JSON.parse),
 read('docs/evidence/g3/g3-37-shadow-pillow-historical-test-isolation.json').then(JSON.parse),
 read('docs/evidence/g3/g3-35-pillow-cpu-compatibility-and-upgrade-blockers.json').then(JSON.parse)
]);
const bad=(r,a,b)=>assert.throws(()=>assessReadOnlyRollbackBaseline(r,a,b),
 e=>e instanceof RollbackGateError&&e.code==='G338_INVALID_BASELINE');
test('G3.38 actual 34 pinned Python distributions and two synthetic manifest rollbacks, never full venv restore',async()=>{
 const a=await load(),got=assessReadOnlyRollbackBaseline(...a);
 assert.equal(got.schema,'local3d.g338.production-pillow-migration-rollback-readiness.v1');
 assert.equal(got.pinnedProductionDistributionCount,34);
 assert.equal(got.syntheticOnlyManifestRollbackScenariosPassed,2);
 assert.equal(got.checkedRollbackWheelStores,1);
 assert.equal(got.missingOriginalPillowOfflineRollbackWheelInCheckedStores,true);
 assert.equal(got.actualVenvCopyAndRestoreTested,false);
 assert.equal(got.automaticRollbackOrUpgradeAllowed,false);
 assert.equal(got.deploymentDecision,'BLOCKED_SCOPE_LIMITED_READONLY_PREPARATION');
 assert.equal(got.releaseCheckpoints.length,9);
 assert.equal(Object.isFrozen(got),true);
 assert.equal(Object.isFrozen(got.releaseCheckpoints),true);
 assert.equal(got.printQualified,false);
 assert.equal(got.fabricationAction,'NONE');
});
test('G3.38 false declared runtime/rollback artifact readiness never bypasses baseline gate',async()=>{
 const [r,a,b]=await load(),clone=x=>JSON.parse(JSON.stringify(x));
 for(const [key,value] of [
  ['installedRequirementsMatched',33],['scopedLocalWheelDirectoriesChecked',2],
  ['pinnedPillow10_1OfflineWheelFoundInCheckedDirs',true],
  ['realProductionPackageBackupVerified',true],
  ['productionVenvPackagesChanged',true],
  ['productionInstallOrRollbackActuallyPerformed',true],
  ['gpuOrModelRuns',1],['nativeDecoderSandboxEstablished',true],
  ['productionUpgradeAuthorized',true],['newDownloadOrNetworkRequest',true],
  ['deploymentReadiness','READY']
 ]){
  const row=clone(r);row[key]=value;bad(row,a,b);
 }
});
test('G3.38 a forged synthetic rollback cannot claim a restored production package or input hash',async()=>{
 const [r,a,b]=await load(),clone=x=>JSON.parse(JSON.stringify(x));
 let t=clone(r);t.syntheticRehearsalOutcomes[1]='PACKAGE_REINSTALLED';bad(t,a,b);
 t=clone(r);t.syntheticRehearsalRestoredOriginalManifestSHA256='0'.repeat(64);bad(t,a,b);
 t=clone(r);t.matchedOfflineRollbackWheelSha256=['0'.repeat(64)];bad(t,a,b);
 t=clone(r);t.criticalProductionVersions.pillow='12.3.0';bad(t,a,b);
 t=clone(r);t.existingPillow12_3ShadowWheelVerifiedSHA256='f'.repeat(64);bad(t,a,b);
});
test('G3.38 prior Pillow12.3 shadow exclusions and G3.35 BLOCKED status are mandatory',async()=>{
 const [r,a,b]=await load(),clone=x=>JSON.parse(JSON.stringify(x));
 let t=clone(a);t.validation.explicitHistorical10_1CaseExclusions=0;bad(r,t,b);
 t=clone(a);t.validation.originalFullUnfilteredShadowSuiteFailedWithFiveVersionLockErrors=false;bad(r,t,b);
 let u=clone(b);u.releaseDecision.productionUpgradeReadiness='READY';bad(r,a,u);
 u=clone(b);u.releaseDecision.canUpgradeProductionPillowAutomatically=true;bad(r,a,u);
});
test('G3.38 public report binds 34-package requirements, worker, previous historical evidence and read-only source',async()=>{
 const p=JSON.parse(await read('docs/evidence/g3/g3-38-python-upgrade-readiness-and-synthetic-rollback.json'));
 const matches=[
  ['frozenG337ShadowQualitySha256','docs/evidence/g3/g3-37-shadow-pillow-historical-test-isolation.json'],
  ['frozenG335UpgradeBlockerSha256','docs/evidence/g3/g3-35-pillow-cpu-compatibility-and-upgrade-blockers.json'],
  ['frozenProductionRequirementsSha256','engines/triposr/requirements-resolved-win-py311.txt'],
  ['unchangedG2ProductionWorkerSha256','engines/triposr/worker.py'],
  ['privateReadOnlyInventoryAndSyntheticRollbackReceiptSHA256','runtime/qa/g3/g338-production-readonly-rollback-rehearsal.json']
 ];
 for(const [k,f] of matches)assert.equal(p[k],sha(await read(f)),k);
 for(const [k,f] of [
  ['pythonReadOnlyProbeNormalizedSha256','scripts/g3-38-prod-rollback-readonly.py'],
  ['rollbackContractNormalizedSha256','server/g338-rollback-readiness-contract.js']
 ])assert.equal(p[k],normal(await read(f)),k);
 assert.deepEqual(p.decision,assessReadOnlyRollbackBaseline(...await load()));
});
test('G3.38 no copied production packages, live rollback, Office change or security approval',async()=>{
 const raw=await read('docs/evidence/g3/g3-38-python-upgrade-readiness-and-synthetic-rollback.json');
 const p=JSON.parse(raw.toString('utf8'));
 for(const field of [
  'copiedInstalledPackagesOrModelWeights','realProductionVenvBackupCreated',
  'originalPillow10_1WheelFoundInScopedLocalStore',
  'rollbackExecutableForProduction','productionUpgradePerformed',
  'osNativeParserSandboxVerified','office4178ProcessModified',
  'WindowsStartupTaskInstalled','issue4SecurityResolved',
  'issue5G1RestartResolved','issue3ManufacturingResolved',
  'printQualified','approvedForPrinter'
 ])assert.equal(p[field],false,field);
 assert.equal(p.GPUInferenceRuns,0);
 assert.equal(p.fabricationAction,'NONE');
 assert.doesNotMatch(raw.toString('utf8'),/[CD]:[/\\]|credential|password|api_key|privateKey|clientEmail/i);
});
