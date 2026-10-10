/**
 * G3.23 EXPLICIT, single-shot PUBLIC OSV inventory, fixed three package/version
 * strings read from SHA-validated G3.22 report. No private model/media/paths
 * leave this machine. No network except POST https://api.osv.dev/v1/query.
 * Never imported by worker, server, npm test or production startup.
 *
 * Saves only ID/alias/fixed-event metadata, bounded and immutable, in
 * gitignored runtime. No package installer, model inference, GPU or printer.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const G322=path.join(ROOT,'docs','evidence','g3','g3-22-pinned-python-static-triage.json');
const OUT=path.join(ROOT,'runtime','qa','g3','osv-full-g323','full-public-osv-query.json');
const ENDPOINT='https://api.osv.dev/v1/query';
const MAX_RESPONSE=9_000_000;
const MAX_ADVISORIES=250;
const MAX_ALIASES=60;
const ID=/^[A-Za-z][A-Za-z0-9_-]{2,119}$/;
const EVENT=/^[A-Za-z0-9._+~-]{1,80}$/;
const wanted=[
  ['Pillow','10.1.0'],
  ['transformers','4.35.0'],
  ['torch','2.5.1']
];
const canonical=s=>String(s).toLowerCase().replace(/[-_.]+/g,'-');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
function requireValue(ok,reason){if(!ok)throw new Error('G3.23 FAIL CLOSED: '+reason);}
function safeIdent(s){requireValue(typeof s==='string'&&ID.test(s),'invalid public advisory identifier');return s;}

const g322Bytes=await fs.readFile(G322);
requireValue(g322Bytes.length>500&&g322Bytes.length<1_000_000,'invalid prior G3.22 public proof size');
const prior=JSON.parse(g322Bytes);
requireValue(prior.schema==='local3d.g3.22.pinned-python-sampled-advisory-codepath-static.v1'
  && prior.historicalVersionLevelMatches===104
  && prior.advisoryIdsActuallyRetainedInPreviousSnapshot===36
  && prior.advisoryIdsOmittedByPreviousSnapshot===68
  && prior.securityGateResolved===false,'untrusted/missing previous OSV source assessment');
const old=Object.fromEntries(prior.priorSnapshotRows.map(row=>[canonical(row.packageName),row]));
for(const [name,version] of wanted){
  const p=old[canonical(name)];
  requireValue(p?.publicVersionQueried===version&&p.snapshotVersionMatches>0,
    'public name/version request diverges from frozen source');
}
if(await fs.stat(OUT).then(()=>true,()=>false))
  throw new Error('G3.23 immutable public inventory exists: refuse overwrite');

const results=[];
for(const [name,version] of wanted){
  const query=JSON.stringify({package:{ecosystem:'PyPI',name},version});
  // NO credentials, client media, machine path, model data, or tokens.
  const response=await fetch(ENDPOINT,{
    method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},
    body:query,signal:AbortSignal.timeout(29000)
  });
  requireValue(response.ok,'public OSV response '+response.status+' for '+name);
  const contentLength=Number(response.headers.get('content-length')||0);
  requireValue(Number.isSafeInteger(contentLength)&&contentLength<=MAX_RESPONSE,
    'oversized OSV response body');
  const text=await response.text();
  requireValue(text.length<=MAX_RESPONSE,'oversized OSV response text');
  const parsed=JSON.parse(text);
  requireValue(parsed&&typeof parsed==='object'&&
    (parsed.vulns===undefined||Array.isArray(parsed.vulns)),
    'unexpected OSV response format');
  const raw=parsed.vulns||[];
  requireValue(raw.length>0&&raw.length<=MAX_ADVISORIES,'empty/large public OSV list');
  const entries=[];
  const seen=new Set();
  let anyAliases=0;
  for(const vuln of raw){
    requireValue(vuln&&typeof vuln==='object','invalid returned vulnerability object');
    const id=safeIdent(vuln.id);
    requireValue(!seen.has(id),'duplicate vulnerability record '+id);
    seen.add(id);
    const aliases=Array.isArray(vuln.aliases)?vuln.aliases:[];
    requireValue(aliases.length<=MAX_ALIASES,'oversized alias list');
    const cleaned=[...new Set(aliases.map(safeIdent))].filter(x=>x!==id).sort();
    anyAliases+=cleaned.length;
    const fixed=[];
    for(const affected of Array.isArray(vuln.affected)?vuln.affected:[]){
      if(canonical(affected?.package?.name)!==canonical(name)||
        affected?.package?.ecosystem!=='PyPI')continue;
      for(const range of Array.isArray(affected.ranges)?affected.ranges:[]){
        for(const ev of Array.isArray(range.events)?range.events:[]){
          if(typeof ev?.fixed==='string' && EVENT.test(ev.fixed))fixed.push(ev.fixed);
        }
      }
    }
    entries.push({
      id,
      aliases:cleaned,
      fixedVersionEventsInThisPublicRecord:[...new Set(fixed)].sort(),
      // Data below is public upstream metadata, not verified patch compliance.
      fixedEventAbsenceDoesNotMeanFixedOrUnaffected:true,
      conditionOrCodePathReachability:'NOT_TRIAGED_INDIVIDUALLY'
    });
  }
  entries.sort((a,b)=>a.id.localeCompare(b.id));
  results.push({
    packageName:name,publicVersionQueried:version,
    oldSnapshotVersionMatches:old[canonical(name)].snapshotVersionMatches,
    currentQueryRecordCount:entries.length,
    recordsContainingAliases:entries.filter(x=>x.aliases.length>0).length,
    aliasIdentifierOccurrences:anyAliases,
    records:entries,
    allAdvisoryTriggersReviewed:false,
    confirmedAppExploitableAdvisories:null,
    libraryNotAffectedOrFixedCertified:false
  });
  console.log('G3_23_PUBLIC_OSV_PACKAGE '+JSON.stringify({
    name,version,returnedRecords:entries.length,aliasOccurrences:anyAliases,
    priorHistoricalCount:old[canonical(name)].snapshotVersionMatches
  }));
}

const report={
  schema:'local3d.g3.23.public-only-full-osv-sampled-version-inventory.v1',
  fetchedAt:new Date().toISOString(),
  endpoint:ENDPOINT,
  requestPolicy:'ONLY_THREE_PUBLIC_PYPI_PACKAGE_VERSION_PAIRS_NO_PRIVATE_FILES',
  priorG322PublicProofSha256:sha(g322Bytes),
  oldG35SampledIdsOnly:36,
  oldG35IdsNotRetained:68,
  oldG35VersionMatches:104,
  queryCount:results.length,
  packages:results,
  liveTotalReturnedRecords:results.reduce((n,r)=>n+r.currentQueryRecordCount,0),
  versionMatchCountCanChangeOverTime:true,
  aliasLinkingCannotEstablishExploitability:true,
  allVulnerabilitiesIndividuallyAnalyzed:false,
  allAdvisoriesFixed:false,
  newUntrustedUploadsAuthorized:false,
  productionPackagesModified:false,
  noPackagesInstalled:true,
  modelInferenceRuns:0,
  gpuAllocated:false,
  printedObjects:0,
  OSFirewallModified:false,
  noCredentialsOrUserDataTransferred:true
};

await fs.mkdir(path.dirname(OUT),{recursive:true});
const raw=JSON.stringify(report,null,2)+'\n';
requireValue(raw.length<1_500_000,'oversized sanitized stored source response');
const handle=await fs.open(OUT,'wx');
try{await handle.writeFile(raw,'utf8');}finally{await handle.close();}
console.log('G3_23_PUBLIC_OSV_FETCH_COMPLETE '+JSON.stringify({
  count:report.liveTotalReturnedRecords,oldCount:104,
  publicSourceSha256:sha(Buffer.from(raw)),threePublicPackageOnly:true,
  noLocalPackageOrGPUChanges:true
}));
