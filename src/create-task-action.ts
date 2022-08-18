import { Listr } from 'listr2';
import { Ctx } from './batch-model.js';
import { BatchStepModel } from './build-model.js';

const toBatchAction = (batchStep: BatchStepModel) => ({
  title: batchStep.title || 'Batch Step',
  task: async (ctx: Ctx): Promise<void> => {
    console.log(`>> ${ctx.task.title}`);
  },
});

const toListActions = (ctx: Ctx): Listr<Ctx> => {
  const listActions = ctx.task.steps.map(toBatchAction);
  const tasks = new Listr<Ctx>(listActions);
  return tasks;
};

export const createTaskAction = (ctx: Ctx) => async (_opts: any) => {
  const mainTask = toListActions(ctx);

  try {
    const context = await mainTask.run(ctx);
    console.log(JSON.stringify(context.data));
  } catch (e: any) {
    console.log('Failure ', e);
  }
};
