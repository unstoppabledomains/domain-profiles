import mapKeys from 'lodash/mapKeys';
import pickBy from 'lodash/pickBy';
import reduce from 'lodash/reduce';

import {NullAddress} from '@unstoppabledomains/resolution/build/types';

import type {
  MulticoinAddresses,
  MulticoinVersions,
  ParsedRecords,
} from '../../lib/types/records';
import {
  ADDRESS_REGEX,
  MULTI_CHAIN_ADDRESS_REGEX,
} from '../../lib/types/records';

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
): ParsedRecords => {
  const addresses = mapKeys(
    pickBy(records, (v, k) => Boolean(v) && k.match(ADDRESS_REGEX)),
    (_v, k) => k.split('.')[1],
  );

  // Remove null and empty addresses
  for (const key in addresses) {
    if (addresses[key] === '0x' || addresses[key] === NullAddress) {
      delete addresses[key];
    }
  }
  return {
    addresses,
    multicoinAddresses: mapMultiCoinAddresses(records),
  };
};
