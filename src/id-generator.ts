export function IdGenerator() {
  let count = 1;
  return function () {
    return `T${count++}`;
  };
}

export const rootId = 'R';
