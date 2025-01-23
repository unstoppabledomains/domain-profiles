import bs58 from 'bs58';
import nacl from 'tweetnacl';

import {notifyEvent} from '../../error';
import {getKeypair, getLockStatus, getPublicKey, saveLockStatus} from './store';

export const isLockRequired = async () => {
  return false;
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

export const unlock = async (
  pin: string,
  durationMs: number,
): Promise<number> => {
  const keyPair = await getKeypair(pin);
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
