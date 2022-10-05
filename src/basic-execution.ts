import type { AnyBasicStepModel, AnyDataValue, BatchStepModel, Ctx } from './build-model.js';
import { setDataValue } from './data-value-utils.js';
import { getProperty } from 'dot-prop';

type BasicExecution =
  | {
      status: 'success';
      ctx: Ctx;
    }
  | {
      status: 'failure';
      message: string;
    };

const getDataProperty = (
  valuePath: string,
  value?: Record<string, AnyDataValue>
): AnyDataValue | undefined => {
  if (value === undefined) {
    return undefined;
  }
  const [data_prefix, first, second] = valuePath.split('.');
  if (
    data_prefix === undefined ||
    data_prefix !== 'data' ||
    first === undefined ||
    second === undefined
  ) {
    return undefined;
  }
  return value[`${first}.${second}`];
};
const getSupportedProperty = (
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

const isFalsy = (value: unknown): boolean =>
  value === false ||
  value === undefined ||
  value === null ||
  value === 0 ||
  (typeof value === 'string' && value.trim().length === 0) ||
  (Array.isArray(value) && value.length === 0);

const isTruthy = (value: unknown): boolean => !isFalsy(value);

const getPropertyList = (
  ctx: Ctx,
  valuePaths: string[]
): (AnyDataValue | undefined)[] =>
  valuePaths.map((path) => getSupportedProperty(ctx, path));

const asStringOrBlank = (value: unknown): string =>
  typeof value === 'string' ? value : '';

const asAnyArray = (value: unknown): AnyDataValue[] =>
  Array.isArray(value) ? value : [];

const basicStepExecution = (
  ctx: Ctx,
  basicStep: AnyBasicStepModel
): BasicExecution => {
  const { a } = basicStep;
  const success: BasicExecution = { status: 'success', ctx };
  switch (a) {
    case 'get-property':
      const value = getSupportedProperty(ctx, basicStep.value);
      setDataValue(ctx, basicStep.name, value);
      return success;
    case 'some-truthy':
      setDataValue(
        ctx,
        basicStep.name,
        getPropertyList(ctx, basicStep.values).some(isTruthy)
      );
      return success;
    case 'some-falsy':
      setDataValue(
        ctx,
        basicStep.name,
        getPropertyList(ctx, basicStep.values).some(isFalsy)
      );
      return success;
    case 'every-truthy':
      setDataValue(
        ctx,
        basicStep.name,
        getPropertyList(ctx, basicStep.values).every(isTruthy)
      );
      return success;
    case 'every-falsy':
      setDataValue(
        ctx,
        basicStep.name,
        getPropertyList(ctx, basicStep.values).every(isFalsy)
      );
      return success;
    case 'not':
      setDataValue(
        ctx,
        basicStep.name,
        isFalsy(getSupportedProperty(ctx, basicStep.value))
      );
      return success;
    case 'split-string':
      setDataValue(
        ctx,
        basicStep.name,
        asStringOrBlank(getSupportedProperty(ctx, basicStep.value)).split(
          basicStep.separator
        )
      );
      return success;
    case 'concat-array':
      setDataValue(
        ctx,
        basicStep.name,
        getPropertyList(ctx, basicStep.values).flatMap(asAnyArray)
      );
      return success;
  }

  return success;
};

export const basicExecution = (
  ctx: Ctx,
  batchStep: BatchStepModel
): BasicExecution => {
  if (batchStep.before === undefined) {
    return { status: 'success', ctx };
  }
  for (const basicStep of batchStep.before) {
    const result = basicStepExecution(ctx, basicStep);
    if (result.status === 'failure') {
      return result;
    }
  }
  return { status: 'success', ctx };
};
