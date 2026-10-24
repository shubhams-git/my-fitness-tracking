# Data sources, integration contracts and security

This is a product-level integration contract, **not** a compulsory database schema. Engineering agent chooses tables, APIs and import libraries and explains material trade-offs. The primary purpose is retaining fidelity, cross-source identity and graceful partial data.

## Phased data topology

**Now, without a watch:** Strava free-tier export and any uploaded FIT/TCX/GPX originals -> canonical running activities. Historic Nike screenshot/manual entry -> canonical activity. MASS JSON -> weight and gym records. Optional manual sleep timestamps/restedness -> sleep observations. Workout plan structured export (when available) -> versioned planned sessions. Feedback -> the relevant workout/sleep record. All remain exportable.

**Later with Garmin:** Garmin watch syncs to Garmin Connect, then private Garmin Personal API and native FIT activity files feed full activity/wellness/sleep records. Garmin may also push a copy of a run to Strava. These are source aliases for the **same** session, not separate runs. Strava remains socially useful but not mandatory for the app's own analysis.

## Source precedence and provenance

For each measurement know: `source_provider`, `external_id`, source timestamp/timezone, `reported_value`, `unit`, `is_derived`, derivation definition/version, source precision, ingestion timestamp/revision, and missingness/quality state. Never overwrite original data because an imported display screenshot rounded it differently. Favor original FIT/structured stream for time-series analysis, Garmin/Strava reported summary for official provider display numbers, user entries for subjective information. Conflicts may be surfaced and resolved per metric; don't globally prefer one provider for every field.

### Identity matching

Deduplicate by exact provider external IDs and original file hashes first, then use a controlled probable-match step based on compatible activity timestamps, duration, distance and route where present. If unsure, ask for a one-time manual merge/unmerge review. Preserve all source aliases, especially Garmin -> Strava reposts. Use same principle for daily sleep records receiving corrections or re-syncs; primary sleep and nap are separate types. Historical imported/manual entries may have only date-level precision and should not be merged casually.

### Modeling concepts

- **Person/profile** single private owner, settings and units; no public multi-user scope.
- **Activity** identity, type, actual UTC timing and local timezone, activity-specific metrics, provenance aliases, linked plan occurrence, optional gear and all related streams. Valid types include running, strength, cardio/other.
- **Activity stream** raw and/or indexed samples (time/distance/pace/HR/cadence/elevation/power/GPS) where recorded, preserving sampling resolution.
- **Feedback** activity association, typed exertion/talk/pain/finish and optional notes with creation/edit history. Null means unanswered.
- **Sleep episode** stable source identity, true start/end, local wake date, native duration/score/stage estimates, associated naps, quality/provenance, revisions.
- **Daily wellness / recovery** HRV, resting and overnight HR, stress, Body Battery, respiration, steps, weight, Pulse Ox and device scores where available. Keep daily summaries and point measurements distinct.
- **Plan version / occurrence** prescribed workout at a date/time, target type, intensity and volume/strength prescription, user modifications, linked activities.
- **Gear** name, category, date acquired, mileage/usage and notes (don't assume the user wore a shoe unless declared).
- **Source import, data quality and evidence** repeatable ingestion audit, warnings, timestamps, hashes and stable supporting source references for generated insights.

## Garmin Personal API: implementation facts

Official personal-use API is for an individual's own Garmin Connect data. Obtain a **personal API key from Garmin Connect Web**. As documented in October 2026, key expirations are selectable **30 / 90 / 180 days or 1 year**. The key generates OAuth2 access tokens; these are valid **24 hours** or until key expiry, whichever earlier. **No refresh tokens**: obtain a new access token using the key when necessary. Protect key and tokens server-side, never in client JavaScript, static bundles, GitHub or chat transcripts. Provide a user-visible expiry/reconnect state and appropriate error handling. Do not assume instant sync before Garmin Connect receives watch data.

Official Swagger lists endpoints including `sleep-service/sleep/dailySleep`, `sleep-service/sleep/dailySleepSummariesByDate`, `hrv-service/hrv/{calendarDate}`, HRV date ranges, user daily summaries, step/stress data, and activity services. Examine actual response payloads when the watch exists; documentation of an endpoint does not prove all Garmin Connect fields are returned for the specific watch. Test pagination, range backfill, latest data and changed-record updates. Avoid high-frequency polling. FIT import remains an offline escape hatch, especially for detailed run streams.

Sources: https://developer.garmin.com/gc-developer-program/personal/personal-api/ ; https://developer.garmin.com/gc-developer-program/personal/personal-faq/ ; https://developer.garmin.com/gc-developer-program/personal/swagger-docs/

## Forerunner 255 baseline requirements

Activity distance, elapsed/moving duration, pace and splits, route/elevation when present, recorded heart-rate stream, cadence and supported running power. Data availability of dynamics (vertical oscillation, GCT, etc.) varies by watch/firmware and possible accessory; never gate basic app function on these. Sleep duration/estimated stages/score, sleep timing, sleep coach/naps where supported; overnight wellness context including HRV status, HR, stress, Body Battery, respiration and Pulse Ox when enabled/available. A 265 or higher adds data gracefully, rather than requiring a separate architecture. Garmin's Training Readiness is device-specific, not a fabricated computation.

Sleep is detailed in `SLEEP_INTELLIGENCE.md` including cross-midnight and timezone rules.

## Strava free tier and optional OAuth

New Strava developer app creation **requires an active Strava subscription** per official Getting Started guide checked 24 Oct 2026. This is distinct from whether an existing authorized app continues working after subscription cancellation; **do not claim continued access is guaranteed**. Never purchase a subscription or create third-party API apps without user's action. A one-month subscription can be an optional experiment, but the core system must remain functional with a free-tier Strava **account archive**, and later with Garmin as primary. Strava's default app rate limits are 200 requests/15 min and 2,000/day overall, plus 100/15 min and 1,000/day for non-upload endpoints. For one user these are manageable but require error handling and provenance checks. If OAuth implemented, use least required scopes, secure token management and webhook or carefully limited pull strategy according to terms.

Sources: https://developers.strava.com/docs/getting-started/ ; https://developers.strava.com/docs/reference/ ; https://developers.strava.com/docs/rate-limits/ ; https://support.strava.com/en-us/articles/15401919-how-do-i-export-my-strava-data

## MASS source contract

Uploaded `private-inputs/mass-backup-2026-10-23.json` is the primary ground-truth initial import: `profile`, `weights`, `sessions`, `measurements`, `nutrition`, `wellness`. Exactly 29 weight records and four nondeleted gym/cardio records, plus at least one session with `deletedAt` that should be ignored. Preserve original date identifiers and `id` field. `startWeight:105.6` on Aug 6 is the app's configured starting marker, not necessarily the first observed weight. `0` or missing values in incomplete wellness logs are not proof of zero sleep or hydration. If user updates MASS later, repeated uploads should perform stable upserts and preserve edits.

Do not assume a programmatic endpoint or ability to modify the hosted MASS app merely because its URL is reachable. Shared storage requires actual source access and the user's approval.

## Workout plan

Reference https://symphonious-kitsune-3c1793.netlify.app/ is a rendered app whose full structured exercise prescriptions were not retrieved through the public HTML snapshot. Do not treat Gemini's text describing 6-week schedule as authoritative. If structured plan JSON/source provided later, create versioned occurrences; in interim, link to existing plan and allow lightweight scheduled-session entry. Avoid writing a duplicate complex trainer from scratch unless useful.

## Security/privacy/nonfunctional

- Personal sleep, weight, health markers, notes and GPS traces are sensitive. Private one-user authentication and authorization everywhere, even if the app is not publicly advertised. Never expose server-side keys or raw health data in frontend assets or logs.
- `private-inputs/` and `.env*` are `.gitignore`d. Public fixtures must be synthetic or fully stripped of identifying GPS and personally identifying measurements. Ingest local source data into the user's private deployment/database only with explicit consent.
- Backups and exports must cover raw details, normalized records, notes, sleep intervals and sufficient provenance to reconstruct calculations. Show last successful sync/import and recoverable errors. Store UTC instants and named timezone.
- Do not infer `0 bpm` screenshot values as an observed heartbeat; represent absent HR as null. Do not fabricate HRV, stages or sleep data pre-watch.
- Validate input size, FIT parsing failures, duplicate/reimport and credentials expiry. No quiet loss of uploaded files, no crashes on partial records and no public deploy of real information.
- Aim for low cost and maintainability with a conventional reliable stack, but let Codex choose after examining available tools and design needs.
