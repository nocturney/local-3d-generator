/**
 * G3.28 historical proof replay helper.
 *
 * Historical G3.25..G3.27 evidence hashed the Windows CRLF worktree bytes
 * of server/index.js. Git stores the same content in LF. Recover EXACT
 * historical bytes from immutable known ancestor commit; never use current
 * source to revise or silently re-stamp immutable evidence.
 *
 * Pure local read-only 'git show', with fixed commit+path and expected SHA.
 */
import {execFileSync} from 'node:child_process';
import crypto from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export const HISTORICAL_COMMIT='6a40a6d70d123642c53167a36655b4f24d049c9c';
export const HISTORICAL_SERVER_SHA='716a9798a65965d3ac43ba37edd73dab6bdfe6a5412be11ccb84f917acd13646';
export function readHistoricalServerBytes(){
 const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
 const old=execFileSync('git',['-C',root,'show',HISTORICAL_COMMIT+':server/index.js'],{
   maxBuffer:200000,timeout:8000,windowsHide:true
 });
 if(old.length<10000||old.length>150000)throw new Error('G3.28 historic blob wrong size');
 const raw=old.toString('utf8');
 if(raw.includes('\r')||!raw.includes('\n'))throw new Error('G3.28 historic git blob has unexpected line endings');
 const oldWindowsWorktree=Buffer.from(raw.replace(/\n/g,'\r\n'),'utf8');
 const hash=crypto.createHash('sha256').update(oldWindowsWorktree).digest('hex');
 if(hash!==HISTORICAL_SERVER_SHA)throw new Error('G3.28 historical tracked source SHA mismatch');
 return oldWindowsWorktree;
}
