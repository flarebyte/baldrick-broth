import { Command } from 'commander';
import { BuildModelValidation, TaskModel } from './build-model.js';
import { coloration } from './coloration.js';
import { createTaskAction } from './create-task-action.js';
import { version } from './version.js';

const createTaskDescription = (task: TaskModel): string => {
  const descriptions = [task.description ? task.description : task.title];
  if (task.motivation !== undefined) {
    descriptions.push(
      '\n' + coloration.motivation(`Motivation: ${task.motivation}`)
    );
  }
  return descriptions.join('\n');
};

export const createCommands = (
  program: Command,
  buildModelValidation: BuildModelValidation
) => {
  program
    .name('baldrick-broth')
    .description('CLI for build automation and running tasks')
    .version(version);

  if (buildModelValidation.status === 'success') {
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
      workflowCmd.summary(workflow.title);
      if (workflow.description !== undefined) {
        workflowCmd.description(workflow.description);
      }
      for (const taskId in workflow.tasks) {
        const task = workflow.tasks[taskId];
        if (task === undefined) {
          continue;
        }
        const taskCommand = workflowCmd.command(taskId);
        taskCommand.summary(task.title);
        taskCommand.description(createTaskDescription(task));
        taskCommand.action(
          createTaskAction({
            build: value,
            task: { ...task, name: `${workflowKey}::${taskId}` },
          })
        );
        if (task.parameters !== undefined) {
          for (const parameter of task.parameters) {
            taskCommand.option(
              parameter.flags,
              parameter.description,
              parameter.default
            );
          }
        }
      }
    }
  }
};
