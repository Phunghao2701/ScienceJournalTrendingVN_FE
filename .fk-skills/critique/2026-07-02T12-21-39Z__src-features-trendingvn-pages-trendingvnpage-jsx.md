---
target: TrendingVN main page (/)
total_score: 26
p0_count: 0
p1_count: 3
timestamp: 2026-07-02T12-21-39Z
slug: src-features-trendingvn-pages-trendingvnpage-jsx
---
# Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3/4 | Three different loading idioms coexist (skeleton rows, "..." placeholders, Bootstrap Spinner) with no shared vocabulary |
| 2 | Match System / Real World | 3/4 | "LibKey"/"WorldCat" buttons are foreign, undefined concepts with no clear relevance to a VN-scope tool |
| 3 | User Control and Freedom | 3/4 | Institution auto-match silently rewrites free-text search with no way to opt out |
| 4 | Consistency and Standards | 2/4 | Two incompatible modal chrome systems on the same feature (custom red-circle close vs Bootstrap Modal.Header) |
| 5 | Error Prevention | 2/4 | Export UI implies "10/50/100" but only slices what's already loaded on the current page — silent under-delivery |
| 6 | Recognition Rather Than Recall | 3/4 | Filter/view state is URL-synced and visibly stateful — solid |
| 7 | Flexibility and Efficiency | 3/4 | Real power features (grouping, column customization, 3 view modes) buried behind icon-only buttons with tooltip-only labels |
| 8 | Aesthetic and Minimalist Design | 3/4 | Stats bar alone renders 7 distinct accent hues just to differentiate categories — busier than "calm research instrument" |
| 9 | Error Recovery | 2/4 | List/Table error state does a hard `window.location.reload()`; Analysis error state does a scoped `refetch()` — inconsistent, and reload wipes local view state |
| 10 | Help and Documentation | 2/4 | Article detail page has a real "Query Syntax Help" modal; the main search bar where users start has no equivalent |
| **Total** | | **26/40** | **Acceptable — significant improvements needed before users are happy** |

# Anti-Patterns Verdict

**LLM assessment**: The dominant tell here isn't generic "AI slop" gradients/cards — it's cloned-product bleed-through, which the project's own design principles explicitly warn against. CSS classes are `lens-*` prefixed throughout, the article detail page copies Lens.org's "SCHOLARLY REGISTRY" box with LibKey/WorldCat buttons verbatim, and file header comments plus a shipped i18n string ("{{count}} Articles (ResearchPulse Database)") reference an unrelated prior product by name. One isolated decorative gradient on the profile avatar breaks an otherwise flat, restrained palette.

**Deterministic scan**: `detect.mjs` flagged 3 findings in `src/features/trendingVN`:
- **Side-tab accent border** (warning) — `ArticleDetailPage.jsx:977`, `borderLeft: '4px solid #2b54b2'` on the TL;DR callout. This is the single most recognizable AI-slop tell, and the LLM review independently flagged the exact same line — strong agreement between both assessments.
- **Layout property animation** (warning) — `trendingVN.css:820` (`transition: max-width`) and `:948` (`transition: width`), both imported by `PublisherGrid.jsx`, `ArticleDetailPage.jsx`, `TrendingVNPage.jsx`. Animating layout properties causes reflow/jank; the LLM review didn't independently surface this since it's a runtime-perf concern rather than a visual one — the detector caught something outside the read-based review's blind spot.

No false positives from the deterministic scan.

**Visual overlays**: Not available this run — no browser automation tool is present in this environment, so the live-server/injection overlay flow could not run. This is a fallback signal, not a skipped step: the review is based on a full read of the source/CSS/JSX plus the static detector scan, not on live rendering.

# Overall Impression

The feature has real engineering discipline underneath — URL-synced filters, explicit loading/empty/error/success branches on every data region, documented contracts against cross-view state bleed — but it doesn't yet feel like *this* product. It still visibly carries the DNA of the Lens.org clone it started from (class names, a foreign brand string in shipped copy, borrowed UI chrome), and the main page tries to show too much at once (7-color stats bar, 4 always-on sidebar panels, a 10-item flat filter list) with no single clear entry point. The single biggest opportunity: finish decoupling from the donor product's vocabulary and cut the simultaneous-visible surface area — both are execution gaps on top of an already-solid data/state foundation, not a redesign.

# What's Working

- Every major data region implements all four states explicitly and correctly: skeleton rows + dedicated empty-state-with-reset for the article list, and `AnalysisDashboard.jsx` / `PublisherGrid.jsx` each branch loading/error/empty/success as four distinct paths.
- Filter and view state is fully URL-driven (`useTrendingFilters`, `trendingViewParams.js`), making filtered views shareable, bookmarkable, and back/forward-safe — a real asset for reproducible research workflows.
- Deliberate contract discipline: comments at `TrendingVNPage.jsx:356-358, 792-794` explicitly document why the Analysis view never falls back to stale list data — the kind of rigor a research-credibility surface needs.

# Priority Issues

**[P1] Cloned-product brand/vocabulary bleed-through**
- **Why it matters**: Violates the project's own design principle against letting an old cloned project's style bleed into Trending VN, and it's not just internal (class names) — it reached shipped, user-facing copy ("ResearchPulse Database" in both `en.json:130` and `vi.json:130`) and visible UI chrome (LibKey/WorldCat buttons with no relevance to this product).
- **Fix**: Rename `lens-*` CSS classes to project-scoped names, remove or replace the LibKey/WorldCat buttons, and fix the "ResearchPulse Database" string in both locale files.
- **Where**: `src/features/trendingVN/trendingVN.css` (class prefixes throughout), `ArticleDetailPage.jsx:2-3, 902-924`, `useArticleList.js:2`, `en.json:130`, `vi.json:130`.
- **Suggested command**: `/fk calm` (strip the borrowed chrome) or `/fk spec` (re-baseline the design system so this doesn't recur).

**[P1] False affordance on the date-range chart**
- **Why it matters**: The sidebar hint reads "Highlight a selection to filter by date," but no drag/brush handling is wired to the SVG bars. A false affordance on a data-trust surface is worse than none — it teaches researchers the tool doesn't do what it claims.
- **Fix**: Either implement brush-select-to-filter, or remove the hint text and rely on the From/To year selects that already exist elsewhere on the page.
- **Where**: `TrendingVNPage.jsx:1392-1431` (chart), `:1428-1431` (hint text), `chartHint` key in `en.json`/`vi.json:182`.
- **Suggested command**: `/fk copy` (cut the false promise) then `/fk motion` if the interaction gets built.

**[P1] Too many simultaneously-visible UI zones, no clear entry point**
- **Why it matters**: Fails the cognitive-load chunking rule (≤4 items/group) and the product's own "keep exploration task-first" principle. A 7-segment colored stats bar, a two-row sticky toolbar, a chips bar, and 4 permanently-visible sidebar analytics panels are all on screen at once — 5 of 8 cognitive-load checklist items fail overall (verdict: high load).
- **Fix**: Cap visible stat segments to ≤4 with a "more stats" disclosure; consider tabbing the 4 sidebar panels instead of stacking them.
- **Where**: `TrendingVNPage.jsx:795-846` (stats bar), `:1131-1434` (sidebar panels).
- **Suggested command**: `/fk trim` then `/fk space`.

**[P2] Inconsistent, data-destructive error recovery**
- **Why it matters**: List/Table view recovers from errors via a hard `window.location.reload()` (`TrendingVNPage.jsx:1042`) while Analysis view uses a scoped `refetch()` (`AnalysisDashboard.jsx:37-41`). The reload path silently destroys any local `visibleColumns`/`groupingMode` state the user just configured — inconsistent per heuristic #4/#9, and needlessly destructive.
- **Fix**: Use the `refetch` already exposed by `useArticleList` instead of a full-page reload.
- **Where**: `TrendingVNPage.jsx:1042` vs. `useArticleList.js:192`.
- **Suggested command**: `/fk prod`.

**[P2] No data-freshness indicator anywhere on the page**
- **Why it matters**: The product's own review criteria name this directly — administrators making trend decisions from this page have no way to know how current the numbers are.
- **Fix**: Surface a "last updated" timestamp from the analytics/analysis API response near the stats bar or page title.
- **Where**: nearest candidate location `TrendingVNPage.jsx:766-772` (top info bar).
- **Suggested command**: `/fk prod`.

# Persona Red Flags

**Jordan (First-Timer)**: The left icon rail (`TrendingVNPage.jsx:472-491`) is icon-only with `title`-only tooltips — no persistent text labels. Two of the six icons (the bare chevron-right and the filter icon) open the *same* filters drawer tab with zero visual distinction (`:476-481`). A first-time user has no way to learn what any icon does without hovering each one individually.

**Sam (Accessibility-Dependent)**: Home/Info/More sidebar buttons rely on `title` only, not `aria-label` (`:473, 485, 488-490`) — `title` isn't reliably exposed to assistive tech or visible on keyboard focus. Worse, this is inconsistent within the same feature: the author bar chart correctly wires `role="button"`/`aria-label`/`onKeyDown` for its interactive bars (`:1278-1282`), but the date-range chart's bars — rendering the same kind of data — have none of that (`:1399-1423`).

**Riley (Stress Tester)**: `groupingMode` and `visibleColumns` are plain component state, not URL-persisted, so the forced-reload error path (P2 above) silently wipes them. Separately, typing a query that fuzzy-matches a known institution name silently converts free-text search into an institution filter and clears the typed text (`TrendingVNPage.jsx:254-266`) with no confirmation — a stress-tester who typed something more specific than an institution name gets redirected without warning.

# Minor Observations

1. Three different loading idioms coexist on one page (skeleton rows, `"..."` text placeholders, Bootstrap `Spinner`) with no shared vocabulary.
2. Detector-caught: `trendingVN.css:820` and `:948` animate `max-width`/`width` directly — causes layout thrash; should animate `transform`/`opacity` or use `grid-template-rows` instead.
3. The colored intro-card template (icon + `primary-light` bg + `primary` border) is copy-pasted identically across three tabs (Citations/References/Recommended) rather than factored into a shared component (`ArticleDetailPage.jsx:1242, 1279, 1316`).
4. `SCHOLARLY REGISTRY` box has a hardcoded fallback ID `'002-248-963-102-184'` (`ArticleDetailPage.jsx:906`) that would render literally in production if the real ID is missing.
5. `generateBibTeX`/`generateRIS` fall back to hardcoded demo-looking defaults (`'3233'`, `'ArXiv.org'`, `'2025'`) when article fields are missing (`ArticleDetailPage.jsx:502-523`).
6. One isolated decorative gradient on the profile avatar (`trendingVN.css:1641`) stands out against an otherwise flat, restrained palette.

# Questions to Consider

- Is Lens.org actually the design system this product wants to be measured against, or did the vocabulary — down to a leftover "ResearchPulse" brand name in shipped copy — arrive by inheritance rather than decision?
- With 7 colored stat segments, a 10-item flat filter list, and 4 permanently-visible sidebar panels rendered at once, what single task is this screen optimized for — and could a new user answer that without reading the code?
- If the underlying numbers were a week stale, how would a journal analyst find out from this page today?
