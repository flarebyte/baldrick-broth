import assert from 'node:assert';
import { test } from 'node:test';

import { getSingleCommandLine } from '../src/templating.js';

test('templating: expand single command', () => {
  const line = getSingleCommandLine('echo {{name}}', { name: 'World' });
  assert.strictEqual(line, 'echo World');
});
