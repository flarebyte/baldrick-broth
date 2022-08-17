#!/usr/bin/env zx
/**
 * Run with: zx script/cli-test.mjs
 */

const assertSuccess = (test, message) => {
    if (test) {
        echo(`✅ OK: ${message}\n---\n`)
    } else {
        echo(`❌ KO: ${message}\n---\n`)
    }
}

process.env.BALDRICK_BROTH_BUILD_FILE='script/fixture/.baldrick-broth/dev.yaml'
await $`rm -rf report/shell-tests`
await $`mkdir -p report/shell-tests`

const helpCli = await $`yarn cli --help`
assertSuccess(`${helpCli}`.includes('CLI for build automation'), 'broth --help')
await $`yarn cli test generate --help`
await $`yarn cli test generate -c blue`
