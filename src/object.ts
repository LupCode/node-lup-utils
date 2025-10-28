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

/**
 * Compares two objects and returns a new object containing all keys that have different values.
 * If two arrays are different, the entire new array is included in the result.
 * @param oldObj Old object to compare to.
 * @param newObj New object to compare from and from which to take values.
 * @param options Additional options for comparison.
 * @returns An object containing all keys that have different values (if value is missing in newObj, value is set to undefined).
 */
export function difference<O, N>(
  oldObj: O,
  newObj: N,
  options?: {
    /** Whether to ignore the order of items in arrays. */
    ignoreOrder?: boolean;

    /** Whether to perform a deep comparison of nested objects (does not apply to arrays). */
    recursive?: boolean;
  },
): Partial<O & N> {
  if (typeof oldObj !== 'object' || oldObj === null || typeof newObj !== 'object' || newObj === null) {
    return deepEqual(oldObj, newObj, !options?.ignoreOrder) ? (oldObj as any) : (newObj as any);
  }
  const diff: Partial<O & N> = {};
  const oldKeys = new Set<string>(Object.keys(oldObj));
  const newKeys = new Set<string>(Object.keys(newObj));

  // iterate old object
  for (const key of oldKeys) {
    newKeys.delete(key);
    const oldValue: any = (oldObj as any)[key]!;
    const newValue: any = (newObj as any)[key];

    // recursive difference
    if (options?.recursive && typeof oldValue === 'object' && oldValue !== null) {
      if (typeof newValue !== 'object' || newValue === null) {
        (diff as any)[key] = newValue;
        continue;
      }
      (diff as any)[key] = difference(oldValue, newValue, options);
      continue;
    }

    // flat difference
    if (!deepEqual(oldValue, newValue, !options?.ignoreOrder)) (diff as any)[key] = newValue;
  }

  // iterate new object
  for (const key of newKeys) {
    const newValue: any = (newObj as any)[key]!;
    (diff as any)[key] = newValue;
  }

  return diff;
}
