import { z } from 'zod';

const isSingleLine = (value: string) => value.split(/[\n\r]/).length <= 1;

export const stringCustomKey = z
  .string()
  .min(1)
  .max(30)
  .regex(/[a-z][\d_a-z]+/)
  .describe('A short name that can used as variable');
export const varValue = z
  .string()
  .min(1)
  .max(300)
  .regex(/(([\d._a-z]+)|(\[\d+]))+/).describe('A dot prop path');
export const stringTitle = z
  .string()
  .trim()
  .min(1)
  .max(60)
  .refine(isSingleLine, { message: 'title should be a single line' })
  .describe('A short title that summarizes this section of script');
export const stringDescription = z
  .string()
  .trim()
  .min(1)
  .max(300)
  .describe('The main purpose of this section of script');
export const stringMotivation = z
  .string()
  .trim()
  .min(1)
  .max(300)
  .describe('The main reason why this section of script is needed');
export const stringUrl = z
  .string()
  .url()
  .max(300)
  .describe('A https link to a webpage');
export const stringPath = z
  .string()
  .max(300)
  .describe('A relative path to a file');
export const stringPropPath = z
  .string()
  .max(300)
  .describe('A dot prop path');

export const safeParseField = (
  name: 'title' | 'filename' | string,
  content: unknown
) => {
  if (name === 'title') {
    return stringTitle.safeParse(content);
  }
  return `${name} is not supported`;
};
