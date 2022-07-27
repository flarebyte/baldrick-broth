import { Command } from 'commander';
import { createCommands } from './commands-creator.js';
import { version } from './version.js';

export async function runClient() {
  try {
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
