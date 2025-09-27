/**
 * Responsibilities: Generates short ids for task scoping and defines root id.
 */
export function IdGenerator() {
  let count = 1;
  return () => `T${count++}`;
}

export const rootId = 'R';
