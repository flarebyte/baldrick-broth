import { execaCommand } from 'execa';
import { CommandOptionsModel } from './build-model.js';

type ExecuteCommandLineResult =
  | {
      status: 'failed' | 'canceled' | 'timeout' | 'killed';
      line: string;
      stdout: string;
      stderr: string;
      exitCode: number;
    }
  | {
      status: 'success';
      line: string;
      stdout: string;
    };

const executeCommandLine = async (
  line: string,
  name: string,
  opts: CommandOptionsModel
): Promise<ExecuteCommandLineResult> => {
  const { stdout, stderr, exitCode, failed, isCanceled, timedOut, killed } =
    await execaCommand(line);

  const isFailure = failed || isCanceled || timedOut || killed || exitCode > 0;

  if (failed) {
    return { status: 'failed', line, stdout, stderr, exitCode };
  }
  if (isCanceled) {
    return { status: 'canceled', line, stdout, stderr, exitCode };
  }
  if (timedOut) {
    return { status: 'timeout', line, stdout, stderr, exitCode };
  }
  if (killed) {
    return { status: 'killed', line, stdout, stderr, exitCode };
  }
  if (exitCode > 0) {
    return { status: 'failed', line, stdout, stderr, exitCode };
  }
  return {
    status: 'success',
    line,
    stdout,
  };
};
