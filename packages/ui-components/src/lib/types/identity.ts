export type SerializedIdentityResponse = {
  account: string;
  domain: string;
  status: 'minting' | 'ready';
};

export type SerializedOtpResponse = {
  account: string;
  type: string;
};
