# Visual and interaction quality | Premium, not generic

## Intended feel

Not Strava with new colors. Not a stock Bootstrap dashboard. Not an imitation Apple Health screenshot. A distinctive, elegant, quietly athletic personal app: natural microcopy, editorial hierarchy, thoughtful use of space, precise visualizations and tactile but restrained motion. It should feel unusually well made on an iPhone 17 Pro opened in Safari after a run or first thing after waking.

### Critical requirements

- At a glance, the user sees one *interesting and grounded* thing, not a biography, tutorial, hero marketing blurb or redundant provider logo row.
- Support both bright and low-glare dark themes with deliberate contrast, material/depth and typography. Avoid predictable neon-on-black 'developer dashboard' conventions and purple-gradient AI branding. Use color semantically, not decoratively.
- Avoid card-inside-card repetition, indiscriminate rounded rectangles, twenty KPI tiles, endless dashboard scrolling or a pile of swipe carousels. Make a choice about what matters.
- High-quality typography and spacing; real tabular numerals and sensible units; polished controls with touch-friendly hit areas and accessible focus states.
- Charts have appropriate axis scale, context and data density; mark individual real measurements; do not smooth sparse/noisy series into fake scientific curves. Use beautiful curves only when mathematically justified and preserve inspectable exact values.
- Sleep visualization deserves special attention: a clear overnight timeline, estimated sleep-stage periods, time-of-night axis crossing midnight, and carefully differentiated night-level trends. Avoid an overengineered 'biohack command center'.
- Check-in uses a reachable single-screen flow or considered bottom sheet with few taps; optional notes are always discoverable; phone keyboard and browser chrome must not hide Save. Treat dynamic island, viewport expansion/collapse and safe-area insets correctly without assuming a fixed CSS viewport size.
- Motion may celebrate an actual insight or convey navigation/state, but must be subtle, skippable, performant and respectful of reduced-motion preferences.
- Error, empty, importing, permission denied, connecting-watch, overnight sync delay and offline states must be genuinely designed, not debug text.
- Accessibility: contrast, semantics, labels, keyboard navigation, voiceover expectations and chart alternatives. Every interaction makes sense without hover.

## Inspiration, not imitation

Existing MASS tracker https://personal-fitness-tracker-yey.vercel.app/ is a **voice and delight reference**: short, varied, human insights. Garmin Connect, Strava, Oura, Whoop, Apple Health, Linear and fine editorial design are reference points for clarity or rigor, but the final composition must be original. The visible hosted MASS site's current design source has not been audited; don't assert its exact typography or algorithms.

## Required design gate

Before extensive feature engineering, Codex should provide **two substantially different, high-fidelity mobile directions** with real supplied October running data and an honest pre-watch Sleep state; show Today, Session Story, Sleep and Quick Check-In rather than moodboards. Explain the trade-offs and nominate a direction. Wait for user approval **at this one planned checkpoint**, then implement the choice. If image/screenshot generation isn't available, create an actual runnable browser design prototype using real content; no need for hero images.

## Proof of quality

Run UI in a real browser at representative iPhone-scale dimensions *and* desktop. Capture/check Today, Sleep, activity detail, sheet when keyboard is open, low-data state, importing state and errors. Test Safari specifically on an actual iPhone when accessible; if unavailable, explicitly label browser emulation as such, not verified real-device Safari. Verify scroll, tap, chart tooltip, modal dismissal, keyboard/focus, reduced-motion and light/dark mode. Treat visual QA as iterative: inspect, critique and refine, not 'build passed, done'.

## Content density rule

Home has one dominant insight and one immediate next action at most; context and charts are selectively surfaced. There should be depth **behind** the screen, not verbosity **on** it. The user must be able to discover richer analysis deliberately.
