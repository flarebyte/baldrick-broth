import type { JsonValue } from 'type-fest';
import type { BuildModel, TaskModel } from './build-model.js';

export type AnyDataValue = string | boolean | number | JsonValue;

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
  data: Record<string, AnyDataValue>;
}

export type BuildCtx = Pick<Ctx, 'build' | 'task'>;
