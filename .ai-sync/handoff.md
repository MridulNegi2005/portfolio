# Active Handoff
> Last updated by: Claude Code
> Timestamp: 2026-07-15T01:34:00

## Current Task
Mobile refinement of the portfolio (`index.html`) — **COMPLETED, ready for review.**

## Done this session
1. **Card-deck jitter + threshold** — mobile stack swipe refactored: `touchmove` moves only
   the front card (rAF-batched); background cards styled once via `applyResting()`; axis-lock
   with non-passive `preventDefault` on horizontal; `.stack-panel.animating` class drives
   transitions (no per-move `style.transition`). Threshold raised `80 → max(90, 30% width)`
   (=112px @375). Velocity flick removed (was too easy to trigger). Forward-only kept.
   Verified: front follows finger, background static per move, 70px swipe = no advance,
   200px = advance once.
2. **Gyroscope tilt** — `deviceorientation` maps gamma/beta → lens `mx/my` with low ambient
   `aT`, deadzone when still; iOS `requestPermission` on first tap; **no fallback** if
   unsupported; gated to `(pointer:coarse)` and skipped under reduced-motion.
   (Not runtime-testable in a desktop pane — verified by code review + clean parse.)
3. **Pipeline arrows** — feeder lines got downward chevrons; stage-to-stage flow arrows added
   (→ desktop / ↓ mobile); `.pipe` simplified to 4-col desktop / 1-col ≤760px; removed
   `overflow:hidden` from `.stage` (accordion body clips itself) so gutter arrows aren't
   clipped. Verified both layouts, accordion still opens.

## Next Steps
Review on a real phone (gyro + swipe feel). Then this is deploy-ready. Remember to `git add`
`Mridul_Negi_Resume.pdf` alongside `index.html` when publishing.

## Key Files Modified
- `index.html` (in progress — CSS ~168-215 & ~355-400, pipe HTML ~514-532, stack JS ~822-946, grid IIFE ~1019-1068)
- `Mridul_Negi_Resume.pdf` (added, repo root — must be deployed alongside index.html)
- `DESIGN.md` (added)
- `.ai-sync/context.md` (this handoff)

## ⚠️ Note for the next agent
The current working `index.html` is **ahead** of the 2026-07-12 log entries. Do not restore
or hand-merge the old `mobile-responsive` branch over it — you'll lose the real projects,
résumé, logos, and grid fixes. Branch from current state instead.
