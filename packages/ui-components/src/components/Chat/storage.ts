import type * as PushAPI from '@pushprotocol/restapi';
import {fetcher} from '@xmtp/proto';
import {compress, decompress} from 'compress-json';

import {DomainProfileKeys} from '../../lib/types/domain';
import type {AddressResolution} from './types';

export const PUSH_MESSAGES: Record<string, PushAPI.IMessageIPFS> = {};
export const PUSH_USERS: Record<string, PushAPI.IUser> = {};

export const getCacheKey = (prefix: string, address: string): string => {
  return `${DomainProfileKeys.Messaging}-${prefix}-${address}`;
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

export const getLocalKey = <T>(key: string) => {
  const cachedDataStr = localStorage.getItem(
    getCacheKey(DomainProfileKeys.GenericKeyValue, ''),
  );
  if (!cachedDataStr) {
    return;
  }
  const cachedData: Record<string, T> = decompress(JSON.parse(cachedDataStr));
  return cachedData[key];
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

export const getXmtpLocalKey = (address: string): Uint8Array | undefined => {
  const cachedKey = localStorage.getItem(
    getCacheKey('xmtpKey', address.toLowerCase()),
  );
  if (cachedKey) {
    return fetcher.b64Decode(cachedKey);
  }
  return;
};

export const setCachedResolution = (resolution: AddressResolution): void => {
  localStorage.setItem(
    getCacheKey(DomainProfileKeys.Resolution, resolution.address.toLowerCase()),
    JSON.stringify(resolution),
  );
};

export const setLocalKey = <T>(key: string, msg: T) => {
  if (!key) {
    return;
  }
  const cachedDataStr = localStorage.getItem(
    getCacheKey(DomainProfileKeys.GenericKeyValue, ''),
  );
  const cachedData: Record<string, T> = cachedDataStr
    ? decompress(JSON.parse(cachedDataStr))
    : {};
  cachedData[key] = msg;
  try {
    localStorage.setItem(
      getCacheKey(DomainProfileKeys.GenericKeyValue, ''),
      JSON.stringify(compress(cachedData)),
    );
  } catch (e) {
    localStorage.removeItem(getCacheKey(DomainProfileKeys.GenericKeyValue, ''));
  }
};

export const setPushLocalKey = (address: string, key: string) => {
  localStorage.setItem(
    getCacheKey('pushKey', address.toLowerCase()),
    Buffer.from(key, 'utf8').toString('base64'),
  );
};

export const setXmtpLocalKey = (address: string, key: Uint8Array) => {
  localStorage.setItem(
    getCacheKey('xmtpKey', address.toLowerCase()),
    fetcher.b64Encode(key, 0, key.length),
  );
};
