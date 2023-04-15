# baldrick-broth

![npm](https://img.shields.io/npm/v/baldrick-broth) ![Build
status](https://github.com/flarebyte/baldrick-broth/actions/workflows/main.yml/badge.svg)
![npm bundle size](https://img.shields.io/bundlephobia/min/baldrick-broth)

![npm type definitions](https://img.shields.io/npm/types/baldrick-broth)
![node-current](https://img.shields.io/node/v/baldrick-broth)
![NPM](https://img.shields.io/npm/l/baldrick-broth)

> Build automation tool and task runner

Take your developer workflow to the next level with a custom CLI with
relevant documentation for running your task

Highlights:

-   Automate tasks such as minification, concatenation, testing, and
    compilation of code.
-   Reduce the amount of time needed to set up a project
-   YAML configuration with json-schema allowing code assistance in editor.
-   Provide clear documentation for each step of a project build
-   Ensure that documentation is always up-to-date and available in the CLI
-   Run certain tasks only if certain conditions are met
-   Allow developers to define their own model for their project
-   Provide an easy way for developers to provide interactive input when
    running the program

## Documentation and links

-   [Code Maintenance](MAINTENANCE.md)
-   [Code Of Conduct](CODE_OF_CONDUCT.md)
-   [Api for baldrick-broth](API.md)
-   [Contributing](CONTRIBUTING.md)
-   [Glossary](GLOSSARY.md)
-   [Diagram for the code base](INTERNAL.md)
-   [Vocabulary used in the code base](CODE_VOCABULARY.md)
-   [Architectural Decision Records](DECISIONS.md)
-   [Contributors](https://github.com/flarebyte/baldrick-broth/graphs/contributors)
-   [Dependencies](https://github.com/flarebyte/baldrick-broth/network/dependencies)
-   [Usage](USAGE.md)
-   [Json schema for broth yaml
    file](spec/snapshots/build-model/get-schema--schema.json)
-   [Overview for the json schema for broth yaml file](SCHEMA.md)

## Related

-   [baldrick-zest-engine](https://github.com/flarebyte/baldrick-zest-engine)
    Run tests declaratively with a few cunning plans

## Installation

This package is [ESM
only](https://blog.sindresorhus.com/get-ready-for-esm-aa53530b3f77).

```bash
yarn global add baldrick-broth
baldrick-broth --help
```

Or alternatively run it:

```bash
npx baldrick-broth --help
```

If you want to tun the latest version from github. Mostly useful for dev:

```bash
git clone git@github.com:flarebyte/baldrick-broth.git
yarn global add `pwd`
```
