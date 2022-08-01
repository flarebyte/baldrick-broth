import { safeParseBuild } from '../src/build-model.js';
import { buildModelExample } from './fixture-build-model.js';

describe('build-model', () => {
  it('should pass through a valid model', () => {
    const actual = safeParseBuild(buildModelExample);
    expect(actual.status).toStrictEqual('valid');
    expect(
      actual.status === 'valid' ? actual.value : actual.errors
    ).toMatchObject(buildModelExample);
  });
});
