import { z } from 'zod';

const isSingleLine = (value: string) => value.split(/[\n\r]/).length <= 1;

export const stringy = {
  customKey: z
    .string()
    .min(1)
    .max(60)
    .regex(/[a-z][\d_a-z]+/)
    .describe('A short name that can used as reference'),
  varValue: z
    .string()
    .min(1)
    .max(300)
    .regex(/(([\d._a-z]+)|(\[\d+]))+/)
    .describe('A dot prop path. See https://github.com/sindresorhus/dot-prop'),
  title: z
    .string()
    .trim()
    .min(1)
    .max(60)
    .refine(isSingleLine, {
      error: 'title should be a single line',
    })
    .describe('A short title that summarizes this section of script'),
  description: z
    .string()
    .trim()
    .min(1)
    .max(300)
    .describe('The main purpose of this section of script'),
  motivation: z
    .string()
    .trim()
    .min(1)
    .max(300)
    .describe('The main reason why this section of script is needed'),
  url: z.url().max(300).describe('A https link to a webpage'),
  path: z.string().max(300).describe('A relative path to a file'),
  propPath: z
    .string()
    .max(300)
    .describe('A dot prop path. See https://github.com/sindresorhus/dot-prop'),
  promptMessage: z
    .string()
    .trim()
    .min(1)
    .max(60)
    .refine(isSingleLine, {
      error: 'message should be a single line',
    })
    .describe('A short message that will display in the prompt'),
  choice: z
    .string()
    .trim()
    .min(1)
    .max(60)
    .refine(isSingleLine, {
      error: 'choice should be a single line',
    })
    .describe('A possible choice'),
};
export const safeParseField = (
  name: 'title' | 'filename' | string,
  content: unknown,
) => {
  if (name === 'title') {
    return stringy.title.safeParse(content);
  }

  return `${name} is not supported`;
};
