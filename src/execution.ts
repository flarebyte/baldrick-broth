import { execaCommand } from 'execa';
import { JsonValue } from 'type-fest';
import YAML from 'yaml';
import CSV from 'papaparse';
import { CommandOptionsModel } from './build-model.js';

type ExecuteCommandLineFailedStatus =
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

type ExecuteCommandLineResult =
  | {
      status: ExecuteCommandLineFailedStatus;
      line: string;
      stdout: string;
      stderr: string;
      exitCode: number;
      onFailure: CommandOptionsModel['onFailure'];
    }
  | {
      status: 'string';
      line: string;
      name: string;
      value: string;
      onSuccess: CommandOptionsModel['onSuccess'];
    }
  | {
      status: 'json';
      line: string;
      name: string;
      value: JsonValue;
      onSuccess: CommandOptionsModel['onSuccess'];
    }
  | {
      status: 'csv';
      line: string;
      name: string;
      value: Record<string, string>[];
      onSuccess: CommandOptionsModel['onSuccess'];
    };

const toStatus = (params: {
  exitCode: number;
  failed: boolean;
  isCanceled: boolean;
  timedOut: boolean;
  killed: boolean;
}): ExecuteCommandLineFailedStatus | 'success' => {
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
    await execaCommand(line);
  const { onSuccess, onFailure } = opts;
  const status = toStatus({ exitCode, failed, isCanceled, timedOut, killed });

  if (status === 'success') {
    if (onSuccess.includes('json')) {
      const value = parseJson(stdout);
      if (value === undefined) {
        return {
          status: 'parse-json-failed',
          line,
          stdout,
          stderr,
          exitCode,
          onFailure,
        };
      }
      return { status: 'json', name, line, value, onSuccess };
    }
    if (onSuccess.includes('yaml')) {
      const value = parseYaml(stdout);
      if (value === undefined) {
        return {
          status: 'parse-yaml-failed',
          line,
          stdout,
          stderr,
          exitCode,
          onFailure,
        };
      }
      return { status: 'json', name, line, value, onSuccess };
    }
    if (onSuccess.includes('csv')) {
      const value = parseCsv(stdout);
      if (value === undefined) {
        return {
          status: 'parse-csv-failed',
          line,
          stdout,
          stderr,
          exitCode,
          onFailure,
        };
      }
      return { status: 'csv', name, line, value, onSuccess };
    }

    const value = onSuccess.includes('trim') ? stdout.trim() : stdout;

    return { status: 'string', name, line, value, onSuccess };
  } else {
    return {
      status: 'failed',
      line,
      stdout,
      stderr,
      exitCode,
      onFailure,
    };
  }
};
