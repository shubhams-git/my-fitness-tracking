# Paste this entire message into Codex as the first project request

You are the lead product designer and engineer for **STRIDE Intelligence**, a private, premium mobile-first training intelligence application. Build it inside this repository for personal use by a single athlete on iPhone 17 Pro Safari (also good on desktop). Use **GPT-6 Astra / High** if available.

**FIRST: read `README_START_HERE.md` and the relevant `docs/` specifications.** Treat `docs/PRODUCT_VISION_AND_REQUIREMENTS.md` as the canonical product intent and `docs/SLEEP_INTELLIGENCE.md` as mandatory, not optional. The included actual data under `private-inputs/` are reference sources and must never be committed. The historical Gemini PDF under `private-inputs/review-only/` contains analytically disputed claims, flagged in `docs/RESEARCH_AND_DECISIONS.md`; do not implement those claims.

## The product I want

STRIDE combines running, gym, weight and **first-class sleep/recovery** information into concise, thoughtful observations that feel like they came from a perceptive, enthusiastic human who knows my training history. On opening the app, something specific and worthwhile should catch my attention. No bland encouragement, repetitive caveats or walls of KPI tiles. Charts and interactions should be exceptional, quiet, elegant and genuinely useful.

I currently record runs on **free-tier Strava**. Older Nike runs are historical manual entries only. I use the MASS website for weight entries; its included JSON is the reliable import source. I will soon own a **Garmin Forerunner 255 or better**, and then Garmin Connect Personal API/FIT and overnight sleep metrics become core sources. Do not assume those credentials or future measurements already exist. The workout-plan reference site is linked in the docs; its exact structured schedule has not been verified.

The standard post-run check-in must take **30–45 seconds**, with easy taps for effort, talking comfort, discomfort and finish reserve, plus an always-available optional note and expandable context. Never prefill “no pain” as an unanswered response. Sleep morning notes should be optional, very short and never compete with the post-workout flow.

Every noteworthy insight must be factually grounded in source records, testable, human-sounding and presented with proportionate certainty. Distinguish measured facts, estimates and hypotheses internally without burying the visible copy in disclaimers. Do not invent heart rate, sleep-stage accuracy, injury diagnosis, biomechanical force, recovery readiness or guaranteed racing outcomes. Treat missing measurements as absent rather than zero. Never double-count a Garmin activity that also appears on Strava.

## Your design and engineering autonomy

You own the technology choices, information architecture, typography, colors, charts, component system, motion, service boundaries, persistence strategy and implementation. Choose a maintainable, low-cost approach suitable for a private one-user app. Do not follow arbitrary pixel prescriptions or clone Strava, Garmin, Apple Health, Oura, or MASS. Aim higher than a generic SaaS dashboard. Accessibly support reduced motion, safe areas, varying iPhone viewport dimensions, light/dark modes, privacy, backup and offline-ish check-in reliability.

Use the docs as **outcome and verification contracts**, not inflexible class or database prescriptions. You can simplify or improve proposed implementation ideas without losing the requirements. Keep project notes and tasks updated as you learn; avoid excessive `AGENTS.md` rules.

## Work in progressive, verified milestones

1. **Design approval checkpoint before broad engineering:** inspect supplied inputs, determine what's truly known vs missing, and create **two materially distinct, high-fidelity, populated mobile design directions** for Today, Session Story, Sleep and Quick Check-In. Recommend one with rationale and provide inspectable screenshots or browser previews. Pause **only here** to obtain my choice of direction.
2. Build an end-to-end persistent vertical slice using real imported evidence: Today's Find, a run detail with partial splits, a fast editable check-in including notes, MASS weight history and a beautiful, honest Sleep screen that works without a watch. Test import correctness and initial empty states.
3. Complete the robust import/deduplication layer, training-plan linking, gym log, historical browser, natural insight engine and secure exports/backups. Run automated tests and inspect actual browser visuals.
4. Implement and test Garmin Personal API integration and its available sleep/activity fields using the official endpoint docs. If no personal key/watch sample exists, build the honest connector boundary and fixtures, **mark actual connectivity as unverified**, and leave live authorization as a visible user-controlled setup step. Optional Strava OAuth must not block use or require a permanent paid tier.
5. Refine visual details and performance, verify iPhone Safari behavior, complete privacy/security/accessibility tests, and document how to deploy and maintain the app. Keep features proportional to actual user benefit; do not pursue speculative P2 scope automatically.

**Definition of done:** the first release looks and feels premium on Safari, imports my actual historical data without errors or duplicate sessions, produces clear and natural observations backed by testable computations, saves check-ins/notes reliably, makes sleep a meaningful first-class experience once Garmin supplies real data, remains useful before that purchase, and allows private self-service export and recovery.

You may proceed autonomously on reversible local work. Obtain approval before subscriptions, paid services, destructive changes to source accounts, or deployment that exposes live personal data. If an integration cannot be tested due to missing credentials, do everything realistically possible with fixtures and report precisely what remains blocked. Do not claim to have tested a real API or actual Safari device when only mocks or a desktop browser were used.
