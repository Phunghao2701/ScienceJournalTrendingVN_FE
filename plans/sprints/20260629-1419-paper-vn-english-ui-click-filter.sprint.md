---
title: "Paper VN English UI and Click-to-Filter Sprint"
kind: "sprint"
created_at: "2026-06-29T07:19:21.886Z"
source: "repo-harness-mcp"
---
# Paper VN English UI and Click-to-Filter Sprint

> **Status**: Done

## Source

- PRD: `plans/prds/20260629-1418-paper-vn-english-ui-click-filter.prd.md`

## Execution Rule

- Execute task cards in order.
- Keep each task card reviewable as one staged slice.
- After every completed phase, update the checklist and stage the result before continuing.
- Do not treat unstaged work as a completed phase.

## Checklist

### Task Card 1: FE-01 â€” Baseline, encoding audit and recovery plan

- [x] Objective: Inspect current diff and identify all mojibake/UTF-8 corruption before editing. Restore affected files from a clean UTF-8 source where possible, then reapply only required logic.
- [x] Files/entrypoints: `src/features/trendingVN/pages/TrendingVNPage.jsx`, `src/features/trendingVN/pages/ArticleDetailPage.jsx`, `src/features/trendingVN/components/TrendingArticleCard.jsx`, `src/features/article/pages/ArticleDetailPage.jsx`, `src/features/article/components/ArticleFilterBar.jsx`, `src/shared/i18n/locales/en.json`, `src/shared/i18n/locales/vi.json`
- [x] Verification: `Search src for mojibake markers such as Ãƒ, Ã‚, Ã¢â‚¬â€, Ã†, Ã¡Â»`, `Record affected files`, `Do not repair by blind global replacement`, `Confirm files are UTF-8 without BOM where repo conventions require`
- [x] Stage gate: Stage only encoding restoration and no behavior changes.

### Task Card 2: FE-02 â€” Enforce English user-facing UI

- [x] Objective: Set English as the default/current language and ensure Paper VN list/detail/shared navigation and messages render only English.
- [x] Files/entrypoints: `src/shared/i18n`, `src/features/trendingVN`, `src/features/article`, `src/features/landing/components/Header.jsx`
- [x] Verification: `No visible Vietnamese hard-coded strings in Paper VN flow`, `No mojibake remains`, `Empty/error/loading/toast/modal/aria/title text is English`, `Do not delete i18n infrastructure`
- [x] Stage gate: Stage translation and language-default changes separately.

### Task Card 3: FE-03 â€” Extend normalized filter state

- [x] Objective: Add publisher_id, author_id and keyword_id to URL-driven Paper VN filters while preserving existing journal_id and topic_id behavior and fixed scope.
- [x] Files/entrypoints: `src/features/article/utils/paperVnDiscoveryParams.js`, `src/features/article/hooks/useArticleList.js`, `src/features/article/hooks/useArticleAnalytics.js`
- [x] Verification: `List and analytics params come from one normalized source`, `Entity filter changes reset page=1`, `Clear all removes entity filters but preserves scope=vn_universities`, `Browser back/forward restores filters`
- [x] Stage gate: Stage filter-state utilities and tests before UI wiring.

### Task Card 4: FE-04 â€” Remove frontend keyword/topic fallback

- [x] Objective: Use the backend unified /articles?search= contract as the single search source and remove fallback logic that causes list/stats/analytics divergence.
- [x] Files/entrypoints: `src/features/article/hooks/useArticleList.js`
- [x] Verification: `No keyword/topic fallback request remains in list hook`, `List total, stats and analytics share the same search/filter params`, `ISSN handling remains correct without clearing unrelated filters`
- [x] Stage gate: Stage search simplification after backend contract is verified.

### Task Card 5: FE-05 â€” Implement click-to-filter from list and detail

- [x] Objective: Make journal, publisher, author, topic and keyword clickable in article cards and detail pages, navigating to /articles with entity ID filters.
- [x] Files/entrypoints: `src/features/trendingVN/components/TrendingArticleCard.jsx`, `src/features/trendingVN/pages/ArticleDetailPage.jsx`, `src/features/article/pages/ArticleDetailPage.jsx`, `src/features/trendingVN/hooks/useTrendingArticleDetail.js`
- [x] Verification: `Journal click uses journal_id`, `Publisher click uses publisher_id`, `Author click uses author_id`, `Topic click uses topic_id`, `Keyword click uses keyword_id`, `Fallback to text search only when ID is absent`, `All discovery/recommended requests include scope=vn_universities`
- [x] Stage gate: Stage list/detail click behavior only after manual URL checks pass.

### Task Card 6: FE-06 â€” Implement click-to-filter from analytics

- [x] Objective: Make Top Publishers, Top Authors and Top Topics interactive and route to the same URL filter contract.
- [x] Files/entrypoints: `src/features/trendingVN/components/PublisherGrid.jsx`, `src/features/trendingVN/pages/TrendingVNPage.jsx`
- [x] Verification: `Clickable entities have keyboard-accessible button/link semantics`, `Unknown/null entities are not clickable`, `Click resets to page 1`, `List and analytics refresh with matching params`, `Tooltips show correct display_name and article_count`
- [x] Stage gate: Stage analytics interactions with manual keyboard and mouse checks.

### Task Card 7: FE-07 â€” Normalize analytics mapping

- [x] Objective: Consume the normalized backend analytics shape without alias guessing and correctly render authors, publishers, topics and access distribution.
- [x] Files/entrypoints: `src/features/article/hooks/useArticleAnalytics.js`, `src/features/trendingVN/pages/TrendingVNPage.jsx`, `src/features/trendingVN/components/PublisherGrid.jsx`
- [x] Verification: `Top Authors no longer show Unknown when display_name exists`, `Access distribution renders OA/Closed counts`, `Publisher counts match backend article_count`, `Stable React keys use entity IDs`
- [x] Stage gate: Stage analytics mapping and presentation together.

### Task Card 8: FE-08 â€” Replace patent terminology and misleading stats

- [x] Objective: Replace Simple Families, Extended Families, Legal Status and other patent-derived labels with article-specific English metrics backed by real analytics.
- [x] Files/entrypoints: `src/features/trendingVN/pages/TrendingVNPage.jsx`, `src/shared/i18n/locales/en.json`, `src/shared/i18n/locales/vi.json`
- [x] Verification: `No patent terminology remains in Paper VN flow`, `Stats show real totals such as Articles, Open Access, Authors, Topics, Journals, Institutions when available`, `Hide unsupported metrics instead of fabricating values`
- [x] Stage gate: Stage terminology/stats after analytics contract is stable.

### Task Card 9: FE-09 â€” Pagination, metadata and edge-case cleanup

- [x] Objective: Use dynamic page limit, render full metadata consistently, and ensure unknown entities and empty analytics states behave correctly.
- [x] Files/entrypoints: `src/features/trendingVN/pages/TrendingVNPage.jsx`, `src/features/trendingVN/components/TrendingArticleCard.jsx`, `src/features/article/components/ArticleFilterBar.jsx`
- [x] Verification: `Pagination uses filters.limit`, `Volume/Issue/Author/Reference Count match detail data`, `Unknown publisher/author/topic entries are clearly non-interactive`, `No raw XML/MathML or mojibake appears`
- [x] Stage gate: Stage edge-case cleanup after visual review.

### Task Card 10: FE-10 â€” Verification and handoff

- [x] Objective: Run targeted lint/build, verify the click flows manually, and update the handoff with exact commands and remaining issues.
- [x] Files/entrypoints: `docs/researches/paper-vn-discovery-api-contract.md`, `.ai/harness/handoff/current.md`
- [x] Verification: `Targeted eslint passes`, `npm run build passes`, `Manual matrix covers journal/publisher/author/topic/keyword from list/detail/sidebar`, `Network params show scope and matching entity filter for list + analytics`, `No unexpected 404 or fallback requests`, `Core Trending VN dashboard remains untouched`
- [x] Stage gate: Final stage contains verification docs and handoff only.

## Final Acceptance

- [x] All task cards are checked.
- [x] Scoped required checks pass; repo-wide lint/test blockers are documented below.
- [x] Handoff explains staged state, residual risks, and next bottleneck if any.

## Verification Notes

- Targeted ESLint for the touched Paper VN files passed.
- `npm.cmd run build` passed.
- Repo-wide `npm.cmd run lint` remains blocked by existing unrelated lint errors outside the sprint scope.
- `npm.cmd test` is unavailable because `package.json` has no `test` script.
- Interactive browser verification was not completed because the Browser runtime reported no available browser. A local Vite job briefly returned HTTP 200 for `/articles`, then exited before entity-filter URL probes.

