export function combineObjects<O, N>(
  oldObj: O,
  newObj: N,
  options?: {
    /** If true, undefined values in the new object will be ignored and won't overwrite the old values. */
    ignoreUndefined?: boolean;

    /** If true, arrays in the old and new object will be merged instead of replaced. */
    mergeArrays?: boolean;

    /** If true, performs a deep merge of nested objects. */
    recursive?: boolean;
  },
): O & N {
  if (Array.isArray(oldObj)) {
    if (Array.isArray(newObj)) {
      if (options?.mergeArrays) {
        return [...oldObj, ...newObj] as any;
      } else {
        return newObj as any;
      }
    } else {
      return (options?.ignoreUndefined && newObj === undefined ? oldObj : newObj) as any;
    }
  }

  if (typeof oldObj !== 'object' || oldObj === null || typeof newObj !== 'object' || newObj === null) {
    return (options?.ignoreUndefined && newObj === undefined ? oldObj : newObj) as any;
  }

  const result: any = { ...oldObj };
  for (const key of Object.keys(newObj)) {
    const newValue: any = (newObj as any)[key];
    const oldValue: any = (oldObj as any)[key];

    if (newValue === undefined && options?.ignoreUndefined) {
      continue;
    }

    if (options?.mergeArrays && Array.isArray(oldValue) && Array.isArray(newValue)) {
      result[key] = [...oldValue, ...newValue];
      continue;
    }

    if (
      options?.recursive &&
      typeof oldValue === 'object' &&
      oldValue !== null &&
      typeof newValue === 'object' &&
      newValue !== null
    ) {
      result[key] = combineObjects(oldValue, newValue, options);
      continue;
    }

    result[key] = options?.ignoreUndefined && newValue === undefined ? oldValue : newValue;
  }

  return result;
}

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
    /** If a key is not present in the new object, it will be ignored (by default the key is present and set to `undefined`). */
    ignoreRemovedKeys?: boolean;

    /** Whether to perform a deep comparison of nested objects (does not apply to arrays). */
    recursive?: boolean;

    /** Whether to strictly check the order of items in arrays (default false). */
    strictOrder?: boolean;
  },
): Partial<O & N> {
  if (typeof oldObj !== 'object' || oldObj === null || typeof newObj !== 'object' || newObj === null) {
    return deepEqual(oldObj, newObj, options?.strictOrder) ? (oldObj as any) : (newObj as any);
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
        if (newValue !== null || !options.ignoreRemovedKeys) (diff as any)[key] = newValue;
        continue;
      }
      (diff as any)[key] = difference(oldValue, newValue, options);
      continue;
    }

    // flat difference
    if (!deepEqual(oldValue, newValue, options?.strictOrder) && (!options?.ignoreRemovedKeys || newValue !== undefined))
      (diff as any)[key] = newValue;
  }

  // iterate new object
  for (const key of newKeys) {
    const newValue: any = (newObj as any)[key]!;
    (diff as any)[key] = newValue;
  }

  return diff;
}
