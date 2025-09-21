import json_mask from 'json-mask';
import type { AnyCommand, AnyDataValue, Ctx } from './build-model.js';
import { coloration } from './coloration.js';
import {
  getSupportedProperty,
  isFalsy,
  isTruthy,
  setDataValue,
} from './data-value-utils.js';
import type { LogMessage } from './log-model.js';
import { type Result, succeed, willFail } from './railway.js';
import { dasherizeTitle } from './string-utils.js';
import { getStringFromTemplate, mergeTemplateContext } from './templating.js';

type BasicExecution = Result<Ctx, LogMessage>;

const getPropertyList = (
  memoryId: string,
  ctx: Ctx,
  valuePaths: string[],
): Array<AnyDataValue | undefined> =>
  valuePaths.map((path) => getSupportedProperty(memoryId, ctx, path));

const asStringOrBlank = (value: unknown): string =>
  typeof value === 'string' ? value : '';

const asAnyArray = (value: unknown): AnyDataValue[] =>
  Array.isArray(value) ? value : [];

/**
 * Create a range starting with stop as other parameters are optional
 */
const range = (stop: number, start = 1, step = 1) => {
  const ranged = [];
  for (let index = start; index <= stop; index += step) {
    ranged.push(index);
  }

  return ranged;
};

export const basicCommandExecution = (
  memoryId: string,
  ctx: Ctx,
  anyCommand: AnyCommand,
  extra: Record<string, unknown>,
): BasicExecution => {
  const { a } = anyCommand;
  const success: BasicExecution = succeed(ctx);
  const name =
    anyCommand.name === undefined
      ? dasherizeTitle(anyCommand.title)
      : anyCommand.name;
  switch (a) {
    case 'get-property': {
      const value = getSupportedProperty(memoryId, ctx, anyCommand.value);
      setDataValue(memoryId, ctx, name, value);
      return success;
    }

    case 'some-truthy': {
      setDataValue(
        memoryId,
        ctx,
        name,
        getPropertyList(memoryId, ctx, anyCommand.values).some(isTruthy),
      );
      return success;
    }

    case 'some-falsy': {
      setDataValue(
        memoryId,
        ctx,
        name,
        getPropertyList(memoryId, ctx, anyCommand.values).some(isFalsy),
      );
      return success;
    }

    case 'every-truthy': {
      setDataValue(
        memoryId,
        ctx,
        name,
        getPropertyList(memoryId, ctx, anyCommand.values).every(isTruthy),
      );
      return success;
    }

    case 'every-falsy': {
      setDataValue(
        memoryId,
        ctx,
        name,
        getPropertyList(memoryId, ctx, anyCommand.values).every(isFalsy),
      );
      return success;
    }

    case 'not': {
      setDataValue(
        memoryId,
        ctx,
        name,
        isFalsy(getSupportedProperty(memoryId, ctx, anyCommand.value)),
      );
      return success;
    }

    case 'split-string': {
      setDataValue(
        memoryId,
        ctx,
        name,
        asStringOrBlank(
          getSupportedProperty(memoryId, ctx, anyCommand.value),
        ).split(anyCommand.separator),
      );
      return success;
    }

    case 'split-lines': {
      setDataValue(
        memoryId,
        ctx,
        name,
        asStringOrBlank(getSupportedProperty(memoryId, ctx, anyCommand.value))
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line.length > 0),
      );
      return success;
    }

    case 'range': {
      setDataValue(
        memoryId,
        ctx,
        name,
        range(anyCommand.end, anyCommand.start, anyCommand.step),
      );
      return success;
    }

    case 'concat-array': {
      setDataValue(
        memoryId,
        ctx,
        name,
        getPropertyList(memoryId, ctx, anyCommand.values).flatMap(asAnyArray),
      );
      return success;
    }

    case 'mask-object': {
      const objectValue =
        getSupportedProperty(memoryId, ctx, anyCommand.value) || {};
      if (typeof objectValue !== 'object') {
        return willFail({
          message: `mask-object for path ${
            anyCommand.value
          } expects an object but got ${typeof objectValue}`,
          coloredMessage: `mask-object for path ${coloration.path(
            anyCommand.value,
          )} expects an ${coloration.expected(
            'object',
          )} but got ${coloration.actual(typeof objectValue)}`,
        });
      }

      const masked = json_mask(objectValue, anyCommand.mask);
      setDataValue(memoryId, ctx, name, masked);
      return success;
    }

    case 'template': {
      const templateContext = mergeTemplateContext({
        memoryId,
        ctx,
        extra,
        command: anyCommand,
      });
      const stringValue = getStringFromTemplate(
        anyCommand.template,
        templateContext,
      );
      setDataValue(memoryId, ctx, name, stringValue);
      return success;
    }
  }

  return success;
};

/**
 * Mostly used for testing purpose
 */
export const basicCommandsExecution = (
  memoryId: string,
  ctx: Ctx,
  anyCommands: AnyCommand[],
): BasicExecution => {
  for (const anyCommand of anyCommands) {
    const result = basicCommandExecution(memoryId, ctx, anyCommand, {});
    if (result.status === 'failure') {
      return result;
    }
  }

  return succeed(ctx);
};
