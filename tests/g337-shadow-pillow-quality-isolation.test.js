import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=name=>fs.readFile(path.join(root,name));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const normalized=b=>sha(Buffer.from(b.toString('utf8').replace(/\r\n/g,'\n')));
const report=()=>read('docs/evidence/g3/g3-37-shadow-pillow-historical-test-isolation.json').then(JSON.parse);
test('G3.37 exact shadow suite: 242 pass with 20 deliberate historical v10.1 exclusions',async()=>{
 const p=await report(),x=p.validation;
 assert.equal(p.schema,'local3d.g337.pillow12-3-shadow-qa-with-explicit-historical-version-exclusions.v1');
 assert.equal(x.totalQualitySuiteCasesDiscovered,262);
 assert.equal(x.explicitHistorical10_1CaseExclusions,20);
 assert.equal(x.selectedShadow12_3CasesPassed,242);
 assert.equal(x.selectedShadowCasesFailed,0);
 assert.equal(x.untouchedOld10_1SecurityAuditClassCases,16);
 assert.equal(x.untouchedOld10_1SafeImageHistoricalProofCases,3);
 assert.equal(x.untouchedOld10_1CanonicalFixtureGeneratorCase,1);
 assert.equal(x.shadowSuccessMustNeverBeReportedAsFull262Passed,true);
 assert.equal(p.excludedHistoricalMethodIds.length,20);
 assert.equal(new Set(p.excludedHistoricalMethodIds).size,20);
});
test('G3.37 historic unfiltered errors are disclosed as failed, not silently relabeled as success',async()=>{
 const p=await report(),x=p.validation;
 assert.equal(x.originalFullUnfilteredShadowSuiteFailedWithFiveVersionLockErrors,true);
 assert.equal(x.fullUnfilteredTestsReported,246);
 assert.equal(x.fullUnfilteredErrors,5);
 assert.equal(x.production10_1SuiteVerifiedSeparatelyByG336,true);
 assert.equal(x.pillow12_3AlreadyInstalledShadowOnly,true);
 assert.equal(x.noNewPythonModulesOrPackagesInstalled,true);
});
test('G3.37 SHA evidence preserves G3.35 upgrade block and G3.36 baseline',async()=>{
 const p=await report();
 const checks=[
  ['parentG336PublicSha256','docs/evidence/g3/g3-36-g1-ephemeral-recovery-readiness-not-live-activation.json'],
  ['blockedG335UpgradePublicSha256','docs/evidence/g3/g3-35-pillow-cpu-compatibility-and-upgrade-blockers.json'],
  ['exactPythonQualityShadowObservationSha256','runtime/qa/g3/g337-shadow-quality-classification.json'],
  ['productionPythonWorkerUnchangedSha256','engines/triposr/worker.py']
 ];
 for(const [k,f] of checks)assert.equal(p[k],sha(await read(f)),k);
 const normalizedChecks=[
  ['shadowQualityRunnerSourceNormalizedSha256','scripts/g3-37-shadow-pillow-quality-subset.py'],
  ['processLocalWrapperSourceNormalizedSha256','scripts/g3-37-run-shadow-quality.ps1']
 ];
 for(const [k,f] of normalizedChecks)assert.equal(p[k],normalized(await read(f)),k);
 for(const [k,f] of [
  ['g322','engines/quality/test_g322_static_security.py'],
  ['g326','engines/quality/test_g326_safe_image_boundary.py'],
  ['g330','engines/quality/test_g330_trusted_exchange.py']
 ])assert.equal(p.untouchedOriginalPinned10_1QualityModuleSha256[k],sha(await read(f)),k);
});
test('G3.37 no shadow upgrade, GPU inference, external image, VM or print claims',async()=>{
 const raw=await read('docs/evidence/g3/g3-37-shadow-pillow-historical-test-isolation.json');
 const p=JSON.parse(raw),x=p.validation;
 for(const k of ['modelOrGpuInferenceExecuted','untrustedOrExternalImageProcessed',
   'OSNativeDecoderSandboxVerified','PillowProductionUpgradeAllowed',
   'securityIssue4Resolved','manufacturingIssue3Resolved','G1OperationalIssue5Resolved','printQualified'
 ])assert.equal(x[k],false,k);
 assert.equal(x.fabricationAction,'NONE');
 assert.doesNotMatch(raw.toString('utf8'),/D:[/\\]|C:[/\\]|customerEmail|privateToken|API_KEY|sourceImageBase64/i);
});
