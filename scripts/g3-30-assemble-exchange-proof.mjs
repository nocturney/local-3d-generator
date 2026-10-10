/**
 * LOCAL3D G3.30 public-only immutable SOURCE-LINKED HOST SIMULATED receipt
 * evidence. No VM launched, no customer data, GPU/cloud/printer, OS changes.
 */
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
 TRUSTED_G330_FORMATS,createSyntheticIngressCandidate,
 createSyntheticHostOnlyReceipt,verifySyntheticHostOnlyExchange
} from '../server/g330-synthetic-boundary-protocol.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const files={
 prior:path.join(root,'docs/evidence/g3/g3-29-windows-sandbox-readiness-not-attestation.json'),
 originals:path.join(root,'tests/fixtures/g327-synthetic-images.json'),
 converted:path.join(root,'tests/fixtures/g330-trusted-canonical-output.json'),
 protocol:path.join(root,'server/g330-synthetic-boundary-protocol.js'),
 generator:path.join(root,'scripts/g3-30-build-trusted-canonical-fixtures.py'),
 wsb:path.join(root,'docs/security/g329-candidate-networkless-nohost-share.wsb'),
 parentServer:path.join(root,'server/index.js'),
 worker:path.join(root,'engines/triposr/worker.py'),
 output:path.join(root,'docs/evidence/g3/g3-30-trusted-only-offline-exchange-not-sandbox.json')
};
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const norm=b=>Buffer.from(b.toString('utf8').replace(/\r\n/g,'\n'),'utf8');
async function read(k){
 const st=await fs.lstat(files[k]);
 if(st.isSymbolicLink()||!st.isFile()||st.size<12||st.size>120000)
  throw new Error('G3.30 missing or unsuitable public/source input '+k);
 return fs.readFile(files[k]);
}
const keys=['prior','originals','converted','protocol','generator','wsb','parentServer','worker'];
const vals=await Promise.all(keys.map(read)),data=Object.fromEntries(keys.map((k,i)=>[k,vals[i]]));
const prior=JSON.parse(data.prior);
if(prior.schema!=='local3d.g3.29.windows-sandbox-capability-only-not-isolation-attestation.v1'||
   prior.readinessDecision.result!=='BLOCKED_NO_RUNTIME_OS_ATTESTATION'||
   prior.readinessDecision.readinessForUntrustedCustomerImages!==false||
   prior.sandboxGuestActuallyLaunched!==false||
   prior.securityIssue4Resolved!==false||
   prior.manufacturingIssue3Resolved!==false||
   prior.trackedProductionG2WorkerUnmodifiedSHA256!==hash(data.worker)||
   prior.candidateWsbProfileNormalizedSHA256!==hash(norm(data.wsb))||
   prior.readinessDecision.canEnableG2ImageInferenceAutomatically!==false)
 throw new Error('G3.30 FAIL CLOSED: parent readiness/sandbox/worker/provenance mismatch');
const originals=JSON.parse(data.originals),converted=JSON.parse(data.converted);
if(originals.schema!=='local3d.g327.trusted-generated-image-fixtures.v1'||
   originals.originalSyntheticOnly!==true||
   converted.schema!=='local3d.g330.trusted-host-cpu-canonical-fixtures-not-guest-output.v1'||
   converted.sourceFixtureSetSHA256!==hash(data.originals)||
   converted.pillowVersion!=='10.1.0'||
   converted.sandboxVMExecuted!==false||converted.untrustedUploadProcessed!==false||
   originals.images.length!==3||converted.samples.length!==3)
 throw new Error('G3.30 FAIL CLOSED: trusted fixture provenance changed');
if(!data.protocol.toString('utf8').includes(prior.candidateWsbProfileNormalizedSHA256)||
   data.parentServer.toString('utf8').includes('g330-synthetic-boundary-protocol')||
   !data.generator.toString('utf8').includes('if pillow_version!="10.1.0"'))
 throw new Error('G3.30 FAIL CLOSED: proposed data protocol or runtime boundaries drift');
const rows=[];
for(const format of TRUSTED_G330_FORMATS){
 const original=originals.images.find(x=>x.format===format),
   expected=converted.samples.find(x=>x.sourceFormat===format);
 if(!original||!expected)throw new Error('G3.30 missing trusted format '+format);
 const source=Buffer.from(original.base64,'base64'),
   output=Buffer.from(expected.outputBase64,'base64');
 if(hash(source)!==original.sha256||
    hash(output)!==expected.outputSHA256||
    expected.sourceSHA256!==original.sha256||
    expected.outputMode!=='RGB'||expected.outputWidth!==64||
    expected.outputHeight!==64||expected.outputMime!=='image/png')
  throw new Error('G3.30 trusted identity or output format drift '+format);
 const ingress=createSyntheticIngressCandidate(format,source);
 const receipt=createSyntheticHostOnlyReceipt(ingress,output);
 const decision=verifySyntheticHostOnlyExchange(format,source,output,receipt);
 if(decision.releaseToRealGPUWorker!==false||
    decision.hostBoundaryEnforcementObserved!==false||
    decision.actualGuestExecuted!==false||
    decision.securityIssue4Resolved!==false)
   throw new Error('G3.30 security release fraud detected');
 rows.push({
   originalFormat:format,
   trustedSourceSha256:original.sha256,
   candidateOutputPngSha256:expected.outputSHA256,
   outputBytes:output.length,
   wasGeneratedByHostPinnedPillowNotSandbox:true,
   imageDecodedInOSIsolatedGuest:false,
   guestReceiptAcceptedForProduction:false
 });
}
const report={
 schema:'local3d.g3.30.original-synthetic-host-exchange-not-sandbox-clearance.v1',
 reviewedDate:'2026-10-10',
 previousG329ImmutablePublicProofSHA256:hash(data.prior),
 originalG327FixtureSHA256:hash(data.originals),
 g330TrustedCanonicalFixtureSHA256:hash(data.converted),
 candidateProtocolSourceNormalizedSHA256:hash(norm(data.protocol)),
 pinnedPillowGeneratorSourceNormalizedSHA256:hash(norm(data.generator)),
 candidateWsbProfileNormalizedSHA256:hash(norm(data.wsb)),
 currentProductionServerUnmodifiedSinceG329NormalizedSHA256:hash(norm(data.parentServer)),
 productionG2PythonWorkerSha256:hash(data.worker),
 acceptedStrictlyOriginalTrustedSyntheticFixtureCases:rows.length,
 trustedHostCpuSimulationResults:rows,
 simulationOnly:true,
 sandboxGuestLaunched:false,
 hostToGuestMediaTransportImplemented:false,
 guestToHostOutputChannelImplemented:false,
 OSIsolationAndNoNetworkProven:false,
 anyUserUntrustedInputAccepted:false,
 hostPillowNativeParserSecurityCertified:false,
 externalGuestReceiptCryptographicallyAttested:false,
 sandboxForProductionG2Worker:false,
 securityIssue4Resolved:false,
 manufacturingIssue3Resolved:false,
 realInferenceRuns:0,
 gpuInferenceRuns:0,
 newPackagesInstalled:0,
 changedOSOfficeCloudOrPrinter:false,
 existingG1Port4177Restarted:false,
 printQualified:false,approvedForPrinter:false,fabricationAction:'NONE'
};
const out=Buffer.from(JSON.stringify(report,null,2)+'\n','utf8');
const existing=await fs.lstat(files.output).catch(e=>e.code==='ENOENT'?null:Promise.reject(e));
if(existing){
 if(!existing.isFile()||existing.isSymbolicLink()||!(await fs.readFile(files.output)).equals(out))
  throw new Error('G3.30 FAIL CLOSED: immutable public report changed');
}else{
 if(!process.argv.includes('--write-public'))
  throw new Error('G3.30 first public proof needs explicit --write-public');
 await fs.writeFile(files.output,out,{flag:'wx'});
}
console.log('G3_30_TRUSTED_HOST_EXCHANGE_PROTOCOL_PASS '+JSON.stringify({
 cases:rows.length,
 formats:TRUSTED_G330_FORMATS,
 hostOnly:true,
 sandboxLaunched:false,
 externalUploadAllowed:false,
 productionReleaseAllowed:false,
 sha256:hash(out)
}));
