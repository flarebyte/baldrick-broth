import { z } from 'zod';

const customKey = z
  .string()
  .min(1)
  .max(30)
  .regex(/[a-z][a-z0-9_]+/);

const engine = z.object({
  defaultShell: z.string(),
  telemetry: z.object({ verbosity: z.string(), filepath: z.string() }),
});
const stringTitle = z.string().trim().min(1).max(60);
const stringDescription = z.string().trim().min(1).max(300);
const stringMotivation = z.string().trim().min(1).max(300);
const stringUrl = z.string().url().max(300);
const stringShell = z.string().min(1).max(5000);
const stringShellStepFlag = z.enum(['silent:fail']);
const stringTaskFlag = z.enum(['private']);

const binary = z.object({
  title: stringTitle,
  description: stringDescription.optional(),
  motivation: stringMotivation.optional(),
  homepage: stringUrl.optional(),
  shell: z.object({ run: stringShell, diagnosis: stringShell }),
});
const valuesLoopEach = z.string().min(1).max(300);
const loopEach = z.object({
  value: customKey,
  values: valuesLoopEach,
});
const binaries = z.record(customKey, binary);
const shellStep = z.object({
  shell: z.object({
    bin: customKey.optional(),
    title: stringTitle,
    if: stringShell.optional(),
    unless: stringShell.optional(),
    each: z.array(loopEach).min(1).max(12).optional(),
    flags: z.set(stringShellStepFlag).optional(),
    run: stringShell,
  }),
});
const taskRef = z.object({ task: customKey });
const steps = z.array(z.union([taskRef, shellStep]));
const parameter = z.object({ description: z.string() });
const task = z.object({
  title: stringTitle,
  description: stringDescription.optional(),
  motivation: stringMotivation.optional(),
  flags: z.set(stringTaskFlag).optional(),
  parameters: z.record(customKey, parameter),
  steps,
  finally: steps,
});
const domain = z.object({
  title: stringTitle,
  description: stringDescription.optional(),
  tasks: z.record(customKey, task),
});
export const schema = z.object({
  engine,
  binaries,
  variables: z.object({}),
  domains: z.record(customKey, domain),
});

export const safeParseBuild = (content: unknown) => schema.safeParse(content);
