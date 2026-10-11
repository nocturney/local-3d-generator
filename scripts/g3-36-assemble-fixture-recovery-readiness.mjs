/**
 * G3.36 immutable public proof for one safe ephemeral fixture-only G1 check.
 * Source and event SHA assertions. NO live 4177 startup or Windows Task edits.
 * A replay validates the frozen observation; it is NOT a fresh port check.
 */
import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {readFrozenG346Server} from '../tests/fixtures/g347-frozen-g346-server.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const locations={
 parent:'docs/evidence/g3/g3-35-pillow-cpu-compatibility-and-upgrade-blockers.json',
 historicalG328:'docs/evidence/g3/g3-28-integrated-structural-image-admission.json',
 server:'server/index.js',
 imageParser:'server/image-structure-preflight.js',
 fixture:'tests/fixtures/g327-synthetic-images.json',
 originalSmoke:'scripts/g3-36-g1-fixture-recovery-smoke.mjs',
 safePorts:'tests/safe-loopback-fixture.mjs',
 observed:'docs/evidence/g3/g3-36-g1-ephemeral-fixture-only-observation.json',
 optionalPrivate:'runtime/qa/g3/g336-g1-fixture-smoke.json',
 package:'package.json',
 output:'docs/evidence/g3/g3-36-g1-ephemeral-recovery-readiness-not-live-activation.json'
};
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const lf=b=>Buffer.from(b.toString('utf8').replace(/\r\n/g,'\n'));
async function read(k){
 if(k==='server')return readFrozenG346Server();
 if(k==='package')return execFileSync('git',['-C',root,'show',
  'a4e18ebe9c8c2ba3c03d56e3d1602a8430dd6211:package.json'],
  {maxBuffer:60000,windowsHide:true});
 const p=path.join(root,locations[k]),stat=await fs.lstat(p);
 if(!stat.isFile()||stat.isSymbolicLink()||stat.size<12||stat.size>190000)
  throw Error('G336 invalid source '+k);
 return fs.readFile(p);
}
const names=['parent','historicalG328','server','imageParser','fixture','originalSmoke','safePorts','observed','package'];
const vals=await Promise.all(names.map(read)),d=Object.fromEntries(names.map((k,i)=>[k,vals[i]]));
const parent=JSON.parse(d.parent),ancestor=JSON.parse(d.historicalG328),obs=JSON.parse(d.observed),packageJson=JSON.parse(d.package);
if(parent.schema!=='local3d.g335.pillow-version-compatibility-matrix-not-upgrade-authorization.v1'||
   parent.releaseDecision.productionUpgradeReadiness!=='BLOCKED_SHADOW_ONLY'||
   parent.securityIssue4Resolved!==false||parent.printQualified!==false||
   ancestor.schema!=='local3d.g3.28.integrated-bounded-image-admission-not-native-sandbox.v1'||
   ancestor.serverRejectsIncompleteStructureWithHttp422!==true||
   ancestor.newUntrustedUserUploadPermission!==false||
   ancestor.currentOriginalSyntheticFixturesSha256!==sha(d.fixture)||
   ancestor.currentImageStructureModuleSha256!==sha(d.imageParser)||
   ancestor.currentIntegratedWindowsServerSha256!==
     sha(Buffer.from(lf(d.server).toString('utf8').replace(/\n/g,'\r\n'),'utf8'))||
   packageJson.scripts.start!=='node server/index.js'||
   packageJson.version!=='0.2.36')
 throw Error('G336 production/source ancestry, safe startup or version drift');
const fields=[
 'schema','observationDate','observedPort4177TcpStatus','ephemeralTestPortInSafeRange',
 'ephemeralTestBoundLoopbackOnly','persistentG1Port4177NeverBoundByTest',
 'unrelated4178ServiceNeverContacted','noG2AdapterConstructed',
 'G1DemoHealthVerified','G2ProviderRemainedStagedDisabled',
 'malformedInput422BeforeJobCount','completeOriginalSyntheticFixture201Count',
 'actualGpuJobs','noInferenceOrPrinterRelease','onlyTrustedOriginalTinyFixturesUsed',
 'persistentG1ServiceStarted','autostartOrSchedulerCreated','osSecurityOrOfficeChanged',
 'actualGuestImageDecoderIsolationProven','printQualified','canCloseIssue5'
];
if(Object.keys(obs).sort().join('|')!==fields.sort().join('|')||
   obs.schema!=='local3d.g336.ephemeral-fixture-only-g1-test-not-persistent-activation.v1'||
   !['NOT_LISTENING','TCP_LISTENER_PRESENT_IDENTITY_UNVERIFIED',
     'PORT_STATE_UNKNOWN_TIMEOUT','PORT_STATE_UNKNOWN_ERROR'].includes(obs.observedPort4177TcpStatus)||
   obs.observationDate!=='2026-10-11'||
   ['ephemeralTestPortInSafeRange','ephemeralTestBoundLoopbackOnly',
     'persistentG1Port4177NeverBoundByTest','unrelated4178ServiceNeverContacted',
     'noG2AdapterConstructed','G1DemoHealthVerified','G2ProviderRemainedStagedDisabled',
     'noInferenceOrPrinterRelease','onlyTrustedOriginalTinyFixturesUsed'].some(k=>obs[k]!==true)||
   ['persistentG1ServiceStarted','autostartOrSchedulerCreated','osSecurityOrOfficeChanged',
     'actualGuestImageDecoderIsolationProven','printQualified','canCloseIssue5'].some(k=>obs[k]!==false)||
   obs.malformedInput422BeforeJobCount!==9||
   obs.completeOriginalSyntheticFixture201Count!==3||obs.actualGpuJobs!==0)
 throw Error('G336 invalid/forged fixture-only observation');
const privatePath=path.join(root,locations.optionalPrivate);
const optional=await fs.lstat(privatePath).catch(e=>e.code==='ENOENT'?null:Promise.reject(e));
if(optional){
 if(!optional.isFile()||optional.isSymbolicLink()||
    JSON.stringify(JSON.parse(await fs.readFile(privatePath)))!==JSON.stringify(obs))
  throw Error('G336 frozen public observation diverges from local ignored fixture-smoke record');
}
const proof={
 schema:'local3d.g336.fixture-only-g1-post-reboot-smoke-not-service-restoration.v1',
 date:'2026-10-11',
 previousG335PublicProofSha256:sha(d.parent),
 previousG328OriginalImageAdmissionProofSha256:sha(d.historicalG328),
 localServerSourceNormalizedSha256:sha(lf(d.server)),
 nativeImageHeaderParserSourceSha256:sha(d.imageParser),
 originalSyntheticThreeImageCatalogSha256:sha(d.fixture),
 executableEphemeralSmokeSourceNormalizedSha256:sha(lf(d.originalSmoke)),
 fixtureLoopbackSafePortSourceNormalizedSha256:sha(lf(d.safePorts)),
 eventObservationPublicSha256:sha(d.observed),
 observation:obs,
 sourceOrderVerifiedAgainstHistoricalG328:true,
 reportReplayRunsNoNewLiveG1Tests:true,
 result:'EPHEMERAL_G1_FIXTURE_SMOKE_PASSED_PERSISTENT_G1_STILL_REQUIRES_OPERATOR_RESTORE',
 needsHumanControlledPersistentG1Activation:true,
 recommendedServiceTarget:'127.0.0.1:4177',
 intendedActivationEnvironment:'L3D_ENABLE_TRIPOSR=0',
 intendedActivationCommandDocumentationOnly:'npm start',
 permanentAutostartInstalled:false,
 existingG1Port4177ReopenedByMilestone:false,
 independentOfficePort4178Modified:false,
 G2ManuallyActivated:false,
 realGpuOrModelInferenceRuns:0,
 userUntrustedImagesProcessed:false,
 sandboxGuestLaunched:false,
 securityIssue4Resolved:false,
 manufacturingIssue3Resolved:false,
 operationalIssue5Resolved:false,
 printQualified:false,approvedForPrinter:false,fabricationAction:'NONE'
};
const output=Buffer.from(JSON.stringify(proof,null,2)+'\n');
const dest=path.join(root,locations.output),stat=await fs.lstat(dest).catch(e=>e.code==='ENOENT'?null:Promise.reject(e));
if(stat){
 if(!stat.isFile()||stat.isSymbolicLink()||!(await fs.readFile(dest)).equals(output))
  throw Error('G336 historical output differs');
}else{
 if(!process.argv.includes('--write-public'))
  throw Error('G336 first creation requires --write-public');
 await fs.writeFile(dest,output,{flag:'wx'});
}
console.log('G336_EPHEMERAL_G1_RECOVERY_READINESS_PASS '+JSON.stringify({
 observed4177:obs.observedPort4177TcpStatus,
 rejects422:obs.malformedInput422BeforeJobCount,
 accepts201:obs.completeOriginalSyntheticFixture201Count,
 persistentG1Started:false,GPU:0,
 reportSha256:sha(output)
}));
