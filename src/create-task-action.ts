import { Listr } from 'listr2';
import type { ListrTask } from 'listr2';
import winston from 'winston';
import { Ctx } from './batch-model.js';
import { BatchStepModel } from './build-model.js';
import { CommandLineInput, executeCommandLine } from './execution.js';
import { expandBatchStep } from './expand-batch.js';

const currentTaskLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: 'temp/log/baldrick-broth.log' }),
  ],
});

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
      const lineActionLogger = currentTaskLogger.child({
        command: commandLineInput.name,
      });
      task.output = commandLineInput.line;
      const cmdLineResult = await executeCommandLine(commandLineInput);
      await sleep(2000);
      if (cmdLineResult.status === 'string') {
        lineActionLogger.info(cmdLineResult.value);
        task.output = 'OK';
      } else if (cmdLineResult.status === 'failed') {
        lineActionLogger.error(
          [cmdLineResult.stdout, cmdLineResult.stderr].join('\n\n')
        );
        task.output = 'KO';
      }
      await sleep(2000);
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
    task: async (_, task) => task.newListr(commandTasks),
  };
  return { status: 'success', batchTask };
};

export const createTaskAction = (ctx: Ctx) => async (_opts: any) => {
  const listPossibleActions = mergeBatchStepAction(
    ctx.task.steps.map((step) => toBatchStepAction(ctx, step))
  );
  if (listPossibleActions.status === 'failure') {
    console.log('Failure ', listPossibleActions.messages);
  } else {
    const mainTask = new Listr<Ctx>(listPossibleActions.batchTasks);
    try {
      const context = await mainTask.run(ctx);
      console.log('final-context', JSON.stringify(context.data));
    } catch (e: any) {
      console.log('Failure ', e);
    }
  }
};
