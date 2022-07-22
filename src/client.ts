import { Command } from 'commander';
import { commandObject } from './command-object.js';
import { commandRender } from './command-render.js';
import { version } from './version.js';

const program = new Command();
program
  .name('baldrick-whisker')
  .description('CLI to generate code using templates')
  .version(version);

program
  .command('object')
  .description('Convert source files to JSON or YAML')
  .argument('<destination>', 'the path to the JSON or YAML destination file')
  .argument('<sources...>', 'the path to the input filenames (JSON, YAML, Elm)')
  .option('--no-ext', 'Drop the extension suffix for destination')
  .action(commandObject);

program
  .command('render')
  .description('Render a template')
  .argument('<source>', 'the path to source file in JSON or YAML')
  .argument('<template>', 'the path to the Handlebars template')
  .argument('<destination>', 'the path to the destination file (elm, ...)')
  .option('--diff', 'Only display the difference in the console')
  .option('--no-ext', 'Drop the extension suffix for destination')
  .option('-cfg, --config <config>', 'Configuration as a JSON line')
  .action(commandRender);

export async function runClient() {
  try {
    program.parseAsync();
    console.log(`✓ Done. Version ${version}`);
  } catch (error) {
    console.log('baldrick-decision will exit with error code 1');
    console.error(error);
    process.exit(1); // eslint-disable-line  unicorn/no-process-exit
  }
}
