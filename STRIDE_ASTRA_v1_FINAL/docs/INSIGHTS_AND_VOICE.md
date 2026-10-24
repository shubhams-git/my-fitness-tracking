# Insight intelligence and editorial voice

## Product personality

Imagine a perceptive friend who is serious about training and delighted by interesting numbers. Smart, attentive, sometimes playful, never formulaic, patronizing, overhyped or clinical. No 'your AI coach says', 'data suggests that perhaps you might', or generic motivation. Don't repeat what the user already knows ('this is your fitness plan', 'you are Shubham', 'your data comes from Strava'). **Earn the headline** with a real observation.

### Composition standard

1. **Headline:** concise and vivid, usually one sentence: 'Your pacing barely moved.'
2. **Supporting explanation:** one or two short clauses with the concrete observations, numbers or historical comparison that make it matter.
3. **Evidence/drilldown:** optional 'Why this?' to show chart/data and criteria, not a technical dissertation on the main screen.
4. **Next action:** only when the observation supports one; do not invent a prescription for every insight.
5. **Missing data:** at most one short line only when actually useful, e.g. 'Heart-rate data would make this comparison sharper.'

Natural variation without hallucination: editorial templates/curated variations can use a deterministic fact payload, optionally rewritten by a model under validation and guardrails. The engine should choose **which fact deserves attention** before choosing how to say it. An empty screen is better than an invented finding. Avoid repetitive forced novelty.

### Internal insight evidence envelope (conceptual)

Include insight ID/type, source record IDs, measurement origin, numeric inputs and units, comparator/filter criteria, formula and version, evidence sufficiency, flags for confounding and missingness, priority (usefulness + freshness + novelty), last shown timestamp, and rendering copy. The visible UI need not show all internals, but user should inspect the supporting activity/night numbers on demand.

### Criteria for comparisons

Compare compatible sessions: intended workout, distance/duration, terrain/elevation, known weather context, perceived effort and HR when present. Treat an easy 7:27/km run and a hard 6:16/km run as different training intents. Partial split of 0.86 km stays partial; raw pace from a source may differ by a second from rounded-distance calculations. Weight changes are not solely fat loss and do not generate deterministic pace bonuses.

Sleep studies need sufficient baseline coverage and meaningful relative effects. Start with simpler observations about duration/timing rather than spurious cross-domain 'causation'. Do not compare sleep quality after a workout to that same workout as preceding sleep. For overnight/HRV abnormalities, favor nonclinical trend language.

### Ranked insight families

**P0 without Garmin:** consistency and longest comfortable session; planned-vs-performed difference; pacing discipline where partial-split handling is valid; easier effort at comparable speed; footwear adherence/use and comfort; weight trend versus individual fluctuation; gym/run sequencing; notable personal achievements; optional manually recorded sleep regularity.

**P1 Garmin/activity:** matched HR vs pace; aerobic drift when a full continuous HR+pace stream supports it; individualized cadence/stride/power changes; load exposure and recovery context with sourced Garmin values; subjective effort vs HR. No universal cadence 'correctness' threshold.

**P1 Garmin/sleep:** sleep duration and trend; bedtime/wake consistency; night-to-night variation without moralization; sleep score vs reported restedness; HRV/overnight HR vs established personal trend; naps; sleep preceding a run; training timing versus subsequent sleep when data exist; long-term recovery patterns.

**P2:** meaningful personal experiments, race readiness narratives and richer multi-domain correlations only after comparable data volume is sufficient.

### Example copy (NOT claimed historical findings unless verified)

- 'You kept it beautifully steady. The first two kilometres differed by six seconds, and you finished with energy left.' (supported by Oct 23 screenshot and note)
- 'You ran more slowly on purpose, and kept going longer. That's a different kind of workout, not a step backwards.' (Oct 4 vs Oct 23 observation; don't call it a physiological breakthrough)
- 'The scale bounced up on Tuesday. Your multi-week weight trend barely moved.' (only when computed from actual history)
- 'You slept an hour longer than your recent usual night.' (only with sufficient actual watch/manually recorded timing)
- 'Your wake-up time has been surprisingly consistent this week.' (requires multiple real observations)
- 'Your nights are shorter before your early runs. The pattern is showing up often enough to be worth checking.' (requires sound sample criteria)
- 'Three of your last four easy runs began after shorter nights. Their effort scores were higher.' (show n and avoid causal certainty)
- 'Your Garmin sleep score was low. You still woke up feeling good, so keep both stories in view.' (only when both are recorded)

### Bad examples that must fail review

- 'You've saved 33.9 tonnes of tibial impact.' Imaginary tissue force model.
- 'At 151 spm, your knees are at risk; raise it to 160.' Unsupported universal cadence rule.
- 'Your short REM caused poor performance.' Unsupported causal and measurement precision.
- 'Congratulations warrior! You're unstoppable!' Generic, irrelevant enthusiasm.
- 'Your overnight SpO2 proves a sleep disorder.' Unacceptable diagnostic overreach.
- 'Your weight loss guarantees 8 seconds faster per kilometre.' False precision.
- 'Your heart rate is zero so you have no aerobic data.' Zero represents missing sensor in these supplied phone screenshots.

### Ranking and variety

Prioritize significant, well-supported and actionable discoveries; then rotate occasional fun factual observations. Prevent identical headlines repeating daily without new evidence. Do not force daily insight production if nothing notable happened. Track both relevance to current training goal and recovery. Sleep insights are eligible on rest days and should not always lose ranking to the latest run. User can expand 'All discoveries' if desired.
