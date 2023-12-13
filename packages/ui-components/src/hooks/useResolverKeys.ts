import {useEffect, useState} from 'react';

import type {ResolverKeys} from '../lib/types/resolverKeys';
import {
  EMPTY_RESOLVER_KEYS,
  loadEnsResolverKeys,
  loadUnsResolverKeys,
} from '../lib/types/resolverKeys';

export type UseResolverKeys = {
  unsResolverKeys: ResolverKeys;
  ensResolverKeys: ResolverKeys;
  loading: boolean;
};

/**
 * Fetches UNS and ENS resolver keys
 */
const useResolverKeys = (): UseResolverKeys => {
  const [unsResolverKeys, setUnsResolverKeys] = useState(EMPTY_RESOLVER_KEYS);
  const [ensResolverKeys, setEnsResolverKeys] = useState(EMPTY_RESOLVER_KEYS);
  const [loading, setLoading] = useState(true);

  const loadResolverKeys = async () => {
    const [newUnsResolverKeys, newEnsResolverKeys] = await Promise.all([
      loadUnsResolverKeys(),
      loadEnsResolverKeys(),
    ]);
    setUnsResolverKeys(newUnsResolverKeys);
    setEnsResolverKeys(newEnsResolverKeys);
    setLoading(false);
  };

  useEffect(() => {
    void loadResolverKeys();
  }, []);

  return {unsResolverKeys, ensResolverKeys, loading};
};

export default useResolverKeys;
