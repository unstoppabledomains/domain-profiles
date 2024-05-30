import QueryString from 'qs';

import config from '@unstoppabledomains/config';

import type {SerializedWalletBalance} from '../lib';
import {fetchApi} from '../lib';
import {notifyEvent} from '../lib/error';

export const getOnboardingStatus = async (
  emailAddress: string,
): Promise<boolean> => {
  try {
    return await fetchApi(`/user/account.status/wallets`, {
      method: 'POST',
      host: config.PROFILE.HOST_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({emailAddress}),
    });
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
