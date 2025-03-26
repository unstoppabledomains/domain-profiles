import {Mutex} from 'async-mutex';

import config from '@unstoppabledomains/config';

import {notifyEvent} from '../lib';
import {fetchApi} from '../lib/fetchApi';
import type {WalletStorageData} from '../lib/types/walletStorage';
import {getAccountId} from './fireBlocksActions';

// wallet storage control variables
const WALLET_KEY_NAME = 'general-preferences';
const walletStorageMutex = new Mutex();
let walletStorageCache: WalletStorageData | undefined;

export const clearWalletStorageData = async (
  accessToken: string,
  accountId?: string,
): Promise<WalletStorageData | undefined> => {
  return await walletStorageMutex.runExclusive(async () => {
    try {
      // retrieve account ID if empty
      const normalizedAccountId =
        accountId ?? (await getAccountId(accessToken, true));
      if (!normalizedAccountId) {
        return undefined;
      }

      // remove data from storage
      const response = await fetchApi<WalletStorageData>(
        `/user/${normalizedAccountId}/wallet/storage/${WALLET_KEY_NAME}`,
        {
          host: config.PROFILE.HOST_URL,
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      // update cache and return
      if (response) {
        walletStorageCache = undefined;
        return response;
      }
    } catch (e) {}
    return undefined;
  });
};

export const getWalletStorageData = async (
  accessToken: string,
  accountId?: string,
  forceRefresh = false,
): Promise<WalletStorageData | undefined> => {
  return await walletStorageMutex.runExclusive(async () => {
    try {
      // retrieve from session storage if available
      if (walletStorageCache && !forceRefresh) {
        return walletStorageCache;
      }

      // retrieve account ID if empty
      const normalizedAccountId =
        accountId ?? (await getAccountId(accessToken, true));
      if (!normalizedAccountId) {
        return undefined;
      }

      // retrieve new data if not available in session storage
      const response = await fetchApi<WalletStorageData>(
        `/user/${normalizedAccountId}/wallet/storage/${WALLET_KEY_NAME}`,
        {
          host: config.PROFILE.HOST_URL,
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      // update cache and return
      if (response) {
        walletStorageCache = response;
        return response;
      }
    } catch (e) {
      // set empty object in session storage
      notifyEvent(e, 'error', 'Wallet', 'Configuration');
      walletStorageCache = undefined;
    }
    return undefined;
  });
};

export const setWalletStorageData = async (
  data: Record<string, string>,
  accessToken: string,
  accountId?: string,
): Promise<WalletStorageData | undefined> => {
  return await walletStorageMutex.runExclusive(async () => {
    try {
      // retrieve account ID if empty
      const normalizedAccountId =
        accountId ?? (await getAccountId(accessToken, true));
      if (!normalizedAccountId) {
        return undefined;
      }

      // set the wallet storage data
      const response = await fetchApi<WalletStorageData>(
        `/user/${normalizedAccountId}/wallet/storage/${WALLET_KEY_NAME}`,
        {
          host: config.PROFILE.HOST_URL,
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(data),
        },
      );

      // update cache and return
      if (response) {
        walletStorageCache = response;
        return response;
      }
    } catch (e) {
      notifyEvent(e, 'error', 'Wallet', 'Configuration');
    }
    return undefined;
  });
};
