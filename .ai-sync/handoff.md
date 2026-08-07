# Active Handoff
> Last updated by: Claude Code
> Timestamp: 2026-08-07T03:10:00+05:30

## Current Task
Portfolio revamp on branch `portfolio-revamp`. **Complete and verified, not pushed.**
Executed from `PORTFOLIO-REVAMP-PLAN.md` (built from the brutal review in `PORTFOLIO-REVIEW.md`).

## Done this session
- Reverted a prior broken edit pass to the last good commit `38703f3`. The broken version is
  saved in git `stash@{0}` ("gemini-broken-changes-backup-2026-08-07").
- Reordered sections: Work up to 02, new Experience section at 03, Sync demo down to 07.
  Renumbered eyebrows 01–09 and reordered the nav.
- New Experience & credentials section: ELC internship + 5 NVIDIA DLI certs with verify links + GPA/degree.
- Copy fixes: new title/OG positioning, hero subtext, hero stats, About heading, removed self-deprecation.
- Polish: removed TypeScript, real timeline years, new footer line, SVG hamburger, aria-labels, Gemini note.
- **Light mode:** dark default + nav toggle + `localStorage`; `:root[data-theme="light"]` palette;
  WebGL `u_bg`/`u_line` uniforms; demo stays dark; `theme-switching` class fixes a Chromium var() bug.
- `DESIGN.md`: added a Light mode section. `.ai-sync/context.md`: logged the session.

## Next steps
1. **User to eyeball both themes** on a real screen (screenshots do not composite in this environment).
2. **Run the security-review agent** (Opus 4.8, high effort) over the diff before any push (global rule).
3. The work is committed on branch `portfolio-revamp`; push only after review passes and the user approves.

## Awaiting user decision (deferred, not done)
- **PlantBrain:** add it as a project (likely replacing The Loop). The project-card markup is a clean,
  repeatable pattern, so a 4th card or a swap is trivial.
- **U4 project visuals:** choose CSS/SVG architecture diagrams (self-contained) OR real screenshot slots
  (user supplies PNGs into a new `work/` folder). The plan documents both.
- **`og-image.png`:** still reads "Systems-minded software engineer". Regenerate to match the new
  positioning if link previews matter.

## Do NOT change (explicit user choices)
- Contact email stays the personal Gmail (`negimridul2005@gmail.com`).
- Cosmic Bot "6 years live" claim stays.
- No phone number on the site (LinkedIn only).
- Mahoraga card stays without team attribution.

## Notes for the next agent
- The site is one file: `index.html`. Edit sequentially; do not run two file-editing passes at once.
- The `#demo` section embeds verbatim `<script type="text/plain" id="f-*">` copies of the sync files
  and a full self-copy (`id="f-index"`). Any raw `</script>` inserted there breaks the block — avoid.
- The theme toggle relies on `window.__setGridTheme` (defined in the WebGL IIFE) to recolor the grid.
- Deploy list is unchanged: `index.html` + `Mridul_Negi_Resume.pdf` + the four icon files + `og-image.png`.
