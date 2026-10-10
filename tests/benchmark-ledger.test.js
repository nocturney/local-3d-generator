import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { buildBenchmarkCoverage,ROOT } from '../server/benchmark-ledger.js';

const sha=x=>createHash('sha256').update(x).digest('hex');
const read=async file=>JSON.parse(await fs.readFile(file,'utf8'));

test('G3 benchmark coverage is 1 previously observed real E2E chair, 8 unrun; synthetic source GT are not AI',async()=>{
  const ledger=await buildBenchmarkCoverage();
  assert.equal(ledger.schema,'local3d.g3.benchmark-coverage.v1');
  assert.equal(ledger.fixtureCount,9);
  assert.equal(ledger.originalSyntheticSources,8);
  assert.equal(ledger.fixturesWithRecordedOutput,1);
  assert.equal(ledger.fixturesWithPreviouslyObservedE2ERun,1);
  assert.equal(ledger.fixturesAwaitingRecordedOutput,8);
  assert.equal(ledger.modelInferenceExecuted,false);
  assert.equal(ledger.printQualified,false);
  assert.equal(ledger.excludedUnverifiedLocalJobs,0);
  const chair=ledger.fixtureResults.find(x=>x.fixtureId==='09-upstream-chair');
  assert.equal(chair.runs.length,1);
  assert.equal(chair.coverage,'PREVIOUSLY_OBSERVED_REAL_E2E_OUTPUT');
  assert.equal(chair.sourceReference3d,'NOT_AVAILABLE');
  assert.equal(chair.runs[0].geometry.positiveVolume,false);
  assert.equal(chair.runs[0].silhouette.status,'POST_HOC_BEST_OF_24_VIEWS_EXPLORATORY_ONLY');
  assert.equal(chair.runs[0].silhouette.calibratedCamera,false);
  assert.equal(chair.runs[0].peakCudaReservedMiB,2058);
  const others=ledger.fixtureResults.filter(x=>x.fixtureId!=='09-upstream-chair');
  assert.equal(others.length,8);
  assert.ok(others.every(x=>x.sourceReference3d==='ORIGINAL_SYNTHETIC_SCENE_NOT_MODEL_PREDICTION'));
  assert.ok(others.every(x=>x.runs.length===0&&x.coverage==='AWAITING_EXPLICIT_MANUAL_GPU_RUN'));
  const raw=JSON.stringify(ledger);
  assert.doesNotMatch(raw,/3fee3adf|upstream-MIT-chair\.png|MANUAL_ONCE|prompt/);
  assert.deepEqual(ledger,await read(path.join(ROOT,'docs','evidence','g3','benchmark-coverage.json')));
});

test('tampered benchmark source mask or model bytes fail closed, never retain forged score',async()=>{
  const temp=await fs.mkdtemp(path.join(os.tmpdir(),'local3d-ledger-tamper-'));
  try{
    await fs.cp(path.join(ROOT,'benchmarks','g3','fixtures'),path.join(temp,'benchmarks','g3','fixtures'),{recursive:true});
    await fs.mkdir(path.join(temp,'docs'),{recursive:true});
    await fs.copyFile(path.join(ROOT,'docs','TRIPOSR_SOURCE_LOCK.json'),path.join(temp,'docs','TRIPOSR_SOURCE_LOCK.json'));
    await fs.cp(path.join(ROOT,'docs','evidence'),path.join(temp,'docs','evidence'),{recursive:true});
    const mask=path.join(temp,'benchmarks','g3','fixtures','04-torus-hole','foreground-mask.png');
    const source=await fs.readFile(mask);
    await fs.appendFile(mask,'MUTATED');
    await assert.rejects(buildBenchmarkCoverage({root:temp}),/BENCHMARK_MASK_CHANGED/);
    await fs.writeFile(mask,source);
    const model=path.join(temp,'docs','evidence','g2-app','real-app-output.glb');
    await fs.appendFile(model,'MUTATED');
    await assert.rejects(buildBenchmarkCoverage({root:temp}),/BENCHMARK_BASELINE_E2E_UNVERIFIED|BENCHMARK_INVALID_GLB/);
  }finally{await fs.rm(temp,{recursive:true,force:true})}
});

test('unlicensed, mock or missing local model jobs are excluded without leaking their names',async()=>{
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'local3d-ledger-private-'));
  try{
    const id=randomUUID(),jobDir=path.join(dir,id);
    await fs.mkdir(jobDir);
    const input=await fs.readFile(path.join(ROOT,'benchmarks','g3','fixtures','01-orb-alpha','input.png'));
    const model=await fs.readFile(path.join(ROOT,'docs','evidence','g2-app','real-app-output.glb'));
    const qa=await read(path.join(ROOT,'docs','evidence','g2-app','qa-report.json'));
    qa.jobId=id;
    qa.provenance.sourceSha256=sha(input);
    qa.provenance.gpu='MOCK_NO_GPU';
    const report=Buffer.from(JSON.stringify(qa));
    const asset=(id,mime,b)=>({id,mime,sha256:sha(b),bytes:b.length});
    await fs.writeFile(path.join(jobDir,'input.png'),input);
    await fs.writeFile(path.join(jobDir,'output.glb'),model);
    await fs.writeFile(path.join(jobDir,'qa-report.json'),report);
    await fs.writeFile(path.join(jobDir,'job.json'),JSON.stringify({
      id,providerId:'triposr-local',simulation:false,status:'completed',
      prompt:'PRIVATE-CUSTOMER-NAME-MUST-NEVER-APPEAR',source:{name:'secret.png',mime:'image/png'},
      assets:[
        asset('source-image','image/png',input),
        asset('preview-glb','model/gltf-binary',model),
        asset('qa-report','application/json',report)
      ]
    }));
    const ledger=await buildBenchmarkCoverage({jobsDir:dir});
    assert.equal(ledger.excludedUnverifiedLocalJobs,1);
    assert.equal(ledger.fixturesWithRecordedOutput,1);
    assert.doesNotMatch(JSON.stringify(ledger),/PRIVATE-CUSTOMER-NAME|secret\.png|MOCK_NO_GPU/);
    assert.doesNotMatch(JSON.stringify(ledger),new RegExp(id));
    assert.equal(ledger.modelInferenceExecuted,false);
  }finally{await fs.rm(dir,{force:true,recursive:true})}
});

test('local SHA-matched record is explicitly un-attested, not labeled independently observed E2E',async()=>{
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'local3d-ledger-unattested-'));
  try{
    const id=randomUUID(),jobDir=path.join(dir,id);
    await fs.mkdir(jobDir);
    const input=await fs.readFile(path.join(ROOT,'benchmarks','g3','fixtures','01-orb-alpha','input.png'));
    const model=await fs.readFile(path.join(ROOT,'docs','evidence','g2-app','real-app-output.glb'));
    const qa=await read(path.join(ROOT,'docs','evidence','g2-app','qa-report.json'));
    qa.jobId=id;qa.provenance.sourceSha256=sha(input);
    qa.provenance.hostGpuTelemetry={
      schema:'local3d.g3.host-gpu-telemetry.v1',
      measurement:'NVIDIA_SMI_PERIODIC_SNAPSHOTS_NOT_EXCLUSIVE_VRAM_RESERVATION',
      initialUsedMiB:4500,initialFreeMiB:11300,initialUtilizationPercent:10,
      peakObservedUsedMiB:5400,minimumObservedFreeMiB:10400,
      peakObservedUtilizationPercent:36,runtimeSamples:2,
      intervalMilliseconds:1500,peakIsExact:false
    };
    const report=Buffer.from(JSON.stringify(qa));
    const asset=(id,mime,b)=>({id,mime,sha256:sha(b),bytes:b.length});
    await fs.writeFile(path.join(jobDir,'input.png'),input);
    await fs.writeFile(path.join(jobDir,'output.glb'),model);
    await fs.writeFile(path.join(jobDir,'qa-report.json'),report);
    await fs.writeFile(path.join(jobDir,'job.json'),JSON.stringify({
      id,providerId:'triposr-local',simulation:false,status:'completed',
      source:{name:'test.png',mime:'image/png'},assets:[
        asset('source-image','image/png',input),
        asset('preview-glb','model/gltf-binary',model),
        asset('qa-report','application/json',report)
      ]
    }));
    const ledger=await buildBenchmarkCoverage({jobsDir:dir});
    assert.equal(ledger.fixturesWithRecordedOutput,2);
    assert.equal(ledger.fixturesWithPreviouslyObservedE2ERun,1);
    const synthetic=ledger.fixtureResults.find(x=>x.fixtureId==='01-orb-alpha');
    assert.equal(synthetic.coverage,'HASHED_LOCAL_JOB_NO_INDEPENDENT_GPU_ATTESTATION');
    assert.equal(synthetic.runs[0].evidenceLane,
      'LOCAL_COMPLETED_JOB_HASH_MATCHED_NOT_EXTERNAL_GPU_ATTESTATION');
    assert.equal(synthetic.runs[0].silhouette.status,'NOT_SCORED');
    assert.equal(synthetic.runs[0].geometry.audit,'NOT_RUN');
    assert.equal(synthetic.runs[0].hostGpuTelemetry.classification,
      'OBSERVED_SHARED_GPU_NOT_MODEL_EXCLUSIVE_MEMORY');
    assert.equal(synthetic.runs[0].hostGpuTelemetry.minimumObservedFreeMiB,10400);
    assert.equal(synthetic.runs[0].hostGpuTelemetry.peakIsExact,false);

    // An explicitly produced private 3D metric is optional, and even when
    // present must never upgrade a hash-linked record to proven GPU execution.
    const scoresDir=path.join(dir,'private-scores');
    await fs.mkdir(scoresDir);
    const scorePath=path.join(scoresDir,sha(model)+'-01-orb-alpha.json');
    const privateScore={
      schema:'local3d.g3.manual-job-shape-evaluation.v1',
      fixtureId:'01-orb-alpha',imageSha256:sha(input),
      modelSha256:sha(model),
      candidateEvidenceLane:'HASH_LINKED_LOCAL_COMPLETED_JOB_NOT_INDEPENDENT_GPU_ATTESTATION',
      approvedForPrinter:false,printQualified:false,modelInferenceExecuted:false,
      hasOriginalGroundTruth3d:true,evaluation:'POST_HOC_NORMALIZED_3D_SHAPE_DIAGNOSTIC',
      shape:{
        candidateSha256:sha(model),referenceSelfSimilarityOnly:false,sameInputBinary:false,
        scalePolicy:'EACH_AABB_DIAGONAL_NORMALIZED_TO_ONE_INDEPENDENTLY',
        selectionPolicy:'MIN_CHAMFER_OVER_POST_HOC_YAW_SEARCH',
        bestView:{chamferL1Normalized:.083,f1At2Pct:.12,candidateYawDegrees:90}
      }
    };
    await fs.writeFile(scorePath,JSON.stringify(privateScore));
    const scored=await buildBenchmarkCoverage({jobsDir:dir,scoresDir});
    const retained=scored.fixtureResults.find(x=>x.fixtureId==='01-orb-alpha');
    assert.equal(retained.coverage,'HASHED_LOCAL_JOB_NO_INDEPENDENT_GPU_ATTESTATION');
    assert.equal(retained.runs[0].originalSyntheticReferenceComparison.chamferL1Normalized,.083);
    assert.equal(retained.runs[0].originalSyntheticReferenceComparison.independentlyAttestedGpu,false);
    assert.equal(scored.excludedInvalidPrivateScores,0);
    privateScore.modelSha256='0'.repeat(64);
    await fs.writeFile(scorePath,JSON.stringify(privateScore));
    const rejected=await buildBenchmarkCoverage({jobsDir:dir,scoresDir});
    assert.equal(rejected.excludedInvalidPrivateScores,1);
    assert.equal(rejected.fixtureResults.find(x=>x.fixtureId==='01-orb-alpha')
      .runs[0].originalSyntheticReferenceComparison,undefined);
  }finally{await fs.rm(dir,{force:true,recursive:true})}
});
