import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {
 assessWindowsSandboxLaunchRouteInventory,LaunchRouteContractError
} from '../server/g331-sandbox-launch-route-contract.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=k=>path.join(root,k);
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const normalized=b=>hash(Buffer.from(b.toString('utf8').replace(/\r\n/g,'\n')));
const keys=['currentUserAppx','allUsersAppx','provisionedAppx','startMenuApps','systemAppDirectories'];
const inventory=()=>({
 schema:'local3d.g331.launch-route-inventory-readonly.v1',
 probeReadOnly:true,windowsHost:true,osBuild:26300,
 sandboxOptionalFeatureEnabled:true,
 virtualMachinePlatformEnabled:true,
 hyperVHypervisorFeatureEnabled:false,
 hypervisorPresent:true,
 wsbCliCommandResolvable:false,
 legacyWindowsSandboxCommandResolvable:false,
 legacySystem32LauncherFileFound:false,
 currentUserWsbAliasFileFound:false,
 ...Object.fromEntries(keys.map(k=>[k,{status:'OK',matches:0}])),
 probeRunningInSessionZero:true
});
const denied=fn=>assert.throws(fn,e=>e instanceof LaunchRouteContractError&&e.code==='G331_FAIL_CLOSED');
test('G3.31 observed service-context inventory cannot assert Sandbox app is missing globally',()=>{
 const x=assessWindowsSandboxLaunchRouteInventory(inventory());
 assert.equal(x.osFeatureAndHypervisorObserved,true);
 assert.equal(x.anyLauncherOrAliasVisibleToProbe,false);
 assert.equal(x.anyRegisteredAppVisibleToProbe,false);
 assert.equal(x.probeSessionZero,true);
 assert.equal(x.classification,'NOT_FOUND_IN_CURRENT_READ_ONLY_PROBE_SCOPE');
 assert.equal(x.osSandboxLaunchActuallyAttempted,false);
 assert.equal(x.interactiveClientAvailabilityProven,false);
 assert.equal(x.osIsolationAttested,false);
 assert.equal(x.canUseGuestForTrustedSyntheticCPU,false);
 assert.equal(x.canAcceptUntrustedCustomerImages,false);
 assert.equal(x.canActivateG2OrGPU,false);
 assert.equal(x.securityIssue4Resolved,false);
 assert.equal(x.printQualified,false);
 assert.ok(x.blockers.includes('SESSION_ZERO_DOES_NOT_PROVE_INTERACTIVE_USER_APP_REGISTRATION'));
 assert.equal(Object.isFrozen(x),true);
});
test('G3.31 availability or app registration observed still cannot grant guest/client security',()=>{
 for(const change of [
  {wsbCliCommandResolvable:true},
  {legacyWindowsSandboxCommandResolvable:true},
  {legacySystem32LauncherFileFound:true},
  {currentUserWsbAliasFileFound:true},
  {currentUserAppx:{status:'OK',matches:1}},
  {allUsersAppx:{status:'OK',matches:2}},
  {provisionedAppx:{status:'OK',matches:1}},
  {startMenuApps:{status:'OK',matches:1}},
  {systemAppDirectories:{status:'OK',matches:1}},
  {probeRunningInSessionZero:false,wsbCliCommandResolvable:true}
 ]){
  const x=assessWindowsSandboxLaunchRouteInventory({...inventory(),...change});
  assert.equal(x.classification,'CANDIDATE_ROUTE_DISCOVERED_NOT_TESTED');
  assert.equal(x.osIsolationAttested,false);
  assert.equal(x.canUseGuestForTrustedSyntheticCPU,false);
  assert.equal(x.canAcceptUntrustedCustomerImages,false);
  assert.equal(x.canActivateG2OrGPU,false);
 }
});
test('G3.31 unknown or unavailable registration states report incomplete knowledge, not absence',()=>{
 const x=assessWindowsSandboxLaunchRouteInventory({
  ...inventory(),provisionedAppx:{status:'UNAVAILABLE',matches:0}
 });
 assert.equal(x.someRegistrationQueriesUnavailable,true);
 assert.ok(x.blockers.includes('SOME_APP_REGISTRATION_QUERIES_UNAVAILABLE'));
 assert.equal(x.osIsolationAttested,false);
 denied(()=>assessWindowsSandboxLaunchRouteInventory({
  ...inventory(),provisionedAppx:{status:'UNAVAILABLE',matches:1}
 }));
});
test('G3.31 missing feature, OS/virtualization changes never promote real security',()=>{
 const changes=[
  {sandboxOptionalFeatureEnabled:false},
  {hypervisorPresent:false},
  {windowsHost:false},
  {osBuild:0},
  {hyperVHypervisorFeatureEnabled:false,virtualMachinePlatformEnabled:false}
 ];
 for(const change of changes){
  const x=assessWindowsSandboxLaunchRouteInventory({...inventory(),...change});
  assert.equal(x.osIsolationAttested,false);
  assert.equal(x.canAcceptUntrustedCustomerImages,false);
  assert.equal(x.securityIssue4Resolved,false);
 }
});
test('G3.31 fail closed on extra attestation flags, unexpected package/status types',()=>{
 const bad=[
  {...inventory(),guestAttested:true},
  {...inventory(),userEmail:'operator@example.com'},
  {...inventory(),schema:'bad'},
  {...inventory(),probeReadOnly:false},
  {...inventory(),wsbCliCommandResolvable:'false'},
  {...inventory(),probeRunningInSessionZero:0},
  {...inventory(),osBuild:NaN},
  {...inventory(),osBuild:-1},
  {...inventory(),osBuild:Infinity},
  {...inventory(),allUsersAppx:{status:'OK',matches:'0'}},
  {...inventory(),allUsersAppx:{status:'OK',matches:-1}},
  {...inventory(),allUsersAppx:{status:'YES',matches:0}},
  {...inventory(),allUsersAppx:{status:'OK',matches:10000}},
  {...inventory(),allUsersAppx:{status:'OK',matches:0,actualPath:'D:\\private'}},
  null,{},[]
 ];
 for(const x of bad)denied(()=>assessWindowsSandboxLaunchRouteInventory(x));
});
test('G3.31 immutable report binds exact previous G3.30/G3.29 and current source',async()=>{
 const rootDir='docs/evidence/g3/';
 const report=JSON.parse(await fs.readFile(source(rootDir+'g3-31-windows-sandbox-launch-discovery-only.json')));
 assert.equal(report.schema,'local3d.g331.sandbox-launch-route-discovery-only.v1');
 const parent=await fs.readFile(source(rootDir+'g3-30-trusted-only-offline-exchange-not-sandbox.json'));
 const older=await fs.readFile(source(rootDir+'g3-29-windows-sandbox-readiness-not-attestation.json'));
 assert.equal(report.parentG330Sha256,hash(parent));
 assert.equal(report.parentG329Sha256,hash(older));
 assert.equal(report.probeSourceNormalizedSha256,normalized(await fs.readFile(source('scripts/g3-31-readonly-launcher-inventory.mjs'))));
 assert.equal(report.recordedReadOnlyObservationSha256,hash(await fs.readFile(source('docs/evidence/g3/g3-31-readonly-host-observation.json'))));
 assert.equal(report.evidenceCaptureMethod,'FROZEN_VERIFIED_DIRECT_READONLY_REMOTE_COMMAND_OBSERVATION_NOT_OS_ATTESTATION');
 assert.equal(report.decisionSourceNormalizedSha256,normalized(await fs.readFile(source('server/g331-sandbox-launch-route-contract.js'))));
 assert.equal(report.workerSourceSha256,hash(await fs.readFile(source('engines/triposr/worker.py'))));
 assert.equal(report.serverSourceSha256,hash(await fs.readFile(source('server/index.js'))));
 assert.deepEqual(report.hostReadOnlySnapshot,inventory());
 assert.equal(report.readiness.classification,'NOT_FOUND_IN_CURRENT_READ_ONLY_PROBE_SCOPE');
 assert.equal(report.VMActuallyLaunched,false);
 assert.equal(report.appsOrOSSettingsChanged,false);
 assert.equal(report.externalMediaProcessed,false);
 assert.equal(report.modelOrGpuRuns,0);
 assert.equal(report.realSandboxIsolationProven,false);
 assert.equal(report.securityIssue4Resolved,false);
 assert.equal(report.manufacturingIssue3Resolved,false);
 assert.equal(report.printQualified,false);
 assert.equal(report.fabricationAction,'NONE');
});
test('G3.31 proof and source protect caller privacy and reject any unexpected host identifiers',async()=>{
 const report=await fs.readFile(source('docs/evidence/g3/g3-31-windows-sandbox-launch-discovery-only.json'),'utf8');
 assert.doesNotMatch(report,/D:[/\\]|C:[/\\]|userEmail|AppID|InstallLocation|PackageFullName|MachineName|customerName|Credential|modelWeights/i);
 const raw=await fs.readFile(source('scripts/g3-31-readonly-launcher-inventory.mjs'),'utf8');
 assert.match(raw,/Get-AppxPackage -AllUsers/);
 assert.match(raw,/Get-AppxProvisionedPackage -Online/);
 assert.match(raw,/Get-StartApps/);
 assert.match(raw,/Get-WindowsOptionalFeature/);
 assert.match(raw,/Get-Command 'wsb/);
 // Restrict to executable source; the comment explicitly names forbidden subcommands.
 const executable=raw.replace(/\/\*[\s\S]*?\*\//g,'');
 assert.doesNotMatch(executable,/Add-AppxPackage|Remove-AppxPackage|Start-Process|Invoke-Item|Enable-WindowsOptionalFeature|Disable-WindowsOptionalFeature|wsb start|wsb share|wsb exec|wsb stop/i);
});
