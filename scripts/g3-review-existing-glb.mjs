/**
 * G3 acceptance: seed a LOCAL temporary API with a PREVIOUSLY created
 * real TripoSR GLB and run ONLY the CPU topology reviewer. NO GPU inference.
 */
import { randomUUID, createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { createApp } from '../server/index.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'docs','evidence','g3');
const temp=await fs.mkdtemp(path.join(os.tmpdir(),'local3d-g3-cpu-only-'));
const id=randomUUID(),jobDir=path.join(temp,'data','jobs',id);
const source=await fs.readFile(path.join(root,'docs','evidence','g2','source-chair.png'));
const model=await fs.readFile(path.join(root,'docs','evidence','g2-app','real-app-output.glb'));
const baselineQa=await fs.readFile(path.join(root,'docs','evidence','g2-app','qa-report.json'));
const sha=b=>createHash('sha256').update(b).digest('hex');
let app=null,browser=null,workerCalls=0;
const check={schema:'local3d.g3.cpu-review-browser-proof.v1',
  existingRealModelSha256:sha(model),newGpuInference:false,cpuOnly:true,
  temporaryServer:true,source:'previously verified G2 real chair GLB',success:false};
try{
  await fs.mkdir(jobDir,{recursive:true});
  await fs.mkdir(output,{recursive:true});
  await fs.writeFile(path.join(jobDir,'output.glb'),model);
  await fs.writeFile(path.join(jobDir,'input.png'),source);
  await fs.writeFile(path.join(jobDir,'qa-report.json'),baselineQa);
  const asset=(id,kind,mime,bytes,label)=>({id,kind,mime,bytes:bytes.length,sha256:sha(bytes),label});
  const manifest={
    schema:'local3d.job.v1',id,providerId:'triposr-local',mode:'image',
    prompt:'PREEXISTING_REAL_GLB_CPU_REVIEW_ONLY',simulation:false,seed:null,
    status:'completed',stage:'g2_ready_draft',progress:100,
    createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),
    completedAt:new Date().toISOString(),error:null,
    source:{name:'upstream-MIT-chair.png',mime:'image/png',bytes:source.length},
    assets:[
      asset('source-image','source','image/png',source,'Licensed source photo'),
      asset('preview-glb','model','model/gltf-binary',model,'Existing G2 real model - no new inference'),
      asset('qa-report','report','application/json',baselineQa,'Existing DRAFT QA')
    ]
  };
  await fs.writeFile(path.join(jobDir,'job.json'),JSON.stringify(manifest,null,2));
  app=await createApp({
    dataDir:path.join(temp,'data'),
    triposrAdapter:{run(){workerCalls++;throw new Error('FORBIDDEN: no GPU inference in this test');}}
  });
  await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+app.server.address().port;
  const before=await(await fetch(base+'/v1/jobs/'+id)).json();
  if(before.status!=='completed'||before.assets.some(x=>x.id==='geometry-qa'))
    throw new Error('Expected unreviewed completed real job');
  browser=await chromium.launch({
    executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']
  });
  const page=await browser.newPage({viewport:{width:1440,height:950},locale:'he-IL'});
  const errors=[],outside=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  page.on('request',r=>{
    if(!r.url().startsWith(base+'/')&&!r.url().startsWith('data:')&&!r.url().startsWith('blob:'))outside.push(r.url());
  });
  await page.goto(base,{waitUntil:'networkidle'});
  await page.locator('#reviewGeometry:visible:not([disabled])').waitFor({timeout:10000});
  await page.locator('#reviewGeometry').click();
  await page.locator('#downloadGeometry:visible').waitFor({timeout:20000});
  await page.waitForFunction(
    ()=>document.querySelector('#geometrySummary')?.textContent.includes('נפח חיובי: לא'),
    null,{timeout:12000}
  );
  const href=await page.locator('#downloadGeometry').getAttribute('href');
  const report=await(await page.request.get(base+href)).json();
  if(report.printQualified!==false||report.approvedForPrinter!==false||
     report.topology.everyObjectPositiveVolume!==false||
     report.topology.everyObjectWatertight!==true||
     report.modelSha256!==sha(model)||workerCalls!==0){
    throw new Error('G3 CPU-only review invariant failed');
  }
  if(errors.length||outside.length)throw new Error('Browser CSP/locality failure: '+JSON.stringify({errors,outside}));
  await page.screenshot({path:path.join(output,'real-chair-cpu-review-ui.png'),fullPage:true});
  check.success=true;
  check.geometrySha256=sha(await fs.readFile(path.join(jobDir,'geometry-qa.json')));
  check.modelSignedVolume=report.parts[0].signedVolumeArbitraryUnitsCubed;
  check.watertight=report.topology.everyObjectWatertight;
  check.positiveVolume=report.topology.everyObjectPositiveVolume;
  check.workerCalls=workerCalls;
  check.browserErrors=errors;
  check.externalRequests=outside;
  console.log('G3_REAL_EXISTING_MODEL_CPU_REVIEW_PASS '+JSON.stringify(check));
}catch(e){
  console.error('G3_CPU_REVIEW_PROOF_FAILED '+String(e?.stack||e));
  process.exitCode=1;
  check.error=String(e?.stack||e);
}finally{
  await fs.writeFile(path.join(output,'real-chair-cpu-review-proof.json'),JSON.stringify(check,null,2)+'\n');
  if(browser)await browser.close().catch(()=>{});
  if(app)await app.close().catch(()=>{});
  await fs.rm(temp,{recursive:true,force:true});
  console.log('G3_CPU_REVIEW_TEMP_SESSION_CLOSED');
}
