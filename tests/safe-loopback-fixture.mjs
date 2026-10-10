/**
 * Deterministic SAFE PORT RANGE for Node fetch-based HTTP test fixtures.
 *
 * Windows may assign an ephemeral port that the WHATWG fetch forbidden-port
 * list rejects even though server.listen(0) succeeded (TypeError bad port).
 * Bind explicitly to a nonprivileged range 20000..29999, retry collisions.
 * Test-only. Never exported/imported by production server or G2 worker.
 */
import {randomInt} from 'node:crypto';

export const SAFE_MIN=20000;
export const SAFE_MAX=30000;
export const MAX_ATTEMPTS=32;

export async function listenFixtureSafePort(server,{nextPort=()=>randomInt(SAFE_MIN,SAFE_MAX)}={}){
  if(!server||typeof server.listen!=='function'||server.listening){
    throw new Error('HTTP test fixture must be a fresh, unbound server');
  }
  for(let attempt=0;attempt<MAX_ATTEMPTS;attempt++){
    const port=nextPort();
    if(!Number.isSafeInteger(port)||port<SAFE_MIN||port>=SAFE_MAX){
      throw new Error('Unsafe test HTTP port out of range');
    }
    try{
      await new Promise((resolve,reject)=>{
        const done=()=>{server.off('error',fail);resolve();};
        const fail=error=>{server.off('listening',done);reject(error);};
        server.once('listening',done);
        server.once('error',fail);
        try{
          server.listen(port,'127.0.0.1');
        }catch(error){
          server.off('listening',done);
          server.off('error',fail);
          reject(error);
        }
      });
      if(server.address()?.port!==port)throw new Error('HTTP test bound unexpected port');
      return port;
    }catch(error){
      if(error?.code==='EADDRINUSE'||error?.code==='EACCES')continue;
      throw error;
    }
  }
  throw new Error('All bounded test fixture loopback port attempts unavailable');
}
