import test from 'node:test';
import assert from 'node:assert/strict';
import { createAssetDeliveryBudget, G348AssetDeliveryBusy } from '../server/g348-asset-delivery-budget.js';

test('G348 deterministic reservation model rejects overflow and never leaks capacity', () => {
  let seed = 0x5ea17a1;
  const rand = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0));
  const budget = createAssetDeliveryBudget({ maxActive: 3, maxReservedBytes: 17 });
  const held = [];
  let total = 0;
  for (let step = 0; step < 12000; step++) {
    if (held.length && (rand() % 5 < 2)) {
      const index = rand() % held.length;
      const {bytes, release} = held.splice(index, 1)[0];
      release();
      release(); // duplicate callbacks are expected and must never subtract twice
      total -= bytes;
    } else {
      const bytes = 1 + rand() % 18;
      const expectBusy = held.length >= 3 || total + bytes > 17;
      if (expectBusy) {
        assert.throws(() => budget.reserve(bytes), G348AssetDeliveryBusy);
      } else {
        held.push({bytes, release: budget.reserve(bytes)});
        total += bytes;
      }
    }
    const state = budget.getState();
    assert.equal(state.active, held.length, 'active at step ' + step);
    assert.equal(state.reservedBytes, total, 'bytes at step ' + step);
    assert.ok(state.reservedBytes <= state.maxReservedBytes);
    assert.ok(state.active <= state.maxActive);
  }
  while (held.length) held.pop().release();
  assert.equal(budget.getState().active, 0);
  assert.equal(budget.getState().reservedBytes, 0);
});
