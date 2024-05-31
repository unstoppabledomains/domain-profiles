import QueryString from 'qs';

import config from '@unstoppabledomains/config';

import type {SerializedWalletBalance, WalletAccountResponse} from '../lib';
import {fetchApi} from '../lib';
import {notifyEvent} from '../lib/error';

export const getOnboardingStatus = async (
  emailAddress: string,
): Promise<boolean> => {
  try {
    const accountStatus = await fetchApi<WalletAccountResponse>(
      `/user/${emailAddress}/wallet/account`,
      {
        method: 'POST',
        host: config.PROFILE.HOST_URL,
      },
    );
    if (accountStatus?.active) {
      return true;
    }
  } catch (e) {
    notifyEvent(e, 'warning', 'Wallet', 'Validation');
  }
  return false;
};

export const getWalletPortfolio = async (
  address: string,
  accessToken: string,
  fields?: string[],
  forceRefresh?: boolean,
): Promise<SerializedWalletBalance[] | undefined> => {
  return await fetchApi(
    `/user/${address}/wallets?${QueryString.stringify({
      fields: fields && fields.length > 0 ? fields.join(',') : undefined,
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
