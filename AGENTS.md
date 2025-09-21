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
