# Brutal Portfolio Review #2 — mridulnegi.dev

> Reviewed: 2026-08-10
> Scope: current `portfolio-revamp` branch (post-revamp, post-PlantBrain, post-light-mode)
> Method: live DOM inspection, measured WCAG contrast, page-weight and a11y audit, résumé/site cross-check
> Previous review: `PORTFOLIO-REVIEW.md` (2026-08-07)

---

## What genuinely improved since review #1

Credit where due. These were real problems and they are now fixed:

- **Selected work leads the page** (position 02, was 06). The AI-demo dropped to 07.
- **Experience & credentials section exists** — internship + 5 verifiable NVIDIA certs + degree/CGPA.
- **PlantBrain replaced The Loop** — a materially stronger, backend-aligned case study, framed honestly ("built by two; I led the backend and applied-AI core") with real RAGAS metrics and a live-demo link.
- **Positioning is consistent** across title/OG/ID-card: "Backend-focused CS student".
- **Honest hero stats** — no more "3 AI tools" as an achievement.
- **Light mode** works, with the WebGL grid correctly theme-aware.
- **TypeScript removed**, timeline has real years, aria-labels on expandable buttons.

The site is meaningfully better than it was three days ago. What follows is what is still wrong.

---

## CRITICAL

### C1. Your original AI prompt is embedded in the page source

**Where:** `<script type="text/plain" id="f-brief">` — 14 KB of the page
**Severity:** This is the single worst thing on the site.

The full brief you gave the AI to build this site ships to every visitor. Anyone who opens View Source (and on a *developer* portfolio, technical recruiters and engineers absolutely do) can read, verbatim:

- `"a B.Tech Computer Science student at Thapar Institute"` — **contradicts your own site**, which correctly says B.E. Computer Engineering. Your source code disagrees with your page.
- `"an aspiring programmer and software engineer"` — directly undercuts the confident positioning the visible page works hard to build.
- `"wants to present himself as a serious engineer, not just a student with a few projects"` — reveals the *intent to appear* more senior. This is the most damaging line on the site.
- `"should not look like a generic template, a boring resume page, or an 'AI-slopped' design"`
- The entire design brief, tool list, and infrastructure description.

The visible page says "I did the thinking first." The page source says "make me look serious." A recruiter who finds this does not read it as transparency — they read it as the site being an AI deliverable rather than your work. It invalidates the whole "human-led engineering" argument.

**Fix:** Delete `f-brief` entirely. The demo does not render it. Also strip `f-context` (10 KB) and `f-handoff` — they expose internal agent-to-agent notes, commit hashes, and instructions to future AIs. That is 29 KB of internal working files (~14% of page weight) with negative value to a visitor.

### C2. Your résumé PDF contradicts your site

**Verified by extracting the PDF text:**

| | Site | Résumé PDF |
|---|---|---|
| PlantBrain | Featured (project 02) | **Absent** |
| The Loop | Removed | **Still present** |

A recruiter reads the site, gets interested in PlantBrain (your strongest backend case), clicks Résumé — and PlantBrain is not there. Instead there is a project the site does not mention. The two documents describe two different candidates.

This also means the site's best asset is invisible in the document that actually gets forwarded to hiring managers and parsed by ATS.

**Fix:** Update the résumé to include PlantBrain (it belongs there more than The Loop). Also confirm the CGPA on the PDF matches the site's 8.01. The résumé is the artifact that travels; the site should not be ahead of it.

### C3. The splash blocks the page on every single load

**Measured:** ~1.9 s before content is reachable, ~2.5 s until the overlay fully clears. Scroll is locked (`splash-lock`) for that duration. It fires on **every** reload, not once per session.

A portfolio's job is to survive a recruiter's first 5 seconds. You are spending 40% of that budget on an animation of your own logo, on every visit — including when they come back a second time to re-check a detail. The skip affordances (click / scroll / key) work but are **undiscoverable** — nothing tells the user they can skip.

Also worth knowing: the splash is a fixed overlay in the initial HTML. If JavaScript fails to run for any reason, `splash-lock` never lifts and the visitor sees a **permanently blank branded screen**. There is no CSS-only failsafe.

**Fix (pick one, in order of my preference):**
1. Cut the total to ~900 ms and add a failsafe (`@keyframes` auto-fade in pure CSS, so it clears even if JS dies).
2. Make it once-per-session again (`sessionStorage`) — you explicitly asked for every-load, so this is your call, but every-load is the aggressive choice.
3. Skip it entirely for visitors arriving with a `#hash` (someone deep-linking to `#work` should not sit through a logo).

---

## MAJOR

### M1. Your timeline contradicts your Cosmic Bot claim

- Cosmic Bot card: **"6 years live"**, "Six years in production" → implies a 2020 start.
- Development-journey timeline: **2020 = "Learning by building"**, **2023 = "Early projects"**.

So your timeline says your *first* projects were 2023, while your flagship project claims to have been in production since 2020. Both are on the same page, roughly one screen apart. An interviewer who notices will ask, and there is no good answer.

You told me to keep the 6-year claim (your call — you built before you pushed to git). Fine. But then the timeline must agree with it: 2020 should be "Started building / first bot", not "Learning by building" with "Early projects" arriving three years later.

**Also:** the timeline ends `2026 → Now`. It is currently 2026, so the last two entries are the same moment. Use `2026` for self-hosting and change the final label to something forward-looking, or merge them.

### M2. Still zero visuals. The work section is a wall of text.

Three case studies, all pure prose. No screenshot, no architecture diagram, no UI shot, nothing. PlantBrain has a **live deployment** and a cited-answer UI — that is a screenshot begging to be taken. Cosmic Bot renders Pillow rank cards. Mahoraga has a React dashboard.

This was flagged in review #1 (U4), planned two ways, and never resolved. It remains the largest single upgrade available to the page: a recruiter skims, and right now there is nothing to catch the eye between the hero and the contact block.

**Fix:** One image per case. Even three tasteful screenshots would transform the section. If you want zero new assets, build the CSS/SVG architecture diagrams instead (the `.rack`/`.node` component already in your Infrastructure section renders exactly this).

### M3. Your OG share image still says "Systems-minded software engineer"

`og-image.png` carries the **old positioning** — the exact phrase you replaced everywhere else. That image is what renders when the link is shared on LinkedIn, WhatsApp, Slack, or Discord. It is, for most recruiters, the **first thing they see**, before the page loads.

So your most-seen asset advertises the positioning you deliberately abandoned. It also reads "SYSTEMS-MINDED SOFTWARE ENGINEER" over your name, which is exactly the overclaim review #1 flagged.

**Fix:** Regenerate with the current line ("Backend-focused CS student · Thapar 2027", or similar). Non-negotiable if you plan to share the link anywhere.

### M4. Keyboard users cannot see where they are

**Measured: there is not a single `:focus` or `:focus-visible` rule in the stylesheet.**

Your page is full of interactive elements — 3 expandable case studies, 4 pipeline stages, 4 stack tabs, a theme toggle, a hamburger, ~10 nav links. Tab through it and the focus ring is either the browser default (largely suppressed by your resets) or invisible against the dark surfaces.

For a site whose thesis is engineering discipline, shipping zero focus styles is a visible gap — and it is the kind of thing a frontend-literate interviewer checks in ten seconds.

**Fix:** One rule. `:focus-visible{outline:2px solid var(--accent);outline-offset:3px;border-radius:4px}`.

### M5. The sync demo is still the biggest thing you built, for the least return

Moving it to 07 helped. But it is still ~800 lines — the single largest feature on the site — and it still animates two AI chat windows passing a markdown file. For a recruiter, the takeaway is unchanged: your most elaborate engineering artifact is a simulation of using AI tools.

I am not going to keep pushing this since you clearly like it and it *does* show real CSS/JS skill. But be aware of the trade: that same effort spent on a live PlantBrain demo embed, or a real project walkthrough, would convert far better. At minimum it should never return above the work section.

---

## MODERATE

### U1. Footer text fails WCAG AA contrast in *both* themes

Measured against the page background:

| Element | Dark | Light | AA needs |
|---|---|---|---|
| **Footer** | **2.56** | **2.66** | 4.5 |
| Light-mode eyebrow (`01 / Identity`) | 7.71 | **4.08** | 4.5 |
| Card body (`.principle p`) | 4.35 | 5.41 | 4.5 |

The footer holds your degree, location, and "Open to internships" — real information, rendered nearly invisible. `--ink-faint` is too dim for text at that size.

**Fix:** Use `--ink-dim` for footer text (already passes), and darken the light-mode `--accent` slightly to clear 4.5.

### U2. No `<main>` landmark, no skip link

Screen-reader and keyboard users have no way to jump past ~10 nav links to content. Add a `<main>` wrapper around the sections and a visually-hidden skip link. Two minutes of work, and it is table stakes for a site claiming engineering rigor.

### U3. 19 tap targets under 44 px on mobile

Including the theme toggle (38×38), hamburger (42×38), and every "View on GitHub" / "Live demo" button (40 px tall). Below both Apple's 44 pt and Google's 48 dp guidance. Not broken, but fiddly on a phone — and a chunk of your traffic (a recruiter opening a link from LinkedIn's in-app browser) is mobile.

### U4. `sitemap.xml` `lastmod` is stale

Still `2026-07-12`. The site has changed substantially since. Trivial fix, but it is exactly the sort of detail your Build Philosophy section claims you care about.

### U5. Page weight: 213 KB of HTML in one file

29 KB of that is the embedded internal files from C1. Removing those alone cuts ~14%. Beyond that, the single-file architecture remains ironic for a site with a "Centralize context / Clean over clever" philosophy panel — an interviewer asking "walk me through your portfolio's structure" gets "it is one 2,700-line HTML file."

Not urgent (it works, and it loads fast), but do not volunteer the file structure in an interview.

---

## MINOR

- **Résumé filename** is `Mridul_Negi_Resume.pdf`; your own stated convention is `Mridul_Negi_Software_Developer_Resume.pdf` (name + role + "Resume"). The role keyword helps when a recruiter has 200 PDFs in a folder.
- **Meta description** never says "backend" — the single most important keyword for your target role. It leads with "B.E. Computer Engineering student."
- **The demo still names your tools in visible copy** (Claude, Antigravity, `handoff.md`). Fine as a differentiator, but it does put "I use three AI assistants" in front of a recruiter who may read it as dependence rather than discipline. Your call — it is the site's core thesis.
- **Light-mode grain overlay** uses `mix-blend-mode: multiply` at 0.02 — barely visible. Either commit to it or drop it.

---

## Unchanged by your explicit decision (not re-litigated)

These were flagged in review #1 and you deliberately kept them. Noting only so the record is complete — no action expected:

- Personal Gmail as the contact address (you retain it after college).
- "6 years live" on Cosmic Bot (you built before pushing to git) — but see **M1**, it now conflicts with your timeline.
- No phone number on site (LinkedIn only, to avoid spam calls).
- Mahoraga shown without team attribution.

---

## Scores

| | Review #1 | Now | Note |
|---|---|---|---|
| **Design quality** | 8/10 | **8.5/10** | Light mode and the theme reveal are genuinely well-executed. Still zero imagery. |
| **Content quality** | 4/10 | **7/10** | PlantBrain, Experience, and certs closed the biggest gaps. Résumé mismatch and the timeline contradiction hold it back. |
| **Recruiter effectiveness** | 3/10 | **6.5/10** | Work leads, credentials are present and verifiable. The splash, the missing visuals, and the stale OG image cap it. |
| **Technical credibility** | — | **5/10** | New axis. The exposed brief (C1) is the reason this is not higher — it actively contradicts the site's central claim. |

## If you fix only three things

1. **Delete the embedded brief** (C1). Ten seconds of work. It is currently the strongest argument against everything the site asserts about you.
2. **Put PlantBrain on your résumé** (C2). The document that actually reaches hiring managers is missing your best project.
3. **Add one image per case study** (M2). The highest-leverage visual change available, still unclaimed after two reviews.

Then: regenerate the OG image, add a focus ring, and reconcile the timeline with the 6-year claim.
