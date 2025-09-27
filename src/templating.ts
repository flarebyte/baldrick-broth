/**
 * Responsibilities: Handlebars templating and context building.
 * - Expands names/lines, merges per-task data with memory-aware scoping
 * - Provides helper to escape spaces for shell compatibility
 */
import Handlebars from 'handlebars';
import type { AnyCommand, Ctx } from './build-model.js';
import { splitDataKey, withMemoryPrefix } from './data-value-utils.js';
import { rootId } from './id-generator.js';

const escapeSpace = (text: string): string => text.replace(/ /g, '\\ ');

Handlebars.registerHelper('escapeSpace', escapeSpace);

const createTemplate = (run: string) =>
  Handlebars.compile(run, { noEscape: true });

export const getExpandedName = (name: string, context: unknown): string => {
  const template = createTemplate(name);
  const expandedName = template(context).trim();
  return expandedName;
};

export const getStringFromTemplate = (
  hbsTemplate: string,
  context: unknown,
): string => {
  const template = createTemplate(hbsTemplate);
  const expandedName = template(context).trim();
  return expandedName;
};

export const getCommandLines = (run: string, context: unknown): string[] => {
  const template = createTemplate(run);
  const lines = template(context)
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return lines;
};

export const getSingleCommandLine = (run: string, context: unknown): string => {
  const template = createTemplate(run);
  const lines = template(context)
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return lines.join(' ').trim();
};

const forceJson = (wholeCtx: unknown): unknown =>
  JSON.parse(JSON.stringify(wholeCtx));

const getTemplateData = (
  memoryId: string,
  extra: Record<string, unknown>,
): Record<string, unknown> => {
  const keys = Object.keys(extra);
  const branchKeys = keys.filter(withMemoryPrefix(memoryId));
  const results: Record<string, unknown> = {};
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

const mergeExtraData = (
  ctxData: Record<string, unknown>,
  extra: Record<string, unknown>,
): Record<string, unknown> => ({ ...ctxData, ...extra });

export const mergeTemplateContext = ({
  memoryId,
  ctx,
  extra,
  command,
}: {
  memoryId: string;
  ctx: Ctx;
  extra: Record<string, unknown>;
  command: AnyCommand;
}) => {
  const mergedExtra = mergeExtraData(ctx.data, extra);
  const relevantData = getTemplateData(memoryId, mergedExtra);
  return forceJson({
    ...ctx,
    _: relevantData,
    command,
  });
};
