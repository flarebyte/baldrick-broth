import Handlebars from 'handlebars';
import { AnyCommand, BatchStepModel, Ctx } from './build-model.js';
import { splitDataKey, withMemoryPrefix } from './data-value-utils.js';
import { rootId } from './id-generator.js';

const createTemplate = (run: string) =>
  Handlebars.compile(run, { noEscape: true });

export const getExpandedName = (name: string, context: any): string => {
  const template = createTemplate(name);
  const expandedName = template(context).trim();
  return expandedName;
};

export const getCommandLines = (run: string, context: any): string[] => {
  const template = createTemplate(run);
  const lines = template(context)
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return lines;
};

export const getSingleCommandLine = (run: string, context: any): string => {
  const template = createTemplate(run);
  const lines = template(context)
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return lines.join(' ').trim();
};

const forceJson = (wholeCtx: any): any => JSON.parse(JSON.stringify(wholeCtx));

const getTemplateData = (
  memoryId: string,
  extra: Record<string, any>
): Record<string, any> => {
  const keys = Object.keys(extra);
  const branchKeys = keys.filter(withMemoryPrefix(memoryId));
  const results: Record<string, any> = {};
  for (const dataKey of branchKeys) {
    const [_, key] = splitDataKey(dataKey);
    results[key] = extra[dataKey];
  }
  if (memoryId === rootId) {
    return results;
  }
  const rootKeys = keys.filter(withMemoryPrefix(rootId));
  for (const dataKey of rootKeys) {
    const [_, key] = splitDataKey(dataKey);
    const existAlready = results[key] !== undefined;
    if (!existAlready) {
      results[key] = extra[dataKey];
    }
  }
  return results;
};

export const mergeTemplateContext = ({
  memoryId,
  ctx,
  extra,
  command,
}: {
  memoryId: string;
  ctx: Ctx;
  extra: Record<string, any>;
  command: AnyCommand;
}) => {
  return forceJson({
    ...ctx,
    ...extra,
    command,
  });
};
