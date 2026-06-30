---
title: "Implement Paper VN Discovery Frontend Integration"
kind: "plan"
created_at: "2026-06-29T05:49:05.441Z"
source: "repo-harness-mcp"
---
# Implement Paper VN Discovery Frontend Integration

> **Status**: Blocked until BE contract handoff is complete
> **PRD**: `plans/prds/20260629-1246-paper-vn-discovery-frontend.prd.md`
> **Sprint**: `plans/sprints/20260629-1248-paper-vn-discovery-frontend.sprint.md`
> **Target branch**: `ngoc/feature/trending-lens-style`

## Goal

Integrate the verified Paper VN backend contract into the current Article Discovery page and remove incorrect requests, N+1 behavior and misleading UI content.

## Execution Strategy

Do not start contract-dependent implementation until the BE plan publishes final request/response examples. Keep changes incremental because `TrendingVNPage.jsx` and `ArticleDetailPage.jsx` are large and merge-prone.

## Task Breakdown

### Phase 0 — Recovery and baseline

- Read `AGENTS.md`, PRD, sprint, BE handoff and package scripts.
- Inspect git status and preserve unrelated changes.
- Run current lint/build/relevant tests and record baseline failures.
- Capture current Network request behavior for the article list.

**Checkpoint 0**: baseline and BE contract are available.

### Phase 1 — Centralize normalized discovery params

- Create one helper or hook-level normalization path for list and analytics params.
- Fix the immutable scope to `vn_universities`.
- Keep URL params for user-controlled filters only.
- Ensure reset removes optional filters but not scope.

**Checkpoint 1**: outgoing list params are deterministic and tested.

### Phase 2 — Correct API contract usage

- Replace `selectedAccess: 'open'` writes with `access=oa|closed`.
- Ensure keyword/topic fallback receives scope if fallback remains.
- Record and map the verified list response shape.

**Checkpoint 2**: list/search/filter/sort/pagination requests match BE contract.

### Phase 3 — Remove N+1 and migrate list to TanStack Query

- Remove `enrichArticleList` and list-time detail calls.
- Refactor `useArticleList` to `useQuery`.
- Include scope, search, filters, pagination and sort in the query key.
- Preserve previous page data while fetching.
- Expose loading/fetching/error/refetch states.

**Checkpoint 3**: a 10-item page uses one article-list request and renders complete cards.

### Phase 4 — Integrate filtered analytics

- Add article analytics API wrapper and `useArticleAnalytics`.
- Derive analytics params from the same normalized filters as list.
- Replace page-local year/author/topic/access calculations.
- Replace publisher-list endpoint usage for result analytics.
- Use real values in the top stats bar or hide unavailable segments.

**Checkpoint 4**: sidebar represents the full filtered result set.

### Phase 5 — Remove broken/unsupported interactions

- Remove the non-existent bookmark API call or make the behavior explicitly local-only.
- Move direct API calls out of `ArticleDetailPage.jsx` into a hook.
- Preserve page → hook → API boundaries.

**Checkpoint 5**: no known 404 request remains in normal page flows.

### Phase 6 — Scientific content cleanup

- Remove patent-specific labels and panels.
- Rename citation labels according to actual values.
- Add safe title normalization for MathML/XML.
- Keep loading, empty, error and success states responsive.

**Checkpoint 6**: visible content is appropriate for scientific articles.

### Phase 7 — Export correction

- Choose and implement either current-page export or verified backend export.
- Make UI wording match actual scope.
- Fix CSV double-quote escaping.
- Test commas, quotes and Unicode Vietnamese text.

**Checkpoint 7**: exported row count and content match the UI promise.

### Phase 8 — Full verification and handoff

- Run targeted tests, lint and build.
- Re-check Network request count and params.
- Test URL back/forward, reset, loading, empty, error and responsive states.
- Update handoff with changed files, commands, outputs and remaining issues.
- Do not commit unless explicitly requested.

## Verification Matrix

- Fixed VN scope on initial load, search, sort, pagination and reset.
- Open/closed access filters.
- Journal, topic and keyword search/fallback behavior.
- No list-detail N+1.
- Analytics/list filter parity.
- MathML title fallback.
- Bookmark behavior without server endpoint.
- CSV quotes, commas, Unicode and row count.
- Desktop and responsive layouts.

## Stop Conditions

Stop and report instead of inventing behavior when:

- BE handoff does not include a required response field.
- Analytics contract differs from the sprint.
- Removing patent UI requires product decisions not represented in the PRD.
- A change would require new dependencies or broad route/folder renaming.

## Rollback Boundary

Changes should remain within article discovery API/hooks/components/pages, focused utilities/tests and workflow notes. Do not modify core Trending VN implementation.
