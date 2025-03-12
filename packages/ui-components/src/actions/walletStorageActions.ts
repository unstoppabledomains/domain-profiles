import config from '@unstoppabledomains/config';

import {fetchApi} from '../lib/fetchApi';
import type {WalletStorageData} from '../lib/types/walletStorage';

const WALLET_KEY_NAME = 'general-preferences';

export const clearWalletStorageData = async (
  accountId: string,
  accessToken: string,
) => {
  try {
    // remove data from storage
    const response = await fetchApi<WalletStorageData>(
      `/user/${accountId}/wallet/storage/${WALLET_KEY_NAME}`,
      {
        host: config.PROFILE.HOST_URL,
        method: 'DELETE',
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    // update cache and return
    if (response) {
      sessionStorage.removeItem(WALLET_KEY_NAME);
      return response;
    }
  } catch (e) {}
  return undefined;
};

export const getWalletStorageData = async (
  accountId: string,
  accessToken: string,
  forceRefresh = false,
) => {
  try {
    // retrieve from session storage if available
    const data = sessionStorage.getItem(WALLET_KEY_NAME);
    if (data && !forceRefresh) {
      return JSON.parse(data);
    }

    // retrieve new data if not available in session storage
    const response = await fetchApi<WalletStorageData>(
      `/user/${accountId}/wallet/storage/${WALLET_KEY_NAME}`,
      {
        host: config.PROFILE.HOST_URL,
        method: 'GET',
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    // update cache and return
    sessionStorage.setItem(WALLET_KEY_NAME, JSON.stringify(response || {}));
    if (response) {
      return response;
    }
  } catch (e) {
    // set empty object in session storage
    sessionStorage.setItem(WALLET_KEY_NAME, JSON.stringify({}));
  }
  return undefined;
};

export const setWalletStorageData = async (
  data: Record<string, string>,
  accountId: string,
  accessToken: string,
) => {
  try {
    const response = await fetchApi<WalletStorageData>(
      `/user/${accountId}/wallet/storage/${WALLET_KEY_NAME}`,
      {
        host: config.PROFILE.HOST_URL,
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(JSON.stringify(data)),
      },
    );

    // update cache and return
    if (response) {
      sessionStorage.setItem(WALLET_KEY_NAME, JSON.stringify(response));
      return response;
    }
  } catch (e) {}
  return undefined;
};
