import path from 'node:path';
import { Listr, type ListrTaskWrapper, type ListrTask } from 'listr2';
import type {
  BatchStepModel,
  Ctx,
  OnShellCommandFinish,
  RuntimeContext,
} from './build-model.js';
import { type CommandLineInput, executeCommandLine } from './execution.js';
import { expandBatchStep } from './expand-batch.js';
import {
  currentTaskLogger,
  replayLogToConsole,
  telemetryTaskLogger,
  telemetryTaskRefLogger,
} from './logging.js';
import { type Result, succeed } from './railway.js';
import {
  getSupportedProperty,
  isTruthy,
  setDataValue,
} from './data-value-utils.js';
import { coloration } from './coloration.js';
import { isStringArray } from './string-utils.js';

const SLEEP_KO = 800;
const SLEEP_MIN = 150;
type BatchStepAction = Result<ListrTask, { messages: string[] }>;

async function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

type OnResultFlags = {
  save: boolean;
  silent: boolean;
  debug: boolean;
  exit: boolean;
};
const defaultOnResultFlags: OnResultFlags = {
  save: false,
  silent: false,
  debug: false,
  exit: false,
};

const toOnResultFlags = (flags: OnShellCommandFinish[]): OnResultFlags => ({
  save: flags.includes('save'),
  silent: flags.includes('silent'),
  debug: flags.includes('debug'),
  exit: flags.includes('exit'),
});

const asJSONLog = (value: any): string =>
  coloration.jsonBlock(JSON.stringify(value, null, 2));

const debugContext = (ctx: Ctx) => {
  currentTaskLogger.info(
    asJSONLog({ keys: Object.keys(ctx), runtime: ctx.runtime, data: ctx.data })
  );
};

const toCommandLineAction = (
  ctx: Ctx,
  commandLineInput: CommandLineInput
): ListrTask => {
  const title = commandLineInput.opts.title
    ? commandLineInput.opts.title
    : commandLineInput.opts.name;

  const commandTask: ListrTask = {
    title,
    enabled(_) {
      const ifPath =
        commandLineInput.opts.a === 'shell' && commandLineInput.opts.if;
      if (ifPath === undefined || ifPath === false) {
        return true;
      }

      const shouldEnable = isTruthy(
        getSupportedProperty(commandLineInput.memoryId, ctx, ifPath)
      );
      return shouldEnable;
    },
    async task(taskContext, task): Promise<void> {
      const isPrompt = commandLineInput.opts.a.startsWith('prompt-');
      if (isPrompt) {
        await interactivePrompt(commandLineInput, taskContext, task, ctx);
        return;
      }

      task.output = commandLineInput.line;
      const cmdLineResult = await executeCommandLine(ctx, commandLineInput);
      const successFlags =
        commandLineInput.opts.a === 'shell'
          ? toOnResultFlags(commandLineInput.opts.onSuccess)
          : defaultOnResultFlags;
      const failureFlags =
        commandLineInput.opts.a === 'shell'
          ? toOnResultFlags(commandLineInput.opts.onFailure)
          : defaultOnResultFlags;
      await sleep(SLEEP_MIN);
      if (cmdLineResult.status === 'success') {
        const {
          value: { data, name },
        } = cmdLineResult;
        task.title = name;
        if (successFlags.save) {
          setDataValue(
            commandLineInput.memoryId,
            ctx,
            commandLineInput.name,
            data
          );
        }
        setDataValue(
          commandLineInput.memoryId,
          ctx,
          `result-of-${commandLineInput.name}`,
          true
        );

        if (!successFlags.silent) {
          const dataView =
            cmdLineResult.value.format === 'string'
              ? `${data}`
              : JSON.stringify(data, null, 2);
          currentTaskLogger.info(coloration.stepTitle(`◼ ${title}`));
          currentTaskLogger.info(dataView);
        }

        if (successFlags.debug) {
          debugContext(ctx);
        }

        task.output = 'OK';
      } else if (cmdLineResult.status === 'failure') {
        if (!failureFlags.silent) {
          currentTaskLogger.info(
            [
              cmdLineResult.error.stdout,
              cmdLineResult.error.stderr,
              cmdLineResult.error.message,
            ].join('\n\n')
          );
        }

        if (failureFlags.debug) {
          debugContext(ctx);
        }

        task.output = 'KO';
        await sleep(SLEEP_KO);
        throw new Error(`KO: ${title}`);
      }

      await sleep(SLEEP_MIN);
    },
  };
  return commandTask;
};

const capitalizeWord = (text: string): string =>
  text.length > 0 ? text[0]?.toUpperCase() + text.slice(1).toLowerCase() : '';

const toBatchStepAction = (
  ctx: Ctx,
  batchStep: BatchStepModel
): BatchStepAction => {
  const title = capitalizeWord(batchStep.name);

  const batchTask: ListrTask = {
    title,
    async task(_, task) {
      const commandsForStep = expandBatchStep(ctx, batchStep);
      if (commandsForStep.status === 'failure') {
        currentTaskLogger.warn({ messages: commandsForStep.error.messages });
        task.output = coloration.warn('KO');
      }

      if (commandsForStep.status === 'success') {
        const commandTasks = commandsForStep.value.map((input) =>
          toCommandLineAction(ctx, input)
        );
        return task.newListr([...commandTasks], { exitOnError: false });
      } else {
        return;
      }
    },
  };
  return succeed(batchTask);
};

const makeMessage = (title: string, messages: string[]): string =>
  `${title}: ${messages.join('\n')}`;

type BuildCtx = Pick<Ctx, 'build' | 'task'>;
export const createTaskAction =
  (buildCtx: BuildCtx) =>
  async (parameters: Record<string, string | boolean>) => {
    const pwd = process.cwd();
    const telemetryName = buildCtx.build.engine?.telemetry.name;
    const projectName =
      telemetryName === undefined ? path.basename(pwd) : telemetryName;
    const runtime: RuntimeContext = {
      pwd,
      project: {
        name: projectName,
      },
      parameters,
    };
    currentTaskLogger.info(coloration.taskTitle(buildCtx.task.title));

    const ctx: Ctx = { ...buildCtx, runtime, data: { status: 'created' } };
    const started = process.hrtime();
    const { task } = ctx;
    const listTasks: ListrTask[] = [];
    if (task.before !== undefined) {
      const beforeStep = toBatchStepAction(ctx, task.before);
      if (beforeStep.status === 'failure') {
        currentTaskLogger.error(
          makeMessage(`Before ${buildCtx.task.name}`, beforeStep.error.messages)
        );
      } else {
        listTasks.push(beforeStep.value);
      }
    }

    const mainStep = toBatchStepAction(ctx, task.main);
    if (mainStep.status === 'failure') {
      currentTaskLogger.error(
        makeMessage(`Main ${buildCtx.task.name}`, mainStep.error.messages)
      );
    } else {
      listTasks.push(mainStep.value);
    }

    if (task.after !== undefined) {
      const afterStep = toBatchStepAction(ctx, task.after);
      if (afterStep.status === 'failure') {
        currentTaskLogger.error(
          makeMessage(`After ${buildCtx.task.name}`, afterStep.error.messages)
        );
      } else {
        listTasks.push(afterStep.value);
      }
    }

    if (listTasks.length > 0) {
      const mainTask = new Listr<Ctx>(listTasks, {
        exitOnError: false,
      });
      try {
        await mainTask.run(ctx);
        logTaskStatistics(started, ctx);
        await replayLogToConsole();
      } catch (error: any) {
        currentTaskLogger.error(error);
      }
    }
  };

async function interactivePrompt(
  commandLineInput: CommandLineInput,
  taskContext: any,
  task: ListrTaskWrapper<any, any>,
  ctx: Ctx
) {
  if (commandLineInput.opts.a === 'prompt-input') {
    taskContext.input = await task.prompt<string>({
      type: 'Input',
      message: commandLineInput.opts.message,
    });
    setDataValue(
      commandLineInput.memoryId,
      ctx,
      commandLineInput.opts.name,
      taskContext.input
    );
  }

  if (commandLineInput.opts.a === 'prompt-password') {
    taskContext.input = await task.prompt<string>({
      type: 'Password',
      message: commandLineInput.opts.message,
    });
    setDataValue(
      commandLineInput.memoryId,
      ctx,
      commandLineInput.opts.name,
      taskContext.input
    );
  }

  if (commandLineInput.opts.a === 'prompt-choices') {
    taskContext.input = await task.prompt<string>({
      type: 'Select',
      message: commandLineInput.opts.message,
      choices: commandLineInput.opts.choices,
    });
    setDataValue(
      commandLineInput.memoryId,
      ctx,
      commandLineInput.opts.name,
      taskContext.input
    );
  }

  if (commandLineInput.opts.a === 'prompt-confirm') {
    taskContext.input = await task.prompt<string>({
      type: 'Confirm',
      message: commandLineInput.opts.message,
    });
    setDataValue(
      commandLineInput.memoryId,
      ctx,
      commandLineInput.opts.name,
      taskContext.input
    );
  }

  if (commandLineInput.opts.a === 'prompt-select') {
    const possibleChoices = getSupportedProperty(
      commandLineInput.memoryId,
      ctx,
      commandLineInput.opts.select
    );
    const choices: string[] = isStringArray(possibleChoices)
      ? possibleChoices
      : ['The choice should be an array (645608)'];
    taskContext.input = await task.prompt<string>({
      type: 'Select',
      message: commandLineInput.opts.message,
      choices,
    });
    setDataValue(
      commandLineInput.memoryId,
      ctx,
      commandLineInput.opts.name,
      taskContext.input
    );
  }
}

function logTaskStatistics(started: [number, number], ctx: Ctx) {
  const date = new Date();
  const finished = process.hrtime(started);
  date.getMonth;
  telemetryTaskLogger.info(
    [
      ctx.runtime.project.name,
      ctx.task.name,
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getDay(),
      finished[0],
    ].join(',')
  );
  // Create a reference file for available tasks
  for (const workflowKey in ctx.build.workflows) {
    const tasks = Object.keys(ctx.build.workflows[workflowKey]?.tasks || {});
    for (const taskId of tasks) {
      telemetryTaskRefLogger.info(
        [
          ctx.runtime.project.name,
          `${workflowKey}.${taskId}`,
          date.getFullYear(),
          date.getMonth(),
        ].join(',')
      );
    }
  }
}
