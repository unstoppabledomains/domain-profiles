import type {ConfigOverride} from './types';

export default function getProductionConfig(): ConfigOverride {
  return {
    APP_ENV: 'production',
    UNSTOPPABLE_API_URL: 'https://api.unstoppabledomains.com',
    UNSTOPPABLE_WEBSITE_URL: 'https://unstoppabledomains.com',
    UNSTOPPABLE_METADATA_ENDPOINT:
      'https://api.unstoppabledomains.com/metadata',
    BLOCKCHAINS: {
      ZIL: {
        CHAIN_ID: 1,
        NETWORK_NAME: 'mainnet',
        JSON_RPC_API_URL: 'https://api.zilliqa.com/',
        ZILLIQA_VERSION: 65537,
        ZNS_REGISTRY_ADDRESS: 'zil1jcgu2wlx6xejqk9jw3aaankw6lsjzeunx2j0jz',
      },
      ETH: {
        CHAIN_ID: 1,
        NETWORK_NAME: 'mainnet',
        JSON_RPC_API_URL:
          'https://mainnet.infura.io/v3/4458cf4d1689497b9a38b1d6bbf05e78',
        BLOCK_EXPLORER_BASE_URL: 'https://etherscan.io',
        PROXY_READER_ADDRESS: '0xc3C2BAB5e3e52DBF311b2aAcEf2e40344f19494E',
        OPEN_SEA_BASE_URL: 'https://opensea.io/assets/',
      },
      MATIC: {
        CHAIN_ID: 137,
        NETWORK_NAME: 'polygon-mainnet',
        JSON_RPC_API_URL:
          'https://polygon-mainnet.infura.io/v3/4458cf4d1689497b9a38b1d6bbf05e78',
        BLOCK_EXPLORER_BASE_URL: 'https://polygonscan.com',
        PROXY_READER_ADDRESS: '0xA3f32c8cd786dc089Bd1fC175F2707223aeE5d00',
        OPEN_SEA_BASE_URL: 'https://opensea.io/assets/matic/',
      },
    },
    LOGIN_WITH_UNSTOPPABLE: {
      CLIENT_ID: 'c3af833f-3fd5-46fd-ac3e-bfc136624d1b',
      REDIRECT_URI: 'https://domain-profiles-wnjctwcyaa-uc.a.run.app',
    },
    MESSAGING: {
      EMAIL_DOMAIN: 'ud.me',
      HOST_URL: 'https://messaging.unstoppabledomains.com',
    },
    IDENTITY: {
      HOST_URL: 'https://identity.unstoppabledomains.com',
    },
    PROFILE: {
      HOST_URL: 'https://api.unstoppabledomains.com/profile',
    },
    PUSH: {
      CHANNELS: ['eip155:1:0xdbBc2Ac8cb8D02B26F165b4BC120fd4b14DA6cDA'],
    },
    XMTP: {
      ENVIRONMENT: 'production',
      SUPPORT_WALLET_ADDRESS: '0x9B4Ed628640A73154895e369AE39a93732535924',
      SUPPORT_DOMAIN_NAME: 'support.unstoppable.x',
    },
  };
}
