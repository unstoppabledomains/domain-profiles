import config from '@unstoppabledomains/config';

import type {EvmBlockchain, Meta} from './types/blockchain';
import {Blockchain} from './types/blockchain';

export const formOpenSeaLink = (domainMeta: Meta) => {
  let url: null | string = null;

  const registryAddress = domainMeta.registryAddress;
  const blockchain = domainMeta.blockchain;

  if (!blockchain || blockchain === Blockchain.ZIL) {
    return url;
  } else if (domainMeta.tokenId && registryAddress) {
    url = `${
      config.BLOCKCHAINS[blockchain as EvmBlockchain].OPEN_SEA_BASE_URL
    }${registryAddress}/${domainMeta.tokenId}`;
  }
  return url;
};
