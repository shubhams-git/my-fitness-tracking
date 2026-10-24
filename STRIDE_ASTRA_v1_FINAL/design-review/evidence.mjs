import { readFile } from 'node:fs/promises';

export function summarizeMass(mass) {
  const weights = mass.weights.filter(w => !w.deletedAt).map(w => ({
    id: w.id, date: w.dateKey, kg: w.kg,
  })).sort((a, b) => a.date.localeCompare(b.date));
  if (weights.some(w => !Number.isFinite(w.kg) || w.kg <= 0)) throw new Error('Invalid weight record');
  return {
    weights,
    activeSessions: mass.sessions.filter(s => !s.deletedAt).length,
    deletedSessions: mass.sessions.filter(s => s.deletedAt).length,
    first: weights[0] ?? null,
    latest: weights.at(-1) ?? null,
    change: weights.length > 1 ? Number((weights.at(-1).kg - weights[0].kg).toFixed(1)) : null,
  };
}

export function pacingFact(run) {
  const full = run.splits.filter(s => s.distanceKm === 1);
  if (full.length < 2) return null;
  return { differenceSeconds: Math.abs(full[0].paceSeconds - full[1].paceSeconds),
    sourceIds: full.map(s => s.source), version: 'full-split-difference/v1' };
}

export async function loadEvidence(base) {
  const [mass, selected] = await Promise.all([
    readFile(new URL('private-inputs/mass-backup-2026-10-23.json', base), 'utf8').then(JSON.parse),
    readFile(new URL('private-inputs/design-source-transcription.json', base), 'utf8').then(JSON.parse),
  ]);
  return { mass: summarizeMass(mass), run: selected.run, historicalRun: selected.historicalRun,
    pacing: pacingFact(selected.run), reviewDate: '2026-10-24', sleep: null };
}
