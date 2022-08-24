import type { JsonValue } from 'type-fest';
import type { BuildModel, TaskModel } from './build-model.js';

type AnyRootsetValue = string | boolean | Record<string, string>[] | JsonValue;
type BatchValues = Record<string, AnyRootsetValue>;

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
  data: Record<string, BatchValues>;
}

export type BuildCtx = Pick<Ctx, 'build' | 'task'>;
