import QueryString from 'qs';

import config from '@unstoppabledomains/config';

import type {NftResponse, SerializedWalletNftCollection} from '../lib';
import {fetchApi} from '../lib';

export const NFT_PAGE_SIZE = 10;

export const getWalletCollectionNfts = async (
  symbol: string,
  address: string,
  collectionId: string,
  cursor?: string,
  forceRefresh?: boolean,
): Promise<Record<string, NftResponse> | undefined> => {
  const domainProfileUrl = `/user/${address}/nfts?${QueryString.stringify(
    {
      symbols: symbol,
      collection: collectionId,
      limit: NFT_PAGE_SIZE,
      cursor,
      forceRefresh: forceRefresh ? Date.now() : undefined,
    },
    {encode: false},
  )}`;
  return await fetchApi(domainProfileUrl, {host: config.PROFILE.HOST_URL});
};

export const getWalletNftCollections = async (
  address: string,
  forceRefresh?: boolean,
): Promise<Record<string, SerializedWalletNftCollection[]> | undefined> => {
  const domainProfileUrl = `/user/${address}/nfts/collections?forceRefresh=${
    forceRefresh ? Date.now() : undefined
  }`;
  return await fetchApi(domainProfileUrl, {host: config.PROFILE.HOST_URL});
};
