import {useEffect, useState} from 'react';
import {useQuery} from 'react-query';

import {getAllResolverKeys} from '../actions/pav3Actions';
import type {MappedResolverKey} from '../lib/types/pav3';
import type {ResolverKeys} from '../lib/types/resolverKeys';
import {
  EMPTY_RESOLVER_KEYS,
  loadEnsResolverKeys,
  loadUnsResolverKeys,
} from '../lib/types/resolverKeys';

export type UseResolverKeys = {
  unsResolverKeys: ResolverKeys;
  ensResolverKeys: ResolverKeys;
  mappedResolverKeys?: MappedResolverKey[];
  loading: boolean;
};

/**
 * Fetches UNS and ENS resolver keys
 */
const useResolverKeys = (): UseResolverKeys => {
  const [unsResolverKeys, setUnsResolverKeys] = useState(EMPTY_RESOLVER_KEYS);
  const [ensResolverKeys, setEnsResolverKeys] = useState(EMPTY_RESOLVER_KEYS);
  const [legacyResolverKeysLoading, setLegacyResolverKeysLoading] =
    useState(true);
  const {data: mappedResolverKeys, isLoading: mappedResolverKeysLoading} =
    useQuery(['all-resolver-keys'], getAllResolverKeys, {
      cacheTime: Infinity, // Cache indefinitely
      staleTime: Infinity, // Prevent automatic refetching of the data
    });

  const loadResolverKeys = async () => {
    const [newUnsResolverKeys, newEnsResolverKeys] = await Promise.all([
      loadUnsResolverKeys(),
      loadEnsResolverKeys(),
    ]);
    setUnsResolverKeys(newUnsResolverKeys);
    setEnsResolverKeys(newEnsResolverKeys);
    setLegacyResolverKeysLoading(false);
  };

  useEffect(() => {
    void loadResolverKeys();
  }, []);

  return {
    unsResolverKeys,
    ensResolverKeys,
    mappedResolverKeys,
    loading: legacyResolverKeysLoading || mappedResolverKeysLoading,
  };
};

export default useResolverKeys;
