/**
 * Responsibilities: Expands batch models into runnable command line inputs.
 * - Resolves loops (each), templated names, and command lines per iteration
 * - Validates expanded names and merges per-iteration extra context
 */
import type { AnyCommand, BatchStepModel, Ctx } from './build-model.js';
import { createDataId, getSupportedProperty } from './data-value-utils.js';
import type { CommandLineInput } from './execution.js';
import { stringy } from './field-validation.js';
import { IdGenerator, rootId } from './id-generator.js';
import { type Result, succeed, willFail } from './railway.js';
import { dasherizeTitle } from './string-utils.js';
import {
  getCommandLines,
  getExpandedName,
  mergeTemplateContext,
} from './templating.js';

type ExpandedCommandLineInputs = Result<
  CommandLineInput[],
  { messages: string[] }
>;

const getArray = (memoryId: string, ctx: Ctx, name: string): unknown[] => {
  const value = getSupportedProperty(memoryId, ctx, name);
  if (value === undefined) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  return [];
};

type CommandLocalVars = {
  commandOpts: AnyCommand;
  extra: Record<string, unknown>;
  memoryId: string;
};

const expandCommand =
  (ctx: Ctx, _batch: BatchStepModel) =>
  (current: CommandLocalVars): ExpandedCommandLineInputs => {
    const { commandOpts, extra, memoryId } = current;
    if (commandOpts.a === 'shell') {
      const { run, title, name, multiline } = commandOpts;

      const preferredName = name === undefined ? dasherizeTitle(title) : name;
      const templateCtx = mergeTemplateContext({
        memoryId,
        ctx,
        command: commandOpts,
        extra,
      });
      const lines = multiline ? getCommandLines(run, templateCtx) : [run];
      const expandedName = getExpandedName(preferredName, templateCtx);
      const validatedName = stringy.customKey.safeParse(expandedName);
      if (!validatedName.success) {
        return willFail({
          messages: [`Expanded name was not supported: ${expandedName}`],
        });
      }

      const lineInputs: CommandLineInput[] = lines.map((line) => ({
        memoryId,
        line,
        name: expandedName,
        opts: commandOpts,
        extra,
      }));
      return succeed(lineInputs);
    }

    const { name } = commandOpts;
    return succeed([{ line: '', name, opts: commandOpts, memoryId, extra }]);
  };

const mergeExpandedCommandLineInputs = (
  inputsArray: ExpandedCommandLineInputs[],
): ExpandedCommandLineInputs => {
  const inputsWithErrors = inputsArray.filter((i) => i.status === 'failure');
  if (inputsWithErrors.length > 0) {
    const messages = inputsWithErrors.flatMap((i) =>
      i.status === 'failure' ? i.error.messages : [],
    );
    return willFail({ messages });
  }

  const inputs = inputsArray.flatMap((i) =>
    i.status === 'success' ? i.value : [],
  );
  return succeed(inputs);
};

const expandBatch0 = (
  ctx: Ctx,
  batch: BatchStepModel,
  extra: Record<string, unknown>,
): ExpandedCommandLineInputs => {
  const expanded = batch.commands
    .map((commandOpts) => ({ commandOpts, extra, memoryId: rootId }))
    .map(expandCommand(ctx, batch));
  return mergeExpandedCommandLineInputs(expanded);
};

const expandBatch1 = (
  ctx: Ctx,
  batch: BatchStepModel,
): ExpandedCommandLineInputs => {
  const loop0 = batch.each === undefined ? undefined : batch.each[0];
  if (loop0 === undefined) {
    return willFail({ messages: ['Should have at least one loop'] });
  }

  const makeId = IdGenerator();

  const arr0 = getArray(rootId, ctx, loop0.values).map((value) => ({
    name: loop0.name,
    value,
  }));
  const commandLocalVars: CommandLocalVars[] = arr0.flatMap((extra) =>
    batch.commands.map((commandOpts) => ({
      commandOpts,
      extra: {
        [createDataId(rootId, extra.name)]: extra.value,
      },
      memoryId: makeId(),
    })),
  );
  const expanded = commandLocalVars.flatMap(expandCommand(ctx, batch));
  return mergeExpandedCommandLineInputs(expanded);
};

const expandBatch2 = (
  ctx: Ctx,
  batchStep: BatchStepModel,
): ExpandedCommandLineInputs => {
  if (batchStep.each === undefined) {
    return willFail({
      messages: ['batch.each should not be undefined'],
    });
  }

  const [loop0, loop1] = batchStep.each;
  if (loop0 === undefined || loop1 === undefined) {
    return willFail({
      messages: ['The two first items of each should be defined'],
    });
  }

  const makeId = IdGenerator();

  const arr0 = getArray(rootId, ctx, loop0.values).map((value) => ({
    name: loop0.name,
    value,
  }));
  const arr1 = getArray(rootId, ctx, loop1.values).map((value) => ({
    name: loop1.name,
    value,
  }));
  const commandLocalVars: CommandLocalVars[] = arr0.flatMap((extra0) =>
    arr1
      .map((extra1) => ({ ...extra0, ...extra1 }))
      .flatMap((extra) =>
        batchStep.commands.map((commandOpts) => ({
          commandOpts,
          extra: {
            [createDataId(rootId, extra.name)]: extra.value,
          },
          memoryId: makeId(),
        })),
      ),
  );
  const expanded = commandLocalVars.flatMap(expandCommand(ctx, batchStep));
  return mergeExpandedCommandLineInputs(expanded);
};

export const expandBatchStep = (
  ctx: Ctx,
  batchStep: BatchStepModel,
): ExpandedCommandLineInputs => {
  const numberOfLoops =
    batchStep.each === undefined ? 0 : batchStep.each.length;
  switch (numberOfLoops) {
    case 0: {
      return expandBatch0(ctx, batchStep, {});
    }

    case 1: {
      return expandBatch1(ctx, batchStep);
    }

    case 2: {
      return expandBatch2(ctx, batchStep);
    }

    default: {
      throw new Error('Too many for each loops');
    }
  }
};
