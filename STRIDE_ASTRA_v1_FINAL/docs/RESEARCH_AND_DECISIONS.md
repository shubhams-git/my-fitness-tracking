# Decision register and research evidence | Verified 24 October 2026

Sources below are external official references unless indicated. Review changes to source APIs and available functionality at the actual implementation date; the handoff is a snapshot, not a guarantee of permanent vendor policy.

## Key evidence and decisions

### Strava

**Finding:** Official Getting Started states a Strava subscription is required to **create a new developer application**. Single-player/one-athlete mode exists for personal development. This is a gate on app creation, not proof that the API loses access after subscription cancellation. Current official documentation does not establish lifetime access after cancelling, so the app does not depend on it. Free-tier bulk archive and native activity imports first; optional one-month experiment only after owner explicitly decides.

- https://developers.strava.com/docs/getting-started/
- https://developers.strava.com/docs/reference/
- https://developers.strava.com/docs/rate-limits/
- https://support.strava.com/en-us/articles/15401919-how-do-i-export-my-strava-data

### Garmin Personal API

**Finding:** Official personal program is expressly intended for users accessing their own Garmin Connect data, not just commercial partners. Self-generated key expires after selectable 30, 90, 180 days or 1 year; user obtains an access token valid up to 24h; no refresh token. Personal API Swagger lists sleep-service endpoints, HRV and user-summary endpoints among others. The available endpoint does not guarantee that each watch reports every field. Design baseline Forerunner 255 with optional extra 265/higher fields; use FIT imports and endpoint payload exploration.

- https://developer.garmin.com/gc-developer-program/personal/personal-api/
- https://developer.garmin.com/gc-developer-program/personal/personal-faq/
- https://developer.garmin.com/gc-developer-program/personal/swagger-docs/
- https://www.garmin.com/en-CA/compare/?compareProduct=780139&compareProduct=886785
- https://www8.garmin.com/manuals/webhelp/GUID-676967A0-1B23-4384-9BC9-76F3D643F1C8/EN-GB/GUID-70D41BFB-2BB2-4933-BF95-47FF63140112.html
- https://www8.garmin.com/manuals/webhelp/GUID-F41EAFB3-6CC9-42DE-9C6C-9E358DBB0671/EN-US/GUID-70D41BFB-2BB2-4933-BF95-47FF63140112.html

### Sleep reliability

**Finding:** Garmin tracks timing, total sleep, stage estimates, sleep score and device-dependent nightly metrics. Consumer-wearable estimates are not a replacement for laboratory testing or clinical assessment. Sensible product design favors timing, trend and user-perceived rest above second-by-second certainty of REM, deep sleep or overnight oxygen variations. Specifically, no diagnosis of sleep apnea from Garmin Pulse Ox/respiration data.

- https://support.garmin.com/en-US/?faq=mBRMf4ks7XAQ03qtsbI8J6
- https://www.garmin.com/en-XD/garmin-technology/health-science/sleep-tracking/
- https://www.garmin.com/en-CA/legal/atdisclaimer/
- https://www.garmin.com/en-GB/blog/garmin-health-announces-sleep-study-results/

### Codex / GPT-6 Astra

**Finding:** OpenAI's Sep 2026 guidance cautions against excessive instruction scaffolding in `AGENTS.md` and prompts. Best practice: clear user outcome, constraints and verification, contextual documentation, autonomous implementation and visual/browser testing. This handoff therefore gives a short initial prompt, an unusually concise AGENTS.md and separate docs for Codex to inspect as needed, rather than 30 pages of tool recipes.

- https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra
- https://developers.openai.com/api/docs/guides/prompt-engineering
- https://developers.openai.com/cookbook/examples/codex/using_goals_in_codex
- https://developers.openai.com/cookbook/examples/gpt-5/codex_prompting_guide

## Comparison of our earlier planning and supplied Gemini report

| Question | Earlier draft | Gemini STRIDE TELEMETRY report | Final choice |
|---|---|---|---|
| Core focus | Running/weight/strength | Running, biomechanical calculations, design concept | Four first-class domains: **running, sleep, gym and weight** |
| Data after Garmin | Generic watch metrics | FIT plus device matrix of 55/165/265 | **Forerunner 255 baseline** + secure Personal API, sleep and overnight wellness, FIT fallback |
| Nike | Screenshots/manual | Screenshot/AI OCR full pipeline | Historic manual/screenshot only, **no future integration** |
| Strava | CSV/API possibility | No well-qualified subscription policy | Free bulk archive first; optional paid one-month OAuth experiment; no cancellation promise |
| Opinionated scientific math | Basic comparisons | 33.9 tonnes shin impact, kg -> exact pace, hard cadence threshold | **Reject**; descriptive/conditional valid calculations and appropriate data thresholds only |
| Feedback | Four simple answers | Six required pill selections | Four core answers, optional leg context and optional note; flexible 30–45-sec UX |
| Insights | Preliminary deterministic templates | Assertive rule engine, no hedging | Fact/evidence engine + natural curated copy, confident observation without invented causality |
| UI | Dense initial prototype | Rigid editorial cards, exact colors/grid ratios | Original premium editorial/athletic identity; Codex compares two rendered design directions |
| Sleep | Underrepresented | Sleep as a future Garmin support metric | **Flagship P0 screen, P1 actual Garmin sync and cross-domain intelligence** |

### Why Gemini's biomechanical claims are rejected

- **'33.9 tonnes of tibial force saved':** sum of hypothetical ground reaction force peaks across steps is not actual cumulative tibial tissue force, impulse or injury risk; mechanical quantities wrongly conflated.
- **'8.8 seconds/km of free speed':** fixed pace benefit from kg loss ignores body composition, effort, training, conditions and performance variance.
- **Cadence under 156 -> overstriding:** an unsupported universal safe-cadence floor; stride mechanics depend on individual and speed.
- **RPE + split decay = validated HR decoupling:** no, continuous HR stream needed for HR:pace calculations.
- **Absence of shin pain + calf raises = medically cleared to progress:** no, multiple signals and actual conditioning history needed. The app must not issue medical clearance.
- **'Forerunner 165 gives 95% of 265 intelligence':** quantified claim has no established derivation and is irrelevant to a 255-or-better plan.

**Historical Gemini input:** `private-inputs/review-only/stride_telemetry_architecture_and_rationale.pdf` is read-only comparison context, *not* implementation authority. Relevant criticisms: pages 2–3 biomechanics, pages 9–10 hardware/calculations, pages 5–7 UX concepts. Do not reproduce its mathematical formulas as requirements.

## Known unresolved sources, not blocker to beginning work

- Full user's Strava archive is not provided here; obtain from account export later.
- Full structured hosted training-plan prescriptions are not available via the public text rendering; require an actual export/source before locking exact weekly plan data.
- Real Garmin key, device and API sleep payload are unavailable until watch purchase and consent.
- MASS source code has not been audited; the attached JSON is authoritative for its existing records and URL illustrates desired insight voice.

## Evidence hierarchy

Original uploaded source records and actual validated API/FIT payloads > manufacturer/API documentation for what *could* be available > modeled or manually entered data with attribution > historical assistant/Gemini interpretations. Important conclusions should be auditable to measurements and assumptions, not confidence of prose.
