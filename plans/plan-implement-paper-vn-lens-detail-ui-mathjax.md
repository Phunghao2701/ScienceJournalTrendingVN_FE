---
title: "Implement Paper VN Lens Detail UI and MathJax Rendering"
kind: "plan"
created_at: "2026-06-29T13:48:52.384Z"
source: "repo-harness-mcp"
---
# Implement Paper VN Lens Detail UI and MathJax Rendering

> **PRD**: `plans/prds/20260629-2047-paper-vn-lens-detail-ui-mathjax.prd.md`
> **Sprint**: `plans/sprints/20260629-2048-paper-vn-lens-detail-ui-mathjax.sprint.md`
> **Target branch**: `ngoc/feature/trending-lens-style`
> **Dependency**: Read the final BE detail handoff before phases that consume affiliations/count analytics.

## Goal

Deliver a trustworthy Lens-style Paper VN detail experience with safe MathJax title rendering, readable entity chips, clean metadata, author affiliations, correct citation/reference labels and improved sidebars.

## Phase 0 — Baseline and encoding recovery

1. Read repo instructions, current handoff, PRD, sprint and BE handoff.
2. Inspect git status and preserve unrelated changes.
3. Run targeted lint/build baseline.
4. Audit mojibake markers.
5. Restore affected files to clean UTF-8 before feature edits.

**Checkpoint:** encoding-only changes are staged and verified.

## Phase 1 — MathJax foundation

1. Install `better-react-mathjax` with the existing package manager.
2. Add one `MathJaxContext` at the application root.
3. Create safe MathML normalization, parsing and plain-text helpers.
4. Create a reusable `ScientificMathText` component.
5. Add tests for plain, valid, malformed, unsafe and dynamically updated content.

**Checkpoint:** build and focused component tests pass before integration.

## Phase 2 — Apply scientific title rendering

Replace direct title rendering in list cards, detail header, recommended items, citing works and references. Preserve plain-text conversion for export, clipboard and attributes.

**Checkpoint:** no raw `<mml:...>` is visible and valid formulas remain formatted.

## Phase 3 — Filter-chip label resolution

1. Add API wrappers/hooks to resolve journal, publisher, author, topic and keyword by ID.
2. Use TanStack Query caching.
3. Render entity display names after refresh/shared-link opening.
4. Topic chip displays only the topic name.
5. Preserve ID-based URLs and removable chips.

**Checkpoint:** no resolvable chip shows `#ID`.

## Phase 4 — Detail metadata cleanup

1. Remove remaining mojibake and `â€”` literals.
2. Hide missing volume, issue, pages and dates.
3. Use `Publication Year` when only a year exists.
4. Remove duplicate metadata rows.
5. Hide E-Published and License when unsupported.
6. Keep click-to-filter behavior for real entities.

**Checkpoint:** metadata is conditional, non-duplicated and truthful.

## Phase 5 — Authors and institutions

1. Consume per-author exact-year institutions from BE.
2. Render affiliation superscripts.
3. Add a deduplicated Institutions section.
4. Preserve ORCID and author filtering.
5. Add an accessible author action popover only if current UI primitives support it without new dependencies.

**Checkpoint:** representative detail records match the BE affiliation response.

## Phase 6 — Citation/reference semantics

1. Use `citation_count` and `reference_count` for imported metrics.
2. Rename the tab to `Citing Works` and use relation total.
3. Label relation references as `Available References` when necessary.
4. Keep modal/tab/header language consistent.
5. Never switch metric source after loading completes.

**Checkpoint:** values remain stable during loading and labels describe their source.

## Phase 7 — Detail right sidebar

1. Render Citing Scholarly Works year chart from all-row BE analytics.
2. Render one clean publication metadata card.
3. Render Open Access information only when real data exists.
4. Hide unsupported fields and links.

**Checkpoint:** sidebar structure follows Lens where supported by data.

## Phase 8 — List sidebar improvements

1. Prefer Top Vietnamese Institutions when BE analytics supports it.
2. Keep Publication Year as a clickable histogram.
3. Improve Top Authors display and interactions.
4. Prefer a readable bar chart for Top Topics.
5. Do not fabricate institution analytics.

**Checkpoint:** every interactive panel uses stable IDs and matching list/analytics filters.

## Phase 9 — Identifiers and external links

1. Rename internal IDs clearly.
2. Show DOI/ISSN and real external IDs only.
3. Render only sourced external links.
4. Remove misleading fake Lens-style integrations.

## Phase 10 — Verification and handoff

1. Run targeted ESLint.
2. Run build and component tests.
3. Search for mojibake and raw MathML.
4. Manually verify chips, formulas, metadata, affiliations, count labels and sidebars.
5. Inspect Network requests for label resolution and citing analytics.
6. Update handoff and confirm core Trending VN was untouched.
7. Do not commit automatically.

## Stop Conditions

Stop and report instead of guessing when:

- BE has not published affiliation/count contracts;
- MathML sanitization cannot be implemented safely with current dependencies;
- requested metadata is absent from API/schema;
- a UI change requires unrelated redesign or core Trending VN modifications.
