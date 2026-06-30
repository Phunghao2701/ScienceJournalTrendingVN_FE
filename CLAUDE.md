# Scientific Journal System FE — Agent Instructions

## Project overview

This is the frontend of the Scientific Journal Publication Trend Tracking System.

## Technology stack

- React
- React-Bootstrap
- Zustand for client-side global state
- Axios or the existing API service layer
- i18n for multilingual content
- Backend API is maintained in a separate repository

## Required engineering rules

- Follow the existing project structure and naming conventions.
- Do not introduce a new state-management library.
- Use Zustand when global client state is required.
- Prefer component-local state for isolated UI behavior.
- Do not store sensitive user information in localStorage.
- Only store the authentication token according to the existing project convention.
- Add comments for functions whose purpose is not immediately obvious.
- Reuse existing components and services before creating new ones.
- Do not change backend contracts or database schemas without approval.
- Do not modify unrelated files.
- Do not install new dependencies without asking first.

## UI rules

- Use React-Bootstrap components where appropriate.
- Every data page must handle:
  - Loading state
  - Empty state
  - Error state
  - Successful state
- Interfaces must remain responsive.
- Preserve the existing visual language of the project.
- Avoid unnecessary gradients, oversized cards and excessive rounded corners.

## Search rules

- Article lists default to the highest relevant metric.
- Search query and filter behavior must be predictable.
- Pagination must reset appropriately when the query changes.

## Verification commands

Before declaring a task complete, run the commands available in package.json, including:

- Build
- Lint
- Relevant tests

Report the actual command output. Do not claim success without verification.

## Git rules

- Work only on the current feature branch.
- Keep changes focused on the requested feature.
- Do not commit automatically unless explicitly requested.
- Present the changed files before suggesting a commit.
