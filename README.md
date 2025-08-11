![GitHub package.json version](https://img.shields.io/github/package-json/v/LupCode/node-lup-utils)
![npm bundle size](https://img.shields.io/bundlephobia/min/lup-utils)
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/LupCode/node-lup-utils/on-push.yml?branch=main)
![NPM](https://img.shields.io/npm/l/lup-utils)

# lup-utils
Node module that provides utilities for interacting with the operating system and the hardware of the machine. 

## Example

JavaScript:
```javascript
const lupUtils = require('lup-utils');

// JSON parsing
console.log(lupUtils.parseJson(`
{
    "key1": "value1",  /* some comments */
    "key2": "2025-08-11", # a date and a trailing comma
}
`, 0, {
    allowComments: true,
    allowTrailingComma: true,
    interpretStringAsDate: true,
    returnUnquotedString: true
}));

```

TypeScript:
```typescript
import lupUtils from 'lup-utils';

// JSON parsing
console.log('JSON:', lupUtils.parseJson(`
{
    "key1": "value1",  /* some comments */
    "key2": "2025-08-11", # a date and a trailing comma
}
`, 0, {
    allowComments: true,
    allowTrailingComma: true,
    interpretStringAsDate: true,
    returnUnquotedString: true
}));
```

Output:
```
JSON: { key1: 'value1', key2: 2025-08-11T00:00:00.000Z }
```
