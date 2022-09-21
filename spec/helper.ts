import { abstractObject, mutateObject, mutatorRules } from 'object-crumble';

export const crumbleAbstractor = (value: object): object[] =>
  abstractObject([])(value);

type CrumbleWrappedFunction = (values: object[]) => object;

export const crumbleTumble =
  (config: Record<string, string>, table: Record<string, string>[]) =>
  (func: CrumbleWrappedFunction, values: object[]): object[] => {
    const signature = config['signature'];
    if (
      signature === undefined ||
      signature !== 'A' ||
      values[0] === undefined
    ) {
      throw new Error('Crumble should have a signature');
    }
    const value = values[0];
    let results = [];
    for (const row of table) {
      const mutated = mutateObject(mutatorRules)({
        path: `${row['path']}`,
        kind: 'string',
        mutationName: `${row['mutation']}`,
      })(value);
      const result = func([mutated]);
      results.push({
        title: `${row['path']} and ${row['mutation']}`,
        result: abstractObject([])(result),
      });
    }
    return results;
  };
