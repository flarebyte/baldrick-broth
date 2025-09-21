import {test} from 'node:test';
import assert from 'node:assert';
import YAML from 'yaml';
import fs from 'node:fs/promises';

import {basicCommandsExecution} from '../src/basic-execution.js';
import {unsafeParse} from '../src/build-model.js';

test('basic-execution: runs commands and populates ctx.data', async () => {
  const ctxYaml = await fs.readFile('spec/fixtures/context.yaml', 'utf8');
  const commandsYaml = await fs.readFile('spec/fixtures/commands.yaml', 'utf8');
  const inputCtx = YAML.parse(ctxYaml);
  const commands = YAML.parse(commandsYaml);

  // Validate/normalize structures using existing parsers
  const asContext = unsafeParse({model: 'context'});
  const asCommands = unsafeParse({model: 'commands'});
  const ctx = asContext(inputCtx);
  const commandList = asCommands(commands);

  const memoryId = 'T1';
  const result = basicCommandsExecution(memoryId, ctx, commandList);

  assert.strictEqual(result.status, 'success');
  // get-property stores runtime.project.name under memory namespace
  assert.strictEqual(ctx.data[`${memoryId}::get-property`], 'baldrick-broth');
  // split-string on task.description
  assert.deepStrictEqual(ctx.data[`${memoryId}::split-string`], ['Generate', 'code']);
  // ranges
  assert.deepStrictEqual(ctx.data[`${memoryId}::range5-7`], [5, 6, 7]);
  assert.strictEqual((ctx.data[`${memoryId}::range7`] as unknown[]).length, 7);
  // masked object contains selected properties
  const masked = ctx.data[`${memoryId}::masked`] as Record<string, unknown>;
  assert.ok('copyright' in masked && 'colors' in masked);
  // get-property-previous reads data.get-property
  assert.strictEqual(
    ctx.data[`${memoryId}::get-property-previous`],
    ctx.data[`${memoryId}::get-property`],
  );
});

