/**
 * Converts a byte value to a human-readable string.
 * @param bytesPerSec Value in bytes per second to convert to a human-readable string.
 * @param options Options for converting the string.
 * @returns Human-readable string representation of the byte value as bits per second (e.g. "100 Mbps").
 */
export function byteValueToBitsHumanString(
  bytesPerSec: number,
  options?: {
    /** Number of decimal places to include (default 0). */
    precision?: number;
  },
): string {
  const bits = bytesPerSec * 8;
  const base = 1000;
  const units = ['bits', 'Kbps', 'Mbps', 'Gbps', 'Tbps', 'Pbps'];
  let i = 0;
  let humanReadable = bits;

  while (humanReadable >= base && i < units.length - 1) {
    humanReadable /= base;
    i++;
  }

  return humanReadable.toFixed(options?.precision ?? 0) + ' ' + units[i];
}

/**
 * Converts a byte value to a human-readable string.
 *
 * @param bytes Value in bytes to convert to a human-readable string.
 * @param options Options for converting the string.
 * @returns Human-readable string representation of the byte value (e.g. )
 */
export function byteValueToHumanString(
  bytes: number,
  options?: {
    /** Whether to use the decimal (base 1000) or the binary (base 1024) for conversion (default 1024). */
    decimalBase?: boolean;

    /** If the label should be binary (e.g. "GiB" vs "GB") if decimalBase is false (default false). */
    binaryLabel?: boolean;

    /** Number of decimal places to include (default 0). */
    precision?: number;
  },
): string {
  const units =
    !options?.decimalBase && options?.binaryLabel
      ? ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB']
      : ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const step = options?.decimalBase ? 1000 : 1024;
  let i = 0;
  let humanReadable = bytes;

  while (humanReadable >= step && i < units.length - 1) {
    humanReadable /= step;
    i++;
  }

  return humanReadable.toFixed(options?.precision ?? 0) + ' ' + units[i];
}

/**
 * Parses a byte value from a string.
 *
 * @param value String representation of a byte value (e.g., "100MB", "2GB").
 * @returns The parsed byte value as a number.
 */
export function parseByteValue(value: string): number {
  if (!value) return 0;
  value = value.trim();
  let i = 0;

  // extract numeric part
  let numStr = '';
  let hasDot = false;
  for (; i < value.length; i++) {
    const c = value[i] as string;
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
      numStr += c;
    } else if ((c === '.' || c === ',') && !hasDot) {
      hasDot = true;
      numStr += c;
    } else {
      break; // stop at first non-numeric character
    }
  }
  const num = hasDot ? parseFloat(numStr) : parseInt(numStr, 10);
  if (isNaN(num)) return num;

  // extract unit
  value = value.substring(i).trim().toLowerCase().split(' ')[0];
  value = value.replace(/[^a-z]/g, ''); // remove non-alphabetic characters
  if (value === 'b' || value === 'bytes' || value === 'byte') return num;
  if (value === 'kb' || value === 'kilobyte' || value === 'kilobytes') return num * 1000;
  if (value === 'mb' || value === 'megabyte' || value === 'megabytes') return num * 1000 * 1000;
  if (value === 'gb' || value === 'gigabyte' || value === 'gigabytes') return num * 1000 * 1000 * 1000;
  if (value === 'tb' || value === 'terabyte' || value === 'terabytes') return num * 1000 * 1000 * 1000 * 1000;
  if (value === 'kib' || value === 'kibibyte' || value === 'kibibytes') return num * 1024;
  if (value === 'mib' || value === 'mebibyte' || value === 'mebibytes') return num * 1024 * 1024;
  if (value === 'gib' || value === 'gibibyte' || value === 'gibibytes') return num * 1024 * 1024 * 1024;
  if (value === 'tib' || value === 'tebibyte' || value === 'tebibytes') return num * 1024 * 1024 * 1024 * 1024;

  // unknown unit, return as bytes
  return num;
}

/**
 * Tries to parse a string as a date.
 *
 * @param dateString String to parse as a date.
 * @returns Date object if parsing is successful, otherwise null.
 */
export function parseDate(dateString: string): Date | null {
  if (!dateString) return null;
  dateString = dateString.trim();
  if (dateString.startsWith('/') || dateString.startsWith('\\')) {
    return null;
  }

  // try direct parsing
  try {
    const date = new Date(dateString);
    if (date && !isNaN(date.getTime())) {
      return date;
    }
    // tslint:disable-next-line:no-empty
  } catch {}

  // special case: 2025-04-13 22:02:39 +0200 CEST
  try {
    const parts = dateString.split(' ');
    if (parts.length === 4) {
      const date = new Date(parts.slice(0, 3).join(' '));
      if (date && !isNaN(date.getTime())) {
        return date;
      }
    }
    // tslint:disable-next-line:no-empty
  } catch {}

  return null; // Return null if parsing fails
}

/**
 * Parses a string of key-value pairs separated by a specified separator.
 * Values can be strings, numbers, dates, or JSON objects/arrays.
 *
 * @param keyValueString String to parse containing key-value pairs.
 * @param pairSeparator The separator between key-value pairs (default is ',').
 * @param keyValueSeparator The separator between keys and values (default is '=').
 * @returns An object with keys and their corresponding values.
 */
export function parseKeyValueList(
  keyValueString: string,
  pairSeparator: string = ',',
  keyValueSeparator: string = '=',
): { [key: string]: any } {
  const result: { [key: string]: any } = {};

  function determineEndOfJson(offset: number): number {
    offset = skipWhitespace(keyValueString, offset);

    // string
    if (keyValueString[offset] === '"' || keyValueString[offset] === "'") {
      const quote = keyValueString[offset];
      for (let i = offset + 1; i < keyValueString.length; i++) {
        const c = keyValueString[i];
        if (c === quote) {
          // end of quoted value
          return i + 1;
        }
        if (c === '\\') {
          i++; // skip next escaped character
        }
      }
      return keyValueString.length; // unclosed quote, return rest of string
    }

    // object
    if (keyValueString[offset] === '{') {
      offset++;
      while (true) {
        offset = determineEndOfJson(offset); // parses key as string
        offset = keyValueString.indexOf(':', offset);
        if (offset < 0 || offset >= keyValueString.length) {
          throw new Error('Invalid JSON object: missing value after key');
        }
        offset = determineEndOfJson(offset + 1); // parse any json value
        offset = skipWhitespace(keyValueString, offset);
        if (keyValueString[offset] === '}') {
          return offset + 1; // end of JSON object
        } else if (keyValueString[offset] === ',') {
          offset++; // skip comma
        } else {
          throw new Error('Invalid JSON object: expected "}" or ","');
        }
      }
    }

    // array
    if (keyValueString[offset] === '[') {
      offset++;
      while (true) {
        offset = determineEndOfJson(offset); // parses value as string
        offset = skipWhitespace(keyValueString, offset);
        if (keyValueString[offset] === ']') {
          return offset + 1; // end of JSON array
        } else if (keyValueString[offset] === ',') {
          offset++; // skip comma
        } else {
          throw new Error('Invalid JSON array: expected "]" or ","');
        }
      }
    }

    // number or boolean
    for (let i = offset; i < keyValueSeparator.length; i++) {
      const c = keyValueString[i];
      if (c === ',' || c === '}' || c === ']') {
        // end of number or boolean value
        return i;
      }
    }
    return keyValueString.indexOf(pairSeparator, offset);
  }

  function parseValue(offset: number): [any, number] {
    offset = skipWhitespace(keyValueString, offset);
    let end;

    // parse JSON
    if (
      keyValueString[offset] === '{' ||
      keyValueString[offset] === '[' ||
      keyValueString[offset] === '"' ||
      keyValueString[offset] === "'"
    ) {
      const start = offset;
      end = determineEndOfJson(offset);
      const jsonString = keyValueString.substring(start, end);
      try {
        return [JSON.parse(jsonString), end];
      } catch {
        return [jsonString, end]; // return as string if JSON parsing fails
      }
    }

    // try to parse boolean, null, or number
    end = keyValueString.indexOf(pairSeparator, offset);
    if (end === offset) return ['', end]; // empty value
    end = end < 0 ? keyValueString.length : end;
    const valueString = keyValueString.substring(offset, end).trim();
    const valueStringLower = valueString.toLowerCase();
    if (valueStringLower === 'true' || valueStringLower === 'enabled' || valueStringLower === 'on') return [true, end];
    if (valueStringLower === 'false' || valueStringLower === 'disabled' || valueStringLower === 'off')
      return [false, end];
    if (valueStringLower === 'null' || valueStringLower === 'none' || valueStringLower === 'undefined')
      return [null, end];
    try {
      const integer = parseInt(valueString, 10);
      if (!isNaN(integer)) return [integer, end];
      // tslint:disable-next-line:no-empty
    } catch {}
    try {
      const float = parseFloat(valueString);
      if (!isNaN(float)) return [float, end];
      // tslint:disable-next-line:no-empty
    } catch {}

    // try to parse Date
    let date = parseDate(valueString);
    if (date) return [date, end];
    if (pairSeparator === ',') {
      // maybe date contains pairSeparator
      const end2 = keyValueString.indexOf(pairSeparator, end + 1);
      if (end2 > end) {
        date = parseDate(keyValueString.substring(offset, end2));
        if (date) return [date, end2];
      }
    }

    // if no other type matches, return as string
    return [valueString, end]; // return as string if no other type matches
  }

  for (let i = 0; i < keyValueString.length; ) {
    const keyStart = i;
    const keyEnd = keyValueString.indexOf(keyValueSeparator, keyStart);
    let key;
    if (keyEnd < 0 || keyEnd >= keyValueString.length) {
      key = keyValueString.substring(keyStart).trim();
      if (key.length > 0) {
        result[key] = '';
      }
      break;
    }
    key = keyValueString.substring(keyStart, keyEnd).trim();
    i = keyEnd + keyValueSeparator.length;

    // end of value must be determined semantically because value itself can contain the pair separator
    const valueStart = i;
    const [value, valueEnd] = parseValue(valueStart);
    result[key] = value;
    i = skipWhitespace(keyValueString, valueEnd);
    if (i < keyValueString.length && keyValueString[i] === pairSeparator) {
      i++; // skip pair separator
    }
  }
  return result;
}

/**
 * Returns the first non-whitespace character index in a string starting from the given offset.
 *
 * @param str The string to search.
 * @param offset The offset to start searching from.
 * @param skipComments If comments in the form of '# <comment> \n' or '\/* <comment> *\/' should be skipped as well.
 * @returns The index of the first non-whitespace character, or the length of the string if no non-whitespace character is found.
 */
export function skipWhitespace(str: string, offset: number, skipComments: boolean = false): number {
  if (!str) return offset;
  while (offset < str.length && /\s/.test(str[offset])) offset++;
  if (skipComments) {
    if (str[offset] === '#') {
      const endOfLine = str.indexOf('\n', offset + 1);
      if (endOfLine < 0) return str.length; // no newline found, return end of string
      return skipWhitespace(str, endOfLine, skipComments);
    } else if (str.substr(offset, 2) === '/*') {
      const endOfComment = str.indexOf('*/', offset + 2);
      if (endOfComment < 0) return str.length; // no end of comment found, return end of string
      return skipWhitespace(str, endOfComment + 2, skipComments);
    }
  }
  return offset;
}
