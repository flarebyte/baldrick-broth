import { getProperty } from 'dot-prop';
import { AnyDataValue, Ctx } from './build-model.js';
import { rootId } from './id-generator.js';
import { currentTaskLogger } from './logging.js';

export const setDataValue = (
  memoryId: string,
  ctx: Ctx,
  key: string,
  value: AnyDataValue | undefined
) => {
  if (ctx.data === undefined) {
    throw new Error('ctx.data should have defined by now');
  }
  if (value === undefined) {
    delete ctx.data[`${memoryId}::${key}`];
  } else {
    ctx.data[`${memoryId}::${key}`] = value;
  }
};

const getDataProperty = (
  memoryId: string,
  valuePath: string,
  value?: Record<string, AnyDataValue>
): AnyDataValue | undefined => {
  if (value === undefined) {
    return undefined;
  }
  const [data_prefix, keyName] = valuePath.split('.');
  if (
    data_prefix === undefined ||
    data_prefix !== 'data' ||
    keyName === undefined
  ) {
    currentTaskLogger.warn(
      `getDataProperty: Invalid path ${valuePath}: ${data_prefix} and ${keyName}`
    );
    return undefined;
  }

  return value[`${memoryId}::${keyName}`];
};

const getSpecificSupportedProperty = (
  memoryId: string,
  ctx: Ctx,
  valuePath: string
): AnyDataValue | undefined => {
  const isInsideData = valuePath.startsWith('data.');
  const value = isInsideData
    ? getDataProperty(memoryId, valuePath, ctx.data)
    : getProperty(ctx, valuePath);
  return typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'object'
    ? value
    : undefined;
};

/**
 * Return the current value or otherwise fallback to root value
 */
export const getSupportedProperty = (
  memoryId: string,
  ctx: Ctx,
  valuePath: string
): AnyDataValue | undefined => {
  const localValue = getSpecificSupportedProperty(memoryId, ctx, valuePath);
  const useLocalValue = localValue !== undefined || memoryId === rootId;
  if (useLocalValue) {
    return localValue;
  }
  return getSpecificSupportedProperty(rootId, ctx, valuePath);
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
