export function IdGenerator() {
  let count = 1;
  return () => `T${count++}`;
}

export const rootId = 'R';
