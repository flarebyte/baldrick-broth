import type { JsonValue } from 'type-fest';
import type { BuildModel, TaskModel } from './build-model.js';

export type AnyDataValue = string | boolean | number | JsonValue;
export type BatchValues = Map<string, AnyDataValue>;

export interface RuntimeContext {
  pwd: string;
  project: {
    name: string;
  };
}

export interface Ctx {
  build: BuildModel;
  task: TaskModel;
  runtime: RuntimeContext;
  data: Map<string, BatchValues>;
}

export type BuildCtx = Pick<Ctx, 'build' | 'task'>;
