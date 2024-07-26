import config from '@unstoppabledomains/config';

import {fetchApi} from '../lib';
import type {RecordUpdateResponse} from '../lib/types/pav3';

// confirmRecordUpdate submits a transaction signature to allow a domain record
// update to be processed on the blockchain
export const confirmRecordUpdate = async (
  domain: string,
  operationId: string,
  dependencyId: string,
  data: {
    signature?: string;
    txHash?: string;
  },
  auth: {
    expires: string;
    signature: string;
  },
) => {
  return await fetchApi(`/user/${domain}/records/confirm`, {
    method: 'POST',
    mode: 'cors',
    host: config.PROFILE.HOST_URL,
    body: JSON.stringify({
      operationId,
      dependencyId,
      signature: data.signature,
      txHash: data.txHash,
    }),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'x-auth-domain': domain,
      'x-auth-expires': auth.expires,
      'x-auth-signature': auth.signature,
    },
  });
};

// getRegistrationMessage retrieve a message that must be signed before on-chain
// record operations can be initiated for the given domain. Returns undefined if
// a message is not required.
export const getRegistrationMessage = async (
  domain: string,
  auth: {
    expires: string;
    signature: string;
  },
) => {
  const walletStatus = await fetchApi(`/user/${domain}/wallet`, {
    method: 'GET',
    mode: 'cors',
    host: config.PROFILE.HOST_URL,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'x-auth-domain': domain,
      'x-auth-expires': auth.expires,
      'x-auth-signature': auth.signature,
    },
  });
  if (walletStatus?.message) {
    return `I approve this wallet to manage domain ${domain}.\n\nRequest nonce:\n${walletStatus.message}`;
  }
  return undefined;
};

// initiatePrimaryDomain submits an on-chain record update for a given domain, and
// receives a transaction hash that must be signed before the update is completed.
export const initiatePrimaryDomain = async (
  address: string,
  domain: string,
  auth: {
    expires: string;
    signature: string;
  },
): Promise<RecordUpdateResponse | undefined> => {
  const updateResponse = await fetchApi(`/user/${domain}/records/manage`, {
    method: 'POST',
    mode: 'cors',
    host: config.PROFILE.HOST_URL,
    body: JSON.stringify({
      address,
      primaryDomain: true,
    }),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'x-auth-domain': domain,
      'x-auth-expires': auth.expires,
      'x-auth-signature': auth.signature,
    },
  });
  if (
    updateResponse?.operation?.dependencies &&
    updateResponse.operation.dependencies.length > 0
  ) {
    if (updateResponse.operation.dependencies[0].transaction?.messageToSign) {
      return {
        operationId: updateResponse.operation.id,
        dependencyId: updateResponse.operation.dependencies[0].id,
        transaction: {
          messageToSign:
            updateResponse.operation.dependencies[0].transaction.messageToSign,
        },
      };
    }
  }
  return undefined;
};

// initiateRecordUpdate submits an on-chain record update for a given domain, and
// receives a transaction hash that must be signed before the update is completed.
export const initiateRecordUpdate = async (
  address: string,
  domain: string,
  records: Record<string, string>,
  auth: {
    expires: string;
    signature: string;
  },
): Promise<RecordUpdateResponse | undefined> => {
  const updateResponse = await fetchApi(`/user/${domain}/records/manage`, {
    method: 'POST',
    mode: 'cors',
    host: config.PROFILE.HOST_URL,
    body: JSON.stringify({
      address,
      records,
    }),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'x-auth-domain': domain,
      'x-auth-expires': auth.expires,
      'x-auth-signature': auth.signature,
    },
  });
  if (
    updateResponse?.operation?.dependencies &&
    updateResponse.operation.dependencies.length > 0
  ) {
    if (updateResponse.operation.dependencies[0].transaction?.messageToSign) {
      return {
        operationId: updateResponse.operation.id,
        dependencyId: updateResponse.operation.dependencies[0].id,
        transaction: {
          messageToSign:
            updateResponse.operation.dependencies[0].transaction.messageToSign,
        },
      };
    }
  }
  return undefined;
};

// initiateTransferDomain submits an on-chain update for a given domain, and
// receives a transaction hash that must be signed before the update is completed.
export const initiateTransferDomain = async (
  address: string,
  domain: string,
  recipientAddress: string,
  clearRecords: boolean,
  auth: {
    expires: string;
    signature: string;
  },
): Promise<RecordUpdateResponse | undefined> => {
  const updateResponse = await fetchApi(`/user/${domain}/records/manage`, {
    method: 'POST',
    mode: 'cors',
    host: config.PROFILE.HOST_URL,
    body: JSON.stringify({
      address,
      transferToAddress: recipientAddress,
      clearRecords,
    }),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'x-auth-domain': domain,
      'x-auth-expires': auth.expires,
      'x-auth-signature': auth.signature,
    },
  });
  if (
    updateResponse?.operation?.dependencies &&
    updateResponse.operation.dependencies.length > 0
  ) {
    if (updateResponse.operation.dependencies[0].transaction) {
      return {
        operationId: updateResponse.operation.id,
        dependencyId: updateResponse.operation.dependencies[0].id,
        transaction: {
          messageToSign:
            updateResponse.operation.dependencies[0].transaction.messageToSign,
          contractAddress:
            updateResponse.operation.dependencies[0].transaction.to,
          data: updateResponse.operation.dependencies[0].transaction.data,
        },
      };
    }
  }
  return undefined;
};

// registerWallet authorizes a wallet to interact with the domain for on-chain
// record management.
export const registerWallet = async (
  address: string,
  domain: string,
  message: string,
  signature: string,
  auth: {
    expires: string;
    signature: string;
  },
) => {
  return await fetchApi(`/user/${domain}/wallet`, {
    method: 'POST',
    mode: 'cors',
    host: config.PROFILE.HOST_URL,
    body: JSON.stringify({
      address,
      message,
      signature,
    }),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'x-auth-domain': domain,
      'x-auth-expires': auth.expires,
      'x-auth-signature': auth.signature,
    },
  });
};
