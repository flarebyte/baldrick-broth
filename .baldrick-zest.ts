import { run } from 'baldrick-zest-engine';
import { defaultZestConfig } from 'baldrick-zest-mess';

async function doImport<A>(path: string) {
  const func: A = await import(path);
  return func;
}

const config = defaultZestConfig({
  inject: { doImport },
  specFile: 'spec/build-model/safe-parse-build.zest.yaml',
});

await run(config);
