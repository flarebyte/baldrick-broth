#!/usr/bin/env zx
/**
 * Run with: zx script/cli-test.mjs
 */

process.env.BALDRICK_BROTH_BUILD_FILE='script/fixture/.baldrick-broth/dev.yaml'
await $`rm -rf report/shell-tests`
await $`mkdir -p report/shell-tests`

await $`yarn cli --help`
echo('---')
await $`yarn cli test generate --help`
echo('---')
await $`yarn cli test generate -c blue`
