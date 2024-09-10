import type {Web3Dependencies} from '../../../../lib';
import type {ResolverKeyName} from '../../../../lib/types/resolverKeys';

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

export const getRecordKey = (
  symbol: string,
  multichainVersion?: string,
): ResolverKeyName => {
  if (symbol === 'MATIC') {
    return `crypto.MATIC.version.${(
      multichainVersion || 'MATIC'
    ).toUpperCase()}.address` as ResolverKeyName;
  }
  return multichainVersion
    ? (`crypto.${symbol.toUpperCase()}.version.${multichainVersion.toUpperCase()}.address` as ResolverKeyName)
    : (`crypto.${symbol.toUpperCase()}.address` as ResolverKeyName);
};
