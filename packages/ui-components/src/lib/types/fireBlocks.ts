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
  userName?: string;
  bootstrapToken: string;
  refreshToken: string;
  lockedRefreshToken?: string;
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

export const FB_MAX_RETRY = 100;

export const FB_WAIT_TIME_MS = 1000;

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

export interface GetOperationResponseError {
  code: string;
  message: string;
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

export const OPERATION_CODE_EMAIL_OTP_REQUIRED = 'EMAIL_OTP_REQUIRED';

export const OPERATION_CODE_MFA_REQUIRED = 'OTP_TOKEN_REQUIRED';

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

export interface RecoveryStatusResponse {
  emailAddress: string;
  createdDate?: Date;
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

export interface TransactionLockRequest {
  time?: number;
  timeUnit?: 'MINUTES' | 'HOURS' | 'DAYS';
}

export interface TransactionLockStatusResponse {
  '@type': string;
  enabled: boolean;
  validUntil?: number;
}

export interface TransactionRule {
  '@type': string;
  id: string;
  name: string;
  active: boolean;
  validUntil: string | null;
  type: TransactionRuleType;
  parameters: {
    conditions: {
      any?: TransactionRuleCondition[];
      all?: TransactionRuleCondition[];
    };
  };
  acceptanceCriteria?: {
    '@type': string;
    items: TransactionRuleAcceptanceCriteria[];
  };
}

export interface TransactionRuleAcceptanceCriteria {
  '@type': string;
  id: string;
  name: string;
  type: TransactionRuleAcceptanceCriteriaType;
  status: string;
}

export type TransactionRuleAcceptanceCriteriaType = 'MFA_CODE' | 'BLOCK';

export interface TransactionRuleCondition {
  field: 'AMOUNT' | 'SYMBOL' | 'BLOCKCHAIN.ID';
  operator: 'EQ' | 'GT' | 'GTE' | 'LT' | 'LTE';
  value: number | string;
}

export class TransactionRuleEmailOtpRequiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TransactionRuleEmailOtpRequiredError';
  }
}

// define a new error type for MFA required
export class TransactionRuleMfaRequiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TransactionRuleMfaRequiredError';
  }
}

export interface TransactionRuleRequest {
  name: string;
  type: TransactionRuleType;
  active: boolean;
  parameters: {
    conditions: {
      any: TransactionRuleCondition[];
    };
  };
}

export type TransactionRuleType = 'SEND_FUNDS' | 'SIGN_ANYTHING';

export interface TransactionRulesListResponse {
  '@type': string;
  items: TransactionRule[];
  next: string | null;
}

export interface Validations {
  isAuthToken: boolean;
  isTemporary: boolean;
  hasSessionKey: boolean;
  hasRecoveryContext: boolean;
  expiresAt: number;
  isExpired: boolean;
  issuedAt: number;
}

export interface VerifyTokenResponse {
  '@type': string;
  isValid: boolean;
  validations: Validations;
}

export const isOperationResponseError = (
  response: GetOperationResponse | GetOperationResponseError,
): response is GetOperationResponseError => {
  return typeof response === 'object' && 'code' in response;
};
