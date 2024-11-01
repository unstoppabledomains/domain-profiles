import config from '@unstoppabledomains/config';

export const getProviderUrl = (chainId: number) => {
  const providerUrl = Object.values(config.BLOCKCHAINS).find(
    v => v.CHAIN_ID === chainId,
  )?.JSON_RPC_API_URL;
  if (providerUrl) {
    return providerUrl;
  }

  // an RPC provider URL is required
  throw new Error(`Chain ID not supported: ${chainId}`);
};
