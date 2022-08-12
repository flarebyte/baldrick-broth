import { z } from 'zod';

const isSingleLine = (value: string) => value.split(/[\n\r]/).length <= 1;

export const customKey = z
  .string()
  .min(1)
  .max(30)
  .regex(/[a-z][\d_a-z]+/);
export const varValue = z
  .string()
  .min(1)
  .max(300)
  .regex(/(([\d._a-z]+)|(\[\d+]))+/);
export const stringTitle = z
  .string()
  .trim()
  .min(1)
  .max(60)
  .refine(isSingleLine, { message: 'title should be a single line' });
export const stringDescription = z.string().trim().min(1).max(300);
export const stringMotivation = z.string().trim().min(1).max(300);
export const stringUrl = z.string().url().max(300);
