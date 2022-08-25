import path from 'node:path';
import { Listr } from 'listr2';
import type { ListrTask } from 'listr2';
import type { BuildCtx, Ctx, RuntimeContext } from './batch-model.js';
import type { BatchStepModel } from './build-model.js';
import { CommandLineInput, executeCommandLine } from './execution.js';
import { expandBatchStep } from './expand-batch.js';
import {
  currentTaskLogger,
  replayLogToConsole,
  telemetryTaskLogger,
  telemetryTaskRefLogger,
} from './logging.js';

type BatchStepAction =
  | {
      status: 'success';
      batchTask: ListrTask;
    }
  | {
      status: 'failure';
      messages: string[];
    };

type BatchAction =
  | {
      status: 'success';
      batchTasks: ListrTask[];
    }
  | {
      status: 'failure';
      messages: string[];
    };

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
      i.status === 'failure' ? i.messages : []
    );
    return { status: 'failure', messages };
  }
  const batchTasks = stepActions.flatMap((i) =>
    i.status === 'success' ? i.batchTask : []
  );
  return { status: 'success', batchTasks };
};

const toCommandLineAction = (
  _ctx: Ctx,
  commandLineInput: CommandLineInput
): ListrTask => {
  const commandTask: ListrTask = {
    title: commandLineInput.name,
    task: async (_, task): Promise<void> => {
      task.output = commandLineInput.line;
      const cmdLineResult = await executeCommandLine(commandLineInput);
      await sleep(500);
      if (cmdLineResult.status === 'string') {
        currentTaskLogger.info(cmdLineResult.value);
        task.output = 'OK';
      } else if (cmdLineResult.status === 'failed') {
        currentTaskLogger.info(
          [cmdLineResult.stdout, cmdLineResult.stderr].join('\n\n')
        );
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
  const title = batchStep.title
    ? `${batchStep.title}: ${batchStep.name}`
    : batchStep.name;
  const commandsForStep = expandBatchStep(ctx, batchStep);
  if (commandsForStep.status === 'failure') {
    return { status: 'failure', messages: commandsForStep.messages };
  }
  const commandTasks = commandsForStep.inputs.map((input) =>
    toCommandLineAction(ctx, input)
  );
  const batchTask: ListrTask = {
    title,
    task: async (_, task) => {
      currentTaskLogger.info(startStepTitle(batchStep));
      return task.newListr(commandTasks);
    },
  };
  return { status: 'success', batchTask };
};

export const createTaskAction = (buildCtx: BuildCtx) => async (_opts: any) => {
  const pwd = process.cwd();
  const telemetryName = buildCtx.build.engine?.telemetry.name;
  const projectName =
    telemetryName === undefined ? path.basename(pwd) : telemetryName;
  const runtime: RuntimeContext = {
    pwd,
    project: {
      name: projectName,
    },
  };
  const ctx: Ctx = { ...buildCtx, runtime, data: new Map() };
  const started = process.hrtime();
  const listPossibleActions = mergeBatchStepAction(
    ctx.task.steps.map((step) => toBatchStepAction(ctx, step))
  );
  if (listPossibleActions.status === 'failure') {
    console.log('Failure ', listPossibleActions.messages);
  } else {
    const mainTask = new Listr<Ctx>(listPossibleActions.batchTasks);
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
      ctx.runtime.project,
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
          ctx.runtime.project,
          `${workflowKey}.${taskId}`,
          date.getFullYear(),
          date.getMonth(),
        ].join(',')
      );
    }
  }
}
