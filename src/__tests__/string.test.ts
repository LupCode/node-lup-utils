import { skipWhitespace } from '../string';

// skipWhitespace

test('skipWhitespace()', async () => {
  const offset = skipWhitespace(undefined as any, 0);
  expect(offset).toBe(0);
});

test("skipWhitespace('')", async () => {
  const offset = skipWhitespace('', 0);
  expect(offset).toBe(0);
});

test("skipWhitespace('abc')", async () => {
  const offset = skipWhitespace('abc', 0);
  expect(offset).toBe(0);
});

test("skipWhitespace('    def')", async () => {
  const offset = skipWhitespace('    def', 0);
  expect(offset).toBe(4);
});

test("skipWhitespace(' \r\n  ghi')", async () => {
  const offset = skipWhitespace(' \r\n  ghi', 0);
  expect(offset).toBe(5);
});

test("skipWhitespace('# comment')", async () => {
  const offset = skipWhitespace('# comment', 0, false);
  expect(offset).toBe(0);
});

test("skipWhitespace(' \t  # comment')", async () => {
  const offset = skipWhitespace(' \t  # comment', 0, false);
  expect(offset).toBe(4);
});

test("skipWhitespace('# comment')", async () => {
  const offset = skipWhitespace('# comment', 0, true);
  expect(offset).toBe(9);
});

test("skipWhitespace(' \t  # comment')", async () => {
  const offset = skipWhitespace(' \t  # comment', 0, true);
  expect(offset).toBe(13);
});

test("skipWhitespace('/* comment */')", async () => {
  const offset = skipWhitespace('/* comment */', 0, false);
  expect(offset).toBe(0);
});

test("skipWhitespace('\n /* comment */')", async () => {
  const offset = skipWhitespace('\n /* comment */', 0, false);
  expect(offset).toBe(2);
});

test("skipWhitespace('/* comment */')", async () => {
  const offset = skipWhitespace('/* comment */', 0, true);
  expect(offset).toBe(13);
});

test("skipWhitespace('\n /* comment */')", async () => {
  const offset = skipWhitespace('\n /* comment */', 0, true);
  expect(offset).toBe(15);
});
