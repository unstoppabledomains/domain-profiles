import {fetcher} from '@xmtp/proto';

import {DomainProfileKeys} from '../../lib/types/domain';
import type {AddressResolution} from './types';

export const getCacheKey = (prefix: string, address: string): string => {
  return `${DomainProfileKeys.Messaging}-${prefix}-${address}`;
};

export const setXmtpLocalKey = (address: string, key: Uint8Array) => {
  localStorage.setItem(
    getCacheKey('xmtpKey', address.toLowerCase()),
    fetcher.b64Encode(key, 0, key.length),
  );
};

export const getXmtpLocalKey = (address: string): Uint8Array | undefined => {
  const cachedKey = localStorage.getItem(
    getCacheKey('xmtpKey', address.toLowerCase()),
  );
  if (cachedKey) {
    return fetcher.b64Decode(cachedKey);
  }
  return;
};

export const setPushLocalKey = (address: string, key: string) => {
  localStorage.setItem(
    getCacheKey('pushKey', address.toLowerCase()),
    Buffer.from(key, 'utf8').toString('base64'),
  );
};

export const getPushLocalKey = (address: string): string => {
  const cachedKey = localStorage.getItem(
    getCacheKey('pushKey', address.toLowerCase()),
  );
  if (cachedKey) {
    return Buffer.from(cachedKey, 'base64').toString('utf8');
  }
  return '';
};

export const setCachedResolution = (resolution: AddressResolution): void => {
  localStorage.setItem(
    getCacheKey(DomainProfileKeys.Resolution, resolution.address.toLowerCase()),
    JSON.stringify(resolution),
  );
};

export const getCachedResolution = (
  address: string,
): AddressResolution | undefined => {
  const cachedResolution = localStorage.getItem(
    getCacheKey(DomainProfileKeys.Resolution, address.toLowerCase()),
  );
  if (cachedResolution) {
    return JSON.parse(cachedResolution);
  }
  return;
};
