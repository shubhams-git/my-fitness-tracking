# Tempo implementation handover · 24 October 2026

## Decision and working scope

The owner selected **B · Tempo**, retaining a premium feel. The working app uses
its mineral-blue/apricot palette, numerical hierarchy, fine rules and restrained
charts across Today, Sessions, Session Story, Sleep, Explore, Plan and Data &
privacy. Light, dark and system preferences work. All visual assets are local.

The production check-in presents the four questions together, removing the
prototype's extra Next steps. Answers start blank; discomfort location is
conditional; notes remain reachable. Strength uses effort, completion and
discomfort. Drafts use IndexedDB; accepted writes use SQLite. Pending saves
survive reload, replay with idempotency IDs and expose revision conflicts.

## Implemented

- Single-owner authenticated Node/SQLite app at localhost:4318. WAL/FULL durability,
  record revisions, source aliases, preserved raw imports and manual overrides.
- MASS, screenshot transcription, Strava activities.csv/archive, official SDK FIT,
  TCX and GPX imports. Stable source IDs upsert. Cross-source matches use time,
  distance and duration. Uncertain matches stay out of totals pending review.
  Merge undo is guarded against later edits.
- Actual local seed: 29 weights, four active MASS sessions, two selected runs,
  no fabricated sleep or sensors. The deleted MASS session remains excluded.
- Editable sessions, optional gym sets/reps/load, source downloads/caveats,
  revision inspection, archive/recovery and manual historical sessions.
- Sleep start/end, wake dates, DST resolution, separate naps, optional restedness
  and notes, opt-in one-tap morning prompt, 7/14/28-day duration history. Device
  fields remain absent until supplied. Stages are explicitly totals. Overlapping
  main-sleep records are excluded from summary calculations pending reconciliation.
- Raw weight dots and a trailing seven-day arithmetic mean where at least three
  records exist. No interpolation through gaps. Weekly recorded volume excludes
  pending duplicates. Weight corrections survive later MASS imports.
- Lightweight dated/versioned plans, moved/skipped/partial/changed/completed
  states, actual-session links and retained original date. The hosted plan stays
  linked without invented prescriptions.
- Six non-watch observation families and seven sleep/HRV/association families,
  with deterministic inputs, source IDs, calculation version, ranking and evidence
  drawers. Sparse/ambiguous data suppress comparisons. No diagnoses, weight-to-speed
  formula, fake HR drift or reverse-engineered readiness.
- AES-256-GCM portable backups using passphrase-derived keys; preview and explicit
  restore confirmation; atomic replacement and a pre-restore checkpoint. Portable
  backups exclude login sessions and server credentials.
- Garmin Personal API adapter: encrypted server key, token recreation, 401 retry,
  rate-limit handling, paginated activity summaries, sleep/nap/HRV mapping and
  stable night updates retaining notes.

## Verification

Final local run: **21 tests passed, 0 failed**. Dependency audit reported **0 vulnerabilities**. Private-source/database/key/screenshot paths were confirmed ignored by Git.

Automated tests cover Melbourne midnight/DST, repeated/invalid times, irregular
schedules, circular clocks, naps/preceding-night joins; missing sensors; feedback,
revision conflict and idempotency; MASS/source identity; matching and undo; CSV
duplicate distance columns; GPX segment breaks; invalid XML/FIT; official SDK
encoded synthetic FIT; encrypted backup, wrong-passphrase/damage and isolated
restore; synthetic Garmin mapping, night-ID corrections, token renewal, 401/429,
pagination and missing HRV; insight recomputation/suppression; HTTP auth, CSRF,
origin checks and protected source files.

Actual Chromium browser checks used a separate synthetic journal for mutations:

- Blank check-in, conditional location and clearing it on None.
- Multiline/emoji note save, reload and edit.
- Server outage, queued save, offline reload, reconnect and single replay.
- Concurrent edit, both versions preserved and explicit conflict resolution.
- Nap creation, plan creation/linkage and saved theme preferences.
- Main sections at 360 px in both themes without horizontal overflow.
- Populated synthetic Sleep and real Today; desktop/phone rendering.
- Reduced-height 402 × 500 view: focused note and Save visible together.

Ignored `.private-preview/` stores screenshots. `production-test-` files contain
invented test records, not device evidence. QA created no real user check-ins.

## Remaining boundaries

- **Live Garmin is unverified:** no key or watch payload supplied. Token shape,
  permissions, real field availability and late updates need a first-live check.
  FIT files can be imported manually; automatic Garmin FIT download is not built.
- The documented sleep DTO supplies stage totals, not stage intervals. A true
  hypnogram requires verified interval data. Advanced stream physiology, route
  maps and richer relationship plots remain later work; streams are inspectable
  as raw samples. No invented waveforms are shown.
- **Actual iPhone Safari, VoiceOver, installed PWA, software keyboard and timed
  human <=45-second check-in remain unverified.** Desktop emulation is not a pass.
- Exact hosted workout-plan prescriptions and complete Strava history remain
  unavailable/unverified. Selected screenshots are not a training census.
- No paid OAuth, public hosting or live account mutation was performed. iPhone
  access needs an approved private HTTPS deployment.
- Uploads currently allow 32 MB per file and 50 MB HTTP bodies. Large archives
  should be split locally. Automatic snapshots remain on this computer; copy
  portable backups off-device yourself.
- Browser offline storage is private to the trusted browser profile, not separately
  encrypted. SQLite uses OS disk protection. Lock clears cached views after pending
  saves and drafts are resolved.

## Official references

[Garmin Personal API](https://developer.garmin.com/gc-developer-program/personal/personal-api/),
[FAQ](https://developer.garmin.com/gc-developer-program/personal/personal-faq/),
[OpenAPI reference](https://developer.garmin.com/gc-developer-program/personal/swagger-docs/),
[official FIT SDK](https://github.com/garmin/fit-javascript-sdk).
The inspected public schema is retained in `docs/vendor/garmin-personal-openapi.json`.
Synthetic fixtures do not establish real-account support for optional fields.

Final real-data captures: `.private-preview/stride-tempo-today-mobile.jpg`,
`.private-preview/stride-tempo-sleep-mobile.jpg`, and
`.private-preview/stride-tempo-desktop.jpg`. The production preview showed no
console errors during the final navigation pass.
