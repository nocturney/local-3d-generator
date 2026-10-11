import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {readFrozenG346Server} from './fixtures/g347-frozen-g346-server.mjs';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const files={
 report:path.join(root,'docs/evidence/g3/g3-30-trusted-only-offline-exchange-not-sandbox.json'),
 parent:path.join(root,'docs/evidence/g3/g3-29-windows-sandbox-readiness-not-attestation.json'),
 original:path.join(root,'tests/fixtures/g327-synthetic-images.json'),
 output:path.join(root,'tests/fixtures/g330-trusted-canonical-output.json'),
 protocol:path.join(root,'server/g330-synthetic-boundary-protocol.js'),
 generator:path.join(root,'scripts/g3-30-build-trusted-canonical-fixtures.py'),
 wsb:path.join(root,'docs/security/g329-candidate-networkless-nohost-share.wsb'),
 server:path.join(root,'server/index.js'),
 worker:path.join(root,'engines/triposr/worker.py')
};
const hash=buf=>crypto.createHash('sha256').update(buf).digest('hex');
const normalized=buf=>hash(Buffer.from(buf.toString('utf8').replace(/\r\n/g,'\n')));
test('G3.30 immutable public proof SHA-links to prior G3.29 and exact candidate sources',async()=>{
 const proof=JSON.parse(await fs.readFile(files.report));
 assert.equal(proof.schema,'local3d.g3.30.original-synthetic-host-exchange-not-sandbox-clearance.v1');
 assert.equal(proof.previousG329ImmutablePublicProofSHA256,hash(await fs.readFile(files.parent)));
 assert.equal(proof.originalG327FixtureSHA256,hash(await fs.readFile(files.original)));
 assert.equal(proof.g330TrustedCanonicalFixtureSHA256,hash(await fs.readFile(files.output)));
 assert.equal(proof.candidateProtocolSourceNormalizedSHA256,normalized(await fs.readFile(files.protocol)));
 assert.equal(proof.pinnedPillowGeneratorSourceNormalizedSHA256,normalized(await fs.readFile(files.generator)));
 assert.equal(proof.candidateWsbProfileNormalizedSHA256,normalized(await fs.readFile(files.wsb)));
 assert.equal(proof.currentProductionServerUnmodifiedSinceG329NormalizedSHA256,
  normalized(readFrozenG346Server()));
 assert.equal(proof.productionG2PythonWorkerSha256,hash(await fs.readFile(files.worker)));
 assert.deepEqual(proof.trustedHostCpuSimulationResults.map(x=>x.originalFormat),
  ['PNG','JPEG','WEBP']);
 const parent=JSON.parse(await fs.readFile(files.parent));
 assert.equal(parent.readinessDecision.result,'BLOCKED_NO_RUNTIME_OS_ATTESTATION');
});
test('G3.30 all three output hashes and strict source identities remain original generated-only',async()=>{
 const proof=JSON.parse(await fs.readFile(files.report));
 const originals=JSON.parse(await fs.readFile(files.original)).images;
 const outs=JSON.parse(await fs.readFile(files.output)).samples;
 for(let i=0;i<3;i++){
  const row=proof.trustedHostCpuSimulationResults[i],a=originals[i],b=outs[i];
  assert.equal(row.originalFormat,a.format);
  assert.equal(row.trustedSourceSha256,hash(Buffer.from(a.base64,'base64')));
  assert.equal(row.trustedSourceSha256,b.sourceSHA256);
  assert.equal(row.candidateOutputPngSha256,b.outputSHA256);
  assert.equal(row.candidateOutputPngSha256,hash(Buffer.from(b.outputBase64,'base64')));
  assert.equal(row.outputBytes,Buffer.from(b.outputBase64,'base64').length);
  assert.equal(row.imageDecodedInOSIsolatedGuest,false);
  assert.equal(row.guestReceiptAcceptedForProduction,false);
 }
});
test('G3.30 report cannot imply VM confinement, live G2 decoding, user upload or manufacturing release',async()=>{
 const text=await fs.readFile(files.report,'utf8'),p=JSON.parse(text);
 assert.equal(p.acceptedStrictlyOriginalTrustedSyntheticFixtureCases,3);
 assert.equal(p.sandboxGuestLaunched,false);
 assert.equal(p.hostToGuestMediaTransportImplemented,false);
 assert.equal(p.guestToHostOutputChannelImplemented,false);
 assert.equal(p.OSIsolationAndNoNetworkProven,false);
 assert.equal(p.anyUserUntrustedInputAccepted,false);
 assert.equal(p.hostPillowNativeParserSecurityCertified,false);
 assert.equal(p.externalGuestReceiptCryptographicallyAttested,false);
 assert.equal(p.sandboxForProductionG2Worker,false);
 assert.equal(p.securityIssue4Resolved,false);
 assert.equal(p.manufacturingIssue3Resolved,false);
 assert.equal(p.realInferenceRuns,0);
 assert.equal(p.gpuInferenceRuns,0);
 assert.equal(p.newPackagesInstalled,0);
 assert.equal(p.changedOSOfficeCloudOrPrinter,false);
 assert.equal(p.existingG1Port4177Restarted,false);
 assert.equal(p.printQualified,false);
 assert.equal(p.approvedForPrinter,false);
 assert.equal(p.fabricationAction,'NONE');
 assert.doesNotMatch(text,/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
 assert.doesNotMatch(text,/D:[/\\]|C:[/\\]|customerEmail|jobId|privatePath|apiToken|secretKey/i);
});
