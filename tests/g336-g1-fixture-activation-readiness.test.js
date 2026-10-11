import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {readFrozenG346Server} from './fixtures/g347-frozen-g346-server.mjs';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {runTrustedFixtureOnlySmoke} from '../scripts/g3-36-g1-fixture-recovery-smoke.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFile(path.join(root,p));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const normalized=b=>Buffer.from(b.toString('utf8').replace(/\r\n/g,'\n'));
test('G3.36 real ephemeral G1 CPU smoke: 9 BAD_IMAGE_STRUCTURE rejections before jobs and 3 simulation-only accepts',async()=>{
 const x=await runTrustedFixtureOnlySmoke();
 assert.equal(x.schema,'local3d.g336.ephemeral-fixture-only-g1-test-not-persistent-activation.v1');
 assert.equal(x.malformedInput422BeforeJobCount,9);
 assert.equal(x.completeOriginalSyntheticFixture201Count,3);
 for(const field of [
  'ephemeralTestPortInSafeRange','ephemeralTestBoundLoopbackOnly',
  'persistentG1Port4177NeverBoundByTest','unrelated4178ServiceNeverContacted',
  'noG2AdapterConstructed','G1DemoHealthVerified',
  'G2ProviderRemainedStagedDisabled','noInferenceOrPrinterRelease',
  'onlyTrustedOriginalTinyFixturesUsed'
 ])assert.equal(x[field],true,field);
 for(const field of [
  'persistentG1ServiceStarted','autostartOrSchedulerCreated',
  'osSecurityOrOfficeChanged','actualGuestImageDecoderIsolationProven',
  'printQualified','canCloseIssue5'
 ])assert.equal(x[field],false,field);
 assert.equal(x.actualGpuJobs,0);
 assert.ok(['NOT_LISTENING','TCP_LISTENER_PRESENT_IDENTITY_UNVERIFIED',
  'PORT_STATE_UNKNOWN_TIMEOUT','PORT_STATE_UNKNOWN_ERROR'].includes(x.observedPort4177TcpStatus));
});
test('G3.36 refuses even test app construction while manual G2 opt-in env is enabled',async()=>{
 const old=process.env.L3D_ENABLE_TRIPOSR;
 try {
  process.env.L3D_ENABLE_TRIPOSR='1';
  await assert.rejects(runTrustedFixtureOnlySmoke(),/G2 opt-in env set/);
 }finally{
  if(old===undefined)delete process.env.L3D_ENABLE_TRIPOSR;
  else process.env.L3D_ENABLE_TRIPOSR=old;
 }
});
test('G3.36 frozen observation has source and current server strictly pinned',async()=>{
 const p=JSON.parse(await read('docs/evidence/g3/g3-36-g1-ephemeral-recovery-readiness-not-live-activation.json'));
 const observation=JSON.parse(await read('docs/evidence/g3/g3-36-g1-ephemeral-fixture-only-observation.json'));
 assert.equal(p.schema,'local3d.g336.fixture-only-g1-post-reboot-smoke-not-service-restoration.v1');
 assert.equal(p.previousG335PublicProofSha256,sha(await read('docs/evidence/g3/g3-35-pillow-cpu-compatibility-and-upgrade-blockers.json')));
 assert.equal(p.previousG328OriginalImageAdmissionProofSha256,sha(await read('docs/evidence/g3/g3-28-integrated-structural-image-admission.json')));
 assert.equal(p.localServerSourceNormalizedSha256,sha(normalized(readFrozenG346Server())));
 assert.equal(p.nativeImageHeaderParserSourceSha256,sha(await read('server/image-structure-preflight.js')));
 assert.equal(p.originalSyntheticThreeImageCatalogSha256,sha(await read('tests/fixtures/g327-synthetic-images.json')));
 assert.equal(p.executableEphemeralSmokeSourceNormalizedSha256,sha(normalized(await read('scripts/g3-36-g1-fixture-recovery-smoke.mjs'))));
 assert.equal(p.fixtureLoopbackSafePortSourceNormalizedSha256,sha(normalized(await read('tests/safe-loopback-fixture.mjs'))));
 assert.equal(p.eventObservationPublicSha256,sha(await read('docs/evidence/g3/g3-36-g1-ephemeral-fixture-only-observation.json')));
 assert.deepEqual(p.observation,observation);
});
test('G3.36 no live G1, G2, printer or automatic Windows Task deployment is claimed by this CPU smoke',async()=>{
 const p=JSON.parse(await read('docs/evidence/g3/g3-36-g1-ephemeral-recovery-readiness-not-live-activation.json'));
 assert.equal(p.result,'EPHEMERAL_G1_FIXTURE_SMOKE_PASSED_PERSISTENT_G1_STILL_REQUIRES_OPERATOR_RESTORE');
 assert.equal(p.needsHumanControlledPersistentG1Activation,true);
 assert.equal(p.reportReplayRunsNoNewLiveG1Tests,true);
 assert.equal(p.existingG1Port4177ReopenedByMilestone,false);
 assert.equal(p.permanentAutostartInstalled,false);
 assert.equal(p.independentOfficePort4178Modified,false);
 assert.equal(p.G2ManuallyActivated,false);
 assert.equal(p.realGpuOrModelInferenceRuns,0);
 assert.equal(p.userUntrustedImagesProcessed,false);
 assert.equal(p.sandboxGuestLaunched,false);
 assert.equal(p.securityIssue4Resolved,false);
 assert.equal(p.manufacturingIssue3Resolved,false);
 assert.equal(p.operationalIssue5Resolved,false);
 assert.equal(p.printQualified,false);
 assert.equal(p.fabricationAction,'NONE');
});
test('G3.36 immutable public proof contains no user secrets, raw image bytes or local host paths',async()=>{
 const raw=(await read('docs/evidence/g3/g3-36-g1-ephemeral-recovery-readiness-not-live-activation.json')).toString('utf8');
 assert.doesNotMatch(raw,/C:[/\\]|D:[/\\]|customerEmail|userName|jobPrompt|imageBase64|accessToken|privateKey/i);
});
