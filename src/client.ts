/**
 * Responsibilities: Bootstraps the CLI from the build file.
 * - Loads YAML, validates the build model and constructs commander commands
 * - Runs the program and reports success/failure with version info
 */
import { writeFile } from 'node:fs/promises';
import { Command } from 'commander';
import {
  type AnyDataValue,
  type BuildModel,
  safeParseBuild,
} from './build-model.js';
import { createCommands } from './commands-creator.js';
import { buildFilePath, modelFilePath } from './env-variables.js';
import { readYaml } from './file-io.js';
import type { ValidationError } from './format-message.js';
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

/**
 * We reset existing log file
 */
async function deleteLog() {
  try {
    await writeFile('temp/log/baldrick-broth-log.txt', '', {
      encoding: 'utf-8',
    });
  } catch {}
}

type RunClientFailure =
  | { message: string; filename: string }
  | ValidationError[];
/**
 * Run the client without trapping all exceptions
 */
async function unsafeRunClient() {
  await deleteLog();
  // Read both config files in parallel for performance.
  const [mainRes, modelRes] = await Promise.all([
    readYaml(buildFilePath),
    readYaml(modelFilePath),
  ]);

  // Handle main config first (must exist and parse).
  if (mainRes.status === 'failure') {
    exitWithError(
      `Loading the baldrick-broth build file ${buildFilePath} failed`,
      mainRes.error,
    );
  }

  // Handle optional model config: ignore only if the file is missing; surface other errors.
  let externalModel: AnyDataValue | undefined;
  if (modelRes.status === 'success') {
    externalModel = modelRes.value;
  } else {
    const msg = modelRes.error.message || '';
    const isMissing = msg.includes('cannot be found');
    if (!isMissing) {
      exitWithError(
        `Error while reading ${modelFilePath}. If present it must be valid YAML`,
        modelRes.error,
      );
    }
  }

  // Merge: external model takes precedence if provided.
  const mainValue = (
    mainRes as { status: 'success'; value: Record<string, AnyDataValue> }
  ).value;
  // biome-ignore lint/complexity/useLiteralKeys: TS index signature requires bracket access
  const finalModel = externalModel ?? (mainValue?.['model'] as AnyDataValue);

  // If both files are present and main has a non-empty model, warn.
  if (externalModel !== undefined) {
    // biome-ignore lint/complexity/useLiteralKeys: TS index signature requires bracket access
    const mv = mainValue?.['model'] as unknown;
    const isEmptyObject =
      mv && typeof mv === 'object' && Object.keys(mv).length === 0;
    const hasContent = mv !== undefined && !isEmptyObject;
    if (hasContent) {
      console.warn(
        `Warning: model in ${buildFilePath} is ignored because ${modelFilePath} is present. ` +
          `Please empty the 'model' section in ${buildFilePath}.`,
      );
    }
  }

  const combined: AnyDataValue = {
    ...mainValue,
    model: finalModel,
  };

  const buildModelResult = andThen<AnyDataValue, BuildModel, RunClientFailure>(
    safeParseBuild,
  )({ status: 'success', value: combined });

  if (buildModelResult.status === 'failure') {
    exitWithError(
      `Loading and parsing the baldrick-broth build file ${buildFilePath} failed`,
      buildModelResult.error,
    );
  }

  if (buildModelResult.status === 'success') {
    const program = new Command();
    createCommands(program, buildModelResult);
    program.parseAsync();
  }
}
