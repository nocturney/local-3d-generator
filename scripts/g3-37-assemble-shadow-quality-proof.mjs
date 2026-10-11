/**
 * G3.37 immutable proof: Pillow12.3 shadow QA subset intentionally excludes
 * 20 tests whose PURPOSE is to attest historical Pillow10.1 fixed sources.
 * No historical tests are changed or misleadingly treated as passing in 12.3.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source={
 parent:'docs/evidence/g3/g3-36-g1-ephemeral-recovery-readiness-not-live-activation.json',
 blockedUpgrade:'docs/evidence/g3/g3-35-pillow-cpu-compatibility-and-upgrade-blockers.json',
 sample:'runtime/qa/g3/g337-shadow-quality-classification.json',
 runner:'scripts/g3-37-shadow-pillow-quality-subset.py',
 psWrapper:'scripts/g3-37-run-shadow-quality.ps1',
 pinnedClass:'engines/quality/test_g322_static_security.py',
 pinnedSafe:'engines/quality/test_g326_safe_image_boundary.py',
 pinnedCanonical:'engines/quality/test_g330_trusted_exchange.py',
 worker:'engines/triposr/worker.py',
 report:'docs/evidence/g3/g3-37-shadow-pillow-historical-test-isolation.json'
};
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const lf=b=>Buffer.from(b.toString('utf8').replace(/\r\n/g,'\n'));
async function read(k){
 const p=path.join(root,source[k]),stat=await fs.lstat(p);
 if(!stat.isFile()||stat.isSymbolicLink()||stat.size<12||stat.size>175000)
  throw Error('G337 invalid source '+k);
 return fs.readFile(p);
}
const names=['parent','blockedUpgrade','sample','runner','psWrapper','pinnedClass','pinnedSafe','pinnedCanonical','worker'];
const vals=await Promise.all(names.map(read)),d=Object.fromEntries(names.map((k,i)=>[k,vals[i]]));
const parent=JSON.parse(d.parent),blocked=JSON.parse(d.blockedUpgrade),result=JSON.parse(d.sample);
if(parent.schema!=='local3d.g336.fixture-only-g1-post-reboot-smoke-not-service-restoration.v1'||
   parent.securityIssue4Resolved!==false||
   blocked.schema!=='local3d.g335.pillow-version-compatibility-matrix-not-upgrade-authorization.v1'||
   blocked.releaseDecision.productionUpgradeReadiness!=='BLOCKED_SHADOW_ONLY'||
   blocked.unchangedProductionG2WorkerSha256!==sha(d.worker)||
   parent.previousG335PublicProofSha256!==sha(d.blockedUpgrade))
 throw Error('G337 previous public proof/worker/upgrade boundary mismatch');
const specific=[
 'test_g326_safe_image_boundary.G326SafeImageTests.test_three_trusted_formats_have_consistent_header_and_decoder',
 'test_g326_safe_image_boundary.G326SafeImageTests.test_generation_is_deterministic_inside_frozen_pillow_runtime',
 'test_g326_safe_image_boundary.G326SafeImageTests.test_sha_locked_public_proof_matches_offline_recalculation',
 'test_g330_trusted_exchange.G330TrustedCanonicalPython.test_pinned_host_image_generator_deterministic_exact_immutable_public_fixture'
];
const namesExcluded=result.historicalVersionLockedTestIds||[];
if(result.schema!=='local3d.g337.existing-shadow-pillow-quality-subset-no-gpu.v1'||
   result.actualShadowPillowVersion!=='12.3.0'||
   result.shadowWheelSha256!=='8e95e1385e4998ae9694eeaa4730ba5457ff61185b3a55e2e7bea0880aef452a'||
   result.discoveredQualityTestCases!==262||
   result.excludedVersionLockedHistoricalCases!==20||
   result.excludedVersionLockedHistoricalClassCases!==16||
   result.excludedIndividualVersionLockedCases!==4||
   result.executedShadowPillowTests!==242||
   result.shadowPillowTestsPassed!==242||
   !Array.isArray(namesExcluded)||namesExcluded.length!==20||
   new Set(namesExcluded).size!==20||
   !specific.every(x=>namesExcluded.includes(x))||
   namesExcluded.filter(x=>x.startsWith('test_g322_static_security.G322StaticSecurityTests.')).length!==16||
   result.originalUnfilteredShadowSuiteDidNotPass!==true||
   result.originalUnfilteredShadowRunTestsReported!==246||
   result.originalUnfilteredShadowRunErrors!==5||
   result.originalUnfilteredErrorsCausedByHistoricalPinnedRuntimeChecks!==true||
   result.historicalProductionSuiteRetainsSeparateFullRegression!==true||
   result.productionPythonModified!==false||result.newPackagesInstalled!==false||
   result.modelWeightsOrCUDAAccessed!==false||result.gpuInferenceRuns!==0||
   result.networkDependencyFetchAllowed!==false||
   result.WindowsSandboxVMStarted!==false||result.untrustedMediaProcessed!==false||
   result.productionUpgradeApproved!==false||
   result.nativeDecoderOSIsolationProven!==false||
   result.securityIssue4Resolved!==false||result.printQualified!==false)
 throw Error('G337 shadow test failure, unexamined exclusion or production claim');
const pinnedMethodCount=String(d.pinnedClass).match(/^\s+def test_/gm)?.length;
if(pinnedMethodCount!==16||
   !specific.slice(0,3).every(x=>String(d.pinnedSafe).includes('def '+x.split('.').at(-1)+'('))||
   !String(d.pinnedCanonical).includes('def '+specific[3].split('.').at(-1)+'('))
 throw Error('G337 old historical source method names changed');
const out={
 schema:'local3d.g337.pillow12-3-shadow-qa-with-explicit-historical-version-exclusions.v1',
 reviewedDate:'2026-10-11',
 parentG336PublicSha256:sha(d.parent),
 blockedG335UpgradePublicSha256:sha(d.blockedUpgrade),
 exactPythonQualityShadowObservationSha256:sha(d.sample),
 shadowQualityRunnerSourceNormalizedSha256:sha(lf(d.runner)),
 processLocalWrapperSourceNormalizedSha256:sha(lf(d.psWrapper)),
 untouchedOriginalPinned10_1QualityModuleSha256:{
  g322:sha(d.pinnedClass),g326:sha(d.pinnedSafe),g330:sha(d.pinnedCanonical)
 },
 productionPythonWorkerUnchangedSha256:sha(d.worker),
 validation:{
  pillow12_3AlreadyInstalledShadowOnly:true,
  noNewPythonModulesOrPackagesInstalled:true,
  originalFullUnfilteredShadowSuiteFailedWithFiveVersionLockErrors:true,
  fullUnfilteredTestsReported:246,
  fullUnfilteredErrors:5,
  totalQualitySuiteCasesDiscovered:262,
  explicitHistorical10_1CaseExclusions:20,
  selectedShadow12_3CasesPassed:242,
  selectedShadowCasesFailed:0,
  untouchedOld10_1SecurityAuditClassCases:16,
  untouchedOld10_1SafeImageHistoricalProofCases:3,
  untouchedOld10_1CanonicalFixtureGeneratorCase:1,
  shadowSuccessMustNeverBeReportedAsFull262Passed:true,
  production10_1SuiteVerifiedSeparatelyByG336:true,
  modelOrGpuInferenceExecuted:false,
  untrustedOrExternalImageProcessed:false,
  OSNativeDecoderSandboxVerified:false,
  PillowProductionUpgradeAllowed:false,
  securityIssue4Resolved:false,
  manufacturingIssue3Resolved:false,
  G1OperationalIssue5Resolved:false,
  printQualified:false,
  fabricationAction:'NONE'
 },
 excludedHistoricalMethodIds:namesExcluded
};
const bytes=Buffer.from(JSON.stringify(out,null,2)+'\n');
const dst=path.join(root,source.report),existing=await fs.lstat(dst).catch(e=>e.code==='ENOENT'?null:Promise.reject(e));
if(existing){
 if(!existing.isFile()||existing.isSymbolicLink()||!(await fs.readFile(dst)).equals(bytes))
  throw Error('G337 immutable output differs');
}else{
 if(!process.argv.includes('--write-public'))throw Error('G337 first snapshot requires --write-public');
 await fs.writeFile(dst,bytes,{flag:'wx'});
}
console.log('G337_SHADOW_QUALITY_CLASSIFIED_PASS '+JSON.stringify({
 shadowPassed:242,expectedHistoricalExcluded:20,
 unfilteredShadowErrors:5,fullShadowSuiteClaimedPassed:false,
 upgradeApproved:false,gpu:0,proofSha256:sha(bytes)
}));
