import cloneDeep from 'lodash/cloneDeep';
import type EnsResolverKeysJson from 'uns/ens-resolver-keys.json';
import type UnsResolverKeysJson from 'uns/resolver-keys.json';

import {ADDRESS_REGEX, MULTI_CHAIN_ADDRESS_REGEX} from './records';

/**
 * Currency symbol as in `AllCurrenciesType`, i.e. "BTC"
 */
type ResolverKeySymbol = string | null;

/**
 * Regex string based on which the value of the record will be validated,
 * ready to be used in a `RegExp` constructor
 */
type ResolverKeyValidationRegex = string | null;

/**
 * Common resolver key data unified across registries: UNS, ENS, etc.
 */
type ResolverKey = {
  deprecated: boolean;
  symbol: ResolverKeySymbol;
  validationRegex: ResolverKeyValidationRegex;
};

export const EMPTY_RESOLVER_KEYS: ResolverKeys = {
  ResolverKeys: [],
  ResolverKey: {} as ResolverKeys['ResolverKey'],
};

export type EnsResolverKey = keyof typeof EnsResolverKeysJson.keys;

export const MultichainKeyToLocaleKey = {
  'crypto.ELA.version.ELA.address': 'multichainKeyToName.elaEla',
  'crypto.ELA.version.ESC.address': 'multichainKeyToName.elaEsc',
} as const;

let cachedUnsResolverKeys: typeof UnsResolverKeysJson;
let cachedEnsResolverKeys: typeof EnsResolverKeysJson;

const getUnsResolverKeySymbol = (key: ResolverKeyName): ResolverKeySymbol => {
  let symbol: ResolverKeySymbol = null;

  if (key.match(ADDRESS_REGEX) || key.match(MULTI_CHAIN_ADDRESS_REGEX)) {
    const [, ticker] = key.split('.');
    if (ticker) {
      symbol = ticker;
    }
  }

  return symbol;
};

/**
 * Any available resolver key, i.e. "crypto.BTC.address" or "addr.1023"
 */
export type ResolverKeyName = UnsResolverKey | EnsResolverKey;

export type ResolverKeys = {
  ResolverKeys: ResolverKeyName[];
  ResolverKey: Record<ResolverKeyName, ResolverKey>;
};

export type UnsResolverKey = keyof typeof UnsResolverKeysJson.keys;

export const loadEnsResolverKeys = async (): Promise<ResolverKeys> => {
  if (!cachedEnsResolverKeys) {
    cachedEnsResolverKeys = await import('uns/ens-resolver-keys.json');
  }
  const {keys} = cachedEnsResolverKeys;
  const {ResolverKeys, ResolverKey} = cloneDeep(EMPTY_RESOLVER_KEYS);

  for (const keyPair of Object.entries(keys)) {
    const key = keyPair[0] as ResolverKeyName;
    const props = keyPair[1];
    const {symbol, validationRegex} = props;
    const deprecated = symbol ? /_LEGACY/.test(symbol) : false;
    ResolverKeys.push(key);
    ResolverKey[key] = {deprecated, symbol, validationRegex};
  }

  return {ResolverKeys, ResolverKey};
};

export const loadUnsResolverKeys = async (): Promise<ResolverKeys> => {
  if (!cachedEnsResolverKeys) {
    cachedUnsResolverKeys = await import('uns/resolver-keys.json');
  }
  const {keys} = cachedUnsResolverKeys;
  const {ResolverKeys, ResolverKey} = cloneDeep(EMPTY_RESOLVER_KEYS);

  for (const keyPair of Object.entries(keys)) {
    const key = keyPair[0] as ResolverKeyName;
    const keyProperties = keyPair[1];
    const {deprecated, validationRegex} = keyProperties;
    const symbol = getUnsResolverKeySymbol(key);
    ResolverKeys.push(key);
    ResolverKey[key] = {deprecated, symbol, validationRegex};
  }

  return {ResolverKeys, ResolverKey};
};
