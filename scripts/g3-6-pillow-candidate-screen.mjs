/**
 * G3.6 explicit online RESEARCH query for PUBLIC Pillow PyPI versions.
 * No model/CUDA calls, no packages installed, no private files transferred.
 * Not used at service startup or when users generate images.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const OLD='10.1.0', CANDIDATE='12.3.0';
const EXPECTED_WHEEL='pillow-12.3.0-cp311-cp311-win_amd64.whl';
const EXPECTED_SHA='8e95e1385e4998ae9694eeaa4730ba5457ff61185b3a55e2e7bea0880aef452a';
const QUERY_TIMEOUT=17000;

async function query(version){
  const res=await fetch('https://api.osv.dev/v1/query',{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({package:{ecosystem:'PyPI',name:'Pillow'},version}),
    signal:AbortSignal.timeout(QUERY_TIMEOUT)
  });
  if(!res.ok)throw new Error('OSV query unavailable HTTP '+res.status);
  const result=await res.json();
  if(result.vulns!==undefined&&!Array.isArray(result.vulns))throw new Error('Invalid OSV vulnerability report');
  return (result.vulns||[]).length;
}
const versions=[OLD,CANDIDATE];
const counts=[];
for(const version of versions){
  counts.push({version,osvAdvisoryMatches:await query(version)});
}
const response=await fetch('https://pypi.org/pypi/Pillow/'+CANDIDATE+'/json',{
  signal:AbortSignal.timeout(QUERY_TIMEOUT)
});
if(!response.ok)throw new Error('PyPI distribution metadata unavailable');
const pypi=await response.json();
if(pypi.info?.version!==CANDIDATE)throw new Error('Official package version mismatch');
const options=(pypi.urls||[]).filter(x=>x.filename===EXPECTED_WHEEL && x.packagetype==='bdist_wheel');
if(options.length!==1)throw new Error('Trusted cp311 amd64 wheel not found');
const wheel=options[0];
if(wheel.digests?.sha256!==EXPECTED_SHA)throw new Error('Pinned metadata/checksum mismatch');
const onDisk=path.join(ROOT,'runtime','qa','g3','pillow-shadow','wheels',EXPECTED_WHEEL);
const localBytes=await fs.readFile(onDisk);
if(createHash('sha256').update(localBytes).digest('hex')!==EXPECTED_SHA)throw new Error('Local wheel and PyPI SHA differ');
const report={
  schema:'local3d.g3-6.pillow-candidate-public-screen.v1',
  checkedAt:new Date().toISOString(),
  source:'OSV PyPI/version query and official pypi.org distribution JSON',
  candidateReadOnlyResearch:true,
  currentPinnedVersion:OLD,
  proposedShadowVersion:CANDIDATE,
  publicVersionComparisons:counts,
  interpreterCompatibility:pypi.info?.requires_python,
  shadowWheelFilename:EXPECTED_WHEEL,
  shadowWheelOfficialSha256:EXPECTED_SHA,
  localWheelMatchesOfficialPyPiSha256:true,
  dependenciesInstalledIntoProduction:0,
  modelInferenceRuns:0,
  noSecurityGuarantee:true,
  caution:'OSV matches are version advisories, not proof of reachable exploits. A zero-match candidate is not a security certification or GPU inference compatibility proof.'
};
const output=path.join(ROOT,'runtime','qa','g3','pillow-shadow','osv-candidate-comparison.json');
if(await fs.stat(output).then(()=>true,()=>false))throw new Error('Refuse overwriting prior query evidence');
await fs.writeFile(output,JSON.stringify(report,null,2)+'\n');
console.log('G36_PILLOW_PUBLIC_VERSION_SCREEN '+JSON.stringify({
  oldMatches:counts[0].osvAdvisoryMatches,
  proposedMatches:counts[1].osvAdvisoryMatches,
  wheelSha256:EXPECTED_SHA,
  productionModified:false,modelInferenceRuns:0
}));
