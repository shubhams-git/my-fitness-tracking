# Design checkpoint · 24 October 2026

**Status: owner approved B · Tempo, retaining premium visual quality.**

This file records the original comparison. See [IMPLEMENTATION_HANDOVER.md](IMPLEMENTATION_HANDOVER.md) for the working app and verification.

Run `node design-review/server.mjs` from this package, then open
http://127.0.0.1:4317. No installation, account or external connection is required.
The server accepts loopback hosts only and serves an explicit file allowlist.

## The choice

| | A · Fieldnotes — recommended | B · Tempo |
|---|---|---|
| Organizing idea | A personal training journal, led by an observation | A training instrument, led by a measured difference |
| Visual language | Warm paper, forest ink, expressive serif headlines, fine rules | Mineral blue, restrained apricot, sans-serif headlines, large numerals |
| Today | The story comes first; a dot plot supports it | A six-second comparison leads into a distance-based split chart |
| Session Story | Narrative, a precise row per split, source note | Split intervals sized by distance, numerical hierarchy, source note |
| Sleep | A quiet illustrated journal opening, optional manual entry | A graphic night composition, explicit absence of recorded nights |
| Check-in | Four questions together; four choices and Save | Four guided questions; larger targets but three extra Next taps |
| Trade-off | More expressive; less numerical information at first glance | More analytical; greater risk of making the app feel like an instrument panel |

**Recommendation:** Fieldnotes best matches the brief's perceptive, human voice and
low-friction check-in. Retain its restrained hierarchy as the dataset expands.
Both directions have deliberately designed light and dark variants. The chart
and interaction approaches are different, not just the colors.

The review offers Today, Session Story, Sleep and Quick Check-In for both
directions, plus evidence, weight records, optional morning notes and theme
controls. Screens are populated from local reference sources at runtime.

## What is known

| Source | Inspection and usable scope |
|---|---|
| MASS JSON | Parsed original file. 29 weight observations, four active sessions, one tombstone. The configured start-weight marker is not the first observation. Empty wellness values are not sleep measurements. |
| October Nike screenshots | Visually inspected summary, splits, perceived effort and route screenshot. Summary and partial split are transcribed locally; displayed zero HR is missing. Route imagery is not a recoverable GPS stream. |
| October Strava screenshots | Visually inspected summary, note and split rows. Two full kilometres support the pacing finding; final segment is partial. No HR or native GPS stream supplied. |
| Historical Gemini PDF | Review-only disputed source. No claims, formulas or implementation authority taken from it; exclusions follow RESEARCH_AND_DECISIONS.md. |
| Training-plan website | Reference link supplied, exact structured prescriptions remain unverified. No invented calendar or next workout. |
| Strava archive | Not supplied. These two selected runs are not a census of training. |
| Garmin | No key, watch sample, FIT file or real sleep payload supplied. No connectivity claim or synthetic measurements on personal screens. |

### Source discrepancies preserved

- Strava's final row displays `0.8` while the rounded total minus two full
  kilometres gives `0.86`. The design labels this as a partial split and exposes
  the estimated remainder in the evidence view. It does not claim raw precision.
- The fastest-split summary differs from the displayed split rows by one second.
  The finding uses the two full split rows and makes no fastest-split claim.
- Provider-reported average pace is retained rather than recomputed from rounded
  distance and time.
- The dated review is a 24 October snapshot, not a live stream or a fresh daily
  finding generator.

## Deliberate prototype boundaries

- The source transcription is in ignored `private-inputs/`, with filenames and
  origins. MASS is read directly from the original JSON. No personal fixture is
  bundled into frontend source assets. Screenshots are in ignored
  `.private-preview/` because they contain personal evidence.
- Browser memory demonstrates feedback, edits and optional sleep notes. They
  survive screen navigation but **clear on reload**. They are not training
  records or a durable database. The interface explicitly labels preview saves.
- No authentication, Garmin/Strava authorization, production import pipeline,
  backups, deployment, plan engine or insight ranking is claimed complete.
- No invented stage chart, readiness score, precise route, pace waveform,
  physiology, weight-to-speed conversion or injury inference appears.
- Native system fonts and authored SVG/CSS avoid third-party font/image requests.
- Production framework and database selection remains open until design approval;
  these dependency-free previews are intentionally disposable design work.

## Verification performed

- Node's test runner: 3 tests passing, including actual local source contract
  counts/values and synthetic checks for tombstones and partial-split exclusion.
- Real desktop Chromium browser rendering at 402 × 874, narrow 360 × 780 and
  desktop dimensions; all four screens in both directions inspected/captured.
- All 16 direction/theme/screen combinations at 360 px: no horizontal overflow.
- Feedback defaults blank; Save disabled until four answers; optional location
  appears after discomfort, clears when changed to None; note retains newlines
  and emoji through in-preview navigation and edits.
- Both the one-page and guided check-in save flows exercised; no browser console
  errors observed in the tested interaction flow.
- Split inspection, source drawer, Escape dismissal and optional sleep-note flow
  exercised. Empty morning submission is rejected; restedness alone leaves
  duration absent.
- Reduced-height viewport: note field and Save remain visible together after
  focusing the note. This does not simulate an actual iOS keyboard.
- Reduced-motion CSS disables smooth scrolling; no ornamental animation is used.
- Private inputs ignored by Git; server exposes only named app assets and the
  local evidence route, not a directory or arbitrary source files.

**Not verified:** actual iPhone Safari, software keyboard, VoiceOver, timed human
30–45-second completion, offline durability, real API connectivity or production
security. Those remain later milestone acceptance requirements. Do not turn this
design review into a release sign-off.

## Next, after the owner's choice

Build the persistent vertical slice in the selected direction: source-aware
MASS import, selected run history, editable durable check-ins and notes, Today's
Find with deterministic evidence, and the useful pre-watch Sleep experience.
Then proceed through deduplication, plan/gym/history, backups and the Garmin
boundary, preserving the original product contracts.

Decision recorded: **B · Tempo**, selected by the owner. Working app: port 4318.
