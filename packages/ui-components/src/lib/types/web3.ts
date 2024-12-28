import type {Signer} from 'ethers';

import {isEthAddress} from '../../components/Chat/protocol/resolution';
import type {CurrenciesType} from './blockchain';

export interface Web3Dependencies {
  address: string;
  signer: Signer;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  provider?: any;
  unstoppableWallet?: {
    addresses: string[];
    promptForSignatures: boolean;
    fullScreenModal?: boolean;
    connectedApp?: {
      name: string;
      hostUrl: string;
      iconUrl: string;
    };
  };
}

export const getBlockScanUrl = (symbol: CurrenciesType, addr: string) => {
  switch (symbol) {
    case 'ETH':
    case 'FTM':
    case 'AVAX':
    case 'BASE':
      return isEthAddress(addr)
        ? `https://www.oklink.com/${symbol.toLowerCase()}/address/${addr}?channelId=uns001`
        : '';
    case 'MATIC':
      return isEthAddress(addr)
        ? `https://www.oklink.com/polygon/address/${addr}?channelId=uns001`
        : '';
    case 'BTC':
      return `https://www.oklink.com/${symbol.toLowerCase()}/address/${addr}?channelId=uns001`;
    case 'SOL':
      return `https://www.oklink.com/sol/account/${addr}?channelId=uns001`;
    default:
      return '';
  }
};
