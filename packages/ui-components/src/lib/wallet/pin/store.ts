import {Keypair, PublicKey} from '@solana/web3.js';
import bs58 from 'bs58';

import {localStorageWrapper} from '../../../components/Chat/storage';
import {DomainProfileKeys} from '../../types';
import {decrypt, getJwtAud} from './key';
import type {EncryptedPin, LockStatus} from './types';
import {SessionLockError} from './types';

export const getEncryptedPin = async (): Promise<EncryptedPin | undefined> => {
  const encryptedPinStr = await localStorageWrapper.getItem(
    DomainProfileKeys.EncryptedPIN,
  );
  if (!encryptedPinStr) {
    return undefined;
  }
  return JSON.parse(encryptedPinStr) as EncryptedPin;
};

export const getKeypairFromPin = async (pin: string): Promise<Keypair> => {
  const encryptedPin = await getEncryptedPin();
  if (!encryptedPin) {
    throw new SessionLockError('PIN not found');
  }
  const decryptedPrivateKey = decrypt(encryptedPin.encryptedPrivateKey, pin);
  if (!decryptedPrivateKey) {
    throw new SessionLockError('invalid PIN');
  }
  return Keypair.fromSecretKey(bs58.decode(decryptedPrivateKey));
};

export const getKeypairFromToken = async (token: string): Promise<Keypair> => {
  // retrieve the PIN using token
  const pin = await getPinFromToken(token);

  // retrieve the keypair using the PIN
  return getKeypairFromPin(pin);
};

export const getLockStatus = async (): Promise<LockStatus | undefined> => {
  const lockStatusStr = await localStorageWrapper.getItem(
    DomainProfileKeys.LockStatus,
  );
  if (!lockStatusStr) {
    return undefined;
  }
  return JSON.parse(lockStatusStr) as LockStatus;
};

export const getPinFromToken = async (token: string): Promise<string> => {
  const encryptedPin = await getEncryptedPin();
  if (!encryptedPin) {
    throw new SessionLockError('PIN not found');
  }

  // decrypt the PIN using the token
  const jwtAud = getJwtAud(token);
  const pin = decrypt(encryptedPin.encryptedPin, jwtAud);
  if (!pin) {
    throw new SessionLockError('invalid token');
  }
  return pin;
};

export const getPublicKey = async (): Promise<PublicKey | undefined> => {
  const encryptedPinStr = await localStorageWrapper.getItem(
    DomainProfileKeys.EncryptedPIN,
  );
  if (!encryptedPinStr) {
    return undefined;
  }
  const encryptedPin = JSON.parse(encryptedPinStr) as EncryptedPin;
  return new PublicKey(encryptedPin.publicKey);
};

export const removeEncryptedPin = async (opts?: {
  accessToken?: string;
  accountId?: string;
}) => {
  // remove the PIN from local storage
  await localStorageWrapper.removeItem(DomainProfileKeys.EncryptedPIN);

  // if requested, also remove the configuration from wallet storage
  if (opts?.accessToken && opts?.accountId) {
    await localStorageWrapper.removeItem(DomainProfileKeys.EncryptedPIN, {
      type: 'wallet',
      accessToken: opts.accessToken,
      accountId: opts.accountId,
    });
  }
};

export const removeLockStatus = async () => {
  await localStorageWrapper.removeItem(DomainProfileKeys.LockStatus);
};

export const saveEncryptedPin = async (
  data: EncryptedPin,
  opts?: {
    accessToken?: string;
    accountId?: string;
  },
) => {
  // store the public key and encrypted private key to local storage
  await localStorageWrapper.setItem(
    DomainProfileKeys.EncryptedPIN,
    JSON.stringify(data),
  );

  // if requested, also store the configuration to wallet storage
  if (opts?.accessToken && opts?.accountId) {
    await localStorageWrapper.setItem(
      DomainProfileKeys.EncryptedPIN,
      JSON.stringify(data),
      {
        type: 'wallet',
        accessToken: opts.accessToken,
        accountId: opts.accountId,
      },
    );
  }
};

export const saveLockStatus = async (data: LockStatus) => {
  // store the public key and encrypted private key
  await localStorageWrapper.setItem(
    DomainProfileKeys.LockStatus,
    JSON.stringify(data),
  );
};
