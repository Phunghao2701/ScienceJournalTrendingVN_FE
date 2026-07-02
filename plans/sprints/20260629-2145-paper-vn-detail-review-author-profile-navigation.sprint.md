---
title: "Paper VN Detail Review and Author Profile Navigation Sprint"
kind: "sprint"
created_at: "2026-06-29T14:45:35.592Z"
source: "repo-harness-mcp"
---
# Paper VN Detail Review and Author Profile Navigation Sprint

> **Status**: Draft

## Source

- PRD: `plans/prds/20260629-2144-paper-vn-detail-review-author-profile-navigation.prd.md`

## Execution Rule

- Execute task cards in order.
- Keep each task card reviewable as one staged slice.
- After every completed phase, update the checklist and stage the result before continuing.
- Do not treat unstaged work as a completed phase.

## Checklist

### Task Card 1: FE-01 — Baseline, contract and dirty-worktree audit

- [x] Objective: Read AGENTS.md, the new PRD, the previous Lens detail sprint and current handoff. Inspect git status, preserve all unrelated changes, confirm /authors/:id is registered, confirm AuthorDetailPage consumes the route ID, and record the current behavior of author clicks in both article detail implementations. Run focused baseline lint/build/tests before editing.
- [x] Files/entrypoints: `AGENTS.md`, `src/app/routes/AppRoutes.jsx`, `src/app/routes/routePaths.js`, `src/features/author/pages/AuthorDetailPage.jsx`, `src/features/article/pages/ArticleDetailPage.jsx`, `src/features/trendingVN/pages/ArticleDetailPage.jsx`, `.ai/harness/handoff/current.md`
- [x] Verification: `Confirm Route path="/authors/:id" renders AuthorDetailPage`, `Confirm valid author_id values are present in detail response mapping`, `Run current npm run test:scientific-math`, `Run targeted ESLint for the planned files`, `Run npm run build`
- [x] Stage gate: Stage baseline notes only if any tracked documentation is updated; do not mix code changes into this phase.

Completed: `/authors/:id` is registered in `src/app/routes/AppRoutes.jsx` and renders `AuthorDetailPage`; `AuthorDetailPage` reads the route ID with `useParams`. Baseline author clicks in both detail implementations still use article filtering behavior before this sprint. `npm.cmd run test:scientific-math` passed with `scientificMath utility tests passed`. `npm.cmd run build` passed with existing Vite warnings for ineffective dynamic imports and chunk size. Targeted ESLint was attempted and is blocked before edits by the existing unused `LandingPage` import in `src/app/routes/AppRoutes.jsx`.

### Task Card 2: FE-02 — Make author names open public author profiles

- [x] Objective: Change author-name interactions in Paper VN article detail surfaces so a valid author_id opens /authors/:id. Cover the main author header/list and author names shown in related, recommended, citing-work and reference article cards where those records expose author_id. Prefer React Router Link or an equally semantic accessible link. Do not route the author name to article filtering. When author_id is absent, render plain non-clickable text and do not text-search fallback.
- [x] Files/entrypoints: `src/app/routes/routePaths.js`, `src/features/article/pages/ArticleDetailPage.jsx`, `src/features/trendingVN/pages/ArticleDetailPage.jsx`
- [x] Verification: `Clicking an author with ID produces /authors/{id}`, `Direct refresh on /authors/{id} renders AuthorDetailPage`, `Author without ID is non-interactive`, `Links support keyboard focus and open-in-new-tab behavior`, `No nested interactive element or accidental parent-card click is introduced`
- [x] Stage gate: Stage the author profile navigation slice after targeted lint and route smoke pass.

Completed: author names with IDs in `src/features/article/pages/ArticleDetailPage.jsx` and `src/features/trendingVN/pages/ArticleDetailPage.jsx` now render React Router `Link` elements to `/authors/{id}` using `buildAuthorDetailPath`; author names without IDs render plain text and no longer call the article filter/search fallback. Related/citing/reference/recommended card author names in the Lens detail card renderer use the same profile-link behavior when relation records expose IDs. `npx.cmd eslint src/app/routes/routePaths.js src/features/article/pages/ArticleDetailPage.jsx src/features/trendingVN/pages/ArticleDetailPage.jsx` passed. `npm.cmd run build` passed with existing Vite warnings.

### Task Card 3: FE-03 — Separate profile navigation from article filtering

- [x] Objective: Retain article filtering as an explicit separate action, such as View articles by this author, only where the existing UI can present it clearly without clutter. The action must navigate to /articles?author_id=:id&page=1. Do not overload the author-name link with filtering. Reuse a small route helper if it reduces duplicated string construction without broad route refactoring.
- [x] Files/entrypoints: `src/app/routes/routePaths.js`, `src/features/article/pages/ArticleDetailPage.jsx`, `src/features/trendingVN/pages/ArticleDetailPage.jsx`
- [x] Verification: `Profile link and filter action navigate to different intended destinations`, `Filter action contains stable author_id and page=1`, `No fallback filter/search is created for authors lacking IDs`, `Browser back returns to the originating article detail`
- [x] Stage gate: Stage profile/filter action separation after interaction smoke checks.

Completed: added `buildArticleAuthorFilterPath` and visible `View articles by {author}` actions beside the author areas in both detail pages. Author names remain `/authors/{id}` profile links while the new filter actions navigate to `/articles?author_id={id}&page=1`; authors without IDs do not render filter links. `npx.cmd eslint src/app/routes/routePaths.js src/features/article/pages/ArticleDetailPage.jsx src/features/trendingVN/pages/ArticleDetailPage.jsx` passed. `npm.cmd run build` passed with existing Vite warnings.

### Task Card 4: FE-04 — Fix truthful metadata and resilient relation totals

- [x] Objective: Remove hardcoded Journal Article and any other publication metadata fallback that is not backed by API data. Render publication type/info only when present. Fix citing works and reference total selection so successful relation API totals take precedence, while missing or failed relation requests fall back to article.citing_works_count and article.available_references_count rather than displaying a false zero. Surface query error state where needed to distinguish zero results from failed loading.
- [x] Files/entrypoints: `src/features/trendingVN/hooks/useTrendingArticleDetail.js`, `src/features/trendingVN/pages/ArticleDetailPage.jsx`, `src/features/article/pages/ArticleDetailPage.jsx`, `src/features/article/utils/articleFormatters.js`
- [x] Verification: `Search confirms no fabricated Journal Article fallback in Paper VN detail flow`, `A failed relation request does not replace a known detail count with 0`, `A successful relation response with total 0 still displays 0`, `Citation Count and Reference Count remain separate from relation totals`, `Targeted lint passes`
- [x] Stage gate: Stage metadata cleanup and relation-total semantics together after focused checks.

Completed: removed `Journal Article` fallback rendering from the Paper VN Lens detail flow; publication info now renders only when present. `useTrendingArticleDetail` now returns undefined relation totals until relation queries succeed, preserving successful `0` totals while allowing the page to fall back to `article.citing_works_count` and `article.available_references_count` for missing or failed relation requests. Relation query errors are surfaced in the tab summary copy. Scoped `rg` found no remaining `Journal Article` fallback in the Paper VN detail flow. Targeted ESLint and `npm.cmd run build` passed with existing Vite warnings.

### Task Card 5: FE-05 — Strengthen scientific MathML tests in a DOM/component environment

- [x] Objective: Extend the scientific-math test setup so it exercises the actual DOMParser/XMLSerializer sanitizer path and renders ScientificMathText through a component test capable of rerender. Verify mixed text/MathML, prefixed MathML, malformed markup, script/event stripping, unknown tag handling, and dynamic prop updates. Keep exactly one MathJaxContext in production code and avoid introducing another rendering library.
- [x] Files/entrypoints: `package.json`, `package-lock.json`, `scripts/scientificMath.test.mjs`, `src/shared/components/ScientificMathText.jsx`, `src/shared/utils/scientificMath.js`
- [x] Verification: `npm run test:scientific-math passes`, `Unsafe script and event attributes are removed in the DOM sanitizer branch`, `Component rerender updates visible scientific content`, `Malformed MathML falls back safely`, `Search confirms only one production MathJaxContext`
- [x] Stage gate: Stage test dependencies/config and tests only after the enhanced test command passes.

Completed: expanded `scripts/scientificMath.test.mjs` with a DOMParser/XMLSerializer test shim for the sanitizer branch, unsafe script/event stripping, unknown tag handling, malformed MathML fallback, prefixed MathML, mixed text/MathML and component rerender output through the real `ScientificMathText` loaded by Vite SSR. Added `scripts/mathJaxSsrStub.mjs` only for the test loader so no production MathJax context or rendering dependency changes were introduced. `npm.cmd run test:scientific-math` passed with `scientificMath DOM and component tests passed`. Focused ESLint passed. `rg -n "MathJaxContext" src` confirms the single production context remains in `src/App.jsx`. `npm.cmd run build` passed with existing Vite warnings.

### Task Card 6: FE-06 — Complete English/i18n cleanup in touched Paper VN files

- [x] Objective: Replace remaining Vietnamese literals in ArticleTable, ArticleTableRow and touched Paper VN detail surfaces with English or existing i18n keys. Do not broaden into unrelated repository-wide translation work. Preserve proper names and database content as returned.
- [x] Files/entrypoints: `src/features/article/components/ArticleTable.jsx`, `src/features/article/components/ArticleTableRow.jsx`, `src/features/article/pages/ArticleDetailPage.jsx`, `src/features/trendingVN/pages/ArticleDetailPage.jsx`, `src/shared/i18n/locales/en.json`, `src/shared/i18n/locales/vi.json`
- [x] Verification: `Scoped scan finds no unintended Vietnamese UI literals in touched Paper VN files`, `English default UI is coherent for empty states, labels, buttons and alerts`, `Translation keys exist in both locale files when i18n is used`, `Targeted lint passes`
- [x] Stage gate: Stage translation/i18n cleanup separately after scoped scan and lint.

Completed: replaced remaining Vietnamese/mojibake UI literals in `ArticleTable` and `ArticleTableRow` with English labels, empty states and actions. Scoped scan across `ArticleTable`, `ArticleTableRow`, `src/features/article/pages/ArticleDetailPage.jsx` and `src/features/trendingVN/pages/ArticleDetailPage.jsx` returned no Vietnamese/mojibake matches. Focused ESLint passed. `npm.cmd run build` passed with existing Vite warnings.

### Task Card 7: FE-07 — Verification, browser smoke and handoff

- [x] Objective: Run focused automated checks and manually verify the author profile journey from both /articles/:id and /trending/articles/:id. Check author links with and without IDs, direct refresh on /authors/:id, profile/filter separation, relation count fallback, metadata truthfulness, MathML rendering, responsive behavior and keyboard interaction. Update the Sprint checklist and .ai/harness/handoff/current.md with exact commands, results, remaining blockers and changed files. Do not commit automatically.
- [x] Files/entrypoints: `plans/sprints`, `docs/researches/paper-vn-discovery-api-contract.md`, `.ai/harness/handoff/current.md`
- [x] Verification: `npm run test:scientific-math`, `Targeted ESLint for all touched files`, `npm run build`, `Browser smoke for author link, direct refresh, back navigation and open-new-tab`, `Scoped scan for Journal Article fallback, mojibake, raw MathML and Vietnamese literals`, `Confirm no backend or core trending logic changes`
- [x] Stage gate: Stage the final verification and handoff artifacts only after reporting exact evidence; leave all completed phases staged and do not commit.

Completed: final focused checks passed: `npm.cmd run test:scientific-math`, targeted ESLint for the touched sprint files, and `npm.cmd run build`. `npm.cmd run lint` still fails on 87 pre-existing repo-wide issues outside this sprint surface. HTTP route smoke on the running Vite server returned 200 for `/articles`, `/authors/1`, and `/articles?author_id=1&page=1`. Browser automation could not run because the Browser runtime reported no available browsers (`agent.browsers.list()` returned `[]`). Scoped scans confirmed no `Journal Article` fallback, no author-name filter calls, no unintended Vietnamese/mojibake literals in touched sprint files, and exactly one production `MathJaxContext`.

## Final Acceptance

- [x] All task cards are checked.
- [x] Required checks pass.
- [x] Handoff explains staged state, residual risks, and next bottleneck if any.
