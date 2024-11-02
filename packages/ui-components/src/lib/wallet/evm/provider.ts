import config from '@unstoppabledomains/config';

import {getBlockchainSymbol} from '../../../components/Manage/common/verification/types';

export const getProviderUrl = (blockchainId: string) => {
  // use the provided ID directly
  if (config.BLOCKCHAINS[blockchainId]?.JSON_RPC_API_URL) {
    return config.BLOCKCHAINS[blockchainId].JSON_RPC_API_URL;
  }

  // try with blockchain symbol mapping
  const symbol = getBlockchainSymbol(blockchainId);
  if (config.BLOCKCHAINS[symbol]?.JSON_RPC_API_URL) {
    return config.BLOCKCHAINS[symbol].JSON_RPC_API_URL;
  }

  // an RPC provider URL is required
  throw new Error(`Chain ID not supported: ${blockchainId}`);
};
