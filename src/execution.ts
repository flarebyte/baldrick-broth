import { execaCommand } from 'execa';
import type { JsonValue } from 'type-fest';
import YAML from 'yaml';
import CSV from 'papaparse';
import { CommandOptionsModel } from './build-model.js';
import { Result, succeed } from './railway.js';

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
  opts: CommandOptionsModel;
}

type ExecuteCommandLineFailure = {
  category: ExecuteCommandLineFailedCategory;
  line: string;
  stdout: string;
  stderr: string;
  exitCode: number;
  onFailure: CommandOptionsModel['onFailure'];
};

type ExecuteCommandLineSuccess =
  | {
      format: 'string';
      line: string;
      name: string;
      value: string;
      onSuccess: CommandOptionsModel['onSuccess'];
    }
  | {
      format: 'json';
      line: string;
      name: string;
      value: JsonValue;
      onSuccess: CommandOptionsModel['onSuccess'];
    }
  | {
      format: 'csv';
      line: string;
      name: string;
      value: Record<string, string>[];
      onSuccess: CommandOptionsModel['onSuccess'];
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

const parseJson = (content: string): JsonValue | undefined => {
  try {
    const parsed: JsonValue = JSON.parse(content);
    return parsed;
  } catch {
    return undefined;
  }
};
const parseYaml = (content: string): JsonValue | undefined => {
  try {
    const parsed: JsonValue = YAML.parse(content);
    return parsed;
  } catch {
    return undefined;
  }
};
const parseCsv = (content: string): Record<string, string>[] | undefined => {
  try {
    const parsed = CSV.parse<Record<string, string>>(content, { header: true });
    const { data, errors } = parsed;
    if (errors.length > 0) {
      return undefined;
    }
    if (data.length > 0) {
      return undefined;
    }
    return data;
  } catch {
    return undefined;
  }
};
/**
 * Executes a a command after template expansion
 */
export const executeCommandLine = async (
  params: CommandLineInput
): Promise<ExecuteCommandLineResult> => {
  const { line, name, opts } = params;

  const { stdout, stderr, exitCode, failed, isCanceled, timedOut, killed } =
    await execaCommand(line, { reject: false });

  const { onSuccess, onFailure } = opts;
  const status = toStatus({ exitCode, failed, isCanceled, timedOut, killed });

  if (status === 'success') {
    if (onSuccess.includes('json')) {
      const value = parseJson(stdout);
      if (value === undefined) {
        return fail({
          category: 'parse-json-failed',
          line,
          stdout,
          stderr,
          exitCode,
          onFailure,
        });
      }
      return succeed({ format: 'json', name, line, value, onSuccess });
    }
    if (onSuccess.includes('yaml')) {
      const value = parseYaml(stdout);
      if (value === undefined) {
        return fail({
          category: 'parse-yaml-failed',
          line,
          stdout,
          stderr,
          exitCode,
          onFailure,
        });
      }
      return succeed({ format: 'json', name, line, value, onSuccess });
    }
    if (onSuccess.includes('csv')) {
      const value = parseCsv(stdout);
      if (value === undefined) {
        return fail({
          category: 'parse-csv-failed',
          line,
          stdout,
          stderr,
          exitCode,
          onFailure,
        });
      }
      return succeed({ format: 'csv', name, line, value, onSuccess });
    }

    const value = onSuccess.includes('trim') ? stdout.trim() : stdout;

    return succeed({ format: 'string', name, line, value, onSuccess });
  } else {
    return fail({
      category: 'failed',
      line,
      stdout,
      stderr,
      exitCode,
      onFailure,
    });
  }
};
