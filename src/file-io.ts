import YAML from 'yaml';
import fs from 'node:fs/promises';
import { LoadingStatus } from './model.js';

export const readYaml = async (filename: string): Promise<LoadingStatus> => {
  let content;
  try {
    content = await fs.readFile(filename, { encoding: 'utf8' });
  } catch {
    return {
      status: 'file-not-found',
      filename,
    };
  }

  try {
    const value = YAML.parse(content);
    return {
      status: 'success',
      value,
    };
  } catch {
    return {
      status: 'parse-yaml-error',
      filename,
    };
  }
};
