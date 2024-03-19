import config from '@unstoppabledomains/config';

import {fetchApi} from '../lib';
import {notifyEvent} from '../lib/error';
import {saveState} from '../lib/fireBlocks/storage/state';
import {sleep} from '../lib/sleep';
import type {
  GetAccountAssetsResponse,
  GetAccountsResponse,
  GetAuthorizationTxResponse,
  GetBootstrapTokenResponse,
  GetTokenResponse,
} from '../lib/types/fireBlocks';

export const confirmAuthorizationTokenTx = async (
  bootstrapJwt: string,
): Promise<GetTokenResponse | undefined> => {
  try {
    // confirm the transaction to retrieve auth tokens
    return await fetchApi<GetTokenResponse>('/auth/tokens/confirm', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Access-Control-Allow-Credentials': 'true',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bootstrapJwt}`,
      },
      host: config.WALLETS.HOST_URL,
    });
  } catch (e) {
    notifyEvent(e, 'error', 'WALLET', 'Fetch', {
      msg: 'error confirming authorization token tx',
    });
  }
  return undefined;
};

export const getAccessToken = async (
  refreshToken: string,
  opts?: {
    deviceId: string;
    state: Record<string, Record<string, string>>;
    saveState: (state: Record<string, Record<string, string>>) => void;
  },
): Promise<GetTokenResponse | undefined> => {
  try {
    // retrieve a new set of tokens using the refresh token
    const newTokens = await fetchApi<GetTokenResponse>('/auth/tokens/refresh', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Access-Control-Allow-Credentials': 'true',
        'Content-Type': 'application/json',
      },
      host: config.WALLETS.HOST_URL,
      body: JSON.stringify({
        refreshToken,
      }),
    });

    if (opts) {
      saveState(
        {
          bootstrapToken: newTokens.bootstrapToken,
          refreshToken: newTokens.refreshToken,
          deviceId: opts.deviceId,
        },
        opts.state,
        opts.saveState,
      );
    }
    return newTokens;
  } catch (e) {
    notifyEvent(e, 'error', 'WALLET', 'Fetch', {
      msg: 'error refreshing tokens',
    });
  }
  return undefined;
};

export const getAccountAssets = async (
  accessToken: string,
  accountId: string,
): Promise<GetAccountAssetsResponse | undefined> => {
  try {
    // retrieve a new set of tokens using the refresh token
    return await fetchApi<GetAccountAssetsResponse>(
      `/accounts/${accountId}/assets`,
      {
        mode: 'cors',
        headers: {
          'Access-Control-Allow-Credentials': 'true',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        host: config.WALLETS.HOST_URL,
      },
    );
  } catch (e) {
    notifyEvent(e, 'error', 'WALLET', 'Fetch', {
      msg: 'error retrieving account assets',
    });
  }
  return undefined;
};

export const getAccounts = async (
  accessToken: string,
): Promise<GetAccountsResponse | undefined> => {
  try {
    // retrieve a new set of tokens using the refresh token
    return await fetchApi<GetAccountsResponse>('/accounts', {
      mode: 'cors',
      headers: {
        'Access-Control-Allow-Credentials': 'true',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      host: config.WALLETS.HOST_URL,
    });
  } catch (e) {
    notifyEvent(e, 'error', 'WALLET', 'Fetch', {
      msg: 'error retrieving accounts',
    });
  }
  return undefined;
};

export const getAuthorizationTokenTx = async (
  bootstrapJwt: string,
): Promise<GetAuthorizationTxResponse | undefined> => {
  try {
    // initialize a transaction to retrieve auth tokens
    const txInitResponse = await fetchApi('/auth/tokens/setup', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Access-Control-Allow-Credentials': 'true',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bootstrapJwt}`,
      },
      host: config.WALLETS.HOST_URL,
    });
    if (!txInitResponse) {
      return;
    }

    // wait for the Tx to reach pending state
    let tx = await getAuthorizationTokenTxStatus(bootstrapJwt);
    for (let i = 0; i < 10 && tx?.status !== 'PENDING_SIGNATURE'; i++) {
      if (!tx) {
        return;
      }
      await sleep(500);
      tx = await getAuthorizationTokenTxStatus(bootstrapJwt);
    }
    return tx;
  } catch (e) {
    notifyEvent(e, 'error', 'WALLET', 'Fetch', {
      msg: 'error initializing authorization token tx',
    });
  }
  return undefined;
};

export const getAuthorizationTokenTxStatus = async (
  bootstrapJwt: string,
): Promise<GetAuthorizationTxResponse | undefined> => {
  try {
    // initialize a transaction to retrieve auth tokens
    return await fetchApi<GetAuthorizationTxResponse>('/auth/tokens/setup', {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Access-Control-Allow-Credentials': 'true',
        Authorization: `Bearer ${bootstrapJwt}`,
      },
      host: config.WALLETS.HOST_URL,
    });
  } catch (e) {
    notifyEvent(e, 'error', 'WALLET', 'Fetch', {
      msg: 'error retrieving authorization token tx status',
    });
  }
  return undefined;
};

export const getBootstrapToken = async (
  bootstrapCode: string,
  deviceId?: string,
): Promise<GetBootstrapTokenResponse | undefined> => {
  try {
    return await fetchApi<GetBootstrapTokenResponse>('/auth/bootstrap', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Access-Control-Allow-Credentials': 'true',
        'Content-Type': 'application/json',
      },
      host: config.WALLETS.HOST_URL,
      body: JSON.stringify({code: bootstrapCode, device: deviceId || null}),
    });
  } catch (e) {
    notifyEvent(e, 'error', 'WALLET', 'Fetch', {
      msg: 'error retrieving bootstrap token',
    });
  }
  return undefined;
};

export const sendBootstrapCode = async (
  emailAddress: string,
): Promise<boolean> => {
  try {
    await fetchApi('/auth/bootstrap/email', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      host: config.WALLETS.HOST_URL,
      body: JSON.stringify({
        email: emailAddress,
      }),
    });
    return true;
  } catch (e) {
    notifyEvent(e, 'error', 'WALLET', 'Fetch', {
      msg: 'error sending bootstrap code',
    });
  }
  return false;
};

export const sendJoinRequest = async (
  walletJoinRequestId: string,
  bootstrapJwt: string,
  recoveryPassphrase: string,
): Promise<boolean> => {
  try {
    const joinResult = await fetchApi('/auth/devices/bootstrap', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Access-Control-Allow-Credentials': 'true',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bootstrapJwt}`,
      },
      host: config.WALLETS.HOST_URL,
      body: JSON.stringify({
        walletJoinRequestId,
        recoveryPassphrase,
      }),
    });
    if (!joinResult) {
      return false;
    }
    return true;
  } catch (e) {
    notifyEvent(e, 'error', 'WALLET', 'Fetch', {
      msg: 'error retrieving bootstrap token',
    });
  }
  return false;
};

export const sendRpcMessage = async <T>(
  message: unknown,
  jwt: string,
): Promise<T> => {
  try {
    return await fetchApi<T>('/rpc/messages', {
      method: 'POST',
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Access-Control-Allow-Credentials': 'true',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      host: config.WALLETS.HOST_URL,
      body: JSON.stringify({message}),
    });
  } catch (e) {
    notifyEvent(e, 'error', 'WALLET', 'Fetch', {
      msg: 'error retrieving bootstrap token',
    });
    throw e;
  }
};
