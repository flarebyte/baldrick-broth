import { z } from 'zod';
import { stringy } from './field-validation.js';
import { formatMessage, ValidationError } from './format-message.js';
import { Result, succeed, fail } from './railway.js';

/**JSON like */
const literalSchema = z.union([z.string().min(1), z.number(), z.boolean()]);
type Literal = z.infer<typeof literalSchema>;
type Json = Literal | { [key: string]: Json } | Json[];
const jsonishSchema: z.ZodType<Json> = z
  .lazy(() =>
    z.union([literalSchema, z.array(jsonishSchema), z.record(jsonishSchema)])
  )
  .describe('Any JSON document without null values');
const engine = z
  .object({
    telemetry: z
      .object({
        name: z.string().min(1).max(40).optional(),
        verbosity: z.string().max(100),
        filepath: stringy.path,
      })
      .describe('Preferences for telemetry'),
  })
  .optional()
  .describe('Settings for the baldrick-broth engine');
const onBatchStepFinish = z.enum(['exit', 'silent']);

const onShellCommandFinish = z.enum([
  'exit',
  'silent',
  'trim',
  'json',
  'yaml',
  'csv',
]);

const linkPage = z
  .object({
    title: stringy.title,
    url: stringy.url,
  })
  .describe('Info about a link');

const links = z.array(linkPage).optional().describe('A list of useful links');

const metadataStep = {
  name: stringy.customKey.describe(
    'A short name that could be used a key or variable for the step'
  ),
  title: stringy.title.optional(),
  description: stringy.description.optional(),
  motivation: stringy.motivation.optional(),
  links,
};
const lineShell = z.string().min(1).max(300).describe('A line of shell script');
const advancedShell = z
  .object({
    ...metadataStep,
    onFailure: z
      .array(onShellCommandFinish)
      .min(1)
      .default(['exit'])
      .describe(
        'List of flags to describe the default behavior in case of failure'
      ),
    onSuccess: z
      .array(onShellCommandFinish)
      .min(1)
      .default(['trim'])
      .describe(
        'List of flags to describe the default behavior in case of success'
      ),
    name: lineShell,

    if: stringy.varValue
      .optional()
      .describe(
        'reference to JSON path that must be satisfied for the step to run'
      ),
    stdin: stringy.varValue
      .optional()
      .describe('Provide stdin with a value read from a dot prop path'),

    run: lineShell,
  })
  .describe('Configuration for the batch shell script');

const commands = z
  .array(advancedShell)
  .min(1)
  .max(50)
  .describe('A list of batch shell scripts to run');

const valuesLoopEach = z.string().min(1).max(300);

const loopEach = z
  .object({
    name: stringy.customKey,
    values: valuesLoopEach,
  })
  .describe('Configuration of every loop');

const getPropertyStep = z
  .strictObject({
    a: z.literal('get-property'),
    ...metadataStep,
    value: stringy.varValue,
  })
  .describe('Get a property using a dot prop path');

const onStringArraySuccess = z.enum(['sort', 'unique', 'filled', 'reverse']);

const stringArrayFilterBy = z
  .strictObject({
    if: z
      .enum([
        'starts-with',
        'ends-with',
        'contains',
        'equals',
        'not starts-with',
        'not ends-with',
        'not contains',
        'not equals',
      ])
      .describe('Filter criteria'),
    anyOf: z
      .array(stringy.varValue)
      .min(1)
      .max(50)
      .describe('A list of references to match against'),
  })
  .describe('Filter an array of strings');
const stringArrayStep = z
  .strictObject({
    a: z.literal('string-array'),
    ...metadataStep,
    value: stringy.varValue,
    onSuccess: onStringArraySuccess,
    filters: z
      .array(stringArrayFilterBy)
      .min(1)
      .max(20)
      .optional()
      .describe('A list of filters on strings'),
  })
  .describe('Process on a list of strings');

const concatArrayStep = z
  .strictObject({
    a: z.literal('concat-array'),
    ...metadataStep,
    values: z.array(stringy.varValue).min(1).max(20),
  })
  .describe('Concatenate several arrays together');

const splitStringStep = z
  .strictObject({
    a: z.literal('split-string'),
    ...metadataStep,
    separator: z
      .string()
      .min(1)
      .max(80)
      .default(' ')
      .describe('A separator to split the string'),
    value: stringy.varValue,
  })
  .describe('Split a string into multiple strings');

const someTruthyArrayStep = z
  .strictObject({
    a: z.literal('some-truthy'),
    ...metadataStep,

    values: z.array(stringy.varValue).min(1).max(20),
  })
  .describe('Return true if at least one of values is truthy');

const someFalsyArrayStep = z
  .strictObject({
    a: z.literal('some-falsy'),
    ...metadataStep,

    values: z.array(stringy.varValue).min(1).max(20),
  })
  .describe('Return true if at least one of values is falsy');
const everyTruthyArrayStep = z
  .strictObject({
    a: z.literal('every-truthy'),
    ...metadataStep,

    values: z.array(stringy.varValue).min(1).max(20),
  })
  .describe('Return true if all the values are truthy');

const everyFalsyArrayStep = z
  .strictObject({
    a: z.literal('every-falsy'),
    ...metadataStep,

    values: z.array(stringy.varValue).min(1).max(20),
  })
  .describe('Return true if all the values are falsy');

const notStep = z
  .strictObject({
    a: z.literal('not'),
    ...metadataStep,

    value: stringy.varValue,
  })
  .describe('Return the opposite boolean value');

const rangeStep = z
  .strictObject({
    a: z.literal('range'),
    ...metadataStep,

    start: z
      .number()
      .int()
      .default(0)
      .describe('The number to start the range with'),
    end: z.number().int().describe('The number at the end of the range'),
    step: z
      .number()
      .int()
      .default(1)
      .describe('A step to increment the range, usually 1'),
  })
  .describe('Generate a range of numbers');
const invertObjectStep = z
  .strictObject({
    a: z.literal('invert-object'),
    ...metadataStep,

    value: stringy.varValue,
  })
  .describe('Invert keys and values into a new object');
const anyBeforeStep = z
  .discriminatedUnion('a', [
    getPropertyStep,
    stringArrayStep,
    concatArrayStep,
    splitStringStep,
    someTruthyArrayStep,
    someFalsyArrayStep,
    everyTruthyArrayStep,
    everyFalsyArrayStep,
    notStep,
    rangeStep,
    invertObjectStep,
  ])
  .describe('An operation on the context');

const batchStep = z
  .strictObject({
    a: z.literal('batch'),
    ...metadataStep,
    before: z
      .array(anyBeforeStep)
      .min(1)
      .max(20)
      .optional()
      .describe('A list of operations to run before end'),
    if: stringy.varValue
      .optional()
      .describe('A condition that must be satisfied to enable the batch'),
    each: z
      .array(loopEach)
      .min(1)
      .max(3)
      .optional()
      .describe('The same batch will be run multiple times for each loop'),
    onFinish: z
      .array(onBatchStepFinish)
      .min(1)
      .optional()
      .describe('Expected behavior when the batch finishes'),
    commands,
  })
  .describe('A batch of shell commands to run');
const steps = z.array(batchStep).min(1);
const parameter = z
  .object({
    description: stringy.description,
    flags: z.string().min(1).max(80),
    default: z.string().min(1).max(300).optional(),
  })
  .describe('Settings for a task parameter');
const task = z
  .object({
    name: z.string().max(1).default(''),
    title: stringy.title,
    description: stringy.description.optional(),
    motivation: stringy.motivation.optional(),
    parameters: z.record(stringy.customKey, parameter),
    steps,
    finally: steps.optional(),
  })
  .describe('Settings for a task');
const domain = z
  .object({
    title: stringy.title,
    description: stringy.description.optional(),
    tasks: z.record(stringy.customKey, task),
  })
  .describe('A domain for a list of tasks');
export const schema = z
  .object({
    engine,
    model: jsonishSchema,
    workflows: z.record(stringy.customKey, domain),
  })
  .describe('Settings for a baldrick-broth file')
  .strict();

const runtimeContext = z.object({
  pwd: stringy.path,
  project: z.object({
    name: stringy.title,
  }),
});
const context = z.object({
  build: schema,
  task,
  runtime: runtimeContext,
  data: z.record(stringy.propPath, jsonishSchema),
});

export type BuildModel = z.infer<typeof schema>;
export type TaskModel = z.infer<typeof task>;
export type BatchStepModel = z.infer<typeof batchStep>;
export type CommandOptionsModel = z.infer<typeof advancedShell>;
export type AnyBasicStepModel = z.infer<typeof anyBeforeStep>;
export type Ctx = z.infer<typeof context>;
export type RuntimeContext = z.infer<typeof runtimeContext>;
export type AnyDataValue = z.infer<typeof jsonishSchema>;

export type BuildModelValidation = Result<BuildModel, ValidationError[]>;

export const safeParseBuild = (content: unknown): BuildModelValidation => {
  const result = schema.safeParse(content);
  if (result.success) {
    return succeed(result.data);
  }
  const {
    error: { issues },
  } = result;
  const errors = issues.map(formatMessage);
  return fail(errors);
};

export const getSchema = (_name: 'default') => {
  return schema;
};

export const unsafeParse =
  (config: Record<string, string>) => (content: unknown) => {
    const name = `${config['model']}`.trim();
    if (name === 'context') {
      context.parse(content);
      return content;
    }
    if (name === 'batchStep') {
      batchStep.parse(content);
      return content;
    }
    return `${name} is not supported (979839)`;
  };
