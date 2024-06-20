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
    default:
      return symbol;
  }
};

export const getBlockchainSymbol = (name: string): string => {
  switch (name.toUpperCase()) {
    case 'ETHEREUM':
    case 'ETH':
      return 'ETH';
    case 'POLYGON':
    case 'MATIC':
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
      return name.toUpperCase();
  }
};

export const getRecordKey = (
  symbol: string,
  multichainVersion = 'MATIC',
): ResolverKeyName => {
  if (symbol === 'MATIC') {
    return `crypto.MATIC.version.${multichainVersion.toUpperCase()}.address` as ResolverKeyName;
  }
  return multichainVersion
    ? (`crypto.${symbol.toUpperCase()}.version.${multichainVersion.toUpperCase()}.address` as ResolverKeyName)
    : (`crypto.${symbol.toUpperCase()}.address` as ResolverKeyName);
};
