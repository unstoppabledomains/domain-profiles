import config from '@unstoppabledomains/config';
import type {SourceConfig} from '@unstoppabledomains/resolution';
import {Resolution} from '@unstoppabledomains/resolution';

export const loadUnstoppableDomainsResolution =
  async (): Promise<Resolution> => {
    return new Resolution({sourceConfig: unstoppableDomainsResolutionConfig});
  };

export const unstoppableDomainsResolutionConfig: SourceConfig = {
  uns: {
    locations: {
      Layer1: {
        network: config.BLOCKCHAINS.ETH.NETWORK_NAME,
        proxyReaderAddress: config.BLOCKCHAINS.ETH.PROXY_READER_ADDRESS,
        url: config.BLOCKCHAINS.ETH.JSON_RPC_API_URL,
      },
      Layer2: {
        network: config.BLOCKCHAINS.MATIC.NETWORK_NAME,
        proxyReaderAddress: config.BLOCKCHAINS.MATIC.PROXY_READER_ADDRESS,
        url: config.BLOCKCHAINS.MATIC.JSON_RPC_API_URL,
      },
    },
  },
  zns: {
    network: config.BLOCKCHAINS.ZIL.NETWORK_NAME,
    registryAddress: config.BLOCKCHAINS.ZIL.ZNS_REGISTRY_ADDRESS,
    url: config.BLOCKCHAINS.ZIL.JSON_RPC_API_URL,
  },
};
