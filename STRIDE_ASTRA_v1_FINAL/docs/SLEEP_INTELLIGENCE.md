# Sleep intelligence | First-class functional specification

## Priority and design philosophy

Sleep is a flagship STRIDE capability, equal to running. Sleep should produce observations worth reading even on non-running days. The first priority is **what actually happened and whether patterns are changing**; second is **how those patterns relate to training**, with scientific calibration. A high sleep score is not a moral grade, and a low score is not a medical diagnosis. Avoid pushing the user into tracking obsession or alarm from normal nightly variation.

**Hardware baseline:** Garmin Forerunner 255. The Garmin 255 and 265 manuals document sleep duration, timing/stages, movement, sleep score, sleep coaching and naps; HRV status is supported, with related daily wellness data. Both support optional overnight Pulse Ox. Features vary by firmware and setup. A watch showing a value does **not** guarantee the exact value appears in the Garmin Personal API. Record real endpoint/field availability during integration, and fall back to manual export or local data entry where sensible. The 265's Training Readiness is optional, not a core dependency. Do not recommend watch purchase solely on unverified proprietary sleep metrics.

## Sensor fields and interpretive value

### Level A: primary, generally most useful

- Sleep onset/start and final waking/end timestamps, local time zone, **wake-date attribution**, total estimated sleep time and estimated time awake.
- User-desired sleep duration as an adjustable comparison target; report **shortfall to chosen target**, not 'physiological sleep debt' without support.
- Bed/wake timing variability; sleep midpoint and timing consistency; moving 7/14/28-day trends when coverage sufficient.
- Distinguish no night recorded (missing/wearing issue) from zero hours of sleep.
- Optional subjective restedness and short note for user corrections/context.
- Naps as independent intervals/records and optionally their contribution to day-level sleep totals, without automatically reclassifying whole nights.

### Level B: meaningful watch-generated context, when accessible

- Garmin Sleep Score (0–100) labeled as **Garmin's device estimate**; trend and agreement/disagreement with user-perceived rest.
- Estimated sleep stages (light, deep, REM, awake), stage intervals and aggregate durations; sleep continuity/awakenings as available. Prioritize **timing and broad trends**, not precise REM/deep percentages or rigid targets.
- Overnight HRV readings/status and deviations from a personal baseline; baseline-building period before ranking as anomalous.
- Overnight resting/average/min HR where exact meaning is known; day-level resting HR separately.
- Stress/Body Battery movement and respiratory rate overnight where available; keep Garmin's proprietary values labeled rather than reinventing their algorithms.
- Pulse Ox / SpO2 only if user has enabled it, device provides it, quality is adequate, and access is verified; no inference about apnea or clinical oxygenation from consumer-device readings.

### Level C: optional or newer-watch-dependent

- Additional proprietary Garmin Sleep Coach, skin-temperature variations, advanced breathing measurements, Training Readiness, or related physiology **only after payload + model support proven**. Do not require them for Forerunner 255 acceptance.

## Core analyses (no medical overreach)

1. **Duration history:** days and nights of sleep, weekly median, trend, frequency below self-chosen target and meaningful changes relative to the individual's established baseline. Report collection coverage.
2. **Timing regularity:** variance/circular statistics for bed/wake time and midpoint. Handle 23:50 vs 00:10 as 20 minutes apart rather than 23h40 apart. Do not penalize intentionally irregular sleep after a shift without contextual reporting.
3. **Continuity:** estimated awakenings/awake time when reliable; prevent false precision by keeping user-facing narrative broad.
4. **Sleep score vs felt rest:** when both signals exist, notice agreement or mismatch without asserting watch or person is 'wrong'.
5. **Overnight HR/HRV drift:** trends from suitable baseline windows; user is shown actual Garmin values and a personal baseline, not an invented readiness index. Early baseline should not be marked as abnormal.
6. **Sleep before a run:** associate the preceding sleep period by its **wake timestamp** and run start; compare runs of similar intensity, route/distance and available context. When unmatched, say 'preceding-night sleep' without attributing a causal effect.
7. **Run/gym effects on subsequent sleep:** on days with sufficient history, examine associations with training timing, duration and RPE. Account for late-night sessions and 24–36h sequencing, not same calendar date alone.
8. **Longer recovery stories:** multi-week regularity versus subjective energy and running endurance; rank only when meaningful, supported by enough data and free of confounding overstatement.
9. **Small earned delights:** unusual consistent bedtimes, an extra hour slept vs recent median, a reassuring stable trend despite noisy scores; do not manufacture novelty daily.

## Sleep-related example language (only if supported)

- 'Your bedtime moved around this week. Your wake-up time barely did.'
- 'Three of the last four nights were shorter than the amount you aim for.'
- 'You slept longer before both of your easiest runs this month. Interesting, though it's still a small sample.'
- 'Last night was short, and today's run felt harder than your usual easy runs.'
- 'The watch scored this night poorly, but you woke feeling rested. That's worth keeping alongside the number.'
- 'Your resting heart rate was above its recent baseline for three mornings. Take note of the pattern, not one isolated reading.'

Avoid 'Sleep debt caused injury', 'you were in optimal REM', 'your oxygen proves sleep apnea', 'run today because the algorithm cleared you', or 'your heart rate says you're sick'.

## Overnight temporal and data semantics

- Save raw start/end as UTC instants with source timezone, and compute `local_start_date`, **`local_wake_date`**, local sleep interval and local day mapping in `Australia/Melbourne`. Preserve provider's original attribution too.
- A night beginning 23 Oct 23:30 and ending 24 Oct 07:00 belongs primarily to **the morning of Oct 24**, but remains viewable from a calendar night label. Late/overnight work can invert expected timing; do not force 22:00–08:00 assumptions.
- Handle daylight saving gaps/overlaps in Melbourne; elapsed sleep minutes from UTC, not naive wall-clock subtraction. Calendar 'yesterday' depends on wake time, not bedtime.
- If multiple recorded segments occur in a day, preserve them and let reviewed primary-sleep vs nap classifications coexist with raw source types. Corrections should never delete raw provider records.
- Garmin's total sleep, stage-summed duration and interval-derived numbers may disagree due to device algorithms. Display the native reported total as reported; do not silently rewrite it to stage totals or claim all numbers are equal.
- Garmin can revise nights on subsequent syncs; upsert by stable provider ID/date and preserve revision/import history as needed. Null absent fields, **never zeros masquerading as measurements**.
- A sleep episode attached to a morning is only associated with later workouts after its actual end; a run before an afternoon sleep episode cannot be associated with that later sleep as 'preceding night'.

## Morning log

Keep it opt-in, usually <=5 sec without note: 'How rested do you feel?' = Rested / So-so / Drained; optional reason/note or manual sleep-time override. Editable later. No compulsory rating every morning. Do not add more than one default question before demonstrating a measurable benefit from extra signals. Respect missed entries without guilt prompts.

## Data availability gating and quality

Show trends when actual coverage is sufficient. A 7-night average with 2 recorded nights must not look like a fully observed week. Require a plausible source duration and validation of start/end order. Label stage percentages as device estimates and suppress improbable or incomplete data. Do not graph absent HRV as 0. Avoid charts built from made-up nights before the watch arrives; opt-in manually entered timing can populate duration/regularity, not stages. Consider watch wearing adherence and sync gaps.

## Precision and health boundaries

Garmin's wearable sleep stage classification is approximate. Consumer watches cannot diagnose apnea or determine the clinical significance of individual oxygen dips. No app-generated medical/physiological verdict, automatic restriction on exercise, or assertion that subjective tiredness results from a particular sleep stage. Relevant symptoms warrant medical assessment independently of the watch; keep such guidance concise and context-dependent, not repetitive on every screen. Favor longitudinal trends and correspondence with subjective notes.

## Sleep acceptance examples

- 23:40–06:40 sleep spanning midnight is one episode attributed to local wake date. The running app correctly finds it for a 10:00 run after waking.
- Saturday evening 20:00–Sunday 03:00 may be intentionally normal; app does not call it 'bedtime error'.
- DST transition correctly gives elapsed physical duration even if local clock jumps. Two local times around midnight are compared circularly.
- A nap recorded 14:00–14:30 does not replace the 00:00–07:00 primary sleep or generate a second 'night'.
- 0 returned sleep HR or omitted HRV is represented as unavailable, not a health anomaly.
- Garmin score 62 with self-reported 'rested' is described as disagreement, not declared false.
- A sleep-stage chart labels periods as *estimated*; timeline curves/segments do not imply second-by-second clinical accuracy.
- Imported sleep records for the same Garmin night get updated rather than duplicated.

## Source docs

- Garmin FR255 sleep tracking: https://www8.garmin.com/manuals/webhelp/GUID-676967A0-1B23-4384-9BC9-76F3D643F1C8/EN-GB/GUID-70D41BFB-2BB2-4933-BF95-47FF63140112.html
- Garmin FR265 sleep tracking: https://www8.garmin.com/manuals/webhelp/GUID-F41EAFB3-6CC9-42DE-9C6C-9E358DBB0671/EN-US/GUID-70D41BFB-2BB2-4933-BF95-47FF63140112.html
- Garmin Sleep Tracking support: https://support.garmin.com/en-US/?faq=mBRMf4ks7XAQ03qtsbI8J6
- Garmin technology and limitations: https://www.garmin.com/en-XD/garmin-technology/health-science/sleep-tracking/
- Personal API / sleep endpoints: https://developer.garmin.com/gc-developer-program/personal/swagger-docs/
