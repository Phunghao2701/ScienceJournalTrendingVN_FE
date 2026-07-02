---
title: "Lens-Style Detail, Sidebar and MathJax Sprint"
kind: "sprint"
created_at: "2026-06-29T13:44:27.684Z"
source: "repo-harness-mcp"
---
# Lens-Style Detail, Sidebar and MathJax Sprint

> **Status**: Draft

## Source

- PRD: `plans/prds/20260629-2040-lens-style-detail-sidebar-mathjax.prd.md`

## Execution Rule

- Execute task cards in order.
- Keep each task card reviewable as one staged slice.
- After every completed phase, update the checklist and stage the result before continuing.
- Do not treat unstaged work as a completed phase.

## Checklist

### Task Card 1: FE-01 — Baseline and dependency setup

- [ ] Objective: Inspect the current detail/list implementation, record baseline checks, and install only better-react-mathjax.
- [ ] Files/entrypoints: `package.json`, `package-lock.json`, `src/main.jsx`, `src/app`
- [ ] Verification: `Record git status and baseline lint/build`, `Install better-react-mathjax only`, `Do not add other dependencies`
- [ ] Stage gate: Stage dependency and root setup only.

### Task Card 2: FE-02 — Add safe scientific math rendering

- [ ] Objective: Create one MathJaxContext and a reusable ScientificMathText component for mixed text and MathML.
- [ ] Files/entrypoints: `src/main.jsx`, `src/shared/components/ScientificMathText.jsx`, `src/shared/utils/scientificMath.js`
- [ ] Verification: `Normalize mml-prefixed tags`, `Parse with DOMParser and an allowlist`, `Do not render unsanitized innerHTML`, `Support plain text, fractions, subscript, superscript, malformed input and dynamic updates`
- [ ] Stage gate: Stage component, helpers and tests.

### Task Card 3: FE-03 — Apply MathJax to article titles

- [ ] Objective: Replace direct title rendering in every Paper VN title surface.
- [ ] Files/entrypoints: `src/features/trendingVN/components/TrendingArticleCard.jsx`, `src/features/trendingVN/pages/ArticleDetailPage.jsx`, `src/features/article`
- [ ] Verification: `Apply to list and detail titles`, `Apply to recommended, citing works and references titles`, `Keep a separate plain-text helper for export/search`, `No raw mml:math remains visible`
- [ ] Stage gate: Stage title integration after visual checks.

### Task Card 4: FE-04 — Resolve filter chip names

- [ ] Objective: Use the backend label resolver so chips show entity names after refresh.
- [ ] Files/entrypoints: `src/features/trendingVN/pages/TrendingVNPage.jsx`, `src/features/article/hooks`, `src/features/article/api`
- [ ] Verification: `Publisher, author, journal, keyword and institution chips show names`, `Topic chip shows only the topic name without Research Topics prefix`, `Missing entities fall back safely without #ID labels`, `Clear and Back/Forward behavior remains correct`
- [ ] Stage gate: Stage label resolution and chip UI.

### Task Card 5: FE-05 — Clean Lens-style detail metadata

- [ ] Objective: Remove duplicate and misleading rows and render only available publication metadata.
- [ ] Files/entrypoints: `src/features/trendingVN/pages/ArticleDetailPage.jsx`
- [ ] Verification: `No mojibake dash remains`, `Hide volume/issue when absent`, `Use Publication Year when only a year exists`, `Remove duplicate Published/E-Published/Publication Info rows`, `Do not show E-Published without real data`, `Use truthful identifiers and links`
- [ ] Stage gate: Stage metadata cleanup.

### Task Card 6: FE-06 — Render authors and institutions like Lens

- [ ] Objective: Display author affiliation superscripts, an Institutions section, and accessible author actions.
- [ ] Files/entrypoints: `src/features/trendingVN/pages/ArticleDetailPage.jsx`, `src/features/trendingVN/trendingVN.css`
- [ ] Verification: `Map authors to numbered institutions`, `Deduplicate institutions`, `Show ORCID when present`, `Provide Filter by Author and View Profile actions`, `Keep keyboard accessibility and responsive layout`
- [ ] Stage gate: Stage author/institution presentation.

### Task Card 7: FE-07 — Correct citation and reference semantics

- [ ] Objective: Use imported metrics in the header and available relation counts in tabs/lists.
- [ ] Files/entrypoints: `src/features/trendingVN/pages/ArticleDetailPage.jsx`, `src/features/trendingVN/hooks/useTrendingArticleDetail.js`
- [ ] Verification: `Header Citation Count uses article.citation_count`, `Header Reference Count uses article.reference_count`, `Tab label uses Citing Works count`, `Reference tab uses Available References count when needed`, `Do not switch count sources after loading`
- [ ] Stage gate: Stage semantic count fixes.

### Task Card 8: FE-08 — Build the detail right sidebar

- [ ] Objective: Match Lens structure with a citing-works-by-year chart and one truthful metadata card.
- [ ] Files/entrypoints: `src/features/trendingVN/pages/ArticleDetailPage.jsx`, `src/features/trendingVN/trendingVN.css`, `src/features/trendingVN/hooks/useTrendingArticleDetail.js`
- [ ] Verification: `Render complete year analytics, not paginated samples`, `Metadata card has no duplicate rows`, `Open Access card shows only real license/link data`, `Hide unavailable fields`, `Responsive behavior matches the summary grid`
- [ ] Stage gate: Stage detail sidebar and checks.

### Task Card 9: FE-09 — Improve the list right sidebar

- [ ] Objective: Present Top Vietnamese Institutions, Publication Year, Top Authors and Top Topics in a Lens-style interactive layout.
- [ ] Files/entrypoints: `src/features/trendingVN/pages/TrendingVNPage.jsx`, `src/features/trendingVN/components`, `src/features/article/hooks/useArticleAnalytics.js`
- [ ] Verification: `Institution cards show logo/name/count and filter by institution_id`, `Publication year uses an interactive histogram`, `Authors use readable bars and filter by author_id`, `Topics use readable bars and filter by topic_id`, `Unknown items are non-clickable`
- [ ] Stage gate: Stage list sidebar improvements.

### Task Card 10: FE-10 — Verify and hand off

- [ ] Objective: Run automated and manual checks, then update the handoff.
- [ ] Files/entrypoints: `.ai/harness/handoff/current.md`
- [ ] Verification: `Run targeted lint and build`, `Run MathJax tests`, `Check mojibake and raw MathML searches`, `Compare detail and list sidebars with Lens references`, `Verify mouse, keyboard, Back/Forward and responsive behavior`, `Do not auto-commit`
- [ ] Stage gate: Final verification and handoff only.

## Final Acceptance

- [ ] All task cards are checked.
- [ ] Required checks pass.
- [ ] Handoff explains staged state, residual risks, and next bottleneck if any.
