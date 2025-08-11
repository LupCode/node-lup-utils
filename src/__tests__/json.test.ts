import { parseJson } from '../json';

test('parseJson()', async () => {
  const [json, offset] = parseJson(undefined as any);
  expect(json).toBeNull();
  expect(offset).toBe(0);
});

test("parseJson('')", async () => {
  const [json, offset] = parseJson('');
  expect(json).toBeNull();
  expect(offset).toBe(0);
});

test("parseJson('true')", async () => {
  const [json, offset] = parseJson('true');
  expect(typeof json).toBe('boolean');
  expect(json).toEqual(true);
  expect(offset).toBe(4);
});

test("parseJson('false')", async () => {
  const [json, offset] = parseJson('false');
  expect(typeof json).toBe('boolean');
  expect(json).toEqual(false);
  expect(offset).toBe(5);
});

test("parseJson('null')", async () => {
  const [json, offset] = parseJson('null');
  expect(json).toBeNull();
  expect(offset).toBe(4);
});

test("parseJson('123')", async () => {
  const [json, offset] = parseJson('123');
  expect(Number.isInteger(json)).toBe(true);
  expect(json).toEqual(123);
  expect(offset).toBe(3);
});

test("parseJson('456.789')", async () => {
  const [json, offset] = parseJson('456.789');
  expect(Number.isNaN(parseFloat(json + ''))).toBe(false);
  expect(json).toEqual(456.789);
  expect(offset).toBe(7);
});

test("parseJson('2025-08-11')", async () => {
  const [json, offset] = parseJson('2025-08-11', 0, { interpretStringAsDate: true, returnUnquotedString: true });
  expect(typeof json).toBe('object'); // there is no 'Date' type
  expect(json).toEqual(new Date('2025-08-11'));
  expect(offset).toBe(10);
});

test("parseJson('[]')", async () => {
  const [json, offset] = parseJson('[]');
  expect(Array.isArray(json)).toBe(true);
  expect(json).toEqual([]);
  expect(offset).toBe(2);
});

test("parseJson('{}')", async () => {
  const [json, offset] = parseJson('{}');
  expect(typeof json).toBe('object');
  expect(json).toEqual({});
  expect(offset).toBe(2);
});

test('parseJson(<ComplexValue1>)', async () => {
  const [json, offset] = parseJson(
    `
  {
      "key1": "value1",  /* some comments */
      "key2": "2025-08-11", # a date and a trailing comma
  }
  `,
    0,
    {
      allowComments: true,
      allowTrailingComma: true,
      interpretStringAsDate: true,
      returnUnquotedString: true,
    },
  );
  console.log(json);
  expect(typeof json).toBe('object');
  expect(json).toEqual({
    key1: 'value1',
    key2: new Date('2025-08-11'),
  });
  expect(offset).toBe(111);
});
