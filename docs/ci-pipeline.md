# CI Pipeline — Plan

## Goal
Add a GitHub Actions workflow that automatically runs the project's static and
automated checks on every push and pull request, mirroring the "every commit"
bar already defined in `CLAUDE.md` (build clean, lint clean, tests green,
coverage thresholds met).

## Trigger
- `push` — any branch (so work-in-progress branches like `july-week-1` get
  checked, not just `main`).
- `pull_request` — targeting `main`.

## Jobs / steps
Single job, `ubuntu-latest`, Node 22 (matches local dev environment; no
`.nvmrc`/`engines` field currently pins a version):

1. `actions/checkout@v4`
2. `actions/setup-node@v4` (Node 22, `cache: npm`)
3. `npm ci`
4. `npm run lint` (oxlint)
5. `npm run build` (`tsc -b && vite build`)
6. `npm run coverage` (`vitest run --coverage` — runs the full unit test
   suite and enforces the thresholds already set in `vite.config.ts`:
   lines 70 / functions 70 / branches 65 / statements 70)

This covers every item in CLAUDE.md's "Static checks" and "Automated tests"
sections in one job. No matrix (single Node version) to keep it fast; can add
a matrix later if needed.

## Deliverable
`.github/workflows/ci.yml`

## Out of scope (for this pass)
- Playwright/e2e (doesn't exist yet — `tests/e2e` is a placeholder per
  CLAUDE.md's test architecture section).
- Deploy/publish steps — frontend-only phase, no deploy target yet.
- Branch protection rules (requires a GitHub admin action, not a file in the
  repo — can walk through this separately once the workflow is in and green).

## Verify
- Push a branch with a known lint error → job fails at the lint step.
- Push a branch with a known failing test → job fails at the coverage/test
  step.
- Push clean work → all steps pass, green check on the commit/PR.
