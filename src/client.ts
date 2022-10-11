import { Command } from 'commander';
import { safeParseBuild } from './build-model.js';
import { createCommands } from './commands-creator.js';
import { buildFilePath } from './env-variables.js';
import { readYaml } from './file-io.js';
import { version } from './version.js';

const exitWithError = (message: string, value?: object) => {
  value === undefined ? console.error(message) : console.error(message, value);
  process.exit(1); // eslint-disable-line  unicorn/no-process-exit
};

export async function runClient() {
  try {
    const buildLoadingStatus = await readYaml(buildFilePath);
    if (buildLoadingStatus.status === 'failure') {
      exitWithError(buildLoadingStatus.error.message);
    } else {
      const build = safeParseBuild(buildLoadingStatus.value);
      if (build.status === 'invalid') {
        exitWithError(
          `The baldrick-broth build file ${buildFilePath} does not respect the schema`,
          build.errors
        );
      }
      const program = new Command();
      createCommands(program, build);
      program.parseAsync();

      console.log(`✓ baldrick-broth is done. Version ${version}`);
    }
  } catch (error) {
    exitWithError((error instanceof Error && error.message) || `${error}`);
  }
}
