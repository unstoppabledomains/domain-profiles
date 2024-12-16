import config from '@unstoppabledomains/config';
import {BaseBlockchainConfig} from '@unstoppabledomains/config/build/src/env/types';

import {notifyEvent} from '../../../../lib';
import type {MappedResolverKey} from '../../../../lib/types/pav3';
import {getMappedResolverKey} from '../../../../lib/types/resolverKeys';
import type {Web3Dependencies} from '../../../../lib/types/web3';

export type VerificationProps = {
  ownerAddress: string;
  address: string;
  currency: string;
  domain: string;
  setVerified: React.Dispatch<React.SetStateAction<string>>;
  setWeb3Deps: (value: Web3Dependencies | undefined) => void;
};

export const getBlockchainDisplaySymbol = (symbol: string): string => {
  if (!symbol) {
    return '';
  }
  switch (symbol.toUpperCase()) {
    case 'MATIC':
      return 'POL';
    default:
      return symbol.toUpperCase();
  }
};

export const getBlockchainGasSymbol = (symbol: string): string => {
  if (!symbol) {
    return '';
  }
  switch (symbol.toLowerCase()) {
    case 'eth':
    case 'base':
      return 'ETH';
    case 'polygon':
    case 'matic':
    case 'pol':
      return 'MATIC';
    case 'sol':
    case 'solana':
      return 'SOL';
  }
  return symbol.toUpperCase();
};

export const getBlockchainName = (symbol: string): string => {
  if (!symbol) {
    return '';
  }
  switch (symbol.toUpperCase()) {
    case 'ETH':
      return 'Ethereum';
    case 'MATIC':
      return 'Polygon';
    case 'AVAX':
      return 'Avalanche';
    case 'BTC':
      return 'Bitcoin';
    case 'SOL':
      return 'Solana';
    default:
      return symbol;
  }
};

export const getBlockchainSymbol = (
  name: string,
  noMatchEmpty?: boolean,
): string => {
  switch (name.toUpperCase()) {
    case 'ETHEREUM':
    case 'ETH':
      return 'ETH';
    case 'POLYGON':
    case 'MATIC':
    case 'POL':
      return 'MATIC';
    case 'BASE':
      return 'BASE';
    case 'BITCOIN':
    case 'BTC':
      return 'BTC';
    case 'SOLANA':
    case 'SOL':
      return 'SOL';
    default:
      return noMatchEmpty ? '' : name.toUpperCase();
  }
};

export const getBlockchainSymbolFromChainId = (
  chainId: number,
): string | undefined => {
  return Object.keys(config.BLOCKCHAINS)
    .filter(k => k.toLowerCase() !== 'zil')
    .map(k => ({k, chain: config.BLOCKCHAINS[k] as BaseBlockchainConfig}))
    .find(b => b.chain.CHAIN_ID === chainId)?.k;
};

// getRecordKeys retrieves ordered list of keys for provided symbol
export const getRecordKeys = (
  symbol: string,
  mappedResolverKeys: MappedResolverKey[],
  records?: Record<string, string>,
): string[] => {
  // scan available records if provided
  if (records) {
    for (const recordKey of Object.keys(records)) {
      // find possible resolver key associated with record
      const mappedKey = getMappedResolverKey(
        recordKey,
        mappedResolverKeys as MappedResolverKey[],
      );
      if (!mappedKey) {
        continue;
      }

      // look for potential matches of requested symbol
      for (const shortName of [symbol, getBlockchainDisplaySymbol(symbol)]) {
        if (mappedKey.shortName.toLowerCase() === shortName.toLowerCase()) {
          notifyEvent('resolved record key', 'info', 'Wallet', 'Resolution', {
            meta: {
              symbol,
              recordKey,
              recordValue: records[recordKey],
            },
          });
          return [recordKey];
        }
      }
    }
  }

  // fallback to a key based search
  const mappedKey = getMappedResolverKey(symbol, mappedResolverKeys);
  if (!mappedKey) {
    return [];
  }
  return [
    mappedKey.key,
    mappedKey.mapping?.to || '',
    mappedKey.parents?.find(p => p.subType === 'CRYPTO_NETWORK')?.key || '',
    mappedKey.parents?.find(p => p.subType === 'CRYPTO_FAMILY')?.key || '',
  ].filter(k => k);
};
