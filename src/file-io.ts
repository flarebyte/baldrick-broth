import YAML from 'yaml';
import fs from 'fs/promises';
import { LoadingStatus } from './model.js';

export const readYaml = async (filename: string): Promise<LoadingStatus> => {
  let content;
  try {
    content = await fs.readFile(filename, { encoding: 'utf-8' });
  } catch (e) {
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
  } catch (e) {
    return {
      status: 'parse-yaml-error',
      filename,
    };
  }
};
