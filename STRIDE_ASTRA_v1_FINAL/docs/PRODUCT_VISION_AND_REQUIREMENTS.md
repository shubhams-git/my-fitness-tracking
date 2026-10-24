# STRIDE Intelligence | Authoritative product requirements v1.0

**Status:** Implementation-ready direction, design deliberately open for Codex to explore. **Supersedes:** v0.9 blueprint, early runnable demo, disputed Gemini report. **Owner context:** private, personal application for Shubham. **Timezone:** Australia/Melbourne. **Target:** iPhone 17 Pro Safari first, desktop fully functional. **Date:** 24 October 2026.

## Product thesis

This is not a Strava clone, an electronic diary, an automated clinical trainer, or a workout SaaS. It is a perceptive personal training intelligence tool that integrates **running, sleep/recovery, strength and weight** into observations the user would struggle to notice across existing apps. A great visit takes seconds: one meaningful finding, a beautifully contextualized number or trend, and (when warranted) a sensible action. Details reward curiosity rather than appearing by default.

The four domains have **equal architectural status**. At product launch, sleep is a first-class surface even if it initially has no device data. After a Forerunner 255/265 or better is available, sleep and running should share equally rich exploration and insight ranking. Sleep may be the most personally important metric; avoid burying it under 'recovery' snippets.

### Product qualities

1. **Specific and personal:** 'You kept the opening kilometre steady; the final climb didn't change your pace' is useful. 'Consistency is key!' is not.
2. **Truthful confidence:** state observations decisively, distinguish exploratory correlations internally and avoid unsupported physiological or medical causality. No interminable disclaimers.
3. **Beautiful and intentional:** editorial, athletic, refined, inviting; charts don't falsify the data to achieve visual smoothness.
4. **Tiny interaction cost:** 30–45 sec standard check-in after a recorded run or gym session, optional freeform note; sleep check-in is optional.
5. **Source independence:** Strava free archive first, Garmin-first telemetry after purchase; no permanent paid Strava requirement and no manual duplication of sensor-derived stats.
6. **Private, durable, portable:** single-user authentication, lossless/source-aware imports, robust backup/export and zero unexpected public sharing.
7. **Modest operational complexity:** suited to an individual's budget, not a multi-tenant commercial architecture.

## User data and sources

Currently: free-tier Strava for future phone runs; MASS (https://personal-fitness-tracker-yey.vercel.app/) for primary weight recording; standalone prescribed workout plan (https://symphonious-kitsune-3c1793.netlify.app/); historic Nike Run Club screenshots/manual entry. Soon: a Garmin Forerunner 255/265 or better, recording activities and overnight recovery/sleep. The Garmin Personal API is the preferred future connector; original FIT imports provide a useful fallback. Exact exercise prescriptions for the hosted workout plan and complete past run history have **not** been delivered in structured form; don't invent them from Gemini's interpretation.

Supplied MASS export: 29 recorded weights (3 Aug–23 Oct 2026), one profile start-weight reference and four active gym/cardio sessions (one additional session marked deleted). Supplied selected runs: 4 Oct NRC 2.19 km / 13:45 / reported pace 6:16 min/km / felt 7 of 10 hard / cadence 158; 23 Oct Strava 2.86 km / 21:20 / reported pace 7:27 / 19 m ascent / 3,230 steps / 7:24, 7:30 and 7:24 min/km splits (last split is partial 0.86 km), with user note: 'Easy finish, can do a lot more. No pain or stress anywhere.' The screenshots are samples, **not a census of all runs**.

### Product navigation, not a prescribed component tree

- **Today**: a standout evidence-backed insight, context for recent activity/sleep, next planned workout and minimal navigation to what deserves attention. No marketing copy, routine introductions or walls of cards.
- **Running & Activities**: graceful history, run detail, split and effort analysis, gear when relevant, gym sessions, personal records that have context; show raw data when user drills in.
- **Sleep**: dedicated first-class experience with night timeline, duration, timing/regularity, quality estimates, recovery markers and correlations with following-day training. An informed 'no watch yet' state offers only honest capabilities (manual sleep duration entry optional).
- **Explore**: interactive comparisons, trends, nontrivial relationships across domains, weight changes and training volume; optionally expose personalized question prompts, not a chatbot by default.
- **Plan**: planned versus completed sessions, moving workouts, alternate exercises and useful workload context. Do not rebuild full training-plan authoring in the first release unless clearly easier than connecting the existing plan.
- **Quick log / Check-in**: always reachable and thumb-friendly. User's recent imported session selected when confidently matched, editable; show notes at any time.
- **Settings/Data**: source connection health, import audit trail, privacy, backups, preferences, units, insight controls and data deletion. Not in the user's face unless action is needed.

Agent owns final IA: tabs, navigation architecture and layout should be established during real visual prototype review, not dictated by this document.

## How the core flows should behave

### A. Import or finish a run

1. Run arrives from the source or manual import. Treat the same Garmin-to-Strava-shared workout as **one activity** with multiple source identities; preserve original values/streams and distinguish derived fields.
2. Session appears in recent history with correct date/time, route, distance, duration, splits, available HR/cadence/power and state of missing metrics.
3. User opens a short check-in, completes four answers and optional context/note; autosave/durable save plus clear success feedback; edit later. **Never quietly assume symptom-free or RPE 3.**
4. Insight engine interprets the session relative to plan, prior comparable sessions and recent recovery if known. It says something specific, useful and natural. When history is sparse, simply give a strong descriptive finding rather than pretend a trend exists.

### B. Review a night of sleep

1. Once Garmin provides data, night appears under the appropriate local **wake date**, with actual start/end timestamps crossing midnight where applicable and any associated naps kept separate.
2. First glance shows sleep duration and schedule consistency, with Garmin sleep score, stage estimates, wake episodes, overnight HR/HRV/stress/respiration/Pulse Ox only where actually available.
3. The night view provides a carefully rendered stage timeline without implying clinical accuracy. Allow comparison with a genuinely comparable baseline rather than fixed dogmatic norms.
4. A natural insight focuses on the most important observation, such as an unusually short sleep period before a difficult run or surprisingly stable bed/wake timing. No diagnostic labels or moralistic grading.
5. Optional one-tap morning note ('Rested / Okay / Drained') and editable note, only if the user enables it. No compulsory morning task.

### C. Understand a relationship

Select a question such as 'Do I run more comfortably after longer nights?' and get: an intelligible chart; how many comparable observations were included; one honest conclusion; optional inspectable data points. The system must not claim that sleep *caused* a performance change from a correlation in a small dataset.

### D. Plan and gym

Session prescriptions are versioned over time. Match by planned occurrence and workout purpose, not just weekday; track completed, moved, partially done, changed or skipped. Gym check-in requires effort, completion status, relevant soreness/fatigue, optional notes; detailed sets/weight/reps are opt-in if the user wants strength progression. Gym data can inform next-run context but cannot automatically establish injury protection.

### E. Weight coexistence with MASS

Initially import MASS JSON idempotently. MASS remains a legitimate weight entry interface. In the future, consider shared storage or a supported API from its actual source code, if accessible. Do not force duplicate manual entry. Trend weight using clearly defined smoothing; do not treat each day's fluctuation as a change in fat mass. Correlate carefully with training and recovery over time.

## Feedback requirements

**Run core: four quickly tappable answers**, target normal completion <=45 s including saving on an actual phone: (i) effort 1–10, (ii) talking comfort full/short/barely, (iii) discomfort none/mild/affected run with conditional location (shin/knee/foot/other), (iv) finish reserve plenty/some/none. Optional 'legs before starting' (normal / heavy from gym / heavy from work / other); optional free text/voice keyboard notes. No compulsory keyboard, no repetitive explanations. Label RPE in everyday words. Pre-select linked activity/plan only when high confidence; never preselect a misleading health answer. Gym version appropriately shorter. Save and sync reliably, show pending/offline state if relevant.

**Optional morning sleep feedback:** one-tap 'How rested do you feel?' with three choices; optional note and optional sleep-time manual correction if needed. Excludes sensor duplication and must be disableable. Skip = no data, not low rest. An overnight sleep log and a run feedback may occur on the same date, but refer to different session IDs and timestamps.

## Insight standards

Two-layer logic: traceable, deterministic **fact generation** then editorial **expression/ranking**. A fact has source IDs, timing, value, units, comparator criteria, calculation version, confidence category and reasons to suppress. Writing chooses one timely, high-value insight and avoids repetition. A model may help phrase established facts, but should not generate new measurements or diagnostic guidance. Micro-delights are allowed when true. Do not show insight empty shells or fake comparisons just to fill the dashboard. See `INSIGHTS_AND_VOICE.md`.

## Sleep feature requirements by rollout

**Before watch:** optional manual sleep duration/times and felt rest; beautiful but honest Sleep page; no invented sleep stages, HRV or scores; no need to delay other functionality. **After watch:** Forerunner 255-capable baseline includes supported sleep duration, timing, stage estimates, sleep score, movements, naps, HRV and linked wellness fields. Verify each API payload in practice. Sleep timing and consistency trends, stage-context viewing, sensor completeness and sleep/training comparisons. **Later:** historical pattern studies, morning observations, recovery correlations, further model-specific metrics if verified. Read `SLEEP_INTELLIGENCE.md` for strong restrictions on stage estimates and medical inference.

## Non-goals and scientific exclusions

No public social feed, tracking other people, paid services required for ordinary operation, generic AI conversation window, gamified shame around poor sleep, medical/clinical monitoring, diagnose sleep apnea, sleep-stage 'optimization' certainty, predictive injury risk or automatic physical-clearance decisions. Do not output hypothetical tibial 'tonnes saved'; fixed kilograms-to-running-speed conversion; universal safe cadence minimum; surrogate HR decoupling computed without heart-rate stream; Apple-Health-only assumptions; fabricated Garmin Training Readiness formula; or guaranteed race finish time. If a feature cannot be grounded, omit it.

## Success criteria

1. The iPhone UI is strikingly well designed without overloading the first viewport. Real browser visual QA supports this conclusion.
2. Typical imported run feedback saved within 45 sec without mandatory typing; notes always available. Editable and recoverable.
3. All existing MASS data and supplied runs import accurately and repeatedly without duplication; extra historical runs can be added without guessing missing fields.
4. Sleep navigation and faithful models are ready immediately; actual Garmin sleep sync, once keys/watch exist, can preserve raw provenance, support several weeks of history and yield 6+ worthwhile sleep/training insight types over time.
5. The app remains useful on free Strava and without Garmin; a paid Strava subscription is never a hard dependency.
6. A skeptical user can inspect evidence behind each important conclusion. Speculative biomechanical rules are absent.
7. Entire personal dataset is exportable; secrets are server-side; source health data not publicly accessible.
8. Agent can operate independently with testing and milestones without continually asking for already-provided requirements.
