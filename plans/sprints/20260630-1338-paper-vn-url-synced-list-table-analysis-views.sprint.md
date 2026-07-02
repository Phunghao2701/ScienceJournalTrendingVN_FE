---
title: "Paper VN URL-Synced List Table Analysis Views Sprint"
kind: "sprint"
created_at: "2026-06-30T06:38:22.357Z"
source: "repo-harness-mcp"
---
# Paper VN URL-Synced List Table Analysis Views Sprint

> **Status**: Draft

## Source

- PRD: `plans/prds/20260630-1337-paper-vn-url-synced-list-table-analysis-views.prd.md`

## Execution Rule

- Execute task cards in order.
- Keep each task card reviewable as one staged slice.
- After every completed phase, update the checklist and stage the result before continuing.
- Do not treat unstaged work as a completed phase.

## Checklist

### Task Card 1: FE-VIEW-01 — Baseline, branch safety and failing utility tests

- [x] Objective: Confirm branch ngoc/feature/trending-lens-style, preserve all unrelated dirty/staged work, inspect the backend analysis contract and current TrendingVNPage query behavior, then add pure regression tests for view normalization, URL switching, analysis parameter mapping and response formatting before implementation.
- [ ] Files/entrypoints: `.git/HEAD`, `src/features/trendingVN/pages/TrendingVNPage.jsx`, `src/features/article/hooks/useArticleList.js`, `src/features/article/hooks/useArticleAnalytics.js`, `src/features/article/utils/paperVnDiscoveryParams.js`, `scripts/paperVnAnalysis.test.mjs`, `package.json`
- [x] Verification: `Confirm branch ngoc/feature/trending-lens-style`, `Record git status --short`, `Read BE contract docs/researches/paper-vn-trending-analysis-api-contract.md from the sibling backend repo`, `Demonstrate failing tests for invalid view fallback, preserving filters, removing page on analysis switch, growth formatting and analysis params`, `No live backend access in automated tests`
- [x] Stage gate: Stage only baseline evidence, pure utilities/test harness and expected-red tests.

### Task Card 2: FE-VIEW-02 — Make view mode canonical and URL-driven

- [x] Objective: Replace local viewMode state with normalized URL state. Canonical List removes the view query parameter; Table uses view=table; Analysis uses view=analysis. Preserve discovery and analysis filters through view switches and browser navigation.
- [ ] Files/entrypoints: `src/features/trendingVN/utils/trendingViewParams.js`, `src/features/trendingVN/pages/TrendingVNPage.jsx`, `src/features/article/hooks/useArticleList.js`, `src/features/article/utils/paperVnDiscoveryParams.js`, `scripts/paperVnAnalysis.test.mjs`
- [x] Verification: `Refresh and back/forward derive active view from searchParams`, `Invalid view falls back to List and can be canonicalized without deleting filters`, `Switch to Analysis removes irrelevant page but retains search/entity/access/year/from_year/to_year`, `Switch to List/Table resets page to 1 or a documented safe value`, `List URL is `/articles` plus filters without `view=list``, `No direct setViewMode local state remains`
- [x] Stage gate: Stage URL/view-state changes after pure URL tests pass.

### Task Card 3: FE-VIEW-03 — Add analysis API, mapper and conditional TanStack queries

- [x] Objective: Add `getArticleAnalysisApi`, a stable analysis response mapper, and `useArticleAnalysis`. Make list and lightweight analytics hooks accept explicit enabled options so only the query needed by the active view runs.
- [ ] Files/entrypoints: `src/features/article/api/articleApi.js`, `src/features/article/hooks/useArticleList.js`, `src/features/article/hooks/useArticleAnalytics.js`, `src/features/trendingVN/hooks/useArticleAnalysis.js`, `src/features/trendingVN/utils/paperVnAnalysis.js`, `scripts/paperVnAnalysis.test.mjs`
- [x] Verification: `Analysis API calls `/articles/analysis``, `Analysis params always include scope=vn_universities`, `Analysis params omit page, sortBy and sortOrder`, `publication_year and from_year/to_year semantics match BE contract`, `Analysis query enabled only in view=analysis`, `Article list and lightweight analytics queries disabled in view=analysis`, `Mapper normalizes numeric strings, missing arrays, window, summary, top/growth and coverage without inventing data`, `React Query keys include all analysis filters/window params`
- [x] Stage gate: Stage API/hook/mapper changes after pure mapper tests and scoped lint pass.

### Task Card 4: FE-VIEW-04 — Build Analysis summary and time-series UI

- [x] Objective: Create a full-width responsive Analysis dashboard shell with summary cards, current/comparison window context, works-over-time and citations-over-time charts. Use dependency-free SVG/CSS and accessible text/table fallbacks where appropriate.
- [ ] Files/entrypoints: `src/features/trendingVN/components/analysis/AnalysisDashboard.jsx`, `src/features/trendingVN/components/analysis/AnalysisSummary.jsx`, `src/features/trendingVN/components/analysis/AnalysisTimeSeriesChart.jsx`, `src/features/trendingVN/trendingVN.css`, `src/shared/i18n/locales/en.json`, `src/shared/i18n/locales/vi.json`
- [x] Verification: `Summary shows scholarly works, total citations, total references, authors, institutions, journals and OA open/closed/unavailable`, `Available citing works/references are labeled as available local records, not imported totals`, `Charts render all years supplied by BE and handle all-zero series`, `Citation chart displays total_articles_with_history coverage`, `Current and comparison windows are understandable`, `Loading skeleton, API error, empty cohort and partial coverage states exist`, `Charts have aria labels or adjacent textual summaries`, `Responsive layout works at desktop/tablet/mobile CSS breakpoints`
- [x] Stage gate: Stage summary/time-series UI after scoped ESLint and component source review pass.

### Task Card 5: FE-VIEW-05 — Build entity ranking, growth and trending article UI

- [x] Objective: Render Top and Growth independently for institutions, authors, journals, topics and keywords, plus a trending-articles table/cards with real citation activity and coverage. Reuse existing entity filter semantics and detail navigation.
- [ ] Files/entrypoints: `src/features/trendingVN/components/analysis/AnalysisEntityPanel.jsx`, `src/features/trendingVN/components/analysis/AnalysisTrendingArticles.jsx`, `src/features/trendingVN/components/analysis/AnalysisDashboard.jsx`, `src/features/trendingVN/utils/paperVnAnalysis.js`, `src/features/trendingVN/trendingVN.css`, `src/shared/i18n/locales/en.json`, `src/shared/i18n/locales/vi.json`
- [x] Verification: `Top and Growth use separate response arrays and controls`, `Entity type switching supports institutions/authors/journals/topics/keywords`, `Entity click applies the matching ID filter and keeps view=analysis`, `Unknown/missing IDs render as non-clickable text`, `growth_rate decimal is formatted as percent; null renders New or N/A, negative values render decrease`, `Trending articles show title, year, journal, current/previous citations, absolute growth and imported citation total`, `Trending coverage eligible/total is visible and not described as full coverage`, `Article click navigates to detail with returnTo preserving analysis URL`, `Empty entity/trending lists have meaningful states`
- [x] Stage gate: Stage entity/trending UI after interaction source checks and mapper tests pass.

### Task Card 6: FE-VIEW-06 — Integrate three modes and fix lightweight sidebar mappings

- [x] Objective: Integrate the Analysis dashboard into TrendingVNPage without bloating it further. List and Table retain the right insight sidebar; Analysis is full width and hides list-only actions/pagination. Fix dynamic year/access mappings and current return-path behavior.
- [ ] Files/entrypoints: `src/features/trendingVN/pages/TrendingVNPage.jsx`, `src/features/article/hooks/useArticleAnalytics.js`, `src/features/trendingVN/components/PublisherGrid.jsx`, `src/features/trendingVN/trendingVN.css`, `src/shared/i18n/locales/en.json`, `src/shared/i18n/locales/vi.json`
- [x] Verification: `Toolbar has three active states: List, Table, Analysis`, `Analysis button no longer toggles showSidebar`, `Analysis hides Expand/Customise/list export/sort/pagination controls that do not apply`, `List/Table continue to render article results and sidebar`, `List/Table lightweight analytics uses dynamic year rows, not hardcoded 2019–2026`, `Access mapping reads item.key and displays oa/closed/unknown`, `Top institutions remain preferred over publisher fallback`, `Top info/stat values derive from active view data without forcing disabled queries`, `buildResultsReturnPath preserves current pathname, filters and view`
- [x] Stage gate: Stage page integration only after scoped ESLint passes and no list/table regression is found in source review.

### Task Card 7: FE-VIEW-07 — Verification, browser/HTTP smoke and handoff

- [x] Objective: Run the pure analysis utility test, targeted ESLint and production build. Start Vite and smoke `/articles`, `/articles?view=table`, and `/articles?view=analysis`; when a browser runtime is available, verify network gating, back/forward, filter persistence and responsive states. Update Sprint, handoff and checks; do not commit or push.
- [ ] Files/entrypoints: `scripts/paperVnAnalysis.test.mjs`, `package.json`, `plans/sprints/20260630-1338-paper-vn-url-synced-list-table-analysis-views.sprint.md`, `.ai/harness/handoff/current.md`, `.ai/harness/checks/latest.json`
- [x] Verification: `npm.cmd run test:paper-vn-analysis passes`, `Targeted ESLint passes for all touched JS/JSX files`, `npm.cmd run build passes`, `Repo-wide lint attempted and unrelated debt documented`, `Vite HTTP smoke returns 200 for all three URLs`, `Source/network verification confirms `/articles/analysis` is absent in List/Table and present once in Analysis`, `List and lightweight analytics requests are absent in Analysis or documented if intentionally retained`, `Back/forward and filter/view URL behavior manually verified when browser is available`, `No new chart dependency, migration, backend edit, commit or push`
- [x] Stage gate: Stage final docs and checks only after exact verification evidence and residual risks are recorded.

## Final Acceptance

- [x] All task cards are checked.
- [x] Required checks pass.
- [x] Handoff explains staged state, residual risks, and next bottleneck if any.
