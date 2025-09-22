import { z } from 'zod';
import { stringy } from './field-validation.js';
import { formatMessage, type ValidationError } from './format-message.js';
import { type Result, succeed, willFail } from './railway.js';

const describeEnum = (intro: string, objectValue: { [k: string]: string }) => {
  const description = [`${intro} with either:`];
  for (const [name, title] of Object.entries(objectValue)) {
    description.push(`${name}: ${title}`);
  }
  return description.join('\n');
};

const asEnumKeys = (value: object) =>
  Object.keys(value) as [string, ...string[]];

/** JSON like */
const literalSchema = z.union([z.string().min(1), z.number(), z.boolean()]);
type Literal = z.infer<typeof literalSchema>;
type Json = Literal | { [key: string]: Json } | Json[];
const jsonishSchema: z.ZodType<Json> = z
  .lazy(() =>
    z.union([literalSchema, z.array(jsonishSchema), z.record(jsonishSchema)]),
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

const onShellCommandFinishEnum = {
  exit: 'Exit the shell after the command has finished.',
  silent: 'Suppress any output from the command.',
  trim: 'Remove any leading or trailing whitespace from the output.',
  json: 'Format the output as a JSON object.',
  yaml: 'Format the output as a YAML object.',
  csv: 'Format the output as a CSV file.',
  save: 'Save the output to a file.',
  debug: 'Print debugging information about the command execution.',
};

const onShellCommandFinish = z
  .enum(asEnumKeys(onShellCommandFinishEnum))
  .describe(
    describeEnum(
      'Options for when the shell command finish',
      onShellCommandFinishEnum,
    ),
  );

const linkPage = z
  .object({
    title: stringy.title,
    url: stringy.url,
  })
  .describe('Info about a link');

const links = z.array(linkPage).optional().describe('A list of useful links');

const metadataStep = {
  name: stringy.customKey.describe(
    'A short name that could be used a key or variable for the step',
  ),
  title: stringy.title,
  description: stringy.description.optional(),
  motivation: stringy.motivation.optional(),
  links,
};

const metadataCore = {
  name: stringy.customKey
    .describe('A short name that could be used a key or variable')
    .optional(),
  title: stringy.title,
  description: stringy.description.optional(),
  motivation: stringy.motivation.optional(),
  links,
};

const lineShell = z.string().min(1).max(300).describe('A line of shell script');
const advancedShell = z
  .object({
    ...metadataCore,
    a: z.literal('shell').default('shell'),
    onFailure: z
      .array(onShellCommandFinish)
      .min(1)
      .default(['exit'])
      .describe(
        'List of flags to describe the default behavior in case of failure',
      ),
    onSuccess: z
      .array(onShellCommandFinish)
      .min(1)
      .default(['trim'])
      .describe(
        'List of flags to describe the default behavior in case of success',
      ),

    if: stringy.varValue
      .optional()
      .describe(
        'reference to JSON path that must be satisfied for the step to run',
      ),
    stdin: stringy.varValue
      .optional()
      .describe('Provide stdin with a value read from a dot prop path'),

    run: lineShell,
    multiline: z
      .boolean()
      .default(false)
      .describe('Should the run command spread on multiple lines'),
  })
  .describe('Configuration for the batch shell script');

const valuesLoopEach = z.string().min(1).max(300);

const loopEach = z
  .object({
    name: stringy.customKey.describe(
      'The name of the variable to be used as an input to the script or command during each iteration',
    ),
    values: valuesLoopEach.describe(
      'The variable to the array of values to be iterated over',
    ),
  })
  .describe('Configuration of every loop');

const getPropertyStep = z
  .strictObject({
    a: z.literal('get-property'),
    ...metadataStep,
    value: stringy.varValue,
  })
  .describe('Get a property using a dot prop path');

const onStringArraySuccessEnum = {
  sort: 'Sorts the array of strings in ascending order.',
  unique: 'Removes any duplicate strings from the array.',
  filled: 'Removes any empty or undefined elements from the array.',
  reverse: 'Reverses the order of the elements in the array.',
};

const onStringArraySuccess = z
  .enum(asEnumKeys(onStringArraySuccessEnum))
  .describe(
    describeEnum(
      'Options for the transforming the resulting array of string',
      onStringArraySuccessEnum,
    ),
  );

const stringArrayFilterByEnum = {
  'starts-with': 'Match items that start with a specific value',
  'ends-with': 'Match items that end with a specific value',
  contains: 'Match items that contain a specific value',
  equals: 'Match items that are equal to a specific value',
  'not starts-with': 'Match items that do not start with a specific value',
  'not ends-with': 'Match items that do not end with a specific value',
  'not contains': 'Match items that do not contain a specific value',
  'not equals': 'Match items that are not equal to a specific value',
};

const stringArrayFilterBy = z
  .strictObject({
    if: z
      .enum(asEnumKeys(stringArrayFilterByEnum))
      .describe(
        describeEnum(
          'A conditional statement that determines whether or not the string should be kept',
          stringArrayFilterByEnum,
        ),
      ),
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

const splitLinesStep = z
  .strictObject({
    a: z.literal('split-lines'),
    ...metadataStep,
    value: stringy.varValue,
  })
  .describe('Split a string into multiple lines');

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
const maskJsonStep = z
  .strictObject({
    a: z.literal('mask-object'),
    ...metadataStep,

    value: stringy.varValue,
    mask: z
      .string()
      .min(1)
      .max(100)
      .describe('JSON mask to select parts of the json object'),
  })
  .describe('Uses JSON mask to select parts of the json object');

const inputPromptStep = z
  .strictObject({
    a: z.literal('prompt-input'),
    ...metadataStep,

    message: stringy.promptMessage,
  })
  .describe('Prompt that takes user input and returns a string');

const passwordPromptStep = z
  .strictObject({
    a: z.literal('prompt-password'),
    ...metadataStep,

    message: stringy.promptMessage,
  })
  .describe(
    'Prompt that takes user input, hides it from the terminal, and returns a string',
  );
const confirmPromptStep = z
  .strictObject({
    a: z.literal('prompt-confirm'),
    ...metadataStep,

    message: stringy.promptMessage,
  })
  .describe('Prompt that returns true or false');

const selectPromptStep = z
  .strictObject({
    a: z.literal('prompt-select'),
    ...metadataStep,

    message: stringy.promptMessage,
    select: stringy.varValue,
  })
  .describe('Prompt that allows the user to select from a list of options');
const choicePromptStep = z
  .strictObject({
    a: z.literal('prompt-choices'),
    ...metadataStep,

    message: stringy.promptMessage,
    choices: z.array(stringy.varValue).min(2).max(30),
  })
  .describe('Prompt that allows the user to choose an option');

const templateStep = z
  .strictObject({
    a: z.literal('template'),
    ...metadataStep,

    template: z
      .string()
      .min(1)
      .max(5000)
      .describe(
        'Resolve the handlebars template as a atring. https://handlebarsjs.com/guide/',
      ),
  })
  .describe('Uses JSON mask to select parts of the json object');

const appendToFileStep = z
  .strictObject({
    a: z.literal('append-to-file'),
    ...metadataStep,

    value: stringy.varValue,
    filename: z
      .string()
      .min(1)
      .max(200)
      .describe('The name of the file to which data will be appended'),
  })
  .describe('Step where data is appended to a file');

const writeToFileStep = z
  .strictObject({
    a: z.literal('write-to-file'),
    ...metadataStep,

    value: stringy.varValue,
    filename: z
      .string()
      .min(1)
      .max(200)
      .describe('The name of the file to which data will be written'),
  })
  .describe('Step where data is written to a file');
const anyCommand = z
  .union([
    z.discriminatedUnion('a', [
      getPropertyStep,
      stringArrayStep,
      concatArrayStep,
      splitStringStep,
      splitLinesStep,
      someTruthyArrayStep,
      someFalsyArrayStep,
      everyTruthyArrayStep,
      everyFalsyArrayStep,
      notStep,
      rangeStep,
      invertObjectStep,
      maskJsonStep,
      templateStep,
      inputPromptStep,
      confirmPromptStep,
      passwordPromptStep,
      selectPromptStep,
      choicePromptStep,
      appendToFileStep,
      writeToFileStep,
    ]),
    advancedShell,
  ])
  .describe('A command to be run');

const commands = z
  .array(anyCommand)
  .min(1)
  .max(50)
  .describe('A list of batch shell scripts to run');

const batchStepNameEmum = {
  unknown:
    'Describe any unknown or uncertain aspects of the process (should not pick this)',
  main: 'Describe the main step of the process',
  before: 'Describe a step that need to be taken before the process begins',
  after: 'Describe a step that need to be taken after the process is completed',
};

const batchStep = z
  .strictObject({
    name: z
      .enum(asEnumKeys(batchStepNameEmum))
      .default('unknown')
      .describe(describeEnum('Name of the step', batchStepNameEmum)),
    if: stringy.varValue
      .optional()
      .describe(
        'A conditional statement that determines whether or not this script or command should be executed',
      ),
    each: z
      .array(loopEach)
      .min(1)
      .max(3)
      .optional()
      .describe(
        'An array of values to be iterated over, with each iteration executing the script or command with the current value as an input',
      ),
    commands,
  })
  .describe('A batch of shell commands to run');
const parameter = z
  .object({
    description: stringy.description,
    flags: z.string().min(1).max(80),
    default: z.string().min(1).max(300).optional(),
  })
  .describe('Settings for a task parameter');
const task = z
  .object({
    name: z
      .string()
      .max(1)
      .default('')
      .describe('A unique identifier for this task'),
    title: stringy.title.describe(
      'A brief and descriptive title for this task',
    ),
    description: stringy.description
      .optional()
      .describe(
        'A detailed explanation of the purpose and function of this task',
      ),
    motivation: stringy.motivation
      .optional()
      .describe(
        'The reason why this task is necessary within the context of the workflow',
      ),
    links: links.describe(
      'A list of relevant resources and references related to this task',
    ),
    parameters: z
      .array(parameter)
      .max(20)
      .optional()
      .describe('A list of configurable options for this task'),
    main: batchStep.describe(
      'The primary script or command to be executed for this task',
    ),
    before: batchStep.optional(),
    after: batchStep.optional(),
  })
  .describe('Settings for a task');
const domain = z
  .object({
    title: stringy.title.describe(
      'A brief and descriptive title for this workflow',
    ),
    description: stringy.description
      .optional()
      .describe(
        'A detailed explanation of the purpose and function of this workflow',
      ),
    tasks: z
      .record(stringy.customKey, task)
      .describe('A list of individual tasks that make up this workflow'),
  })
  .describe('A domain for a list of tasks');

const workflows = z
  .record(stringy.customKey, domain)
  .describe(
    'A collection of related tasks and processes that achieve a specific goal',
  );
export const schema = z
  .object({
    engine,
    model: jsonishSchema,
    workflows,
  })
  .describe('Settings for a baldrick-broth file')
  .strict();

const lightSchema = z
  .object({
    engine,
    workflows,
  })
  .describe('Settings for a baldrick-broth file');

const runtimeContext = z.object({
  pwd: stringy.path,
  project: z.object({
    name: stringy.title,
  }),
  parameters: z.record(z.string(), z.string().or(z.boolean())),
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
export type AnyCommand = z.infer<typeof anyCommand>;
// Export type CommandOptionsModel = z.infer<typeof advancedShell>;
export type onCommandSuccess = z.infer<typeof onShellCommandFinish>;
export type onCommandFailure = z.infer<typeof onShellCommandFinish>;
export type Ctx = z.infer<typeof context>;
export type RuntimeContext = z.infer<typeof runtimeContext>;
export type AnyDataValue = z.infer<typeof jsonishSchema>;
export type OnShellCommandFinish = z.infer<typeof onShellCommandFinish>;

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
  return willFail(errors);
};

/** Only used by conversion to json schema */
export const getSchema = (_name: 'default') => {
  return lightSchema;
};

export const unsafeParse =
  (config: Record<string, string>) => (content: unknown) => {
    // biome-ignore lint/complexity/useLiteralKeys: index signature requires bracket access
    const name = `${config['model']}`.trim();
    if (name === 'context') {
      context.parse(content);
      return content;
    }

    if (name === 'batchStep') {
      batchStep.parse(content);
      return content;
    }

    if (name === 'commands') {
      z.array(anyCommand).parse(content);
      return content;
    }

    return `${name} is not supported (979839)`;
  };
