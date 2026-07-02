---
title: "Implement Paper VN English UI and Click-to-Filter"
kind: "plan"
created_at: "2026-06-29T07:20:42.695Z"
source: "repo-harness-mcp"
---
# Implement Paper VN English UI and Click-to-Filter

> **PRD**: `plans/prds/20260629-1418-paper-vn-english-ui-click-filter.prd.md`
> **Sprint**: `plans/sprints/20260629-1419-paper-vn-english-ui-click-filter.sprint.md`
> **Target branch**: `ngoc/feature/trending-lens-style`
> **Dependency**: Start contract-dependent work only after BE publishes its final handoff.

## Goal

Deliver a clean English Paper VN discovery/detail experience where journal, publisher, author, topic and keyword can be clicked to apply stable ID filters, and where list and analytics always use the same normalized query.

## Phase 0 — Recover and protect the current worktree

1. Read repo instructions, current handoff, PRD, sprint and BE contract.
2. Inspect git status and preserve unrelated changes.
3. Run targeted lint/build baseline.
4. Search for mojibake markers and record every affected file.

## Phase 1 — Restore UTF-8 and English UI

1. Restore corrupted files from a clean UTF-8 source where possible.
2. Reapply only required feature logic.
3. Set English as the default/current UI language.
4. Convert Paper VN list/detail/shared controls, messages, toasts, labels, tooltips, modal text and accessibility labels to English.
5. Keep i18n infrastructure; do not delete alternate locale files.

**Checkpoint**: no visible `Ã`, `Â`, `Æ`, `â€”`, `á»` or Vietnamese text remains in the Paper VN flow.

## Phase 2 — Centralized URL filter contract

Support these user-controlled URL params:

```text
search
year
journal_id
publisher_id
author_id
topic_id
keyword_id
access
sortBy
sortOrder
page
limit
```

Always send fixed:

```text
scope=vn_universities
```

Requirements:

- Entity filter change resets page to 1.
- Clear All removes optional filters but preserves scope.
- Browser back/forward restores state.
- List and analytics derive params from one normalized helper.

## Phase 3 — Remove divergent frontend fallback

1. Remove keyword/topic fallback from `useArticleList` once BE unified search is verified.
2. Use `/articles?search=` as the single text-search source.
3. Keep ISSN search compatible with the unified backend contract.
4. Ensure stats and analytics always represent the same result set.

## Phase 4 — Click-to-filter from cards and details

Implement:

- Journal → `journal_id`
- Publisher → `publisher_id`
- Author → `author_id`
- Topic → `topic_id`
- Keyword → `keyword_id`

Rules:

- Navigate to `/articles` with the entity ID.
- Use text search only when ID is genuinely absent.
- Recommended/related discovery requests include `scope=vn_universities`.
- No direct discovery API calls remain in page components when a hook can own them.

## Phase 5 — Click-to-filter from analytics

1. Top Publishers cells are clickable when `publisher_id` exists.
2. Top Authors bars/labels are clickable when `author_id` exists.
3. Top Topics chart/legend is clickable when `topic_id` exists.
4. Use button/link semantics and keyboard activation.
5. Unknown/null entities remain visible only if useful and are not clickable.

## Phase 6 — Normalize analytics consumption

Consume the BE contract directly:

- `display_name`
- `article_count`
- array-based `accessDistribution`
- stable entity IDs

Remove broad alias guessing that converts real names to `Unknown`.

## Phase 7 — Article-specific metrics and terminology

Replace patent-derived terms with English article metrics. Preferred top metrics:

- Article Records
- Open Access Articles
- Authors
- Topics
- Journals
- Institutions

Only display values backed by analytics. Hide unsupported metrics instead of deriving fake totals from top-10 arrays or the current page.

## Phase 8 — Edge-case and pagination cleanup

1. Pagination uses `filters.limit`, not hard-coded 10.
2. Card metadata matches detail metadata.
3. Volume, issue, authors, reference count and citation count render correctly.
4. XML/MathML titles remain safely normalized.
5. Unknown analytics items are non-interactive.

## Phase 9 — Verification and handoff

1. Run targeted ESLint.
2. Run `npm run build`.
3. Verify mouse and keyboard click flows for all five entity types.
4. Inspect Network requests: list and analytics must share scope and entity filters.
5. Verify Back/Forward, Clear All and filter chips.
6. Confirm no fallback request, mojibake, unexpected 404 or patent terminology remains.
7. Update handoff with exact commands/results.
8. Do not commit unless explicitly requested.

## Stop conditions

Stop and report instead of guessing if:

- BE handoff does not provide stable entity IDs.
- A requested English conversion requires product copy not present in the repo.
- UTF-8 recovery cannot be performed without overwriting unrelated work.
- A change would require a new dependency or core Trending VN modification.
