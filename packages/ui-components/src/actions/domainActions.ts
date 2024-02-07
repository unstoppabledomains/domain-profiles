import QueryString from 'qs';

import config from '@unstoppabledomains/config';

import {fetchApi} from '../lib/fetchApi';
import type {
  DomainBadgesResponse,
  SerializedCryptoWalletBadge,
} from '../lib/types/badge';
import type {
  DomainCryptoVerificationBodyPOST,
  EnsDomainStatusResponse,
  SerializedDomainRank,
  SerializedTxns,
} from '../lib/types/domain';

export const getDomainBadges = async (
  domain: string,
  {withoutPartners}: {forceRefresh?: boolean; withoutPartners?: boolean} = {},
): Promise<DomainBadgesResponse> => {
  // retrieve badge data from profile API
  const data = await fetchApi(
    `/public/${domain}/badges?partners=${withoutPartners ? 'false' : 'true'}`,
    {
      host: config.PROFILE.HOST_URL,
    },
  );
  const badges =
    data?.badges?.map((badge: SerializedCryptoWalletBadge) => {
      return {
        ...badge,
        active: true,
        expired: false,
      };
    }) || [];

  // add partner badges to the response if available
  data?.partners?.map((partnerBadge: SerializedCryptoWalletBadge) => {
    const holdsBadge = badges.filter(
      (existingBadge: SerializedCryptoWalletBadge) =>
        existingBadge.code === partnerBadge.code,
    );
    if (holdsBadge.length > 0) {
      holdsBadge[0].marketplace = partnerBadge.marketplace;
      return;
    }
    badges.push({
      ...partnerBadge,
      configId: 0,
      active: false,
      expired: false,
    });
  });

  return {
    list: badges,
    countTotal: badges.length,
    countActive: badges.length,
    badgesLastSyncedAt: new Date(),
  };
};

export const getDomainRankings = async (
  maxCount: number,
  communityOnly?: boolean,
  badge?: string,
): Promise<SerializedDomainRank[] | undefined> => {
  return await fetchApi(
    `/badges/rankings/domains?count=${maxCount}${
      communityOnly ? '&communityOnly=true' : ''
    }${badge ? `&badge=${badge}` : ''}`,
    {
      host: config.PROFILE.HOST_URL,
    },
  );
};

export const getDomainTransactions = async (
  domain: string,
  symbol: string,
  cursor?: string,
): Promise<SerializedTxns | undefined> => {
  // retrieve badge data from profile API
  const data = await fetchApi(
    `/public/${domain}/transactions?${QueryString.stringify({
      symbols: symbol,
      cursor,
    })}`,
    {
      host: config.PROFILE.HOST_URL,
    },
  );
  if (!data || !data[symbol.toUpperCase()]) {
    return;
  }
  return data[symbol.toUpperCase()];
};

export const getEnsDomainStatus = async (
  domain: string,
): Promise<EnsDomainStatusResponse> => {
  return await fetchApi(`/domain/${domain}/ens-status`, {
    method: 'GET',
  });
};

export const getStrictReverseResolution = async (
  address: string,
): Promise<string | undefined> => {
  const resolutionResponse = await fetchApi(
    `/resolve/${address}?resolutionOrder=ud,ens`,
    {
      host: config.PROFILE.HOST_URL,
    },
  );
  return resolutionResponse?.name;
};

export const getVerificationMessage = async (
  domain: string,
  symbol: string,
): Promise<string> => {
  const msgJSON = await fetchApi(
    `/user/${domain}/address/${symbol}/signature`,
    {
      host: config.PROFILE.HOST_URL,
    },
  );
  return msgJSON.message;
};

export const postCryptoVerification = async (
  domain: string,
  domainCryptoVerificationBodyPost: DomainCryptoVerificationBodyPOST,
): Promise<void> => {
  const verifyResponse = await fetchApi(
    `/user/${domain}/address/${domainCryptoVerificationBodyPost.symbol}`,
    {
      host: config.PROFILE.HOST_URL,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: domainCryptoVerificationBodyPost.plaintextMessage,
        signature: domainCryptoVerificationBodyPost.signedMessage,
      }),
    },
  );
  if (!verifyResponse) {
    throw new Error('failed to verify domain crypto address');
  }
};
