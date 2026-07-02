---
title: "Implement Lens-Style Detail, Sidebar and MathJax"
kind: "plan"
created_at: "2026-06-29T13:45:04.199Z"
source: "repo-harness-mcp"
---
# Implement Lens-Style Detail, Sidebar and MathJax

> PRD: `plans/prds/20260629-2040-lens-style-detail-sidebar-mathjax.prd.md`
> Sprint: `plans/sprints/20260629-2044-lens-style-detail-sidebar-mathjax.sprint.md`
> Target branch: `ngoc/feature/trending-lens-style`
> Dependency: read the completed backend handoff before contract-dependent work.

## Goal

Deliver a clean Lens-style Paper VN detail/list experience with truthful metadata, correct count semantics, institution-aware authors and sidebars, and safe MathJax rendering for scientific titles.

## Phase 0 — Baseline and dependency

- Read repo instructions, current handoff, PRD, sprint and final backend handoff.
- Preserve unrelated changes.
- Run targeted lint/build baseline.
- Install only `better-react-mathjax` and update the lockfile.

## Phase 1 — MathJax foundation

- Add exactly one `MathJaxContext` at the app root.
- Create `ScientificMathText` and a separate plain-text converter.
- Normalize `mml:` namespaces.
- Parse mixed text/MathML using DOMParser and an explicit allowlist converted to React nodes.
- Do not pass unsanitized database HTML through `dangerouslySetInnerHTML`.
- Add tests for plain text, inline MathML, fractions, sub/superscripts, malformed data, unsafe input and dynamic updates.

## Phase 2 — Use math rendering everywhere titles appear

Apply `ScientificMathText` to:

- article result cards;
- detail header;
- citing works;
- references;
- recommended/related articles.

Keep plain text for CSV, search values, clipboard metadata and accessibility fallbacks.

## Phase 3 — Human-readable filter chips

- Consume the backend label resolver through TanStack Query.
- Show real names for journal, publisher, author, keyword and institution filters after refresh.
- Show only the topic name, without `Research Topics:`.
- Avoid `Publisher #4` and `Author #124` fallbacks; use a neutral unavailable label only when resolution truly fails.

## Phase 4 — Detail metadata cleanup

- Remove remaining mojibake literals.
- Hide Volume/Issue when absent.
- Use `Publication Year` when only a year exists.
- Remove duplicate Published/E-Published/Publication Info rows.
- Never render E-Published without real data.
- Show truthful IDs and source links only.

## Phase 5 — Lens-style authors and institutions

- Build stable institution numbering from the backend detail response.
- Render author superscripts and ORCID icons.
- Add an Institutions section.
- Provide accessible author actions for filtering and profile navigation.
- Keep responsive wrapping for long author lists.

## Phase 6 — Correct citation/reference meaning

- Header: use `citation_count` and `reference_count` from Article.
- Tabs: use `available_citing_works_count` and `available_references_count`.
- Rename the citations tab to `Citing Works`.
- Do not change metric values after relation requests finish loading.

## Phase 7 — Detail right sidebar

- Render a non-paginated citing-works-by-year chart.
- Render one metadata card with only available rows.
- Keep Open Access details truthful; hide unknown license and absent links.
- Match Lens spacing/visual hierarchy without copying unsupported features.

## Phase 8 — List right sidebar

Present, in order:

1. Top Vietnamese Institutions with logo/name/count and `institution_id` filtering.
2. Publication Year histogram with year filtering.
3. Top Authors bar/profile list with `author_id` filtering.
4. Top Topics bar chart with `topic_id` filtering.

Unknown entities must not be interactive. List and analytics requests must share the same normalized filters.

## Phase 9 — Verification and handoff

- Run targeted ESLint, build and MathJax tests.
- Search source for mojibake and visible raw MathML.
- Verify mouse/keyboard interactions, Back/Forward, filter clearing and responsive layout.
- Compare detail/list sidebar structure against the supplied Lens references.
- Update `.ai/harness/handoff/current.md` with changed files, exact commands/results and remaining limitations.
- Do not commit automatically.

## Stop conditions

Stop and report rather than inventing data when the backend does not provide stable IDs, affiliations, counts or chart data; when UTF-8 recovery risks unrelated changes; or when a requested feature would require dependencies beyond `better-react-mathjax`.
