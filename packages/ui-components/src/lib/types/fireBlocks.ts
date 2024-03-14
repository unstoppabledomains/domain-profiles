export type BootstrapState = GetTokenResponse & {
  deviceId: string;
};

export const BootstrapStateKey = 'fireblocks-bootstrap-state';

export interface GetAuthorizationTxResponse {
  status: string;
  transactionId: string;
}

export interface GetBootstrapTokenResponse {
  deviceId: string;
  accessToken: string;
}

export interface GetTokenResponse {
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
