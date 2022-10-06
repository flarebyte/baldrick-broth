import { run } from 'baldrick-zest-engine';
import { defaultZestConfig } from 'baldrick-zest-mess';

async function doImport<A>(path: string) {
  const func: A = await import(path);
  return func;
}

const toConfig = (specFile: string) =>
  defaultZestConfig({
    inject: { doImport },
    specFile,
  });

const configs = [
  'spec/build-model/safe-parse-build.zest.yaml',
  'spec/basic-execution/basic-execution.zest.yaml',
  'spec/build-model/get-schema.zest.yaml',
].map(toConfig);

for (const config of configs) {
  await run(config);
}
