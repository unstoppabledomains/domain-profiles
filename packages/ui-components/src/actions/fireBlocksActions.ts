import Bluebird from 'bluebird';

import config from '@unstoppabledomains/config';

import type {TokenType} from '../lib';
import {fetchApi} from '../lib';
import {notifyEvent} from '../lib/error';
import {
  getBootstrapState,
  saveBootstrapState,
} from '../lib/fireBlocks/storage/state';
import {pollUntilSuccess} from '../lib/poll';
import {sleep} from '../lib/sleep';
import {
  OperationStatus,
  type AccountAsset,
  type GetAccountAssetsResponse,
  type GetAccountsResponse,
  type GetAuthorizationTxResponse,
  type GetBootstrapTokenResponse,
  type GetOperationResponse,
  type GetOperationStatusResponse,
  type GetTokenResponse,
} from '../lib/types/fireBlocks';

export const confirmAuthorizationTokenTx = async (
  bootstrapJwt: string,
): Promise<GetTokenResponse | undefined> => {
  try {
    // confirm the transaction to retrieve auth tokens
    const getTokenResponse = await fetchApi<GetTokenResponse>(
      '/auth/tokens/confirm',
      {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Access-Control-Allow-Credentials': 'true',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bootstrapJwt}`,
        },
        host: config.WALLETS.HOST_URL,
        acceptStatusCodes: [400],
      },
    );

    // return the successfully retrieved tokens
    if (getTokenResponse?.accessToken) {
      return getTokenResponse;
    }

    // retry if the state is reported as processing
    if (getTokenResponse?.code === 'PROCESSING') {
      await sleep(250);
      return await confirmAuthorizationTokenTx(bootstrapJwt);
    }
  } catch (e) {
    notifyEvent(e, 'error', 'Wallet', 'Fetch', {
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
    setAccessToken: (v: string) => void;
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
      // retrieve existing state
      const existingState = getBootstrapState(opts.state);

      // save new state
      await saveBootstrapState(
        {
          assets: existingState?.assets || [],
          bootstrapToken: newTokens.bootstrapToken,
          refreshToken: newTokens.refreshToken,
          deviceId: opts.deviceId,
        },
        opts.state,
        opts.saveState,
        newTokens.accessToken,
      );

      // store access token in memory
      opts.setAccessToken(newTokens.accessToken);
    }
    return newTokens;
  } catch (e) {
    notifyEvent(e, 'error', 'Wallet', 'Fetch', {
      msg: 'error refreshing tokens',
    });
  }
  return undefined;
};

export const getAccountAssets = async (
  accessToken: string,
): Promise<AccountAsset[] | undefined> => {
  try {
    // retrieve the accounts associated with the access token
    const accounts = await getAccounts(accessToken);
    if (!accounts) {
      throw new Error('invalid access token');
    }

    // query addresses belonging to accounts
    const accountAssets: AccountAsset[] = [];
    await Bluebird.map(accounts.items, async account => {
      const assets = await getAssets(accessToken, account.id);
      return (assets?.items || []).map(asset => {
        asset.accountId = account.id;
        accountAssets.push(asset);
      });
    });

    // return all aggregated assets
    return accountAssets;
  } catch (e) {
    notifyEvent(e, 'error', 'Wallet', 'Fetch', {
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
    notifyEvent(e, 'error', 'Wallet', 'Fetch', {
      msg: 'error retrieving accounts',
    });
  }
  return undefined;
};

export const getAssets = async (
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
    notifyEvent(e, 'error', 'Wallet', 'Fetch', {
      msg: 'error retrieving account assets',
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
    notifyEvent(e, 'error', 'Wallet', 'Fetch', {
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
    notifyEvent(e, 'error', 'Wallet', 'Fetch', {
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
    notifyEvent(e, 'error', 'Wallet', 'Fetch', {
      msg: 'error retrieving bootstrap token',
    });
  }
  return undefined;
};

export const getMessageSignature = async (
  accessToken: string,
  message: string,
  onSignTx: (txId: string) => Promise<void>,
  opts?: {
    address?: string;
    onStatusChange?: (status: string) => void;
  },
): Promise<string | undefined> => {
  try {
    // retrieve the accounts associated with the access token
    if (opts?.onStatusChange) {
      opts.onStatusChange('retrieving account');
    }
    const assets = await getAccountAssets(accessToken);
    if (!assets) {
      throw new Error('account assets not found');
    }

    // retrieve the asset associated with the optionally requested address,
    // otherwise just retrieve the first first asset.
    const asset =
      assets.find(
        a => a.address.toLowerCase() === opts?.address?.toLowerCase(),
      ) || assets[0];
    if (!asset) {
      throw new Error('address not found in account');
    }

    // initialize a transaction to retrieve auth tokens
    if (opts?.onStatusChange) {
      opts.onStatusChange('starting MPC signature');
    }
    const operationResponse = await fetchApi<GetOperationResponse>(
      `/accounts/${asset.accountId}/assets/${asset.id}/signatures`,
      {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Access-Control-Allow-Credentials': 'true',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        host: config.WALLETS.HOST_URL,
        body: JSON.stringify({message, encoding: 'utf8'}),
      },
    );
    if (!operationResponse) {
      throw new Error('error requesting signature');
    }

    // wait up to 30 seconds for the signature TX to pass to the client
    if (opts?.onStatusChange) {
      opts.onStatusChange('waiting to sign with local key');
    }
    for (let i = 0; i < 60; i++) {
      const operationStatus = await getOperationStatus(
        accessToken,
        operationResponse.operation.id,
      );
      if (!operationStatus) {
        throw new Error('error requesting signature operation status');
      }
      if (
        operationStatus.status === 'SIGNATURE_REQUIRED' &&
        operationStatus.transaction?.externalVendorTransactionId
      ) {
        // request for the client to sign the Tx string
        if (opts?.onStatusChange) {
          opts.onStatusChange('signing with local key');
        }
        await onSignTx(operationStatus.transaction.externalVendorTransactionId);
        break;
      }
      await sleep(500);
    }

    // wait up to 30 seconds for the signature to be completed
    if (opts?.onStatusChange) {
      opts.onStatusChange('waiting for MPC signature');
    }
    for (let i = 0; i < 60; i++) {
      const operationStatus = await getOperationStatus(
        accessToken,
        operationResponse.operation.id,
      );
      if (!operationStatus) {
        throw new Error('error requesting signature operation status');
      }
      if (
        operationStatus.status === 'COMPLETED' &&
        operationStatus.result?.signature
      ) {
        if (opts?.onStatusChange) {
          opts.onStatusChange('signature completed');
        }
        return operationStatus.result.signature;
      }
      await sleep(500);
    }

    // reaching this point means the signature was not successful
    throw new Error('failed to sign message');
  } catch (e) {
    if (opts?.onStatusChange) {
      opts.onStatusChange('signature failed');
    }
    notifyEvent(e, 'error', 'Wallet', 'Signature', {
      msg: 'error signing message',
    });
  }
  return undefined;
};

export const getOperationStatus = async (
  accessToken: string,
  operationId: string,
): Promise<GetOperationStatusResponse> => {
  return await fetchApi(`/operations/${operationId}`, {
    method: 'GET',
    mode: 'cors',
    headers: {
      'Access-Control-Allow-Credentials': 'true',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    host: config.WALLETS.HOST_URL,
  });
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
    notifyEvent(e, 'error', 'Wallet', 'Fetch', {
      msg: 'error sending bootstrap code',
    });
  }
  return false;
};

export const sendCrypto = async (
  accessToken: string,
  sourceAddress: string,
  sourceSymbol: string,
  destinationAddress: string,
  crypto: {
    type: TokenType;
    amount: number;
    id?: string;
  },
  onSignTx: (txId: string) => Promise<void>,
  opts?: {
    onStatusChange?: (status: string) => void;
    onTxId?: (txId: string) => void;
  },
): Promise<void> => {
  try {
    // retrieve the accounts associated with the access token
    if (opts?.onStatusChange) {
      opts.onStatusChange('retrieving account');
    }
    const assets = await getAccountAssets(accessToken);
    if (!assets) {
      throw new Error('account assets not found');
    }

    // retrieve the asset associated with the optionally requested address,
    // otherwise just retrieve the first first asset.
    const asset = assets.find(
      a =>
        a.blockchainAsset.symbol.toLowerCase() === sourceSymbol.toLowerCase() &&
        a.address.toLowerCase() === sourceAddress.toLowerCase(),
    );
    if (!asset) {
      throw new Error('address not found in account');
    }

    // initialize a transaction to retrieve auth tokens
    if (opts?.onStatusChange) {
      opts.onStatusChange('starting MPC transaction');
    }
    const operationResponse = await fetchApi<GetOperationResponse>(
      `/accounts/${asset.accountId}/assets/${asset.id}/transfers`,
      {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Access-Control-Allow-Credentials': 'true',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        host: config.WALLETS.HOST_URL,
        body: JSON.stringify({
          destinationAddress,
          amount: String(crypto.amount),
        }),
      },
    );
    if (!operationResponse) {
      throw new Error('error starting transaction');
    }

    // wait up to 30 seconds for the TX to pass to the client
    if (opts?.onStatusChange) {
      opts.onStatusChange('waiting to sign with local key');
    }
    await pollUntilSuccess({
      fn: async () => {
        const operationStatus = await getOperationStatus(
          accessToken,
          operationResponse.operation.id,
        );
        if (!operationStatus) {
          throw new Error('error requesting transaction operation status');
        }
        if (
          operationStatus.status === OperationStatus.SIGNATURE_REQUIRED &&
          operationStatus.transaction?.externalVendorTransactionId
        ) {
          // request for the client to sign the Tx string
          if (opts?.onStatusChange) {
            opts.onStatusChange('signing transaction with local key');
          }
          await onSignTx(
            operationStatus.transaction.externalVendorTransactionId,
          );
          return {success: true};
        }
        return {success: false};
      },
      attempts: 60,
      interval: 1500,
    });

    if (opts?.onStatusChange) {
      opts.onStatusChange('waiting for MPC transaction');
    }
    const {success} = await pollUntilSuccess({
      fn: async () => {
        const operationStatus = await getOperationStatus(
          accessToken,
          operationResponse.operation.id,
        );
        if (!operationStatus) {
          throw new Error('error requesting transaction operation status');
        }
        if (operationStatus.transaction?.id && opts?.onTxId) {
          opts.onTxId(operationStatus.transaction.id);
        }
        if (operationStatus.status === OperationStatus.COMPLETED) {
          if (opts?.onStatusChange) {
            opts.onStatusChange('transaction completed');
          }
          return {success: true};
        }
        if (operationStatus.status === OperationStatus.FAILED) {
          throw new Error("Failed transaction")
        }
        return {success: false};
      },
      attempts: 300,
      interval: 1500,
    });
    if (!success) {
      throw new Error('failed to complete transaction');
    }
  } catch (e) {
    if (opts?.onStatusChange) {
      opts.onStatusChange('Transaction failed');
    }
    notifyEvent(e, 'error', 'Wallet', 'Signature', {
      msg: 'error sending crypto',
      meta: crypto,
    });
    throw e;
  }
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
    notifyEvent(e, 'error', 'Wallet', 'Fetch', {
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
    notifyEvent(e, 'error', 'Wallet', 'Fetch', {
      msg: 'error retrieving bootstrap token',
    });
    throw e;
  }
};
