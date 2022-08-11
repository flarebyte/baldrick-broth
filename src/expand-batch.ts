import Handlebars from 'handlebars';
import { JsonValue } from 'type-fest';
import {
  BatchStepModel,
  BuildModel,
  CommandOptionsModel,
  TaskModel,
} from './build-model.js';
import { CommandLineInput } from './execution.js';

type AnyRootsetValue = string | boolean | Record<string, string>[] | JsonValue;

type BatchValues = Record<string, AnyRootsetValue>;
interface Ctx {
  build: BuildModel;
  task: TaskModel;
  data: Record<string, BatchValues>;
}

const getArray = (_ctx: Ctx, _name: string): any[] => [];

const createTemplate = (run: string) =>
  Handlebars.compile(run, { noEscape: true });

const expandCommand =
  (ctx: Ctx, batch: BatchStepModel) =>
  (current: {
    commandOpts: CommandOptionsModel;
    extra: Record<string, any>;
  }): CommandLineInput[] => {
    const { commandOpts, extra } = current;
    const { run, name } = commandOpts;
    const template = createTemplate(run);
    const nameTemplate = createTemplate(name);
    const templateCtx = { ...ctx, ...extra, batch, command: commandOpts };
    const lines = template(templateCtx)
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    const expandedName = nameTemplate(templateCtx).trim(); //TODO: check for multiple lines and throw if multiple ?
    const lineInputs: CommandLineInput[] = lines.map((line) => ({
      line,
      name: expandedName,
      opts: commandOpts,
    }));
    return lineInputs;
  };

const expandBatchN = (
  ctx: Ctx,
  batch: BatchStepModel,
  extra: Record<string, any>
): CommandLineInput[] =>
  batch.commands
    .map((commandOpts) => ({ commandOpts, extra }))
    .flatMap(expandCommand(ctx, batch));

const expandBatch1 = (ctx: Ctx, batch: BatchStepModel): CommandLineInput[] => {
  const loop0 = batch.each === undefined ? undefined : batch.each[0];
  if (loop0 === undefined) {
    throw new Error('Should have at least one loop');
  }

  const arr0 = getArray(ctx, loop0.values);
  for (const id0 of arr0) {
  }
  batch.commands.flatMap(expandCommand(ctx, batch));
};

const expandBatch = (ctx: Ctx, batch: BatchStepModel): CommandLineInput[] => {
  const numberOfLoops = batch.each === undefined ? 0 : batch.each.length;
  switch (numberOfLoops) {
    case 0:
      return expandBatchN(ctx, batch, {});

    default:
      throw new Error('Too many for each loops');
  }
};
