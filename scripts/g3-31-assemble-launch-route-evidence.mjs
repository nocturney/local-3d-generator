import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {assessWindowsSandboxLaunchRouteInventory} from '../server/g331-sandbox-launch-route-contract.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const rel={
 prev:'docs/evidence/g3/g3-30-trusted-only-offline-exchange-not-sandbox.json',
 older:'docs/evidence/g3/g3-29-windows-sandbox-readiness-not-attestation.json',
 probe:'scripts/g3-31-readonly-launcher-inventory.mjs',
 observation:'docs/evidence/g3/g3-31-readonly-host-observation.json',
 gate:'server/g331-sandbox-launch-route-contract.js',
 worker:'engines/triposr/worker.py',
 server:'server/index.js',
 report:'docs/evidence/g3/g3-31-windows-sandbox-launch-discovery-only.json'
};
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const normalized=b=>Buffer.from(b.toString('utf8').replace(/\r\n/g,'\n'));
async function file(k){
 const p=path.join(root,rel[k]),s=await fs.lstat(p);
 if(s.isSymbolicLink()||!s.isFile()||s.size<12||s.size>150000)
  throw new Error('G331 invalid source '+k);
 return fs.readFile(p);
}
const keys=['prev','older','probe','gate','worker','server','observation'];
const vals=await Promise.all(keys.map(file));
const d=Object.fromEntries(keys.map((k,i)=>[k,vals[i]]));
const parent=JSON.parse(d.prev),old=JSON.parse(d.older);
if(parent.schema!=='local3d.g3.30.original-synthetic-host-exchange-not-sandbox-clearance.v1'||
   parent.previousG329ImmutablePublicProofSHA256!==sha(d.older)||
   parent.productionG2PythonWorkerSha256!==sha(d.worker)||
   parent.currentProductionServerUnmodifiedSinceG329NormalizedSHA256!==sha(normalized(d.server))||
   parent.sandboxGuestLaunched!==false||parent.securityIssue4Resolved!==false||
   old.readinessDecision.result!=='BLOCKED_NO_RUNTIME_OS_ATTESTATION')
 throw new Error('G331 source lineage changed');
const pathname=path.join(root,rel.report);
const existing=await fs.lstat(pathname).catch(e=>e.code==='ENOENT'?null:Promise.reject(e));
if(!existing&&!process.argv.includes('--write-public'))throw new Error('G331 first capture needs --write-public');
const prior=existing?JSON.parse(await file('report')):null;
// Frozen verbatim sanitized output from the earlier successful direct read-only probe.
// Nested PowerShell re-probing timed out in this remote service; never fake a new reading.
const host=JSON.parse(d.observation);
const result=assessWindowsSandboxLaunchRouteInventory(host);
const proof={
 schema:'local3d.g331.sandbox-launch-route-discovery-only.v1',
 observedDate:'2026-10-11',
 parentG330Sha256:sha(d.prev),
 parentG329Sha256:sha(d.older),
 probeSourceNormalizedSha256:sha(normalized(d.probe)),
 recordedReadOnlyObservationSha256:sha(d.observation),
 evidenceCaptureMethod:'FROZEN_VERIFIED_DIRECT_READONLY_REMOTE_COMMAND_OBSERVATION_NOT_OS_ATTESTATION',
 decisionSourceNormalizedSha256:sha(normalized(d.gate)),
 workerSourceSha256:sha(d.worker),
 serverSourceSha256:sha(d.server),
 hostReadOnlySnapshot:host,
 readiness:result,
 officialCliDocumentation:'https://learn.microsoft.com/en-us/windows/security/application-security/application-isolation/windows-sandbox/windows-sandbox-cli',
 officialVersionDocumentation:'https://learn.microsoft.com/en-us/windows/security/application-security/application-isolation/windows-sandbox/windows-sandbox-versions',
 VMActuallyLaunched:false,
 appsOrOSSettingsChanged:false,
 externalMediaProcessed:false,
 modelOrGpuRuns:0,
 realSandboxIsolationProven:false,
 securityIssue4Resolved:false,
 manufacturingIssue3Resolved:false,
 printQualified:false,
 fabricationAction:'NONE'
};
if(result.osIsolationAttested||result.canAcceptUntrustedCustomerImages)throw new Error('G331 invalid clearance');
const buf=Buffer.from(JSON.stringify(proof,null,2)+'\n');
if(existing){
 if(!(await fs.readFile(pathname)).equals(buf))throw new Error('G331 immutable report drift');
}else{
 await fs.writeFile(pathname,buf,{flag:'wx'});
}
console.log('G331_LAUNCH_DISCOVERY_PASS '+JSON.stringify({
 classification:result.classification,
 launcherVisible:result.anyLauncherOrAliasVisibleToProbe,
 appRegistered:result.anyRegisteredAppVisibleToProbe,
 serviceContext:result.probeSessionZero,
 vmLaunched:false,
 sha256:sha(buf)
}));
