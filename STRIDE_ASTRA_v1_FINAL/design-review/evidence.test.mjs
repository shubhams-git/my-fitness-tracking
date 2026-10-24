import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeMass, pacingFact, loadEvidence } from './evidence.mjs';

test('weight observations are chronological; tombstones excluded; no profile start marker inserted', () => {
  const result = summarizeMass({ profile: { startWeight: 90 }, weights: [
    { id: 'b', dateKey: '2026-02-02', kg: 80 },
    { id: 'a', dateKey: '2026-02-01', kg: 81 },
    { id: 'c', dateKey: '2026-02-03', kg: 79, deletedAt: 'deleted' },
  ], sessions: [{ id: 's1' }, { id: 's2', deletedAt: 'deleted' }] });
  assert.equal(result.weights.length, 2);
  assert.equal(result.first.id, 'a');
  assert.equal(result.change, -1);
  assert.equal(result.activeSessions, 1);
});
test('partial split does not count as a full kilometre comparison', () => {
  assert.equal(pacingFact({ splits: [{ distanceKm: 1, paceSeconds: 300 }, { distanceKm: 0.5, paceSeconds: 350 }] }), null);
  assert.equal(pacingFact({ splits: [{ distanceKm: 1, paceSeconds: 300 }, { distanceKm: 1, paceSeconds: 306 }, { distanceKm: 0.5, paceSeconds: 400 }] }).differenceSeconds, 6);
});
test('actual local evidence meets supplied record contracts without leaking raw records', async t => {
  let data;
  try { data = await loadEvidence(new URL('../', import.meta.url)); }
  catch (error) { if (error.code === 'ENOENT') { t.skip('Private reference files are intentionally absent from clean checkouts.'); return; } throw error; }
  assert.equal(data.mass.weights.length, 29);
  assert.equal(data.mass.activeSessions, 4);
  assert.equal(data.mass.deletedSessions, 1);
  assert.equal(data.mass.first.date, '2026-08-03');
  assert.equal(data.mass.first.kg, 104.6);
  assert.equal(data.mass.latest.date, '2026-10-23');
  assert.equal(data.mass.latest.kg, 102.1);
  assert.equal(data.run.splits.at(-1).distanceKm, 0.86);
  assert.equal(data.pacing.differenceSeconds, 6);
  assert.equal(data.sleep, null);
  assert.equal(data.run.heartRate, null);
  assert.equal(data.historicalRun.heartRate, null);
});
