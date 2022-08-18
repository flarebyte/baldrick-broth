import { Listr } from 'listr2';
import { Ctx } from './batch-model.js';
import { BatchStepModel } from './build-model.js';
import { expandBatchStep } from './expand-batch.js';

interface BatchTask {
  title: string;
  task: () => Promise<void>;
}

type BatchStepAction =
  | {
      status: 'success';
      batchTask: BatchTask;
    }
  | {
      status: 'failure';
      messages: string[];
    };

type BatchAction =
  | {
      status: 'success';
      batchTasks: BatchTask[];
    }
  | {
      status: 'failure';
      messages: string[];
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
const toBatchAction = (
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
  const batchTask: BatchTask = {
    title,
    task: async (): Promise<void> => {
      console.log(`>> ${ctx.task.title}`);
    },
  };
  return { status: 'success', batchTask };
};

export const createTaskAction = (ctx: Ctx) => async (_opts: any) => {
  const listPossibleActions = mergeBatchStepAction(
    ctx.task.steps.map((step) => toBatchAction(ctx, step))
  );
  if (listPossibleActions.status === 'failure') {
    console.log('Failure ', listPossibleActions.messages);
  } else {
    const mainTask = new Listr<Ctx>(listPossibleActions.batchTasks);
    try {
      const context = await mainTask.run(ctx);
      console.log(JSON.stringify(context.data));
    } catch (e: any) {
      console.log('Failure ', e);
    }
    s;
  }
};
