import { safeParseBuild } from '../src/build-model';

describe('build-model', () => {
  it('should fail if model is empty', () => {
    const actual = safeParseBuild({});
    expect(actual).toMatchInlineSnapshot(`
      Object {
        "error": [ZodError: [
        {
          "code": "invalid_type",
          "expected": "object",
          "received": "undefined",
          "path": [
            "engine"
          ],
          "message": "Required"
        },
        {
          "code": "invalid_type",
          "expected": "object",
          "received": "undefined",
          "path": [
            "binaries"
          ],
          "message": "Required"
        },
        {
          "code": "invalid_type",
          "expected": "object",
          "received": "undefined",
          "path": [
            "variables"
          ],
          "message": "Required"
        },
        {
          "code": "invalid_type",
          "expected": "object",
          "received": "undefined",
          "path": [
            "domains"
          ],
          "message": "Required"
        }
      ]],
        "success": false,
      }
    `);
  });
});
