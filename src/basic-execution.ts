import json_mask from 'json-mask';
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
import { dasherizeTitle } from './string-utils.js';

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
  const name = basicStep.name === undefined ?dasherizeTitle(basicStep.title): basicStep.name;
  switch (a) {
    case 'get-property':
      const value = getSupportedProperty(ctx, basicStep.value);
      setDataValue(ctx, name, value);
      return success;
    case 'some-truthy':
      setDataValue(
        ctx,
        name,
        getPropertyList(ctx, basicStep.values).some(isTruthy)
      );
      return success;
    case 'some-falsy':
      setDataValue(
        ctx,
        name,
        getPropertyList(ctx, basicStep.values).some(isFalsy)
      );
      return success;
    case 'every-truthy':
      setDataValue(
        ctx,
        name,
        getPropertyList(ctx, basicStep.values).every(isTruthy)
      );
      return success;
    case 'every-falsy':
      setDataValue(
        ctx,
        name,
        getPropertyList(ctx, basicStep.values).every(isFalsy)
      );
      return success;
    case 'not':
      setDataValue(
        ctx,
        name,
        isFalsy(getSupportedProperty(ctx, basicStep.value))
      );
      return success;
    case 'split-string':
      setDataValue(
        ctx,
        name,
        asStringOrBlank(getSupportedProperty(ctx, basicStep.value)).split(
          basicStep.separator
        )
      );
      return success;
    case 'range':
      setDataValue(
        ctx,
        name,
        range(basicStep.end, basicStep.start, basicStep.step)
      );
      return success;
    case 'concat-array':
      setDataValue(
        ctx,
        name,
        getPropertyList(ctx, basicStep.values).flatMap(asAnyArray)
      );
      return success;
    case 'mask-object':
      const objectValue = getSupportedProperty(ctx, basicStep.value) || {};
      const masked = json_mask(objectValue, basicStep.mask);
      setDataValue(ctx, name, masked);
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

/**
 * Create a range starting with stop as other parameters are optional
 */
const range = (stop: number, start: number = 1, step: number = 1) => {
  let ranged = [];
  for (let index = start; index <= stop; index = index + step) {
    ranged.push(index);
  }
  return ranged;
};
