# STRIDE Intelligence v1.0 | Start here

**Prepared 24 October 2026.** This is the final **planning and implementation handoff**, not an already-built app. It supersedes the earlier STRIDE prototype and the v0.9 product brief. The working name is STRIDE Intelligence.

## What to give Astra

Everything required is in this folder:

| File | Why it exists |
|---|---|
| `CODEX_START_PROMPT.md` | **The only prompt you need to paste** at the start of the Codex conversation. |
| `AGENTS.md` | Short, durable rules for Codex when working in the repo; intentionally not a giant prompt. |
| `docs/PRODUCT_VISION_AND_REQUIREMENTS.md` | Definitive product behavior, screens, priorities, user experience, non-goals. |
| `docs/SLEEP_INTELLIGENCE.md` | First-class sleep design, metric priorities, temporal logic, insight rules and scientific limits. |
| `docs/DATA_AND_INTEGRATIONS.md` | Strava, Garmin, MASS, run deduplication, source fidelity, keys and privacy. |
| `docs/INSIGHTS_AND_VOICE.md` | Insight ranking, human copy style, factuality and sample output. |
| `docs/DESIGN_QUALITY_BRIEF.md` | Premium mobile design standard and how to validate it. |
| `docs/BUILD_BACKLOG.md` | Phased work, priorities, dependencies, acceptance criteria. |
| `docs/ACCEPTANCE_TESTS.md` | Real-data fixtures, sleep edge cases, browser and security checks. |
| `docs/RESEARCH_AND_DECISIONS.md` | Source URLs, verified facts, disputed claims and deliberate trade-offs. |
| `private-inputs/` | Your uploaded, personally identifying/source files, for *local use only*. Not for GitHub commits. |

## On your Windows PC

1. Create a **private** empty GitHub repository (suggested name `stride-intelligence`). Do not initialize it with a template if you want to keep the first local commit simple.
2. Clone it into a local directory using GitHub Desktop, VS Code, `git clone`, or Codex. An empty repo with an initial README is fine too.
3. Extract the contents of **this package** into the **root of that local repo**, preserving `docs/`, `private-inputs/`, `AGENTS.md`, and the two root Markdown files. Do not extract inside an extra nested `STRIDE_ASTRA_v1_FINAL` directory.
4. Check that `.gitignore` exists **before your first `git add`**; it excludes `private-inputs/`, secrets, local caches and environment files. A private repo does not eliminate the need to ignore personal source data.
5. Open the local folder as your project in Codex on Windows. Select **GPT-6 Astra** and **High** reasoning if available in your Codex model controls. Give Codex access to the project workspace and normal local tooling. You may prefer Windows + PowerShell/WSL as your setup permits.
6. Paste the full contents of `CODEX_START_PROMPT.md` as your first message. There is no need to paste all the other files; Codex can open them from the workspace as needed.
7. Let Codex inspect the brief and produce **two genuinely different, populated mobile design directions** first. Choose a direction before it builds the complete product. The initial review checkpoint is intentional and worth keeping.
8. Later, supply **your actual Strava export** and **the original structured training-plan data** into `private-inputs/`, then tell Codex those files are available. After purchasing the watch, supply a small Garmin FIT/API sample or connect your Personal API securely. You can start building before those arrive.

## Suggested first successful milestone

The repo contains a polished, runnable mobile vertical slice: Today's Find; one real October 23 run; a legible activity detail; a quick four-answer check-in with optional notes; real MASS weight data; and an initial Sleep screen showing an honest pre-Garmin state with well-designed empty data. All persistence and data processing are tested. There are no invented sleeping measurements.

## Key guardrails

- **No fixed dependency on Strava paid membership.** Bulk archive first. Strava API optional, with subscription requirement for creating a new app verified in October 2026.
- **Garmin Forerunner 255 is the feature baseline.** Use a 265/higher model's additional capabilities when available. Sleep deserves full integration when the watch exists.
- **Do not reconstruct incorrect “tonnes of tibial force saved” or fixed “free speed from weight loss” mathematics from the supplied Gemini report.** That PDF is historical comparison material, not the authoritative specification.
- Never hardcode secret keys or paste them into Codex chat or GitHub. Treat your weight, routes, health and sleep history as sensitive personal data.
- Let the coding agent choose technology and engineering details with justification. We care about working behavior, evidence quality, excellent UX and proof.

**Not included:** a live database, live Strava/Garmin credentials, the complete Strava archive, and authoritative structured exercise-plan data. These cannot be manufactured from screenshots or third-party commentary.
