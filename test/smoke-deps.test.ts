import {test} from 'node:test';
import assert from 'node:assert';

import {Chalk} from 'chalk';
import {Command} from 'commander';
import {getProperty} from 'dot-prop';
import {execaCommand} from 'execa';
import Handlebars from 'handlebars';
import json_mask from 'json-mask';
import {Listr} from 'listr2';
import Papa from 'papaparse';
import winston from 'winston';
import YAML from 'yaml';
import {z} from 'zod';

test('chalk: basic colorization', () => {
  const chalk = new Chalk();
  const out = chalk.bold.green('ok');
  assert.strictEqual(typeof out, 'string');
  assert.ok(out.length > 0);
});

test('commander: help information', () => {
  const program = new Command();
  program
    .name('demo')
    .option('-f, --flag', 'A flag')
    .action(() => {});
  const help = program.helpInformation();
  assert.ok(help.includes('Usage: demo'));
});

test('dot-prop: getProperty resolves nested path', () => {
  const obj = {a: {b: {c: 1}}};
  const v = getProperty(obj, 'a.b.c');
  assert.strictEqual(v, 1);
});

test('execa: run node inline script', async () => {
  const cmd = `printf ok`;
  const {stdout, exitCode, failed} = await execaCommand(cmd, {reject: false});
  assert.strictEqual(exitCode, 0);
  assert.strictEqual(failed, false);
  assert.strictEqual(stdout.trim(), 'ok');
});

test('handlebars: template compile', () => {
  const tpl = Handlebars.compile('Hello {{name}}');
  const out = tpl({name: 'World'}).trim();
  assert.strictEqual(out, 'Hello World');
});

test('json-mask: pick single key', () => {
  const out = json_mask({a: 1, b: 2}, 'a') as Record<string, unknown>;
  assert.deepStrictEqual(out, {a: 1});
});

test('listr2: run a simple task list', async () => {
  const tasks = new Listr([
    {
      title: 'noop',
      task: async () => {
        // do nothing
      },
    },
  ], {renderer: 'silent'});
  await tasks.run();
  assert.ok(true);
});

test('papaparse: parse a CSV row', () => {
  const csv = 'col1,col2\nA,B\n';
  const {data} = Papa.parse<Record<string, string>>(csv, {header: true, skipEmptyLines: true});
  assert.strictEqual(data.length, 1);
  assert.deepStrictEqual(data[0], {col1: 'A', col2: 'B'});
});

test('winston: create a console logger', () => {
  const logger = winston.createLogger({
    transports: [new winston.transports.Console()],
  });
  logger.info('ok');
  assert.ok(logger);
});

test('yaml: parse simple content', () => {
  const obj = YAML.parse('a: 1\n');
  assert.deepStrictEqual(obj, {a: 1});
});

test('zod: basic schema success', () => {
  const schema = z.object({a: z.number()});
  const res = schema.safeParse({a: 1});
  assert.strictEqual(res.success, true);
});
