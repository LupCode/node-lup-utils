/**
 * Deeply compares two values for equality.
 * @param a Object to compare.
 * @param b Object to compare.
 * @param strictOrder If true, the order of items in arrays as well as object keys matters.
 * @returns True if the objects are equal, false otherwise.
 */
export function deepEqual(a: any, b: any, strictOrder: boolean = false): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false;
    if (strictOrder) {
      for (let i = 0; i < a.length; i++) {
        if (!deepEqual(a[i], b[i], strictOrder)) return false;
      }
    } else {
      const bRemaining = [...b];
      for (const itemA of a) {
        const indexB = bRemaining.findIndex((itemB) => deepEqual(itemA, itemB, strictOrder));
        if (indexB === -1) return false;
        bRemaining.splice(indexB, 1);
      }
    }
    return true;
  }
  if (typeof a === 'object' && a !== null && b !== null) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    if (strictOrder && !deepEqual(keysA, keysB, strictOrder)) return false;
    for (const key of keysA) {
      if (!deepEqual(a[key], b[key], strictOrder)) return false;
    }
    return true;
  }
  return false;
}
