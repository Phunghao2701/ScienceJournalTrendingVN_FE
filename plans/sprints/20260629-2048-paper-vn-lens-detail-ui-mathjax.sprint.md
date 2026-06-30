---
title: "Paper VN Lens Detail UI and MathJax Sprint"
kind: "sprint"
created_at: "2026-06-29T13:48:13.603Z"
source: "repo-harness-mcp"
---
# Paper VN Lens Detail UI and MathJax Sprint

> **PRD**: `plans/prds/20260629-2047-paper-vn-lens-detail-ui-mathjax.prd.md`
> **Target branch**: `ngoc/feature/trending-lens-style`
> **Dependency**: Read the final BE detail-contract handoff before contract-dependent work.

## Sprint Goal

Deliver a clean Lens-style Paper VN detail experience with correct entity labels, trustworthy metadata/count semantics, author affiliations, improved sidebars, and safe MathJax rendering for scientific titles.

## Tasks

### [x] FE-01 — Baseline and UTF-8 audit

- Read `AGENTS.md`, current handoff, PRD and BE handoff.
- Inspect git status and preserve unrelated changes.
- Run targeted lint/build baseline.
- Search affected source files for mojibake markers such as `Ã`, `Â`, `â€”`, `Æ`, and `á»`.
- Restore clean UTF-8 before behavior changes.

**Stage gate:** stage encoding-only fixes first.

Completed: baseline build passed; repo-wide lint remains blocked by existing unrelated errors. Mojibake scan is clean for touched Paper VN source files.

### [x] FE-02 — Install and configure better-react-mathjax

- Install `better-react-mathjax` using the repo package manager.
- Add exactly one `MathJaxContext` at the application root.
- Use a stable MathJax version/config supported by the installed package.
- Disable unnecessary context menus if product conventions require it.
- Do not add another math-rendering library.

**Stage gate:** stage dependency, lockfile and root context separately after build passes.

Completed: `better-react-mathjax` is installed and one root `MathJaxContext` wraps the app.

### [x] FE-03 — Build safe reusable scientific-math components

Create reusable utilities/components, for example:

```text
src/shared/components/ScientificMathText.jsx
src/shared/utils/scientificMath.js
```

Requirements:

- Support mixed normal text and MathML.
- Normalize `mml:`-prefixed MathML to standard MathML.
- Parse and sanitize using an allowlist.
- Never render unsanitized database content with `dangerouslySetInnerHTML`.
- Use `<MathJax dynamic inline hideUntilTypeset="first">` where appropriate.
- Fall back safely to plain text for malformed MathML.
- Keep a separate plain-text converter for CSV, clipboard and non-visual contexts.

Tests:

- plain title;
- inline `<mml:math>`;
- fraction, superscript and subscript;
- malformed MathML;
- unsafe script/event attributes;
- dynamic prop updates.

**Stage gate:** stage component, utility and tests before replacing call sites.

Completed: added `ScientificMathText`, MathML sanitizer/plain-text helpers and `npm run test:scientific-math`.

### [x] FE-04 — Apply MathJax rendering consistently

Replace direct scientific-title rendering in:

- article result cards;
- article detail header;
- recommended articles;
- citing works;
- references;
- other visible title previews in the Paper VN flow.

Do not strip valid formulas. Use the plain-text helper for export/search/title attributes only.

**Stage gate:** stage call-site integration after visual checks.

Completed: list cards, table/mobile list, detail title and related article cards use `ScientificMathText`; exports/citations use plain text.

### [x] FE-05 — Resolve filter-chip labels by ID

Create a TanStack Query-based label resolver for:

- journal
- publisher
- author
- topic
- keyword

Requirements:

- Chips display names after navigation, refresh and shared-link opening.
- Never display `Publisher #4`, `Author #124` or `Keyword #...` when the API can resolve a name.
- Topic chip displays only the topic name, without `Research Topics:`.
- Unknown/unresolvable entities use a neutral fallback and remain removable.
- URL continues to store stable IDs, not display names.

**Stage gate:** stage resolver hooks/API wrappers and chip rendering together.

Completed: added TanStack Query entity-label resolver for journal, publisher, author, topic and keyword chips.

### [x] FE-06 — Clean detail header metadata

Requirements:

- Remove remaining `â€”` and mojibake.
- Hide Volume and Issue when absent.
- Show `Publication Year` when only a year exists.
- Show full `Published` date only when a real date exists.
- Do not show E-Published without real data.
- Show Pages only when real page data exists.
- Avoid repeated metadata rows.
- Keep journal/publisher/author/topic/keyword click-to-filter behavior.

**Stage gate:** stage header and metadata cleanup separately.

Completed: conditional metadata rows hide absent volume/issue/date fields and remove duplicate E-Published rows.

### [x] FE-07 — Render Lens-style authors and institutions

Using the BE affiliation contract:

- Render author names with affiliation superscripts.
- Show ORCID when present.
- Add an `Institutions` section with deduplicated numbered institutions.
- Clicking an author still supports filtering by `author_id`.
- Optionally add an accessible popover with Filter by Author, View Profile and ORCID actions if existing UI primitives support it.
- Do not infer affiliations from `last_known_institution` when exact-year data is absent.

**Stage gate:** stage author/institution UI after representative data checks.

Completed: authors render affiliation superscripts and a deduplicated Institutions section when BE returns exact-year institution data.

### [x] FE-08 — Correct citation and reference semantics

Display:

```text
Citation Count          article.citation_count
Reference Count         article.reference_count
Citing Works tab        citing_works_count / API relation total
Available References    available_references_count / API relation total
```

Requirements:

- Rename tab from `Citation Count` to `Citing Works`.
- Do not replace imported metrics after relation APIs finish loading.
- Labels clearly distinguish metrics from available records.
- Citation/reference tabs and modal text use the same semantics.

**Stage gate:** stage semantic fixes and tests separately.

Completed: metric labels use imported counts; relation tabs use Citing Works and Available References totals.

### [x] FE-09 — Improve detail right sidebar

Match Lens structure where data exists:

1. Citing Scholarly Works year chart.
2. Clean publication metadata card.
3. Optional Open Access card only when real OA data exists.

Requirements:

- Chart uses all-row BE analytics, not the paginated first page.
- Metadata rows are not duplicated.
- Hide missing fields.
- Do not display `License: Unknown`.
- Do not create fake repository/source links.

**Stage gate:** stage chart and sidebar metadata after BE analytics is available.

Completed: detail sidebar includes all-row citing-works year chart and a clean publication metadata card; fake OA license/source links were removed.

### [x] FE-10 — Improve list-page right sidebar for Paper VN

Preferred order:

1. Top Vietnamese Institutions, with logo/initials and article count when available.
2. Publication Year histogram.
3. Top Authors bar chart/profile list.
4. Top Topics bar chart.

Requirements:

- Clickable items filter by stable IDs.
- Unknown/null items are non-interactive.
- Prefer institutions over publishers for the primary Paper VN panel.
- If institution analytics is not yet available, keep the current publisher panel but document the backend gap; do not fabricate institutions.

**Stage gate:** stage only panels supported by real analytics.

Completed: sidebar supports `topInstitutions` when the analytics contract provides it, otherwise keeps publishers and documents the backend gap; topics now render as a readable bar list.

### [x] FE-11 — Identifiers and external links cleanup

- Rename `W{article_id}` to `ResearchPulse ID` unless a real OpenAlex ID exists.
- Show DOI, ISSN and real external identifiers only.
- Show DOI/publisher/PDF/OpenAlex/Semantic Scholar links only when real URLs exist.
- Do not imitate WorldCat, LibKey or publisher links without source data.

**Stage gate:** stage identifiers and links separately.

Completed: internal ID is labeled ResearchPulse ID and only DOI/source-backed external links are rendered.

### [x] FE-12 — Verification and handoff

Run and report:

- targeted ESLint for touched files;
- `npm run build`;
- component/unit tests for math rendering and count semantics;
- search for remaining mojibake;
- manual checks for formula titles, filter chips, author affiliations, citation/reference labels and sidebars;
- Network checks for entity-label endpoints and citing-works analytics;
- responsive and keyboard-accessibility checks.

Update `.ai/harness/handoff/current.md` with changed files, commands, results, limitations and confirmation that core Trending VN was untouched.

Completed: handoff updated with commands, outputs and remaining manual/browser limitations.

## Acceptance Criteria

- [ ] Filter chips show names; topic chip shows only its name.
- [ ] MathML renders through MathJax and raw tags are absent.
- [ ] No unsafe raw HTML rendering is introduced.
- [ ] Detail metadata is clean, conditional and non-duplicated.
- [ ] Authors and institutions render from exact-year affiliation data.
- [ ] Citation/reference semantics are correct.
- [ ] Detail sidebar includes citing-works year analytics and clean metadata.
- [ ] List sidebar prioritizes Paper VN institutions when supported.
- [ ] Identifiers and links are truthful.
- [ ] Build, targeted lint and tests pass.

## Constraints

- Only `better-react-mathjax` may be added for this sprint unless its documented peer dependency is required.
- No automatic commit.
- No core Trending VN modification.
- No fabricated metadata or external links.
- Stop and report when the BE contract lacks required data.
