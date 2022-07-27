import { Command } from 'commander';
import { createCommands } from './commands-creator.js';
import { buildFilePath } from './env-variables.js';
import { readYaml } from './file-io.js';
import { version } from './version.js';

export async function runClient() {
  try {
    const buildLoadingStatus = await readYaml(buildFilePath)
    if (buildLoadingStatus.status === 'parse-yaml-error') {
      console.error(`The file ${buildLoadingStatus.filename} cannot be parsed as YAML`);
      process.exit(1)
    }
    if (buildLoadingStatus.status === 'success') {
      console.log(`Successfully loaded the build file`)
    }
    const program = new Command();
    createCommands(program);
    program.parseAsync();
    console.log(`✓ baldrick-broth is done. Version ${version}`);
  } catch (error) {
    console.log('baldrick-broth will exit with error code 1');
    console.error(error);
    process.exit(1); // eslint-disable-line  unicorn/no-process-exit
  }
}
