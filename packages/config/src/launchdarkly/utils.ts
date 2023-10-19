import {camelCase} from 'lodash';

import defaultFlagValues from './defaultFlagValues';
import type {LaunchDarklyKey} from './keys';
import type {KebabToCamelCase, LaunchDarklyCamelFlagSet} from './types';

export const kebabToCamel = <T extends string>(str: T): KebabToCamelCase<T> =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  camelCase(str) as any;

export const getLaunchDarklyDefaults = (): LaunchDarklyCamelFlagSet => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const defaults: any = {};

  for (const key in defaultFlagValues) {
    defaults[kebabToCamel(key)] = defaultFlagValues[key as LaunchDarklyKey];
  }
  return defaults;
};
