import { Ctx } from "./batch-model.js";
import { AnyBeforeStepModel } from "./build-model.js";
import { getProperty } from 'dot-prop'

export const pureExecution = (ctx: Ctx, beforeStep: AnyBeforeStepModel): Ctx => {
    const { a, name} = beforeStep;
    if (a === 'var') {
        const value = getProperty(ctx, beforeStep.value) 
        ctx.data['task'][name] = value;
    }
    return ctx;
}