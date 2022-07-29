import { safeParseBuild } from '../src/build-model';
import { buildModelExample } from './fixture-build-model';
// import { mutateObject, mutatorRules } from 'object-crumble'

//const mutate = mutateObject(mutatorRules);

describe('build-model', () => {
  it('should pass through a valid model', () => {
    const actual = safeParseBuild(buildModelExample);
    expect(actual.status).toStrictEqual('valid');
    expect(
      actual.status === 'valid' ? actual.value : actual.errors
    ).toMatchObject(buildModelExample);
  });

  // it('should be easily abstracted', ()=> {
  //   const abstractor = abstractObject([
  //   ]);
  //   const actual = abstractor(buildModelExample);
  //   expect(actual).toMatchInlineSnapshot()
  // })

  // it('should detect incorrect values', ()=> {
  //   const mutation = {
  //     path: "name",
  //     kind: "string",
  //     mutationName: "string => empty",
  //   };
    
  //   mutate(mutation)
  // })
});
