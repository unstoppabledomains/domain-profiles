import {Keypair} from '@solana/web3.js';
import bs58 from 'bs58';
import * as crypto from 'crypto-js';
import {jwtDecode} from 'jwt-decode';

import {notifyEvent} from '../../error';
import {saveEncryptedPin} from './store';
import {SessionLockError} from './types';

export const createPIN = async (
  pin: string,
  accountId: string,
  accessToken: string,
): Promise<string> => {
  // create a new public key pair
  const pinKeypair = Keypair.generate();

  // decode the access token
  const jwtAud = getJwtAud(accessToken);

  // encrypt the private key using the user provided PIN
  const encryptedPrivateKey = encrypt(bs58.encode(pinKeypair.secretKey), pin);
  const encryptedPin = encrypt(pin, jwtAud);

  // store the public key and encrypted private key
  const publicKey = pinKeypair.publicKey.toBase58();
  await saveEncryptedPin(
    {
      encryptedPrivateKey,
      encryptedPin,
      publicKey,
    },
    {accessToken, accountId},
  );
  return publicKey;
};

// decrypt a secret with user provided PIN
export const decrypt = (cipherText: string, secret: string) => {
  try {
    const bytes = crypto.AES.decrypt(cipherText, secret);
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
export const encrypt = (plainText: string, secret: string) => {
  return crypto.AES.encrypt(plainText, secret).toString();
};

export const getJwtAud = (token: string): string => {
  const jwtToken = jwtDecode(token);
  if (!jwtToken.aud || typeof jwtToken.aud !== 'string') {
    throw new SessionLockError('invalid access token');
  }
  return jwtToken.aud;
};
