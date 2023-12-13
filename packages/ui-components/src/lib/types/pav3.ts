import type UnsResolverKeysJson from 'uns/resolver-keys.json';

export type RecordUpdateResponse = {
  operationId: string;
  dependencyId: string;
  message: string;
};

export type UnsResolverKey = keyof typeof UnsResolverKeysJson.keys;
