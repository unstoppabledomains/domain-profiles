export interface EncryptedPin {
  publicKey: string;
  encryptedPrivateKey: string;
}

export interface LockStatus {
  proof: string;
  timestamp: number;
}
