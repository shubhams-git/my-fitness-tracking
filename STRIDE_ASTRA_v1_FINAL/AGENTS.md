# STRIDE repository guidance

- This repo builds a private, personal running, strength, weight and sleep intelligence app. See `docs/PRODUCT_VISION_AND_REQUIREMENTS.md` for product decisions; see other docs only as needed for the current work.
- Prioritize correctness of imported personal measurements, excellent iPhone Safari UX, human copy and low user friction over framework fashion or feature count.
- Real personal inputs are in `private-inputs/`: never commit, deploy, expose in public fixtures, or log raw health/routes/keys. Honor `.gitignore`.
- Store source provenance; do not fabricate missing values or treat `0 bpm` as true heart rate; do not double-count cross-posted runs.
- Test calculations, imports, data recovery and browser interactions relevant to changes. Review rendered mobile states when working on UI.
- Follow `docs/INSIGHTS_AND_VOICE.md` for evidence-backed insight language; follow `docs/SLEEP_INTELLIGENCE.md` for sleep logic and measurement limits.
- Do not implement the disputed biomechanics or rigid cadence targets in the historical Gemini PDF.
- Make reversible local decisions independently. Request approval for live-account mutations, paid services, external sharing, destructive changes or production deployment.
