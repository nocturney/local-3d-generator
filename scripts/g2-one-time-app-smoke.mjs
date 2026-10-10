/**
 * Manual, one-time, explicitly authorized E2E G2 validation on Windows Chris.
 * NOT called by npm start/test, never schedules GPU processing.
 * Requires L3D_AUTHORIZE_ONE_TIME_SMOKE=YES in this process only.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { setTimeout as sleep } from 'node:timers/promises';
import { chromium } from 'playwright-core';
import { createApp } from '../server/index.js';
import { createTripoSRAdapter } from '../server/triposr-adapter.js';

if (process.platform !== 'win32' || process.env.L3D_AUTHORIZE_ONE_TIME_SMOKE !== 'YES') {
  throw new Error('One-time manual authorization and Windows host required. Never scheduled.');
}
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const nowStamp=new Date().toISOString().replace(/[:.]/g,'-');
const dest=path.join(root,'runtime','qa','g2-app-real-'+nowStamp);
const dataDir=path.join(dest,'data');
await fs.mkdir(dest,{recursive:true});
const source=await fs.readFile(path.join(root,'docs','evidence','g2','source-chair.png'));
const hash=b=>createHash('sha256').update(b).digest('hex');
let app,browser,success=false;
const evidence={schema:'local3d.g2.real-e2e.v1',startedAt:new Date().toISOString(),
  trigger:'MANUAL_ONCE',autoGpuQueue:false,printer:false,mode:'REAL_LOCAL_INFERENCE',success:false};
async function api(base,route,method='GET',json=null){
  const r=await fetch(base+route,{method,headers:json?{'Content-Type':'application/json'}:{},
    body:json?JSON.stringify(json):undefined});
  if(!r.ok)throw new Error('HTTP '+r.status+' on '+route+': '+JSON.stringify(await r.json()).slice(0,200));
  return await r.json();
}
try {
  app=await createApp({dataDir,triposrAdapter:createTripoSRAdapter()});
  await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+app.server.address().port;
  const providers=await api(base,'/v1/providers');
  assert.equal(providers.providers.find(p=>p.id==='triposr-local').canStart,true);
  const first=await api(base,'/v1/jobs','POST',{
    providerId:'triposr-local',mode:'image',confirmGpu:true,
    image:{mime:'image/png',filename:'MIT-sample-chair.png',base64:source.toString('base64')},
    prompt:'One-time E2E verification; description is not used as text-to-3D'
  });
  assert.equal(first.simulation,false);
  evidence.jobId=first.id;
  console.log('ONE_TIME_JOB_CREATED '+first.id);
  let final=null;
  const deadline=Date.now()+185000;
  while(Date.now()<deadline){
    const j=await api(base,'/v1/jobs/'+first.id);
    if(['completed','failed','cancelled','interrupted'].includes(j.status)){final=j;break;}
    await sleep(500);
  }
  if(!final) {
    await api(base,'/v1/jobs/'+first.id+'/cancel','POST').catch(()=>{});
    throw new Error('Smoke script hit independent timeout; cancelled GPU job');
  }
  if(final.status!=='completed')throw new Error('G2 real worker did not succeed: '+JSON.stringify(final.error||final.status));
  assert.equal(final.simulation,false);
  const glbRes=await fetch(base+'/v1/jobs/'+first.id+'/assets/preview-glb');
  assert.equal(glbRes.status,200);
  const bytes=Buffer.from(await glbRes.arrayBuffer());
  const qa=await api(base,'/v1/jobs/'+first.id+'/assets/qa-report');
  assert.equal(qa.realInference,true);
  assert.equal(qa.printQualified,false);
  assert.equal(qa.provenance.coordinateSystem,'Y_UP');
  assert.equal(qa.provenance.sourceSha256,hash(source));
  assert.equal(qa.provenance.artifactSha256,hash(bytes));
  assert.equal(bytes.toString('ascii',0,4),'glTF');
  evidence.outputHash=hash(bytes);
  evidence.modelBytes=bytes.length;
  evidence.qa=qa;
  evidence.jobStatus=final.status;
  console.log('E2E_REAL_GLB_VERIFIED '+JSON.stringify({
    bytes:bytes.length,seconds:qa.provenance.elapsedSeconds,peakMiB:qa.provenance.peakCudaReservedMiB
  }));

  browser=await chromium.launch({
    executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']
  });
  const page=await browser.newPage({viewport:{width:1440,height:950}});
  const errors=[],outside=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  page.on('request',r=>{
    if(!r.url().startsWith(base+'/') && !r.url().startsWith('blob:') && !r.url().startsWith('data:'))outside.push(r.url());
  });
  await page.goto(base,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>document.querySelector('#viewerStatus')?.textContent === 'REAL AI / DRAFT',null,{timeout:20000});
  assert.equal(await page.locator('#metricProvider').textContent(),'TripoSR Local');
  assert.match(await page.locator('#demoWatermark').textContent(),/REAL LOCAL AI/);
  assert.deepEqual(errors,[]);
  assert.deepEqual(outside,[]);
  await page.screenshot({path:path.join(dest,'real-local-3d-ui.png'),fullPage:true});
  evidence.browser='REAL_CHROME_GLTF_RENDER_PASS';
  evidence.consoleErrors=errors;
  evidence.externalRequests=outside;
  evidence.success=true;
  success=true;
  console.log('G2_REAL_APP_E2E_PASS '+JSON.stringify({jobId:first.id,output:dest,modelHash:evidence.outputHash}));
} catch(e){
  evidence.error=String(e?.stack||e);
  console.error('G2_REAL_APP_E2E_FAIL '+evidence.error);
  process.exitCode=1;
} finally {
  evidence.finishedAt=new Date().toISOString();
  await fs.writeFile(path.join(dest,'report.json'),JSON.stringify(evidence,null,2)+'\n');
  if(browser)await browser.close().catch(()=>{});
  if(app)await app.close().catch(()=>{});
  console.log('G2_ONE_TIME_SESSION_CLOSED '+JSON.stringify({success,evidence:dest}));
}
