export type AppEnv = 'development' | 'test' | 'e2e' | 'staging' | 'production';

export type BaseBlockchainConfig = {
  CHAIN_ID: number;
  NETWORK_NAME: string;
  JSON_RPC_API_URL: string;
  BLOCK_EXPLORER_NAME: string;
  BLOCK_EXPLORER_BASE_URL: string;
  DISABLE_CONTRACTS_CACHE: boolean;
};

export type ZilliqaBlockchainConfig = BaseBlockchainConfig & {
  CHAIN_ID: 333 | 1;
  NETWORK_NAME: 'testnet' | 'mainnet';
  ZILLIQA_VERSION: number;
  ZNS_REGISTRY_ADDRESS: string;
};

export type EthereumBlockchainConfig = BaseBlockchainConfig & {
  CHAIN_ID: 5 | 1 | 1337;
  NETWORK_NAME: 'goerli' | 'mainnet' | 'local';
  PROXY_READER_ADDRESS: string;
  OPEN_SEA_BASE_URL:
    | 'https://opensea.io/assets/'
    | 'https://testnets.opensea.io/assets/';
};

export type MaticBlockchainConfig = BaseBlockchainConfig & {
  CHAIN_ID: 80001 | 137 | 1337;
  NETWORK_NAME: 'mumbai' | 'polygon-mainnet' | 'local';
  PROXY_READER_ADDRESS: string;
  OPEN_SEA_BASE_URL:
    | 'https://opensea.io/assets/matic/'
    | 'https://testnets.opensea.io/assets/mumbai/';
};

export type Config = {
  APP_ENV: AppEnv;
  APP_VERSION: string;
  BLOCKCHAINS: {
    ZIL: ZilliqaBlockchainConfig;
    ETH: EthereumBlockchainConfig;
    MATIC: MaticBlockchainConfig;
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
  VERIFICATION_SUPPORTED: string[];
  PUSH: {
    CHANNELS: string[];
  };
  WALLETCONNECT_PROJECT_ID: string;
  XMTP: {
    ENVIRONMENT: 'dev' | 'production';
    MAX_ATTACHMENT_BYTES: number;
    SUPPORT_WALLET_ADDRESS: string;
    SUPPORT_DOMAIN_NAME: string;
    SUPPORT_BUBBLE_SECONDS: number;
  };
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
