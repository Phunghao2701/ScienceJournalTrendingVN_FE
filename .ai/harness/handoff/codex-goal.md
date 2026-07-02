---
title: "Codex Goal"
kind: "codex-goal"
created_at: "2026-06-30T07:14:40.412Z"
source: "repo-harness-mcp"
---
# Codex Goal

## Source of truth

- PRD: `plans/prds/20260630-1414-paper-vn-analysis-view-consistency-corrective.prd.md`
- Checklist Sprint: `plans/sprints/20260630-1414-paper-vn-analysis-view-consistency-corrective.sprint.md`
- Reference repo: `ScienceJournalTrendingVN_BE` (read-only comparison source)

## Role

Codex is the executor. ChatGPT/repo-harness may prepare planning artifacts, but implementation ownership stays in the local Codex session.

## Scope

- Open or use an isolated worktree for the sprint implementation.
- Execute the checklist Sprint task cards in order.
- Update the Sprint checklist as phases complete.
- Stage each completed phase before continuing to the next phase.
- Do not modify the reference repo or ignored secrets/ops state.

## Required workflow

1. Read the PRD and Sprint paths above before editing.
2. Build the P1/P2/P3 map required by repo-local AGENTS.md for non-trivial changes.
3. Execute one checklist task card at a time.
4. After each phase, run the relevant focused checks, update the checklist, and stage the completed slice.
5. Continue until the Sprint checklist is complete or a real blocker is reached.
6. Leave a concise handoff with staged state and verification evidence.

Work on existing FE branch ngoc/feature/trending-lens-style and preserve unrelated dirty/staged changes. Run this only after the BE corrective sprint for institution_id and primary-or-subtopic topic filtering is complete. Start with failing pure tests. Fix these exact FE issues: Analysis top stats must use analysis.summary or hide unavailable fields; clearFilters and filter updates must preserve the current view and Analysis must not add page; detail returnTo must preserve the exact current pathname+search and resultCount must use activeResultTotal; explicit from_year/to_year must take precedence over publication_year; the lightweight sidebar year chart must not clip long ranges; Analysis must still render when current scholarly_works is zero but trending/citation cohort coverage is nonzero. Verify institution and topic click-through against the corrected backend. Do not add dependencies, edit backend/schema/crawler, commit or push. Run pure tests, targeted ESLint, build, HTTP smoke and browser/network verification only if available. Stage each phase separately and update handoff/checks with real evidence.

## Required checks

- Run the checks named by the Sprint task card.
- At sprint closeout, run repo-required checks unless the Sprint narrows the verification surface with a stated reason.

## Done when

- The checklist Sprint is complete.
- Every completed phase is staged.
- Checks pass or failures are documented with exact blocker evidence.
- No commit is created unless the user explicitly asks for commit.

## Host-native /goal prompt

```text
/goal
Read: plans/prds/20260630-1414-paper-vn-analysis-view-consistency-corrective.prd.md
Open or use a worktree and complete: plans/sprints/20260630-1414-paper-vn-analysis-view-consistency-corrective.sprint.md
After each completed phase, stage the result before continuing.
Use the user's language for status reports unless repo-local instructions require otherwise.
Reference repo: ScienceJournalTrendingVN_BE
```
