interface Success<a> {
    status: 'success';
    value: a;
  }
  interface Failure<e> {
    status: 'failure';
    error: e;
  }
  
  export type Result<a, e> = Success<a> | Failure<e>;
  
  interface fun<a, b> {
    (a: a): b;
  }
  
  export const succeed = <a>(a: a): Success<a> => ({ status: 'success', value: a });
  export const fail = <e>(e: e): Failure<e> => ({ status: 'failure', error: e });
  
  export const map =
    <a, b, e>(f: fun<a, b>): fun<Result<a, e>, Result<b, e>> =>
    (r) =>
      r.status == 'success' ? succeed(f(r.value)) : r;
  
  export const join = <a, e>(r: Result<Result<a, e>, e>): Result<a, e> =>
    r.status == 'failure' ? r : r.value;
  
  export const then =
    <a, b, e>(f: fun<a, Result<b, e>>) =>
    (r: Result<a, e>) =>
      join(map(f)(r));
  
  export const railRoad = <a, e>(r: Result<a, e>) => ({
    map: <b>(f: (a: a) => b) => railRoad<b, e>(map<a, b, e>(f)(r)),
    then: <b>(f: (a: a) => Result<b, e>) => railRoad(then(f)(r)),
  });
  