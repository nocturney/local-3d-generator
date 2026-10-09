import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseNvidiaRow, classifyGpu, collectPreflight } from '../scripts/g2-preflight.mjs';

test('GPU monitor parser is strict about numeric fields', () => {
  const parsed=parseNvidiaRow('NVIDIA RTX 4080 SUPER, 16376, 4640, 11400, 40');
  assert.equal(parsed.freeMiB,11400);
  assert.equal(parsed.utilizationPercent,40);
  assert.equal(parseNvidiaRow('bad telemetry'),null);
  assert.equal(parseNvidiaRow('GPU, no, 20, 0, 0'),null);
});
test('shared GPU cannot be silently authorized', () => {
  const busy=classifyGpu({freeMiB:12000,utilizationPercent:40});
  assert.equal(busy.state,'SHARED_OR_INSUFFICIENT');
  assert.ok(busy.notes.some(x=>x.includes('other software')));
  const low=classifyGpu({freeMiB:1000,utilizationPercent:1});
  assert.equal(low.state,'SHARED_OR_INSUFFICIENT');
  const idle=classifyGpu({freeMiB:12000,utilizationPercent:0});
  assert.equal(idle.state,'HEADROOM_POSSIBLE');
});
test('even an apparently free GPU is not approval to install or execute a provider', async () => {
  const report=await collectPreflight(false);
  assert.equal(report.mode,'READ_ONLY_NO_INFERENCE');
  assert.equal(report.approval,'LIMITED_PILOT_APPROVED_NOT_STANDING');
  assert.equal(report.readiness,'BLOCKED_FOR_UNATTENDED_INFERENCE');
  assert.ok(report.blockers.includes('UNATTENDED_INFERENCE_NOT_AUTHORIZED'));
  assert.equal(report.sourceLock.weightsBytes,1677246742);
});
