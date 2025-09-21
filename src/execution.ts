import { appendFile, writeFile } from 'node:fs/promises';
import { execaCommand } from 'execa';
import CSV from 'papaparse';
import YAML from 'yaml';
import { basicCommandExecution } from './basic-execution.js';
import type {
  AnyCommand,
  AnyDataValue,
  Ctx,
  onCommandFailure,
  onCommandSuccess,
} from './build-model.js';
import { coloration } from './coloration.js';
import { getSupportedProperty } from './data-value-utils.js';
import { currentTaskLogger } from './logging.js';
import { type Result, succeed, willFail } from './railway.js';
import { getSingleCommandLine, mergeTemplateContext } from './templating.js';

type ExecuteCommandLineFailedCategory =
  | 'failed'
  | 'canceled'
  | 'timeout'
  | 'killed'
  | 'parse-json-failed'
  | 'parse-yaml-failed'
  | 'parse-csv-failed';

export type CommandLineInput = {
  memoryId: string;
  line: string;
  name: string;
  opts: AnyCommand;
  extra: Record<string, unknown>;
};

type ExecuteCommandLineFailure = {
  category: ExecuteCommandLineFailedCategory;
  line: string;
  stdout: string;
  stderr: string;
  exitCode: number;
  message: string;
  onFailure: onCommandFailure[];
};

type ExecuteCommandLineSuccess =
  | {
      format: 'string';
      line: string;
      name: string;
      data: string;
      onSuccess: onCommandSuccess[];
    }
  | {
      format: 'json';
      line: string;
      name: string;
      data: AnyDataValue;
      onSuccess: onCommandSuccess[];
    }
  | {
      format: 'csv';
      line: string;
      name: string;
      data: AnyDataValue;
      onSuccess: onCommandSuccess[];
    };

type ExecuteCommandLineResult = Result<
  ExecuteCommandLineSuccess,
  ExecuteCommandLineFailure
>;

const toStatus = (params: {
  exitCode: number;
  failed: boolean;
  isCanceled: boolean;
  timedOut: boolean;
  killed: boolean;
}): ExecuteCommandLineFailedCategory | 'success' => {
  const { exitCode, failed, isCanceled, timedOut, killed } = params;
  if (failed) {
    return 'failed';
  }

  if (isCanceled) {
    return 'canceled';
  }

  if (timedOut) {
    return 'timeout';
  }

  if (killed) {
    return 'killed';
  }

  if (exitCode > 0) {
    return 'failed';
  }

  return 'success';
};

type JsonParsingResult = Result<AnyDataValue, { message: string }>;

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

const parseJson = (content: string): JsonParsingResult => {
  try {
    const parsed: AnyDataValue = JSON.parse(content);
    return succeed(parsed);
  } catch (error) {
    return willFail({ message: getErrorMessage(error) });
  }
};

const parseYaml = (content: string): JsonParsingResult => {
  try {
    const parsed: AnyDataValue = YAML.parse(content);
    return succeed(parsed);
  } catch (error) {
    return willFail({ message: getErrorMessage(error) });
  }
};

type CsvParsingResult = Result<
  Array<Record<string, string>>,
  { message: string }
>;

const prepareCsv = (content: string): string =>
  content
    .split('\n')
    .filter((line) => line.length > 2)
    .join('\n');

const parseCsv = (content: string): CsvParsingResult => {
  try {
    const parsed = CSV.parse<Record<string, string>>(prepareCsv(content), {
      header: true,
    });
    const { data, errors } = parsed;
    if (errors.length > 0) {
      return willFail({
        message: errors
          .map((err) => `Row ${err.row}: ${err.message}`)
          .join('\n'),
      });
    }

    if (data.length === 0) {
      return willFail({
        message: 'Length of csv data should be more than zero',
      });
    }

    return succeed(data);
  } catch (error) {
    return willFail({ message: getErrorMessage(error) });
  }
};

const forceString = (value: unknown): string =>
  typeof value === 'string' ? value : JSON.stringify(value, null, 2);

const executeShellCommandLine = async (
  ctx: Ctx,
  params: CommandLineInput & { opts: { a: 'shell' } },
): Promise<ExecuteCommandLineResult> => {
  const { line, name, opts, memoryId, extra } = params;

  const templateCtx = mergeTemplateContext({
    memoryId,
    ctx,
    command: opts,
    extra: { ...ctx.data, ...extra },
  });
  const runnableLine = opts.multiline
    ? line
    : getSingleCommandLine(line, templateCtx);
  currentTaskLogger.info(`> ${coloration.running(runnableLine)}`);
  const { onSuccess, onFailure, stdin } = opts;
  let maybeStdin: { input?: string };
  if (stdin !== undefined) {
    const stdinPropValue = getSupportedProperty(memoryId, ctx, stdin);
    if (stdinPropValue === undefined) {
      return willFail({
        category: 'failed',
        line: runnableLine,
        stdout: '',
        stderr: '',
        exitCode: 1,
        onFailure,
        message: `Could not get property for stdin ${stdin}`,
      });
    }

    maybeStdin = { input: forceString(stdinPropValue) };
  } else {
    maybeStdin = {};
  }

  const {
    stdout,
    stderr,
    all,
    exitCode,
    failed,
    isCanceled,
    timedOut,
    killed,
  } = await execaCommand(runnableLine, {
    reject: false,
    all: true,
    env: { FORCE_COLOR: 'true' },
    ...maybeStdin,
  });

  const status = toStatus({ exitCode, failed, isCanceled, timedOut, killed });

  if (status === 'success') {
    if (onSuccess.includes('json')) {
      const parsed = parseJson(stdout);
      return parsed.status === 'failure'
        ? willFail({
            category: 'parse-json-failed',
            line,
            stdout,
            stderr,
            exitCode,
            onFailure,
            message: parsed.error.message,
          })
        : succeed({
            format: 'json',
            name,
            line,
            data: parsed.value,
            onSuccess,
          });
    }

    if (onSuccess.includes('yaml')) {
      const parsed = parseYaml(stdout);
      return parsed.status === 'failure'
        ? willFail({
            category: 'parse-yaml-failed',
            line,
            stdout,
            stderr,
            exitCode,
            onFailure,
            message: parsed.error.message,
          })
        : succeed({
            format: 'json',
            name,
            line,
            data: parsed.value,
            onSuccess,
          });
    }

    if (onSuccess.includes('csv')) {
      const parsed = parseCsv(stdout);
      return parsed.status === 'failure'
        ? willFail({
            category: 'parse-csv-failed',
            line,
            stdout,
            stderr,
            exitCode,
            onFailure,
            message: parsed.error.message,
          })
        : succeed({
            format: 'csv',
            name,
            line,
            data: parsed.value,
            onSuccess,
          });
    }

    const data = onSuccess.includes('trim')
      ? (all || stdout).trim()
      : all || stdout;

    return succeed({ format: 'string', name, line, data, onSuccess });
  }

  return willFail({
    category: 'failed',
    line,
    stdout,
    stderr,
    exitCode,
    onFailure,
    message: `Failed with exit code ${exitCode}`,
  });
};

const appendVarToFile = async (
  memoryId: string,
  ctx: Ctx,
  anyCommand: AnyCommand & { a: 'append-to-file' },
): Promise<ExecuteCommandLineResult> => {
  const objectValue =
    getSupportedProperty(memoryId, ctx, anyCommand.value) || {};
  const content = forceString(objectValue);
  try {
    await appendFile(anyCommand.filename, content, { encoding: 'utf8' });
    return succeed({
      format: 'json',
      name: anyCommand.name,
      line: '',
      data: {},
      onSuccess: [],
    });
  } catch (e) {
    return willFail({
      category: 'failed',
      line: '',
      stdout: '',
      stderr: '',
      exitCode: 1,
      onFailure: [],
      message: `Could not append to file ${anyCommand.filename}: ${e}`,
    });
  }
};

const writeVarToFile = async (
  memoryId: string,
  ctx: Ctx,
  anyCommand: AnyCommand & { a: 'write-to-file' },
): Promise<ExecuteCommandLineResult> => {
  const objectValue =
    getSupportedProperty(memoryId, ctx, anyCommand.value) || {};
  const content = forceString(objectValue);
  try {
    await writeFile(anyCommand.filename, content, { encoding: 'utf8' });
    return succeed({
      format: 'json',
      name: anyCommand.name,
      line: '',
      data: {},
      onSuccess: [],
    });
  } catch (e) {
    return willFail({
      category: 'failed',
      line: '',
      stdout: '',
      stderr: '',
      exitCode: 1,
      onFailure: [],
      message: `Could not write to file ${anyCommand.filename}: ${e}`,
    });
  }
};

/**
 * Executes a command after template expansion
 */
export const executeCommandLine = async (
  ctx: Ctx,
  params: CommandLineInput,
): Promise<ExecuteCommandLineResult> => {
  const { line, name, opts, memoryId, extra } = params;
  if (opts.a === 'shell') {
    return executeShellCommandLine(ctx, {
      line,
      name,
      opts,
      memoryId,
      extra,
    });
  }
  if (opts.a === 'append-to-file') {
    return await appendVarToFile(memoryId, ctx, opts);
  }

  if (opts.a === 'write-to-file') {
    return await writeVarToFile(memoryId, ctx, opts);
  }

  basicCommandExecution(memoryId, ctx, opts, extra);
  return succeed({
    format: 'json',
    name,
    line,
    data: {},
    onSuccess: [],
  });
};
