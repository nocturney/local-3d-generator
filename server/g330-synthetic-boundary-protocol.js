/**
 * LOCAL3D G3.30 pure CPU-only simulated sandbox ingress/egress envelope.
 * EXACTLY THREE original synthetic sources and exact trusted canonical PNGs.
 *
 * Does NOT launch or attest a VM, expose a guest transport, install packages,
 * protect Pillow's native decoder or approve external/customer images.
 */
import {createHash} from 'node:crypto';
import {preflightImageStructure,ImageStructureError} from './image-structure-preflight.js';

const sha=b=>createHash('sha256').update(b).digest('hex');
const POLICY_SHA='a948c65412d8d0caa98de0142c06a60d57f52ab9c7abab454effb87da50c3a42';
const SOURCE=Object.freeze({
 PNG:Object.freeze({
  mime:'image/png',
  originalSha256:'d56708bc91a3e8a17b97c0abdf4cccbf886f7c608ebd7a427382e52c36f3d5eb',
  canonicalSha256:'d56708bc91a3e8a17b97c0abdf4cccbf886f7c608ebd7a427382e52c36f3d5eb'
 }),
 JPEG:Object.freeze({
  mime:'image/jpeg',
  originalSha256:'4530bce5b2d096b8fb97183ddfddf291d347efb98738da087446f774f8b449dd',
  canonicalSha256:'e7a6dfafae44633165f6ce4f2abf1de78b17e4ddebfd0a9b889a6ecb664e62e2'
 }),
 WEBP:Object.freeze({
  mime:'image/webp',
  originalSha256:'7c80680b4cae2db5072515663f3fc760c9d0078e2861cd2b3e50f848c477bd64',
  canonicalSha256:'56632f4a06838f8b3deee8ed9f2606c615c303103ba9d3cff409e108865047a6'
 })
});
export const TRUSTED_G330_FORMATS=Object.freeze(['PNG','JPEG','WEBP']);
export class SyntheticExchangeRejected extends Error {
 constructor(message='Untrusted, malformed or unqualified G3.30 exchange') {
  super(message);
  this.name='SyntheticExchangeRejected';
  this.code='G330_FAIL_CLOSED';
 }
}
const deny=()=>{throw new SyntheticExchangeRejected();};
const exactKeys=(o,expected)=>{
 if(!o||typeof o!=='object'||Array.isArray(o)||Object.keys(o).sort().join('|')!==expected.slice().sort().join('|'))deny();
};
function validSynthetic(id,sourceBytes){
 if(!Object.prototype.hasOwnProperty.call(SOURCE,id)||!Buffer.isBuffer(sourceBytes)||
    sourceBytes.length<20||sourceBytes.length>2048)deny();
 const ref=SOURCE[id];
 if(sha(sourceBytes)!==ref.originalSha256)deny();
 try{
  const x=preflightImageStructure(sourceBytes,ref.mime,{minDimension:64});
  if(x.width!==64||x.height!==64)deny();
 }catch(e){
  if(e instanceof ImageStructureError||e instanceof SyntheticExchangeRejected)deny();
  throw e;
 }
 return ref;
}
export function createSyntheticIngressCandidate(id,sourceBytes){
 const ref=validSynthetic(id,sourceBytes);
 return Object.freeze({
  schema:'local3d.g330.synthetic-cpu-proposed-ingress.v1',
  fixtureId:id,
  sourceMime:ref.mime,
  sourceSha256:ref.originalSha256,
  sourceByteCount:sourceBytes.length,
  width:64,height:64,
  candidateWsbPolicySha256:POLICY_SHA,
  sourceTrustClass:'LOCKED_GENERATED_SYNTHETIC_ONLY',
  transferImplemented:false,
  guestLaunched:false,
  hostFilesystemBoundaryVerified:false,
  networkEgressDeniedByOSVerified:false,
  releaseToG2Allowed:false
 });
}
export function createSyntheticHostOnlyReceipt(ingress,canonicalPngBytes){
 exactKeys(ingress,[
  'schema','fixtureId','sourceMime','sourceSha256','sourceByteCount',
  'width','height','candidateWsbPolicySha256','sourceTrustClass',
  'transferImplemented','guestLaunched','hostFilesystemBoundaryVerified',
  'networkEgressDeniedByOSVerified','releaseToG2Allowed'
 ]);
 const id=ingress.fixtureId,ref=SOURCE[id];
 if(!ref||ingress.schema!=='local3d.g330.synthetic-cpu-proposed-ingress.v1'||
    ingress.sourceSha256!==ref.originalSha256||
    ingress.sourceMime!==ref.mime||ingress.width!==64||ingress.height!==64||
    ingress.candidateWsbPolicySha256!==POLICY_SHA||
    ingress.sourceTrustClass!=='LOCKED_GENERATED_SYNTHETIC_ONLY'||
    ingress.transferImplemented!==false||ingress.guestLaunched!==false||
    ingress.releaseToG2Allowed!==false||
    ingress.hostFilesystemBoundaryVerified!==false||
    ingress.networkEgressDeniedByOSVerified!==false||
    !Number.isInteger(ingress.sourceByteCount)||ingress.sourceByteCount<20||ingress.sourceByteCount>2048)deny();
 if(!Buffer.isBuffer(canonicalPngBytes)||canonicalPngBytes.length<20||
    canonicalPngBytes.length>65536||
    sha(canonicalPngBytes)!==ref.canonicalSha256)deny();
 try{
  const checked=preflightImageStructure(canonicalPngBytes,'image/png',{minDimension:64});
  if(checked.width!==64||checked.height!==64)deny();
 }catch(e){
  if(e instanceof ImageStructureError||e instanceof SyntheticExchangeRejected)deny();
  throw e;
 }
 return Object.freeze({
  schema:'local3d.g330.synthetic-host-only-pretend-receipt.v1',
  fixtureId:id,
  sourceSha256:ref.originalSha256,
  canonicalPngSha256:ref.canonicalSha256,
  canonicalMime:'image/png',
  canonicalPixelMode:'RGB',
  outputWidth:64,
  outputHeight:64,
  outputByteCount:canonicalPngBytes.length,
  processingLane:'HOST_CPU_TRUSTED_SYNTHETIC_ONLY_NOT_SANDBOX',
  guestSession:'NOT_STARTED',
  guestOsEgressVerified:false,
  guestHostFilesystemBoundaryVerified:false,
  guestDecoderSecurityCertified:false,
  outputIsolatedAndSafeForG2:false
 });
}
export function verifySyntheticHostOnlyExchange(id,sourceBytes,canonicalPngBytes,receipt){
 const ingress=createSyntheticIngressCandidate(id,sourceBytes);
 const expect=createSyntheticHostOnlyReceipt(ingress,canonicalPngBytes);
 exactKeys(receipt,Object.keys(expect));
 for(const [key,value] of Object.entries(expect))if(receipt[key]!==value)deny();
 return Object.freeze({
  schema:'local3d.g330.synthetic-host-output-match-not-security-authorization.v1',
  syntheticFixtureSourceAndCanonicalPngHashesVerified:true,
  fixtureId:id,
  candidateIngressObjectVerified:true,
  candidateReceiptFieldsVerified:true,
  fullDecodeOfArbitraryExternalImagesProven:false,
  actualGuestExecuted:false,
  hostBoundaryEnforcementObserved:false,
  guestNetworkEgressBlockedVerified:false,
  trustedGuestReturnChannelEstablished:false,
  productionWorkerPillowParserIsolated:false,
  securityIssue4Resolved:false,
  acceptUnknownOrUntrustedInputs:false,
  releaseToRealGPUWorker:false,
  printQualified:false,approvedForPrinter:false,fabricationAction:'NONE',
  status:'MATCHED_ONLY_ORIGINAL_SYNTHETIC_NOT_OS_ISOLATION'
 });
}
