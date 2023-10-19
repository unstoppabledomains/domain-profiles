import {notifyError} from 'lib/error';
import {fetchApi} from 'lib/fetchApi';
import {useQuery} from 'react-query';

import {getLaunchDarklyDefaults} from '@unstoppabledomains/config';
import type {LaunchDarklyCamelFlagSet} from '@unstoppabledomains/config';

const BASE_QUERY_KEY = 'featureFlags';
const queryKey = {
  featureFlags: () => [BASE_QUERY_KEY],
};

export type FeatureFlags = {
  variations?: LaunchDarklyCamelFlagSet;
};

export const DEFAULT_FEATURE_FLAGS = {
  variations: getLaunchDarklyDefaults(),
} as FeatureFlags;

export const fetchFeatureFlags = async (
  domainName: string = '',
): Promise<FeatureFlags> => {
  try {
    const queryString = domainName ? `?domainName=${domainName}` : '';
    const featureFlags = await fetchApi(`/feature-flags${queryString}`, {});
    return {...DEFAULT_FEATURE_FLAGS, ...featureFlags};
  } catch (e) {
    notifyError(e);
  }
  return DEFAULT_FEATURE_FLAGS;
};

export const useFeatureFlags = (
  shouldRefetch = false,
  domainName: string = '',
) => {
  const query = useQuery(
    [...queryKey.featureFlags(), domainName],
    (): Promise<FeatureFlags> => fetchFeatureFlags(domainName),
    {
      cacheTime: Infinity,
      staleTime: Infinity,
      refetchInterval: shouldRefetch ? 60_000 : undefined,
    },
  );
  const data = query.data ?? DEFAULT_FEATURE_FLAGS;
  return {...query, data};
};
