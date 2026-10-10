/** G3.3 read-only, exact allowlisted, locally SHA-verified fixture image.
 * Returns byte-for-byte licensed source data. Never starts a model or job.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const FIXTURE_DIR=path.join(ROOT,'benchmarks','g3','fixtures');
const CATALOG=path.join(FIXTURE_DIR,'manifest.json');
const ID=/^0[1-9]-[a-z0-9-]+$/;
const SHA=/^[a-f0-9]{64}$/;
const PNG=Buffer.from([137,80,78,71,13,10,26,10]);
const hash=b=>createHash('sha256').update(b).digest('hex');

export class FixtureSourceError extends Error{
  constructor(code,message){super(message);this.code=code;}
}
export async function getBenchmarkSource(id){
  if(typeof id!=='string'||!ID.test(id)){
    throw new FixtureSourceError('G3_SOURCE_NOT_FOUND','No licensed fixture image exists for this ID');
  }
  let manifest;
  try{manifest=JSON.parse(await fs.readFile(CATALOG,'utf8'));}
  catch{throw new FixtureSourceError('G3_SOURCE_UNVERIFIED','Pinned licensed source catalog is unavailable');}
  if(manifest.schema!=='local3d.g3.fixture-catalog.v1'||manifest.fixtureCount!==9||
    manifest.fixtures?.length!==9){
    throw new FixtureSourceError('G3_SOURCE_UNVERIFIED','Invalid source registry');
  }
  const entry=manifest.fixtures.find(x=>x.id===id);
  if(!entry){
    throw new FixtureSourceError('G3_SOURCE_NOT_FOUND','Unknown licensed source fixture');
  }
  const original=entry.sourceRights==='PROJECT_ORIGINAL_PROCEDURAL';
  const upstream=entry.sourceRights==='UPSTREAM_TRIPOSR_MIT_SAMPLE' && id==='09-upstream-chair';
  if(!original&&!upstream){
    throw new FixtureSourceError('G3_SOURCE_UNVERIFIED','Source media rights not confirmed');
  }
  // The source manifest is validated against fixed immutable file naming.
  // A manifest path may not redirect a request to any other local file.
  const expected=original?id+'/input.png':'docs/evidence/g2/source-chair.png';
  if(entry.files?.image!==expected || !SHA.test(entry.imageSha256||'')){
    throw new FixtureSourceError('G3_SOURCE_UNVERIFIED','Source file does not match the exact allowlist');
  }
  const file=path.join(original?FIXTURE_DIR:ROOT,expected);
  let raw;
  try{
    const stat=await fs.lstat(file);
    if(!stat.isFile()||stat.isSymbolicLink()||stat.size>8*1024*1024||stat.size<80){
      throw new Error('Untrusted image file');
    }
    raw=await fs.readFile(file);
  }catch{
    throw new FixtureSourceError('G3_SOURCE_UNVERIFIED','Source image is unavailable');
  }
  if(!raw.subarray(0,8).equals(PNG)||hash(raw)!==entry.imageSha256){
    throw new FixtureSourceError('G3_SOURCE_UNVERIFIED','Source image failed SHA256 or PNG integrity');
  }
  return{
    schema:'local3d.g3.fixture-image.v1',
    fixtureId:id,
    sourceRights:entry.sourceRights,
    sha256:entry.imageSha256,
    image:{
      filename:'G3-'+id+'.png',
      mime:'image/png',
      base64:raw.toString('base64'),
      bytes:raw.length
    },
    manualOnly:true,
    modelInferenceExecuted:false,
    confirmationGranted:false,
    printQualified:false
  };
}
