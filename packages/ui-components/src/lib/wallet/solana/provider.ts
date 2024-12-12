import {Connection} from '@solana/web3.js';

import {getProviderUrl} from '../evm/provider';

export const getSolanaProvider = () => {
  return new Connection(getProviderUrl('SOL'), 'confirmed');
};
