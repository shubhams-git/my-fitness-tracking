# Build backlog | Prioritized, outcome-based

**24 October design checkpoint:** D-01 complete; D-02 implemented and available
for review; D-03 awaiting the owner's direction choice. See
`DESIGN_CHECKPOINT.md` for the source inventory, two local previews, verification
evidence and prototype boundaries. No production milestone is marked complete.

Do not convert this into a rigid checklist that prevents the coding agent from discovering better implementation approaches. The IDs are product acceptance targets, not mandated tickets, classes or tables. **P0** = first useful release / foundations, **P1** = Garmin-informed deepening after device and keys available, **P2** = optional later exploration. Each completion requires working implementation *plus evidence*.

## Milestone 0: one design decision, then build

| ID | Priority | Deliverable | Proof |
|---|---|---|---|
| D-01 | P0 | Repo source inventory and discrepancies list | Records real source inputs vs unverified plan/Strava archive/watch fields; no invented history. |
| D-02 | P0 | Two genuinely distinct polished iPhone designs | Populated Today, Running Detail, Sleep and Check-In, accessible screenshots/previews; user chooses one before full implementation. |
| D-03 | P0 | Visual language and responsive navigation | Chosen original design, considerate light/dark, reduced motion, browser edge cases covered. |

## Milestone 1: personal history that can be trusted

| ID | Priority | Deliverable | Proof |
|---|---|---|---|
| CORE-01 | P0 | Private durable app shell and storage | Restart/relogin retains all data; secrets protected; single-user access actually enforced. |
| DATA-01 | P0 | MASS JSON import and backup | Imports **29 weigh-ins and four active sessions**, excludes tombstoned fifth, handles reimport and fields correctly. |
| DATA-02 | P0 | Strava free account archive plus FIT/TCX/GPX import where supplied | Activities/splits/streams ingested faithfully; errors recoverable; reported pace precision retained. |
| DATA-03 | P0 | Historic Nike manual run editor | Date, time/distance/pace, partial splits, optional prior effort and notes, with missingness preserved; no dedicated NRC API. |
| DATA-04 | P0 | Activity identity reconciliation | Exact and probable duplicates distinguished; two provider posts for same run count once, sources retained. |
| DATA-05 | P0 | Plan version/occurrence linkage | Planned vs completed/shifted sessions; original hosted plan accessible, structured import once provided. |
| DATA-06 | P0 | Transparent data management | Export/recovery, delete or edit own observations, connection/import state and revision traceability. |

## Milestone 2: habit-forming experience

| ID | Priority | Deliverable | Proof |
|---|---|---|---|
| UX-01 | P0 | Today with strong evidence-backed finding | One lead insight, recent activity/context and sensible next action; no fake stats or filler. |
| UX-02 | P0 | High-fidelity session story and useful charts | October 23 partial split not misrepresented; activity provenance accessible, missing HR not zero. |
| UX-03 | P0 | Fast feedback, gym variant and optional note | Four untapped/unanswered run signals + Save in **<=45 sec** typical iPhone flow, no typing, notes editable, discomfort never silently set to no. |
| UX-04 | P0 | Activities/explore/history and gym context | Genuine filters, sensible charts; separate workout purposes; no fabricated performance progression. |
| UX-05 | P0 | Distinctive visual polish and browser reliability | Inspected iPhone-scale and desktop real rendered views, keyboard, safe areas, accessible controls, empty/error states. |
| INS-01 | P0 | Deterministic insight facts and human editorial layer | Six useful no-watch insight families, exact evidence references, clear suppression/repetition policy and no ungrounded causal claims. |
| INS-02 | P0 | Weight trends and useful cross-domain observations | Daily fluctuations separated from smoother trend; compare only like with like, never convert kg to exact speed. |

## Milestone 3: sleep is first-class before Garmin

| ID | Priority | Deliverable | Proof |
|---|---|---|---|
| SLP-01 | P0 | Dedicated Sleep experience | Useful honest pre-watch empty state; user can optionally enter manual duration/times/restedness. Not a dummy score or fake stage chart. |
| SLP-02 | P0 | Sleep episode identity/time model | True start/end, local wake date, naps, DST/cross-midnight tests, null for unmeasured values. |
| SLP-03 | P0 | Optional one-tap restedness log and notes | Disabled by default or opt-in, 1-tap standard; does not interfere with fast workout check-in; entries editable. |
| SLP-04 | P0 | Sleep-ready design and data layers | Real Garmin data can populate timeline, duration and stage estimates without redesign; honest unknown states. |

## Milestone 4: Garmin 255-or-better device integration

| ID | Priority | Deliverable | Proof |
|---|---|---|---|
| GAR-01 | P1 | Personal API key/token lifecycle integration | Key server-side, 24h token recreation, chosen 30/90/180/365-day key expiry handling, failure/reconnection and secure access. |
| GAR-02 | P1 | Garmin activity summaries/native FIT import | Actual 255-or-better run data and streams verified, alias to same Strava-posted run deduplicated. |
| GAR-03 | P1 | Sleep import and resync | Official personal sleep endpoints and any available stage intervals/score/nap data map correctly to nights; reimport handles changes. |
| GAR-04 | P1 | Overnight/daily recovery metrics | HRV, HR, stress, Body Battery, respiration, SpO2 only if actually delivered and quality adequate; no fabricated readiness. |
| GAR-05 | P1 | Sleep visual analytics | 7/14/28-day trend and clock-time regularity, night timeline, nap handling, stage estimates and device score, personally meaningful trends. |
| GAR-06 | P1 | Running physiology analytics | Matched HR/pace, meaningful drift where raw streams warrant it, supported power/cadence, individual baseline, watch-specific optional fields. |
| GAR-07 | P1 | Sleep-versus-performance insights | Conservative correlations, preceding-night association by timestamps, adequate sample and confounder control, human copy. |
| GAR-08 | P1 | Integrity of all source pipelines | Handle API latency, missing days, watch battery/no-wear, pagination, partial response, deleted/update records and private re-export. |

## Milestone 5: optional enhancements, evidence first

| ID | Priority | Deliverable | Proof |
|---|---|---|---|
| OPT-01 | P1 optional | Strava OAuth if user elects paid API trial | Subscription used only with explicit consent; tests access before/after cancellation, never hard dependency. |
| OPT-02 | P1 optional | Offline-safe check-in | Queue with visible pending state, conflict handling and no lost entries, Safari proven. |
| OPT-03 | P1 | Gear and strength cross-context | Real tagged footwear/strength patterns, no shoe-causal assertions. |
| OPT-04 | P2 | Event prep and race insight stories | Actual history and editable assumptions, no guaranteed outcome or rigid permission for mileage ramps. |
| OPT-05 | P2 | Personal experiments and advanced insight exploration | Sufficient comparable data, comprehensible controls, no manufactured significance. |
| OPT-06 | P2 | Opt-in next-morning soreness prompts, richer sleep context | Prove benefit without adding daily logging burden. |

## Order of operations and dependency rules

Design direction approved before broad UI engineering. Data identity before multi-source aggregation. Sleep episode/time semantics before sleep charts, sleep trends and correlations. Source verification before promising Garmin-specific fields. Provenance and security before uploads of actual personal data to a live deployment. Initial P0 functionality must run meaningfully with no watch and no paid Strava API. Garmin P1 can be developed using fixtures before the watch, **but live connectivity cannot be signed off without actual credentials/payloads**. P2 scope should wait until the user has used the foundation and the dataset supports richer analysis.

## Completion review (per milestone)

For each relevant section: correct implementation, tests against real source fixtures or clearly labeled synthetic fixtures, browser screenshot inspection, no major accessibility regression, reliable import/backup and a concise user-facing summary of what is working versus awaiting real data. Prefer revisiting design quality over adding premature features.


## Implementation checkpoint · 24 October 2026

B · Tempo is approved and implemented as a persistent local app. See
[IMPLEMENTATION_HANDOVER.md](IMPLEMENTATION_HANDOVER.md) for verified scope and
remaining live/device gates. This original backlog remains the roadmap; not all
P1/P2 capabilities are implemented.
