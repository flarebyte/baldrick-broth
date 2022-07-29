import { z } from 'zod';

const customKey = z
  .string()
  .min(1)
  .max(30)
  .regex(/[a-z][\d_a-z]+/);

const literalSchema = z.union([z.string().min(1), z.number(), z.boolean()]);
type Literal = z.infer<typeof literalSchema>;
type Json = Literal | { [key: string]: Json } | Json[];
const jsonishSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(jsonishSchema), z.record(jsonishSchema)])
);

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
const shellStep = z.strictObject({
  a: z.literal('shell'),
  bin: customKey.optional(),
  title: stringTitle,
  if: stringShell.optional(),
  unless: stringShell.optional(),
  each: z.array(loopEach).min(1).max(12).optional(),
  flags: z.array(stringShellStepFlag).optional(),
  run: stringShell,
});
const taskRef = z.strictObject({ a: z.literal('task'), task: customKey });
const eitherStep = z.discriminatedUnion('a', [taskRef, shellStep]);
const steps = z.array(eitherStep).min(1);
const parameter = z.object({ description: z.string() });
const task = z.object({
  title: stringTitle,
  description: stringDescription.optional(),
  motivation: stringMotivation.optional(),
  flags: z.array(stringTaskFlag).optional(),
  parameters: z.record(customKey, parameter),
  steps,
  finally: steps,
});
const domain = z.object({
  title: stringTitle,
  description: stringDescription.optional(),
  tasks: z.record(customKey, task),
});
export const schema = z
  .object({
    engine,
    binaries,
    model: jsonishSchema,
    workflows: z.record(customKey, domain),
  })
  .strict();

interface ValidationError {
  message: string;
  path: string;
}

export type BuildModelValidation =
  | {
      status: 'valid';
      value: z.infer<typeof schema>;
    }
  | {
      status: 'invalid';
      errors: ValidationError[];
    };

const formatMessage = (issue: z.ZodIssue): ValidationError => {
  const path = issue.path.join('.');
  switch (issue.code) {
    case 'invalid_type':
      return {
        path,
        message: [
          'The type for the field is invalid',
          `I would expect ${issue.expected} instead of ${issue.received}`,
        ].join('; '),
      };
    case 'invalid_string':
      return {
        path,
        message: [
          'The string for the field is invalid',
          `${issue.message} and ${issue.validation}`,
        ].join('; '),
      };

    case 'invalid_enum_value':
      return {
        path,
        message: [
          'The enum for the field is invalid',
          `I would expect any of ${issue.options} instead of ${issue.received}`,
        ].join('; '),
      };

    case 'invalid_literal':
      return {
        path,
        message: [
          'The literal for the field is invalid',
          `I would expect ${issue.expected}`,
        ].join('; '),
      };

    case 'invalid_union_discriminator':
      return {
        path,
        message: [
          'The union discriminator for the object is invalid',
          `I would expect any of ${issue.options}`,
        ].join('; '),
      };
    case 'invalid_union':
      return {
        path,
        message: [
          'The union for the field is invalid',
          `I would check ${issue.unionErrors}`,
        ].join('; '),
      };
    case 'too_big':
      return {
        path,
        message: [
          `The ${issue.type} for the field is too big`,
          `I would expect the maximum to be ${issue.maximum}`,
        ].join('; '),
      };

    case 'too_small':
      return {
        path,
        message: [
          `The ${issue.type} for the field is too small`,
          `I would expect the minimum to be ${issue.minimum}`,
        ].join('; '),
      };

    default:
      return {
        path,
        message: [
          'The type for the field is incorrect',
          `${issue.message}`,
        ].join('; '),
      };
  }
};

export const safeParseBuild = (content: unknown): BuildModelValidation => {
  const result = schema.safeParse(content);
  if (result.success) {
    return { status: 'valid', value: result.data };
  }
  const {
    error: { issues },
  } = result;
  const errors = issues.map(formatMessage);
  return {
    status: 'invalid',
    errors,
  };
};
