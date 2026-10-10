/**
 * G3.6 sanitized npm audit for v0.2.6 (DO NOT rewrite G3.5 v0.2.5 proof).
 * Reads two explicitly captured and gitignored npm audit command results.
 * Pure read-only summary of previously executed public registry queries.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dir=path.join(root,'runtime','qa','g3');
const sha=b=>createHash('sha256').update(b).digest('hex');
const lock=await fs.readFile(path.join(root,'package-lock.json'));
const lockJson=JSON.parse(lock.toString('utf8'));
if(lockJson.version!=='0.2.6')throw new Error('Auditing unexpected application version');
async function scope(filename){
  const b=await fs.readFile(path.join(dir,filename));
  const raw=b.toString(b[0]===255&&b[1]===254?'utf16le':'utf8').replace(/^\uFEFF/,'');
  const parsed=JSON.parse(raw);
  const v=parsed.metadata?.vulnerabilities;
  if(parsed.error||!v||!['info','low','moderate','high','critical','total'].every(k=>Number.isSafeInteger(v[k])&&v[k]>=0)){
    throw new Error('Unverifiable npm audit metadata');
  }
  if(v.total!==v.info+v.low+v.moderate+v.high+v.critical){
    throw new Error('Npm audit severity sum mismatch');
  }
  return {scope:filename.includes('prod')?'production-only':'production-and-dev',vulnerabilities:v};
}
const results=await Promise.all([
  scope('npm-audit-prod-v026.json'),
  scope('npm-audit-all-v026.json')
]);
const report={
  schema:'local3d.g3-6.npm-audit-summary.v1',
  applicationVersion:'0.2.6',
  observedAt:new Date().toISOString(),
  packageLockSha256:sha(lock),
  results,
  modelInferenceExecuted:false,
  dependenciesInstalled:false,
  noSecurityGuarantee:true,
  source:'npm audit --json [prod and all], pinned v0.2.6 npm lockfile',
  note:'Historical v0.2.5 audit remains unchanged. New Node audit has no bearing on the separate unresolved PyTorch, Transformers or Pillow production advisories.'
};
const dest=path.join(root,'docs','evidence','g3','g3-6-npm-audit-summary.json');
await fs.writeFile(dest,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log('G36_NPM_SUMMARY '+JSON.stringify({
  version:report.applicationVersion,
  productionAdvisories:results[0].vulnerabilities.total,
  allAdvisories:results[1].vulnerabilities.total,
  lockSha256:report.packageLockSha256
}));
