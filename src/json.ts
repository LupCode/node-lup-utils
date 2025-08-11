import { parseDate, skipWhitespace } from './string';

export type ParseJsonOptions = {
  /** If true, comments are allowed in JSON either as '# comment' or as '\/* comment *\/'. */
  allowComments?: boolean;

  /** If true, trailing commas are allowed in JSON. */
  allowTrailingComma?: boolean;

  /** If a parsed string can be interpreted as Date, the value will be returned as Date object instead of as a string. */
  interpretStringAsDate?: boolean;

  /** If the given jsonString is not parsable it will be returned as string value even if it has no quotes. */
  returnUnquotedString?: boolean;
};

/**
 * Tries to parse a string as JSON from a given offset and stops as soon as the JSON part is fully parsed.
 * This allows to extract a mixed in JSON string from a larger string
 * without knowning the exact length of the JSON part.
 *
 * @param jsonString String to parse as JSON.
 * @param offset Offset to start parsing from.
 * @param options Parsing options.
 * @returns A tuple containing the parsed JSON object and the new offset pointing to the first character after the JSON object.
 *          If parsing fails, it returns null and the given offset.
 */
export function parseJson(jsonString: string, offset: number = 0, options?: ParseJsonOptions): [any, number] {
  if (!jsonString) return [null, offset];
  const originalOffset = offset;
  offset = skipWhitespace(jsonString, offset, options?.allowComments);

  // parse object
  if (jsonString[offset] === '{') {
    offset = skipWhitespace(jsonString, offset + 1, options?.allowComments);

    const result: { [key: string]: any } = {};
    while (true) {
      offset = skipWhitespace(jsonString, offset, options?.allowComments);

      // detect empty object
      if (jsonString[offset] === '}') {
        return [result, offset + 1]; // empty object
      }

      // detect trailing comma
      if (jsonString[offset] === ',') {
        if (!options?.allowTrailingComma) return [null, originalOffset];
        offset++;
        continue; // skip trailing comma
      }

      const [key, offsetAfterKey] = parseJson(jsonString, offset); // key is a JSON string (do not pass any options)
      if (!key || typeof key !== 'string') return [null, originalOffset]; // invalid key, return null
      const idx = jsonString.indexOf(':', offsetAfterKey);
      if (idx < 0) return [null, originalOffset];
      const [value, offsetAfterValue] = parseJson(jsonString, idx + 1, options);
      if (offsetAfterValue === idx + 1)
        // nothing parsed
        return [null, originalOffset];
      result[key] = value;

      offset = skipWhitespace(jsonString, offsetAfterValue, options?.allowComments);
      if (jsonString[offset] === '}') {
        return [result, offset + 1]; // end of JSON object
      }
      if (jsonString[offset] !== ',') {
        return [null, originalOffset]; // invalid JSON object
      }
      offset++; // skip comma
    }
  }

  // parse array
  if (jsonString[offset] === '[') {
    offset = skipWhitespace(jsonString, offset + 1, options?.allowComments);

    // detect empty array
    if (jsonString[offset] === ']') {
      return [[], offset + 1]; // empty array
    }

    const result: any[] = [];
    while (true) {
      offset = skipWhitespace(jsonString, offset, options?.allowComments);

      // detect trailing comma
      if (jsonString[offset] === ',') {
        if (!options?.allowTrailingComma) return [null, originalOffset];
        offset++;
        continue; // skip trailing comma
      }

      const [value, newOffset] = parseJson(jsonString, offset);
      if (newOffset === offset)
        // nothing parsed
        return [null, originalOffset];
      result.push(value);

      offset = skipWhitespace(jsonString, newOffset, options?.allowComments);
      if (jsonString[offset] === ']') {
        return [result, offset + 1]; // end of JSON array
      }
      if (jsonString[offset] !== ',') {
        return [null, originalOffset]; // invalid JSON array
      }
      offset++; // skip comma
    }
  }

  // parse string
  if (jsonString[offset] === '"' || jsonString[offset] === "'") {
    const quote = jsonString[offset];
    offset++;
    const startStr = offset;
    while (true) {
      offset = jsonString.indexOf(quote, offset);
      if (offset < 0) return [null, originalOffset];
      if (jsonString[offset - 1] !== '\\') {
        const str = jsonString.substring(startStr, offset);

        // interpret str as Date
        if (options?.interpretStringAsDate) {
          const date = parseDate(str);
          if (date) return [date, offset + 1];
        }

        return [str, offset + 1]; // end of quoted string
      }
      offset++; // skip escaped quote
    }
  }

  // parse null, true, false
  if (jsonString.substring(offset, offset + 4).toLowerCase() === 'null') return [null, offset + 4]; // null value
  if (jsonString.substring(offset, offset + 4).toLowerCase() === 'true') return [true, offset + 4];
  if (jsonString.substring(offset, offset + 5).toLowerCase() === 'false') return [false, offset + 5];

  // parse plain value as date
  if (options?.interpretStringAsDate && options?.returnUnquotedString) {
    const date = parseDate(jsonString.substring(offset));
    if (date) return [date, jsonString.length];
  }

  // parse number
  const start = offset;
  let end = offset;
  let hasDot = false;
  for (let i = offset; i < jsonString.length; i++) {
    const c = jsonString[i];
    if (
      c === '0' ||
      c === '1' ||
      c === '2' ||
      c === '3' ||
      c === '4' ||
      c === '5' ||
      c === '6' ||
      c === '7' ||
      c === '8' ||
      c === '9'
    ) {
      end = i + 1;
      continue;
    }
    if ((c === '+' || c === '-') && i === start) {
      end = i + 1;
      break;
    }
    if (c === '.') {
      if (hasDot) {
        end = i + 1;
        break; // second dot, end of number
      }
      hasDot = true;
      continue;
    }
    end = i;
    break; // end of number
  }
  if (end > start) {
    const value = hasDot
      ? parseFloat(jsonString.substring(start, end))
      : parseInt(jsonString.substring(start, end), 10);
    if (!isNaN(value)) {
      return [value, end]; // number value
    }
  }

  // return plain value as string
  if (options?.returnUnquotedString) {
    const value = jsonString.substring(offset);
    return [value, jsonString.length];
  }

  return [null, originalOffset]; // invalid JSON value
}
