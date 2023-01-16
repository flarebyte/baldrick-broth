import { execaCommand } from 'execa';
import YAML from 'yaml';
import CSV from 'papaparse';
import {
  AnyDataValue,
  AnyCommand,
  Ctx,
  onCommandSuccess,
  onCommandFailure,
} from './build-model.js';
import { Result, succeed, fail } from './railway.js';
import { getSupportedProperty } from './data-value-utils.js';
import { basicCommandExecution } from './basic-execution.js';

type ExecuteCommandLineFailedCategory =
  | 'failed'
  | 'canceled'
  | 'timeout'
  | 'killed'
  | 'parse-json-failed'
  | 'parse-yaml-failed'
  | 'parse-csv-failed';

export interface CommandLineInput {
  line: string;
  name: string;
  opts: AnyCommand;
}

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
    return fail({ message: getErrorMessage(error) });
  }
};
const parseYaml = (content: string): JsonParsingResult => {
  try {
    const parsed: AnyDataValue = YAML.parse(content);
    return succeed(parsed);
  } catch (error) {
    return fail({ message: getErrorMessage(error) });
  }
};
type CsvParsingResult = Result<Record<string, string>[], { message: string }>;

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
      return fail({
        message: errors
          .map((err) => `Row ${err.row}: ${err.message}`)
          .join('\n'),
      });
    }
    if (data.length === 0) {
      return fail({ message: 'Length of csv data should be more than zero' });
    }
    return succeed(data);
  } catch (error) {
    return fail({ message: getErrorMessage(error) });
  }
};

const forceString = (value: unknown): string =>
  typeof value === 'string' ? value : JSON.stringify(value, null, 2);

const executeShellCommandLine = async (
  ctx: Ctx,
  params: CommandLineInput & { opts: { a: 'shell' } }
): Promise<ExecuteCommandLineResult> => {
  const { line, name, opts } = params;
  const { onSuccess, onFailure, stdin } = opts;
  let maybeStdin;
  if (stdin !== undefined) {
    const stdinPropValue = getSupportedProperty(ctx, stdin);
    if (stdinPropValue === undefined) {
      return fail({
        category: 'failed',
        line,
        stdout: '',
        stderr: '',
        exitCode: 1,
        onFailure,
        message: `Could not get property for stdin ${stdin}`,
      });
    } else {
      maybeStdin = { input: forceString(stdinPropValue) };
    }
  } else {
    maybeStdin = {};
  }

  const { stdout, stderr, all, exitCode, failed, isCanceled, timedOut, killed } =
    await execaCommand(line, { reject: false, all: true, env: { FORCE_COLOR: 'true'}, ...maybeStdin });

  const status = toStatus({ exitCode, failed, isCanceled, timedOut, killed });

  if (status === 'success') {
    if (onSuccess.includes('json')) {
      const parsed = parseJson(stdout);
      return parsed.status === 'failure'
        ? fail({
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
        ? fail({
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
        ? fail({
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

    const data = onSuccess.includes('trim') ? (all || stdout).trim() : (all || stdout);

    return succeed({ format: 'string', name, line, data, onSuccess });
  } else {
    return fail({
      category: 'failed',
      line,
      stdout,
      stderr,
      exitCode,
      onFailure,
      message: `Failed with exit code ${exitCode}`,
    });
  }
};

/**
 * Executes a command after template expansion
 */
export const executeCommandLine = async (
  ctx: Ctx,
  params: CommandLineInput
): Promise<ExecuteCommandLineResult> => {
  const { line, name, opts } = params;
  if (opts.a === 'shell') {
    return await executeShellCommandLine(ctx, { line, name, opts });
  } else {
    basicCommandExecution(ctx, params.opts);
    return succeed({
      format: 'json',
      name,
      line,
      data: {},
      onSuccess: [],
    });
  }
};
