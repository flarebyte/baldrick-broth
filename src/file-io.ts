import fs from 'node:fs/promises';
import YAML from 'yaml';
import type { AnyDataValue } from './build-model.js';
import { type Result, willFail } from './railway.js';

export type LoadingStatus = Result<
  AnyDataValue,
  { message: string; filename: string }
>;

export const readYaml = async (filename: string): Promise<LoadingStatus> => {
  let content: string;
  try {
    content = await fs.readFile(filename, { encoding: 'utf8' });
  } catch {
    return willFail({
      message: `The yaml file cannot be found: ${filename}`,
      filename,
    });
  }

  try {
    const value = YAML.parse(content);
    return {
      status: 'success',
      value,
    };
  } catch {
    return willFail({
      message: `The yaml file cannot be parsed: ${filename}`,
      filename,
    });
  }
};
