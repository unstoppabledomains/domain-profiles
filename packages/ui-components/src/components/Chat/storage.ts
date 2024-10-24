import type * as PushAPI from '@pushprotocol/restapi';
import {fetcher} from '@xmtp/proto';
import {compress, decompress} from 'compress-json';

import {isChromeStorageSupported} from '../../hooks/useChromeStorage';
import {DomainProfileKeys} from '../../lib/types/domain';
import type {AddressResolution} from './types';

export const PUSH_MESSAGES: Record<string, PushAPI.IMessageIPFS> = {};
export const PUSH_USERS: Record<string, PushAPI.IUser> = {};

export const getCacheKey = (prefix: string, address: string): string => {
  return `${DomainProfileKeys.Messaging}-${prefix}-${address}`;
};

export const getCachedResolution = async (
  address: string,
): Promise<AddressResolution | undefined> => {
  const cachedResolution = await localStorageWrapper.getItem(
    getCacheKey(DomainProfileKeys.Resolution, address.toLowerCase()),
  );
  if (cachedResolution) {
    return JSON.parse(cachedResolution);
  }
  return;
};

export const getLocalKey = async <T>(key: string) => {
  const cachedDataStr = await localStorageWrapper.getItem(
    getCacheKey(DomainProfileKeys.GenericKeyValue, ''),
  );
  if (!cachedDataStr) {
    return;
  }
  const cachedData: Record<string, T> = decompress(JSON.parse(cachedDataStr));
  return cachedData[key];
};

export const getPushLocalKey = async (address: string): Promise<string> => {
  const cachedKey = await localStorageWrapper.getItem(
    getCacheKey('pushKey', address.toLowerCase()),
  );
  if (cachedKey) {
    return Buffer.from(cachedKey, 'base64').toString('utf8');
  }
  return '';
};

export const getXmtpLocalKey = async (
  address: string,
): Promise<Uint8Array | undefined> => {
  const cachedKey = await localStorageWrapper.getItem(
    getCacheKey('xmtpKey', address.toLowerCase()),
  );
  if (cachedKey) {
    return fetcher.b64Decode(cachedKey);
  }
  return;
};

export class localStorageWrapper {
  static async getItem(k: string): Promise<string | null> {
    return isChromeStorageSupported('local')
      ? await localStorageWrapper.getChromeStorage(k)
      : localStorage.getItem(k);
  }

  static async setItem(k: string, v: string): Promise<void> {
    if (isChromeStorageSupported('local')) {
      await chrome.storage.local.set({[k]: v});
      return;
    }
    localStorage.setItem(k, v);
  }

  static async removeItem(k: string): Promise<void> {
    if (isChromeStorageSupported('local')) {
      await chrome.storage.local.remove(k);
      return;
    }
    localStorage.removeItem(k);
  }

  static async clear(): Promise<void> {
    if (isChromeStorageSupported('local')) {
      await chrome.storage.local.clear();
      return;
    }
    localStorage.clear();
  }

  private static async getChromeStorage(k: string): Promise<string | null> {
    const v = await chrome.storage.local.get(k);
    if (v[k]) {
      return v[k];
    }
    return null;
  }
}

export const setCachedResolution = async (
  resolution: AddressResolution,
): Promise<void> => {
  await localStorageWrapper.setItem(
    getCacheKey(DomainProfileKeys.Resolution, resolution.address.toLowerCase()),
    JSON.stringify(resolution),
  );
};

export const setLocalKey = async <T>(key: string, msg: T) => {
  if (!key) {
    return;
  }
  const cachedDataStr = await localStorageWrapper.getItem(
    getCacheKey(DomainProfileKeys.GenericKeyValue, ''),
  );
  const cachedData: Record<string, T> = cachedDataStr
    ? decompress(JSON.parse(cachedDataStr))
    : {};
  cachedData[key] = msg;
  try {
    await localStorageWrapper.setItem(
      getCacheKey(DomainProfileKeys.GenericKeyValue, ''),
      JSON.stringify(compress(cachedData)),
    );
  } catch (e) {
    await localStorageWrapper.removeItem(
      getCacheKey(DomainProfileKeys.GenericKeyValue, ''),
    );
  }
};

export const setPushLocalKey = async (address: string, key: string) => {
  await localStorageWrapper.setItem(
    getCacheKey('pushKey', address.toLowerCase()),
    Buffer.from(key, 'utf8').toString('base64'),
  );
};

export const setXmtpLocalKey = async (address: string, key: Uint8Array) => {
  await localStorageWrapper.setItem(
    getCacheKey('xmtpKey', address.toLowerCase()),
    fetcher.b64Encode(key, 0, key.length),
  );
};
