import {Keypair, PublicKey} from '@solana/web3.js';
import bs58 from 'bs58';

import {localStorageWrapper} from '../../../components/Chat/storage';
import {DomainProfileKeys} from '../../types';
import {decrypt} from './key';
import type {EncryptedPin, LockStatus} from './types';
import { WalletLockedError} from './types';

export const getEncryptedPin = async (): Promise<EncryptedPin | undefined> => {
  const encryptedPinStr = await localStorageWrapper.getItem(
    DomainProfileKeys.EncryptedPIN,
  );
  if (!encryptedPinStr) {
    return undefined;
  }
  return JSON.parse(encryptedPinStr) as EncryptedPin;
};

export const getKeypair = async (pin: string): Promise<Keypair> => {
  const encryptedPin = await getEncryptedPin();
  if (!encryptedPin) {
    throw new WalletLockedError('PIN not found');
  }
  const decryptedPrivateKey = decrypt(encryptedPin.encryptedPrivateKey, pin);
  if (!decryptedPrivateKey) {
    throw new WalletLockedError('invalid PIN');
  }
  return Keypair.fromSecretKey(bs58.decode(decryptedPrivateKey));
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

export const removeEncryptedPin = async () => {
  await localStorageWrapper.removeItem(DomainProfileKeys.EncryptedPIN);
};

export const removeLockStatus = async () => {
  await localStorageWrapper.removeItem(DomainProfileKeys.LockStatus);
};

export const saveEncryptedPin = async (data: EncryptedPin) => {
  // store the public key and encrypted private key
  await localStorageWrapper.setItem(
    DomainProfileKeys.EncryptedPIN,
    JSON.stringify(data),
  );
};

export const saveLockStatus = async (data: LockStatus) => {
  // store the public key and encrypted private key
  await localStorageWrapper.setItem(
    DomainProfileKeys.LockStatus,
    JSON.stringify(data),
  );
};
