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
  currentTaskWarn,
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
import { coloration } from './coloration.js';

const SLEEP_KO = 800;
const SLEEP_MIN = 150;
type BatchStepAction = Result<ListrTask, { messages: string[] }>;

type BatchAction = Result<ListrTask[], { messages: string[] }>;

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const startStepTitle = (batchStep: BatchStepModel): string => {
  const underline = '-'.repeat(batchStep.title.length + 1);
  return `${batchStep.title}:\n${underline}`;
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
  exit: boolean;
}

const toOnResultFlags = (flags: OnShellCommandFinish[]): OnResultFlags => ({
  save: flags.includes('save'),
  silent: flags.includes('silent'),
  debug: flags.includes('debug'),
  exit: flags.includes('exit'),
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
      await sleep(SLEEP_MIN);
      if (cmdLineResult.status === 'success') {
        const {
          value: { data, name },
        } = cmdLineResult;
        task.title = name;
        if (successFlags.save) {
          setDataValue(ctx, commandLineInput.name, data);
        }
        if (!successFlags.silent) {
          const dataView =
            cmdLineResult.value.format === 'string'
              ? data
              : JSON.stringify(data, null, 2);
          currentTaskLogger.info(dataView);
        }
        if (successFlags.debug) {
          debugContext(ctx);
        }
        task.output = 'OK';
      } else if (cmdLineResult.status === 'failure') {
        if (!failureFlags.silent) {
          currentTaskLogger.info(
            [
              cmdLineResult.error.stdout,
              cmdLineResult.error.stderr,
              cmdLineResult.error.message,
            ].join('\n\n')
          );
        }
        if (failureFlags.debug) {
          debugContext(ctx);
        }
        task.output = 'KO';
        await sleep(SLEEP_KO);
        throw new Error(`KO: ${title}`);
      }
      await sleep(SLEEP_MIN);
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
        currentTaskWarn(basicExecutionResult.error);
        task.output = coloration.warn('before: KO');
      }
      const commandsForStep = expandBatchStep(ctx, batchStep);
      if (commandsForStep.status === 'failure') {
        currentTaskLogger.warn({ messages: commandsForStep.error.messages });
        task.output = coloration.warn('KO');
      }
      if (commandsForStep.status === 'success') {
        const commandTasks = commandsForStep.value.map((input) =>
          toCommandLineAction(ctx, input)
        );
        currentTaskLogger.info(startStepTitle(batchStep));
        return task.newListr([...commandTasks], { exitOnError: false });
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
      const mainTask = new Listr<Ctx>(listPossibleActions.value, {
        exitOnError: false,
      });
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
