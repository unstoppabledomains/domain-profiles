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
import type {MappedResolverKey} from '../../../lib/types/pav3';
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
 * Maps UNS and ENS resolver keys to initial currencies
 */
export const InitialCurrencyToResolverKeys: Record<
  AllInitialCurrenciesEnum,
  ResolverKeyName[]
> = {
  [AllInitialCurrenciesEnum.BTC]: ['crypto.BTC.address', 'addr.0'],
  [AllInitialCurrenciesEnum.ETH]: ['crypto.ETH.address', 'addr.60'],
  [AllInitialCurrenciesEnum.MATIC]: [
    'crypto.MATIC.version.ERC20.address',
    'addr.2147483785',
  ],
  [AllInitialCurrenciesEnum.SOL]: ['crypto.SOL.address', 'addr.501'],
};

/**
 * For a provided list of resolver keys, returns a list of address records.
 * Groups multi-chain address records by currency.
 * Works with any registry.
 */
export const getAllAddressRecords = (
  mappedResolverKeys?: MappedResolverKey[],
): NewAddressRecord[] => {
  const result: NewAddressRecord[] = [];
  mappedResolverKeys
    ?.filter(k => k.subType === 'CRYPTO_TOKEN' && k.shortName)
    .sort((a, b) => b.shortName.localeCompare(a.shortName))
    .forEach(mappedResolverKey => {
      // define resolver key values
      const key = mappedResolverKey.mapping?.to || mappedResolverKey.key;
      const name = mappedResolverKey.name;
      const shortName = mappedResolverKey.shortName;
      const deprecated = false;

      // update result
      const record = result.find(
        r => (r.name && r.name === name) || r.shortName === shortName,
      );
      if (record && Array.isArray(record.versions)) {
        record.versions.push({
          key,
          deprecated,
        });
      } else {
        result.push({
          shortName,
          name: mappedResolverKey.name,
          versions: [{key, deprecated}],
        });
      }
    });

  return result.sort((a, b) => a.shortName.localeCompare(b.shortName));
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
 * Only UNS resolver keys can be multi-chain. We're grouping them by currency
 * to make it easier to display them in the UI.
 */
export const getMultichainAddressRecords = (
  records: DomainRawRecords,
  legacyResolverKeys: ResolverKeys,
  mappedResolverKeys?: MappedResolverKey[],
): MultiChainAddressRecord[] => {
  const {initialKeys} = getInitialAddressRecordKeys(legacyResolverKeys);
  const recordKeys = Object.keys(records) as ResolverKeyName[];
  const recordKeysWithInitial = uniq([...initialKeys, ...recordKeys]);
  const result: MultiChainAddressRecord[] = [];
  mappedResolverKeys
    ?.filter(
      k =>
        // is a token
        k.subType === 'CRYPTO_TOKEN' &&
        // is included in requested keys
        (recordKeysWithInitial.includes(k.key as ResolverKeyName) ||
          recordKeysWithInitial.includes(k.mapping?.to as ResolverKeyName)),
    )
    .forEach(mappedResolverKey => {
      // define output values
      const currency = mappedResolverKey.name || mappedResolverKey.shortName;
      const directValue = records[mappedResolverKey.key as ResolverKeyName];
      const mappedRecordValue = mappedResolverKey?.mapping?.to
        ? records[mappedResolverKey.mapping.to as ResolverKeyName]
        : '';
      const value = directValue || mappedRecordValue || '';
      const key = (mappedResolverKey?.mapping?.to ||
        mappedResolverKey.key) as ResolverKeyName;

      // filter out missing currency value
      if (!currency) {
        return;
      }

      // filter out mapped keys without related entries
      if (
        !mappedResolverKey.related ||
        mappedResolverKey.related.length === 0
      ) {
        return;
      }

      // filter out records without parent
      if (!mappedResolverKey.parents) {
        return;
      }

      // find the parent network version type
      const version = mappedResolverKey.parents.find(
        p => p.subType === 'CRYPTO_NETWORK',
      )?.shortName;
      if (!version) {
        return;
      }

      // update result list with the new version
      const record = result.find(r => r.currency === currency);
      if (record) {
        // filter mapped resolver already in the version list
        if (
          record.versions.find(
            v => v.mappedResolverKey?.key === mappedResolverKey.key,
          )
        ) {
          return;
        }

        record.versions.push({version, value, key, mappedResolverKey});
      } else {
        result.push({
          currency,
          name: mappedResolverKey.name,
          versions: [{version, value, key, mappedResolverKey}],
        });
      }
    });

  return result;
};

export const getSingleChainAddressRecords = (
  records: DomainRawRecords,
  legacyResolverKeys: ResolverKeys,
  mappedResolverKeys?: MappedResolverKey[],
): SingleChainAddressRecord[] => {
  const {initialKeys} = getInitialAddressRecordKeys(legacyResolverKeys);
  const recordKeys = Object.keys(records) as ResolverKeyName[];
  const recordKeysWithInitial = uniq([...initialKeys, ...recordKeys]);
  const result: SingleChainAddressRecord[] = [];
  mappedResolverKeys
    ?.filter(
      k =>
        // is a token
        k.subType === 'CRYPTO_TOKEN' &&
        // is included in requested keys
        (recordKeysWithInitial.includes(k.key as ResolverKeyName) ||
          recordKeysWithInitial.includes(k.mapping?.to as ResolverKeyName)),
    )
    .forEach(mappedResolverKey => {
      // define output values
      const currency = mappedResolverKey.shortName;
      const directValue = records[mappedResolverKey.key as ResolverKeyName];
      const mappedRecordValue = mappedResolverKey?.mapping?.to
        ? records[mappedResolverKey.mapping.to as ResolverKeyName]
        : '';
      const value = directValue || mappedRecordValue || '';
      const key = (mappedResolverKey?.mapping?.to ||
        mappedResolverKey.key) as ResolverKeyName;

      // filter out chains with related entries
      if (mappedResolverKey.related && mappedResolverKey.related.length > 0) {
        return;
      }

      // filter mapped resolver already in list
      if (
        result.find(r => r.mappedResolverKey?.key === mappedResolverKey.key)
      ) {
        return;
      }

      // add to result list
      result.push({currency, value, key, mappedResolverKey});
    });

  // return single record addresses
  return result;
};

export const isTokenDeprecated = (
  key: ResolverKeyName,
  legacyResolverKeys: ResolverKeys,
) => {
  const {ResolverKey} = legacyResolverKeys;
  return ResolverKey[key]?.deprecated ?? false;
};

/**
 * Validates a record value based on the resolver key. Works with all resolver keys.
 */
export const isValidRecordKeyValue = (
  key: ResolverKeyName,
  value: string = '',
  legacyResolverKeys: ResolverKeys,
) => {
  const {ResolverKey} = legacyResolverKeys;

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

export const isValidMappedResolverKeyValue = (
  value: string = '',
  key: MappedResolverKey,
): boolean => {
  if (!key.validation?.regexes) {
    return true;
  }
  for (const regex of key.validation.regexes) {
    if (new RegExp(regex.pattern).test(value)) {
      return true;
    }
  }
  return false;
};
