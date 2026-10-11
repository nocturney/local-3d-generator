/**
 * G3.32 canonical Windows Sandbox .wsb vocabulary and DOM-checked XML
 * candidate; immutable public report. Does not launch VM or change OS.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {validateCanonicalOfflineWsb,CANONICAL_G332_WSB_PROFILE} from '../server/g332-canonical-wsb-contract.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const paths={
 parent:'docs/evidence/g3/g3-31-windows-sandbox-launch-discovery-only.json',
 old:'docs/security/g329-candidate-networkless-nohost-share.wsb',
 candidate:'docs/security/g332-canonical-networkless-nohost-share.wsb',
 validator:'server/g332-canonical-wsb-contract.js',
 dotnet:'scripts/g3-32-verify-wsb-xml-readonly.ps1',
 output:'docs/evidence/g3/g3-32-canonical-wsb-xml-static-review.json'
};
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const normalize=b=>Buffer.from(b.toString('utf8').replace(/\r\n/g,'\n'));
async function load(key){
 const p=path.join(root,paths[key]),stat=await fs.lstat(p);
 if(stat.isSymbolicLink()||!stat.isFile()||stat.size<12||stat.size>50000)
  throw Error('G332 invalid file '+key);
 return fs.readFile(p);
}
const keys=['parent','old','candidate','validator','dotnet'];
const values=await Promise.all(keys.map(load));
const dat=Object.fromEntries(keys.map((key,i)=>[key,values[i]]));
const parent=JSON.parse(dat.parent);
if(parent.schema!=='local3d.g331.sandbox-launch-route-discovery-only.v1'||
   parent.readiness.osIsolationAttested!==false||
   parent.readiness.canUseGuestForTrustedSyntheticCPU!==false||
   parent.VMActuallyLaunched!==false||
   parent.securityIssue4Resolved!==false||parent.printQualified!==false)
 throw Error('G332 prior safety lineage mismatch');
const old=normalize(dat.old).toString('utf8'),candidate=normalize(dat.candidate).toString('utf8');
if(!old.includes('<vGPU>Disable</vGPU>')||
   old.replace('<vGPU>','<VGpu>').replace('</vGPU>','</VGpu>')!==candidate||
   candidate!==CANONICAL_G332_WSB_PROFILE)
 throw Error('G332 proposed exact Windows Sandbox configuration differs beyond documented tag capitalization');
const policy=validateCanonicalOfflineWsb(candidate);
const evidence={
 schema:'local3d.g332.canonical-wsb-static-xml-no-os-confinement.v1',
 date:'2026-10-11',
 previousG331ImmutableSha256:sha(dat.parent),
 historicalG329CandidateNormalizedSha256:sha(normalize(dat.old)),
 newCanonicalCandidateNormalizedSha256:sha(normalize(dat.candidate)),
 newCandidateSourceNormalizedSha256:sha(normalize(dat.validator)),
 dotNetReadonlyXMLVerifierNormalizedSha256:sha(normalize(dat.dotnet)),
 changedElementComparedToOriginal:'vGPU -> VGpu (open and close tag only)',
 publishedMicrosoftWsbExampleElement:'VGpu',
 legacyCandidateRuntimeValidOrInvalid:'NOT_TESTED',
 staticPolicy:policy,
 canonicalCandidateDiffConfirmedExactlyTagCase:true,
 officialSampleReference:'https://learn.microsoft.com/en-us/windows/security/application-security/application-isolation/windows-sandbox/windows-sandbox-sample-configuration',
 dotNetReadOnlyXMLValidationPerformedSeparately:true,
 dotNetValidationNotOsEffectivePolicyAttestation:true,
 interactiveWindowsSandboxClientQualified:false,
 operatingSystemSandboxLaunched:false,
 effectiveNoNetworkOrHostIsolationProven:false,
 hostGpuGuestSharingEnabled:false,
 mappedHostFoldersAdded:false,
 newPackagesInstalled:false,
 windowsOrOfficePolicyChanged:false,
 realGpuModelRuns:0,
 securityIssue4Resolved:false,
 manufacturingIssue3Resolved:false,
 printQualified:false,approvedForPrinter:false,fabricationAction:'NONE'
};
const output=Buffer.from(JSON.stringify(evidence,null,2)+'\n');
const dest=path.join(root,paths.output);
const stat=await fs.lstat(dest).catch(e=>e.code==='ENOENT'?null:Promise.reject(e));
if(stat){
 if(!stat.isFile()||stat.isSymbolicLink()||!(await fs.readFile(dest)).equals(output))
  throw Error('G332 immutable report drift');
}else{
 if(!process.argv.includes('--write-public'))throw Error('G332 first capture requires --write-public');
 await fs.writeFile(dest,output,{flag:'wx'});
}
console.log('G332_CANONICAL_WSB_STATIC_PASS '+JSON.stringify({
 MicrosoftCanonicalElement:'VGpu',fullXMLParsedSeparately:true,
 oldCandidateStillHistoricallyUntouched:true,
 guestLaunched:false,securityClearance:false,sha256:sha(output)
}));
