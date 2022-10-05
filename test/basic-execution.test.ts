import { basicExecution } from '../src/basic-execution.js';
import { BatchStepModel, Ctx } from '../src/build-model.js';
import { buildModelExample, generateTask } from './fixture-build-model.js';
const ctx: Ctx = {
  build: buildModelExample,
  task: generateTask,
  runtime: {
    pwd: '/usr/path/baldrick-broth',
    project: {
      name: 'baldrick-broth',
    },
  },
  data: { status: 'created'},
};
const exampleBatchStep: BatchStepModel = {
  name: 'example-batch-step',
  a: 'batch',
  before: [
    {
      a: 'get-property',
      name: 'readProp',
      value: 'runtime.project.name',
    },
    {
      a: 'some-truthy',
      name: 'someTruthy',
      values: ['runtime.project.name', 'should.not.exist'],
    },
    {
      a: 'some-truthy',
      name: 'someImpossibleTruthy',
      values: ['should.not.exist.either', 'should.not.exist'],
    },
    {
      a: 'some-falsy',
      name: 'someFalsy',
      values: ['runtime.project.name', 'should.not.exist'],
    },
    {
      a: 'some-falsy',
      name: 'someImpossibleFalsy',
      values: ['runtime.project.name', 'runtime.pwd'],
    },
    {
      a: 'every-truthy',
      name: 'everyTruthy',
      values: ['runtime.project.name', 'runtime.pwd'],
    },
    {
      a: 'every-falsy',
      name: 'everyFalsy',
      values: ['should.not.exist.either', 'should.not.exist'],
    },
    {
      a: 'every-truthy',
      name: 'everyImpossibleTruthy',
      values: ['runtime.project.name', 'should.not.exist'],
    },
    {
      a: 'every-falsy',
      name: 'everyImpossibleFalsy',
      values: ['runtime.project.name', 'should.not.exist'],
    },
    {
      a: 'not',
      name: 'notTrue',
      value: 'runtime.project.name',
    },
    {
      a: 'not',
      name: 'notFalse',
      value: 'should.not.exist',
    },
    {
      a: 'split-string',
      name: 'splitted',
      separator: ' ',
      value: 'task.description',
    },
    {
      a: 'get-property',
      name: 'readPropCopy',
      value: 'data.generate.readProp',
    },
  ],
  commands: [],
};

console.log(JSON.stringify(exampleBatchStep))

describe('basic-execution', () => {
  it('should provide basic execution', () => {
    const actual = basicExecution(ctx, exampleBatchStep);
    expect(actual.status).toStrictEqual('success');
    expect(actual.status === 'success' && actual.ctx.data)
      .toMatchInlineSnapshot(`
      Map {
        "generate" => Map {
          "readProp" => "baldrick-broth",
          "someTruthy" => true,
          "someImpossibleTruthy" => false,
          "someFalsy" => true,
          "someImpossibleFalsy" => false,
          "everyTruthy" => true,
          "everyFalsy" => true,
          "everyImpossibleTruthy" => false,
          "everyImpossibleFalsy" => false,
          "notTrue" => false,
          "notFalse" => true,
          "splitted" => Array [
            "Generate",
            "code",
          ],
        },
      }
    `);
  });
});
