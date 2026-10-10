/**
 * Child process contract fixture. DOES NOT import torch or use a GPU.
 * Only invoked by an explicitly constructed adapter in tests.
 */
const fs=require('fs');
const path=require('path');
const crypto=require('crypto');
const args=process.argv.slice(2);
const get=key=>args[args.indexOf(key)+1];
const jobDir=get('--job-dir'),input=get('--image'),out=get('--output-dir');
if(!jobDir||!input||!out||path.dirname(input)!==jobDir){process.exit(3)}
const digest=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
fs.writeFileSync(path.join(jobDir,'test-worker.pid'),String(process.pid));
console.log('TRIPOSR_STAGE verify_sources');
const mode=process.env.G2_FAKE_MODE||'ok';
if(mode==='hang'){
  setInterval(()=>console.log('TRIPOSR_STAGE infer_image'),450);
}else{
  setTimeout(()=>{
    fs.mkdirSync(out,{recursive:true});
    const glb=fs.readFileSync(path.resolve(__dirname,'../../docs/evidence/g2/chair-yup.glb'));
    const src=fs.readFileSync(input);
    fs.writeFileSync(path.join(out,'model.glb'),glb);
    fs.writeFileSync(path.join(out,'qa-report.json'),JSON.stringify({
      simulation:false,mode:'LOCAL_REAL_INFERENCE',printQualified:false,status:'DRAFT',
      inputSha256:digest(src),artifactSha256:digest(glb),artifactBytes:glb.length,
      coordinateSystem:'Y_UP',vertices:9986,faces:19972,
      sourceCommit:'MOCK_ONLY',weightsRevision:'MOCK_ONLY',weightsSha256:'MOCK_ONLY',
      elapsedSeconds:0,gpu:'NONE_FAKE_WORKER',peakCudaReservedMiB:0
    }));
    console.log('TRIPOSR_STAGE export_glb');
    console.log('TRIPOSR_PILOT_SUCCESS mock-no-gpu');
  },mode==='delayed-ok'?2400:80);
}
