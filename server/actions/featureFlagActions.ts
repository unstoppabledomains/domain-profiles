import {fetchApi} from 'lib/fetchApi';
import {useQuery} from 'react-query';

const BASE_QUERY_KEY = 'featureFlags';
const queryKey = {
  featureFlags: () => [BASE_QUERY_KEY],
};

export type FeatureFlags = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variations?: Record<string, any>;
};

export const DEFAULT_FEATURE_FLAGS = {
  variations: {},
} as FeatureFlags;

export const fetchFeatureFlags = async (
  domainName: string = '',
): Promise<FeatureFlags> => {
  const queryString = domainName ? `?domainName=${domainName}` : '';
  const featureFlags = await fetchApi(`/feature-flags${queryString}`);
  return {...DEFAULT_FEATURE_FLAGS, ...featureFlags};
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
