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

## [2026-07-17 02:40] — Antigravity
**Task:** Content updates and UI alignment fixes based on user feedback.
**Changes:** `index.html` (changed degree to "B.E. Computer Engineering", updated name to "Mridul Negi", fixed nav bar spacing/alignment by hiding empty action container on desktop, reframed "Method" to "Human-led engineering" to center user ownership, updated Cosmic Bot description to reflect 6 years live, fixed Stack headers grouping by category so tools are evenly represented — then reverted this last grouping change back to singular tools per user preference).
**Status:** completed
**Notes:** The desktop and mobile layouts are polished and content is accurate.

---

## [2026-07-23 19:21] — Claude Code
**Task:** Mobile polish fixes, then a new **cinematic cross-agent-sync demo section** built from the user's real Claude + Antigravity screenshots.
**Changes:** all in `index.html` —
- **Mobile stack card deck:** fixed jitter (per-move restyle of all 4 cards → front-card-only transform, rAF-batched, axis-lock with non-passive `preventDefault`; `.stack-panel.animating` class drives transitions instead of inline `style.transition`). Swipe threshold raised `80 → max(90, 30% width)`; velocity flick removed (too easy to trigger); forward-only kept. Restored the fling-out animation (explicit `.34s` transition + matched timeout; it was being cut off by a 260ms/500ms mismatch). Removed a global `will-change` that was hurting rather than helping.
- **Pipeline arrows:** replaced pseudo-element gutter arrows (rendered *behind* the boxes) with real flex `.parrow` elements — `→` desktop / `↓` mobile; `.pipe` simplified to 4-col desktop / 1-col ≤760px; removed `overflow:hidden` from `.stage` (body clips itself). Feeder lines got downward chevrons.
- **Gyro tilt** on the mobile WebGL grid lens — **Android only**; deliberately skipped on iOS (never prompts for motion permission). No idle-drift fallback.
- **Mobile nav:** Contact/Résumé no longer collide (full-width buttons, 12px gap); **Résumé moved OUT of the hamburger** into the nav bar as a gold highlight button (desktop unchanged). Pipeline expand softened (content fade/slide on `.stage-inner`).
- **Wording accuracy:** removed `JOURNAL.md` everywhere (it never existed) → the real `context.md` (rolling log) + `handoff.md` (active handoff); swept stray "journal" copy.
- **NEW `#demo` section — "03 / Cross-agent sync, live":** a pure CSS/JS cinematic sequence (no video) with **two realistic app windows** modeled on the user's actual screenshots — Claude desktop (Home/Code tabs, sessions sidebar, `negim` chip, bottom input with Bypass permissions · Opus 4.8 · Medium) and Antigravity (menu bar, Projects tree, `Gemini 3.1 Pro (High)`) — plus a **bottom taskbar** that switches windows via a **magnified cursor click**. 6 labelled beats: Prompt → Plan → Write files → Update journal → Handoff → Continue in another agent. Uses **real content**: the actual portfolio brief, and Antigravity's real "third card too dark" fix (`#0e1013`, Card 2 85% / Card 3 70% / Card 4 55%, "1 file changed +3 −3"). Plays once on scroll + Replay; reduced-motion → static end state; mobile → left-to-right card carousel with arrows.
- Nav gained a **Sync** anchor; section eyebrows renumbered 01–08.
**Status:** completed
**Notes:** Verified in-browser (no console errors) via DOM/state checks — screenshots are unavailable in this environment, so **visual timing/feel is unverified**; the user should watch the demo run on a real screen and report pacing. A `window.__demo` hook (`play/run/reset/final`) is left in `index.html` for driving the demo in tests — safe to strip before deploy. Gyro tilt could not be runtime-tested (no sensor). `Mridul_Negi_Resume.pdf` must be deployed alongside `index.html` or the résumé links 404.

---

## [2026-07-26 01:00] — Claude Code
**Task:** Design a logo for the site and add a favicon (the site had **no favicon at all** before this).
**Changes:**
- **Logo — "editorial M".** Replaced the geometric chevron mark in the nav with a **serif capital M set in Fraunces 600** (the site's own display face) in `--accent-bright` gold. Rationale: the mark *is* the typography, tying the brand to the headline font instead of bolting on a separate geometric symbol. Tile border changed `--line-strong` → `--accent-deep` to match the icon, plus a hover state (border brightens to `--accent` + 3px `--accent-glow` ring).
  - Drawn as inline `<svg><text>` rather than a text node so the baseline is explicit and centering is deterministic at any size. Construction: **cap height = 50% of tile** (12 of 24 viewBox units), baseline `y=17.9` at `font-size:17`.
  - Verified live: font resolves to Fraunces 600, cap = exactly 50% of tile, optical centre off by 0.1 units (~0.1px). The **cap box** is centred, not the em box — that's the detail that usually makes letter-in-a-box marks look subtly wrong.
- **Icon set generated** (Pillow 10.4 + Georgia Bold, supersampled 8× then LANCZOS-downscaled): `favicon.svg` (primary, scalable), `favicon-32.png` (fallback), `favicon.ico` (16/32/48 legacy), `apple-touch-icon.png` (180px, **full-bleed** — no self-rounding, since iOS applies its own squircle mask). All four verified serving HTTP 200.
- `index.html` head: added the three `<link rel="icon">`/`apple-touch-icon` tags + `theme-color` (`#0a0b0d`) so mobile browser chrome matches the page.
- `DESIGN.md`: new **Logo & icons** section (construction rules table + icon-file table + deploy note); also fixed a **stale `CONTEXT.md`/`JOURNAL.md` reference** that had been missed when the site copy was corrected — it now documents the real `.ai-sync/context.md` + `handoff.md`.
**Status:** completed
**Notes:** No console errors. **Screenshots remain unavailable in this environment** (browser pane not compositing frames), so the nav mark's final appearance is measured-but-unseen — the user should eyeball it. The PNG icons *were* inspected directly and look correct. Known cosmetic seam: the nav mark is true **Fraunces**, while the PNG/ICO icons use **Georgia Bold** (favicons cannot load web fonts); visually interchangeable at 16–32px, but tracing the Fraunces M to a vector path would make every size share one outline if exactness is ever wanted.

## [2026-07-31 02:42] — Antigravity
**Task:** Make demo section mobile-friendly, fix scrolling bugs, and enhance markdown rendering.
**Changes:** index.html —
- Completely refactored the #demo cinematic cross-agent sync section for mobile, replacing the hardcoded canvas scaling/panning with standard CSS flexbox vertical stacking.
- Designed a collapsible breadcrumb strip for the file tree sidebar (.cw-side.expanded), hooking into the animation to auto-expand/collapse before clicking files.
- Enabled touch handling on the bottom taskbar, allowing the user to seamlessly switch between the Claude and Antigravity windows on mobile.
- Fixed a frustrating top-clipping scroll bug on both PC and mobile by replacing justify-content: flex-end with margin-top: auto on the first message, and constraining the grid height.
- Implemented a custom, lightweight Markdown to HTML parser for .md files (like DESIGN.md and context.md), upgrading them from raw syntax-highlighted code to beautifully formatted typography (headings, bold/italic, lists, inline code) while preserving the <pre> formatting for code files like index.html.
**Status:** completed
**Notes:** The mobile view for the cinematic demo is fully functional, properly readable without tiny un-zoomable text, and highly interactive.
---

## [2026-08-06 02:35] � Antigravity
**Task:** Demo section polish � native brand icons, glassmorphism label, GFM table rendering, mobile UX cleanup.
**Changes:** index.html (Antigravity full-color SVG inlined in demo JS, Claude native fill, glassmorphism label with center-to-corner spring animation, GFM table parser in render(), mobile cards removed, sidebar arrows enlarged, fast-forward trigger at 120 chars, tool badge CSS reverted to golden).
**Status:** completed
**Notes:** Implementation plan for Options 1 (Design Polish � 3D ID card tilt, spacing, typography) and 3 (Copywriting � meta/hero/ID card rewrites) is drafted but awaiting user approval. The Antigravity icon in the demo uses a complex multi-layer SVG with masks and filters � do not simplify. The source SVG lives on Desktop (ntigravity-color.svg) but is NOT in the repo; it's inlined in JS.

---

## [2026-08-07 03:10] — Claude Code
**Task:** Revert a broken edit pass, then execute the approved portfolio revamp (see `PORTFOLIO-REVAMP-PLAN.md`).
**Changes:** all in `index.html` unless noted —
- **Revert:** A prior agent's edit pass left the site unusable. Restored `index.html` + both `.ai-sync` files to the last good commit (`38703f3`). The broken version is preserved in git `stash@{0}` ("gemini-broken-changes-backup-2026-08-07"). Work continues on branch `portfolio-revamp`.
- **Section reorder:** Moved `#work` up to position 02 and `#demo` down to position 07. Added a new **`#experience` section** (03) with the ELC internship and the 5 NVIDIA DLI certifications (verification links). Renumbered all eyebrows 01–09; reordered the nav to match.
- **Copy:** New `<title>`/OG positioning ("Backend-focused CS student"). Rewrote the hero subtext (fixed a run-on), replaced weak hero stats (2 VMs / 3 AI tools with 3 yrs / Finalist / 5x certs), rewrote the defensive About heading, and removed a self-deprecating line. Softened the demo intro.
- **Polish:** Removed TypeScript from the stack, replaced timeline labels with real years, new footer line, SVG hamburger icon, aria-labels on expandable buttons, "Gemini-powered" note on Antigravity.
- **Light mode (NEW):** Dark by default, toggle in the nav, choice stored in `localStorage`. Overrides the palette in a `:root[data-theme="light"]` block. The WebGL grid reads theme-aware `u_bg`/`u_line` uniforms. The `#demo` section stays dark in both themes. A `theme-switching` class suppresses transitions for one frame during the switch (fixes a Chromium `var()` background bug).
- `DESIGN.md`: added a **Light mode** section.
**Status:** completed (verified), not yet pushed.
**Notes:** Verified in-browser via computed styles + DOM (screenshots still do not composite in this environment — the user should eyeball both themes on a real screen). No console errors; no horizontal scroll on mobile; light mode fully readable including the cert cards. **Deferred (user decisions):** PlantBrain project add / The Loop swap; project screenshots vs CSS diagrams (U4); regenerating `og-image.png` to match the new positioning (it still reads "Systems-minded software engineer"). **Kept by user request (do not change):** personal Gmail contact, the "6 years" Cosmic Bot claim, no phone number, and Mahoraga shown without team attribution. Security review must run before any push.

---

## [2026-08-10 04:20] — Claude Code
**Task:** Act on the second brutal review (`PORTFOLIO-REVIEW-2.md`).
**Changes:** `index.html`, `og-image.png`, `sitemap.xml`, `work/`, `DESIGN.md`, and the résumé LaTeX source —
- **Removed the leaked prompt (critical).** The embedded `f-brief` shipped the full original brief in page source, including "B.Tech Computer Science student" (contradicting the site), "aspiring programmer", and "present himself as a serious engineer". Replaced with a sanitized 1.2 KB brief that keeps the demo authentic. Also trimmed `f-context` from 10 KB to 1.6 KB. Page: 213 KB → 196 KB.
- **Résumé:** replaced The Loop with PlantBrain in `Resume_2026.tex`, and corrected CGPA to 8.01. **The PDF still needs recompiling on Overleaf** — no LaTeX toolchain on this machine. Renamed the shipped PDF to `Mridul_Negi_Software_Developer_Resume.pdf` and updated all 7 links.
- **Splash:** kept the duration. Added a "click or scroll to skip" hint, a pure-CSS failsafe fade at 4 s (so a JS failure can no longer leave a permanently blank locked screen), and a skip when the visitor arrives on a deep link (`#work`).
- **Timeline:** reconciled with the 6-year Cosmic Bot claim (2020 is now "First things that ran", referencing the bot) and removed the duplicate `2026 / Now` ending.
- **OG image:** regenerated. It had still carried the abandoned "Systems-minded software engineer" line; now shows the backend positioning and the three real stats.
- **Light theme:** darkened ink and accent ramps. All body text now passes WCAG AA in both themes (footer was 2.56/2.66, now 4.64/6.38; light eyebrow 4.08 → 5.05).
- **Accessibility:** added `:focus-visible` rings (there were none), a skip link, a `<main>` landmark, and 44 px touch targets on coarse pointers (19 undersized → 2).
- **Case images:** added self-hiding `figure.case-shot` slots inside each (collapsed) project panel, so screenshots cost zero page length until opened. `work/README.md` documents the three filenames and the privacy rules.
- `sitemap.xml` lastmod refreshed.
**Status:** completed (verified), not pushed.
**Notes:** Deliberately left per the user: the sync demo stays as-is, the splash duration stays, the Gmail contact, the "6 years" claim, no phone, and Mahoraga without team attribution. **Outstanding for the user:** recompile the résumé PDF on Overleaf, and drop the three PNGs into `work/`. Deploy list now includes `work/*.png`.

---
