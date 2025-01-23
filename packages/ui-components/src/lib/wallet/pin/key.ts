import {Keypair} from '@solana/web3.js';
import bs58 from 'bs58';
import * as crypto from 'crypto-js';

import {notifyEvent} from '../../error';
import {saveEncryptedPin} from './store';

export const createPIN = async (pin: string): Promise<string> => {
  // create a new public key pair
  const pinKeypair = Keypair.generate();

  // encrypt the private key using the user provided PIN
  const encryptedPrivateKey = encrypt(bs58.encode(pinKeypair.secretKey), pin);

  // store the public key and encrypted private key
  const publicKey = pinKeypair.publicKey.toBase58();
  await saveEncryptedPin({
    encryptedPrivateKey,
    publicKey,
  });
  return publicKey;
};

// decrypt a secret with user provided PIN
export const decrypt = (cipherText: string, pin: string) => {
  try {
    const bytes = crypto.AES.decrypt(cipherText, pin);
    const originalText = bytes.toString(crypto.enc.Utf8);
    return originalText;
  } catch (e) {
    notifyEvent(
      'unable to decrypt secret',
      'warning',
      'Wallet',
      'Authorization',
    );
  }
  return undefined;
};

// encrypt a secret with user provided PIN
export const encrypt = (plainText: string, pin: string) => {
  return crypto.AES.encrypt(plainText, pin).toString();
};
