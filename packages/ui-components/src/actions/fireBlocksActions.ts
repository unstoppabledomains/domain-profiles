import {Mutex} from 'async-mutex';
import Bluebird from 'bluebird';
import {utils as EthersUtils} from 'ethers';
import QueryString from 'qs';
import type {Eip712TypedData} from 'web3';
import {utils as web3utils} from 'web3';

import config from '@unstoppabledomains/config';

import {getBlockchainSymbol} from '../components/Manage/common/verification/types';
import {CustodyState} from '../lib';
import {notifyEvent} from '../lib/error';
import {fetchApi} from '../lib/fetchApi';
import {sleep} from '../lib/sleep';
import {
  EIP_712_KEY,
  FB_MAX_RETRY,
  FB_WAIT_TIME_MS,
  OPERATION_CODE_EMAIL_OTP_REQUIRED,
  OPERATION_CODE_MFA_REQUIRED,
  TransactionRuleEmailOtpRequiredError,
  TransactionRuleMfaRequiredError,
  isOperationResponseError,
} from '../lib/types/fireBlocks';
import type {
  AccountAsset,
  CreateTransaction,
  GetAccountAssetsResponse,
  GetAccountsResponse,
  GetEstimateTransactionResponse,
  GetOperationListResponse,
  GetOperationResponse,
  GetOperationResponseError,
  GetOperationStatusResponse,
  GetTokenResponse,
  RecoveryStatusResponse,
  TokenRefreshResponse,
  TransactionLockRequest,
  TransactionLockStatusResponse,
  TransactionRule,
  TransactionRuleRequest,
  TransactionRulesListResponse,
  VerifyTokenResponse,
} from '../lib/types/fireBlocks';
import {getAsset} from '../lib/wallet/asset';
import {
  getBootstrapState,
  saveBootstrapState,
} from '../lib/wallet/storage/state';

// account list cache control
const accountsCache: Record<string, GetAccountsResponse> = {};
const accountsCacheMutex = new Mutex();

export enum OperationStatus {
  QUEUED = 'QUEUED',
  SIGNATURE_REQUIRED = 'SIGNATURE_REQUIRED',
}

export enum SendCryptoStatusMessage {
  CREATING_WALLET = 'Preparing transfer...',
  CHECKING_QUEUE = 'Checking queued transfers...',
  STARTING_TRANSACTION = 'Starting transfer...',
  SIGNING = 'Approving transfer...',
  SUBMITTING_TRANSACTION = 'Submitting transfer...',
  WAITING_FOR_TRANSACTION = 'Successfully submitted your transfer!',
  TRANSACTION_COMPLETED = 'Transfer completed!',
  TRANSACTION_FAILED = 'Transfer failed',
}

export const cancelOperation = async (
  accessToken: string,
  operationId: string,
): Promise<void> => {
  return await fetchApi(`/v1/operations/${operationId}`, {
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

export const changePassword = async (
  accessToken: string,
  currentPassword: string,
  newPassword: string,
  otp?: string,
): Promise<
  | 'OK'
  | 'OTP_TOKEN_REQUIRED'
  | 'EMAIL_OTP_REQUIRED'
  | 'VALIDATION'
  | 'INVALID_OTP_TOKEN'
  | 'INVALID_PASSWORD'
> => {
  try {
    // build required headers
    const headers: Record<string, string> = {
      'Access-Control-Allow-Credentials': 'true',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    };
    if (otp) {
      headers['X-Otp-Token'] = otp;
    }

    // make request to change password
    const changePwResult = await fetchApi('/v1/settings/security/login', {
      method: 'PATCH',
      mode: 'cors',
      headers,
      host: config.WALLETS.HOST_URL,
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
      acceptStatusCodes: [400, 401, 403],
    });
    if (changePwResult === 'OK') {
      return 'OK';
    } else if (!changePwResult?.code) {
      throw new Error('error changing password');
    }
    return changePwResult.code;
  } catch (e) {
    notifyEvent(e, 'error', 'Wallet', 'Fetch', {
      msg: 'error changing password',
    });
    throw e;
  }
};

export const createSignatureOperation = async (
  accessToken: string,
  accountId: string,
  assetId: string,
  message: string,
  isTypedMessage?: boolean,
  otpToken?: string,
): Promise<GetOperationResponse | undefined> => {
  try {
    // build headers, including the optional OTP token if provided
    const headers: Record<string, string> = {
      'Access-Control-Allow-Credentials': 'true',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    };
    if (otpToken) {
      headers['X-Otp-Token'] = otpToken;
    }

    // call the signature endpoint
    const maybeSignatureOperation = await fetchApi<
      GetOperationResponse | GetOperationResponseError
    >(`/v1/accounts/${accountId}/assets/${assetId}/signatures`, {
      method: 'POST',
      mode: 'cors',
      headers,
      host: config.WALLETS.HOST_URL,
      body: JSON.stringify({
        message,
        encoding: EthersUtils.isHexString(message) ? 'hex' : 'utf8',
        type: isTypedMessage ? 'ERC712' : 'RAW',
      }),
    });

    // if the response is a 400, check the error code and possibly throw an error
    // when the code is related to transaction rules
    if (isOperationResponseError(maybeSignatureOperation)) {
      if (maybeSignatureOperation.code === OPERATION_CODE_EMAIL_OTP_REQUIRED) {
        throw new TransactionRuleEmailOtpRequiredError(
          maybeSignatureOperation.message,
        );
      } else if (maybeSignatureOperation.code === OPERATION_CODE_MFA_REQUIRED) {
        throw new TransactionRuleMfaRequiredError(
          maybeSignatureOperation.message,
        );
      }
      return undefined;
    }

    // return the operation
    return maybeSignatureOperation;
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
  otpToken?: string,
): Promise<GetOperationResponse | undefined> => {
  try {
    // build headers, including the optional OTP token if provided
    const headers: Record<string, string> = {
      'Access-Control-Allow-Credentials': 'true',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    };
    if (otpToken) {
      headers['X-Otp-Token'] = otpToken;
    }

    // request the transfer
    const maybeTxOperation = await fetchApi<
      GetOperationResponse | GetOperationResponseError
    >(`/v1/accounts/${accountId}/assets/${assetId}/transactions`, {
      method: 'POST',
      mode: 'cors',
      headers,
      host: config.WALLETS.HOST_URL,
      acceptStatusCodes: [400], // for custom validation response handling
      body: JSON.stringify({
        destinationAddress: tx.to,
        data: tx.data,
        value: tx.value,
        gasLimit: tx.gasLimit,
      }),
    });

    // if the response is a 400, check the error code and possibly throw an error
    // when the code is related to transaction rules
    if (isOperationResponseError(maybeTxOperation)) {
      if (maybeTxOperation.code === OPERATION_CODE_EMAIL_OTP_REQUIRED) {
        throw new TransactionRuleEmailOtpRequiredError(
          maybeTxOperation.message,
        );
      } else if (maybeTxOperation.code === OPERATION_CODE_MFA_REQUIRED) {
        throw new TransactionRuleMfaRequiredError(maybeTxOperation.message);
      }
      return undefined;
    }

    // return the operation
    return maybeTxOperation;
  } catch (e) {
    notifyEvent(e, 'warning', 'Wallet', 'Signature', {
      meta: {accountId, assetId, tx},
    });
  }
  return undefined;
};

export const createTransactionRule = async (
  accessToken: string,
  rule: TransactionRuleRequest,
): Promise<string | undefined> => {
  const createRuleResponse = await fetchApi<TransactionRule>(
    `/v1/settings/security/rules`,
    {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Access-Control-Allow-Credentials': 'true',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      host: config.WALLETS.HOST_URL,
      body: JSON.stringify(rule),
    },
  );
  if (createRuleResponse?.id) {
    return createRuleResponse.id;
  }
  return undefined;
};

export const createTransactionRuleAcceptanceCriteria = async (
  accessToken: string,
  ruleId: string,
  type: 'MFA_CODE' | 'BLOCK',
) => {
  const createCriteriaResponse = await fetchApi<TransactionRulesListResponse>(
    `/v1/settings/security/rules/${ruleId}/acceptance-criteria`,
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
        type,
        name: `${ruleId}-criteria`,
        status: 'ACTIVE',
      }),
    },
  );
  return createCriteriaResponse;
};

export const createTransferOperation = async (
  asset: AccountAsset,
  accessToken: string,
  destinationAddress: string,
  amount: number,
  otpToken?: string,
) => {
  // build headers, including the optional OTP token if provided
  const headers: Record<string, string> = {
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  };
  if (otpToken) {
    headers['X-Otp-Token'] = otpToken;
  }

  // request the transfer
  const maybeTransferOperation = await fetchApi<
    GetOperationResponse | GetOperationResponseError
  >(`/v1/accounts/${asset.accountId}/assets/${asset.id}/transfers`, {
    method: 'POST',
    mode: 'cors',
    headers,
    acceptStatusCodes: [400], // for custom validation response handling
    host: config.WALLETS.HOST_URL,
    body: JSON.stringify({
      destinationAddress,
      amount: String(amount),
    }),
  });

  // if the response is a 400, check the error code and possibly throw an error
  // when the code is related to transaction rules
  if (isOperationResponseError(maybeTransferOperation)) {
    if (maybeTransferOperation.code === OPERATION_CODE_EMAIL_OTP_REQUIRED) {
      throw new TransactionRuleEmailOtpRequiredError(
        maybeTransferOperation.message,
      );
    } else if (maybeTransferOperation.code === OPERATION_CODE_MFA_REQUIRED) {
      throw new TransactionRuleMfaRequiredError(maybeTransferOperation.message);
    }
    return undefined;
  }

  // return the operation
  return maybeTransferOperation;
};

export const deleteTransactionRule = async (
  accessToken: string,
  rule: TransactionRule,
) => {
  return await updateTransactionRule(accessToken, rule.id, {
    type: rule.type,
    active: false,
  });
};

export const disableTransactionLock = async (
  accessToken: string,
  otp: string,
) => {
  return await fetchApi<TransactionLockStatusResponse>(`/v1/signature-lock`, {
    method: 'DELETE',
    mode: 'cors',
    headers: {
      'Access-Control-Allow-Credentials': 'true',
      'Content-Type': 'application/json',
      'X-Otp-Token': otp,
      Authorization: `Bearer ${accessToken}`,
    },
    host: config.WALLETS.HOST_URL,
  });
};

export const enableTransactionLock = async (
  accessToken: string,
  opts: TransactionLockRequest = {},
) => {
  return await fetchApi<TransactionLockStatusResponse>(`/v1/signature-lock`, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Access-Control-Allow-Credentials': 'true',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    host: config.WALLETS.HOST_URL,
    body: JSON.stringify(opts),
  });
};

// getAccessTokenInternal called by useFireblocksAccessToken hook. This method should
// not be called directly.
export const getAccessTokenInternal = async (
  refreshToken: string,
  opts: {
    state: Record<string, Record<string, string>>;
    saveState: (state: Record<string, Record<string, string>>) => void;
    setAccessToken: (v: string) => void;
  },
): Promise<GetTokenResponse | undefined> => {
  try {
    // retrieve a new set of tokens using the refresh token
    const newTokens = await fetchApi<GetTokenResponse>(
      '/v2/auth/tokens/refresh',
      {
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
      },
    );

    // verify the new token is a V2 access token
    const tokenVersion = await getAccessTokenVersion(newTokens.accessToken);
    if (tokenVersion !== 'v2') {
      notifyEvent(
        'unexpected token version',
        'warning',
        'Wallet',
        'Authorization',
      );
      throw new Error('invalid access token');
    }

    // retrieve existing state
    const existingState = getBootstrapState(opts.state);

    // save new state
    await saveBootstrapState(
      {
        userName: existingState?.userName,
        assets: existingState?.assets || [],
        bootstrapToken: newTokens.bootstrapToken,
        refreshToken: newTokens.refreshToken,
        custodyState: {
          state: CustodyState.SELF_CUSTODY,
          status: 'COMPLETED',
        },
      },
      opts.state,
      opts.saveState,
      newTokens.accessToken,
    );

    // store access token in memory
    opts.setAccessToken(newTokens.accessToken);
    return newTokens;
  } catch (e) {
    notifyEvent(e, 'error', 'Wallet', 'Fetch', {
      msg: 'error refreshing tokens',
    });
  }
  return undefined;
};

export const getAccessTokenVersion = async (
  accessToken: string,
): Promise<'v1' | 'v2' | undefined> => {
  try {
    const tokenStatus = await fetchApi<VerifyTokenResponse>(
      '/v2/auth/tokens/verify',
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
    if (!tokenStatus?.isValid) {
      return undefined;
    }
    return tokenStatus.validations.hasSessionKey ? 'v2' : 'v1';
  } catch (e) {
    notifyEvent(e, 'error', 'Wallet', 'Fetch', {
      msg: 'error sending reset request',
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
        // normalize the asset format
        asset.accountId = account.id;
        asset.blockchainAsset.symbol =
          getBlockchainSymbol(asset.blockchainAsset.name, true) ||
          asset.blockchainAsset.symbol;

        // add to the asset list
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

/**
 * getAccountId
 *
 * Retrieves the account ID for the given access token.
 *
 * @param accessToken - The access token to retrieve the account ID for.
 * @param useCache - Whether to use the cache.
 * @returns The account ID for the given access token.
 */
export const getAccountId = async (
  accessToken: string,
  useCache = false,
): Promise<string | undefined> => {
  const accounts = await getAccounts(accessToken, useCache);
  return accounts?.items[0].id;
};

/**
 * getAccounts
 *
 * Retrieves the accounts for the given access token.
 *
 * @param accessToken - The access token to retrieve the accounts for.
 * @param useCache - Whether to use the cache.
 * @returns The accounts for the given access token.
 */
export const getAccounts = async (
  accessToken: string,
  useCache = false,
): Promise<GetAccountsResponse | undefined> => {
  // retrieve from cache if enabled
  if (useCache && accountsCache[accessToken]) {
    return accountsCache[accessToken];
  }

  // acquire a lock to prevent race conditions on the cache
  const unlock = await accountsCacheMutex.acquire();

  // check cache again before making an API call
  if (useCache && accountsCache[accessToken]) {
    return accountsCache[accessToken];
  }

  // retrieve a new set of tokens using the refresh token
  try {
    const accounts = await fetchApi<GetAccountsResponse>('/v1/accounts', {
      mode: 'cors',
      headers: {
        'Access-Control-Allow-Credentials': 'true',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      host: config.WALLETS.HOST_URL,
    });

    // validate the accounts are not empty
    if (accounts.items.length > 0) {
      // populate the cache and return
      accountsCache[accessToken] = accounts;
      return accounts;
    }
  } catch (e) {
    notifyEvent(e, 'error', 'Wallet', 'Fetch', {
      msg: 'error retrieving accounts',
    });
  } finally {
    unlock();
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
      `/v1/accounts/${accountId}/assets${balance ? '?$expand=balance' : ''}`,
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
    `/v1/operations?${QueryString.stringify(
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
  return await fetchApi(`/v1/operations/${operationId}`, {
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

export const getRecoveryKitStatus = async (
  accessToken: string,
): Promise<RecoveryStatusResponse | undefined> => {
  try {
    const recoveryKitResult = await fetchApi('/v1/recovery', {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Access-Control-Allow-Credentials': 'true',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      host: config.WALLETS.HOST_URL,
    });
    if (!recoveryKitResult) {
      return undefined;
    }
    return recoveryKitResult;
  } catch (e) {
    notifyEvent(e, 'error', 'Wallet', 'Fetch', {
      msg: 'error retrieving recovery kit status',
    });
  }
  return undefined;
};

export const getTransactionGasEstimate = async (
  asset: AccountAsset,
  accessToken: string,
  tx: CreateTransaction,
) => {
  return await fetchApi<GetEstimateTransactionResponse>(
    `/v1/estimates/accounts/${asset.accountId}/assets/${asset.id}/transactions`,
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
        destinationAddress: tx.to,
        data: tx.data,
        value: tx.value,
      }),
    },
  );
};

export const getTransactionLockStatus = async (accessToken: string) => {
  const lockStatus = await fetchApi<TransactionLockStatusResponse>(
    `/v1/signature-lock`,
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
  if (!lockStatus) {
    return undefined;
  }
  if (lockStatus.validUntil && lockStatus.validUntil < Date.now()) {
    lockStatus.validUntil = undefined;
    lockStatus.enabled = false;
  }
  return lockStatus;
};

export const getTransactionRule = async (
  accessToken: string,
  ruleId: string,
) => {
  const ruleResponse = await fetchApi<TransactionRule>(
    `/v1/settings/security/rules/${ruleId}`,
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
  if (!ruleResponse?.id) {
    return undefined;
  }
  return ruleResponse;
};

export const getTransactionRules = async (
  accessToken: string,
): Promise<TransactionRule[] | undefined> => {
  const rulesResponse = await fetchApi<TransactionRulesListResponse>(
    `/v1/settings/security/rules`,
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
  if (!rulesResponse?.items || rulesResponse.items.length === 0) {
    return undefined;
  }

  // saturate any active items with the rule details
  const saturatedRules: TransactionRule[] = [];
  await Bluebird.map(
    rulesResponse.items.filter(r => r.active),
    async rule => {
      const ruleDetails = await getTransactionRule(accessToken, rule.id);
      if (ruleDetails) {
        saturatedRules.push(ruleDetails);
      }
    },
    {concurrency: 1},
  );

  // return a list of active/saturated rules followed by inactive rules
  // that have not been saturated
  return [...saturatedRules, ...rulesResponse.items.filter(r => !r.active)];
};

export const getTransferGasEstimate = async (
  asset: AccountAsset,
  accessToken: string,
  destinationAddress: string,
  amount: string,
) => {
  return await fetchApi<GetEstimateTransactionResponse>(
    `/v1/estimates/accounts/${asset.accountId}/assets/${asset.id}/transfers`,
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

export const recoverToken = async (
  recoveryToken: string,
): Promise<TokenRefreshResponse | undefined> => {
  try {
    return await fetchApi('/v2/auth/tokens/recover', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      host: config.WALLETS.HOST_URL,
      body: JSON.stringify({
        recoveryToken,
      }),
    });
  } catch (e) {
    notifyEvent(e, 'error', 'Wallet', 'Fetch', {
      msg: 'error sending reset request',
    });
  }
  return undefined;
};

export const recoverTokenOtp = async (
  accessToken: string,
  type: string,
  value: string,
  newPassword: string,
): Promise<TokenRefreshResponse | undefined> => {
  try {
    return await fetchApi('/v2/auth/tokens', {
      method: 'PATCH',
      mode: 'cors',
      headers: {
        'Access-Control-Allow-Credentials': 'true',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      host: config.WALLETS.HOST_URL,
      body: JSON.stringify({
        type,
        value,
        newPassword,
      }),
    });
  } catch (e) {
    notifyEvent(e, 'error', 'Wallet', 'Fetch', {
      msg: 'error sending reset request',
    });
  }
  return undefined;
};

export const sendRecoveryEmail = async (
  accessToken: string,
  recoveryPassphrase: string,
): Promise<boolean> => {
  try {
    const emailResult = await fetchApi('/v1/recovery/email', {
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

export const sendRpcMessage = async <T>(
  message: unknown,
  jwt: string,
): Promise<T> => {
  try {
    return await fetchApi<T>('/v1/rpc/messages', {
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

export const signAndWait = async (
  accessToken: string,
  onGetOperation: () => Promise<GetOperationResponse | undefined>,
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
        operationStatus.status === 'SIGNATURE_REQUIRED' &&
        operationStatus.transaction?.externalVendorTransactionId
      ) {
        // indicate status change
        if (opts?.onStatusChange) {
          opts.onStatusChange('signing');
        }
      }

      // throw an error for failure states
      if (
        operationStatus.status === 'CANCELLED' ||
        operationStatus.status === 'FAILED'
      ) {
        throw new Error(`signature ${operationStatus.status.toLowerCase()}`);
      }

      // return the completed signature or a transaction ID is available
      if (
        operationStatus.status === 'COMPLETED' ||
        operationStatus.transaction?.id?.startsWith('0x')
      ) {
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

export const signIn = async (
  emailAddress: string,
  password: string,
): Promise<TokenRefreshResponse | undefined> => {
  try {
    return await fetchApi('/v2/auth/tokens', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      host: config.WALLETS.HOST_URL,
      body: JSON.stringify({
        emailAddress,
        password,
      }),
    });
  } catch (e) {
    notifyEvent(e, 'error', 'Wallet', 'Fetch', {
      msg: 'error signing in',
    });
  }
  return undefined;
};

export const signInOtp = async (
  accessToken: string,
  type: 'OTP' | 'EMAIL',
  value: string,
): Promise<TokenRefreshResponse | undefined> => {
  try {
    return await fetchApi('/v2/auth/tokens', {
      method: 'PATCH',
      mode: 'cors',
      headers: {
        'Access-Control-Allow-Credentials': 'true',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      host: config.WALLETS.HOST_URL,
      body: JSON.stringify({
        type,
        value,
      }),
    });
  } catch (e) {
    notifyEvent(e, 'error', 'Wallet', 'Fetch', {
      msg: 'error signing in',
    });
  }
  return undefined;
};

export const signMessage = async (
  message: string,
  auth: {
    accessToken: string;
    state: Record<string, Record<string, string>>;
    saveState: (
      state: Record<string, Record<string, string>>,
    ) => void | Promise<void>;
  },
  opts: {
    address?: string;
    chainId?: number;
  } = {},
): Promise<string> => {
  // retrieve and validate key state
  const clientState = getBootstrapState(auth.state);
  if (!clientState) {
    throw new Error('invalid configuration');
  }

  notifyEvent(
    'signing message with fireblocks client',
    'info',
    'Wallet',
    'Signature',
    {meta: {message}},
  );

  // determine if a specific chain ID should override based upon a typed
  // EIP-712 message
  const isTypedMessage = message.includes(EIP_712_KEY);
  if (isTypedMessage) {
    try {
      const typedMessage: Eip712TypedData = JSON.parse(message);
      if (typedMessage?.domain?.chainId) {
        opts.chainId =
          typeof typedMessage.domain.chainId === 'string'
            ? typedMessage.domain.chainId.startsWith('0x')
              ? (web3utils.hexToNumber(typedMessage.domain.chainId) as number)
              : parseInt(typedMessage.domain.chainId, 10)
            : typedMessage.domain.chainId;
      }
    } catch (e) {
      notifyEvent(e, 'warning', 'Wallet', 'Signature', {
        msg: 'unable to parse typed message',
      });
    }
  }

  // retrieve the asset associated with the optionally requested address,
  // otherwise just retrieve the first first asset.
  notifyEvent(
    'retrieving wallet asset for signature',
    'info',
    'Wallet',
    'Signature',
    {
      meta: {opts, default: config.WALLETS.SIGNATURE_SYMBOL},
    },
  );
  const asset = getAsset(clientState.assets, {
    address: opts.address,
    chainId: opts.chainId,
  });
  if (!asset?.accountId) {
    throw new Error('address not found in account');
  }

  // request an MPC signature of the desired message string
  const signatureOp = await signAndWait(
    auth.accessToken,
    async () => {
      return await createSignatureOperation(
        auth.accessToken,
        asset.accountId!,
        asset.id,
        message,
        isTypedMessage,
      );
    },
    {
      address: opts.address,
      onStatusChange: (m: string) => {
        notifyEvent(m, 'info', 'Wallet', 'Signature');
      },
      isComplete: (status: GetOperationStatusResponse) => {
        return status?.result?.signature !== undefined;
      },
    },
  );

  // validate and return the signature result
  if (!signatureOp?.result?.signature) {
    throw new Error('signature failed');
  }

  // indicate complete with successful signature result
  notifyEvent('signature successful', 'info', 'Wallet', 'Signature', {
    meta: {
      opts,
      message,
      signatureOp,
    },
  });
  return signatureOp.result.signature;
};

export const updateTransactionRule = async (
  accessToken: string,
  ruleId: string,
  rule: Partial<TransactionRuleRequest>,
) => {
  return await fetchApi<TransactionRule>(
    `/v1/settings/security/rules/${ruleId}`,
    {
      method: 'PATCH',
      mode: 'cors',
      headers: {
        'Access-Control-Allow-Credentials': 'true',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      host: config.WALLETS.HOST_URL,
      body: JSON.stringify(rule),
    },
  );
};
