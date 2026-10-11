/**
 * G3.36: real CPU fixture-only ephemeral G1 loopback smoke, NEVER 4177 binding.
 * Checks current 4177 with a short TCP connect only, does NOT touch port 4178.
 * Fresh app runs on bounded 20000..29999 loopback and is fully torn down.
 * No model, GPU, Windows services/scheduled tasks, remote client or printer.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import net from 'node:net';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createApp} from '../server/index.js';
import {listenFixtureSafePort,SAFE_MIN,SAFE_MAX} from '../tests/safe-loopback-fixture.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const REPORT=path.join(root,'runtime/qa/g3/g336-g1-fixture-smoke.json');
const SHA=b=>createHash('sha256').update(b).digest('hex');

function probe4177Listener(){
 return new Promise(resolve=>{
  let done=false;
  const socket=net.createConnection({host:'127.0.0.1',port:4177});
  const finish=status=>{
   if(done)return;done=true;socket.destroy();resolve(status);
  };
  socket.setTimeout(800);
  socket.once('connect',()=>finish('TCP_LISTENER_PRESENT_IDENTITY_UNVERIFIED'));
  socket.once('timeout',()=>finish('PORT_STATE_UNKNOWN_TIMEOUT'));
  socket.once('error',e=>finish(e.code==='ECONNREFUSED'?'NOT_LISTENING':'PORT_STATE_UNKNOWN_ERROR'));
 });
}
const fail=message=>{throw new Error('G3.36 fixture-only fail-closed '+message);};
function assert(ok,message){if(!ok)fail(message);}
export async function runTrustedFixtureOnlySmoke(){
 if(process.env.L3D_ENABLE_TRIPOSR==='1')
  fail('G2 opt-in env set; refusing to construct any app');
 const raw=JSON.parse(await fs.readFile(path.join(root,'tests/fixtures/g327-synthetic-images.json'),'utf8'));
 assert(raw.schema==='local3d.g327.trusted-generated-image-fixtures.v1'&&raw.images.length===3,'trusted original fixtures changed');
 const live4177=await probe4177Listener();
 const tmp=await fs.mkdtemp(path.join(os.tmpdir(),'local3d-g336-fixture-only-'));
 let app=null, listeningPort=null,negative=0,positive=0;
 try{
  app=await createApp({
   dataDir:path.join(tmp,'isolated-data'),
   fixtureFile:path.join(tmp,'isolated-fixture.glb'),
   gpuLeaseRoot:path.join(tmp,'never-used-gpu-lock'),
   stepMs:200
  });
  await listenFixtureSafePort(app.server);
  listeningPort=app.server.address()?.port;
  assert(Number.isSafeInteger(listeningPort)&&listeningPort>=SAFE_MIN&&listeningPort<SAFE_MAX,
   'ephemeral port outside test-only range');
  assert(app.server.address().address==='127.0.0.1','test service bound outside loopback');
  assert(listeningPort!==4177&&listeningPort!==4178&&listeningPort!==4179,'reserved service port in use');
  const base='http://127.0.0.1:'+listeningPort;
  const request=async(url,method='GET',payload)=>{
   const result=await fetch(base+url,{
    method,
    headers:payload?{'content-type':'application/json'}:{},
    body:payload?JSON.stringify(payload):undefined,
    signal:AbortSignal.timeout(5000)
   });
   return {status:result.status,body:await result.json()};
  };
  const health=await request('/v1/health');
  assert(health.status===200&&health.body.schema==='local3d.health.v1'&&
   health.body.status==='G1_DEMO'&&health.body.inference===false&&
   health.body.localOnly===true&&health.body.autoGpuQueue===false&&
   health.body.printing===false,'G1 health is not fixture-only and local');
  const providers=await request('/v1/providers');
  const g2=providers.body.providers.find(x=>x.id==='triposr-local');
  const enabled=providers.body.providers.filter(x=>x.canStart===true);
  assert(providers.status===200&&g2?.status==='STAGED_DISABLED'&&g2.canStart===false&&
   enabled.length===1&&enabled[0].id==='fixture-demo','G2 not safely disabled');
  const post=(rawBytes,mime)=>request('/v1/jobs','POST',{
   providerId:'fixture-demo',mode:'image',
   prompt:'trusted original synthetic loopback G3.36 only',
   image:{filename:'source.png',mime,base64:rawBytes.toString('base64')}
  });
  for(const x of raw.images){
   const bytes=Buffer.from(x.base64,'base64');
   assert(SHA(bytes)===x.sha256,'original synthetic binary differs from frozen fixture SHA');
   const broken=[bytes.subarray(0,x.format==='WEBP'?12:x.format==='PNG'?8:3),
                 bytes.subarray(0,Math.floor(bytes.length/2)),
                 bytes.subarray(0,bytes.length-1)];
   for(const fragment of broken){
    const response=await post(fragment,x.mime);
    assert(response.status===422&&response.body.error?.code==='BAD_IMAGE_STRUCTURE',
      'invalid image reached job lifecycle or parser bypass');
    negative++;
   }
  }
  const noJobs=await request('/v1/jobs');
  assert(noJobs.status===200&&noJobs.body.jobs.length===0,
   'bad media created a G1 or G2 job');
  for(const image of raw.images){
   const response=await post(Buffer.from(image.base64,'base64'),image.mime);
   assert(response.status===201&&response.body.simulation===true,
    'valid trusted image not accepted by fixture-only route');
   positive++;
  }
  const jobs=await request('/v1/jobs');
  assert(jobs.status===200&&jobs.body.jobs.length===positive,
   'accepted fixture-only job count incorrect');
  return Object.freeze({
   schema:'local3d.g336.ephemeral-fixture-only-g1-test-not-persistent-activation.v1',
   observationDate:'2026-10-11',
   observedPort4177TcpStatus:live4177,
   ephemeralTestPortInSafeRange:true,
   ephemeralTestBoundLoopbackOnly:true,
   persistentG1Port4177NeverBoundByTest:true,
   unrelated4178ServiceNeverContacted:true,
   noG2AdapterConstructed:true,
   G1DemoHealthVerified:true,
   G2ProviderRemainedStagedDisabled:true,
   malformedInput422BeforeJobCount:negative,
   completeOriginalSyntheticFixture201Count:positive,
   actualGpuJobs:0,
   noInferenceOrPrinterRelease:true,
   onlyTrustedOriginalTinyFixturesUsed:true,
   persistentG1ServiceStarted:false,
   autostartOrSchedulerCreated:false,
   osSecurityOrOfficeChanged:false,
   actualGuestImageDecoderIsolationProven:false,
   printQualified:false,
   canCloseIssue5:false
  });
 } finally {
  if(app)await app.close();
  await fs.rm(tmp,{recursive:true,force:true});
 }
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const record=await runTrustedFixtureOnlySmoke();
 if(process.argv.includes('--write-private-observation')){
  await fs.mkdir(path.dirname(REPORT),{recursive:true});
  await fs.writeFile(REPORT,JSON.stringify(record,null,2)+'\n',{flag:'wx'});
 }
 console.log('G336_G1_EPHEMERAL_FIXTURE_SAFE_PASS '+JSON.stringify({
  dedicated4177State:record.observedPort4177TcpStatus,
  rejected422:record.malformedInput422BeforeJobCount,
  accepted201:record.completeOriginalSyntheticFixture201Count,
  G2Enabled:false,real4177Started:false,actualGpuJobs:0
 }));
}
