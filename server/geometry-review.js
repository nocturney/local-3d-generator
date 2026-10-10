/**
 * Offline CPU-only G3 geometry audit of an EXISTING, already-approved job GLB.
 * Does not load PyTorch/model weights, allocate CUDA, mutate mesh, or print.
 * The default G1 server does not expose real-job reviews.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';

const execAsync=promisify(execFile);
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const PYTHON=path.join(ROOT,'runtime','engines','triposr','venv','Scripts','python.exe');
const SCRIPT=path.join(ROOT,'engines','quality','geometry_qa.py');
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');

export function createGeometryReviewer(overrides={}){
  const python=overrides.python||PYTHON;
  const script=overrides.script||SCRIPT;
  return async function review({modelFile,outputFile,signal}){
    if(process.platform!=='win32')throw new Error('G3 geometry review qualified only on Windows');
    for(const executable of [python,script]){
      await fs.access(executable).catch(()=>{throw new Error('G3 local CPU environment missing')});
    }
    const model=path.resolve(modelFile),output=path.resolve(outputFile);
    if(path.dirname(output)!==path.dirname(model)||
       path.basename(model)!=='output.glb'||path.basename(output)!=='geometry-qa.json'){
      throw new Error('G3 review paths must be internal, fixed sibling artifacts');
    }
    const stat=await fs.lstat(model);
    if(!stat.isFile()||stat.isSymbolicLink()||stat.size>64*1024*1024)throw new Error('G3 untrusted GLB path');
    const existing=await fs.lstat(output).catch(e=>{if(e.code==='ENOENT')return null;throw e});
    if(existing)throw new Error('G3 report path already occupied');
    const {stdout}=await execAsync(python,[script,'--model',model,'--out',output],{
      timeout:35000,windowsHide:true,signal,maxBuffer:8192,
      env:{...process.env,PYTHONNOUSERSITE:'1',HF_HUB_OFFLINE:'1',TRANSFORMERS_OFFLINE:'1'}
    });
    if(!stdout.includes('G3_GEOMETRY_QA_DRAFT '))throw new Error('G3 scanner did not attest completion');
    const reportStat=await fs.lstat(output);
    if(!reportStat.isFile()||reportStat.isSymbolicLink()||reportStat.size>128*1024){
      throw new Error('G3 report type/size invalid');
    }
    const raw=await fs.readFile(output);
    const report=JSON.parse(raw.toString('utf8'));
    const modelHash=digest(await fs.readFile(model));
    if(report.schema!=='local3d.g3.geometry-qa.v1'||
       report.modelSha256!==modelHash||
       report.classification!=='DRAFT_REQUIRES_HUMAN_REVIEW'||
       report.printQualified!==false||report.approvedForPrinter!==false||
       report.fabricationAction!=='NONE'){
      throw new Error('G3 report provenance/qualification mismatch');
    }
    return {raw,report};
  };
}
