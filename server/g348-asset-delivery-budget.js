/** G3.48 DRAFT: per-createApp fail-fast budget for persisted asset HTTP readback.
 * No changes to cryptographic/NTFS verification, G2 consent or printer gates.
 * This limits simultaneous requested Buffer bytes, NOT RSS/process/native IO.
 */
const MiB = 1024 * 1024;
export const DEFAULT_ASSET_READ_LIMITS = Object.freeze({maxActive: 2, maxReservedBytes: 128 * MiB});
const MAX_SINGLE_ASSET_BYTES = 100 * MiB;

export class G348AssetDeliveryBusy extends Error {
  constructor() { super('Asset readback capacity exhausted'); this.code='G348_ASSET_BUSY'; }
}

export function createAssetDeliveryBudget({maxActive=2,maxReservedBytes=128*MiB}={}) {
  if(!Number.isSafeInteger(maxActive)||maxActive<1||maxActive>32||
     !Number.isSafeInteger(maxReservedBytes)||maxReservedBytes<1||maxReservedBytes>1024*MiB) {
    throw new TypeError('Invalid bounded asset delivery budget');
  }
  let active=0, reservedBytes=0;
  function reserve(bytes) {
    if(!Number.isSafeInteger(bytes)||bytes<1||bytes>MAX_SINGLE_ASSET_BYTES) throw new TypeError('Invalid asset reservation size');
    if(bytes>maxReservedBytes||active>=maxActive||reservedBytes+bytes>maxReservedBytes) {
      throw new G348AssetDeliveryBusy();
    }
    active++;reservedBytes+=bytes;
    let released=false;
    return () => {
      if(released) return;
      released=true;
      active--;reservedBytes-=bytes;
    };
  }
  return Object.freeze({reserve,getState:()=>Object.freeze({active,reservedBytes,maxActive,maxReservedBytes})});
}

/** Sends only fully verified bytes; carries reservation until finish/close. */
export async function deliverBudgetedVerifiedAsset({res,jobDir,asset,method,readVerified,budget}) {
  if(method!=='GET'&&method!=='HEAD')throw new TypeError('Method not allowed');
  if(typeof readVerified!=='function'||!budget||typeof budget.reserve!=='function')throw new TypeError('Missing trusted dependencies');
  const release=budget.reserve(asset?.bytes);
  try {
    const bytes=await readVerified({jobDir,asset});
    if(!Buffer.isBuffer(bytes)||bytes.length!==asset.bytes)throw new TypeError('Verified reader contract mismatch');
    if(res.destroyed){release();return;}
    res.once('finish',release);
    res.once('close',release);
    res.writeHead(200,{
      'Content-Type':asset.mime,'Content-Length':bytes.length,
      'Content-Disposition':'inline','Cache-Control':'no-store',
      'X-Content-Type-Options':'nosniff'
    });
    res.end(method==='HEAD'?undefined:bytes);
  }catch(error){
    release();
    throw error;
  }
}
