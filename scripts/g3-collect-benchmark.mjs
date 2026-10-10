/**
 * Read-only G3 benchmark coverage generator. NEVER generates geometry.
 *
 * Default: public, licensed repo evidence only -> checked-in coverage JSON.
 * Optional --jobs-dir: additional manual-local records, output forced into
 * gitignored runtime/qa. No customer names, job IDs, paths or prompts emitted.
 */
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { buildBenchmarkCoverage, ROOT } from '../server/benchmark-ledger.js';

const args=process.argv.slice(2);
let jobsDir=null;
if(args.length){
  if(args.length!==2||args[0]!=='--jobs-dir')
    throw new Error('Usage: node scripts/g3-collect-benchmark.mjs [--jobs-dir runtime/data-g2-manual/jobs]');
  const requested=path.resolve(args[1]);
  const runtime=path.join(ROOT,'runtime');
  if(!requested.startsWith(runtime+path.sep))
    throw new Error('Manual job scan must stay inside LOCAL3D gitignored runtime directory');
  jobsDir=requested;
}
const report=await buildBenchmarkCoverage({jobsDir});
const raw=JSON.stringify(report,null,2)+'\n';
const reportFingerprint=createHash('sha256').update(raw).digest('hex').slice(0,16);
const output=jobsDir?
  path.join(ROOT,'runtime','qa','g3','benchmark-coverage-private-'+reportFingerprint+'.json'):
  path.join(ROOT,'docs','evidence','g3','benchmark-coverage.json');
await fs.mkdir(path.dirname(output),{recursive:true});
const prev=await fs.readFile(output,'utf8').catch(e=>{
  if(e.code==='ENOENT')return null;throw e;
});
if(prev!==null&&prev!==raw)
  throw new Error('Benchmark coverage report changed. Do not overwrite without manual review: '+output);
if(prev===null)await fs.writeFile(output,raw,{flag:'wx'});
console.log('G3_COVERAGE_READ_ONLY '+JSON.stringify({
  inputImages:report.fixtureCount,
  fixturesWithRecordedOutputs:report.fixturesWithRecordedOutput,
  previouslyObservedE2EOutputFixtures:report.fixturesWithPreviouslyObservedE2ERun,
  fixturesAwaitingOutput:report.fixturesAwaitingRecordedOutput,
  excludedUnverifiedLocalJobs:report.excludedUnverifiedLocalJobs,
  newGpuExecutions:0,printQualified:false,
  outputPath:output
}));
