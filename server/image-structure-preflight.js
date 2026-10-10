/**
 * LOCAL3D G3.27: bounded CPU-only structural image container preflight.
 * NO image decompression, Pillow, model/GPU, filesystem or network access.
 * This is an admission syntax check, NOT native image-parser isolation.
 */
export class ImageStructureError extends Error {
  constructor(code='BAD_IMAGE_STRUCTURE') {
    super('Image container failed bounded structural preflight');
    this.name='ImageStructureError';
    this.code=code;
  }
}
const fail=()=>{throw new ImageStructureError();};
const LIMIT=8*1024*1024;
const PIXELS=16_000_000;
const MAX_SIDE=16_384;
const CRC_TABLE=Uint32Array.from({length:256},(_,i)=>{
  let c=i;
  for(let j=0;j<8;j++)c=c&1?0xedb88320^(c>>>1):c>>>1;
  return c>>>0;
});
function crc32(buffer,start,end){
  let crc=0xffffffff;
  for(let i=start;i<end;i++)crc=CRC_TABLE[(crc^buffer[i])&255]^(crc>>>8);
  return (crc^0xffffffff)>>>0;
}
function dims(width,height,min){
  if(!Number.isInteger(width)||!Number.isInteger(height)||
     width<min||height<min||width>MAX_SIDE||height>MAX_SIDE||
     width*height>PIXELS)fail();
  return {width,height};
}
function formatOf(raw){
  if(raw.length>=8&&raw.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return 'PNG';
  if(raw.length>=3&&raw[0]===255&&raw[1]===216&&raw[2]===255)return 'JPEG';
  if(raw.length>=12&&raw.toString('ascii',0,4)==='RIFF'&&raw.toString('ascii',8,12)==='WEBP')return 'WEBP';
  fail();
}
function png(raw,min){
  let at=8, seenIHDR=false,seenIEND=false,hasIDAT=false,seenPLTE=false,afterIDAT=false;
  let idatSize=0, count=0, width=0,height=0,color=0,bit=0;
  while(at<raw.length){
    if(++count>1024||at+12>raw.length)fail();
    const length=raw.readUInt32BE(at),start=at+8,end=start+length,crcPos=end;
    if(length>LIMIT||end+4>raw.length||end<start)fail();
    const type=raw.toString('ascii',at+4,at+8);
    if(!/^[A-Za-z]{4}$/.test(type)||!seenIHDR&&type!=='IHDR')fail();
    if(raw.readUInt32BE(crcPos)!==crc32(raw,at+4,end))fail();
    if(type==='IHDR'){
      if(seenIHDR||length!==13)fail();
      width=raw.readUInt32BE(start);height=raw.readUInt32BE(start+4);
      bit=raw[start+8];color=raw[start+9];
      if(![0,2,3,4,6].includes(color)||!(
          {0:[1,2,4,8,16],2:[8,16],3:[1,2,4,8],4:[8,16],6:[8,16]}[color].includes(bit)
      )||raw[start+10]!==0||raw[start+11]!==0||raw[start+12]>1)fail();
      dims(width,height,min);seenIHDR=true;
    }else if(type==='PLTE'){
      if(seenPLTE||hasIDAT||color===0||color===4||length===0||length>768||length%3)fail();
      if(color===3&&length/3>2**bit)fail();
      seenPLTE=true;
    }else if(type==='IDAT'){
      if(!seenIHDR||afterIDAT)fail();
      hasIDAT=true;idatSize+=length;
      if(idatSize>LIMIT)fail();
    }else if(type==='IEND'){
      if(length!==0||!hasIDAT||!idatSize||end+4!==raw.length)fail();
      seenIEND=true;
    }else{
      if((type.charCodeAt(0)&32)===0)fail(); // unknown critical chunk
      if(hasIDAT)afterIDAT=true;
    }
    at=end+4;
    if(seenIEND)break;
  }
  if(!seenIEND||at!==raw.length||color===3&&!seenPLTE)fail();
  return {width,height};
}
const isSOF=marker=>marker>=0xc0&&marker<=0xcf&&!new Set([0xc4,0xc8,0xcc]).has(marker);
function jpeg(raw,min){
  let at=2,markerCount=0,scanCount=0,width=0,height=0,foundFrame=false,foundSOS=false;
  let inEntropy=false;
  while(at<raw.length){
    if(++markerCount>4096)fail();
    if(inEntropy){
      // Walk entropy bytes only; no Huffman decoding or native extensions.
      while(at<raw.length&&raw[at]!==0xff)at++;
      if(at>=raw.length)fail();
      let q=at+1;
      while(q<raw.length&&raw[q]===0xff)q++;
      if(q>=raw.length)fail();
      const m=raw[q];
      if(m===0||m>=0xd0&&m<=0xd7){at=q+1;continue;}
      inEntropy=false;
    }
    if(at>=raw.length||raw[at]!==0xff)fail();
    let p=at+1;while(p<raw.length&&raw[p]===0xff)p++;
    if(p>=raw.length)fail();
    const marker=raw[p];
    at=p+1;
    if(marker===0x00||marker===0xd8||marker>=0xd0&&marker<=0xd7)fail();
    if(marker===0xd9){
      if(!foundFrame||!foundSOS||at!==raw.length)fail();
      return {width,height};
    }
    if(marker===0x01)continue; // TEM standalone
    if(at+2>raw.length)fail();
    const len=raw.readUInt16BE(at);
    if(len<2||at+len>raw.length)fail();
    const data=at+2, end=at+len;
    if(isSOF(marker)){
      if(foundFrame||len<11)fail();
      height=raw.readUInt16BE(data+1);width=raw.readUInt16BE(data+3);
      const components=raw[data+5];
      if(components===0||len!==8+3*components)fail();
      dims(width,height,min);foundFrame=true;
    }else if(marker===0xda){
      if(!foundFrame||len<6)fail();
      foundSOS=true;scanCount++;
      if(scanCount>256)fail();
      inEntropy=true;
    }
    at=end;
  }
  fail();
}
function webp(raw,min){
  if(raw.length<20||raw.readUInt32LE(4)+8!==raw.length)fail();
  let at=12,count=0,first=null,primary=false,extended=false,extDims=null,actual=null;
  while(at<raw.length){
    if(++count>256||at+8>raw.length)fail();
    const tag=raw.toString('ascii',at,at+4);
    const len=raw.readUInt32LE(at+4),start=at+8,end=start+len;
    if(len>LIMIT||end>raw.length||end<start||end+(len%2)>raw.length)fail();
    if(!first)first=tag;
    if(tag==='VP8X'){
      if(extended||primary||first!=='VP8X'||len!==10)fail();
      extended=true;
      if(raw[start]&0x02)fail(); // animation not part of this bounded static contract
      const width=1+raw.readUIntLE(start+4,3),height=1+raw.readUIntLE(start+7,3);
      extDims=dims(width,height,min);
    }else if(tag==='VP8 '){
      if(primary||len<10||(!extended&&first!=='VP8 '))fail();
      if(raw[start]&1||raw[start+3]!==0x9d||raw[start+4]!==0x01||raw[start+5]!==0x2a)fail();
      actual=dims(raw.readUInt16LE(start+6)&0x3fff,raw.readUInt16LE(start+8)&0x3fff,min);
      primary=true;
    }else if(tag==='VP8L'){
      if(primary||len<5||(!extended&&first!=='VP8L')||raw[start]!==0x2f)fail();
      const width=1+(raw[start+1]|(raw[start+2]&0x3f)<<8);
      const height=1+((raw[start+2]>>>6)|(raw[start+3]<<2)|((raw[start+4]&15)<<10));
      actual=dims(width,height,min);primary=true;
    }else if(tag==='ANIM'||tag==='ANMF'){
      fail();
    }else if(!extended){
      fail(); // simple static WebP permits only exactly one VP8/VP8L image chunk
    }
    at=end+(len%2);
  }
  if(at!==raw.length||!primary||extended&&!extDims)fail();
  if(extended&&(actual.width>extDims.width||actual.height>extDims.height))fail();
  return extDims||actual;
}
/**
 * Strict *container syntax* only. Never returns 'safe to decode' or print.
 * Unknown/unsupported/malformed inputs reject closed; 8 MiB / 16MP max.
 */
export function preflightImageStructure(bytes,declaredMime,{minDimension=1}={}){
  if(!Buffer.isBuffer(bytes)||bytes.length<16||bytes.length>LIMIT||
     !Number.isInteger(minDimension)||![1,64].includes(minDimension))fail();
  const kind=formatOf(bytes);
  const mime={PNG:'image/png',JPEG:'image/jpeg',WEBP:'image/webp'}[kind];
  if(declaredMime!==mime)fail();
  const size=kind==='PNG'?png(bytes,minDimension):
    kind==='JPEG'?jpeg(bytes,minDimension):webp(bytes,minDimension);
  return Object.freeze({
    mime,format:kind,...size,
    validation:'BOUNDED_CONTAINER_STRUCTURE_ONLY',
    completeImageDecodingProven:false,
    nativeParserSandboxOrSecurityApproval:false,
    printQualified:false
  });
}
