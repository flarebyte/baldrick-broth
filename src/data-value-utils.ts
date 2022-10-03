import type { Ctx, AnyDataValue } from './batch-model.js';

export const setDataValue = (
  ctx: Ctx,
  key: string,
  value: AnyDataValue | undefined
) => {
  if (ctx.data === undefined) {
    throw new Error('ctx.data should have defined by now');
  }
  if (value === undefined) {
    ctx.data.delete(`${ctx.task.name}.${key}`);
  } else {
    ctx.data.set(`${ctx.task.name}.${key}`, value);
  }
};
