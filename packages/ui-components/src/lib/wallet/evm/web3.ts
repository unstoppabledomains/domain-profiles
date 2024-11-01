import {Web3} from 'web3';

import config from '@unstoppabledomains/config';

export const getWeb3 = (chainId: number): Web3 | undefined => {
  const providerUrl = Object.values(config.BLOCKCHAINS).find(
    v => v.CHAIN_ID === chainId,
  )?.JSON_RPC_API_URL;
  if (!providerUrl) {
    return undefined;
  }
  return new Web3(providerUrl);
};
