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
const binary = z.object({
  description: z.string(),
  motivation: z.string(),
  homepage: z.string(),
  shell: z.object({ run: z.string(), diagnosis: z.string() }),
});
const binaries = z.record(customKey, binary);
const shellStep = z.object({
  shell: z.object({
    bin: z.string(),
    title: z.string(),
    if: z.string(),
    unless: z.string(),
    each: z.object({ color: z.string() }),
    run: z.string(),
    failSilently: z.boolean(),
  }),
});
const taskRef = z.object({ task: z.string() });
const steps = z.array(z.union([taskRef, shellStep]));
const parameter = z.object({ description: z.string() });
const task = z.object({
  title: z.string(),
  description: z.string(),
  motivation: z.string(),
  visibility: z.string(),
  parameters: z.record(customKey, parameter),
  steps,
  finally: steps,
});
export const schema = z.object({
  engine,
  binaries,
  variables: z.object({}),
  domains: z.object({
    test: z.object({
      title: z.string(),
      description: z.string(),
      tasks: z.record(customKey, task),
    }),
  }),
});

export const safeParseBuild = (content: unknown) => schema.safeParse(content);
