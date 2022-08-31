import { safeParseBuild } from '../src/build-model.js';
import { buildModelExample } from './fixture-build-model.js';

// node --loader ts-node/esm test/build-model.test.ts

const testThisOne = () => {
  const actual = safeParseBuild(buildModelExample);
  const advancedActual =
    actual.status === 'valid' ? actual.value : actual.errors;
  console.log(advancedActual);
};

testThisOne();
