import { deepEqual, difference } from '../object';

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
  expect(difference({}, {}, { recursive: false, ignoreOrder: false })).toEqual({});
  expect(difference({ a: 1 }, { a: 1 }, { recursive: false, ignoreOrder: false })).toEqual({});
  expect(difference({ a: 1 }, { a: 2 }, { recursive: false, ignoreOrder: false })).toEqual({ a: 2 });
  expect(difference({ a: 1, b: 2 }, { a: 1 }, { recursive: false, ignoreOrder: false })).toEqual({ b: undefined });
  expect(difference({ a: 1 }, { a: 1, b: 2 }, { recursive: false, ignoreOrder: false })).toEqual({ b: 2 });
  expect(
    difference(
      { a: { b: 2, c: { d: 3, e: 4 } } },
      { a: { b: 2, c: { d: 3, e: 4 } } },
      { recursive: false, ignoreOrder: false },
    ),
  ).toEqual({});
  expect(
    difference(
      { a: { b: 2, c: { d: 3, e: 4 } } },
      { a: { b: 3, c: { d: 3, e: 4 } } },
      { recursive: false, ignoreOrder: false },
    ),
  ).toEqual({ a: { b: 3, c: { d: 3, e: 4 } } });
  expect(
    difference(
      { a: { b: 2, c: { d: 3, e: 4 } } },
      { a: { b: 2, c: { d: 3, e: 5 } } },
      { recursive: false, ignoreOrder: false },
    ),
  ).toEqual({ a: { b: 2, c: { d: 3, e: 5 } } });
  expect(difference({ a: [1, 2, 3] }, { a: [1, 2, 3] }, { recursive: false, ignoreOrder: false })).toEqual({});
  expect(difference({ a: [1, 2, 3] }, { a: [3, 2, 1] }, { recursive: false, ignoreOrder: false })).toEqual({
    a: [3, 2, 1],
  });
  expect(difference({ a: [1, 2, 3] }, { a: [4, 5, 6] }, { recursive: false, ignoreOrder: false })).toEqual({
    a: [4, 5, 6],
  });

  expect(difference({ a: [1, 2, 3] }, { a: [3, 2, 1] }, { recursive: false, ignoreOrder: true })).toEqual({});

  expect(
    difference(
      { a: { b: 2, c: { d: 3, e: 4 } } },
      { a: { b: 2, c: { d: 3, e: 5 } } },
      { recursive: true, ignoreOrder: false },
    ),
  ).toEqual({ a: { c: { e: 5 } } });
});
