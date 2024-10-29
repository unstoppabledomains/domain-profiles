import {getProfileReverseResolution} from '../../../actions/domainProfileActions';
import {notifyEvent} from '../../../lib/error';
import {getCachedResolution, setCachedResolution} from '../storage';
import type {AddressResolution} from '../types';

export const getAddressMetadata = async (
  addressOrDomain: string,
): Promise<AddressResolution | undefined> => {
  // determine the reverse address to query
  const sanitizedValue = addressOrDomain.replace('eip155:', '').toLowerCase();

  // check cache for resolution
  const cachedResolution = await getCachedResolution(sanitizedValue);
  if (cachedResolution) {
    return cachedResolution;
  }

  // attempt resolution
  try {
    // retrieve the reverse resolution details
    const resolution = await getProfileReverseResolution(sanitizedValue);
    if (resolution?.address) {
      await setCachedResolution(resolution);
      return resolution;
    }
  } catch (e) {
    notifyEvent(e, 'error', 'Messaging', 'Resolution', {
      msg: 'error looking up reverse resolution',
    });
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
