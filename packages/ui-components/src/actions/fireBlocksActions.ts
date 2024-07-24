import Bluebird from 'bluebird';
import {utils as EthersUtils} from 'ethers';
import QueryString from 'qs';

import config from '@unstoppabledomains/config';

import {fetchApi} from '../lib';
import {notifyEvent} from '../lib/error';
import {FB_MAX_RETRY, FB_WAIT_TIME_MS} from '../lib/fireBlocks/client';
import {
  getBootstrapState,
  saveBootstrapState,
} from '../lib/fireBlocks/storage/state';
import {sleep} from '../lib/sleep';
import type {
  AccountAsset,
  CreateTransaction,
  GetAccountAssetsResponse,
  GetAccountsResponse,
  GetAuthorizationTxResponse,
  GetBootstrapTokenResponse,
  GetEstimateTransactionResponse,
  GetOperationListResponse,
  GetOperationResponse,
  GetOperationStatusResponse,
  GetTokenResponse,
} from '../lib/types/fireBlocks';

export enum OperationStatus {
  QUEUED = 'QUEUED',
  SIGNATURE_REQUIRED = 'SIGNATURE_REQUIRED',
}

export enum SendCryptoStatusMessage {
  CREATING_WALLET = 'Preparing transfer...',
  CHECKING_QUEUE = 'Checking queued transfers...',
  STARTING_TRANSACTION = 'Starting transfer...',
  WAITING_TO_SIGN = 'Waiting to approve transfer...',
  SIGNING = 'Approving transfer...',
  SUBMITTING_TRANSACTION = 'Submitting transfer...',
  WAITING_FOR_TRANSACTION = 'Waiting for transfer to complete...',
  TRANSACTION_COMPLETED = 'Transfer completed!',
  TRANSACTION_FAILED = 'Transfer failed',
}

export const cancelOperation = async (
  accessToken: string,
  operationId: string,
): Promise<void> => {
  return await fetchApi(`/operations/${operationId}`, {
    method: 'DELETE',
    mode: 'cors',
    headers: {
      'Access-Control-Allow-Credentials': 'true',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    host: config.WALLETS.HOST_URL,
  });
};

export const cancelPendingOperations = async (
  accessToken: string,
  accountId: string,
  assetId: string,
): Promise<GetOperationListResponse> => {
  // retrieve pending operations
  const opsToCancel = await getOperationList(accessToken, accountId, assetId);

  // cancel the operations
  await Bluebird.map(opsToCancel.items, async operation => {
    await cancelOperation(accessToken, operation.id);
  });
  return opsToCancel;
};

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
      await sleep(FB_MAX_RETRY);
      return await confirmAuthorizationTokenTx(bootstrapJwt);
    }
  } catch (e) {
    notifyEvent(e, 'error', 'Wallet', 'Fetch', {
      msg: 'error confirming authorization token tx',
    });
  }
  return undefined;
};

export const createSignatureOperation = async (
  accessToken: string,
  accountId: string,
  assetId: string,
  message: string,
): Promise<GetOperationResponse | undefined> => {
  try {
    return await fetchApi<GetOperationResponse>(
      `/accounts/${accountId}/assets/${assetId}/signatures`,
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
          message,
          encoding: EthersUtils.isHexString(message) ? 'hex' : 'utf8',
        }),
      },
    );
  } catch (e) {
    notifyEvent(e, 'warning', 'Wallet', 'Signature', {
      meta: {accountId, assetId, message},
    });
  }
  return undefined;
};

export const createTransactionOperation = async (
  accessToken: string,
  accountId: string,
  assetId: string,
  tx: CreateTransaction,
): Promise<GetOperationResponse | undefined> => {
  try {
    return await fetchApi<GetOperationResponse>(
      `/accounts/${accountId}/assets/${assetId}/transactions`,
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
          destinationAddress: tx.contractAddress,
          data: tx.data,
          value: tx.value,
        }),
      },
    );
  } catch (e) {
    notifyEvent(e, 'warning', 'Wallet', 'Signature', {
      meta: {accountId, assetId, tx},
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
  balance?: boolean,
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
      const assets = await getAssets(accessToken, account.id, balance);
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
  balance?: boolean,
): Promise<GetAccountAssetsResponse | undefined> => {
  try {
    // retrieve a new set of tokens using the refresh token
    return await fetchApi<GetAccountAssetsResponse>(
      `/accounts/${accountId}/assets${balance ? '?$expand=balance' : ''}`,
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
    for (
      let i = 0;
      i < FB_MAX_RETRY && tx?.status !== 'PENDING_SIGNATURE';
      i++
    ) {
      if (!tx) {
        return;
      }
      await sleep(FB_WAIT_TIME_MS);
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

export const getTransactionGasEstimate = async (
  asset: AccountAsset,
  accessToken: string,
  tx: CreateTransaction,
) => {
  return fetchApi<GetEstimateTransactionResponse>(
    `/estimates/accounts/${asset.accountId}/assets/${asset.id}/transactions`,
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
        destinationAddress: tx.contractAddress,
        data: tx.data,
        value: tx.value,
      }),
    },
  );
};

export const getTransferGasEstimate = async (
  asset: AccountAsset,
  accessToken: string,
  destinationAddress: string,
  amount: string,
) => {
  return fetchApi<GetEstimateTransactionResponse>(
    `/estimates/accounts/${asset.accountId}/assets/${asset.id}/transfers`,
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
        amount,
      }),
    },
  );
};

export const signAndWait = async (
  accessToken: string,
  onGetOperation: () => Promise<GetOperationResponse | undefined>,
  onSignTx: (txId: string) => Promise<void>,
  opts?: {
    address?: string;
    onStatusChange?: (status: string) => void;
    isComplete?: (status: GetOperationStatusResponse) => boolean;
  },
): Promise<GetOperationStatusResponse | undefined> => {
  try {
    // initialize a transaction to retrieve auth tokens
    if (opts?.onStatusChange) {
      opts.onStatusChange('starting signing operation');
    }
    const operationResponse = await onGetOperation();
    if (!operationResponse) {
      throw new Error('error requesting signing operation');
    }

    // wait for the signature TX to pass to the client
    if (opts?.onStatusChange) {
      opts.onStatusChange('waiting to sign with local key');
    }
    let signedWithClient = false;
    for (let i = 0; i < FB_MAX_RETRY; i++) {
      const operationStatus = await getOperationStatus(
        accessToken,
        operationResponse.operation.id,
      );
      if (!operationStatus) {
        throw new Error('error requesting signature operation status');
      }

      // sign the Fireblocks transaction ID when requested
      if (
        !signedWithClient &&
        operationStatus.status === 'SIGNATURE_REQUIRED' &&
        operationStatus.transaction?.externalVendorTransactionId
      ) {
        // request for the client to sign the Tx string
        if (opts?.onStatusChange) {
          opts.onStatusChange('signing with local key');
        }
        await onSignTx(operationStatus.transaction.externalVendorTransactionId);
        signedWithClient = true;

        // indicate status change
        if (opts?.onStatusChange) {
          opts.onStatusChange('waiting for other signers');
        }
      }

      // throw an error for failure states
      if (
        operationStatus.status === 'CANCELLED' ||
        operationStatus.status === 'FAILED'
      ) {
        throw new Error(`signature ${operationStatus.status.toLowerCase()}`);
      }

      // return the completed signature
      if (operationStatus.status === 'COMPLETED') {
        if (opts?.onStatusChange) {
          opts.onStatusChange('signature completed');
        }
        if (opts?.isComplete) {
          if (opts.isComplete(operationStatus)) {
            return operationStatus;
          }
        } else {
          return operationStatus;
        }
      }

      // wait for next interval
      await sleep(FB_WAIT_TIME_MS);
    }

    // reaching this point means the signature was not successful
    throw new Error('failed to sign');
  } catch (e) {
    if (opts?.onStatusChange) {
      opts.onStatusChange('signature failed');
    }
    notifyEvent(e, 'error', 'Wallet', 'Signature', {
      msg: 'error signing',
    });
  }
  return undefined;
};

export const getOperationList = async (
  accessToken: string,
  accountId: string,
  assetId: string,
  status: OperationStatus[] = [
    OperationStatus.QUEUED,
    OperationStatus.SIGNATURE_REQUIRED,
  ],
): Promise<GetOperationListResponse> => {
  return await fetchApi(
    `/operations?${QueryString.stringify(
      {
        assetId,
        accountId,
        status,
      },
      {arrayFormat: 'repeat'},
    )}`,
    {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Access-Control-Allow-Credentials': 'true',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      host: config.WALLETS.HOST_URL,
    },
  );
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

export const getTransferOperationResponse = (
  asset: AccountAsset,
  accessToken: string,
  destinationAddress: string,
  amount: number,
) => {
  return fetchApi<GetOperationResponse>(
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
        amount: String(amount),
      }),
    },
  );
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

export const sendRecoveryEmail = async (
  accessToken: string,
  recoveryPassphrase: string,
): Promise<boolean> => {
  try {
    const emailResult = await fetchApi('/recovery/email', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Access-Control-Allow-Credentials': 'true',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      host: config.WALLETS.HOST_URL,
      body: JSON.stringify({
        recoveryPassphrase,
      }),
    });
    if (!emailResult) {
      return false;
    }
    return true;
  } catch (e) {
    notifyEvent(e, 'error', 'Wallet', 'Fetch', {
      msg: 'error sending recovery email',
    });
  }
  return false;
};

export const sendResetRequest = async (
  walletJoinRequestId: string,
  bootstrapJwt: string,
  recoveryToken: string,
  newRecoveryPassphrase: string,
): Promise<boolean> => {
  try {
    const resetResult = await fetchApi('/auth/devices/recover', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Access-Control-Allow-Credentials': 'true',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bootstrapJwt}`,
      },
      host: config.WALLETS.HOST_URL,
      body: JSON.stringify({
        recoveryToken,
        newRecoveryPassphrase,
        walletJoinRequestId,
        sendNewRecoveryEmail: false,
      }),
    });
    if (!resetResult) {
      return false;
    }
    return true;
  } catch (e) {
    notifyEvent(e, 'error', 'Wallet', 'Fetch', {
      msg: 'error sending reset request',
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
