import { basicExecution } from '../src/basic-execution.js';
import { Ctx } from '../src/batch-model.js';
import { BatchStepModel } from '../src/build-model.js';
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
  data: new Map(),
};

const exampleBatchStep: BatchStepModel = {
  name: 'example-batch-step',
  a: 'batch',
  before: [
    {
      a: 'var',
      name: 'readProp',
      value: 'runtime.project.name',
    },
  ],
  commands: [],
};

describe('basic-execution', () => {
  it('should provide', () => {
    const actual = basicExecution(ctx, exampleBatchStep);
    expect(actual.status).toStrictEqual('success');
    expect(actual.status === 'success' && actual.ctx.data)
      .toMatchInlineSnapshot(`
      Map {
        "generate" => Map {
          "readProp" => "baldrick-broth",
        },
      }
    `);
  });
});
