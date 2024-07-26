import type UnsResolverKeysJson from 'uns/resolver-keys.json';

export type RecordUpdateResponse = {
  operationId: string;
  dependencyId: string;
  transaction: {
    messageToSign?: string;
    contractAddress?: string;
    data?: string;
    value?: string;
  };
};

export type UnsResolverKey = keyof typeof UnsResolverKeysJson.keys;
