/** G3.46 synthetic ONLY: Node mock worker for artifact readback attacks.
 * No Python, torch, GPU, network, credentials or customer data.
 * Mutates only paths beneath its test-owned jobDir and public GLB fixture.
 */
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const argv=process.argv.slice(2);
const get=k=>argv[argv.indexOf(k)+1];
const dir=get('--job-dir'),input=get('--image'),out=get('--output-dir');
if(!dir||!input||!out||path.dirname(input)!==dir||
   path.dirname(out)!==dir||path.basename(out)!=='engine-output'){
 console.error('G346 invalid synthetic test arguments');process.exit(3);
}
const scenario=process.env.G346_FAKE_POISON||'HEALTHY';
const cases=['HEALTHY','HARDLINK_MODEL','HARDLINK_QA','HARDLINK_INPUT',
 'JUNCTION_OUTPUT','INPUT_DRIFT'];
if(!cases.includes(scenario))process.exit(4);
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
console.log('TRIPOSR_STAGE verify_sources');
setTimeout(()=>{
 try{
  let source=fs.readFileSync(input);
  const glb=fs.readFileSync(path.resolve(__dirname,'../../docs/evidence/g2/chair-yup.glb'));
  if(scenario==='JUNCTION_OUTPUT'){
   const dest=path.join(dir,'owned-artifact-destination');
   fs.mkdirSync(dest);
   fs.symlinkSync(dest,out,process.platform==='win32'?'junction':'dir');
  }else fs.mkdirSync(out,{recursive:false});
  const model=path.join(out,'model.glb'),report=path.join(out,'qa-report.json');
  fs.writeFileSync(model,glb);
  if(scenario==='HARDLINK_MODEL')
   fs.linkSync(model,path.join(dir,'owned-hardlink-model'));
  if(scenario==='HARDLINK_INPUT')
   fs.linkSync(input,path.join(dir,'owned-hardlink-input'));
  if(scenario==='INPUT_DRIFT'){
   fs.writeFileSync(input,Buffer.alloc(source.length,12));
   source=fs.readFileSync(input);
  }
  fs.writeFileSync(report,JSON.stringify({
   simulation:false,mode:'LOCAL_REAL_INFERENCE',printQualified:false,status:'DRAFT',
   inputSha256:sha(source),artifactSha256:sha(glb),artifactBytes:glb.length,
   coordinateSystem:'Y_UP',vertices:9986,faces:19972,
   sourceCommit:'MOCK_ONLY',weightsRevision:'MOCK_ONLY',weightsSha256:'MOCK_ONLY',
   elapsedSeconds:0,gpu:'NONE_FAKE_WORKER',peakCudaReservedMiB:0
  }));
  if(scenario==='HARDLINK_QA')
   fs.linkSync(report,path.join(dir,'owned-hardlink-qa'));
  console.log('TRIPOSR_STAGE export_glb');
  console.log('TRIPOSR_PILOT_SUCCESS G346-SYNTHETIC-NODE-WORKER');
 }catch(e){
  console.error('G346 synthetic worker error: '+e.code);process.exitCode=1;
 }
},20);
