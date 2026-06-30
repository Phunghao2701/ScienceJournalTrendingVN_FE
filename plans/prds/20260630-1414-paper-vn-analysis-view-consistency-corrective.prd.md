---
title: "Paper VN Analysis View Consistency Corrective"
kind: "prd"
created_at: "2026-06-30T07:14:08.350Z"
source: "repo-harness-mcp"
---
# Paper VN Analysis View Consistency Corrective

## Problem

The URL-synced Analysis view is implemented, but several consistency issues remain:

- The top stats bar can show zero or stale values because list and lightweight analytics queries are disabled in Analysis.
- Clearing filters removes the active view and returns users to List.
- Updating entity filters in Analysis can add `page=1` even though Analysis does not use pagination.
- The detail return path is rebuilt with list-only defaults rather than preserving the exact current URL.
- `publication_year` can be sent together with `from_year` and `to_year`, creating misleading filter chips.
- The sidebar publication-year chart can overflow its fixed SVG viewport when many years are returned.
- The dashboard can hide valid trending/citation data when `summary.scholarly_works` is zero.
- Institution click-through depends on the backend corrective support for `institution_id`.

## Users

- Paper VN Analysis users
- ResearchPulse frontend team
- QA reviewers

## Goals

1. Use the Analysis summary as the source of truth for top statistics while in Analysis, or hide list-only statistics that cannot be derived from the Analysis contract.
2. Preserve `view=analysis` or `view=table` when filters are cleared.
3. Do not add pagination params while filters are updated in Analysis.
4. Preserve the exact current pathname and search string in article detail `returnTo`.
5. Use the active Analysis result count in navigation state.
6. Define one consistent rule for `publication_year` versus explicit `from_year` and `to_year`.
7. Prevent the dynamic year chart from being clipped.
8. Render the dashboard when trending/citation coverage still has a cohort even if current-window scholarly works are zero.
9. Enable institution click-through only after the backend `institution_id` contract is available.
10. Add pure regression tests for URL, filter, window, return path, and empty-state behavior.

## Non-Goals

- No backend changes in this frontend sprint.
- No new chart dependency.
- No schema or crawler changes.
- No full page redesign.
- No repo-wide lint cleanup.
- No commit or push.

## Success Criteria

- Analysis stats do not depend on disabled list or lightweight analytics queries.
- Clear All from Analysis preserves `view=analysis`; Clear All from Table preserves `view=table`.
- Entity filtering in Analysis preserves the view and removes `page`.
- Detail `returnTo` equals the current pathname plus current search string.
- Analysis detail state uses the active Analysis result count.
- Explicit `from_year` and `to_year` suppress `publication_year` in Analysis params.
- The sidebar year chart remains readable with long year ranges.
- The dashboard still renders citation/trending content when the filtered cohort exists but current-window works equal zero.
- Institution filtering works with the completed backend corrective contract.
- Pure tests, targeted ESLint, production build, and three-view HTTP smoke pass.

## Constraints

- Target branch: `ngoc/feature/trending-lens-style`.
- Run after the backend institution/topic corrective sprint.
- Preserve unrelated dirty and staged changes.
