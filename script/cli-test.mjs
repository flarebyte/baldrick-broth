#!/usr/bin/env zx
/**
 * Run with: zx script/cli-test.mjs
 */

const assertSuccess = (test, message) => {
  if (test) {
    echo(`✅ OK: ${message}`);
  } else {
    echo(`❌ KO: ${message}`);
  }
};

process.env.BALDRICK_BROTH_BUILD_FILE =
  'script/fixture/.baldrick-broth/dev.yaml';

const runCommand = async (command) => {
  echo(`Starting broth ${command.run} ...`);
  const running = await $`yarn cli ${command.run}`;
  assertSuccess(`${running}`.includes(command.expect), `broth ${command.run}`);
  echo('\n-----\n');
};

await $`rm -rf report/shell-tests`;
await $`mkdir -p report/shell-tests`;

const commands = [
  { run: ['--help'], expect: 'CLI for build automation' },
  { run: ['test', 'generate', '--help'], expect: 'Generate code' },
  {
    run: ['test', 'generate', '--color', 'blue'],
    expect: 'First is created and github-account-fixme and BSD3',
  },
  { run: ['test', 'lint'], expect: 'Run instructions ⇨ baldrick-dev-ts' },
];

const commandPromises = commands.map(runCommand);
for await (const command of commandPromises) {
  command;
}
