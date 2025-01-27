export interface EncryptedPin {
  publicKey: string;
  encryptedPrivateKey: string;
  encryptedPin: string;
}

export interface LockStatus {
  proof: string;
  timestamp: number;
}

export class SessionLockError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, SessionLockError.prototype);
    this.name = 'SessionLockError';
  }
}
