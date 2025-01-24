export interface EncryptedPin {
  publicKey: string;
  encryptedPrivateKey: string;
  isManual?: boolean;
}

export interface LockStatus {
  proof: string;
  timestamp: number;
}

export class WalletLockedError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, WalletLockedError.prototype);
    this.name = 'WalletLockedError';
  }
}
