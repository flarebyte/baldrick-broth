import { Command } from 'commander';
import { getDomains } from './commands.js';
import { version } from './version.js';

export const createCommands = (program: Command) => {
  program
    .name('baldrick-broth')
    .alias('broth')
    .description('CLI for build automation and running tasks')
    .version(version);

  const domains = getDomains();

  for (const domain of domains) {
    const domainCmd = program.command(domain.domain);
    domainCmd.description(domain.description);
    for (const command of domain.commands) {
      domainCmd.command(command.task).description(command.description);
    }
  }
};
