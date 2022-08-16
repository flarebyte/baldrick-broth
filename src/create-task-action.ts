import { BuildModel, TaskModel } from './build-model.js';

export const createTaskAction = (buildModel: BuildModel, taskModel: TaskModel) => (opts: any) => console.log(
  'createTaskAction',
  opts,
  Object.keys(buildModel.binaries),
  taskModel.title
);
