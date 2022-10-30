import type {
  AnyBasicStepModel,
  AnyDataValue,
  BatchStepModel,
  Ctx,
} from './build-model.js';
import {
  setDataValue,
  getSupportedProperty,
  isTruthy,
  isFalsy,
} from './data-value-utils.js';
import { Result, succeed } from './railway.js';

type BasicExecution = Result<Ctx, { message: string }>;

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
  const success: BasicExecution = succeed(ctx);
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

/**
 * Transform the data with a list of supported operations
 */
export const basicExecution = (
  ctx: Ctx,
  batchStep: BatchStepModel
): BasicExecution => {
  if (batchStep.before === undefined) {
    return succeed(ctx);
  }
  for (const basicStep of batchStep.before) {
    const result = basicStepExecution(ctx, basicStep);
    if (result.status === 'failure') {
      return result;
    }
  }
  return succeed(ctx);
};
