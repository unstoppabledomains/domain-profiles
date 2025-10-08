import type * as PushAPI from '@pushprotocol/restapi';
import {fetcher} from '@xmtp/proto';
import {compress, decompress} from 'compress-json';

import type {ChromeStorageType} from '../../hooks/useChromeStorage';
import {
  isChromeStorageSupported,
  isChromeStorageType,
} from '../../hooks/useChromeStorage';
import {DomainProfileKeys} from '../../lib/types/domain';
import {WalletStorageProvider} from '../../lib/wallet/storage/provider';
import type {AddressResolution} from './types';

export const PUSH_MESSAGES: Record<string, PushAPI.IMessageIPFS> = {};
export const PUSH_USERS: Record<string, PushAPI.IUser> = {};

export const clearMessagingConfig = async () => {
  const address = await getXmtpLocalAddress();
  if (address) {
    await localStorageWrapper.removeItem(
      getCacheKey(DomainProfileKeys.GenericKeyValue, ''),
    );
    await localStorageWrapper.removeItem(getCacheKey('xmtp', 'address'));
    await removeXmtpLocalKey(address);
    await removePushLocalKey(address);
  }
};

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

type localStorageType = ChromeStorageType | 'wallet';

interface localStorageWrapperOptions {
  type: localStorageType;
  accountId?: string;
  accessToken?: string;
}

export const getXmtpLocalAddress = async (): Promise<string | null> => {
  return await localStorageWrapper.getItem(getCacheKey('xmtp', 'address'));
};

export const getXmtpLocalKey = async (
  address: string,
): Promise<Uint8Array | undefined> => {
  const cachedKey = await localStorageWrapper.getItem(
    getCacheKey('xmtpInboxKey', address.toLowerCase()),
  );
  if (cachedKey) {
    try {
      // decode the local key
      const localKeyBytes = fetcher.b64Decode(cachedKey);

      // validate the local key
      if (localKeyBytes.length !== 32) {
        return;
      }

      // return the local key
      return localKeyBytes;
    } catch (e) {
      return;
    }
  }
  return;
};

export class localStorageWrapper {
  static async getItem(
    k: string,
    opts: localStorageWrapperOptions = {type: 'local'},
  ): Promise<string | null> {
    return isChromeStorageType(opts.type) && isChromeStorageSupported(opts.type)
      ? await localStorageWrapper.getChromeStorage(k, opts.type)
      : opts.type === 'wallet' && opts.accessToken
      ? WalletStorageProvider.getItem(k, opts.accessToken, opts.accountId)
      : localStorage.getItem(k);
  }

  static async setItem(
    k: string,
    v: string,
    opts: localStorageWrapperOptions = {type: 'local'},
  ): Promise<void> {
    if (isChromeStorageType(opts.type) && isChromeStorageSupported(opts.type)) {
      await chrome.storage[opts.type].set({[k]: v});
      return;
    } else if (opts.type === 'wallet' && opts.accessToken) {
      await WalletStorageProvider.setItem(
        k,
        v,
        opts.accessToken,
        opts.accountId,
      );
      return;
    }
    localStorage.setItem(k, v);
  }

  static async removeItem(
    k: string,
    opts: localStorageWrapperOptions = {type: 'local'},
  ): Promise<void> {
    if (isChromeStorageType(opts.type) && isChromeStorageSupported(opts.type)) {
      await chrome.storage[opts.type].remove(k);
      return;
    } else if (opts.type === 'wallet' && opts.accessToken) {
      await WalletStorageProvider.removeItem(
        k,
        opts.accessToken,
        opts.accountId,
      );
      return;
    }
    localStorage.removeItem(k);
  }

  static async clear(
    opts: localStorageWrapperOptions = {type: 'local'},
  ): Promise<void> {
    if (isChromeStorageType(opts.type) && isChromeStorageSupported(opts.type)) {
      await chrome.storage[opts.type].clear();
      return;
    } else if (opts.type === 'wallet' && opts.accessToken) {
      await WalletStorageProvider.clear(opts.accessToken, opts.accountId);
      return;
    }
    localStorage.clear();
  }

  private static async getChromeStorage(
    k: string,
    type: ChromeStorageType,
  ): Promise<string | null> {
    const v = await chrome.storage[type].get(k);
    if (v[k]) {
      return v[k];
    }
    return null;
  }
}

export const removePushLocalKey = async (address: string) => {
  await localStorageWrapper.removeItem(
    getCacheKey('pushKey', address.toLowerCase()),
  );
};

export const removeXmtpLocalKey = async (address: string) => {
  await localStorageWrapper.removeItem(
    getCacheKey('xmtpInboxKey', address.toLowerCase()),
  );
};

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

export const setXmtpLocalAddress = async (address: string) => {
  await localStorageWrapper.setItem(getCacheKey('xmtp', 'address'), address);
};

export const setXmtpLocalKey = async (address: string, key: Uint8Array) => {
  await localStorageWrapper.setItem(
    getCacheKey('xmtpInboxKey', address.toLowerCase()),
    fetcher.b64Encode(key, 0, key.length),
  );
};
