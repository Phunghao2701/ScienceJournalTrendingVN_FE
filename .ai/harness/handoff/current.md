# Harness Handoff

> **Reason**: bootstrap

## Paper VN Discovery Frontend Sprint

Completed against `plans/sprints/20260629-1248-paper-vn-discovery-frontend.sprint.md` on 2026-06-29.

### Backend Contract Source

- Reference repo: `E:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_BE`
- Backend branch: `hao/refactor/BE`
- Backend commit: `1347cc28fc945b762084179c7d6dc58deaa3c9c9`
- Contract note: `docs/researches/paper-vn-discovery-api-contract.md`

### Implemented

- Fixed Paper VN article discovery requests to send `scope=vn_universities`.
- Normalized access filtering to `access=oa|closed`.
- Removed list-detail N+1 enrichment from `useArticleList`.
- Migrated article list loading to TanStack Query with full filter/query key coverage.
- Added `/articles/analytics` API wrapper and `useArticleAnalytics`.
- Replaced sidebar publisher/year/author/topic/access calculations with analytics-backed data for the full filtered result set.
- Made bookmark API wrapper local-only so the frontend no longer calls the missing server bookmark endpoint.
- Normalized raw XML/MathML-like article list titles/abstracts as text, without unsafe HTML rendering.
- Replaced patent-facing labels in discovery/detail UI with article-appropriate labels.
- Corrected export to current loaded page only and fixed CSV escaping with double quotes.
- Moved related-article list resolution out of `ArticleDetailPage.jsx` into `useResolveRelatedArticle`.

### Changed Files

- `docs/researches/paper-vn-discovery-api-contract.md`
- `src/features/article/api/articleApi.js`
- `src/features/article/components/ArticleFilterBar.jsx`
- `src/features/article/hooks/useArticleAnalytics.js`
- `src/features/article/hooks/useArticleList.js`
- `src/features/article/hooks/useResolveRelatedArticle.js`
- `src/features/article/pages/ArticleDetailPage.jsx`
- `src/features/article/utils/paperVnDiscoveryParams.js`
- `src/features/trendingVN/components/PublisherGrid.jsx`
- `src/features/trendingVN/components/TrendingArticleCard.jsx`
- `src/features/trendingVN/pages/ArticleDetailPage.jsx`
- `src/features/trendingVN/pages/TrendingVNPage.jsx`

### Verification

- `npx.cmd eslint src/features/article/api/articleApi.js src/features/article/components/ArticleFilterBar.jsx src/features/article/hooks/useArticleList.js src/features/article/hooks/useArticleAnalytics.js src/features/article/hooks/useResolveRelatedArticle.js src/features/article/pages/ArticleDetailPage.jsx src/features/trendingVN/components/PublisherGrid.jsx src/features/trendingVN/components/TrendingArticleCard.jsx src/features/trendingVN/pages/TrendingVNPage.jsx src/features/trendingVN/pages/ArticleDetailPage.jsx`
  - Passed.
- `npm.cmd run build`
  - Passed. Vite built successfully.
  - Warnings: extra cert load warning, ineffective dynamic imports, and large chunk warning.
- `npm.cmd run lint`
  - Failed on existing repo-wide lint issues outside touched sprint files. Current output reports 89 errors, mostly unused React imports/unused variables, duplicate `publisher` keys in journal modal, `persistToken` undefined in `authService.js`, and `Math.random` purity violations in unrelated keyword/zone components.
- `npm.cmd test`
  - Failed because `package.json` has no `test` script.

### Remaining Issues

- Full repo lint remains blocked by pre-existing unrelated errors.
- No automated test script exists in `package.json`.
- Network panel request-count verification was not performed in a browser session in this run; code-level verification confirms the article list hook no longer calls `getArticleDetailApi` and keyword/topic fallbacks include `scope=vn_universities`.

## Paper VN English UI and Click-to-Filter Sprint

Completed code implementation against `plans/sprints/20260629-1419-paper-vn-english-ui-click-filter.sprint.md` on 2026-06-29.

### Implemented

- Set i18n startup language and fallback to English while preserving the existing language infrastructure.
- Added URL-driven `publisher_id`, `author_id`, and `keyword_id` filters alongside `journal_id` and `topic_id`.
- Removed the frontend keyword/topic fallback from `useArticleList`; `/articles?search=` is now the single text-search source.
- Made journal, publisher, author, topic, and keyword labels navigate to `/articles` ID filters from list cards and both detail pages, with text-search fallback only when an ID is absent.
- Added analytics click-to-filter for top publishers, top authors, and top topics with non-clickable Unknown/null entities.
- Normalized analytics item display names/counts and stable IDs for authors, publishers, topics, and access distribution.
- Replaced patent-family/legal-status labels with article-specific English labels and real metrics where available.
- Ensured related/recommended article list requests include `scope=vn_universities`.

### Verification

- Scoped mojibake/patent scan:
  - `rg -n 'PhÃ|Ã¢|Ã†|Ä|â€¢|â€”|Vui|LÆ|KhÃ|Xuáº¥t|TrÃ|bÃ|BÃ|Simple Families|Extended Families|Legal Status|Patent|patent' ...`
  - Passed for touched Paper VN/list/detail/i18n entrypoints.
- Targeted ESLint:
  - `npx.cmd eslint src/features/article/api/articleApi.js src/features/article/components/ArticleFilterBar.jsx src/features/article/hooks/useArticleList.js src/features/article/hooks/useArticleAnalytics.js src/features/article/hooks/useResolveRelatedArticle.js src/features/article/pages/ArticleDetailPage.jsx src/features/article/utils/paperVnDiscoveryParams.js src/features/trendingVN/components/PublisherGrid.jsx src/features/trendingVN/components/TrendingArticleCard.jsx src/features/trendingVN/hooks/useTrendingArticleDetail.js src/features/trendingVN/pages/TrendingVNPage.jsx src/features/trendingVN/pages/ArticleDetailPage.jsx src/shared/i18n/i18n.js`
  - Passed. Output only included the local extra-cert warning.
- Build:
  - `npm.cmd run build`
  - Passed. Vite built successfully; warnings remain for the local extra cert, ineffective dynamic imports, and a large chunk.
- Repo-wide lint:
  - `npm.cmd run lint`
  - Failed on 89 existing repo-wide errors outside the touched sprint files, mainly unused React imports/variables, duplicate `publisher` keys, `persistToken` undefined, and render-time `Math.random`.
- Tests:
  - `npm.cmd test`
  - Failed because `package.json` has no `test` script.
- Browser smoke/manual matrix:
  - Interactive browser matrix was not completed because the Browser runtime reported `No browser is available`.
  - `npm.cmd run dev -- --host 127.0.0.1 --port 5174` starts successfully in the foreground.
  - A PowerShell job briefly served `/articles` with HTTP `200`, but the job exited before follow-up entity-filter URL probes; port `5174` was confirmed not serving afterward.

### Changed Files

- `.ai/harness/handoff/current.md`
- `docs/researches/paper-vn-discovery-api-contract.md`
- `plans/sprints/20260629-1419-paper-vn-english-ui-click-filter.sprint.md`
- `src/features/article/components/ArticleFilterBar.jsx`
- `src/features/article/hooks/useArticleAnalytics.js`
- `src/features/article/hooks/useArticleList.js`
- `src/features/article/hooks/useResolveRelatedArticle.js`
- `src/features/article/pages/ArticleDetailPage.jsx`
- `src/features/article/utils/paperVnDiscoveryParams.js`
- `src/features/trendingVN/components/PublisherGrid.jsx`
- `src/features/trendingVN/components/TrendingArticleCard.jsx`
- `src/features/trendingVN/hooks/useTrendingArticleDetail.js`
- `src/features/trendingVN/pages/ArticleDetailPage.jsx`
- `src/features/trendingVN/pages/TrendingVNPage.jsx`
- `src/shared/i18n/i18n.js`
- `src/shared/i18n/locales/en.json`
- `src/shared/i18n/locales/vi.json`

### Remaining Issues

- Manual browser/network verification still needs an available Browser runtime or a stable interactive dev-server session.
- Repo-wide lint and `npm test` are blocked by existing repository configuration/debt rather than this sprint slice.

## Paper VN Lens Detail UI and MathJax Rendering Sprint

Implemented against `plans/sprints/20260629-2048-paper-vn-lens-detail-ui-mathjax.sprint.md` on 2026-06-29.

### Backend Contract Source

- Reference repo: `E:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_BE`
- Backend sprint: `plans/sprints/20260629-2047-paper-vn-lens-detail-data-citation-semantics.sprint.md`
- Contract note: `docs/researches/paper-vn-discovery-api-contract.md`
- Confirmed BE support: exact-year author institutions, article-level institutions, separate `citation_count`/`reference_count` vs `citing_works_count`/`available_references_count`, `GET /api/v1/articles/:id/citing-works/analytics`, and entity by-ID display labels.

### Implemented

- Installed `better-react-mathjax`, added a single root `MathJaxContext`, and added `ScientificMathText`.
- Added safe MathML prefix normalization, allowlist sanitization and plain-text conversion helpers.
- Preserved raw article titles for rendering while using plain title text for exports, citation files and title attributes.
- Applied MathJax title rendering to Paper VN list cards, table/mobile rows, detail header and related/citing/reference cards.
- Added TanStack Query entity-label resolution for journal, publisher, author, topic and keyword filter chips.
- Removed Paper VN detail mojibake literals/comments in touched files.
- Cleaned detail metadata: conditional volume/issue/date rows, no duplicate E-Published rows, no fabricated license/source links.
- Rendered author affiliation superscripts and a deduplicated Institutions section from BE exact-year data.
- Corrected citation/reference semantics: imported metrics remain `Citation Count`/`Reference Count`; relation UI uses `Citing Works` and `Available References`.
- Added detail citing-works year chart using all-row analytics endpoint.
- Improved list sidebar: supports `topInstitutions` when analytics supplies it, keeps publisher panel when not available, and renders Top Topics as readable bars.
- Renamed internal identifier display to `ResearchPulse ID`.

### Changed Files

- `package.json`
- `package-lock.json`
- `scripts/scientificMath.test.mjs`
- `src/App.jsx`
- `src/shared/components/ScientificMathText.jsx`
- `src/shared/utils/scientificMath.js`
- `src/features/article/api/articleApi.js`
- `src/features/article/components/ArticleTable.jsx`
- `src/features/article/components/ArticleTableRow.jsx`
- `src/features/article/hooks/useArticleAnalytics.js`
- `src/features/article/hooks/useArticleEntityLabels.js`
- `src/features/article/hooks/useArticleList.js`
- `src/features/article/pages/ArticleDetailPage.jsx`
- `src/features/article/utils/articleFormatters.js`
- `src/features/trendingVN/components/TrendingArticleCard.jsx`
- `src/features/trendingVN/hooks/useTrendingArticleDetail.js`
- `src/features/trendingVN/pages/ArticleDetailPage.jsx`
- `src/features/trendingVN/pages/TrendingVNPage.jsx`
- `plans/sprints/20260629-2048-paper-vn-lens-detail-ui-mathjax.sprint.md`
- `.ai/harness/handoff/current.md`

### Verification

- `npm run test:scientific-math`
  - Passed: `scientificMath utility tests passed`.
- Scoped ESLint:
  - `npx eslint src/App.jsx src/shared/components/ScientificMathText.jsx src/shared/utils/scientificMath.js src/features/article/api/articleApi.js src/features/article/hooks/useArticleAnalytics.js src/features/article/hooks/useArticleEntityLabels.js src/features/article/hooks/useArticleList.js src/features/article/utils/articleFormatters.js src/features/article/components/ArticleTable.jsx src/features/article/components/ArticleTableRow.jsx src/features/article/pages/ArticleDetailPage.jsx src/features/trendingVN/components/TrendingArticleCard.jsx src/features/trendingVN/hooks/useTrendingArticleDetail.js src/features/trendingVN/pages/TrendingVNPage.jsx src/features/trendingVN/pages/ArticleDetailPage.jsx`
  - Passed with no output.
- `npm run build`
  - Passed. Vite built successfully.
  - Warnings: ineffective dynamic imports for existing modules and large chunk warning.
- `npm run lint`
  - Failed on 87 existing repo-wide errors outside this sprint's scoped files, mostly unused React imports/unused variables, duplicate `publisher` keys, `persistToken` undefined, and render-time `Math.random` purity violations.
- `npm test`
  - Failed because `package.json` has no `test` script.
- Mojibake/raw MathML scan:
  - `rg` over touched Paper VN/detail source for mojibake markers returned no matches.
  - `rg` over `src/features` and `src/shared` for raw `<mml:`/`<math>` outside the sanitizer/test returned no matches.
- Dev server:
  - `npm run dev -- --host 127.0.0.1 --port 5174` started successfully.
  - `Invoke-WebRequest http://127.0.0.1:5174/articles` returned HTTP `200`.

### Remaining Issues

- Browser visual/network inspection was not performed because no browser automation tool was available in this session; HTTP smoke confirmed the app serves `/articles`.
- `/articles/analytics` currently documents publishers/authors/topics/year/access but not `topInstitutions`; the UI supports `topInstitutions` if BE adds it and otherwise keeps the publisher panel without fabricating institution analytics.
- `npm install better-react-mathjax` reported 2 high severity audit findings and a deprecated transitive `mathjax-full@3.2.2` warning.
- Core `/trending-vn` behavior was not intentionally changed outside the Paper VN list/detail flow files already owned by this sprint.

## Paper VN Detail Review and Author Profile Navigation Sprint

Implemented against `plans/sprints/20260629-2145-paper-vn-detail-review-author-profile-navigation.sprint.md` on 2026-06-29.

### Implemented

- Added route helpers for `/authors/:id` and `/articles?author_id=:id&page=1`.
- Changed author names in both Paper VN detail pages and Lens related/citing/reference/recommended card rendering to semantic React Router links for public author profiles.
- Rendered authors without IDs as plain text, with no filter or text-search fallback.
- Added explicit `View articles by {author}` actions for article filtering, separate from author-name profile navigation.
- Removed fabricated `Journal Article` publication metadata fallback from the Paper VN Lens detail flow.
- Changed relation totals so successful relation API totals take precedence, including true zero, while missing/failed relation responses fall back to article detail counts.
- Added relation-query error copy so failed relation refresh is distinguishable from a true zero-result response.
- Strengthened scientific MathML tests with DOMParser/XMLSerializer branch coverage, unsafe script/event stripping, unknown tag handling, malformed fallback, component render/rerender checks, and a test-only MathJax SSR stub.
- Replaced remaining Vietnamese/mojibake UI literals in touched Paper VN table/detail files with English.

### Changed Files

- `plans/sprints/20260629-2145-paper-vn-detail-review-author-profile-navigation.sprint.md`
- `scripts/mathJaxSsrStub.mjs`
- `scripts/scientificMath.test.mjs`
- `src/app/routes/routePaths.js`
- `src/features/article/components/ArticleTable.jsx`
- `src/features/article/components/ArticleTableRow.jsx`
- `src/features/article/pages/ArticleDetailPage.jsx`
- `src/features/trendingVN/hooks/useTrendingArticleDetail.js`
- `src/features/trendingVN/pages/ArticleDetailPage.jsx`
- `src/shared/components/ScientificMathText.jsx`
- `src/shared/utils/scientificMath.js`

### Verification

- `npm.cmd run test:scientific-math`
  - Passed: `scientificMath DOM and component tests passed`.
- Targeted ESLint:
  - `npx.cmd eslint src/app/routes/routePaths.js src/features/article/components/ArticleTable.jsx src/features/article/components/ArticleTableRow.jsx src/features/article/pages/ArticleDetailPage.jsx src/features/trendingVN/hooks/useTrendingArticleDetail.js src/features/trendingVN/pages/ArticleDetailPage.jsx scripts/scientificMath.test.mjs scripts/mathJaxSsrStub.mjs src/shared/components/ScientificMathText.jsx src/shared/utils/scientificMath.js`
  - Passed with no output.
- `npm.cmd run build`
  - Passed. Vite built successfully.
  - Warnings remain for ineffective dynamic imports and large chunk size.
- `npm.cmd run lint`
  - Failed on 87 existing repo-wide errors outside this sprint surface, including unused React imports, unused variables, duplicate `publisher` keys, undefined `persistToken`, and render-time `Math.random` purity violations.
- HTTP smoke on the running Vite dev server:
  - `http://127.0.0.1:5174/articles` returned 200.
  - `http://127.0.0.1:5174/authors/1` returned 200.
  - `http://127.0.0.1:5174/articles?author_id=1&page=1` returned 200.
- Browser automation:
  - Not available in this session. Browser runtime selection reported `No browser is available`; `agent.browsers.list()` returned `[]`.
- Scoped scans:
  - No `Journal Article` fallback remains in touched Paper VN detail flow files.
  - No `navigateEntityFilter('author_id'...)` author-name filtering calls remain in touched detail files.
  - No unintended Vietnamese/mojibake literals remain in touched sprint files.
  - `rg -n "MathJaxContext" src` confirms the single production context remains in `src/App.jsx`.

### Remaining Issues

- Interactive browser checks for click, keyboard focus, open-new-tab behavior, browser back, and responsive layout still need an available Browser/Chrome runtime.
- Repo-wide lint remains blocked by pre-existing unrelated issues listed above.
- No backend or core Trending VN ranking logic was changed.

## Paper VN URL-Synced List/Table/Analysis Views Sprint

Implemented against `plans/sprints/20260630-1338-paper-vn-url-synced-list-table-analysis-views.sprint.md` on 2026-06-30.

### Backend Contract Source

- Reference repo: `E:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_BE`
- Contract note: `docs/researches/paper-vn-trending-analysis-api-contract.md`

### Implemented

- Added URL-driven view mode for `/articles`, `/articles?view=table`, and `/articles?view=analysis`; invalid/list view canonicalizes to no `view` param while preserving filters.
- Added `/articles/analysis` API wrapper, analysis params mapper, response mapper, and `useArticleAnalysis`.
- Gated TanStack queries so article list and lightweight analytics are disabled in Analysis, while analysis query is enabled only for `view=analysis`.
- Added dependency-free Analysis dashboard with summary cards, works/citations time-series SVG charts, entity Top/Growth controls, and trending article table with coverage.
- Integrated Analysis as a full-width result view and hid list-only expand/customize/export/sort/pagination controls.
- Fixed lightweight sidebar year rows to use dynamic API rows and access mapping to read `item.key` with oa/closed/unknown.
- Preserved current pathname, filters, and view in detail `returnTo`.
- Added `scripts/paperVnAnalysis.test.mjs` and `npm run test:paper-vn-analysis`.

### Changed Files

- `package.json`
- `scripts/paperVnAnalysis.test.mjs`
- `src/features/article/api/articleApi.js`
- `src/features/article/hooks/useArticleAnalytics.js`
- `src/features/article/hooks/useArticleList.js`
- `src/features/article/utils/paperVnDiscoveryParams.js`
- `src/features/trendingVN/components/analysis/AnalysisDashboard.jsx`
- `src/features/trendingVN/components/analysis/AnalysisEntityPanel.jsx`
- `src/features/trendingVN/components/analysis/AnalysisSummary.jsx`
- `src/features/trendingVN/components/analysis/AnalysisTimeSeriesChart.jsx`
- `src/features/trendingVN/components/analysis/AnalysisTrendingArticles.jsx`
- `src/features/trendingVN/hooks/useArticleAnalysis.js`
- `src/features/trendingVN/pages/TrendingVNPage.jsx`
- `src/features/trendingVN/trendingVN.css`
- `src/features/trendingVN/utils/paperVnAnalysis.js`
- `src/features/trendingVN/utils/trendingViewParams.js`
- `plans/sprints/20260630-1338-paper-vn-url-synced-list-table-analysis-views.sprint.md`
- `.ai/harness/checks/latest.json`
- `.ai/harness/handoff/current.md`

### Verification

- `npm.cmd run test:paper-vn-analysis`
  - Passed. All six URL/params/growth/mapper assertions passed.
- `npm.cmd run test:scientific-math`
  - Passed: `scientificMath DOM and component tests passed`.
- Targeted ESLint on all touched JS/JSX/test files
  - Passed with no output.
- `npm.cmd run build`
  - Passed. Vite built successfully.
  - Warnings remain for ineffective dynamic imports and chunk size.
- `npm.cmd run lint`
  - Failed on 87 pre-existing repo-wide errors outside this sprint surface, including unused React imports/variables, duplicate `publisher` keys, undefined `persistToken`, and render-time `Math.random` purity violations.
- Dev HTTP smoke on Vite `http://127.0.0.1:5174`
  - `/articles` returned 200.
  - `/articles?view=table` returned 200.
  - `/articles?view=analysis` returned 200.
- Source/network gating evidence
  - `TrendingVNPage.jsx` uses `useArticleList({ enabled: !isAnalysisView })`, `useArticleAnalytics(filters, { enabled: !isAnalysisView })`, and `useArticleAnalysis(filters, { enabled: isAnalysisView })`.
  - `/articles/analysis` appears only in the new API wrapper/hook path.

### Remaining Issues

- Browser interactive/network panel verification was not performed; HTTP smoke and source gating were verified.
- Repo-wide lint remains blocked by unrelated existing debt.
- Worktree had substantial staged/untracked changes before this sprint; this run preserved them and staged requested sprint files by explicit paths.

## Paper VN Analysis View Consistency Corrective Sprint

Implemented against `plans/sprints/20260630-1414-paper-vn-analysis-view-consistency-corrective.sprint.md` on 2026-06-30.

### Backend Contract Source

- Reference repo: `E:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_BE`
- Backend branch: `hao/refactor/BE`
- Confirmed via subagent investigation: `institution_id` filtering is supported by `articleFilter.service.js` and shared by `/articles` and `/articles/analysis`; `topic_id` matches the primary topic OR the `Sub_Topic` join table (deliberate OR, backed by an explicit unit test in that repo).

### Implemented

- Centralized URL-view update helpers (`buildClearedTrendingSearchParams`, `buildFilterUpdateSearchParams`) in `trendingViewParams.js` so clearing filters and updating entity/filter values always preserve the active view (`list`/`table`/`analysis`); Analysis never gains a `page` param, Table safely resets to page 1.
- Replaced the detail `returnTo` builder with `buildExactReturnToPath`, preserving the exact current `location.pathname + location.search` instead of re-deriving a list-only URL; detail navigation state now uses `activeResultTotal` (Analysis-aware) instead of the disabled list `total`.
- Sourced the Analysis top-stats bar from the `/articles/analysis` summary contract (`scholarly_works`, `open_access_works`, `authors`, `institutions`, `journals`, `total_citations`) instead of the disabled list/light-analytics queries; hid Topics/Publishers segments in Analysis (no contract data) and added Institutions/Citations segments only for Analysis.
- Made explicit `from_year`/`to_year` take precedence over `publication_year` in `buildPaperVnAnalysisParams`, and suppressed the redundant year chip in the UI when an explicit range is active (added a dedicated `yearRange` chip instead).
- Made the sidebar publication-year SVG bar chart (`computeYearChartLayout`) compute column width/gap dynamically from `yearCounts.length` so long year ranges compress to fit the fixed `viewBox` instead of clipping.
- Extended `isAnalysisCohortEmpty` to also treat a non-zero `trending_article_coverage.total_articles` as a non-empty cohort, so the Analysis dashboard still renders trending/citation content when the current-window `scholarly_works` count is zero but a trending cohort exists.
- Verified institution/topic click-through (`AnalysisEntityPanel` → `handleEntityFilter` → `updateFilters({ institution_id | topic_id })` → `buildPaperVnAnalysisParams` → `/articles/analysis`) is wired correctly and matches the confirmed BE filter semantics; no code change was needed for Card 6 beyond verification.

### Changed Files

- `src/features/trendingVN/utils/trendingViewParams.js`
- `src/features/trendingVN/utils/paperVnAnalysis.js`
- `src/features/article/hooks/useArticleList.js`
- `src/features/trendingVN/pages/TrendingVNPage.jsx`
- `src/features/trendingVN/components/analysis/AnalysisDashboard.jsx`
- `src/shared/i18n/locales/en.json`
- `src/shared/i18n/locales/vi.json`
- `scripts/paperVnAnalysis.test.mjs`
- `plans/sprints/20260630-1414-paper-vn-analysis-view-consistency-corrective.sprint.md`
- `.ai/harness/handoff/current.md`
- `.ai/harness/checks/latest.json`

### Verification

- `npm.cmd run test:paper-vn-analysis`
  - Passed. All 18 assertions passed (6 pre-existing + 12 new regression tests covering FE-FIX-02 through FE-FIX-05).
- Targeted ESLint on all touched JS/JSX files
  - Passed with no output.
- `npm.cmd run build`
  - Passed. Vite built successfully.
  - Warnings remain for ineffective dynamic imports and chunk size (pre-existing, unrelated).
- `npm.cmd run lint`
  - Failed on 87 pre-existing repo-wide errors outside this sprint's touched files (unused React imports/variables in `keyword`/`project`/`zone`/`shared` components, render-time `Math.random` purity violations). Identical count/pattern to prior sprint handoffs in this file — no new debt introduced.
- Dev HTTP smoke on Vite `http://localhost:5174`
  - `/trending-vn` returned 200.
  - `/trending-vn?view=table` returned 200.
  - `/trending-vn?view=analysis` returned 200.
- `git diff --cached --check`
  - One pre-existing trailing-blank-line flagged in `plans/sprints/20260629-1419-paper-vn-english-ui-click-filter.sprint.md` (staged before this sprint started, not touched by this sprint). No whitespace errors in this sprint's files.
- Source/network gating evidence
  - `TrendingVNPage.jsx` still uses `useArticleList({ enabled: !isAnalysisView })`, `useArticleAnalytics(filters, { enabled: !isAnalysisView })`, `useArticleAnalysis(filters, { enabled: isAnalysisView })` — list/light-analytics and analysis queries remain mutually exclusive per view.
  - `AnalysisEntityPanel.handleEntityClick` calls `onEntityClick(activeMeta.filter, row.entity_id)` with `institution_id`/`topic_id`/etc.; `TrendingVNPage.handleEntityFilter` forwards to `updateFilters`, which is sent through `buildPaperVnAnalysisParams` → `getArticleAnalysisApi` → BE `/articles/analysis`, which shares `articleFilter.service.js` with `/articles` (confirmed institution_id and primary-or-Sub_Topic topic_id support).

### Remaining Issues

- Browser interactive/network panel verification was not performed (no browser automation tool available in this session); HTTP smoke and source-level query gating were verified instead.
- Repo-wide lint remains blocked by the same pre-existing unrelated debt documented in every prior sprint handoff in this file — not in scope for this corrective sprint per its non-goals (no repo-wide lint cleanup).
- No backend changes, new dependencies, schema/crawler changes, or commits were made, per PRD non-goals.
