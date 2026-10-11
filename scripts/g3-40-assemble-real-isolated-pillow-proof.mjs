/**
 * G3.40 historical source SHA proof of an ACTUAL isolated Pillow wheel
 * reinstall/rollback. It never executes Python or performs network access.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {checkIsolatedPillowRestore} from '../server/g340-offline-wheel-rollback-contract.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const names={
  parent:'docs/evidence/g3/g3-39-disabled-g1-boot-review-no-task-installed.json',
  priorG338:'docs/evidence/g3/g3-38-python-upgrade-readiness-and-synthetic-rollback.json',
  manifest:'tests/fixtures/g327-synthetic-images.json',
  req:'engines/triposr/requirements-resolved-win-py311.txt',
  productionWorker:'engines/triposr/worker.py',
  wheelOriginal:'runtime/qa/g3/rollback-wheelhouse/Pillow-10.1.0-cp311-cp311-win_amd64.whl',
  wheelShadow:'runtime/qa/g3/pillow-shadow/wheels/pillow-12.3.0-cp311-cp311-win_amd64.whl',
  cacheReport:'runtime/qa/g3/g340-pip-cache-pillow-10-1-inventory.json',
  realPrivate:'runtime/qa/g3/g340-pillow-isolated-offline-rollback.json',
  downloadSource:'scripts/g3-40-verified-official-pillow-wheel.py',
  cacheSource:'scripts/g3-40-readonly-pip-cache.py',
  cleanSource:'scripts/g3-40-clean-isolated-pillow-check.py',
  exerciseSource:'scripts/g3-40-offline-isolated-pillow-rollback.py',
  contract:'server/g340-offline-wheel-rollback-contract.js',
  report:'docs/evidence/g3/g3-40-verified-official-wheel-and-real-isolated-rollback.json'
};
const sha=buf=>crypto.createHash('sha256').update(buf).digest('hex');
const norm=buf=>Buffer.from(buf.toString('utf8').replace(/\r\n/g,'\n'));
async function read(k,max=260000){
 const file=path.join(root,names[k]),stat=await fs.lstat(file);
 if(!stat.isFile()||stat.isSymbolicLink()||stat.size<10||stat.size>max)
  throw Error('G340 invalid trusted source '+k);
 return fs.readFile(file);
}
const keys=['parent','priorG338','manifest','req','productionWorker','wheelOriginal','wheelShadow',
 'cacheReport','realPrivate','downloadSource','cacheSource','cleanSource','exerciseSource','contract'];
const buffers=await Promise.all(keys.map(k=>read(k,k.startsWith('wheel')?8000000:260000)));
const b=Object.fromEntries(keys.map((k,i)=>[k,buffers[i]]));
const prev=JSON.parse(b.parent),g338=JSON.parse(b.priorG338),cache=JSON.parse(b.cacheReport),real=JSON.parse(b.realPrivate);
if(sha(b.wheelOriginal)!=='0f7c276c05a9767e877a0b4c5050c8bee6a6d960d7f0c11ebda6b99746068c2a'||
   b.wheelOriginal.length!==2609067||
   sha(b.wheelShadow)!=='8e95e1385e4998ae9694eeaa4730ba5457ff61185b3a55e2e7bea0880aef452a'||
   sha(b.manifest)!==real.trustedOriginalSyntheticFixtureSha256||
   sha(b.req)!==real.productionRequirementsSha256||
   prev.latestPriorG338ImmutableSha256!==sha(b.priorG338)||
   g338.unchangedG2ProductionWorkerSha256!==sha(b.productionWorker))
 throw Error('G340 historical dependency provenance mismatch');
if(cache.schema!=='local3d.g340.pip-http-cache-pillow101-offline-wheel-scan.v1'||
   cache.scannedCachedHttpBodyFiles!==2513||
   cache.matchedPillow101WindowsCp311Wheels!==0||
   cache.verifiedOfficialPyPiWheelInCacheCount!==0||
   cache.productionPackagesModified!==false||
   cache.pipInstallOrNetworkDownloadPerformed!==false)
 throw Error('G340 read-only pip cache historical coverage mismatch');
const decision=checkIsolatedPillowRestore(real,prev);
const report={
 schema:'local3d.g340.verified-original-pillow-wheel-and-trusted-isolated-restore.v1',
 date:'2026-10-11',
 source:'PyPI official Pillow 10.1.0 release JSON, exact Windows cp311 64-bit wheel',
 packageFile:'Pillow-10.1.0-cp311-cp311-win_amd64.whl',
 upstreamPyPiPublishedSha256:sha(b.wheelOriginal),
 upstreamWheelBytes:b.wheelOriginal.length,
 existingShadowPillow123WheelSha256:sha(b.wheelShadow),
 parentG339ImmutableSha256:sha(b.parent),
 earlierG338ReadOnlyUpgradeGateSha256:sha(b.priorG338),
 unchangedActualProductionWorkerSha256:sha(b.productionWorker),
 originalTrustedThreeImageManifestSha256:sha(b.manifest),
 pinnedProductionRequirementsSha256:sha(b.req),
 priorReadOnlyPipCacheInventoryReceiptSha256:sha(b.cacheReport),
 privateRealIsolatedWheelRollbackReceiptSha256:sha(b.realPrivate),
 sourceNormalizedSha256:Object.fromEntries(
  ['downloadSource','cacheSource','cleanSource','exerciseSource','contract'].map(k=>[k,sha(norm(b[k]))])),
 localWheelPrivateIgnoredNotCommitted:true,
 downloadedOnlyPublishedOfficialPinnedWheel:true,
 localPipCacheDidNotContainOriginalWheel:true,
 verifiedActualOfflineInstallThreeStages:true,
 fullOriginal34PackageEnvironmentNotRestored:true,
 productionPackageChanges:false,
 cloudModelOrGpuJobs:0,
 customerUntrustedMediaParsed:false,
 OSNativeParserIsolationAttested:false,
 office4178Touched:false,
 G1Permanent4177Restored:false,
 newOSStartupTaskInstalled:false,
 productionPillowUpgradeApproved:false,
 securityIssue4Resolved:false,
 manufacturingIssue3Resolved:false,
 operationalIssue5Resolved:false,
 printQualified:false,approvedForPrinter:false,fabricationAction:'NONE',
 decision
};
const bytes=Buffer.from(JSON.stringify(report,null,2)+'\n');
const dst=path.join(root,names.report),older=await fs.lstat(dst).catch(e=>e.code==='ENOENT'?null:Promise.reject(e));
if(older){
 if(!older.isFile()||older.isSymbolicLink()||!(await fs.readFile(dst)).equals(bytes))
  throw Error('G340 immutable report drift');
}else{
 if(!process.argv.includes('--write-public'))throw Error('G340 initial creation requires --write-public');
 await fs.writeFile(dst,bytes,{flag:'wx'});
}
console.log('G340_OFFICIAL_PILLOW_OFFLINE_ISOLATED_ROLLBACK_PUBLIC_PASS '+JSON.stringify({
 officialWheelSha256:report.upstreamPyPiPublishedSha256,
 stages:3,trustedFormats:3,
 productionChanged:false,fullVenvRestored:false,
 reportSHA256:sha(bytes)
}));
