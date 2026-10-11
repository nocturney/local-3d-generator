/**
 * G3.38 immutable public rollback-readiness proof from read-only production
 * metadata and synthetic manifest-only rollback rehearsal.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {assessReadOnlyRollbackBaseline} from '../server/g338-rollback-readiness-contract.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const f={
 parent:'docs/evidence/g3/g3-37-shadow-pillow-historical-test-isolation.json',
 gate:'docs/evidence/g3/g3-35-pillow-cpu-compatibility-and-upgrade-blockers.json',
 req:'engines/triposr/requirements-resolved-win-py311.txt',
 private:'runtime/qa/g3/g338-production-readonly-rollback-rehearsal.json',
 python:'scripts/g3-38-prod-rollback-readonly.py',
 contract:'server/g338-rollback-readiness-contract.js',
 worker:'engines/triposr/worker.py',
 output:'docs/evidence/g3/g3-38-python-upgrade-readiness-and-synthetic-rollback.json'
};
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const lf=b=>Buffer.from(b.toString('utf8').replace(/\r\n/g,'\n'));
async function read(k){
 const p=path.join(root,f[k]),stat=await fs.lstat(p);
 if(!stat.isFile()||stat.isSymbolicLink()||stat.size<12||stat.size>225000)
  throw Error('G338 invalid source '+k);
 return fs.readFile(p);
}
const keys=['parent','gate','req','private','python','contract','worker'];
const raw=await Promise.all(keys.map(read));
const d=Object.fromEntries(keys.map((k,i)=>[k,raw[i]]));
const base=JSON.parse(d.parent),prior=JSON.parse(d.gate),receipt=JSON.parse(d.private);
if(sha(d.req)!==receipt.exactFrozenRequirementsSHA256 ||
   sha(d.worker)!==prior.unchangedProductionG2WorkerSha256 ||
   base.productionPythonWorkerUnchangedSha256!==sha(d.worker) ||
   base.blockedG335UpgradePublicSha256!==sha(d.gate))
 throw Error('G338 upstream SHA mismatch');
const decision=assessReadOnlyRollbackBaseline(receipt,base,prior);
if(decision.deploymentDecision!=='BLOCKED_SCOPE_LIMITED_READONLY_PREPARATION'||
   decision.automaticRollbackOrUpgradeAllowed!==false||
   decision.releaseCheckpoints.length!==9)
 throw Error('G338 release gate unexpectedly relaxed');
const evidence={
 schema:'local3d.g338.pillow-upgrade-preflight-and-rollback-simulation-not-deployment.v1',
 date:'2026-10-11',
 frozenG337ShadowQualitySha256:sha(d.parent),
 frozenG335UpgradeBlockerSha256:sha(d.gate),
 frozenProductionRequirementsSha256:sha(d.req),
 unchangedG2ProductionWorkerSha256:sha(d.worker),
 privateReadOnlyInventoryAndSyntheticRollbackReceiptSHA256:sha(d.private),
 pythonReadOnlyProbeNormalizedSha256:sha(lf(d.python)),
 rollbackContractNormalizedSha256:sha(lf(d.contract)),
 reportIsHistoricalNoLiveHostReprobe:true,
 copiedInstalledPackagesOrModelWeights:false,
 realProductionVenvBackupCreated:false,
 originalPillow10_1WheelFoundInScopedLocalStore:false,
 baseline34PackagesMatchedByImportlibMetadata:true,
 syntheticManifestVersionSwapAndShaRestorePerformedOnlyInDisposableDirectory:true,
 userOrMachineSecretMaterialRecorded:false,
 rollbackExecutableForProduction:false,
 productionUpgradePerformed:false,
 GPUInferenceRuns:0,
 osNativeParserSandboxVerified:false,
 office4178ProcessModified:false,
 WindowsStartupTaskInstalled:false,
 issue4SecurityResolved:false,
 issue5G1RestartResolved:false,
 issue3ManufacturingResolved:false,
 printQualified:false,approvedForPrinter:false,fabricationAction:'NONE',
 decision
};
const buf=Buffer.from(JSON.stringify(evidence,null,2)+'\n');
const dest=path.join(root,f.output),stat=await fs.lstat(dest).catch(e=>e.code==='ENOENT'?null:Promise.reject(e));
if(stat){
 if(!stat.isFile()||stat.isSymbolicLink()||!(await fs.readFile(dest)).equals(buf))
  throw Error('G338 immutable public proof differs');
}else{
 if(!process.argv.includes('--write-public'))throw Error('G338 first proof write needs --write-public');
 await fs.writeFile(dest,buf,{flag:'wx'});
}
console.log('G338_READONLY_PYTHON_ROLLBACK_GATE_PASS '+JSON.stringify({
 installedPinnedDistributions:decision.pinnedProductionDistributionCount,
 syntheticManifestRestoreCases:decision.syntheticOnlyManifestRollbackScenariosPassed,
 originalRollbackWheelVerified:false,
 realVenvBackupCreated:false,realUpgrade:false,
 decision:decision.deploymentDecision,gpu:0,proofSHA256:sha(buf)
}));
