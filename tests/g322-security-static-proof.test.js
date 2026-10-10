import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=async r=>fs.readFile(path.join(ROOT,r));
const parse=async r=>JSON.parse(await read(r));

test('G3.22 104 prior version matches limited to 36 saved IDs; live freeze+snapshot SHA lineage',async()=>{
  const p=await parse('docs/evidence/g3/g3-22-pinned-python-static-triage.json');
  const os=await parse('docs/evidence/g3/g3-5-python-osv-screen.json');
  const freeze=await read('engines/triposr/requirements-resolved-win-py311.txt');
  const old=await read('docs/evidence/g3/g3-5-python-osv-screen.json');
  const shadow=await read('docs/evidence/g3/g3-6-shadow-pillow-cpu-proof.json');
  const sha=data=>crypto.createHash('sha256').update(data).digest('hex');
  assert.equal(p.schema,'local3d.g3.22.pinned-python-sampled-advisory-codepath-static.v1');
  assert.equal(p.previousFrozenPythonManifestSha256,sha(freeze));
  assert.equal(p.previousOsVPublicSnapshotSha256,sha(old));
  assert.equal(p.previousShadowPillowProofSha256,sha(shadow));
  assert.equal(p.previousFrozenPythonManifestSha256,os.frozenDependencyManifestSha256);
  assert.equal(p.packagesEnumerated,34);
  assert.equal(p.localInstalledDistributionCountVerified,34);
  assert.equal(p.historicalVersionLevelMatches,104);
  assert.equal(p.advisoryIdsActuallyRetainedInPreviousSnapshot,36);
  assert.equal(p.advisoryIdsOmittedByPreviousSnapshot,68);
  assert.equal(p.historicalPackagesWithMatches,3);
  assert.equal(p.snapshotIsHistoricalNotLive,true);
  assert.equal(p.liveAdvisoryQueryPerformed,false);
  assert.equal(p.allAdvisoriesIndividuallyTriaged,false);
  assert.ok(p.firstPartyPythonFilesASTInspected>=60);
  assert.equal(p.pinnedUpstreamSourceGitCleanVerified,true);
  assert.equal(p.priorSnapshotRows.length,34);
  const rows=Object.fromEntries(p.priorSnapshotRows.map(x=>[x.packageName,x]));
  assert.equal(rows.Pillow.snapshotVersionMatches,32);
  assert.equal(rows.transformers.snapshotVersionMatches,50);
  assert.equal(rows.torch.snapshotVersionMatches,22);
  assert.equal(rows.torch.pinnedVersion,'2.5.1+cu121');
  assert.equal(rows.torch.publicVersionQueried,'2.5.1');
  assert.equal(rows.Pillow.advisoryIdsNotRetainedInOldSnapshot,20);
  assert.equal(rows.transformers.advisoryIdsNotRetainedInOldSnapshot,38);
  assert.equal(rows.torch.advisoryIdsNotRetainedInOldSnapshot,10);
});

test('G3.22 representative OSV example API static absence cannot remove actual Pillow image exposure',async()=>{
  const p=await parse('docs/evidence/g3/g3-22-pinned-python-static-triage.json');
  assert.equal(p.pillowImageParsingDirectInputPathPresent,true);
  assert.equal(p.directSourceCallSites.pillowRealImageDecode.symbol,'Image.open');
  assert.equal(p.directSourceCallSites.pinnedVITModelConfigLoader.symbol,
    'ViTModel.config_class.from_pretrained');
  assert.equal(p.directSourceCallSites.localPinnedTorchWeightDeserializer.symbol,'torch.load');
  assert.equal(p.observedSourceGuardCode.weightsOnlyMonkeypatchCodePresent,true);
  assert.equal(p.observedSourceGuardCode.pinnedDinoDownloadOverrideCodePresent,true);
  assert.equal(p.observedSourceGuardCode.osEnforcedNetworkEgressProven,false);
  assert.equal(p.representativeAdvisoriesReviewedForTriggerOnly.length,3);
  for(const item of p.representativeAdvisoriesReviewedForTriggerOnly){
    assert.match(item.advisoryId,/^GHSA-[a-z0-9-]+$/);
    assert.match(item.officialAdvisoryUrl,/^https:\/\/github\.com\/advisories\/GHSA-/);
    assert.equal(item.literallyNamedAffectedAPICallFoundInScannedSources,false);
    assert.equal(item.sourceScanIsNotTransitiveResolutionOrExploitTest,true);
    assert.equal(item.allPackageAdvisoriesProvenNotAffected,false);
  }
  assert.equal(p.sourceInspectionIsOnlyStaticAndCannotProveFullReachability,true);
  assert.equal(p.torchTransformersTransitiveRuntimeReachabilityUnknown,true);
  assert.equal(p.pillowShadow12_3_0OnlyPreviouslyCPUPreprocessingSmokeTested,true);
  assert.equal(p.productionPillowStillPinned10_1_0,true);
  assert.equal(p.all104AdvisoriesResolvedOrExploitProof,false);
  assert.equal(p.newUntrustedImagesApproved,false);
  assert.equal(p.osEnforcedEgressOrNativeParserSandboxImplemented,false);
  assert.equal(p.securityGateResolved,false);
  assert.equal(p.printQualified,false);
  assert.equal(p.newAiInference,false);
});

test('G3.22 SHA proof contains no local/private model paths, job UUIDs, user media or hidden advisory false clearances',async()=>{
  const raw=(await read('docs/evidence/g3/g3-22-pinned-python-static-triage.json')).toString('utf8');
  assert.doesNotMatch(raw,/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  assert.doesNotMatch(raw,/D:[/\\]|runtime[/\\]qa|privateJobId|customerEmail|"modelWeightsData"|originalImagePath|sourceAssetPath/i);
  assert.doesNotMatch(raw,/"securityGateResolved": true|"all104AdvisoriesResolvedOrExploitProof": true/i);
  const p=JSON.parse(raw);
  assert.equal(p.noPackageImportsOrModelWeightsLoadedDuringStaticInspection,true);
  assert.equal(p.productionDependencyOrOStoolsChanged,false);
  assert.equal(p.newAiInference,false);
});
