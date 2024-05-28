import type {Config} from './types';

export default function getDefaultConfig(): Config {
  return {
    APP_ENV: 'development',
    APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',
    BLOCKCHAINS: {
      ZIL: {
        CHAIN_ID: 333,
        NETWORK_NAME: 'testnet',
        JSON_RPC_API_URL: 'https://dev-api.zilliqa.com',
        ZILLIQA_VERSION: 21823489,
        BLOCK_EXPLORER_NAME: 'viewblock',
        BLOCK_EXPLORER_BASE_URL: 'https://viewblock.io',
        BLOCK_EXPLORER_TX_URL: '',
        ZNS_REGISTRY_ADDRESS: 'zil1hyj6m5w4atcn7s806s69r0uh5g4t84e8gp6nps',
        DISABLE_CONTRACTS_CACHE: true,
      },
      ETH: {
        CHAIN_ID: 5,
        NETWORK_NAME: 'goerli', // testnet
        JSON_RPC_API_URL: `https://goerli.infura.io/v3/a58ebb0c76a64c149e35145f85f82382`,
        BLOCK_EXPLORER_NAME: 'etherscan',
        BLOCK_EXPLORER_BASE_URL: 'https://goerli.etherscan.io',
        BLOCK_EXPLORER_TX_URL: 'https://www.oklink.com/sepolia-test/tx/',
        DISABLE_CONTRACTS_CACHE: true,
        PROXY_READER_ADDRESS: '0xFc5f608149f4D9e2Ed0733efFe9DD57ee24BCF68',
        OPEN_SEA_BASE_URL: 'https://testnets.opensea.io/assets/sepolia/',
        ENS_CONTRACT_ADDRESS: '0x114d4603199df73e7d157787f8778e21fcd13066',
      },
      MATIC: {
        CHAIN_ID: 80002,
        NETWORK_NAME: 'amoy', // testnet
        JSON_RPC_API_URL:
          'https://polygon-amoy.infura.io/v3/a58ebb0c76a64c149e35145f85f82382',
        BLOCK_EXPLORER_NAME: 'polygonscan',
        BLOCK_EXPLORER_BASE_URL: 'https://amoy.polygonscan.com',
        BLOCK_EXPLORER_TX_URL: 'https://www.oklink.com/amoy/tx/',
        DISABLE_CONTRACTS_CACHE: true,
        PROXY_READER_ADDRESS: '0x332A8191905fA8E6eeA7350B5799F225B8ed30a9',
        OPEN_SEA_BASE_URL: 'https://testnets.opensea.io/assets/amoy/',
      },
      BTC: {
        BLOCK_EXPLORER_TX_URL: 'https://www.oklink.com/btc/tx/',
      },
      SOL: {
        BLOCK_EXPLORER_TX_URL: 'https://www.oklink.com/sol/tx/',
      },
    },
    UD_LOGO_URL:
      'https://storage.googleapis.com/unstoppable-client-assets/images/favicon/favicon-v3.ico',
    UD_ME_BASE_URL: 'https://staging.ud.me',
    UNSTOPPABLE_WEBSITE_URL: 'https://www.ud-staging.com',
    UNSTOPPABLE_API_URL: 'https://api.ud-staging.com',
    ASSETS_BUCKET_URL:
      'https://storage.googleapis.com/unstoppable-client-assets',
    UNSTOPPABLE_CONTRACT_ADDRESS: '0xa9a6a3626993d487d2dbda3173cf58ca1a9d9e9f',
    UNSTOPPABLE_METADATA_ENDPOINT: 'https://api.ud-staging.com/metadata',
    IPFS_BASE_URL: 'https://ipfs.io',
    VERIFICATION_SUPPORTED: ['SOL', 'ETH', 'MATIC', 'FTM', 'AVAX', 'BTC'],
    LOGIN_WITH_UNSTOPPABLE: {
      CLIENT_ID: '115148ec-364d-4e19-b7d8-2807e8f1b525',
      REDIRECT_URI:
        process.env.NEXT_PUBLIC_CLIENT_URL || 'http://localhost:3000',
    },
    BUGSNAG: {
      API_KEY: process.env.NEXT_PUBLIC_BUGSNAG_API_KEY || '',
    },
    COOKIE: {
      SECURE: true,
      SAME_SITE: 'lax',
    },
    MESSAGING: {
      EMAIL_DOMAIN: 'ud-staging.com',
      HOST_URL: 'https://api.ud-staging.com/messaging',
    },
    IDENTITY: {
      HOST_URL: 'https://api.ud-staging.com/identity',
    },
    PROFILE: {
      HOST_URL: 'https://api.ud-staging.com/profile',
    },
    WALLETS: {
      HOST_URL: 'https://api.ud-staging.com/wallet/v1',
      DOCUMENTATION_URL:
        'https://unstoppabledomains.freshdesk.com/support/solutions/48000457487',
      LANDING_PAGE_URL: 'https://unstoppabledomains.com/products/wallet-p',
      CHAINS: {
        BUY: ['BTC/BTC', 'MATIC/MATIC', 'SOL/SOL', 'ETH/ETH'],
        RECEIVE: ['BTC/BTC', 'MATIC/MATIC', 'SOL/SOL', 'BASE/ETH', 'ETH/ETH'],
        SEND: ['BTC/BTC', 'MATIC/MATIC', 'SOL/SOL', 'BASE/ETH', 'ETH/ETH'],
        DOMAINS: ['ETH', 'MATIC'],
      },
      SIGNATURE_SYMBOL: 'POLYGON/MATIC',
    },
    PUSH: {
      CHANNELS: ['eip155:5:0x0389246fB9191Dc41722e1f0D558dC8f82Be3C7A'],
      APP_URL: 'https://staging.push.org',
    },
    WALLETCONNECT_PROJECT_ID: 'b99b92d76dda44021bfbed5b1a0d010a',
    XMTP: {
      ENVIRONMENT: 'dev',
      MAX_ATTACHMENT_BYTES: 10 * 1024 * 1024, // 10 MB
      SUPPORT_WALLET_ADDRESS: '0xf7Ef453121bF016e4441F0c06e0951223fdbbB01',
      SUPPORT_DOMAIN_NAME: 'support.crypto',
      SUPPORT_BUBBLE_SECONDS: 60,
    },
    GATEWAY_API_KEY: process.env.GATEWAY_API_KEY || '',
  };
}
