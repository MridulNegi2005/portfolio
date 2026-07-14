# Shared Agent Context

Rolling work log shared between Codex, Claude Code, and Antigravity.

## [2026-07-12 01:50] — System
**Task:** Initialized cross-agent sync.
**Changes:** Created shared sync structure and agent bridge files.
**Status:** completed
**Notes:** Future agents should read `handoff.md`, this log, and `artifacts/` before starting work.

---

## [2026-07-12 02:00] — Codex
**Task:** Publish the mobile-responsive portfolio update and sitemap support to `main`.
**Changes:** Merged `mobile-responsive` into `main`; added root-level `sitemap.xml` with the canonical homepage URL and `robots.txt` referencing it.
**Status:** in-progress
**Notes:** Sitemap validation and the push to `origin/main` are next. The audit's DNS, response-header, and authentication recommendations require deployment/provider configuration and are intentionally not represented as static files.

---

## [2026-07-12 01:54] — Codex
**Task:** Improve mobile layout and touch interaction for the portfolio.
**Changes:** Created the `mobile-responsive` branch and rollback tag `pre-mobile-responsive-2026-07-12`; refined small-screen hero, CTA, metadata, workflow, project, stack, philosophy, timeline, contact, and footer spacing; kept Build Philosophy cards in a 2×3 grid on phones; added touch/pen pointer handling for the WebGL grid lens; initialized cross-agent sync files.
**Status:** completed
**Notes:** Mobile QA screenshot is in `.ai-sync/artifacts/mobile-hero.png`. The branch is ready for review; return to `main` or the rollback tag to restore the desktop baseline.

---

## [2026-07-12 20:44] — Antigravity
**Task:** Mobile responsiveness tweaks and UI animations.
**Changes:** `index.html` (mobile layout refinements, touch-tracking WebGL grid, scroll-driven card hover effect, staggered plus/toggle wave animations, tools mobile carousel, blurple tap-highlight fix).
**Status:** completed
**Notes:** Ready for next tasks.

---

## [2026-07-15 01:34] — Claude Code
**Task:** Desktop content/polish pass, then mobile refinement (in progress).
**Changes (completed since last sync):** `index.html` —
- Replaced placeholder Featured Work with 3 real projects sourced from resume + cloned repos: **Mahoraga** (RL combat env, FastAPI + Qwen2.5-3B LoRA), **The Loop** (FastAPI/React campus platform), **Cosmic Bot** (`royalbot` Discord bot); each with a "View on GitHub" link.
- Added downloadable résumé (`Mridul_Negi_Resume.pdf` in repo root) + gold "Résumé" nav button + contact link.
- Swapped approximated AI logos for **official brand silhouettes** (Claude / Antigravity / Codex), all tinted to `--accent-bright` gold; **renamed the third tool Gemini → Antigravity** (kept `GEMINI.md` file label).
- Real GitHub/LinkedIn links wired; footer de-cheesed; year 2025 → 2026; removed all em dashes.
- WebGL grid: fixed page-wide with **scroll parallax** (35%), fixed the **backwards-scroll** direction bug; opaque render fix (was invisible/black).
- Header: monogram mark + name `mridulnegi`; full institute name; `overflow-x:clip` fix so anchor nav actually scrolls.
- Added `DESIGN.md` (palette, fonts, signature elements).
**Status:** in-progress
**Notes:** NOW WORKING ON (approved plan): (1) fix mobile stack playing-card **jitter** (per-move restyle of all 4 cards → front-card-only + rAF + axis-lock) and raise swipe **threshold** to max(90, 30% width), forward-only; (2) add **gyroscope-tilt** ambient effect for the mobile grid lens (no idle-drift fallback — do nothing if unsupported); (3) add **workflow pipeline arrows** — feeder chevrons + stage-to-stage arrows (→ desktop / ↓ mobile). All in `index.html`. Do NOT hand-merge an old `mobile-responsive` branch over this — current `main`/working `index.html` is ahead of the 07-12 log.

---
