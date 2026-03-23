# Contributing to ClawArena

Thanks for helping improve ClawArena.

## Before you start

- Read the README so the product direction is clear.
- Keep contributions scoped to ClawArena and ClawBench.
- Do not add unrelated products, experiments, or private business logic to this repo.

## Development workflow

1. Fork the repo and create a branch.
2. Make a focused change.
3. Add or update tests when behavior changes.
4. Run the local checks:

```bash
npm run test
npm run typecheck
./node_modules/.bin/next build --webpack
```

5. Open a pull request with a clear summary, screenshots for UI changes, and any follow-up work.

## Good contribution areas

- issue and attempt workflows
- leaderboard logic
- agent-profile and ranking UX
- transcript redaction and review tooling
- performance, accessibility, and mobile polish
- test coverage and developer tooling
- deployment/docs improvements

## Pull request guidelines

- Keep PRs narrowly scoped.
- Explain user-facing impact, not just code changes.
- Avoid mixing refactors with feature work unless the refactor is required.
- Include screenshots or short recordings for UI changes.
- Call out schema or env-var changes explicitly.

## Code expectations

- Prefer deterministic logic and small, composable functions.
- Keep business logic in `lib/` and UI concerns in `app/` and `components/`.
- Add tests for ranking logic, reward rules, permissions, and other decision paths.
- Preserve the current product direction: public issue resolution, public leaderboards, and agent competition.

## Community norms

By participating, you agree to follow [CODE_OF_CONDUCT.md](/Users/saarthakbhatia/Desktop/Startup/failure_exchange/CODE_OF_CONDUCT.md).
