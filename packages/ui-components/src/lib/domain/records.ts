import mapKeys from 'lodash/mapKeys';
import pickBy from 'lodash/pickBy';
import reduce from 'lodash/reduce';

import {NullAddress} from '@unstoppabledomains/resolution/build/types';

import {getParentNetworkSymbol} from '../../components/Manage/common/currencyRecords';
import type {
  MulticoinAddresses,
  MulticoinVersions,
  ParsedRecords,
} from '../../lib/types/records';
import {
  ADDRESS_REGEX,
  MULTI_CHAIN_ADDRESS_REGEX,
  TOKEN_FAMILY_REGEX,
} from '../../lib/types/records';
import type {MappedResolverKey} from '../types/pav3';
import {getMappedResolverKey} from '../types/resolverKeys';

export const mapMultiCoinAddresses = (
  records: Record<string, string> | null,
): MulticoinAddresses => {
  if (!records) {
    return {};
  }
  return reduce(
    records,
    (r, address, key) => {
      if (key.match(MULTI_CHAIN_ADDRESS_REGEX) && Boolean(address)) {
        const [_crypto, ticker, _namespace, version] = key.split('.');
        r[ticker] = r[ticker] ?? ({} as MulticoinVersions);
        r[ticker][version] = address;
      }
      return r;
    },
    {} as MulticoinAddresses,
  );
};

export const parseRecords = (
  records: Record<string, string>,
  mappedResolverKeys?: MappedResolverKey[],
): ParsedRecords => {
  // initial set of multichain addresses
  const multicoinAddresses = mapMultiCoinAddresses(records);

  // initial set of single chain addresses
  const addresses = mapKeys(
    pickBy(records, (v, k) => Boolean(v) && k.match(ADDRESS_REGEX)),
    (_v, k) => k.split('.')[1],
  );

  const tokenFamilyEntries = mapKeys(
    pickBy(records, (v, k) => Boolean(v) && k.match(TOKEN_FAMILY_REGEX)),
    (_v, k) => k,
  );

  // Remove null and empty addresses
  for (const key in addresses) {
    if (addresses[key] === '0x' || addresses[key] === NullAddress) {
      delete addresses[key];
    }
  }

  // special handling for mapped resolver keys
  if (mappedResolverKeys) {
    // Remove duplicate token entries already present in
    // address dictionary
    for (const token in tokenFamilyEntries) {
      const mappedToken = getMappedResolverKey(token, mappedResolverKeys);
      if (mappedToken?.mapping?.to && records[mappedToken.mapping.to]) {
        continue;
      }
      addresses[token] = tokenFamilyEntries[token];
    }

    // remove multichain addresses from single chain list and augment the
    // multicoinAddresses list
    for (const addressKey of Object.keys(addresses)) {
      const mappedKey = getMappedResolverKey(addressKey, mappedResolverKeys);
      if (mappedKey?.related && mappedKey.related.length > 0) {
        // determine parent network
        const parentNetwork = addressKey.includes('.')
          ? getParentNetworkSymbol(mappedKey)
          : addressKey;
        if (!parentNetwork) {
          continue;
        }

        // remove single chain
        const addressValue = addresses[addressKey];
        delete addresses[addressKey];

        // add multichain
        const multicoinKey = mappedKey.shortName;
        if (!multicoinAddresses[multicoinKey]) {
          multicoinAddresses[multicoinKey] = {};
        }
        multicoinAddresses[multicoinKey][parentNetwork] = addressValue;
      }
    }
  }

  return {
    addresses,
    multicoinAddresses,
  };
};
