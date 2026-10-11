/**
 * G3.33 public CPU-only source-linked Pillow 10.1 vs existing 12.3 shadow
 * preprocessing compatibility comparison. No image blobs in public evidence.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const P={
 parent:'docs/evidence/g3/g3-32-canonical-wsb-xml-static-review.json',
 publicManifest:'benchmarks/g3/fixtures/manifest.json',
 syntheticManifest:'tests/fixtures/g327-synthetic-images.json',
 production:'runtime/qa/g3/g333-pillow-lanes/production.json',
 shadow:'runtime/qa/g3/g333-pillow-lanes/shadow.json',
 worker:'engines/triposr/worker.py',
 script:'scripts/g3-33-cpu-pillow-lane.py',
 output:'docs/evidence/g3/g3-33-pillow-12-3-shadow-cpu-compatibility.json'
};
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const norm=b=>Buffer.from(b.toString('utf8').replace(/\r\n/g,'\n'));
async function read(k){
 const p=path.join(root,P[k]),s=await fs.lstat(p);
 if(!s.isFile()||s.isSymbolicLink()||s.size<12||s.size>120000)
  throw Error('G333 invalid source/proof '+k);
 return fs.readFile(p);
}
const keys=['parent','publicManifest','syntheticManifest','production','shadow','worker','script'];
const raws=await Promise.all(keys.map(read)),d=Object.fromEntries(keys.map((k,i)=>[k,raws[i]]));
const parent=JSON.parse(d.parent);
if(parent.schema!=='local3d.g332.canonical-wsb-static-xml-no-os-confinement.v1'||
   parent.securityIssue4Resolved!==false||parent.printQualified!==false||
   parent.operatingSystemSandboxLaunched!==false)
 throw Error('G333 parent no-sandbox constraint changed');
const prod=JSON.parse(d.production),sh=JSON.parse(d.shadow),catalog=JSON.parse(d.publicManifest),syn=JSON.parse(d.syntheticManifest);
const lanes=[prod,sh];
if(catalog.schema!=='local3d.g3.fixture-catalog.v1'||catalog.fixtures.length!==9||
   syn.schema!=='local3d.g327.trusted-generated-image-fixtures.v1'||syn.images.length!==3)
 throw Error('G333 catalog/rights provenance changed');
for(const [i,lane] of lanes.entries()){
 const expected=i===0?'production':'shadow',version=i===0?'10.1.0':'12.3.0';
 if(lane.schema!=='local3d.g333.cpu-pillow-lane-public-fixtures-only.v1'||
    lane.lane!==expected||lane.pillowVersion!==version||
    lane.fixtureCount!==12||lane.rows.length!==12||
    lane.catalogSha256!==hash(d.publicManifest)||
    lane.syntheticCatalogSha256!==hash(d.syntheticManifest)||
    lane.shadowWheelPinnedSha256!=='8e95e1385e4998ae9694eeaa4730ba5457ff61185b3a55e2e7bea0880aef452a'||
    lane.pillowFromSeparateShadowOverlay!==(i===1)||
    lane.allInputsTrustedOrLicensed!==true||lane.cpuOnly!==true||
    lane.gpuInferenceRuns!==0||lane.modelWeightsLoaded!==false||
    lane.productionPythonEnvironmentMutated!==false||
    lane.untrustedCustomerMediaProcessed!==false||
    lane.printQualified!==false||lane.securityCertified!==false)
  throw Error('G333 untrusted shadow/live lane output');
}
const allowed=new Map();
for(const f of catalog.fixtures){
 if(!['PROJECT_ORIGINAL_PROCEDURAL','UPSTREAM_TRIPOSR_MIT_SAMPLE'].includes(f.sourceRights))throw Error('G333 bad photo rights');
 allowed.set(f.id,{sha:f.imageSha256,rights:f.sourceRights});
}
for(const s of syn.images){
 if(!['PNG','JPEG','WEBP'].includes(s.format))throw Error('G333 unknown synthetic');
 allowed.set('trusted-synthetic-'+s.format,{sha:s.sha256,rights:'PROJECT_ORIGINAL_GENERATED'});
}
if(allowed.size!==12)throw Error('G333 expected twelve unique public original source IDs');
const results=[],seen=new Set();
for(let i=0;i<12;i++){
 const a=prod.rows[i],b=sh.rows[i],ref=allowed.get(a.publicSourceId);
 if(!ref||seen.has(a.publicSourceId)||JSON.stringify(a.publicSourceId)!==JSON.stringify(b.publicSourceId)||
    a.publicSourceSha256!==ref.sha||b.publicSourceSha256!==ref.sha||
    a.sourceRights!==ref.rights||b.sourceRights!==ref.rights||
    a.resultMode!=='RGB'||b.resultMode!=='RGB'||
    !Array.isArray(a.resultSize)||!Array.isArray(b.resultSize))
  throw Error('G333 lane identity, photo rights or source SHA mismatch');
 seen.add(a.publicSourceId);
 results.push({
  sourceId:a.publicSourceId,licensedOrProjectOriginal:true,
  sameWidthAndHeight:JSON.stringify(a.resultSize)===JSON.stringify(b.resultSize),
  sameRgbOutputBytesSha256:a.resultRgbBytesSha256===b.resultRgbBytesSha256,
  sameAlphaCompositionLane:a.alphaCompositeApplied===b.alphaCompositeApplied
 });
}
if(seen.size!==12)throw Error('G333 incomplete comparison');
const count=k=>results.filter(x=>x[k]).length;
const proof={
 schema:'local3d.g333.pillow-12-3-existing-overlay-cpu-only-preprocessor-compatibility.v1',
 observedDate:'2026-10-11',
 parentG332PublicSha256:hash(d.parent),
 sourceManifestSha256:hash(d.publicManifest),
 originalSyntheticInputsSha256:hash(d.syntheticManifest),
 pinnedProductionWorkerUnchangedSha256:hash(d.worker),
 laneCodeNormalizedSha256:hash(norm(d.script)),
 productionPrivateCpuLaneRecordSha256:hash(d.production),
 shadowPrivateCpuLaneRecordSha256:hash(d.shadow),
 versions:{production:'10.1.0',shadow:'12.3.0'},
 totalPreviouslyLicensedOrOriginalInputs:12,
 projectGeneratedOrSyntheticInputs:11,
 upstreamMitLicensedSampleInputs:1,
 allTwelveInputsDecodedToRgbCpu:true,
 sameDimensionsCount:count('sameWidthAndHeight'),
 pixelShaIdenticalCount:count('sameRgbOutputBytesSha256'),
 alphaCompositionLaneSameCount:count('sameAlphaCompositionLane'),
 caseComparison:results,
 historicalFullGpuModelCompatibilityDemonstrated:false,
 compatibilityOfAllOtherPackageModulesDemonstrated:false,
 productionPillowUpgraded:false,
 productionVenvOrWeightsChanged:false,
 packagesInstalledOrDownloaded:false,
 hostOSNetworkOrSecurityChanged:false,
 sandboxGuestLaunched:false,
 untrustedImagesProcessed:false,
 modelOrGpuRuns:0,
 nativeParserSecurityOrUntrustedUploadClearance:false,
 securityIssue4Resolved:false,
 manufacturingIssue3Resolved:false,
 printQualified:false,approvedForPrinter:false,fabricationAction:'NONE'
};
if(proof.sameDimensionsCount!==12||proof.alphaCompositionLaneSameCount!==12)
 throw Error('G333 CPU version dimensions/alpha preprocessing diverged');
const out=Buffer.from(JSON.stringify(proof,null,2)+'\n');
const location=path.join(root,P.output);
const existing=await fs.lstat(location).catch(e=>e.code==='ENOENT'?null:Promise.reject(e));
if(existing){
 if(!existing.isFile()||existing.isSymbolicLink()||!(await fs.readFile(location)).equals(out))
  throw Error('G333 immutable public report differs');
}else{
 if(!process.argv.includes('--write-public'))throw Error('G333 first proof needs --write-public');
 await fs.writeFile(location,out,{flag:'wx'});
}
console.log('G333_PILLOW_SHADOW_COMPARISON_PASS '+JSON.stringify({
 trustedInputs:proof.totalPreviouslyLicensedOrOriginalInputs,
 sameDimensions:proof.sameDimensionsCount,
 identicalPixels:proof.pixelShaIdenticalCount,
 sameAlphaLane:proof.alphaCompositionLaneSameCount,
 versionLive:proof.versions.production,versionShadow:proof.versions.shadow,
 productionChanged:false,gpuRuns:0,proofSha256:hash(out)
}));
