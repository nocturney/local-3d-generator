/**
 * G3.34 read-only source-linked CPU edge-case proof for two pinned Pillow lanes.
 * Exact four previously generated safe G3.6 samples, no model, GPU or Sandbox.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const f={
 parent:'docs/evidence/g3/g3-33-pillow-12-3-shadow-cpu-compatibility.json',
 oldSource:'scripts/g3-6-pillow-shadow-check.py',
 newSource:'scripts/g3-34-safe-edge-lane.py',
 worker:'engines/triposr/worker.py',
 production:'runtime/qa/g3/g334-pillow-safe-edge-cases/production.json',
 shadow:'runtime/qa/g3/g334-pillow-safe-edge-cases/shadow.json',
 report:'docs/evidence/g3/g3-34-pillow-edge-cases-cpu-parity.json'
};
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const norm=x=>Buffer.from(x.toString('utf8').replace(/\r\n/g,'\n'));
async function read(k){
 const p=path.join(root,f[k]),s=await fs.lstat(p);
 if(!s.isFile()||s.isSymbolicLink()||s.size<12||s.size>120000)throw Error('G334 invalid source '+k);
 return fs.readFile(p);
}
const keys=['parent','oldSource','newSource','worker','production','shadow'];
const raws=await Promise.all(keys.map(read)),d=Object.fromEntries(keys.map((k,i)=>[k,raws[i]]));
const parent=JSON.parse(d.parent),a=JSON.parse(d.production),b=JSON.parse(d.shadow);
if(parent.schema!=='local3d.g333.pillow-12-3-existing-overlay-cpu-only-preprocessor-compatibility.v1'||
   parent.securityIssue4Resolved!==false||parent.productionPillowUpgraded!==false||
   parent.pinnedProductionWorkerUnchangedSha256!==sha(d.worker)||
   parent.modelOrGpuRuns!==0)
 throw Error('G334 immutable G333 parent/security lineage drift');
for(const [lane,v,version] of [['production',a,'10.1.0'],['shadow',b,'12.3.0']]){
 if(v.schema!=='local3d.g334.trusted-existing-pillow-edge-cases-cpu.v1'||
    v.lane!==lane||v.pillowVersion!==version||
    v.originalHistoricalSourceScriptSha256!==sha(d.oldSource)||
    v.trustedCasesCount!==4||v.cases.length!==4||
    v.hostCpuOnly!==true||v.productionEnvChanged!==false||
    v.untrustedFilesProcessed!==false||v.sandboxGuestLaunched!==false||
    v.modelsLoaded!==false||v.inferenceRuns!==0||v.printQualified!==false)
  throw Error('G334 unsafe/shadow lane report');
}
const approved=[
 ['alpha','ACCEPTED_TRUSTED_KNOWN_GOOD'],
 ['exif-rotation','ACCEPTED_TRUSTED_KNOWN_GOOD'],
 ['webp-alpha','ACCEPTED_TRUSTED_KNOWN_GOOD'],
 ['corrupted','REJECTED_CORRUPT_BY_PILLOW']
];
const summary=[];
for(let i=0;i<4;i++){
 const x=a.cases[i],y=b.cases[i],[id,status]=approved[i];
 if(x.caseId!==id||y.caseId!==id||x.status!==status||y.status!==status||
    x.trustedInputSha256!==y.trustedInputSha256)
  throw Error('G334 source/format/status divergence');
 if(status==='ACCEPTED_TRUSTED_KNOWN_GOOD' &&
   (x.mode!=='RGB'||y.mode!=='RGB'||JSON.stringify(x.size)!==JSON.stringify(y.size)||
    x.rgbPixelSha256!==y.rgbPixelSha256||x.alphaComposite!==y.alphaComposite))
  throw Error('G334 trusted RGB pixels or transformations differ');
 if(status==='REJECTED_CORRUPT_BY_PILLOW' &&
   (x.errorClass!==y.errorClass||x.messageExposed!==false||y.messageExposed!==false))
  throw Error('G334 corrupted-image rejection mismatch');
 summary.push({
  case:id,sourceSha256:x.trustedInputSha256,
  matchedAcceptanceOrRejection:true,
  sameRgbPixelsOrSameRejectedErrorClass:true,
  noUnexpectedMetadataOrUnsafeInput:true
 });
}
const out={
 schema:'local3d.g334.original-safe-image-edge-parity-not-security-clearance.v1',
 date:'2026-10-11',
 previousG333PublicSha256:sha(d.parent),
 originalG36SafeFixtureGeneratorSha256:sha(d.oldSource),
 currentCpuLaneCodeNormalizedSha256:sha(norm(d.newSource)),
 productionG2WorkerStillUnmodifiedSha256:sha(d.worker),
 pinnedProductionLanePrivateSha256:sha(d.production),
 pinnedShadowLanePrivateSha256:sha(d.shadow),
 comparedVersions:['10.1.0','12.3.0'],
 trustedOriginalSafeSourceCount:4,
 validAlphaOrExifSourcesCompared:3,
 corruptImageRejectionClassAgreementCount:1,
 identicalPixelShaValidSources:3,
 comparisons:summary,
 noImagePayloadsPublished:true,
 onlyExistingTrustedGeneratedSafeCases:true,
 actualModelInferenceOrGpuRuns:0,
 dependenciesInstalledOrUpgraded:false,
 hostSettingsOrOfficeChanged:false,
 WindowsSandboxGuestLaunched:false,
 externalUntrustedImagesProcessed:false,
 nativeParserSandboxCertified:false,
 fullModelCudaCompatibilityCertified:false,
 securityIssue4Resolved:false,
 manufacturingIssue3Resolved:false,
 printQualified:false,approvedForPrinter:false,fabricationAction:'NONE'
};
const buf=Buffer.from(JSON.stringify(out,null,2)+'\n','utf8');
const dest=path.join(root,f.report),exists=await fs.lstat(dest).catch(e=>e.code==='ENOENT'?null:Promise.reject(e));
if(exists){
 if(exists.isSymbolicLink()||!exists.isFile()||!(await fs.readFile(dest)).equals(buf))
  throw Error('G334 immutable public evidence differs');
}else{
 if(!process.argv.includes('--write-public'))throw Error('G334 first creation requires --write-public');
 await fs.writeFile(dest,buf,{flag:'wx'});
}
console.log('G334_SAFE_CPU_PARITY_PROOF_PASS '+JSON.stringify({
 sampleCount:summary.length,
 exactValidRGBMatches:3,identicalBadRejection:1,
 gpuRuns:0,osIsolationCertified:false,sha256:sha(buf)
}));
