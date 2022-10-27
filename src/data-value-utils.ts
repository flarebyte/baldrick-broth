import { AnyDataValue, Ctx } from './build-model.js';

export const setDataValue = (
  ctx: Ctx,
  key: string,
  value: AnyDataValue | undefined
) => {
  if (ctx.data === undefined) {
    throw new Error('ctx.data should have defined by now');
  }
  if (value === undefined) {
    delete ctx.data[`${ctx.task.name}::${key}`];
  } else {
    ctx.data[`${ctx.task.name}::${key}`] = value;
  }
};
