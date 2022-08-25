
import type { Ctx } from "./batch-model.js";
import type { AnyBeforeStepModel, BatchStepModel } from "./build-model.js";
import { setDataValue } from "./data-value-utils.js";
import { getProperty } from 'dot-prop'

type BasicExecution =
  | {
      status: 'success';
      ctx: Ctx;
    }
  | {
      status: 'failure';
      messages: string[];
    };

const basicExecution2 = (ctx: Ctx, batchStep: BatchStepModel, beforeStep: AnyBeforeStepModel): BasicExecution => {
    const { a, name} = beforeStep;
    if (a === 'var') {
        const value = getProperty(ctx, beforeStep.value)
        if (typeof value === 'string' || typeof value === 'number')
        setDataValue(ctx, beforeStep.name, value)
    }
    return ctx;
}

const basicExecution = (ctx: Ctx, batchStep: BatchStepModel): BasicExecution => {

}