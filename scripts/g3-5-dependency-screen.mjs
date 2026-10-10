/**
 * G3.5 explicit one-shot dependency advisory screening (not part of npm test).
 * Sends ONLY PUBLIC PyPI dependency names and versions to OSV.dev.
 * Never uploads source, model files, prompts, image data or local paths.
 * Does not install/upgrade any dependency and never runs GPU work.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const file=path.join(root,'engines','triposr','requirements-resolved-win-py311.txt');
const out=path.join(root,'runtime','qa','g3','g3-5-python-osv-screen.json');
const content=await fs.readFile(file);
const sha=createHash('sha256').update(content).digest('hex');
const pattern=/^([A-Za-z0-9_.-]+)==([A-Za-z0-9.!+_-]+)$/;
const pkgs=content.toString('utf8').replace(/^\uFEFF/,'').split(/\r?\n/)
  .map(x=>x.trim()).filter(Boolean).map(line=>{
    const m=pattern.exec(line);
    if(!m)throw new Error('Nonpinned or unexpected entry in isolated Python freeze');
    return {name:m[1],pinnedVersion:m[2],osvVersion:m[2].split('+')[0]};
  });
const unique=new Set(pkgs.map(p=>p.name.toLowerCase().replaceAll('_','-')));
if(unique.size!==pkgs.length || pkgs.length<20 || pkgs.length>100){
  throw new Error('Untrusted or incomplete dependency manifest');
}
const queries=pkgs.map(p=>({package:{name:p.name,ecosystem:'PyPI'},version:p.osvVersion}));
const response=await fetch('https://api.osv.dev/v1/querybatch',{
  method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},
  body:JSON.stringify({queries}),signal:AbortSignal.timeout(28000)
});
if(!response.ok)throw new Error('OSV query failed, HTTP '+response.status);
const text=await response.text();
if(text.length>5_000_000)throw new Error('Oversized OSV response');
const parsed=JSON.parse(text);
if(!Array.isArray(parsed.results)||parsed.results.length!==pkgs.length)throw new Error('OSV batch result count differs from submitted public packages');
const details=pkgs.map((pkg,index)=>{
  const advisories=parsed.results[index]?.vulns;
  if(advisories!==undefined&&!Array.isArray(advisories))throw new Error('Invalid OSV batch result');
  const ids=(advisories||[]).map(x=>x.id).filter(id=>typeof id==='string'&&id.length<120);
  return {
    name:pkg.name,
    pinnedVersion:pkg.pinnedVersion,
    matchedPublicVersion:pkg.osvVersion,
    advisoryCount:ids.length,
    sampleAdvisoryIds:ids.slice(0,12),
    moreAdvisoriesBeyondSample:Math.max(0,ids.length-12)
  };
});
const report={
  schema:'local3d.g3-5.python-dependency-screen.v1',
  screenedAt:new Date().toISOString(),
  dataSource:'https://api.osv.dev/v1/querybatch',
  frozenDependencyManifestSha256:sha,
  publicPyPiVersionPairsOnly:true,
  sensitiveUserDataTransferred:false,
  queryCount:pkgs.length,
  packagesWithMatchedAdvisories:details.filter(x=>x.advisoryCount>0).length,
  totalMatchedAdvisoryIds:details.reduce((n,x)=>n+x.advisoryCount,0),
  packages:details,
  modelInferenceRuns:0,
  dependencyChanges:0,
  installationChanges:0,
  evaluation:'UNTRIAGED_PUBLIC_ADVISORY_MATCHES_NOT_EXPLOIT_CONFIRMATION',
  followUp:'Review affected code paths, fixed versions and model compatibility in a new isolated venv before any production or untrusted-user rollout'
};
await fs.mkdir(path.dirname(out),{recursive:true});
await fs.writeFile(out,JSON.stringify(report,null,2)+'\n');
console.log('G35_PYPI_OSV_SCREEN '+JSON.stringify({
  packages:report.queryCount,matchedPackages:report.packagesWithMatchedAdvisories,
  advisoryIds:report.totalMatchedAdvisoryIds,
  leading:details.filter(x=>x.advisoryCount>0).sort((a,b)=>b.advisoryCount-a.advisoryCount)
    .slice(0,8).map(x=>({name:x.name,version:x.pinnedVersion,advisories:x.advisoryCount})),
  mode:'READ_ONLY_NO_INSTALL_NO_GPU'
}));
