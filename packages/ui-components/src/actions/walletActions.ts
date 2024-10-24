import QueryString from 'qs';

import config from '@unstoppabledomains/config';

import {notifyEvent} from '../lib/error';
import {fetchApi} from '../lib/fetchApi';
import type {SerializedWalletBalance} from '../lib/types/domain';
import type {SerializedIdentityResponse} from '../lib/types/identity';
import type {WalletAccountResponse} from '../lib/types/wallet';

export const createWallet = async (
  emailAddress: string,
  otp: string,
  password: string,
): Promise<boolean> => {
  const createResult = await fetchApi<WalletAccountResponse>(
    `/user/wallet/register`,
    {
      host: config.PROFILE.HOST_URL,
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({emailAddress, otp, password}),
    },
  );
  if (!createResult?.emailAddress) {
    return false;
  }
  return true;
};

export const createWalletOtp = async (
  emailAddress: string,
): Promise<boolean> => {
  const otpResult = await fetchApi<WalletAccountResponse>(`/user/wallet`, {
    host: config.PROFILE.HOST_URL,
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify({emailAddress}),
  });
  if (!otpResult?.emailAddress) {
    return false;
  }
  return true;
};

export const getOnboardingStatus = async (
  emailAddress: string,
): Promise<WalletAccountResponse | undefined> => {
  try {
    const accountStatus = await fetchApi<WalletAccountResponse>(
      `/user/${encodeURIComponent(emailAddress)}/wallet/account`,
      {
        method: 'POST',
        host: config.PROFILE.HOST_URL,
      },
    );
    if (accountStatus?.active) {
      return accountStatus;
    }
  } catch (e) {
    notifyEvent(e, 'warning', 'Wallet', 'Validation');
  }
  return undefined;
};

export const getWalletPortfolio = async (
  address: string,
  accessToken: string,
  fields?: string[],
  forceRefresh?: boolean,
): Promise<SerializedWalletBalance[] | undefined> => {
  return await fetchApi(
    `/user/${address}/wallets?${QueryString.stringify({
      walletFields: fields && fields.length > 0 ? fields.join(',') : undefined,
      forceRefresh: forceRefresh ? Date.now() : undefined,
    })}`,
    {
      host: config.PROFILE.HOST_URL,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
};

export const prepareRecipientWallet = async (
  senderWalletAddress: string,
  recipientEmailAddress: string,
  accessToken: string,
): Promise<WalletAccountResponse | undefined> => {
  try {
    const inviteStatus = await fetchApi<WalletAccountResponse>(
      `/user/${senderWalletAddress}/wallet/invite`,
      {
        method: 'POST',
        host: config.PROFILE.HOST_URL,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-type': 'application/json',
        },
        body: JSON.stringify({
          emailAddress: recipientEmailAddress,
        }),
      },
    );
    if (inviteStatus?.emailAddress === recipientEmailAddress) {
      return inviteStatus;
    }
  } catch (e) {
    notifyEvent(e, 'warning', 'Wallet', 'Validation');
  }
  return undefined;
};

export const syncIdentityConfig = async (
  address: string,
  accessToken: string,
): Promise<SerializedIdentityResponse | undefined> => {
  try {
    return await fetchApi<SerializedIdentityResponse>(
      `/user/${address}/wallet/identity`,
      {
        method: 'POST',
        host: config.PROFILE.HOST_URL,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
  } catch (e) {
    notifyEvent(e, 'warning', 'Wallet', 'Validation');
  }
  return undefined;
};
