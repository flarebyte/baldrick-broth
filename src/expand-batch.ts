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

type ExpandedCommandLineInputs =
  | {
      status: 'success';
      inputs: CommandLineInput[];
    }
  | {
      status: 'error';
      messages: string[];
    };

const getArray = (_ctx: Ctx, _name: string): any[] => [];

const createTemplate = (run: string) =>
  Handlebars.compile(run, { noEscape: true });

type CommandLocalVars = {
  commandOpts: CommandOptionsModel;
  extra: Record<string, any>;
};
const expandCommand =
  (ctx: Ctx, batch: BatchStepModel) =>
  (current: CommandLocalVars): ExpandedCommandLineInputs => {
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
    return { status: 'success', inputs: lineInputs };
  };

const mergeExpandedCommandLineInputs = (
  inputsArray: ExpandedCommandLineInputs[]
): ExpandedCommandLineInputs => {
  const inputsWithErrors = inputsArray.filter((i) => i.status === 'error');
  if (inputsWithErrors.length > 0) {
    const messages = inputsWithErrors.flatMap((i) =>
      i.status === 'error' ? i.messages : []
    );
    return { status: 'error', messages };
  }
  const inputs = inputsArray.flatMap((i) =>
    i.status === 'success' ? i.inputs : []
  );
  return { status: 'success', inputs };
};
const expandBatchN = (
  ctx: Ctx,
  batch: BatchStepModel,
  extra: Record<string, any>
): ExpandedCommandLineInputs => {
  const expanded = batch.commands
    .map((commandOpts) => ({ commandOpts, extra }))
    .map(expandCommand(ctx, batch));
  return mergeExpandedCommandLineInputs(expanded);
};
const expandBatch1 = (
  ctx: Ctx,
  batch: BatchStepModel
): ExpandedCommandLineInputs => {
  const loop0 = batch.each === undefined ? undefined : batch.each[0];
  if (loop0 === undefined) {
    return { status: 'error', messages: ['Should have at least one loop'] };
  }

  const arr0 = getArray(ctx, loop0.values).map((value) => ({
    [loop0.name]: value,
  }));
  const commandLocalVars: CommandLocalVars[] = arr0.flatMap((extra) =>
    batch.commands.map((commandOpts) => ({ commandOpts, extra }))
  );
  const expanded = commandLocalVars.flatMap(expandCommand(ctx, batch));
  return mergeExpandedCommandLineInputs(expanded);
};

const expandBatch2 = (
  ctx: Ctx,
  batch: BatchStepModel
): ExpandedCommandLineInputs => {
  if (batch.each === undefined) {
    return {
      status: 'error',
      messages: ['batch.each should not be undefined'],
    };
  }
  const [loop0, loop1] = batch.each;
  if (loop0 === undefined || loop1 === undefined) {
    return {
      status: 'error',
      messages: ['The two first items of each should be defined'],
    };
  }

  const arr0 = getArray(ctx, loop0.values).map((value) => ({
    [loop0.name]: value,
  }));
  const arr1 = getArray(ctx, loop1.values).map((value) => ({
    [loop1.name]: value,
  }));
  const commandLocalVars: CommandLocalVars[] = arr0.flatMap((extra0) =>
    arr1
      .map((extra1) => ({ ...extra0, ...extra1 }))
      .flatMap((extra) =>
        batch.commands.map((commandOpts) => ({ commandOpts, extra }))
      )
  );
  const expanded = commandLocalVars.flatMap(expandCommand(ctx, batch));
  return mergeExpandedCommandLineInputs(expanded);
};

export const expandBatch = (
  ctx: Ctx,
  batch: BatchStepModel
): ExpandedCommandLineInputs => {
  const numberOfLoops = batch.each === undefined ? 0 : batch.each.length;
  switch (numberOfLoops) {
    case 0:
      return expandBatchN(ctx, batch, {});
    case 1:
      return expandBatch1(ctx, batch);
    case 2:
      return expandBatch2(ctx, batch);

    default:
      throw new Error('Too many for each loops');
  }
};
