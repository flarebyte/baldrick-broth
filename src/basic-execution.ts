import json_mask from 'json-mask';
import type { AnyCommand, AnyDataValue, Ctx } from './build-model.js';
import { coloration } from './coloration.js';
import {
  setDataValue,
  getSupportedProperty,
  isTruthy,
  isFalsy,
} from './data-value-utils.js';
import { LogMessage } from './log-model.js';
import { Result, succeed, fail } from './railway.js';
import { dasherizeTitle } from './string-utils.js';

type BasicExecution = Result<Ctx, LogMessage>;

const getPropertyList = (
  ctx: Ctx,
  valuePaths: string[]
): (AnyDataValue | undefined)[] =>
  valuePaths.map((path) => getSupportedProperty(ctx, path));

const asStringOrBlank = (value: unknown): string =>
  typeof value === 'string' ? value : '';

const asAnyArray = (value: unknown): AnyDataValue[] =>
  Array.isArray(value) ? value : [];

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

export const basicCommandExecution = (
  ctx: Ctx,
  anyCommand: AnyCommand
): BasicExecution => {
  const { a } = anyCommand;
  const success: BasicExecution = succeed(ctx);
  const name =
    anyCommand.name === undefined
      ? dasherizeTitle(anyCommand.title)
      : anyCommand.name;
  switch (a) {
    case 'get-property':
      const value = getSupportedProperty(ctx, anyCommand.value);
      setDataValue(ctx, name, value);
      return success;
    case 'some-truthy':
      setDataValue(
        ctx,
        name,
        getPropertyList(ctx, anyCommand.values).some(isTruthy)
      );
      return success;
    case 'some-falsy':
      setDataValue(
        ctx,
        name,
        getPropertyList(ctx, anyCommand.values).some(isFalsy)
      );
      return success;
    case 'every-truthy':
      setDataValue(
        ctx,
        name,
        getPropertyList(ctx, anyCommand.values).every(isTruthy)
      );
      return success;
    case 'every-falsy':
      setDataValue(
        ctx,
        name,
        getPropertyList(ctx, anyCommand.values).every(isFalsy)
      );
      return success;
    case 'not':
      setDataValue(
        ctx,
        name,
        isFalsy(getSupportedProperty(ctx, anyCommand.value))
      );
      return success;
    case 'split-string':
      setDataValue(
        ctx,
        name,
        asStringOrBlank(getSupportedProperty(ctx, anyCommand.value)).split(
          anyCommand.separator
        )
      );
      return success;
    case 'range':
      setDataValue(
        ctx,
        name,
        range(anyCommand.end, anyCommand.start, anyCommand.step)
      );
      return success;
    case 'concat-array':
      setDataValue(
        ctx,
        name,
        getPropertyList(ctx, anyCommand.values).flatMap(asAnyArray)
      );
      return success;
    case 'mask-object':
      const objectValue = getSupportedProperty(ctx, anyCommand.value) || {};
      if (typeof objectValue !== 'object') {
        return fail({
          message: `mask-object for path ${
            anyCommand.value
          } expects an object but got ${typeof objectValue}`,
          coloredMessage: `mask-object for path ${coloration.path(
            anyCommand.value
          )} expects an ${coloration.expected(
            'object'
          )} but got ${coloration.actual(typeof objectValue)}`,
        });
      }
      const masked = json_mask(objectValue, anyCommand.mask);
      setDataValue(ctx, name, masked);
      return success;
  }

  return success;
};

/**
 * Mostly used for testing purpose
 */
export const basicCommandsExecution = (
  ctx: Ctx,
  anyCommands: AnyCommand[]
): BasicExecution => {
  for (const anyCommand of anyCommands) {
    const result = basicCommandExecution(ctx, anyCommand);
    if (result.status === 'failure') {
      return result;
    }
  }
  return succeed(ctx);
};
