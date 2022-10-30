import { getProperty } from 'dot-prop';
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

const getDataProperty = (
  valuePath: string,
  value?: Record<string, AnyDataValue>
): AnyDataValue | undefined => {
  if (value === undefined) {
    return undefined;
  }
  const [data_prefix, otherKeys] = valuePath.split('.');
  if (
    data_prefix === undefined ||
    data_prefix !== 'data' ||
    otherKeys === undefined
  ) {
    return undefined;
  }

  const [first, second, third] = otherKeys.split('::');
  if (first === undefined || second === undefined || third === undefined) {
    return undefined;
  }
  return value[`${first}::${second}::${third}`];
};

export const getSupportedProperty = (
  ctx: Ctx,
  valuePath: string
): AnyDataValue | undefined => {
  const isInsideData = valuePath.startsWith('data.');
  const value = isInsideData
    ? getDataProperty(valuePath, ctx.data)
    : getProperty(ctx, valuePath);
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'object'
  ) {
    return value;
  } else return undefined;
};
/**
 * Check if the the value would generally considered false or empty
 */
export const isFalsy = (value: unknown): boolean =>
  value === false ||
  value === undefined ||
  value === null ||
  value === 0 ||
  (typeof value === 'string' && value.trim().length === 0) ||
  (Array.isArray(value) && value.length === 0);

/**
 *  Check if the the value would generally considered like having a value or true
 */
export const isTruthy = (value: unknown): boolean => !isFalsy(value);
