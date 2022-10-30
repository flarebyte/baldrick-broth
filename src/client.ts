import { Command } from 'commander';
import { AnyDataValue, BuildModel, safeParseBuild } from './build-model.js';
import { createCommands } from './commands-creator.js';
import { buildFilePath } from './env-variables.js';
import { readYaml } from './file-io.js';
import { ValidationError } from './format-message.js';
import { andThen } from './railway.js';
import { version } from './version.js';

const exitWithError = (message: string, value?: object) => {
  value === undefined ? console.error(message) : console.error(message, value);
  process.exit(1); // eslint-disable-line  unicorn/no-process-exit
};

export async function runClient() {
  try {
    await unsafeRunClient();
    console.log(`✓ baldrick-broth is done. Version ${version}`);
  } catch (error) {
    exitWithError((error instanceof Error && error.message) || `${error}`);
  }
}

type RunClientFailure =
  | { message: string; filename: string }
  | ValidationError[];
/**
 * Run the client without trapping all exceptions
 */
async function unsafeRunClient() {
  const buildReadingResult = await readYaml(buildFilePath);
  const buildModelResult = andThen<AnyDataValue, BuildModel, RunClientFailure>(
    safeParseBuild
  )(buildReadingResult);

  if (buildModelResult.status === 'failure') {
    exitWithError(
      `Loading and parsing the baldrick-broth build file ${buildFilePath} failed`,
      buildModelResult.error
    );
  }
  if (buildModelResult.status === 'success') {
    const program = new Command();
    createCommands(program, buildModelResult);
    program.parseAsync();
  }
}
