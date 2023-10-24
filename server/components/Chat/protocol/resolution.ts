import {getProfileResolution} from 'actions/domainProfileActions';

import {getCachedResolution, setCachedResolution} from '../storage';
import type {AddressResolution} from '../types';

export const getAddressMetadata = async (
  addressOrDomain: string,
): Promise<AddressResolution | undefined> => {
  // determine the reverse address to query
  const sanitizedValue = addressOrDomain.replace('eip155:', '').toLowerCase();

  // check cache for resolution
  const cachedResolution = getCachedResolution(sanitizedValue);
  if (cachedResolution) {
    return cachedResolution;
  }

  // attempt resolution
  try {
    // retrieve the reverse resolution details
    const resolution = await getProfileResolution(sanitizedValue);
    if (resolution?.address) {
      setCachedResolution(resolution);
      return resolution;
    }
  } catch (e) {
    console.warn('error looking up reverse resolution', String(e));
  }

  // return the address metadata
  if (isEthAddress(sanitizedValue)) {
    return {
      address: sanitizedValue,
    };
  }
  return;
};

export const isEthAddress = (address: string): boolean =>
  /^0x[a-fA-F0-9]{40}$/.test(address);
