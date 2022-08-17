import { Ctx } from './batch-model.js';

export const createTaskAction = (ctx: Ctx) => (opts: any) => console.log(
  'createTaskAction',
  opts,
  Object.keys(ctx.build.binaries),
  ctx.task.title
);
