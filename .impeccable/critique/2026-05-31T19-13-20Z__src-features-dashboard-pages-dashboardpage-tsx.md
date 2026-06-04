---
target: dashboard
total_score: 26
p0_count: 0
p1_count: 3
timestamp: 2026-05-31T19-13-20Z
slug: src-features-dashboard-pages-dashboardpage-tsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Skeletons + count-up + progress bar are solid; refresh button gives no in-progress feedback |
| 2 | Match System / Real World | 4 | Plain student language throughout ("Study time", "Due today", "All caught up") |
| 3 | User Control and Freedom | 3 | Filter dismisses cleanly; read-only surface needs little undo |
| 4 | Consistency and Standards | 3 | Cohesive rounded-2xl/indigo system; custom dropdown reinvents a select |
| 5 | Error Prevention | 2 | No failed-load/error state; if data fetch fails the screen has no recovery path |
| 6 | Recognition Rather Than Recall | 2 | Icon-only bottom nav, no text labels |
| 7 | Flexibility and Efficiency | 3 | Time filter is a good accelerator; no other power paths (fine for mobile) |
| 8 | Aesthetic and Minimalist Design | 2 | Decorative hero blobs + gradient + eyebrows add non-functional noise |
| 9 | Error Recovery | 2 | No error messaging surface on the dashboard |
| 10 | Help and Documentation | 2 | None; mostly self-evident, empty state teaches |
| **Total** | | **26/40** | **Acceptable — significant improvements needed** |

## Anti-Patterns Verdict

**Does this look AI-generated? Yes, in the one way you explicitly said to avoid.**

**LLM assessment:** The hero is the textbook SaaS "hero-metric template" — indigo gradient (`from-indigo-600 to-indigo-500`), two decorative translucent blobs (`bg-white/10`, `bg-white/5`), a giant 5xl percentage, and supporting stats. That is on impeccable's absolute-ban list and is exactly the "generic AI SaaS template" you named as anti-reference #1. Compounding it: tiny uppercase tracked eyebrows (`text-xs uppercase tracking-widest text-zinc-400`) appear on four blocks — the greeting, "Overall Progress", "Study time", "Courses" — which is the single most common AI tell (the eyebrow-on-every-section reflex). The 2-up stat grid is a mild case of the identical-card-grid pattern.

**Deterministic scan:** `detect.mjs` flagged 2 `ai-color-palette` warnings in `DashboardPage.tsx` — the indigo gradient (line 96) and `text-indigo-300` on the heading (line 107). The detector agreed with the hero finding but did not catch the eyebrow repetition or the contrast problem; those came from the design review. No false positives.

**Visual overlays:** Not available — no browser automation in this environment, so there is no in-page overlay. Findings are from source review + the CLI detector only.

## Overall Impression

Structurally this is a good dashboard: clear top-to-bottom priority (progress → context filter → stats → what's next), genuine skeleton loading, and a reassuring empty state. The problem is the surface dressing fights both the brief and itself. You asked for "sharp & efficient" and "not generic AI SaaS," but the hero is the most recognizable AI-SaaS object there is, and the page greets you with an emoji and animates every number on load — warm/decorative signals, not sharp ones. The single biggest opportunity: strip the hero from a gradient showpiece down to a precise, high-contrast progress readout, and the whole screen snaps toward the brand.

## What's Working

- **Skeletons, not spinners.** Loading uses sized `Skeleton` blocks that match final layout — exactly the product-UI guidance, and it prevents content-shift.
- **The empty state teaches and reassures.** "All caught up! / Nothing due in the next 7 days" with the green check is a real peak-end moment, not a dead "No results."
- **Countdown badges pair color with a text label.** "Overdue" / "Due today" / "1 day left" carry meaning in text, not color alone — so the red/amber/blue is reinforcement, not the only signal. This is the accessible way to do status color.

## Priority Issues

- **[P1] The hero card is the AI-SaaS hero-metric template.** Gradient fill + two decorative blobs + giant number is your stated anti-reference, rendered literally.
  - *Why it matters:* It's the first thing a user sees, and it's the exact "AI made this" object you wanted to avoid. It also reads as marketing-decorative, not sharp/efficient.
  - *Fix:* Drop the gradient and the `bg-white/10` blobs. Make the hero a flat surface (white or a single solid brand tone) where the number carries weight through size + weight alone. Keep the thin progress bar; lose the ornamental circles.
  - *Suggested command:* `/impeccable quieter` (then `/impeccable colorize` to re-place accent intentionally)

- **[P1] Uppercase tracked eyebrows on every block.** `uppercase tracking-widest text-zinc-400` appears 4× (greeting, Overall Progress, Study time, Courses).
  - *Why it matters:* Eyebrow-on-every-section is the most saturated AI tell; it also flattens hierarchy because four labels share one treatment.
  - *Fix:* Use sentence-case labels and let size/weight create hierarchy. Reserve any all-caps for at most one deliberate spot.
  - *Suggested command:* `/impeccable typeset`

- **[P1] `text-zinc-400` used as label and body text on white fails contrast (~2.6:1).** It's on stat labels, sublabels ("today", "tasks pending"), course names in the task list, and the empty-state subtext.
  - *Why it matters:* Body/label text needs 4.5:1; zinc-400 on white/zinc-50 is roughly 2.6:1, so it's hard to read for everyone, not just low-vision users. This is impeccable's single most-cited failure.
  - *Fix:* Move secondary text to `zinc-500`/`zinc-600` (and reserve zinc-400 for genuinely decorative, non-essential marks). Re-check the indigo-200/300 text on the hero too.
  - *Suggested command:* `/impeccable colorize` (or `/impeccable polish` for the contrast sweep)

- **[P2] Icon-only bottom nav with no labels.** `BottomNav` renders four Lucide icons (dashboard, courses, tracker, profile) with no text and no `aria-label`.
  - *Why it matters:* A first-timer can't tell "tracker" (clock) from "courses" (book) without tapping; a screen reader announces nothing useful. Recognition-over-recall fail.
  - *Fix:* Add a short text label under each icon (standard mobile tab-bar pattern), or at minimum `aria-label` on each `NavLink`.
  - *Suggested command:* `/impeccable clarify`

- **[P2] No error / failed-load state.** `DashboardPage` only branches on `loading` vs `data`; a failed fetch has no UI and no retry.
  - *Why it matters:* On flaky campus wifi (your stated user context) the screen can sit empty or half-rendered with no way forward.
  - *Fix:* Add an error branch with a plain message and a retry button reusing the existing `refresh`.
  - *Suggested command:* `/impeccable harden`

## Persona Red Flags

**Casey (distracted mobile student — project persona):** Bottom nav sits correctly in the thumb zone, good. But the two actions on this screen, **Refresh** and the **time filter**, are both top-right, the hardest one-handed reach. The filter state (`useState`) is component-local, so leaving and returning resets it to "Today". Count-up animations (700–900ms) make Casey wait to read a number they glanced at for one second.

**Sam (accessibility-dependent):** `text-zinc-400` body text fails 4.5:1; `text-indigo-200`/`-300` on the hero is borderline at small sizes. The bottom nav icons have no `aria-label`, so the tab bar is unlabeled to a screen reader. The refresh icon button is also unlabeled. Active nav state is conveyed by color (indigo) + weight, which is acceptable, but the nav targets need names.

**Jordan (confused first-timer):** Lands and sees four unlabeled icons. The clock (tracker) vs book (courses) distinction is a guess. The time-filter pill ("Today ▾") sits above the stat grid but only changes "Study time", so Jordan reasonably expects it to filter the whole dashboard and is confused when the progress number doesn't move.

## Minor Observations

- **Filter scope is ambiguous.** The Today/7d/All control visually governs the area below it, but only affects the study-time stat. Either move it into the study-time card or make its scope explicit.
- **Refresh has no feedback.** The icon doesn't spin or disable while refreshing; tapping it appears to do nothing on fast loads.
- **Tone vs brief.** The 👋 emoji + "Good morning" greeting and the load-time count-up animations read "friendly/warm," which is mild tension with the chosen "sharp & efficient" personality. Per product motion guidance, avoid orchestrated page-load number animations — users want the value, not the choreography.

## Questions to Consider

- Does "overall progress" need to be a colored showpiece card at all, or would a precise number + a thin rule feel sharper and more trustworthy?
- Should the time filter govern the entire dashboard (progress, pending, study time together), or is it genuinely study-time-only? Either is fine, but the UI should make the answer obvious.
- If the brand is "sharp & efficient," what is the emoji greeting and the 900ms count-up doing for the user on every single load?
