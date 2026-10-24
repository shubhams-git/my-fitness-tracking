import { Temporal } from '@js-temporal/polyfill';
import { createHash, randomUUID } from 'node:crypto';

export const ZONE = 'Australia/Melbourne';
export const id = () => randomUUID();
export const digest = value => createHash('sha256').update(typeof value === 'string' || Buffer.isBuffer(value) ? value : JSON.stringify(value)).digest('hex');
export class InputError extends Error { constructor(message, status = 400, extra = {}) { super(message); this.status = status; this.extra = extra; } }
export function requireThat(condition, message, status = 400) { if (!condition) throw new InputError(message, status); }
export const text = (value, max = 10000) => { requireThat(value == null || typeof value === 'string', 'Text must be a string.'); const s = value ?? ''; requireThat(s.length <= max, `Text must be at most ${max} characters.`); return s; };
export function number(value, min, max, label, optional = true) {
  if (value === '' || value == null) { requireThat(optional, `${label} is required.`); return null; }
  const n = Number(value); requireThat(Number.isFinite(n) && n >= min && n <= max, `${label} must be between ${min} and ${max}.`); return n;
}
export function day(value) { try { requireThat(/^\d{4}-\d{2}-\d{2}$/.test(value), 'Use a valid date.'); return Temporal.PlainDate.from(value).toString(); } catch { throw new InputError('Use a valid calendar date.'); } }
export function localDay(instant, zone = ZONE) { return Temporal.Instant.from(instant).toZonedDateTimeISO(zone).toPlainDate().toString(); }
export function localClock(instant, zone = ZONE) { const d = Temporal.Instant.from(instant).toZonedDateTimeISO(zone); return d.hour * 60 + d.minute; }
export const today = () => localDay(new Date().toISOString());
export function shiftDay(value, days) { return Temporal.PlainDate.from(value).add({ days }).toString(); }
export function localInstant(value, zone = ZONE, disambiguation = 'reject') {
  try { return Temporal.PlainDateTime.from(value).toZonedDateTime(zone, { disambiguation }).toInstant().toString(); }
  catch { throw new InputError('That local time is invalid or repeats during daylight saving. Choose the earlier/later occurrence if the clock repeats.'); }
}
export function instant(value) {
  if (value == null || value === '') return null;
  try { return Temporal.Instant.from(value).toString(); } catch { throw new InputError('A timestamp must include its UTC offset.'); }
}
export function normalizeActivity(input) {
  const type = ['run', 'strength', 'cardio', 'other'].includes(input.type) ? input.type : 'run';
  const start = input.startLocal ? localInstant(input.startLocal, input.timezone || ZONE, input.disambiguation || 'reject') : instant(input.start);
  const date = start ? localDay(start, input.timezone || ZONE) : day(input.date);
  const distanceKm = number(input.distanceKm, 0.001, 1000, 'Distance');
  const movingSeconds = number(input.movingSeconds, 1, 604800, 'Duration');
  const reportedPaceSeconds = number(input.reportedPaceSeconds, 1, 7200, 'Pace');
  const title = text(input.title, 160).trim() || ({run:'Run',strength:'Strength session',cardio:'Cardio session',other:'Activity'})[type];
  requireThat(Array.isArray(input.splits ?? []), 'Splits must be a list.');
  const splits = (input.splits || []).map(s => ({ ...s, distanceKm: number(s.distanceKm, .001, 1000, 'Split distance', false), paceSeconds: number(s.paceSeconds, 1, 7200, 'Split pace'), durationSeconds: number(s.durationSeconds, 0, 604800, 'Split duration') }));
  requireThat(Array.isArray(input.sets ?? []), 'Sets must be a list.');
  return { ...input, id: text(input.id || id(), 200), type, date, start, timePrecision: start ? 'instant' : 'date', timezone: input.timezone || ZONE,
    title, distanceKm, movingSeconds, reportedPaceSeconds,
    derivedPaceSeconds: !reportedPaceSeconds && distanceKm && movingSeconds ? movingSeconds / distanceKm : null,
    heartRate: number(input.heartRate || null, 1, 260, 'Heart rate'), cadence: number(input.cadence || null, 1, 300, 'Cadence'),
    elevationGainM: number(input.elevationGainM, 0, 30000, 'Ascent'), steps: number(input.steps, 0, 1000000, 'Steps'),
    note: text(input.note), splits, provider: text(input.provider || 'Manual', 60),
    sets: (input.sets || []).map(s => ({ exercise: text(s.exercise,100), reps: number(s.reps,1,1000,'Reps'), kg: number(s.kg,0,1000,'Load'), sets: number(s.sets,1,100,'Sets') })),
  };
}
export function normalizeFeedback(input, type = 'run', draft = false) {
  const oneOf = (value, values, name, required = true) => { if (value == null || value === '') { requireThat(draft || !required, `Choose ${name}.`); return null; } requireThat(values.includes(value), `Choose a valid ${name}.`); return value; };
  const effort = number(input.effort, 1, 10, 'Effort', draft); requireThat(effort === null || Number.isInteger(effort), 'Effort must be a whole number.');
  const result = { effort, note: text(input.note), legs: oneOf(input.legs, ['normal','gym','work','other'], 'leg context', false),
    discomfort: oneOf(input.discomfort, ['none','mild','affected'], 'discomfort'),
    location: oneOf(input.location, ['shin','knee','foot','other'], 'location', false),
  };
  if (result.discomfort === 'none') result.location = null;
  if (type === 'run') Object.assign(result, { talk: oneOf(input.talk, ['full','short','barely'], 'talking comfort'), reserve: oneOf(input.reserve, ['plenty','some','none'], 'finish reserve') });
  else result.completion = oneOf(input.completion, ['complete','partial','changed'], 'completion');
  return result;
}
export function normalizeSleep(input) {
  const zone = input.timezone || ZONE;
  const start = input.startLocal ? localInstant(input.startLocal, zone, input.disambiguation || 'reject') : instant(input.start);
  const end = input.endLocal ? localInstant(input.endLocal, zone, input.disambiguation || 'reject') : instant(input.end);
  requireThat(Boolean(start) === Boolean(end), 'Enter both sleep start and wake time, or neither.');
  const intervalMinutes = start && end ? (Date.parse(end) - Date.parse(start)) / 60000 : null;
  requireThat(intervalMinutes === null || (intervalMinutes > 0 && intervalMinutes <= 2160), 'Wake time must follow sleep start by no more than 36 hours.');
  const durationMinutes = number(input.durationMinutes, 0, 2160, 'Sleep duration');
  const rest = input.rest || null; requireThat(rest === null || ['rested','okay','drained'].includes(rest), 'Choose a valid restedness.');
  const note = text(input.note);
  requireThat(start || durationMinutes !== null || rest || note.trim(), 'Add a time, duration, restedness or note.');
  return { ...input, id: input.id || id(), type: input.type === 'nap' ? 'nap' : 'night', start, end, timezone: zone,
    date: end ? localDay(end, zone) : day(input.date), providerDate: input.providerDate || null, intervalMinutes,
    durationMinutes: durationMinutes ?? intervalMinutes, durationOrigin: durationMinutes !== null ? (input.durationOrigin || 'self-reported') : intervalMinutes !== null ? 'elapsed interval' : null,
    rest, note, score: number(input.score,0,100,'Sleep score'), hrv: number(input.hrv || null,1,500,'HRV'), heartRate: number(input.heartRate || null,1,260,'Overnight heart rate'),
    provider: input.provider || 'Manual', stages: input.stages || [],
  };
}
export function clockSpread(values) { if (values.length < 2) return null; const a = values.map(v => ((v % 1440) + 1440) % 1440).sort((x,y)=>x-y); const gaps=a.map((v,i)=>i===a.length-1?a[0]+1440-v:a[i+1]-v); return 1440-Math.max(...gaps); }
export const median = values => { if (!values.length) return null; const a=[...values].sort((x,y)=>x-y), m=Math.floor(a.length/2); return a.length%2?a[m]:(a[m-1]+a[m])/2; };
export function precedingSleep(activity, nights) { if (!activity.start) return null; return nights.filter(n=>n.type==='night'&&n.end&&Date.parse(n.end)<=Date.parse(activity.start)&&Date.parse(activity.start)-Date.parse(n.end)<=36*3600000).sort((a,b)=>b.end.localeCompare(a.end))[0]||null; }
export function sleepSummary(nights, endDate = today(), days = 7) {
  const start=shiftDay(endDate,1-days), all=nights.filter(n=>n.type==='night'&&!n.deleted&&n.date>=start&&n.date<=endDate),counts=new Map();for(const n of all)counts.set(n.date,(counts.get(n.date)||0)+1);
  const window=all.filter(n=>counts.get(n.date)===1), measured=window.filter(n=>Number.isFinite(n.durationMinutes));
  return {days, recordedNights:new Set(measured.map(n=>n.date)).size, ambiguousDates:[...counts].filter(([,count])=>count>1).map(([date])=>date),episodes:measured.length, medianMinutes:median(measured.map(n=>n.durationMinutes)),start,end:endDate,bedSpread:clockSpread(window.filter(n=>n.start).map(n=>localClock(n.start,n.timezone))), wakeSpread:clockSpread(window.filter(n=>n.end).map(n=>n.end&&localClock(n.end,n.timezone)))};
}
export function activityMatch(a,b) {
  if (a.type!==b.type || !a.start || !b.start || !a.distanceKm || !b.distanceKm || !a.movingSeconds || !b.movingSeconds) return null;
  const time=Math.abs(Date.parse(a.start)-Date.parse(b.start))/1000, dist=Math.abs(a.distanceKm-b.distanceKm)/Math.max(a.distanceKm,b.distanceKm), duration=Math.abs(a.movingSeconds-b.movingSeconds);
  if (time<=5 && dist<=.01 && duration<=5) return 'exact-timing';
  if (time<=120 && dist<=.03 && duration<=120) return 'review';
  return null;
}
