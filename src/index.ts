export * from './json';
export * from './string';
export * from './terminal';
export * from './utils';

import * as json from './json';
import * as string from './string';
import * as terminal from './terminal';
import * as utils from './utils';

/**
 * Utility functions
 */
const lupUtils = {
  ...json,
  ...string,
  ...terminal,
  ...utils,
};
export default lupUtils;
