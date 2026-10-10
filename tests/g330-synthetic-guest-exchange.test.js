import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {
 createSyntheticIngressCandidate,createSyntheticHostOnlyReceipt,
 verifySyntheticHostOnlyExchange,SyntheticExchangeRejected,TRUSTED_G330_FORMATS
} from '../server/g330-synthetic-boundary-protocol.js';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const original=JSON.parse(await fs.readFile(path.join(ROOT,'tests/fixtures/g327-synthetic-images.json'),'utf8')).images;
const outputs=JSON.parse(await fs.readFile(path.join(ROOT,'tests/fixtures/g330-trusted-canonical-output.json'),'utf8')).samples;
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const get=id=>{
 const source=original.find(x=>x.format===id),canonical=outputs.find(x=>x.sourceFormat===id);
 return {src:Buffer.from(source.base64,'base64'),out:Buffer.from(canonical.outputBase64,'base64'),source,canonical};
};
const deny=fn=>assert.throws(fn,e=>e instanceof SyntheticExchangeRejected&&e.code==='G330_FAIL_CLOSED');
test('G3.30 exactly three 64x64 trusted original inputs and RGB PNG canonical outputs match',()=>{
 assert.deepEqual(TRUSTED_G330_FORMATS,['PNG','JPEG','WEBP']);
 for(const id of TRUSTED_G330_FORMATS){
  const {src,out,source,canonical}=get(id);
  assert.equal(sha(src),source.sha256);
  assert.equal(sha(out),canonical.outputSHA256);
  assert.equal(canonical.outputMime,'image/png');
  assert.equal(canonical.outputMode,'RGB');
  const ingress=createSyntheticIngressCandidate(id,src);
  assert.equal(ingress.sourceSha256,source.sha256);
  assert.equal(ingress.sourceMime,source.mime);
  assert.equal(ingress.transferImplemented,false);
  assert.equal(ingress.guestLaunched,false);
  assert.equal(ingress.releaseToG2Allowed,false);
  assert.ok(Object.isFrozen(ingress));
  const receipt=createSyntheticHostOnlyReceipt(ingress,out);
  assert.equal(receipt.guestSession,'NOT_STARTED');
  assert.equal(receipt.processingLane,'HOST_CPU_TRUSTED_SYNTHETIC_ONLY_NOT_SANDBOX');
  assert.equal(receipt.canonicalPngSha256,canonical.outputSHA256);
  const result=verifySyntheticHostOnlyExchange(id,src,out,receipt);
  assert.equal(result.syntheticFixtureSourceAndCanonicalPngHashesVerified,true);
  assert.equal(result.status,'MATCHED_ONLY_ORIGINAL_SYNTHETIC_NOT_OS_ISOLATION');
  assert.equal(result.releaseToRealGPUWorker,false);
  assert.equal(result.securityIssue4Resolved,false);
  assert.equal(result.printQualified,false);
  assert.equal(result.fabricationAction,'NONE');
  assert.ok(Object.isFrozen(result));
 }
});
test('G3.30 arbitrary/untrusted media, identity switching, partial inputs and MIME mismatch rejected',()=>{
 for(const id of TRUSTED_G330_FORMATS){
  const {src}=get(id);
  deny(()=>createSyntheticIngressCandidate('untrusted',src));
  deny(()=>createSyntheticIngressCandidate(id,src.subarray(0,Math.floor(src.length/2))));
  deny(()=>createSyntheticIngressCandidate(id,Buffer.concat([src,Buffer.from([0])])));
  const bad=Buffer.from(src);bad[bad.length-1]^=1;
  deny(()=>createSyntheticIngressCandidate(id,bad));
  for(const other of TRUSTED_G330_FORMATS.filter(x=>x!==id))
   deny(()=>createSyntheticIngressCandidate(other,src));
 }
 deny(()=>createSyntheticIngressCandidate('__proto__',Buffer.alloc(48)));
 deny(()=>createSyntheticIngressCandidate('constructor',Buffer.alloc(48)));
 deny(()=>createSyntheticIngressCandidate('PNG',Buffer.alloc(8*1024*1024+1)));
 deny(()=>createSyntheticIngressCandidate('PNG',null));
 deny(()=>createSyntheticIngressCandidate('PNG','base64'));
});
test('G3.30 fabricated sandbox receipt cannot assert VM run, OS egress, customer uploads, or G2 release',()=>{
 for(const id of TRUSTED_G330_FORMATS){
  const {src,out}=get(id);
  const ingress=createSyntheticIngressCandidate(id,src);
  const receipt=createSyntheticHostOnlyReceipt(ingress,out);
  const tamper=[
   {...receipt,guestSession:'LAUNCHED'},
   {...receipt,guestOsEgressVerified:true},
   {...receipt,guestHostFilesystemBoundaryVerified:true},
   {...receipt,guestDecoderSecurityCertified:true},
   {...receipt,outputIsolatedAndSafeForG2:true},
   {...receipt,processingLane:'WINDOWS_SANDBOX_FULLY_ISOLATED'},
   {...receipt,outputByteCount:receipt.outputByteCount+1},
   {...receipt,fixtureId:'NOT_THIS_ONE'},
   {...receipt,sandboxAttested:true},
   {...receipt,hostPath:'C:\\Users\\someone\\private.jpg'},
   {...receipt,securityIssue4Resolved:true},
   {schema:receipt.schema},
   null,[],{}
  ];
  for(const fake of tamper)
   deny(()=>verifySyntheticHostOnlyExchange(id,src,out,fake));
 }
});
test('G3.30 candidate ingress cannot upgrade isolation or import arbitrary path metadata',()=>{
 const {src,out}=get('PNG');
 const ingress=createSyntheticIngressCandidate('PNG',src);
 for(const fake of [
  {...ingress,guestLaunched:true},
  {...ingress,transferImplemented:true},
  {...ingress,releaseToG2Allowed:true},
  {...ingress,hostFilesystemBoundaryVerified:true},
  {...ingress,networkEgressDeniedByOSVerified:true},
  {...ingress,candidateWsbPolicySha256:'0'.repeat(64)},
  {...ingress,sourceTrustClass:'EXTERNAL_CUSTOMER'},
  {...ingress,sourceByteCount:-1},
  {...ingress,outputDirectory:'D:\\customer'},
  {...ingress,untrustedUploadAllowed:true},
  {...ingress,sourceSha256:'0'.repeat(64)},
  {...ingress,fixtureId:'__proto__'},
  {...ingress,fixtureId:'constructor'},
  {...ingress,width:16},
  {}
 ]){
  deny(()=>createSyntheticHostOnlyReceipt(fake,out));
 }
});
test('G3.30 canonical output must be exact SHA-locked synthetic content and <=64 KiB',()=>{
 for(const id of TRUSTED_G330_FORMATS){
  const {src,out}=get(id),ingress=createSyntheticIngressCandidate(id,src);
  const altered=Buffer.from(out);altered[altered.length-15]^=1;
  deny(()=>createSyntheticHostOnlyReceipt(ingress,altered));
  deny(()=>createSyntheticHostOnlyReceipt(ingress,out.subarray(0,out.length-1)));
  deny(()=>createSyntheticHostOnlyReceipt(ingress,Buffer.concat([out,Buffer.from([0])])));
  deny(()=>createSyntheticHostOnlyReceipt(ingress,Buffer.alloc(65537)));
  deny(()=>createSyntheticHostOnlyReceipt(ingress,Buffer.from('not png')));
  deny(()=>createSyntheticHostOnlyReceipt(ingress,null));
 }
});
test('G3.30 no production/server worker imported or sandbox-start service added',async()=>{
 const src=await fs.readFile(path.join(ROOT,'server/g330-synthetic-boundary-protocol.js'),'utf8');
 const server=await fs.readFile(path.join(ROOT,'server/index.js'),'utf8');
 assert.match(src,/TRUSTED_G330_FORMATS/);
 assert.doesNotMatch(src,/child_process|spawn\(|exec\(|createTripoSRAdapter|nvidia-smi|fetch\(|XMLHttpRequest|http:\/\//);
 assert.doesNotMatch(server,/g330-synthetic-boundary-protocol/);
 const cap=JSON.parse(await fs.readFile(path.join(ROOT,'docs/evidence/g3/g3-29-windows-sandbox-readiness-not-attestation.json')));
 assert.equal(cap.readinessDecision.readinessForUntrustedCustomerImages,false);
 assert.equal(cap.sandboxGuestActuallyLaunched,false);
});
