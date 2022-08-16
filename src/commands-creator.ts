import { Command } from 'commander';
import { BuildModelValidation } from './build-model.js';
import { createTaskAction } from './create-task-action.js';
import { version } from './version.js';

export const createCommands = (
  program: Command,
  buildModelValidation: BuildModelValidation
) => {
  program
    .name('baldrick-broth')
    .alias('broth')
    .description('CLI for build automation and running tasks')
    .version(version);

  if (buildModelValidation.status === 'valid') {
    const {
      value,
      value: { workflows },
    } = buildModelValidation;
    for (const workflowKey in workflows) {
      const workflow = workflows[workflowKey];
      if (workflow === undefined) {
        continue;
      }
      const workflowCmd = program.command(workflowKey);
      workflowCmd.description(workflow.title);
      for (const taskId in workflow.tasks) {
        const task = workflow.tasks[taskId];
        if (task === undefined) {
          continue;
        }
        const taskCommand = workflowCmd.command(taskId);
        taskCommand.description(task.title);
        taskCommand.action(createTaskAction(value, task));
        for (const parameterId in task.parameters) {
          const parameter = task.parameters[parameterId];
          if (parameter === undefined) {
            continue;
          }
          taskCommand.option(
            parameter.flags,
            parameter.description,
            parameter.default
          );
        }
      }
    }
  }
};
