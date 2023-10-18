import {fetchApi} from 'lib/fetchApi';
import type {
  DomainBadgesResponse,
  SerializedCryptoWalletBadge,
} from 'lib/types/badge';
import type {
  EnsDomainStatusResponse,
  SerializedDomainRank,
} from 'lib/types/domain';

import config from '@unstoppabledomains/config';

export const getDomainBadges = async (
  domain: string,
  {withoutPartners}: {forceRefresh?: boolean; withoutPartners?: boolean} = {},
): Promise<DomainBadgesResponse> => {
  // request a badge refresh but do not wait for the processing
  // to be completed before continuing. Some badge operations
  // are lengthy and would significantly impact response time.
  // Calling in this way allows processing to happen in background
  // and request to return immediately with the existing badges.
  void fetchApi(`/domains/${domain}/sync_badges`);

  // retrieve badge data from profile API
  const data = await fetchApi(
    `/public/${domain}/badges?partners=${withoutPartners ? 'false' : 'true'}`,
    {
      host: config.PROFILE.HOST_URL,
    },
  );
  const badges = data?.badges?.map((badge: SerializedCryptoWalletBadge) => {
    return {
      ...badge,
      active: true,
      expired: false,
    };
  });
  return {
    list: badges,
    countTotal: badges.length,
    countActive: badges.length,
    badgesLastSyncedAt: new Date(),
  };
};

export const getEnsDomainStatus = async (
  domain: string,
): Promise<EnsDomainStatusResponse> => {
  return await fetchApi(`/domain/${domain}/ens-status`, {
    method: 'GET',
  });
};

export const getReverseResolution = async (
  address: string,
): Promise<string | undefined> => {
  const resolutionResponse = await fetchApi(`/public/resolve/${address}`, {
    host: config.PROFILE.HOST_URL,
  });
  return resolutionResponse?.name;
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
