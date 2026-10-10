/**
 * G3.5 sanitize already executed read-only npm audit JSON (no network calls).
 * Input audit responses live under private gitignored runtime/qa/g3.
 * Produces provenance-linked public totals only; no package source or secrets.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const data=path.join(root,'runtime','qa','g3');
const output=path.join(root,'docs','evidence','g3','g3-5-npm-audit-summary.json');
const lockfile=await fs.readFile(path.join(root,'package-lock.json'));
const lockSha256=createHash('sha256').update(lockfile).digest('hex');

async function load(name){
  const bytes=await fs.readFile(path.join(data,name+'.json'));
  const encoding=bytes[0]===255&&bytes[1]===254?'utf16le':'utf8';
  const raw=bytes.toString(encoding).replace(/^\uFEFF/,'');
  const parsed=JSON.parse(raw);
  const v=parsed.metadata?.vulnerabilities;
  const required=['info','low','moderate','high','critical','total'];
  if(parsed.error||!v||required.some(k=>!Number.isSafeInteger(v[k])||v[k]<0))
    throw new Error('Cannot verify npm audit JSON for '+name);
  if(v.total!==v.info+v.low+v.moderate+v.high+v.critical)
    throw new Error('Inconsistent npm advisory counts');
  return {name,vulnerabilities:v};
}
const prod=await load('npm-audit-prod');
const all=await load('npm-audit-all');
const evidence={
  schema:'local3d.g3-5.npm-audit-summary.v1',
  summarizedAt:new Date().toISOString(),
  source:'npm audit --json [with and without --omit=dev]',
  npmPackageLockSha256:lockSha256,
  results:[prod,all],
  dependencyChanges:0,
  modelInferenceRuns:0,
  note:'Timestamped package/advisory matching only; public npm registry data can change. Raw verbose audits remain gitignored.'
};
await fs.writeFile(output,JSON.stringify(evidence,null,2)+'\n',{flag:'wx'});
console.log('G35_NPM_AUDIT_SUMMARY '+JSON.stringify({
  totalProduction:prod.vulnerabilities.total,
  totalAll:all.vulnerabilities.total,
  lockSha256
}));
