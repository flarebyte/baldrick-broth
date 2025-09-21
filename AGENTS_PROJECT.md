# Agent Project Notes

This is a concise, agent-friendly companion to AGENTS.md with repo-specific
tips.

## Quick Verify

-   Full check (lint + unit + pest + coverage): `npx baldrick-broth@latest
    test all`
-   Coverage only (c8): `yarn test:cov` (writes `coverage/lcov.info` +
    HTML)

## Environment

-   Node: `>=22`
-   Dev runner: `tsx` (not `ts-node`).
-   Lint/format: Biome only (`npx @biomejs/biome check .` / `format . --write`).

## Tests

-   Unit tests (node:test): `yarn test`
-   Acceptance tests (pest): `npx baldrick-broth@latest test pest`
-   Smoke tests exercise prod dependencies (see `test/smoke-deps.test.ts`).

## Code Style

-   Use `tsx` for local execution and node:test for units.
-   Do not commit generated artifacts (`dist/`, `coverage/`).
-   Keep diffs small and focused; prefer minimal, surgical changes.
-   After edits, always run `npx baldrick-broth@latest test all`.

## Broth Tasks (high-signal)

-   Test
    -   `test all`: lint, unit, pest, coverage
    -   `test coverage`: unit tests with c8 (lcov + summary)
-   Lint
    -   `lint check`: static analysis
    -   `lint fix`: check --write + format (Biome)

## Gotchas

-   Build via `yarn build` relies on the TypeScript compiler and tsconfig
    values; use Node 22 and avoid mixing with older ts-node patterns.
-   Some workflows call external CLIs (e.g., `gh`, Biome, typedoc). Ensure
    tools are available when running those tasks.

## Where to Edit

-   Docs/maintenance: prefer updating `baldrick-broth.yaml` and rendering
    templates rather than editing generated files.
-   For CLI behavior and tasks, modify source under `src/` and
    corresponding tests under `test/`.
