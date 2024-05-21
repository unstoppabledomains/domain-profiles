import {useRouter} from 'next/router';
import {useQuery} from 'react-query';

import config, {getLaunchDarklyDefaults} from '@unstoppabledomains/config';
import type {LaunchDarklyCamelFlagSet} from '@unstoppabledomains/config';

import {notifyEvent} from '../lib/error';
import {fetchApi} from '../lib/fetchApi';

const BASE_QUERY_KEY = 'featureFlags';
const queryKey = {
  featureFlags: () => [BASE_QUERY_KEY],
};

export const DEFAULT_FEATURE_FLAGS = {
  variations: getLaunchDarklyDefaults(),
} as FeatureFlags;

export type FeatureFlags = {
  variations?: LaunchDarklyCamelFlagSet;
};

export const fetchFeatureFlags = async (
  domainName: string = '',
): Promise<FeatureFlags> => {
  try {
    const queryString = domainName ? `?domain=${domainName}` : '';
    const featureFlags = await fetchApi<LaunchDarklyCamelFlagSet>(
      `/feature-flags${queryString}`,
      {
        host: config.PROFILE.HOST_URL,
      },
    );
    return {
      variations: {...DEFAULT_FEATURE_FLAGS.variations, ...featureFlags},
    };
  } catch (e) {
    notifyEvent(e, 'warning', 'Request', 'Fetch', {
      msg: 'error retrieving feature flags',
    });
  }
  return DEFAULT_FEATURE_FLAGS;
};

export const useFeatureFlags = (
  shouldRefetch = false,
  domainName: string = '',
) => {
  // retrieve domain name from path if possible
  const {query: params} = useRouter();
  const fallbackDomainName =
    params.domain && typeof params.domain === 'string'
      ? params.domain
      : undefined;
  const domain = domainName || fallbackDomainName;

  // query feature flags
  const query = useQuery(
    [...queryKey.featureFlags(), domain],
    (): Promise<FeatureFlags> => fetchFeatureFlags(domain),
    {
      cacheTime: Infinity,
      staleTime: Infinity,
      refetchInterval: shouldRefetch ? 60_000 : undefined,
    },
  );
  const data = query.data ?? DEFAULT_FEATURE_FLAGS;
  return {...query, data};
};
