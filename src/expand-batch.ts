import Handlebars from 'handlebars';
import { BatchStepModel, CommandOptionsModel, Ctx } from './build-model.js';
import { CommandLineInput } from './execution.js';
import { stringy } from './field-validation.js';
import { Result, succeed } from './railway.js';

type ExpandedCommandLineInputs = Result<
  CommandLineInput[],
  { messages: string[] }
>;

const getArray = (_ctx: Ctx, _name: string): any[] => [];

const createTemplate = (run: string) =>
  Handlebars.compile(run, { noEscape: true });

type CommandLocalVars = {
  commandOpts: CommandOptionsModel;
  extra: Record<string, any>;
};

const forceJson = (wholeCtx: any): any => JSON.parse(JSON.stringify(wholeCtx));

const expandCommand =
  (ctx: Ctx, batch: BatchStepModel) =>
  (current: CommandLocalVars): ExpandedCommandLineInputs => {
    const { commandOpts, extra } = current;
    const { run, name } = commandOpts;
    const template = createTemplate(run);
    const nameTemplate = createTemplate(name);
    const templateCtx = forceJson({
      ...ctx,
      ...extra,
      batch,
      command: commandOpts,
    });
    const lines = template(templateCtx)
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    const expandedName = nameTemplate(templateCtx).trim();
    const validatedName = stringy.customKey.safeParse(expandedName);
    if (!validatedName.success) {
      return fail({
        messages: [`Expanded name was not supported: ${expandedName}`],
      });
    }
    const lineInputs: CommandLineInput[] = lines.map((line) => ({
      line,
      name: expandedName,
      opts: commandOpts,
    }));
    return succeed(lineInputs);
  };

const mergeExpandedCommandLineInputs = (
  inputsArray: ExpandedCommandLineInputs[]
): ExpandedCommandLineInputs => {
  const inputsWithErrors = inputsArray.filter((i) => i.status === 'failure');
  if (inputsWithErrors.length > 0) {
    const messages = inputsWithErrors.flatMap((i) =>
      i.status === 'failure' ? i.error.messages : []
    );
    return fail({ messages });
  }
  const inputs = inputsArray.flatMap((i) =>
    i.status === 'success' ? i.value : []
  );
  return succeed(inputs);
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
    return fail({ messages: ['Should have at least one loop'] });
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
  batchStep: BatchStepModel
): ExpandedCommandLineInputs => {
  if (batchStep.each === undefined) {
    return fail({
      messages: ['batch.each should not be undefined'],
    });
  }
  const [loop0, loop1] = batchStep.each;
  if (loop0 === undefined || loop1 === undefined) {
    return fail({
      messages: ['The two first items of each should be defined'],
    });
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
        batchStep.commands.map((commandOpts) => ({ commandOpts, extra }))
      )
  );
  const expanded = commandLocalVars.flatMap(expandCommand(ctx, batchStep));
  return mergeExpandedCommandLineInputs(expanded);
};

export const expandBatchStep = (
  ctx: Ctx,
  batchStep: BatchStepModel
): ExpandedCommandLineInputs => {
  const numberOfLoops =
    batchStep.each === undefined ? 0 : batchStep.each.length;
  switch (numberOfLoops) {
    case 0:
      return expandBatchN(ctx, batchStep, {});
    case 1:
      return expandBatch1(ctx, batchStep);
    case 2:
      return expandBatch2(ctx, batchStep);

    default:
      throw new Error('Too many for each loops');
  }
};
