/**
 * G3.35 derive immutable public, CPU-only Pillow upgrade readiness matrix.
 * Source hashes pinned; read-only replay; never runs GPU, installs or OS action.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {evaluateTrustedPillowMatrix} from '../server/g335-pillow-release-gate.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const paths={
 g333:'docs/evidence/g3/g3-33-pillow-12-3-shadow-cpu-compatibility.json',
 g334:'docs/evidence/g3/g3-34-pillow-edge-cases-cpu-parity.json',
 fixture:'benchmarks/g3/fixtures/manifest.json',
 generated:'tests/fixtures/g327-synthetic-images.json',
 worker:'engines/triposr/worker.py',
 basePrivate:'runtime/qa/g3/g333-pillow-lanes/production.json',
 shadowPrivate:'runtime/qa/g3/g333-pillow-lanes/shadow.json',
 edgeBase:'runtime/qa/g3/g334-pillow-safe-edge-cases/production.json',
 edgeShadow:'runtime/qa/g3/g334-pillow-safe-edge-cases/shadow.json',
 validator:'server/g335-pillow-release-gate.js',
 report:'docs/evidence/g3/g3-35-pillow-cpu-compatibility-and-upgrade-blockers.json'
};
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const lf=b=>Buffer.from(b.toString('utf8').replace(/\r\n/g,'\n'));
async function read(k){
 const name=path.join(root,paths[k]),stat=await fs.lstat(name);
 if(!stat.isFile()||stat.isSymbolicLink()||stat.size<12||stat.size>135000)
  throw Error('G3.35 invalid source '+k);
 return fs.readFile(name);
}
const keys=['g333','g334','fixture','generated','worker','basePrivate','shadowPrivate','edgeBase','edgeShadow','validator'];
const vals=await Promise.all(keys.map(read)),d=Object.fromEntries(keys.map((k,i)=>[k,vals[i]]));
const base=JSON.parse(d.g333),edge=JSON.parse(d.g334);
if(edge.previousG333PublicSha256!==sha(d.g333)||
   base.sourceManifestSha256!==sha(d.fixture)||
   base.originalSyntheticInputsSha256!==sha(d.generated)||
   base.pinnedProductionWorkerUnchangedSha256!==sha(d.worker)||
   edge.productionG2WorkerStillUnmodifiedSha256!==sha(d.worker)||
   base.productionPrivateCpuLaneRecordSha256!==sha(d.basePrivate)||
   base.shadowPrivateCpuLaneRecordSha256!==sha(d.shadowPrivate)||
   edge.pinnedProductionLanePrivateSha256!==sha(d.edgeBase)||
   edge.pinnedShadowLanePrivateSha256!==sha(d.edgeShadow))
 throw Error('G3.35 source/parent/private comparison SHA changed');
const matrix=evaluateTrustedPillowMatrix(base,edge);
if(matrix.productionUpgradeReadiness!=='BLOCKED_SHADOW_ONLY'||
   matrix.canUpgradeProductionPillowAutomatically!==false||
   matrix.releaseBlockers.length!==7||
   matrix.validDecodedRgbParityCount!==15||matrix.malformedOriginalMatchedRejectionCount!==1)
 throw Error('G3.35 upgrade refusal changed');
const proof={
 schema:'local3d.g335.pillow-version-compatibility-matrix-not-upgrade-authorization.v1',
 date:'2026-10-11',
 historicalG333Sha256:sha(d.g333),
 historicalG334Sha256:sha(d.g334),
 trustedBenchmarkCatalogSha256:sha(d.fixture),
 originalSyntheticSetSha256:sha(d.generated),
 unchangedProductionG2WorkerSha256:sha(d.worker),
 privateCpuComparisonReceiptsSHA256:{
  g333Production:sha(d.basePrivate),
  g333Shadow:sha(d.shadowPrivate),
  g334Production:sha(d.edgeBase),
  g334Shadow:sha(d.edgeShadow)
 },
 cpuMatrixEvaluatorNormalizedSha256:sha(lf(d.validator)),
 releaseDecision:matrix,
 onlyHistoricalOriginalOrLicensedTrustedImagesUsed:true,
 currentLiveSystemRecheckedByThisAssembler:false,
 G1Port4177LiveAvailabilityProven:false,
 osNativeImageDecoderSandboxCertified:false,
 cudaModelCandidateCompatibilityCertified:false,
 runtimeGpuInferenceRuns:0,
 newPackagesOrWindowsFeaturesInstalled:false,
 productionPythonChanged:false,
 customerUntrustedImagesProcessed:false,
 windowsSandboxGuestStarted:false,
 office4178Changed:false,
 securityIssue4Resolved:false,
 manufacturingIssue3Resolved:false,
 printQualified:false,
 approvedForPrinter:false,
 fabricationAction:'NONE'
};
const bytes=Buffer.from(JSON.stringify(proof,null,2)+'\n');
const target=path.join(root,paths.report);
const prev=await fs.lstat(target).catch(e=>e.code==='ENOENT'?null:Promise.reject(e));
if(prev){
 if(!prev.isFile()||prev.isSymbolicLink()||!(await fs.readFile(target)).equals(bytes))
  throw Error('G3.35 immutable report mismatch');
}else{
 if(!process.argv.includes('--write-public'))
  throw Error('G3.35 first capture needs --write-public');
 await fs.writeFile(target,bytes,{flag:'wx'});
}
console.log('G335_CPU_UPGRADE_GATE_PASS '+JSON.stringify({
 total:matrix.uniqueKnownOriginalOrMitInputs,
 exactRgb:matrix.validDecodedRgbParityCount,
 malformedRejected:matrix.malformedOriginalMatchedRejectionCount,
 upgrade:matrix.productionUpgradeReadiness,
 gpu:0,productionChanged:false,reportSHA256:sha(bytes)
}));
