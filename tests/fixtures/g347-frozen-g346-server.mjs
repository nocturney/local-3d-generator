/** G3.47: immutable previous-release server source for historical G3.28-46
 * SHA evidence. Never silently move prior proof baselines to HEAD.
 * Existing repository Git object and exact earlier full commit pinned.
 */
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','..');
export const G346_SERVER_COMMIT='01090f2226cc96f6217836b3ff05cbcb14ac530e';
export const G346_SERVER_SHA256='8d96742aa45c6e815673156cbbfd12d80dc98573676563fa7d1c63d147cc908d';
export const G346_SERVER_RAW_SHA256='b60e8f088a6846de9f6003333c55fad963efbfbc3752885eb9358cfeb9b57759';
const sha=x=>createHash('sha256').update(x).digest('hex');
export function readFrozenG346Server(){
 const buf=execFileSync('git',['-C',root,'show',
  G346_SERVER_COMMIT+':server/index.js'],{maxBuffer:600000,windowsHide:true});
 const norm=Buffer.from(buf.toString('utf8').replace(/\r\n/g,'\n'));
 if(sha(norm)!==G346_SERVER_SHA256)throw Error('Immutable G3.46 server source history drift');
 // Historical Windows read_file() evidence hashed the checked-out CRLF bytes,
 // while Git tags store LF; preserve BOTH exact historical representations.
 const checkout=Buffer.from(buf.toString('utf8').replace(/\r?\n/g,'\r\n'),'utf8');
 if(sha(checkout)!==G346_SERVER_RAW_SHA256)throw Error('Historic Windows checkout bytes drift');
 return checkout;
}
