/**
 * G3.23 entirely OFFLINE SHA-verifiable public OSV ID/alias census assembly.
 * Input from explicit public query (3 fixed PyPI versions) is in gitignored
 * runtime, previously independently fetched; never connects to any network.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {buildFullCensus} from './g3-23-osv-census-lib.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const RAW=path.join(ROOT,'runtime','qa','g3','osv-full-g323','full-public-osv-query.json');
const OLD=path.join(ROOT,'docs','evidence','g3','g3-5-python-osv-screen.json');
const TRIAGE=path.join(ROOT,'docs','evidence','g3','g3-22-pinned-python-static-triage.json');
const OUT=path.join(ROOT,'docs','evidence','g3','g3-23-full-public-osv-id-census.json');
const hash=x=>createHash('sha256').update(x).digest('hex');
const requireValue=(yes,why)=>{if(!yes)throw new Error('G3.23 FAIL CLOSED: '+why);};
const load=async(file,max=2_000_000)=>{
  const stat=await fs.lstat(file);
  requireValue(stat.isFile()&&!stat.isSymbolicLink()&&stat.size>1&&stat.size<max,
    'source missing/symlink/size');
  const bytes=await fs.readFile(file);
  return {bytes,json:JSON.parse(bytes)};
};
const source=await load(RAW);
const old=await load(OLD);
const prior=await load(TRIAGE);
requireValue(prior.json.previousOsVPublicSnapshotSha256===hash(old.bytes),
  'G3.22 historical OSV byte hash chain broken');
requireValue(prior.json.previousFrozenPythonManifestSha256===old.json.frozenDependencyManifestSha256,
  'G3.22 frozen pinned dependency manifest mismatch');
requireValue(old.json.queryCount===34&&old.json.totalMatchedAdvisoryIds===104,
  'G3.5 old OSV summary missing');

const publicSummary=buildFullCensus(source.json,prior.json,{
  sourceSha:hash(source.bytes),priorSha:hash(prior.bytes)
});

// Exactly compare the 36 prior saved sample IDs to ID or alias in the
// refreshed public query for each identical public version.
let matched=0;
const overlaps=[];
for(const row of old.json.packages.filter(p=>p.advisoryCount>0)){
  const current=source.json.packages.find(p=>
    p.packageName.toLowerCase()===row.name.toLowerCase());
  requireValue(current&&current.publicVersionQueried===row.matchedPublicVersion,
    'previous sampled PyPI version not in current full inventory');
  const lookup=new Set(current.records.flatMap(r=>[r.id,...r.aliases]));
  const missing=row.sampleAdvisoryIds.filter(id=>!lookup.has(id));
  matched+=row.sampleAdvisoryIds.length-missing.length;
  overlaps.push({
    publicPackageName:row.name,
    historicalRetainedSampledAdvisoryIds:row.sampleAdvisoryIds.length,
    historicalIdsResolvedInFreshVersionInventory:row.sampleAdvisoryIds.length-missing.length,
    missingHistoricalSampleCount:missing.length,
    historicalFullAdvisoryIdSetReconstructionImpossible:row.moreAdvisoriesBeyondSample>0,
  });
  requireValue(missing.length===0,
    'old historical sample IDs absent in current OSV inventory');
}
requireValue(matched===36,'not all 36 stored historical IDs cross-verified');
publicSummary.previousSaved36AdvisoryIdsFoundInCurrentPublicResponse=matched;
publicSummary.fullReconstructionOfUnrecordedHistorical68IdsProven=false;
publicSummary.historicalSampleMembershipByPackage=overlaps;
publicSummary.previousOSVPublicSourceJsonSha256=hash(old.bytes);

const output=JSON.stringify(publicSummary,null,2)+'\n';
requireValue(output.length<800_000,'public sanitized full ID/alias proof budget');
const init=process.argv.includes('--write-public');
const stat=await fs.lstat(OUT).catch(e=>e.code==='ENOENT'?null:Promise.reject(e));
if(stat){
  requireValue(stat.isFile()&&!stat.isSymbolicLink(),
    'unsafe public output proof path');
  const existing=await fs.readFile(OUT,'utf8');
  requireValue(existing===output,'G3.23 existing public report changed');
}else{
  requireValue(init,'G3.23 read-only replay requires existing immutable evidence');
  await fs.writeFile(OUT,output,{encoding:'utf8',flag:'wx'});
}
console.log('G3_23_FULL_PUBLIC_OSV_ALIAS_SHA_PASS '+JSON.stringify({
  queriedPublicVersions:3,
  previousSnapshotMatches:104,
  recoveredHistoricalSampleIds:matched,
  currentPublicRecords:publicSummary.newFullPublicVersionResultCount,
  linkedPublicIdentifierGroups:publicSummary.newAliasLinkedPublicRecordGroupCount,
  aliasGroupsNotUniqueExploits:true,
  allAdvisoriesReviewedForRealReachability:false,
  securityIssue4StillOpen:true,
  networkCallsFromAssembly:0,
  packageInstalls:0,
  gpuInference:0,
  outputSha256:hash(Buffer.from(output))
}));
