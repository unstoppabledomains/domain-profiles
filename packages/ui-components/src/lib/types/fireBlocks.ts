import type {CustodyWallet} from './wallet';

export interface Account {
  '@type': string;
  id: string;
}

export interface AccountAsset {
  '@type': string;
  id: string;
  address: string;
  blockchainAsset: BlockchainAsset;
  balance?: AssetBalance;
  accountId?: string;
}

export interface AssetBalance {
  total: string;
  decimals: number;
}

export interface Blockchain {
  id: string;
  name: string;
  networkId?: number;
}

export interface BlockchainAsset {
  '@type': string;
  id: string;
  name: string;
  symbol: string;
  blockchain: Blockchain;
}

export interface BootstrapState {
  bootstrapToken: string;
  refreshToken: string;
  deviceId: string;
  assets: AccountAsset[];
  custodyState: CustodyWallet;
}

export const BootstrapStateCurrentKey = 'current';

export const BootstrapStatePrefix = 'wallet-service-state';

export interface CreateTransaction {
  chainId: number;
  to: string;
  data: string;
  value?: string;
  gasLimit?: string;
}

export const EIP_712_KEY = 'EIP712Domain';
export const FireblocksStateKey = 'fireblocks-state';
export interface GetAccountAssetsResponse {
  items: AccountAsset[];
}

export interface GetAccountsResponse {
  items: Account[];
}

export interface GetAuthorizationTxResponse {
  status: string;
  transactionId: string;
}

export interface GetBootstrapTokenResponse {
  deviceId: string;
  accessToken: string;
}

export interface GetEstimateTransactionResponse {
  '@type': string;
  priority: string;
  status: 'VALID' | 'INSUFFICIENT_FUNDS' | 'ERROR';
  networkFee?: {
    amount: string;
    asset: {
      '@type': string;
      id: string;
      address: string;
      balance: {
        total: string;
        decimals: number;
      };
      blockchainAsset: {
        '@type': string;
        id: string;
        name: string;
        symbol: string;
        blockchain: {
          id: string;
          name: string;
        };
      };
    };
  };
}

export interface GetOperationListResponse {
  '@type': string;
  items: Operation[];
}

export interface GetOperationResponse {
  '@type': string;
  operation: Operation;
}
export interface GetOperationStatusResponse {
  '@type': string;
  id: string;
  lastUpdatedTimestamp: number;
  status: OperationStatusType;
  type: string;
  parameters: Parameters;
  result?: Result;
  transaction?: {
    id?: string;
    externalVendorTransactionId?: string;
  };
}

export interface GetTokenResponse {
  code?: 'SUCCESS' | 'PROCESSING';
  accessToken: string;
  refreshToken: string;
  bootstrapToken: string;
}

export interface IDeviceStore {
  get(deviceId: string, key: string): Promise<string | null>;
  set(deviceId: string, key: string, value: string): Promise<void>;
  clear(deviceId: string, key: string): Promise<void>;
  getAllKeys(deviceId: string): Promise<string[]>;
}
export const MAX_RETRIES = 5;

export interface Operation {
  '@type': string;
  id: string;
  accountId: string;
  assetId: string;
  lastUpdatedTimestamp: number;
  status: string;
  type: string;
}

export enum OperationStatusType {
  QUEUED = 'QUEUED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  SIGNATURE_REQUIRED = 'SIGNATURE_REQUIRED',
  AWAITING_UPDATES = 'AWAITING_UPDATES',
}

export interface Parameters {
  message: string;
}

export interface Result {
  signature: string;
}

export interface TokenRefreshResponse {
  '@type': string;
  accessToken: string;
  refreshToken?: string;
  status: 'READY' | 'MFA_OTP_REQUIRED' | 'MFA_EMAIL_REQUIRED';
  code?: string;
  message?: string;
}
