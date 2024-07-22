import type config from '@unstoppabledomains/config';

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

type BLOCKCHAIN = keyof typeof config.BLOCKCHAINS;
export const getBlockchainSymbol = (name: string): BLOCKCHAIN => {
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
      throw new Error(`Unknown blockchain name: ${name}`);
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
