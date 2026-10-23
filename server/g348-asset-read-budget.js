/** G3.48: admission budget for SHA-verifying and sending persisted HTTP assets.
 * G3.47 verifies a complete GLB before the first response byte; each active
 * request can retain up to 100 MiB. Reserve declared bytes BEFORE opening it
 * and retain the reservation until verification and response completion.
 * Process-local only, deliberately no waiting queue or second scheduler.
 */
const MiB = 1024 * 1024;
export const MAX_SINGLE_ASSET_BYTES = 100 * MiB;
export const MAX_ACTIVE_ASSET_BYTES = 128 * MiB;
export const MAX_ACTIVE_ASSET_READS = 2;

export function createAssetReadBudget({
  maxBytes = MAX_ACTIVE_ASSET_BYTES,
  maxReads = MAX_ACTIVE_ASSET_READS
} = {}) {
  // Test-only smaller bounds are permitted; no caller may relax production caps.
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 1 || maxBytes > MAX_ACTIVE_ASSET_BYTES ||
      !Number.isSafeInteger(maxReads) || maxReads < 1 || maxReads > MAX_ACTIVE_ASSET_READS) {
    throw new RangeError('Invalid asset budget bounds');
  }
  let occupiedBytes = 0;
  let occupiedReads = 0;
  function reserve(bytes) {
    if (!Number.isSafeInteger(bytes) || bytes < 1 || bytes > MAX_SINGLE_ASSET_BYTES) {
      throw new RangeError('Invalid declared asset length');
    }
    if (occupiedReads >= maxReads || bytes > maxBytes - occupiedBytes) return null;
    occupiedBytes += bytes;
    occupiedReads++;
    let held = true;
    return () => {
      if (!held) return;
      held = false;
      occupiedBytes -= bytes;
      occupiedReads--;
    };
  }
  return Object.freeze({ reserve });
}
