# Agents Index

This repository is template-driven. Prefer making documentation and
maintenance changes via baldrick-reserve templates and broth workflows rather
than editing files directly here.

-   Source of truth for docs/templates: `../baldrick-reserve`
    -   TS templates: `baldrick-reserve/template/ts/*.hbs`
    -   Scripts: `baldrick-reserve/script/*`
    -   Reserve model/schema: `baldrick-reserve/reserve-schema`
-   Project model and workflows: `baldrick-broth.yaml` in this repo
    -   Update metadata/links/highlights in `model.*` (readme, project info)
    -   Extend maintenance flows in `workflows.*`

Core docs (generated from templates): README, MAINTENANCE, TECHNICAL\_DESIGN,
CODE\_OF\_CONDUCT, CONTRIBUTING, DECISIONS.

## Write/Customize README via Broth

README is generated from `baldrick-broth.yaml` using the TS README template.

-   Render locally:
    -   `npx baldrick-whisker@latest render baldrick-broth.yaml
        github:flarebyte:baldrick-reserve:template/ts/readme.hbs README.md`
-   Populate `model.readme` in `baldrick-broth.yaml` to customize content.
    Optional fields:
    -   `summary`, `personas`, `valueProps`
    -   `images.hero`, `images.demo`
    -   `quickstart` (intro, steps, code), `useCases`
    -   `configuration.env[]`, `configuration.files[]`
    -   `cliExamples[]`, `apiExamples[]`
    -   `architecture.overview[]`, `architecture.diagram`
    -   `faq[]`, `troubleshooting[]`
-   Existing `highlights` and `cheatsheet` remain supported as fallbacks.

## Day-to-day commands

-   Install: `yarn install`
-   Build: `yarn build`
-   Test: `yarn test` (node:test)
-   Lint/format (Biome): `npx @biomejs/biome check .` / `npx @biomejs/biome
    format . --write`
-   Broth alias: `npx baldrick-broth@latest <workflow> <task>` (e.g., `test
    pest`)

## Use Broth via npx

-   Preferred: `npx baldrick-broth@latest <workflow> <task> [options]`
-   Discover commands:
    -   List workflows: `npx baldrick-broth@latest --help`
    -   List tasks for a workflow: `npx baldrick-broth@latest <workflow> --help`
-   Common examples (mapped from `baldrick-broth.yaml`):
    -   Test: `npx baldrick-broth@latest test unit` | `test pest` | `test pest1` | `test scc` | `test cli`
    -   Lint: `npx baldrick-broth@latest lint check` | `lint fix`
    -   Docs: `npx baldrick-broth@latest doc ts`
    -   Markdown: `npx baldrick-broth@latest md check` | `md fix`
    -   Transpile: `npx baldrick-broth@latest transpile ts`
    -   Deps: `npx baldrick-broth@latest deps upgrade`
    -   GitHub: `npx baldrick-broth@latest github standard`
    -   Release: `npx baldrick-broth@latest release ready --pull-request` | `release pr` | `release publish`
    -   Scaffold: `npx baldrick-broth@latest scaffold norm` | `scaffold norm-package` | `scaffold upgrade` | `scaffold readme` | `scaffold custom`
-   Notes:
    -   Runs from repo root and reads `baldrick-broth.yaml` for workflows/tasks.
    -   Pin a version if needed: `npx baldrick-broth@0.14.0`.
    -   Some tasks invoke external CLIs (e.g., `gh`, `typedoc`, Biome). Ensure they’re available and Node >= 22.
    -   Fallback to yarn only if needed: use `yarn cli` (TS dev), or `yarn build` then `node dist/src/cli.mjs`.
