export function IdGenerator() {
    var count = 1;
    return function () {
        return `T${count++}`;
    }
}

export const rootId='R'