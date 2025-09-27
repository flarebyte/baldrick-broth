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

## Listr2 Upgrade Guidance (Node ≥20)

Use this ready-made model answer when advising maintainers on upgrading `listr2` in a TypeScript CLI. The project builds on Node 22 but enforces Node ≥20 at runtime.

### Compatibility Summary

| Node.js version | Supported listr2 majors |
| --- | --- |
| 16.x | 6.x, 7.x |
| 18.x | 6.x, 7.x, 8.x |
| ≥20.x | 6.x–9.x (recommend 9.x) |

Minimum engines by major:
- 6.x: Node ≥16
- 7.x: Node ≥16
- 8.x: Node ≥18
- 9.x: Node ≥20

Recommendation (Node ≥20 baseline): target `listr2@^9.0.4` (or latest 9.x).

### Breaking Changes & Key Differences

- Engine drops by major:
  - v6 requires Node 16+
  - v8 requires Node 18+
  - v9 requires Node 20+
- Monorepo split in v7+: prompt integrations are externalized into adapter packages:
  - `@listr2/prompt-adapter-enquirer` (peer: `enquirer`)
  - `@listr2/prompt-adapter-inquirer` (peer: `inquirer`)
- TypeScript API updates:
  - v9: `createWritable` returns a Node `Writable` stream type.
- Ecosystem shifts:
  - RxJS removed; observables handling refactored.
  - ESM and CJS support remains.

### Prompts / Dependencies

If your tasks prompt users, install an adapter and its peer:
- Enquirer adapter:
  - `npm i listr2@^9 @listr2/prompt-adapter-enquirer enquirer`
- Inquirer adapter:
  - `npm i listr2@^9 @listr2/prompt-adapter-inquirer inquirer`

### Migration Instructions (to v9.x on Node ≥20)

1) Update engines and dependency:

```json
{
  "engines": { "node": ">=20" },
  "dependencies": {
    "listr2": "^9.0.4"
  }
}
```

2) If using prompts, add an adapter + peer:

```json
{
  "dependencies": {
    "listr2": "^9.0.4",
    "@listr2/prompt-adapter-enquirer": "^1.0.0",
    "enquirer": "^2.4.1"
  }
}
```

3) Update imports and prompt wiring (v7+):
- Replace any direct prompt usage with the appropriate adapter package.
- Ensure your task definitions reference the adapter instance where required.

4) TS API checks:
- If you use `createWritable`, adjust types to accept/expect Node `Writable`.
- Rebuild and fix any type mismatches introduced by stricter types in v9.

5) Observables:
- Remove RxJS-specific code paths; adopt the built-in observable handling provided by `listr2` without external RxJS.

6) Verify runtime and CI:
- Run on Node 20 and 22 in CI. Add an `engines` field and optionally `engineStrict` via your package manager for local guardrails.

### Example Install Commands (Node ≥20)

- Core only: `npm i listr2@^9`
- With Enquirer prompts: `npm i listr2@^9 @listr2/prompt-adapter-enquirer enquirer`
- With Inquirer prompts: `npm i listr2@^9 @listr2/prompt-adapter-inquirer inquirer`

### Maintainer Notes (TypeScript CLI)

- Keep `tsconfig` and types aligned with Node’s stream types (v9 change).
- Validate task renderer behavior across ESM/CJS if you publish dual modules.
- Warn users: running on Node <20 can cause runtime failures on v9.
