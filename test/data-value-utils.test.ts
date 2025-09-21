import {test} from 'node:test';
import assert from 'node:assert';

import {getSupportedProperty, setDataValue} from '../src/data-value-utils.js';
import type {Ctx} from '../src/build-model.js';

test('data-value-utils: setDataValue adds and deletes entries', () => {
  const ctx = {
    build: {engine: {telemetry: {verbosity: 'off', filepath: 'logs/t.csv'}}, model: {}, workflows: {}},
    task: {title: 't', main: {commands: []}},
    runtime: {pwd: '.', project: {name: 'p'}, parameters: {}},
    data: {},
  } as unknown as Ctx;

  setDataValue('T1', ctx, 'foo', 'bar');
  assert.strictEqual(ctx.data['T1::foo'], 'bar');
  setDataValue('T1', ctx, 'foo', undefined);
  assert.strictEqual(ctx.data['T1::foo'], undefined);
});

test('data-value-utils: getSupportedProperty uses local then root data', () => {
  const ctx = {
    build: {engine: {telemetry: {verbosity: 'off', filepath: 'logs/t.csv'}}, model: {}, workflows: {}},
    task: {title: 't', main: {commands: []}},
    runtime: {pwd: '.', project: {name: 'p'}, parameters: {}},
    data: {'R::bar': 2, 'T1::bar': 1},
  } as unknown as Ctx;

  const local = getSupportedProperty('T1', ctx, 'data.bar');
  const root = getSupportedProperty('R', ctx, 'data.bar');
  assert.strictEqual(local, 1);
  assert.strictEqual(root, 2);
});

