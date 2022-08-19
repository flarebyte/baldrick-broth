import { z } from 'zod';
import {
  stringCustomKey,
  stringTitle,
  stringDescription,
  stringMotivation,
  varValue,
  stringUrl,
} from './field-validation.js';

/**JSON like */
const literalSchema = z.union([z.string().min(1), z.number(), z.boolean()]);
type Literal = z.infer<typeof literalSchema>;
type Json = Literal | { [key: string]: Json } | Json[];
const jsonishSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(jsonishSchema), z.record(jsonishSchema)])
);
const engine = z
  .object({
    defaultShell: z.string(),
    telemetry: z.object({ verbosity: z.string(), filepath: z.string() }),
  })
  .optional();
const onBatchStepFinish = z.enum(['exit', 'silent']);

const onShellCommandFinish = z.enum([
  'exit',
  'silent',
  'trim',
  'json',
  'yaml',
  'csv',
]);

const metadataStep = {
  name: stringCustomKey,
  title: stringTitle.optional(),
  description: stringDescription.optional(),
  motivation: stringMotivation.optional(),
};
const lineShell = z.string().min(1).max(300);
const advancedShell = z.object({
  ...metadataStep,
  onFailure: z.array(onShellCommandFinish).min(1).default(['exit']),
  onSuccess: z.array(onShellCommandFinish).min(1).default(['trim']),
  name: z.string().min(1).max(300),

  if: varValue.optional(),
  run: lineShell,
});

const commands = z.array(advancedShell).min(1).max(50);

const binary = z.object({
  title: stringTitle,
  description: stringDescription.optional(),
  motivation: stringMotivation.optional(),
  homepage: stringUrl.optional(),
  shell: z.object({ run: lineShell, diagnosis: lineShell }),
});
const valuesLoopEach = z.string().min(1).max(300);

const loopEach = z.object({
  name: stringCustomKey,
  values: valuesLoopEach,
});
const binaries = z.record(stringCustomKey, binary);

const variableStep = z.strictObject({
  a: z.literal('var'),
  ...metadataStep,
  value: varValue,
});

const onStringArraySuccess = z.enum(['sort', 'unique', 'filled', 'reverse']);

const stringArrayFilterBy = z.strictObject({
  if: z.enum([
    'starts-with',
    'ends-with',
    'contains',
    'equals',
    'not starts-with',
    'not ends-with',
    'not contains',
    'not equals',
  ]),
  anyOf: z.array(varValue).min(1).max(50),
});
const stringArrayStep = z.strictObject({
  a: z.literal('string-array'),
  ...metadataStep,
  value: varValue,
  onSuccess: onStringArraySuccess,
  filters: z.array(stringArrayFilterBy).min(1).max(20).optional(),
});

const concatArrayStep = z.strictObject({
  a: z.literal('concat-array'),
  ...metadataStep,
  values: z.array(varValue).min(1).max(20),
});

const joinArrayStep = z.strictObject({
  a: z.literal('join-array'),
  ...metadataStep,
  separator: z.string().min(1).max(80).default(' '),
  values: z.array(varValue).min(1).max(20),
});

const splitStringStep = z.strictObject({
  a: z.literal('split-string'),
  ...metadataStep,
  separator: z.string().min(1).max(80).default(' '),
  value: varValue,
});

const someTruthyArrayStep = z.strictObject({
  a: z.literal('some-truthy'),
  ...metadataStep,

  values: z.array(varValue).min(1).max(20),
});

const someFalsyArrayStep = z.strictObject({
  a: z.literal('some-falsy'),
  ...metadataStep,

  values: z.array(varValue).min(1).max(20),
});
const everyTruthyArrayStep = z.strictObject({
  a: z.literal('every-truthy'),
  ...metadataStep,

  values: z.array(varValue).min(1).max(20),
});
const everyFalsyArrayStep = z.strictObject({
  a: z.literal('every-falsy'),
  ...metadataStep,

  values: z.array(varValue).min(1).max(20),
});

const notStep = z.strictObject({
  a: z.literal('not'),
  ...metadataStep,

  value: varValue,
});

const rangeStep = z.strictObject({
  a: z.literal('range'),
  ...metadataStep,

  start: z.number().int().default(0),
  end: z.number().int(),
  step: z.number().int().default(1),
});
const invertObjectStep = z.strictObject({
  a: z.literal('invert-object'),
  ...metadataStep,

  value: varValue,
});
const anyBeforeStep = z.discriminatedUnion('a', [
  variableStep,
  stringArrayStep,
  concatArrayStep,
  joinArrayStep,
  splitStringStep,
  someTruthyArrayStep,
  someFalsyArrayStep,
  everyTruthyArrayStep,
  everyFalsyArrayStep,
  notStep,
  rangeStep,
  invertObjectStep,
]);

const batchStep = z.strictObject({
  a: z.literal('batch'),
  ...metadataStep,
  before: z.array(anyBeforeStep).min(1).max(20).optional(),
  if: varValue.optional(),
  each: z.array(loopEach).min(1).max(3).optional(),
  onFinish: z.array(onBatchStepFinish).min(1).optional(),
  commands: commands,
});
const steps = z.array(batchStep).min(1);
const parameter = z.object({
  description: stringDescription,
  flags: z.string().min(1).max(80),
  default: z.string().min(1).max(300).optional(),
  choices: z.array(z.string().min(1).max(300)).min(1).max(30).optional(),
});
const task = z.object({
  title: stringTitle,
  description: stringDescription.optional(),
  motivation: stringMotivation.optional(),
  parameters: z.record(stringCustomKey, parameter),
  steps,
  finally: steps.optional(),
});
const domain = z.object({
  title: stringTitle,
  description: stringDescription.optional(),
  tasks: z.record(stringCustomKey, task),
});
export const schema = z
  .object({
    engine,
    binaries,
    model: jsonishSchema,
    workflows: z.record(stringCustomKey, domain),
  })
  .strict();

interface ValidationError {
  message: string;
  path: string;
}

export type BuildModel = z.infer<typeof schema>;
export type TaskModel = z.infer<typeof task>;
export type BatchStepModel = z.infer<typeof batchStep>;
export type CommandOptionsModel = z.infer<typeof advancedShell>;

export type BuildModelValidation =
  | {
      status: 'valid';
      value: BuildModel;
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
          `I would check ${issue.unionErrors
            .flatMap((err) => err.issues)
            .map((i) => i.message)}`,
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
