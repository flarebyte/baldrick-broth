import type { Ctx, AnyDataValue, BatchValues } from './batch-model.js';

export const setDataValue = (
  ctx: Ctx,
  key: string,
  value: AnyDataValue | undefined
) => {
  const existing: BatchValues = ctx.data.get(ctx.task.name) || new Map();
  if (value === undefined) {
    ctx.data.delete(key);
  } else {
    ctx.data.set(ctx.task.name, existing.set(key, value));
  }
};
