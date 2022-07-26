import { Command } from 'commander';
import { version } from './version.js';

const program = new Command();
program
  .name('baldrick-broth')
  .alias('broth')
  .description('CLI for build automation and running tasks')
  .version(version);

program
  .command('object')
  .description('Convert source files to JSON or YAML')
  .argument('<destination>', 'the path to the JSON or YAML destination file')
  .argument('<sources...>', 'the path to the input filenames (JSON, YAML, Elm)')
  .option('--no-ext', 'Drop the extension suffix for destination');

export async function runClient() {
  try {
    program.parseAsync();
    console.log(`✓ baldrick-broth is done. Version ${version}`);
  } catch (error) {
    console.log('baldrick-broth will exit with error code 1');
    console.error(error);
    process.exit(1); // eslint-disable-line  unicorn/no-process-exit
  }
}
