import path from 'node:path';
import { Listr } from 'listr2';
import type { ListrTask } from 'listr2';
import type {
  BatchStepModel,
  Ctx,
  OnShellCommandFinish,
  RuntimeContext,
} from './build-model.js';
import { CommandLineInput, executeCommandLine } from './execution.js';
import { expandBatchStep } from './expand-batch.js';
import {
  currentTaskLogger,
  replayLogToConsole,
  telemetryTaskLogger,
  telemetryTaskRefLogger,
} from './logging.js';
import { fail, Result, succeed } from './railway.js';
import { basicExecution } from './basic-execution.js';
import {
  getSupportedProperty,
  isTruthy,
  setDataValue,
} from './data-value-utils.js';

type BatchStepAction = Result<ListrTask, { messages: string[] }>;

type BatchAction = Result<ListrTask[], { messages: string[] }>;

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const startStepTitle = (batchStep: BatchStepModel): string => {
  const title = batchStep.title ? batchStep.title : batchStep.name;
  const underline = '-'.repeat(title.length + 1);
  return `${title}:\n${underline}`;
};
const mergeBatchStepAction = (stepActions: BatchStepAction[]): BatchAction => {
  const withErrors = stepActions.filter((i) => i.status === 'failure');
  if (withErrors.length > 0) {
    const messages = stepActions.flatMap((i) =>
      i.status === 'failure' ? i.error.messages : []
    );
    return fail({ messages });
  }
  const batchTasks = stepActions.flatMap((i) =>
    i.status === 'success' ? i.value : []
  );
  return succeed(batchTasks);
};

interface OnResultFlags {
  save: boolean;
  silent: boolean;
  debug: boolean;
}

const toOnResultFlags = (flags: OnShellCommandFinish[]): OnResultFlags => ({
  save: flags.includes('save'),
  silent: flags.includes('silent'),
  debug: flags.includes('debug'),
});

const debugContext = (ctx: Ctx) => {
  console.debug('--- Debug Context ---');
  console.debug('model:\n', ctx.build.model);
  console.debug('engine:\n', ctx.build.engine);
  console.debug('workflows:\n', ctx.build.workflows);
  console.debug('task:\n', ctx.task);
  console.debug('runtime:\n', ctx.runtime);
  console.debug('data:\n', ctx.data);
};

const toCommandLineAction = (
  ctx: Ctx,
  commandLineInput: CommandLineInput
): ListrTask => {
  const title = commandLineInput.opts.title
    ? commandLineInput.opts.title
    : commandLineInput.opts.name;

  const commandTask: ListrTask = {
    title,
    enabled: (_) => {
      const ifPath = commandLineInput.opts.if;
      if (ifPath === undefined) {
        return true;
      }
      const shouldEnable = isTruthy(getSupportedProperty(ctx, ifPath));
      return shouldEnable;
    },
    task: async (_, task): Promise<void> => {
      task.output = commandLineInput.line;
      const cmdLineResult = await executeCommandLine(ctx, commandLineInput);
      const successFlags = toOnResultFlags(commandLineInput.opts.onSuccess);
      const failureFlags = toOnResultFlags(commandLineInput.opts.onFailure);
      await sleep(500);
      if (cmdLineResult.status === 'success') {
        const {
          value: { data },
        } = cmdLineResult;
        if (successFlags.save) {
          setDataValue(ctx, commandLineInput.name, data);
        }
        if (!successFlags.silent) {
          currentTaskLogger.info(data);
        }
        if (successFlags.debug) {
          debugContext(ctx);
        }
        task.output = 'OK';
      } else if (cmdLineResult.status === 'failure') {
        if (!failureFlags.silent) {
          currentTaskLogger.info(
            [cmdLineResult.error.stdout, cmdLineResult.error.stderr].join(
              '\n\n'
            )
          );
        }
        if (failureFlags.debug) {
          debugContext(ctx);
        }
        task.output = 'KO';
      }
      await sleep(500);
    },
  };
  return commandTask;
};

const toBatchStepAction = (
  ctx: Ctx,
  batchStep: BatchStepModel
): BatchStepAction => {
  const title = batchStep.title ? batchStep.title : batchStep.name;

  const batchTask: ListrTask = {
    title,
    task: async (_, task) => {
      const basicExecutionResult = basicExecution(ctx, batchStep);
      if (basicExecutionResult.status === 'failure') {
        task.output = 'before: KO';
      }
      const commandsForStep = expandBatchStep(ctx, batchStep);
      if (commandsForStep.status === 'failure') {
        console.log({ messages: commandsForStep.error.messages });
        task.output = 'KO';
      }
      if (commandsForStep.status === 'success') {
        const commandTasks = commandsForStep.value.map((input) =>
          toCommandLineAction(ctx, input)
        );
        currentTaskLogger.info(startStepTitle(batchStep));
        return task.newListr([...commandTasks]);
      } else {
        return undefined;
      }
    },
  };
  return succeed(batchTask);
};

type BuildCtx = Pick<Ctx, 'build' | 'task'>;
export const createTaskAction =
  (buildCtx: BuildCtx) =>
  async (parameters: Record<string, string | boolean>) => {
    const pwd = process.cwd();
    const telemetryName = buildCtx.build.engine?.telemetry.name;
    const projectName =
      telemetryName === undefined ? path.basename(pwd) : telemetryName;
    const runtime: RuntimeContext = {
      pwd,
      project: {
        name: projectName,
      },
      parameters,
    };
    const ctx: Ctx = { ...buildCtx, runtime, data: { status: 'created' } };
    const started = process.hrtime();
    const listPossibleActions = mergeBatchStepAction(
      ctx.task.steps.map((step) => toBatchStepAction(ctx, step))
    );
    if (listPossibleActions.status === 'failure') {
      console.log('Failure ', listPossibleActions.error.messages);
    } else {
      const mainTask = new Listr<Ctx>(listPossibleActions.value);
      try {
        await mainTask.run(ctx);
        logTaskStatistics(started, ctx);
        await replayLogToConsole();
      } catch (e: any) {
        console.log('Failure ', e);
      }
    }
  };
function logTaskStatistics(started: [number, number], ctx: Ctx) {
  const date = new Date();
  const finished = process.hrtime(started);
  date.getMonth;
  telemetryTaskLogger.info(
    [
      ctx.runtime.project.name,
      ctx.task.name,
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getDay(),
      finished[0],
    ].join(',')
  );
  // Create a reference file for available tasks
  for (const workflowKey in ctx.build.workflows) {
    const tasks = Object.keys(ctx.build.workflows[workflowKey]?.tasks || {});
    for (const taskId of tasks) {
      telemetryTaskRefLogger.info(
        [
          ctx.runtime.project.name,
          `${workflowKey}.${taskId}`,
          date.getFullYear(),
          date.getMonth(),
        ].join(',')
      );
    }
  }
}
