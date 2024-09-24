import type {Web3Dependencies} from '../../../../lib';
import {MappedResolverKey} from '../../../../lib/types/pav3';
import {getMappedResolverKey} from '../../../../lib/types/resolverKeys';

export type VerificationProps = {
  ownerAddress: string;
  address: string;
  currency: string;
  domain: string;
  setVerified: React.Dispatch<React.SetStateAction<string>>;
  setWeb3Deps: (value: Web3Dependencies | undefined) => void;
};

export const getBlockchainName = (symbol: string): string => {
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

export const getBlockchainDisplaySymbol = (symbol: string): string => {
  switch (symbol.toUpperCase()) {
    case 'MATIC':
      return 'POL';
    default:
      return symbol.toUpperCase();
  }
};

// getRecordKeys retrieves ordered list of keys for provided symbol
export const getRecordKeys = (
  symbol: string,
  mappedResolverKeys: MappedResolverKey[],
): string[] => {
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
