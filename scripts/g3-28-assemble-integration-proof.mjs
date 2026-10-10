/**
 * G3.28 read-only SHA-linked proof: NEW codepath integrated, all G3.25-27
 * public historical source evidence remains immutable and separately replayable.
 * No untrusted native decoding, cloud, installer, GPU, printer, OS changes.
 */
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readHistoricalServerBytes,HISTORICAL_SERVER_SHA} from './g3-28-historical-server-source.mjs';
import {preflightImageStructure,ImageStructureError} from '../server/image-structure-preflight.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const files={
 g325:path.join(root,'docs/evidence/g3/g3-25-pillow-format-review.json'),
 g326:path.join(root,'docs/evidence/g3/g3-26-harmless-image-boundary.json'),
 g327:path.join(root,'docs/evidence/g3/g3-27-image-structure-preflight-contract.json'),
 fixtures:path.join(root,'tests/fixtures/g327-synthetic-images.json'),
 currentServer:path.join(root,'server/index.js'),
 structuralParser:path.join(root,'server/image-structure-preflight.js'),
 pythonWorker:path.join(root,'engines/triposr/worker.py'),
 output:path.join(root,'docs/evidence/g3/g3-28-integrated-structural-image-admission.json')
};
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
async function safe(name){
 const stat=await fs.lstat(files[name]);
 if(!stat.isFile()||stat.isSymbolicLink()||stat.size<40||stat.size>700000)
  throw new Error('G3.28 FAIL CLOSED: missing/oversize/symlink tracked input '+name);
 return fs.readFile(files[name]);
}
const names=['g325','g326','g327','fixtures','currentServer','structuralParser','pythonWorker'];
const raws=await Promise.all(names.map(safe));
const original=Object.fromEntries(names.map((k,i)=>[k,raws[i]]));
const ancestors=['g325','g326','g327'].map(k=>JSON.parse(original[k]));
if(ancestors[0].schema!=='local3d.g3.25.pillow-format-and-api-triage-not-clearance.v1'||
   ancestors[1].schema!=='local3d.g3.26.cpu-synthetic-pillow-boundary-not-security-clearance.v1'||
   ancestors[2].schema!=='local3d.g3.27.bounded-image-container-syntax-contract-not-integration.v1'||
   ancestors.some(x=>x.securityIssue4Resolved!==false||x.printQualified!==false)||
   ancestors[2].proposedStrictPreflightIntegratedIntoProduction!==false||
   ancestors[2].trackedReadOnlyPreviousServerSha256!==HISTORICAL_SERVER_SHA||
   hash(readHistoricalServerBytes())!==HISTORICAL_SERVER_SHA||
   ancestors[0].inputSourceNodeSha256!==HISTORICAL_SERVER_SHA||
   ancestors[1].trackedSourceSha256.serverIndex!==HISTORICAL_SERVER_SHA||
   ancestors[1].previousG325SanitizedProofSha256!==hash(original.g325)||
   ancestors[2].previousG326PublicProofSha256!==hash(original.g326)||
   ancestors[2].boundedPreflightSourceSha256!==hash(original.structuralParser)||
   ancestors[0].inputSourcePythonSha256!==hash(original.pythonWorker))
   throw new Error('G3.28 FAIL CLOSED: prior immutable proof chain drift');
const source=original.currentServer.toString('utf8');
const importAt=source.indexOf("import {preflightImageStructure, ImageStructureError} from './image-structure-preflight.js';");
const trigger=source.indexOf('preflightImageStructure(image, imageInfo.mime, {minDimension:isReal ? 64 : 1});');
const requestCheck=source.indexOf('imageInfo = sniffImage(image);');
const id=source.indexOf('const id = randomUUID();');
const storage=source.indexOf('await storageAdmission({jobsDir, sourceBytes:image.length});');
const permit=source.indexOf('await gpuLease.acquire({jobId:id});');
if([importAt,trigger,requestCheck,id,storage,permit].some(x=>x<0)||
 !(importAt<requestCheck&&requestCheck<trigger&&trigger<id&&id<storage&&storage<permit)||
 !source.includes("if (error instanceof ImageStructureError) fail('BAD_IMAGE_STRUCTURE', 422")||
 !source.includes('if (isReal && payload.confirmGpu !== true)')||
 !source.includes('const MAX_IMAGE_BYTES = 8 * 1024 * 1024;')||
 hash(original.currentServer)===HISTORICAL_SERVER_SHA)
 throw new Error('G3.28 FAIL CLOSED: source guard order/import/old source mismatch');
const synthetic=JSON.parse(original.fixtures);
if(synthetic.schema!=='local3d.g327.trusted-generated-image-fixtures.v1'||
   synthetic.images.length!==3||synthetic.originalSyntheticOnly!==true)
 throw new Error('G3.28 FAIL CLOSED: synthetic fixture lineage missing');
let accepted=0,rejected=0;
for(const item of synthetic.images){
 const raw=Buffer.from(item.base64,'base64');
 if(hash(raw)!==item.sha256)throw new Error('G3.28 fixture SHA drift');
 const allowed=preflightImageStructure(raw,item.mime,{minDimension:64});
 if(allowed.completeImageDecodingProven!==false)throw new Error('G3.28 false native decode claim');
 accepted++;
 const lengths=[item.format==='WEBP'?12:item.format==='PNG'?8:3,Math.floor(raw.length/2),raw.length-1];
 for(const len of lengths){
  try{preflightImageStructure(raw.subarray(0,len),item.mime,{minDimension:64});}
  catch(e){if(!(e instanceof ImageStructureError))throw e;rejected++;continue;}
  throw new Error('G3.28 accepted synthetic incomplete image');
 }
}
if(accepted!==3||rejected!==9)throw new Error('G3.28 test contract case coverage changed');
const output={
 schema:'local3d.g3.28.integrated-bounded-image-admission-not-native-sandbox.v1',
 date:'2026-10-10',
 originalG327CommittedAncestor:'6a40a6d70d123642c53167a36655b4f24d049c9c',
 previousHistoricWindowsServerSha256:HISTORICAL_SERVER_SHA,
 historicalPublicProofSha256:{
  g325:hash(original.g325),g326:hash(original.g326),g327:hash(original.g327)
 },
 currentIntegratedWindowsServerSha256:hash(original.currentServer),
 currentImageStructureModuleSha256:hash(original.structuralParser),
 currentOriginalSyntheticFixturesSha256:hash(original.fixtures),
 originalProductionPythonWorkerStillUnmodifiedSha256:hash(original.pythonWorker),
 parserIsInvokedBeforeNewJobIdStorageAndGpuLease:true,
 serverRejectsIncompleteStructureWithHttp422:true,
 g2Requires64PixelMinimum:true,
 g1UsesStructureCheckWithMinimumOnePixel:true,
 submittedByteLimit:8*1024*1024,
 maxImagePixels:16000000,
 supportedFormats:['PNG','JPEG','WEBP'],
 acceptedSafeOriginalSyntheticFixtures:accepted,
 rejectedSafeTruncatedVariants:rejected,
 fullHTTPRegressionsRunSeparately:true,
 namedOldG326BehaviorDocumentedOnlyAsHistorical:true,
 allG325ToG327OldProofJSONUnchanged:true,
 existing4177ServiceRestarted:false,
 productionPillowVersion:'10.1.0',
 nativePillowSandboxImplemented:false,
 OSFilesystemNetworkContainmentEstablished:false,
 fullPillowDecodeProvenForArbitraryAcceptedFiles:false,
 securityIssue4Resolved:false,manufacturingIssue3Resolved:false,
 newUntrustedUserUploadPermission:false,
 packageOrWeightsInstall:false,
 officeOrFirewallSecurityChange:false,
 cloudModelOrGPUInference:false,
 gpuInferenceRuns:0,modelExecutions:0,
 printQualified:false,approvedForPrinter:false,fabricationAction:'NONE'
};
const buf=Buffer.from(JSON.stringify(output,null,2)+'\n','utf8');
const prev=await fs.lstat(files.output).catch(e=>e.code==='ENOENT'?null:Promise.reject(e));
if(prev){
 if(!prev.isFile()||prev.isSymbolicLink()||!(await fs.readFile(files.output)).equals(buf))
  throw new Error('G3.28 FAIL CLOSED: immutable report differs');
}else{
 if(!process.argv.includes('--write-public'))
  throw new Error('G3.28 report missing; first create with --write-public only');
 await fs.writeFile(files.output,buf,{flag:'wx'});
}
console.log('G3_28_INTEGRATED_IMAGE_PREFLIGHT_PASS '+JSON.stringify({
 accepted,rejected,
 historicalEvidenceUnchanged:true,
 oldServerSHA:HISTORICAL_SERVER_SHA,currentServerSHA:output.currentIntegratedWindowsServerSha256,
 outputSHA:hash(buf),gpuRuns:0,printQualified:false
}));
