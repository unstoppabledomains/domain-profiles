export type AppEnv = 'development' | 'test' | 'e2e' | 'staging' | 'production';

export type BaseBlockchainConfig = {
  CHAIN_ID: number;
  NETWORK_NAME: string;
  JSON_RPC_API_URL: string;
  BLOCK_EXPLORER_NAME: string;
  BLOCK_EXPLORER_BASE_URL: string;
  BLOCK_EXPLORER_TX_URL: string;
  DISABLE_CONTRACTS_CACHE: boolean;
};

export type ZilliqaBlockchainConfig = BaseBlockchainConfig & {
  CHAIN_ID: 333 | 1;
  NETWORK_NAME: 'testnet' | 'mainnet';
  ZILLIQA_VERSION: number;
  ZNS_REGISTRY_ADDRESS: string;
  BLOCK_EXPLORER_TX_URL: '';
};

export type EthereumBlockchainConfig = BaseBlockchainConfig & {
  CHAIN_ID: 5 | 1 | 1337 | 11155111;
  NETWORK_NAME: 'goerli' | 'sepolia' | 'mainnet' | 'local';
  PROXY_READER_ADDRESS: string;
  ENS_CONTRACT_ADDRESS: string;
  OPEN_SEA_BASE_URL:
    | 'https://opensea.io/assets/'
    | 'https://testnets.opensea.io/assets/'
    | 'https://testnets.opensea.io/assets/sepolia/';
  BLOCK_EXPLORER_TX_URL:
    | 'https://www.oklink.com/sepolia-test/tx/'
    | 'https://www.oklink.com/eth/tx/';
};

export type MaticBlockchainConfig = BaseBlockchainConfig & {
  CHAIN_ID: 80002 | 137 | 1337;
  NETWORK_NAME: 'amoy' | 'polygon-mainnet' | 'local';
  PROXY_READER_ADDRESS: string;
  OPEN_SEA_BASE_URL:
    | 'https://opensea.io/assets/matic/'
    | 'https://testnets.opensea.io/assets/amoy/';
  BLOCK_EXPLORER_TX_URL:
    | 'https://www.oklink.com/amoy/tx/'
    | 'https://www.oklink.com/polygon/tx/';
};

export type BitcoinBlockchainConfig = BaseBlockchainConfig & {
  CHAIN_ID: 0;
  BLOCK_EXPLORER_TX_URL: 'https://www.oklink.com/btc/tx/';
};

export type SolanaBlockchainConfig = BaseBlockchainConfig & {
  CHAIN_ID: 0;
  BLOCK_EXPLORER_TX_URL: 'https://www.oklink.com/sol/tx/';
};

export type BaseChainBlockchainConfig = BaseBlockchainConfig & {
  CHAIN_ID: 8453;
  BLOCK_EXPLORER_TX_URL: 'https://www.oklink.com/base/tx/';
};

export interface SwapConfig {
  swing: {chain: string; symbol: string; type: 'erc20' | 'native'};
  walletType: string;
  chainName: string;
  chainSymbol: string;
  tokenSymbol: string;
  imageUrl: string;
  environment?: string;
}

export type Config = {
  APP_ENV: AppEnv;
  APP_VERSION: string;
  BLOCKCHAINS: {
    ZIL: ZilliqaBlockchainConfig;
    ETH: EthereumBlockchainConfig;
    MATIC: MaticBlockchainConfig;
    BTC: BitcoinBlockchainConfig;
    SOL: SolanaBlockchainConfig;
    BASE: BaseChainBlockchainConfig;
  };
  ASSETS_BUCKET_URL: string;
  UD_ME_BASE_URL: string;
  UD_LOGO_URL: string;
  UNSTOPPABLE_WEBSITE_URL: string;
  UNSTOPPABLE_API_URL: string;
  UNSTOPPABLE_METADATA_ENDPOINT: string;
  UNSTOPPABLE_CONTRACT_ADDRESS: string;
  IPFS_BASE_URL: string;
  LOGIN_WITH_UNSTOPPABLE: {
    CLIENT_ID: string;
    REDIRECT_URI: string;
  };
  BUGSNAG: {
    API_KEY: string;
  };
  COOKIE: {
    SECURE: boolean;
    SAME_SITE: boolean | 'lax' | 'none' | 'strict';
  };
  MESSAGING: {
    EMAIL_DOMAIN: string;
    HOST_URL: string;
  };
  IDENTITY: {
    HOST_URL: string;
  };
  PROFILE: {
    HOST_URL: string;
  };
  WALLETS: {
    HOST_URL: string;
    GET_WALLET_URL: string;
    LANDING_PAGE_URL: string;
    DOCUMENTATION_URL: string;
    CHAINS: {
      BUY: string[];
      RECEIVE: string[];
      SEND: string[];
      DOMAINS: string[];
    };
    SWAP: {
      PLATFORM_HOST_URL: string;
      EXCHANGE_HOST_URL: string;
      API_KEY: string;
      ENVIRONMENT: string;
      PROJECT_ID: string;
      FEE_BPS?: number;
      SUPPORTED_TOKENS: {
        SOURCE: SwapConfig[];
        DESTINATION: SwapConfig[];
      };
    };
    SIGNATURE_SYMBOL: string;
    MOBILE: {
      ANDROID_URL: string;
      APPLE_URL: string;
    };
    MAX_CLOCK_DRIFT_MS: number;
  };
  VERIFICATION_SUPPORTED: string[];
  PUSH: {
    CHANNELS: string[];
    APP_URL: string;
  };
  WALLETCONNECT_PROJECT_ID: string;
  XMTP: {
    ENVIRONMENT: 'dev' | 'production';
    MAX_ATTACHMENT_BYTES: number;
    SUPPORT_WALLET_ADDRESS: string;
    SUPPORT_DOMAIN_NAME: string;
    SUPPORT_BUBBLE_SECONDS: number;
    CONVERSATION_ALLOW_LIST: string[];
  };
  GATEWAY_API_KEY: string;
};

export type ConfigOverride = DeepPartial<Config>;

export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

// https://github.com/microsoft/TypeScript/issues/13923
export type Immutable<T> = T extends ImmutablePrimitive
  ? T
  : T extends Array<infer U>
  ? ImmutableArray<U>
  : T extends Map<infer K, infer V>
  ? ImmutableMap<K, V>
  : T extends Set<infer M>
  ? ImmutableSet<M>
  : ImmutableObject<T>;
export type ImmutableArray<T> = ReadonlyArray<Immutable<T>>;
export type ImmutableConfig = Immutable<Config>;
export type ImmutableMap<K, V> = ReadonlyMap<Immutable<K>, Immutable<V>>;
export type ImmutableObject<T> = {readonly [K in keyof T]: Immutable<T[K]>};
export type ImmutablePrimitive = undefined | null | boolean | string | number;

export type ImmutableSet<T> = ReadonlySet<Immutable<T>>;
