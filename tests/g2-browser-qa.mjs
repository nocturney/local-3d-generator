/**
 * Browser acceptance of G2 MANUAL UI using an explicitly injected MOCK adapter.
 * Does not execute Python, CUDA, GPU, network models or a real new inference.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright-core';
import { createApp } from '../server/index.js';

const root=path.resolve(import.meta.dirname,'..');
const evidence=path.join(root,'docs','evidence','g2');
const [image,glb] = await Promise.all([
  fs.readFile(path.join(evidence,'source-chair.png')),
  fs.readFile(path.join(evidence,'chair-yup.glb'))
]);
const sha = b=>createHash('sha256').update(b).digest('hex');
const temp=await fs.mkdtemp(path.join(os.tmpdir(),'local3d-g2-browser-'));
const out=path.join(root,'runtime','qa','g2-mock-browser');
await fs.mkdir(out,{recursive:true});
const report={schema:'local3d.g2.mock-browser-qa.v1',mockOnly:true,phases:[],browserErrors:[],remoteRequests:[],modelInference:false};
let app=null,browser=null;
let invoked=0;
const fakeAdapter={
  async run({inputPath,signal,onStage}){
    invoked++;
    onStage('gpu_guard');
    await new Promise((resolve,reject)=>{
      const t=setTimeout(resolve,450);
      signal.addEventListener('abort',()=>{clearTimeout(t);reject(Object.assign(new Error('aborted'),{code:'CANCELLED'}))},{once:true});
      if(signal.aborted){clearTimeout(t);reject(Object.assign(new Error('aborted'),{code:'CANCELLED'}));}
    });
    onStage('export_glb');
    return {glb,qa:{
      simulation:false,mode:'LOCAL_REAL_INFERENCE',status:'DRAFT',printQualified:false,
      sourceCommit:'TEST_MOCK',weightsRevision:'TEST_MOCK',weightsSha256:'TEST_MOCK',
      inputSha256:sha(await fs.readFile(inputPath)),artifactSha256:sha(glb),
      elapsedSeconds:0,gpu:'MOCK_NO_GPU',peakCudaReservedMiB:0,
      vertices:9986,faces:19972,coordinateSystem:'Y_UP',watertight:true,
      preprocessing:'MOCK_TEST_ONLY'
    }};
  }
};
function phase(label){report.phases.push({label,status:'PASS'});}
try {
  const fakeBenchmarkReviewer = async ({outputFile,sourceSha,modelSha}) => {
    const data = {
      schema:'local3d.g3.manual-job-shape-evaluation.v1',
      fixtureId:'09-upstream-chair',
      imageSha256:sourceSha,modelSha256:modelSha,
      candidateEvidenceLane:'HASH_LINKED_LOCAL_COMPLETED_JOB_NOT_INDEPENDENT_GPU_ATTESTATION',
      evaluation:'NO_GROUND_TRUTH_3D',hasOriginalGroundTruth3d:false,shape:null,
      modelInferenceExecuted:false,printQualified:false,approvedForPrinter:false,
      fabricationAction:'NONE'
    };
    const raw=Buffer.from(JSON.stringify(data,null,2)+'\n');
    await fs.writeFile(outputFile,raw,{flag:'wx'});
    return {raw,report:data};
  };
  app=await createApp({dataDir:path.join(temp,'data'),fixtureFile:path.join(temp,'fixture.glb'),
    stepMs:30,triposrAdapter:fakeAdapter,benchmarkReviewer:fakeBenchmarkReviewer,
    gpuLeaseRoot:path.join(temp,'gpu-coordination')});
  await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+app.server.address().port;
  const executablePath=process.platform==='win32' ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge';
  browser=await chromium.launch({executablePath,headless:true,
    args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const page=await browser.newPage({viewport:{width:1440,height:950},locale:'he-IL'});
  page.on('pageerror',e=>report.browserErrors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')report.browserErrors.push(m.text())});
  page.on('request',r=>{if(!r.url().startsWith(base+'/') && !r.url().startsWith('blob:') && !r.url().startsWith('data:'))report.remoteRequests.push(r.url())});
  await page.goto(base,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>document.querySelector('#benchmarkProgress')?.textContent?.includes('1 / 9'),null,{timeout:8000});
  await page.locator('#healthStatus').getByText('READY').waitFor({timeout:12000});
  await page.locator('#providerTripo:not([disabled])').waitFor();
  assert.equal(await page.locator('#sessionBadge').textContent(),'G2 · MANUAL ONLY');
  assert.equal(await page.locator('#gpuConsentWrap').isHidden(),true);
  phase('G2 opt-in provider discoverable in operator-enabled session');

  await page.locator('#providerTripo').click();
  assert.equal(await page.locator('#gpuConsentWrap').isVisible(),true);
  // Consent granted for a previous image MUST be revoked when the image changes.
  await page.locator('#gpuConsent').check();
  await page.locator('#benchmarkSource').selectOption('05-disconnected-pair');
  await page.locator('#loadBenchmarkSource').click();
  await page.waitForFunction(()=>document.querySelector('#fileNote')?.textContent==='G3-05-disconnected-pair.png',null,{timeout:10000});
  assert.equal(await page.locator('#gpuConsent').isChecked(),false);
  assert.equal((await(await page.request.get(base+'/v1/jobs')).json()).jobs.length,0);
  assert.equal(invoked,0,'Loading a benchmark fixture must never invoke any AI worker');
  phase('G3 benchmark source selection revokes stale consent without GPU or job creation');
  assert.equal(await page.locator('#gpuConsent').isChecked(),false);
  await page.locator('#imageInput').setInputFiles({name:'licensed-chair.png',mimeType:'image/png',buffer:image});
  await page.locator('#startJob').click();
  assert.match(await page.locator('#formError').textContent(),/לאשר/);
  assert.equal(invoked,0);
  phase('Real engine choice requires consent, does not auto-run or reuse consent');

  await page.locator('#gpuConsent').check();
  await page.locator('#startJob').click();
  await page.waitForFunction(()=>document.querySelector('#metricStatus')?.textContent?.trim()==='הושלמה',null,{timeout:15000});
  await page.waitForFunction(()=>document.querySelector('#viewerStatus')?.textContent === 'REAL AI / DRAFT',null,{timeout:15000});
  assert.equal(await page.locator('#gpuConsent').isChecked(),false);
  assert.match(await page.locator('#demoWatermark').textContent(),/REAL LOCAL AI/);
  assert.doesNotMatch(await page.locator('#demoWatermark').textContent(),/DEMO FIXTURE/);
  assert.equal(await page.locator('#metricProvider').textContent(),'TripoSR Local');
  const selectedId=(await page.locator('#selectedJobId').textContent()).trim();
  const qaHref=await page.locator('#downloadReport').getAttribute('href');
  const qa=await (await page.request.get(base+qaHref)).json();
  assert.equal(qa.realInference,true);assert.equal(qa.printQualified,false);
  assert.equal(qa.provenance.sourceCommit,'TEST_MOCK');
  assert.equal(invoked,1);
  await page.screenshot({path:path.join(out,'G2-MOCK-MANUAL-UI.png'),fullPage:true});
  phase('Confirmed mock job travels through real-provider UI and DRAFT manifest, preview is explicitly synthetic test');

  await page.locator('#reviewGeometry').click();
  await page.locator('#downloadGeometry:visible').waitFor({timeout:20000});
  await page.waitForFunction(()=>document.querySelector('#geometrySummary')?.textContent.includes('נפח חיובי'),null,{timeout:10000});
  const geomHref=await page.locator('#downloadGeometry').getAttribute('href');
  const geometry=await (await page.request.get(base+geomHref)).json();
  assert.equal(geometry.classification,'DRAFT_REQUIRES_HUMAN_REVIEW');
  assert.equal(geometry.printQualified,false);
  assert.equal(geometry.topology.everyObjectWatertight,true);
  assert.equal(geometry.topology.everyObjectPositiveVolume,false);
  assert.match(await page.locator('#geometrySummary').textContent(),/נפח חיובי: לא/);
  assert.equal(invoked,1,'Geometry review must not invoke AI again');
  await page.screenshot({path:path.join(out,'G3-CPU-REVIEW-MOCK-WORKFLOW.png'),fullPage:true});
  phase('G3 CPU-only topology review and negative volume shown in browser without AI inference');

  await page.locator('#scoreBenchmark:visible:not([disabled])').waitFor();
  await page.locator('#scoreBenchmark').click();
  await page.locator('#downloadBenchmark:visible').waitFor({timeout:14000});
  await page.waitForFunction(()=>document.querySelector('#benchmarkShapeSummary')?.textContent.includes('לא קיים מודל מקור'),null,{timeout:12000});
  const benchmarkHref=await page.locator('#downloadBenchmark').getAttribute('href');
  const benchmark=await (await page.request.get(base+benchmarkHref)).json();
  assert.equal(benchmark.fixtureId,'09-upstream-chair');
  assert.equal(benchmark.evaluation,'NO_GROUND_TRUTH_3D');
  assert.equal(benchmark.shape,null);
  assert.equal(benchmark.printQualified,false);
  assert.equal(benchmark.modelInferenceExecuted,false);
  assert.equal(invoked,1,'CPU reference analysis must not start a second AI worker');
  await page.screenshot({path:path.join(out,'G3-CPU-BENCHMARK-MOCK-WORKFLOW.png'),fullPage:true});
  phase('G3.4 explicit CPU benchmark is visible only for a licensed completed source; real 3D GT absence is stated');

  await page.locator('#providerFixture').click();
  assert.equal(await page.locator('#gpuConsentWrap').isHidden(),true);
  await page.locator('#textMode').click();
  await page.locator('#prompt').fill('fixture-only test');
  await page.locator('#startJob').click();
  await page.waitForFunction(()=>document.querySelector('#metricStatus')?.textContent?.trim()==='הושלמה',null,{timeout:15000});
  await page.waitForFunction(()=>document.querySelector('#viewerStatus')?.textContent === 'DEMO GLB / READY',null,{timeout:12000});
  assert.match(await page.locator('#demoWatermark').textContent(),/DEMO FIXTURE/);
  await page.locator('.history-item').filter({hasText:selectedId.slice(0,8)}).first().click().catch(()=>{});
  phase('Fixture fallback and real/DEMO output labels remain distinct');

  assert.deepEqual(report.browserErrors,[]);
  assert.deepEqual(report.remoteRequests,[]);
  phase('No browser JS errors or external browser requests');
  console.log('G2_MOCK_BROWSER_PASS '+JSON.stringify({phases:report.phases.length,mockOnly:true,modelExecutions:0,output:out}));
} catch(error){
  report.phases.push({label:'acceptance',status:'FAIL',error:String(error?.stack||error)});
  console.error('G2_MOCK_BROWSER_FAIL '+String(error?.stack||error));
  process.exitCode=1;
} finally {
  await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
  if(browser)await browser.close();
  if(app)await app.close();
  await fs.rm(temp,{recursive:true,force:true});
}
