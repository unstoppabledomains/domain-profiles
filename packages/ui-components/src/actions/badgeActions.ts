import QueryString from 'qs';

import config from '@unstoppabledomains/config';

import {fetchApi} from '../lib/fetchApi';
import type {SerializedBadgeInfo} from '../lib/types/badge';
import type {SerializedDomainRank} from '../lib/types/domain';

export const getBadge = async (
  badge: string,
  pending?: boolean,
): Promise<SerializedBadgeInfo | undefined> => {
  let domainProfileUrl = `/badges/${badge}`;
  const query = QueryString.stringify({pending});
  if (query) {
    domainProfileUrl += `?${query}`;
  }
  return await fetchApi(domainProfileUrl, {host: config.PROFILE.HOST_URL});
};

export const getMarketplaceBadgeDetails = async (url: string) => {
  return await fetchApi(`/badges/claim`, {
    host: config.PROFILE.HOST_URL,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({link: url}),
  });
};

export const getSponsorRankings = async (
  maxCount: number,
  badge?: string,
): Promise<SerializedDomainRank[] | undefined> => {
  return await fetchApi(
    `/badges/rankings/sponsors?count=${maxCount}${
      badge ? `&badge=${badge}` : ''
    }`,
    {
      host: config.PROFILE.HOST_URL,
    },
  );
};
