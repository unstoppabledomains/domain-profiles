import bs58 from 'bs58';
import nacl from 'tweetnacl';

import {localStorageWrapper} from '../../../components/Chat/storage';
import {isChromeStorageSupported} from '../../../hooks/useChromeStorage';
import {notifyEvent} from '../../error';
import {DomainProfileKeys} from '../../types';
import {getBootstrapState, saveBootstrapState} from '../storage/state';
import {encrypt} from './key';
import {
  getKeypairFromPin,
  getLockStatus,
  getPinFromToken,
  getPublicKey,
  removeEncryptedPin,
  removeLockStatus,
  saveLockStatus,
} from './store';
import {SessionLockError} from './types';

export const disablePin = async (opts?: {
  accessToken?: string;
  accountId?: string;
}) => {
  await Promise.all([removeEncryptedPin(opts), removeLockStatus()]);
};

export const isLocked = async () => {
  const [pinEnabled, unlocked] = await Promise.all([
    isPinEnabled(),
    isUnlocked(),
  ]);
  return pinEnabled && !unlocked;
};

export const isPinEnabled = async () => {
  const publicKey = await getPublicKey();
  return !!publicKey;
};

export const isUnlocked = async () => {
  // retrieve lock status
  const lockStatus = await getLockStatus();
  if (!lockStatus?.timestamp) {
    notifyEvent('lock status not found', 'warning', 'Wallet', 'Authorization', {
      meta: lockStatus,
    });
    return false;
  }

  // check lock status expiration
  if (lockStatus.timestamp < Date.now()) {
    notifyEvent('lock status expired', 'warning', 'Wallet', 'Authorization', {
      meta: lockStatus,
    });
    return false;
  }

  // get public key
  const publicKey = await getPublicKey();
  if (!publicKey) {
    notifyEvent('public key not found', 'warning', 'Wallet', 'Authorization');
    return false;
  }

  // verify lock status proof
  try {
    return nacl.sign.detached.verify(
      new TextEncoder().encode(lockStatus.timestamp.toString()),
      bs58.decode(lockStatus.proof),
      bs58.decode(publicKey.toBase58()),
    );
  } catch (e) {
    notifyEvent('invalid proof', 'warning', 'Wallet', 'Authorization', {
      meta: lockStatus,
    });
    return false;
  }
};

export const lock = async (
  state: Record<string, Record<string, string>>,
  saveState: (
    state: Record<string, Record<string, string>>,
  ) => void | Promise<void>,
) => {
  // ensure a refresh token is available
  const clientState = getBootstrapState(state);
  if (!clientState?.refreshToken) {
    if (clientState?.lockedRefreshToken) {
      throw new SessionLockError('refresh token is encrypted');
    }
    throw new Error('invalid client state');
  }

  // proceed with session lock
  notifyEvent('locking session', 'warning', 'Wallet', 'Authorization');

  // lock the wallet by encrypting the refresh token with user-defined PIN
  const pin = await getPinFromToken(clientState.refreshToken);
  clientState.lockedRefreshToken = encrypt(clientState.refreshToken, pin);
  clientState.refreshToken = '';

  // save the state with encrypted refresh token
  await saveBootstrapState(clientState, state, saveState);

  // remove the local access token if chrome extension
  const isChromeExtension = isChromeStorageSupported('local');
  if (isChromeExtension) {
    await localStorageWrapper.removeItem(DomainProfileKeys.AccessToken);
  }
};

export const unlock = async (
  pin: string,
  durationMs: number,
): Promise<number> => {
  const keyPair = await getKeypairFromPin(pin);
  const timestamp = Date.now() + durationMs;
  await saveLockStatus({
    proof: bs58.encode(
      nacl.sign.detached(
        new TextEncoder().encode(timestamp.toString()),
        keyPair.secretKey,
      ),
    ),
    timestamp,
  });
  return timestamp;
};
