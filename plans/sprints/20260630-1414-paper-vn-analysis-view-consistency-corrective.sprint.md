---
title: "Paper VN Analysis View Consistency Corrective Sprint"
kind: "sprint"
created_at: "2026-06-30T07:14:30.905Z"
source: "repo-harness-mcp"
---
# Paper VN Analysis View Consistency Corrective Sprint

> **Status**: Draft

## Source

- PRD: `plans/prds/20260630-1414-paper-vn-analysis-view-consistency-corrective.prd.md`

## Execution Rule

- Execute task cards in order.
- Keep each task card reviewable as one staged slice.
- After every completed phase, update the checklist and stage the result before continuing.
- Do not treat unstaged work as a completed phase.

## Checklist

### Task Card 1: FE-FIX-01 — Baseline and failing regression tests

- [x] Objective: Confirm branch ngoc/feature/trending-lens-style, preserve unrelated dirty/staged work, confirm the BE institution/topic corrective contract is complete, and add failing pure tests for view-preserving clear/update behavior, exact returnTo, explicit-window precedence, long year ranges and dashboard cohort detection.
- [x] Files/entrypoints: `src/features/trendingVN/utils/trendingViewParams.js`, `src/features/trendingVN/utils/paperVnAnalysis.js`, `src/features/article/hooks/useArticleList.js`, `src/features/trendingVN/pages/TrendingVNPage.jsx`, `src/features/trendingVN/components/analysis/AnalysisDashboard.jsx`, `scripts/paperVnAnalysis.test.mjs`
- [x] Verification: `Confirm branch ngoc/feature/trending-lens-style`, `Record git status --short`, `Verify BE supports institution_id and primary-or-subtopic filtering`, `Run current paper-vn-analysis tests`, `Add expected-red tests for all identified FE gaps`, `No live backend access in pure tests`
- [x] Stage gate: Stage only regression tests and baseline evidence once failures are demonstrated.

### Task Card 2: FE-FIX-02 — Preserve view and remove Analysis pagination

- [x] Objective: Centralize URL update helpers so clear filters and filter updates preserve the active view. Analysis must never retain or add page; Table may safely reset page to 1; canonical List removes view.
- [x] Files/entrypoints: `src/features/trendingVN/utils/trendingViewParams.js`, `src/features/article/hooks/useArticleList.js`, `src/features/trendingVN/pages/TrendingVNPage.jsx`, `scripts/paperVnAnalysis.test.mjs`
- [x] Verification: `Clear from Analysis returns only view=analysis`, `Clear from Table returns view=table with safe pagination behavior`, `List clear returns canonical empty search params`, `Entity/filter update in Analysis deletes page`, `Table/List filter updates reset page to 1`, `Back/forward remains URL-driven`
- [x] Stage gate: Stage URL/filter behavior after pure tests pass.

### Task Card 3: FE-FIX-03 — Fix Analysis stats, returnTo and result count

- [x] Objective: Use Analysis summary values for top statistics or hide fields unavailable from the Analysis contract. Preserve the exact current location for detail returnTo and use activeResultTotal in navigation state.
- [x] Files/entrypoints: `src/features/trendingVN/pages/TrendingVNPage.jsx`, `src/features/trendingVN/components/analysis/AnalysisSummary.jsx`, `scripts/paperVnAnalysis.test.mjs`
- [x] Verification: `Analysis top bar uses scholarly_works, open_access_works, authors, institutions, journals and optionally total_citations`, `No Analysis stat reads disabled list/light analytics data`, `Topics/publishers are hidden in Analysis unless backed by contract data`, `returnTo equals location.pathname plus location.search`, `Detail state resultCount uses activeResultTotal`, `List/Table stats remain unchanged`
- [x] Stage gate: Stage stats/navigation fixes after scoped lint and source review pass.

### Task Card 4: FE-FIX-04 — Resolve analysis window precedence

- [x] Objective: Make explicit from_year/to_year take precedence over publication year in Analysis requests and URL/filter UI. Prevent contradictory chips and API params.
- [x] Files/entrypoints: `src/features/trendingVN/utils/paperVnAnalysis.js`, `src/features/article/hooks/useArticleList.js`, `src/features/trendingVN/pages/TrendingVNPage.jsx`, `scripts/paperVnAnalysis.test.mjs`
- [x] Verification: `When both from_year and to_year exist, buildPaperVnAnalysisParams omits publication_year`, `Setting explicit range removes year or documents and enforces equivalent behavior`, `Removing explicit range allows publication_year again`, `Partial ranges follow BE validation and are not silently rewritten`, `Filter chips reflect effective Analysis filters`
- [x] Stage gate: Stage window precedence after pure tests pass.

### Task Card 5: FE-FIX-05 — Fix long-year chart and Analysis cohort empty state

- [x] Objective: Keep the lightweight sidebar chart readable for long year ranges and allow Analysis to render when citation/trending cohort exists despite zero current-window works.
- [x] Files/entrypoints: `src/features/trendingVN/pages/TrendingVNPage.jsx`, `src/features/trendingVN/components/analysis/AnalysisDashboard.jsx`, `src/features/trendingVN/utils/paperVnAnalysis.js`, `src/features/trendingVN/trendingVN.css`, `scripts/paperVnAnalysis.test.mjs`
- [x] Verification: `Sidebar chart shows a bounded recent-year slice or a documented scrollable dynamic width`, `No bars/labels are clipped outside the SVG viewport`, `Current zero works with trending_article_coverage.total_articles > 0 still renders dashboard`, `Truly empty cohort renders empty state`, `All-zero time series remains accessible`
- [x] Stage gate: Stage chart/empty-state fixes after scoped lint and utility tests pass.

### Task Card 6: FE-FIX-06 — Institution/topic interaction verification and closeout

- [x] Objective: Verify institution and topic click-through against the corrected backend, run targeted tests/lint/build and three-view HTTP smoke, then update sprint, handoff and checks. Use browser network verification when available; otherwise record exact source and HTTP evidence.
- [x] Files/entrypoints: `src/features/trendingVN/components/analysis/AnalysisEntityPanel.jsx`, `src/features/trendingVN/pages/TrendingVNPage.jsx`, `scripts/paperVnAnalysis.test.mjs`, `plans/sprints/20260630-1414-paper-vn-analysis-view-consistency-corrective.sprint.md`, `.ai/harness/handoff/current.md`, `.ai/harness/checks/latest.json`
- [x] Verification: `Institution click changes Analysis cohort using institution_id`, `Topic click count/filter semantics match primary plus Sub_Topic backend contract`, `npm.cmd run test:paper-vn-analysis passes`, `Targeted ESLint passes`, `npm.cmd run build passes`, `Repo-wide lint attempted and unrelated debt documented`, `HTTP smoke returns 200 for List/Table/Analysis`, `Network/source gating remains correct`, `git diff --cached --check passes`, `No backend edit, dependency addition, commit or push`
- [x] Stage gate: Stage final docs/evidence only after interaction and verification results are recorded.

## Final Acceptance

- [x] All task cards are checked.
- [x] Required checks pass.
- [x] Handoff explains staged state, residual risks, and next bottleneck if any.
