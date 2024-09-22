import cloneDeep from 'lodash/cloneDeep';
import EnsResolverKeysJson from 'uns/ens-resolver-keys.json';
import UnsResolverKeysJson from 'uns/resolver-keys.json';

import type {MappedResolverKey} from './pav3';
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

export const getMappedRecordKeysForUpdate = (
  id: string,
  keys: MappedResolverKey[],
): string[] => {
  // find the associated mapped resolver key for the provided ID
  const mappedResolverKey = getMappedResolverKey(id, keys);
  if (!mappedResolverKey) {
    return [id];
  }

  // build list of keys to update
  const expandedKeys = [mappedResolverKey.key];
  if (mappedResolverKey.mapping?.to) {
    expandedKeys.push(mappedResolverKey.mapping.to);
  }
  return expandedKeys;
};

export const getMappedResolverKey = (
  id: string,
  keys: MappedResolverKey[],
): MappedResolverKey | undefined => {
  // search for matching keys
  return (
    // find by exact match
    keys.find(k => k.key.toLowerCase() === id.toLowerCase()) ||
    // find by mapping "to" match
    keys.find(k => k.mapping?.to.toLowerCase() === id.toLowerCase()) ||
    // find by mapping "from" match
    keys.find(k =>
      k.mapping?.from?.find(f => f.toLowerCase() === id.toLowerCase()),
    ) ||
    // find by matching network
    keys
      .filter(k => k.subType === 'CRYPTO_NETWORK')
      .find(
        k =>
          // matches the shortname
          k.shortName.toLowerCase() === id.toLowerCase() ||
          (k.name && k.name.toLowerCase() === id.toLowerCase()),
      ) ||
    // find by matching token
    keys
      .filter(k => k.subType === 'CRYPTO_TOKEN')
      .find(
        k =>
          // matches the shortname
          k.shortName.toLowerCase() === id.toLowerCase() ||
          (k.name && k.name.toLowerCase() === id.toLowerCase()),
      )
  );
};

export const loadEnsResolverKeys = async (): Promise<ResolverKeys> => {
  if (!cachedEnsResolverKeys) {
    cachedEnsResolverKeys = EnsResolverKeysJson;
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
    cachedUnsResolverKeys = UnsResolverKeysJson;
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
