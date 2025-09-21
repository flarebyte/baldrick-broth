import {test} from 'node:test';
import assert from 'node:assert';
import YAML from 'yaml';

import {getSchema, safeParseBuild, unsafeParse} from '../src/build-model.js';
import fs from 'node:fs/promises';

test('build-model: getSchema accepts minimal object', () => {
  const schema = getSchema('default');
  // Minimal object with required keys for light schema
  const minimal = {
    engine: {
      telemetry: {
        verbosity: 'off',
        filepath: 'logs/telemetry.csv',
      },
    },
    workflows: {},
  };
  const result = schema.safeParse(minimal);
  assert.strictEqual(result.success, true);
});

test('build-model: safeParseBuild succeeds for valid fixture', async () => {
  const content = await fs.readFile('spec/fixtures/build.yaml', 'utf8');
  const obj = YAML.parse(content);
  const result = safeParseBuild(obj);
  assert.strictEqual(result.status, 'success');
});

test('build-model: safeParseBuild fails for invalid title length', async () => {
  const content = await fs.readFile('spec/fixtures/build.yaml', 'utf8');
  const obj = YAML.parse(content);
  // Mutate a title to exceed 60 chars
  obj.workflows.test.title = 'X'.repeat(70);
  const result = safeParseBuild(obj);
  assert.strictEqual(result.status, 'failure');
  assert.ok(Array.isArray(result.error));
});

test('build-model: unsafeParse validates context and commands', async () => {
  const ctxContent = await fs.readFile('spec/fixtures/context.yaml', 'utf8');
  const commandsContent = await fs.readFile('spec/fixtures/commands.yaml', 'utf8');
  const ctx = YAML.parse(ctxContent);
  const commands = YAML.parse(commandsContent);

  const parseContext = unsafeParse({model: 'context'});
  const parseCommands = unsafeParse({model: 'commands'});

  assert.deepStrictEqual(parseContext(ctx), ctx);
  assert.deepStrictEqual(parseCommands(commands), commands);
});

