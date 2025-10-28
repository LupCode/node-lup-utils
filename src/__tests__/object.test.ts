import { deepEqual } from '../object';

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
  expect(deepEqual({ a: 1, b: 2 }, { a: 1, b: 3 }, false)).toBe(false);
  expect(deepEqual({ a: 1, b: 2 }, { a: 1 })).toBe(false);
  expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
});
