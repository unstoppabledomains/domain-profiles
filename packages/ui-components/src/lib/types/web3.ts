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
      return isEthAddress(addr) ? `https://basescan.org/address/${addr}` : '';
    case 'MATIC':
      return isEthAddress(addr)
        ? `https://polygonscan.com/address/${addr}`
        : '';
    case 'BTC':
      return `https://www.blockchain.com/explorer/addresses/btc/${addr}`;
    case 'SOL':
      return `https://solscan.io/account/${addr}`;
    default:
      return '';
  }
};
