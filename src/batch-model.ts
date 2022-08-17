import { JsonValue } from 'type-fest';
import { BuildModel, TaskModel } from './build-model.js';

type AnyRootsetValue = string | boolean | Record<string, string>[] | JsonValue;
type BatchValues = Record<string, AnyRootsetValue>;
export interface Ctx {
  build: BuildModel;
  task: TaskModel;
  data: Record<string, BatchValues>;
}
