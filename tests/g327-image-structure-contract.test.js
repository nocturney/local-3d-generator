import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {preflightImageStructure,ImageStructureError} from '../server/image-structure-preflight.js';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=JSON.parse(await fs.readFile(path.join(ROOT,'tests/fixtures/g327-synthetic-images.json'),'utf8'));
const good=source.images.map(x=>({...x,raw:Buffer.from(x.base64,'base64')}));
const rejected=(raw,mime,options={})=>assert.throws(
 ()=>preflightImageStructure(raw,mime,options),
 e=>e instanceof ImageStructureError&&e.code==='BAD_IMAGE_STRUCTURE'
);
const crcTable=Array.from({length:256},(_,i)=>{let c=i;for(let j=0;j<8;j++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0;});
function crc32(raw,from,to){
 let c=0xffffffff;
 for(let i=from;i<to;i++)c=crcTable[(c^raw[i])&255]^(c>>>8);
 return (c^0xffffffff)>>>0;
}
test('G3.27 trusted original 64x64 PNG JPEG WEBP all pass bounded structural check',()=>{
 assert.deepEqual(good.map(x=>x.format),['PNG','JPEG','WEBP']);
 for(const x of good){
  let info=preflightImageStructure(x.raw,x.mime,{minDimension:64});
  assert.equal(info.format,x.format);
  assert.equal(info.mime,x.mime);
  assert.equal(info.width,64);
  assert.equal(info.height,64);
  assert.equal(info.completeImageDecodingProven,false);
  assert.equal(info.nativeParserSandboxOrSecurityApproval,false);
  assert.equal(info.printQualified,false);
  assert.equal(Object.isFrozen(info),true);
 }
});
test('G3.27 incomplete, header-only and truncated harmless images are rejected fail-closed',()=>{
 for(const {mime,raw} of good){
  for(const n of [0,3,8,12,Math.floor(raw.length/2),raw.length-1]){
   rejected(raw.subarray(0,n),mime);
  }
 }
});
test('G3.27 mismatch or unknown MIME is rejected even for fully valid synthetic bytes',()=>{
 for(const x of good){
  for(const mime of ['application/pdf','image/jp2',undefined,'','image/gif',...good.filter(y=>y.mime!==x.mime).map(y=>y.mime)])
   rejected(x.raw,mime);
 }
 rejected(Buffer.from('not-an-image'),'image/png');
 rejected(null,'image/png');
 rejected('png','image/png');
});
test('G3.27 PNG rejects IDAT CRC mismatch, forged header dimensions and trailing bytes',()=>{
 const x=good.find(x=>x.format==='PNG');
 const idat=Buffer.from(x.raw), idatStart=33;
 assert.equal(idat.toString('ascii',idatStart+4,idatStart+8),'IDAT');
 idat[idatStart+9]^=1; rejected(idat,x.mime);
 const dim=Buffer.from(x.raw);
 dim.writeUInt32BE(200_000,16);
 dim.writeUInt32BE(crc32(dim,12,29),29);
 rejected(dim,x.mime);
 const trailing=Buffer.concat([x.raw,Buffer.from([1])]);
 rejected(trailing,x.mime);
 const badLength=Buffer.from(x.raw);
 badLength.writeUInt32BE(0x7fffffff,33);
 rejected(badLength,x.mime);
});
test('G3.27 PNG rejects unknown critical chunk or IEND without IDAT',()=>{
 const x=good.find(x=>x.format==='PNG');
 const duplicate=Buffer.concat([x.raw,x.raw.subarray(-12)]);
 rejected(duplicate,x.mime);
 const withoutIDAT=Buffer.concat([x.raw.subarray(0,33),x.raw.subarray(-12)]);
 rejected(withoutIDAT,x.mime);
});
test('G3.27 JPEG requires frame+scan+EOI, refuses EOI trailer and invalid markers',()=>{
 const x=good.find(x=>x.format==='JPEG');
 rejected(x.raw.subarray(0,x.raw.length-2),x.mime);
 rejected(Buffer.concat([x.raw,Buffer.from([0])]),x.mime);
 const bad=Buffer.from(x.raw);bad[3]=0xd8;rejected(bad,x.mime);
 const noSOS=Buffer.from(x.raw); // still a fixed format, but remove end marker
 noSOS[noSOS.length-1]=0x00;rejected(noSOS,x.mime);
});
test('G3.27 WEBP RIFF complete chunk envelope and dimensions required',()=>{
 const x=good.find(x=>x.format==='WEBP');
 const wrongRIFF=Buffer.from(x.raw);wrongRIFF.writeUInt32LE(5,4);rejected(wrongRIFF,x.mime);
 const wrongChunk=Buffer.from(x.raw);wrongChunk.writeUInt32LE(0x7fffffff,16);rejected(wrongChunk,x.mime);
 rejected(x.raw.subarray(0,x.raw.length-1),x.mime);
 rejected(Buffer.concat([x.raw,Buffer.from([0])]),x.mime);
 const badFourcc=Buffer.from(x.raw);badFourcc.write('ANIM',12);rejected(badFourcc,x.mime);
});
test('G3.27 size, type, dimension and finite resource limits',()=>{
 const x=good[0];
 rejected(Buffer.alloc(8*1024*1024+1),x.mime);
 rejected(x.raw,x.mime,{minDimension:0});
 rejected(x.raw,x.mime,{minDimension:65});
 rejected(x.raw,x.mime,{minDimension:'64'});
 assert.equal(preflightImageStructure(x.raw,x.mime,{minDimension:64}).width,64);
});
test('G3.27 production signature acceptance is NOT the same as proposed strict preflight',async()=>{
 const server=await fs.readFile(path.join(ROOT,'server/index.js'),'utf8');
 assert.match(server,/function sniffImage\(bytes\)/);
 assert.doesNotMatch(server,/preflightImageStructure/);
 for(const x of good)rejected(x.raw.subarray(0,x.format==='WEBP'?12:x.format==='JPEG'?3:8),x.mime);
});
