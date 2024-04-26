export interface Account {
  '@type': string;
  id: string;
}

export interface AccountAsset {
  '@type': string;
  id: string;
  address: string;
  blockchainAsset: BlockchainAsset;
  accountId?: string;
}

export interface Blockchain {
  id: string;
  name: string;
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
}

export const BootstrapStateCurrentKey = 'current';
export const BootstrapStatePrefix = 'wallet-service-state';
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

export interface GetOperationResponse {
  '@type': string;
  operation: Operation;
}

export interface GetOperationStatusResponse {
  '@type': string;
  id: string;
  lastUpdatedTimestamp: number;
  status: OperationStatus;
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

export interface Operation {
  '@type': string;
  id: string;
  lastUpdatedTimestamp: number;
  status: string;
  type: string;
}

export enum OperationStatus {
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