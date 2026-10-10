/**
 * LOCAL3D G3.27 immutable public-only SHA proof for NON-INTEGRATED CPU
 * container-structure preflight. No model inference/OS changes/network.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {preflightImageStructure,ImageStructureError} from '../server/image-structure-preflight.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const file={
 prior:path.join(root,'docs/evidence/g3/g3-26-harmless-image-boundary.json'),
 fixtures:path.join(root,'tests/fixtures/g327-synthetic-images.json'),
 parser:path.join(root,'server/image-structure-preflight.js'),
 server:path.join(root,'server/index.js'),
 worker:path.join(root,'engines/triposr/worker.py'),
 output:path.join(root,'docs/evidence/g3/g3-27-image-structure-preflight-contract.json')
};
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
async function read(name){
 const st=await fs.lstat(file[name]);
 if(!st.isFile()||st.isSymbolicLink()||st.size<12||st.size>600000)
   throw new Error('G3.27 FAIL CLOSED: untrusted public/source file '+name);
 return fs.readFile(file[name]);
}
const [rawPrior,rawFixtures,rawParser,rawServer,rawWorker]=await Promise.all(
 ['prior','fixtures','parser','server','worker'].map(read));
const parent=JSON.parse(rawPrior),synthetic=JSON.parse(rawFixtures);
if(parent.schema!=='local3d.g3.26.cpu-synthetic-pillow-boundary-not-security-clearance.v1'
  ||parent.all32PillowAdvisoryApplicabilityUnresolved!==true
  ||parent.securityIssue4Resolved!==false
  ||parent.trackedSourceSha256.serverIndex!==hash(rawServer)
  ||parent.trackedSourceSha256.worker!==hash(rawWorker)
  ||parent.newUntrustedUploadsAllowed!==false
  ||parent.printQualified!==false)
  throw new Error('G3.27 FAIL CLOSED: parent lineage or guard changed');
if(synthetic.schema!=='local3d.g327.trusted-generated-image-fixtures.v1'||
   synthetic.pillowGeneratorVersion!=='10.1.0'||
   synthetic.originalSyntheticOnly!==true||
   synthetic.images.length!==3||
   rawServer.toString('utf8').includes('preflightImageStructure')||
   !rawServer.toString('utf8').includes('imageInfo = sniffImage(image);'))
  throw new Error('G3.27 FAIL CLOSED: test fixtures or unintegrated source changed');
const actual=[];
for(const original of synthetic.images){
 const old=parent.pillowSourceTests.results.find(r=>r.format===original.format);
 if(!old||old.sourceBytesSha256!==original.sha256||original.mime!==old.declaredMime)
   throw new Error('G3.27 FAIL CLOSED: generated fixture checksum/history mismatch');
 const raw=Buffer.from(original.base64,'base64');
 if(raw.length!==old.sourceByteCount||hash(raw)!==original.sha256)
   throw new Error('G3.27 FAIL CLOSED: synthetic fixture bytes changed');
 const validated=preflightImageStructure(raw,original.mime,{minDimension:64});
 const cases=[0,3,8,12,Math.floor(raw.length/2),raw.length-1];
 let rejects=0;
 for(const end of cases){
  try{preflightImageStructure(raw.subarray(0,end),original.mime,{minDimension:64});}
  catch(e){if(e instanceof ImageStructureError)rejects++;else throw e;}
 }
 if(rejects!==cases.length||validated.width!==64||validated.height!==64||
    validated.completeImageDecodingProven!==false||validated.printQualified!==false)
   throw new Error('G3.27 FAIL CLOSED: unexpected synthetic structural acceptance');
 actual.push({format:original.format,mime:original.mime,inputSha256:hash(raw),
   structuralValidForOriginal:true,
   syntheticallyTruncatedVariantsRejected:rejects,
   bytesOfOriginal:raw.length});
}
const report={
 schema:'local3d.g3.27.bounded-image-container-syntax-contract-not-integration.v1',
 previousG326PublicProofSha256:hash(rawPrior),
 trackedReadOnlyPreviousServerSha256:hash(rawServer),
 trackedReadOnlyPreviousPythonWorkerSha256:hash(rawWorker),
 boundedPreflightSourceSha256:hash(rawParser),
 sourceFixturesSha256:hash(rawFixtures),
 scope:'OFFLINE_STATIC_AND_TRUSTED_SYNTHETIC_ONLY',
 validatedFormats:['PNG','JPEG','WEBP'],
 maxSourceBytes:8*1024*1024,maxDimensions:[16384,16384],
 maxPixels:16000000,maxPngChunks:1024,maxJpegMarkerVisits:4096,maxWebpChunks:256,
 rawImageDecompressionOrNativeDecoderCalled:false,
 strictBoundsAndChecks:'PNG_CHUNKS_CRC_IHDR_IDAT_IEND__JPEG_SOF_SOS_EOI__WEBP_RIFF_CHUNK_FRAMES',
 fixtureResults:actual,
 legacyG1ShortSignatureOnlyStillInProduction:true,
 proposedStrictPreflightIntegratedIntoProduction:false,
 completeImageDecodeOrSecurityProven:false,
 OSNativeParserSandboxReady:false,
 liveG2DependenciesChanged:false,
 customerMediaProcessed:false,
 securityIssue4Resolved:false,
 manufacturingIssue3Resolved:false,
 additionalModelExecutions:0,GPUInferenceRuns:0,packagesInstalled:0,
 newUntrustedImageUploadsApproved:false,printQualified:false,
 approvedForPrinter:false,fabricationAction:'NONE'
};
const out=Buffer.from(JSON.stringify(report,null,2)+'\n','utf8');
if(out.length>16000)throw new Error('G3.27 FAIL CLOSED: public report size');
const existing=await fs.lstat(file.output).catch(e=>e.code==='ENOENT'?null:Promise.reject(e));
if(existing){
 if(!existing.isFile()||existing.isSymbolicLink()
  ||!(await fs.readFile(file.output)).equals(out))
  throw new Error('G3.27 FAIL CLOSED: immutable report differs');
}else{
 if(!process.argv.includes('--write-public'))
   throw new Error('G3.27 only --write-public creates first immutable proof');
 await fs.writeFile(file.output,out,{flag:'wx'});
}
console.log('G3_27_STRICT_STRUCTURE_CONTRACT_PASS '+JSON.stringify({
 formats:report.validatedFormats,
 originalPositiveFixtures:actual.length,
 truncatedVariantsRejected:actual.reduce((a,v)=>a+v.syntheticallyTruncatedVariantsRejected,0),
 integrated:false,securityCleared:false,
 outputSha256:hash(out),gpuRuns:0
}));
