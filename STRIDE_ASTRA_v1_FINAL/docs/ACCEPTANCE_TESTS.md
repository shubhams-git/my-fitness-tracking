# Quality gates and acceptance fixtures

Automate wherever practical. Keep fixture provenance explicit. **Do not commit uploaded raw personal data or identifiable GPS traces**; test inside ignored local directories and create sanitized nonidentifiable test fixtures for CI.

## Source data fixtures

| Case | Expected outcome |
|---|---|
| MASS full `private-inputs/mass-backup-2026-10-23.json` | 29 weight records; four active gym/cardio sessions; one deleted/tombstoned session ignored. Reimport does not increase counts. |
| MASS first available reading | 2026-08-03 104.6 kg. Configured start marker Aug 6 = 105.6 kg, not synonymous with first reading. Latest 2026-10-23 102.1 kg. |
| Nike screenshot, 4 Oct | 2.19 km, run time 13:45, elapsed 13:46, displayed pace 6:16/km, cadence 158, reported RPE 7 hard, 16m climb/14m descent. Last 0.19 km is partial, not a full kilometre. HR shown '0' = **missing sensor**, not 0 bpm. |
| Strava screenshot, 23 Oct | 2.86 km / 21:20 / displayed pace 7:27/km, +19m, 3,230 steps, splits 7:24, 7:30, last 0.86 km at 7:24/km, user's optional note present. Distance/time division from rounded values differs slightly; preserve displayed reported pace if no higher-precision stream. |
| Unknown Nike prior run | Save even with just date, distance and reported time; missing splits/cadence/HR remain null, no fabricated insight. |
| Duplicated Strava + Garmin run | One physical workout, one contribution to weekly totals, two provider aliases. Manual split/merge if ambiguous. |
| Same archive twice | Import is idempotent; progress and source audit show that records were matched/updated. |
| Original GPS stream absent | No fabricated map route or detailed pace waveform. |
| Race or activity straddling midnight | Local calendar label and UTC duration are preserved, correctly aligned to Melbourne timezone/DST. |

## Check-in fixtures

- Four core run answers require four simple selections and Save; no compulsory free text, no default 'no discomfort', no fake RPE. On actual iPhone / real-world simulation, median of a small interaction test should be <=45 sec.
- Optional notes: multiline input, emoji, long text, keyboard opening, edit, app refresh, sync conflict and full backup/export round-trip.
- Conditional discomfort location appears if discomfort flagged; absence of location doesn't invent injury type. Strength workout form differs appropriately.
- A user can correct a report after saving and see insights update/recompute, including an old insight losing validity.
- If an offline write is queued, show clear status; after reconnect, no duplicate feedback.

## Sleep-specific edge cases and intelligence checks

1. **Cross midnight:** 2026-10-23 23:40–2026-10-24 06:40 Australia/Melbourne is attributed to local wake date Oct 24; correct seven-hour true interval. Associated with 10am Oct 24 run as preceding sleep.
2. **Daylight saving:** test spring-forward Oct 4, 2026 in Melbourne (local 02:00 jumps to 03:00) and autumn fall-back e.g. Apr 5, 2026; compute real elapsed duration from UTC rather than naive wall-clock difference. Also test bedtime comparison near 23:50 and 00:10; circular clock difference is 20 minutes.
3. **Overnight / irregular schedule:** sleeping 08:00–15:00 after work is not rejected or called impossible; local wake date and preceding/succeeding exercise mapping correct.
4. **Nap:** 14:00–14:30 nap does not replace 23:00–06:30 primary sleep or count as an extra night; day-level nap totals are separately retrievable.
5. **Stages vs total:** native total sleep duration may differ from sum of reported stages; preserve native values and identify source, do not silently force equality.
6. **Missing HRV or SpO2:** null and no trend point. No 0 bpm line; no health alarm.
7. **Device scores:** Garmin Sleep Score 62 with subjective 'rested' yields observation of mismatch, no insistence one is false. Provider Training Readiness only if actually returned; never reverse-engineered as Garmin's proprietary score.
8. **No watch:** a beautiful informative Sleep empty state; optional manual timing/restedness possible; cannot show stage timeline or nightly HRV. No fake/demo metrics on personal screens.
9. **Inadequate coverage:** two actual nights in a 7-day calendar week cannot be summarized as a complete 7-night average. If denominator shown, accurate recorded nights and missingness displayed.
10. **Update night:** re-fetch of same Garmin sleep episode revises rather than duplicates it. User note stays linked.
11. **Causal language:** tiny 2-night association never produces 'sleep caused faster run'; no sleep apnea diagnosis from blood-oxygen estimates.
12. **Preceding night identity:** run at 05:00 before 08:00–15:00 sleep cannot take that later sleep as its precursor.
13. **Time-precision:** an HRV status over a night is not equivalent to per-second HRV samples; app must label exact provider metric.

## Insight science fixtures

- Oct 4 vs Oct 23 comparisons distinguish hard faster run vs longer easy run; do not claim physiological VO2 breakthrough without HR data.
- No 'tonnes of impact saved' or precise pace bonus from 3.5 kg weight reduction.
- No '151 cadence is unsafe' prescription, arbitrary cadence floor or overstriding diagnosis.
- No heart-rate drift computed from RPE and split times alone. With missing HR fields, meaningful but limited pacing narrative allowed.
- No 'cleared for next week's distance jump' simply because last run was pain-free.
- Correct evidence references for numerical statements; changing source data updates invalid insight; suppress stale repetition and bad comparisons.
- Sleep and run insights are both eligible on rest days/after new nights, with ranking grounded in user interest and evidence.

## Visual / engineering / security

- Rendered browser screenshots examined for Today, Activity, Sleep (pre-watch and with synthetic watch fixture), Plan, Explore, check-in with keyboard, empty state and sync failure; responsive narrow screens and desktop.
- Actual iPhone Safari tested if accessible; otherwise record this as an unverified real-device requirement rather than claiming pass from desktop emulation.
- Accessible text, focus, controls, screenreader labels and reduced-motion mode. Charts have useful accessible equivalents and accurate scales.
- Authenticate private routes/API endpoints and file downloads; protect Garmin key and Strava tokens server-side; `.gitignore` covers raw personal data and envs. No user location/health data in error telemetry or public screenshots.
- API expiry: Garmin personal key possible 30/90/180 days/1y, token only 24h, no refresh token; ensure token recreation and user-visible expiration. Error states and backoff tested.
- Backups cover observations, raw source references, check-ins, notes, sleep episode timing and edits. Confirm restore round trip in an isolated environment.
- CI tests don't rely on personal API keys, live Garmin or Strava accounts; use sanitized fixtures. Label live integrations 'untested' until genuinely verified.
