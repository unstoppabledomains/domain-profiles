/* eslint-disable no-control-regex */
import uniq from 'lodash/uniq';

import type {
  DomainRawRecords,
  DomainRecords,
  MultiChainAddressRecord,
  NewAddressRecord,
  SingleChainAddressRecord,
} from '../../../lib/types/blockchain';
import {
  AllInitialCurrenciesEnum,
  Registry,
} from '../../../lib/types/blockchain';
import {
  ADDRESS_REGEX,
  MULTI_CHAIN_ADDRESS_REGEX,
} from '../../../lib/types/records';
import type {
  ResolverKeyName,
  ResolverKeys,
} from '../../../lib/types/resolverKeys';

export const EMPTY_DOMAIN_RECORDS: DomainRecords = {
  addresses: {},
  dns: [],
  ipfs: {},
  meta: {
    blockchain: null,
    domain: '',
    logicalOwnerAddress: null,
    namehash: '',
    networkId: null,
    owner: null,
    registryAddress: null,
    resolver: null,
    reverse: false,
    tokenId: '',
    ttl: 0,
    type: Registry.UNS,
  },
  multicoinAddresses: {},
  records: {},
  social: {},
  whois: {},
};

/**
 * Extracts currency and version from a resolver key of any registry
 */
const extractCurrencyAndVersion = (
  key: ResolverKeyName,
  resolverKeys: ResolverKeys,
): {currency: string; version: string} | null => {
  // UNS single-chain address: "crypto.BTC.address"
  if (key.match(ADDRESS_REGEX)) {
    const [_crypto, currency, _address] = key.split('.');
    if (!currency) {
      return null;
    }
    return {currency, version: currency};
  }

  // UNS multi-chain address: "crypto.MATIC.version.ERC20.address"
  if (key.match(MULTI_CHAIN_ADDRESS_REGEX)) {
    const [_crypto, currency, _version, version] = key.split('.');
    if (!currency || !version) {
      return null;
    }
    return {currency, version};
  }

  return null;
};

/**
 * Maps UNS and ENS resolver keys to initial currencies
 */
export const InitialCurrencyToResolverKeys: Record<
  AllInitialCurrenciesEnum,
  ResolverKeyName[]
> = {
  [AllInitialCurrenciesEnum.BTC]: ['crypto.BTC.address', 'addr.0'],
  [AllInitialCurrenciesEnum.ETH]: ['crypto.ETH.address', 'addr.60'],
  [AllInitialCurrenciesEnum.ADA]: ['crypto.ADA.address', 'addr.1815'],
  [AllInitialCurrenciesEnum.HBAR]: ['crypto.HBAR.address', 'addr.3030'],
  [AllInitialCurrenciesEnum.SOL]: ['crypto.SOL.address', 'addr.501'],
};

/**
 * For a provided list of resolver keys, returns a list of address records.
 * Groups multi-chain address records by currency.
 * Works with any registry.
 */
export const getAllAddressRecords = (
  resolverKeys: ResolverKeys,
): NewAddressRecord[] => {
  const {ResolverKeys, ResolverKey} = resolverKeys;
  const result: NewAddressRecord[] = [];

  ResolverKeys.forEach(key => {
    const {currency, version} =
      extractCurrencyAndVersion(key, resolverKeys) ?? {};
    const deprecated = ResolverKey[key].deprecated;

    if (!currency || !version) {
      return;
    }

    const record = result.find(r => r.currency === currency);
    if (record && Array.isArray(record.versions)) {
      record.versions.push({key, deprecated});
    } else {
      result.push({currency, versions: [{key, deprecated}]});
    }
  });

  return result.sort((a, b) => a.currency.localeCompare(b.currency));
};

/**
 * Gets a list of initial address record keys across multi/single coin keys
 */
export const getInitialAddressRecordKeys = (
  resolverKeys: ResolverKeys,
): {initialKeys: ResolverKeyName[]; allKeys: ResolverKeyName[]} => {
  const {ResolverKeys} = resolverKeys;
  const initialResolverKeys = Object.values(
    InitialCurrencyToResolverKeys,
  ).flat();
  const initialKeys = ResolverKeys.filter(key =>
    initialResolverKeys.includes(key),
  );

  return {initialKeys, allKeys: ResolverKeys};
};

/**
 * Only UNS resolver keys can be multi-chain. We're groupping them by currency
 * to make it easier to display them in the UI.
 */
export const getMultichainAddressRecords = (
  records: DomainRawRecords,
  resolverKeys: ResolverKeys,
): MultiChainAddressRecord[] => {
  const {initialKeys, allKeys} = getInitialAddressRecordKeys(resolverKeys);
  const recordKeys = Object.keys(records) as ResolverKeyName[];
  const recordKeysWithInitial = uniq([...initialKeys, ...recordKeys]);
  const result: MultiChainAddressRecord[] = [];

  recordKeysWithInitial.forEach(key => {
    if (!allKeys.includes(key)) {
      return;
    }
    if (!key.match(MULTI_CHAIN_ADDRESS_REGEX)) {
      return;
    }

    // "crypto.MATIC.version.ERC20.address"
    const [_crypto, currency, _version, version] = key.split('.');
    if (!currency || !version) {
      return;
    }
    const record = result.find(r => r.currency === currency);
    const value = records[key] ?? '';

    if (record) {
      record.versions.push({version, value, key});
    } else {
      result.push({currency, versions: [{version, value, key}]});
    }
  });

  return result;
};

export const getSingleChainAddressRecords = (
  records: DomainRawRecords,
  resolverKeys: ResolverKeys,
): SingleChainAddressRecord[] => {
  const {ResolverKey} = resolverKeys;
  const {initialKeys, allKeys} = getInitialAddressRecordKeys(resolverKeys);
  const recordKeys = Object.keys(records) as ResolverKeyName[];
  const recordKeysWithInitial = uniq([...initialKeys, ...recordKeys]);
  const result: SingleChainAddressRecord[] = [];

  recordKeysWithInitial.forEach(key => {
    if (!allKeys.includes(key)) {
      return;
    }
    if (!key.match(ADDRESS_REGEX)) {
      return;
    }

    const currency = ResolverKey[key].symbol;
    if (!currency) {
      return;
    }

    result.push({currency, value: records[key] ?? '', key});
  });

  return result;
};

export const getTotalCurrenciesCount = (
  unsResolverKeys: ResolverKeys,
): number => {
  const addressRecords = getAllAddressRecords(unsResolverKeys);
  return addressRecords.length;
};

export const hasErrors = (
  newRecords: DomainRawRecords,
  resolverKeys: ResolverKeys,
): boolean => {
  const newRecordKeys = Object.keys(newRecords) as ResolverKeyName[];
  return newRecordKeys.some(key => {
    const value = newRecords[key];
    return !isValidRecordKeyValue(key, value, resolverKeys);
  });
};

export const isTokenDeprecated = (
  key: ResolverKeyName,
  resolverKeys: ResolverKeys,
) => {
  const {ResolverKey} = resolverKeys;
  return ResolverKey[key]?.deprecated ?? false;
};

/**
 * Validates a record value based on the resolver key. Works with all resolver keys.
 */
export const isValidRecordKeyValue = (
  key: ResolverKeyName,
  value: string = '',
  resolverKeys: ResolverKeys,
) => {
  const {ResolverKey} = resolverKeys;

  // If the key is not recognized, it's invalid.
  if (!ResolverKey[key]) {
    return false;
  }

  // Empty value is always valid because this is how the record is removed:
  // we pass an empty value to the backend.
  if (!value) {
    return true;
  }

  const {validationRegex} = ResolverKey[key];
  return !validationRegex || new RegExp(validationRegex).test(value);
};

export const validEthAddress = (
  value: string,
  unsResolverKeys: ResolverKeys,
) => {
  return isValidRecordKeyValue('crypto.ETH.address', value, unsResolverKeys);
};
