import { combineObjects, deepEqual, difference } from '../object';

test('combineObjects()', async () => {
  expect(combineObjects(undefined, undefined)).toBeUndefined();
  expect(combineObjects(undefined, 5)).toBe(5);
  expect(combineObjects(5, undefined)).toBeUndefined();
  expect(combineObjects(5, undefined, { ignoreUndefined: true })).toBe(5);
  expect(combineObjects(5, 10)).toBe(10);
  expect(combineObjects(5, 0, { ignoreUndefined: true })).toBe(0);

  expect(combineObjects([1, 2], [3, 4])).toEqual([3, 4]);
  expect(combineObjects([1, 2], [3, 4], { mergeArrays: true })).toEqual([1, 2, 3, 4]);

  expect(combineObjects({ a: 1, b: 2 }, { b: 3, c: 4 })).toEqual({ a: 1, b: 3, c: 4 });
  expect(combineObjects({ a: 1, b: 2 }, { b: undefined, c: 4 }, { ignoreUndefined: false })).toEqual({
    a: 1,
    b: undefined,
    c: 4,
  });
  expect(combineObjects({ a: 1, b: 2 }, { b: undefined, c: 4 }, { ignoreUndefined: true })).toEqual({
    a: 1,
    b: 2,
    c: 4,
  });

  expect(combineObjects({ a: 1, b: { c: 5, d: 6 } }, { b: { e: 7 } }, { recursive: false })).toEqual({
    a: 1,
    b: { e: 7 },
  });
  expect(combineObjects({ a: 1, b: { c: 5, d: 6 } }, { b: { e: 7 } }, { recursive: true })).toEqual({
    a: 1,
    b: { c: 5, d: 6, e: 7 },
  });

  expect(combineObjects({ a: [1, 2], b: 2 }, { a: [3, 4] }, { mergeArrays: true })).toEqual({ a: [1, 2, 3, 4], b: 2 });
});

test('deepEqual()', async () => {
  // Primitive values (true)
  expect(deepEqual(undefined, undefined)).toBe(true);
  expect(deepEqual(null, null)).toBe(true);
  expect(deepEqual(true, true)).toBe(true);
  expect(deepEqual(false, false)).toBe(true);
  expect(deepEqual(42, 42)).toBe(true);
  expect(deepEqual(0.125, 0.125)).toBe(true);
  expect(deepEqual(8, 8.0)).toBe(true);
  expect(deepEqual('', '')).toBe(true);
  expect(deepEqual('hello', 'hello')).toBe(true);

  // Primitive values (false)
  expect(deepEqual(true, false)).toBe(false);
  expect(deepEqual(null, undefined)).toBe(false);
  expect(deepEqual(null, false)).toBe(false);
  expect(deepEqual(false, undefined)).toBe(false);
  expect(deepEqual(42, '42')).toBe(false);
  expect(deepEqual(8, 8.1)).toBe(false);
  expect(deepEqual('hello', 'world')).toBe(false);
  expect(deepEqual('true', true)).toBe(false);
  expect(deepEqual('false', false)).toBe(false);

  // Array strict order (true)
  expect(deepEqual([], [], true)).toBe(true);
  expect(deepEqual([1, 2, 3], [1, 2, 3], true)).toBe(true);
  expect(deepEqual(['a', 'b', 'c'], ['a', 'b', 'c'], true)).toBe(true);
  expect(deepEqual([1, [2, 3]], [1, [2, 3]], true)).toBe(true);

  // Array strict order (false)
  expect(deepEqual([1], [], true)).toBe(false);
  expect(deepEqual([], [[]], true)).toBe(false);
  expect(deepEqual([1, 2, 3], [3, 2, 1], true)).toBe(false);
  expect(deepEqual(['a', 'b', 'c'], ['c', 'b', 'a'], true)).toBe(false);
  expect(deepEqual([1, [2, 3]], [[1, 2], 3], true)).toBe(false);
  expect(deepEqual([1, 2, 3], [4, 5, 6], true)).toBe(false);

  // Array unordered (true)
  expect(deepEqual([], [], false)).toBe(true);
  expect(deepEqual([1, 2, 3], [3, 2, 1], false)).toBe(true);
  expect(deepEqual(['a', 'b', 'c'], ['c', 'b', 'a'], false)).toBe(true);
  expect(deepEqual([1, [2, 3]], [[3, 2], 1], false)).toBe(true);

  // Array unordered (false)
  expect(deepEqual([], [1], false)).toBe(false);
  expect(deepEqual([[]], [], false)).toBe(false);
  expect(deepEqual([1, 2, 3], [4, 5, 6], false)).toBe(false);
  expect(deepEqual([1, 2, 2], [2, 1, 1], false)).toBe(false);

  // Object strict order (true)
  expect(deepEqual({}, {}, true)).toBe(true);
  expect(deepEqual({ a: 1, b: 2 }, { a: 1, b: 2 }, true)).toBe(true);
  expect(deepEqual({ a: 1, b: { c: 3 } }, { a: 1, b: { c: 3 } }, true)).toBe(true);
  expect(deepEqual({ a: [1, 2], b: 3 }, { a: [1, 2], b: 3 }, true)).toBe(true);

  // Object strict order (false)
  expect(deepEqual({ a: 1 }, { b: 2 }, true)).toBe(false);
  expect(deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 }, true)).toBe(false);
  expect(deepEqual({ a: 1, b: { c: 3 } }, { b: { c: 3 }, a: 1 }, true)).toBe(false);
  expect(deepEqual({ a: [1, 2], b: 3 }, { b: 3, a: [1, 2] }, true)).toBe(false);
  expect(deepEqual({ a: 1, b: 2 }, { a: 1, b: 3 }, true)).toBe(false);

  // Object unordered (true)
  expect(deepEqual({}, {}, false)).toBe(true);
  expect(deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 }, false)).toBe(true);
  expect(deepEqual({ a: 1, b: { c: 3 } }, { b: { c: 3 }, a: 1 }, false)).toBe(true);
  expect(deepEqual({ a: [1, 2], b: 3 }, { b: 3, a: [1, 2] }, false)).toBe(true);

  // Object unordered (false)
  expect(deepEqual({ b: 2 }, { b: 3 }, false)).toBe(false);
  expect(deepEqual({ a: 1, b: 2 }, { a: 1, b: 3 }, false)).toBe(false);
  expect(deepEqual({ a: 1, b: 2 }, { a: 1 })).toBe(false);
  expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
});

test('difference()', async () => {
  expect(difference({}, {}, { recursive: false, strictOrder: true })).toEqual({});
  expect(difference({ a: 1 }, { a: 1 }, { recursive: false, strictOrder: true })).toEqual({});
  expect(difference({ a: 1 }, { a: 2 }, { recursive: false, strictOrder: true })).toEqual({ a: 2 });
  expect(difference({ a: 1, b: 2 }, { a: 1 }, { recursive: false, strictOrder: true })).toEqual({ b: undefined });
  expect(difference({ a: 1 }, { a: 1, b: 2 }, { recursive: false, strictOrder: true })).toEqual({ b: 2 });
  expect(
    difference(
      { a: { b: 2, c: { d: 3, e: 4 } } },
      { a: { b: 2, c: { d: 3, e: 4 } } },
      { recursive: false, strictOrder: true },
    ),
  ).toEqual({});
  expect(
    difference(
      { a: { b: 2, c: { d: 3, e: 4 } } },
      { a: { b: 3, c: { d: 3, e: 4 } } },
      { recursive: false, strictOrder: true },
    ),
  ).toEqual({ a: { b: 3, c: { d: 3, e: 4 } } });
  expect(
    difference(
      { a: { b: 2, c: { d: 3, e: 4 } } },
      { a: { b: 2, c: { d: 3, e: 5 } } },
      { recursive: false, strictOrder: true },
    ),
  ).toEqual({ a: { b: 2, c: { d: 3, e: 5 } } });
  expect(difference({ a: [1, 2, 3] }, { a: [1, 2, 3] }, { recursive: false, strictOrder: true })).toEqual({});
  expect(difference({ a: [1, 2, 3] }, { a: [3, 2, 1] }, { recursive: false, strictOrder: true })).toEqual({
    a: [3, 2, 1],
  });
  expect(difference({ a: [1, 2, 3] }, { a: [4, 5, 6] }, { recursive: false, strictOrder: true })).toEqual({
    a: [4, 5, 6],
  });

  expect(difference({ a: [1, 2, 3] }, { a: [3, 2, 1] }, { recursive: false, strictOrder: false })).toEqual({});

  expect(
    difference(
      { a: { b: 2, c: { d: 3, e: 4 } } },
      { a: { b: 2, c: { d: 3, e: 5 } } },
      { recursive: true, strictOrder: true },
    ),
  ).toEqual({ a: { c: { e: 5 } } });

  expect(
    difference(
      { a: '1', b: '2', c: '3' },
      { b: '2' },
      { recursive: false, strictOrder: false, ignoreRemovedKeys: true },
    ),
  ).toEqual({});
  expect(
    difference(
      { a: '1', b: '2', c: '3' },
      { b: '2' },
      { recursive: false, strictOrder: false, ignoreRemovedKeys: false },
    ),
  ).toEqual({ a: undefined, c: undefined });
});
