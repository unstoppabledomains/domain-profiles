import type {
  IFireblocksNCW,
  IFireblocksNCWOptions,
  ITransactionSignature,
  TEvent,
} from '@fireblocks/ncw-js-sdk';
import {FireblocksNCWFactory} from '@fireblocks/ncw-js-sdk';

import config from '@unstoppabledomains/config';

import {
  sendJoinRequest,
  sendResetRequest,
} from '../../actions/fireBlocksActions';
import {notifyEvent} from '../error';
import {sleep} from '../sleep';
import {LogEventHandler} from './events/logHandler';
import {RpcMessageProvider} from './messages/rpcHandler';
import {StorageFactoryProvider} from './storage/factory';
import {MemoryDeviceStoreProvider} from './storage/provider/memoryDeviceStore';
import {ReactDeviceStoreProvider} from './storage/provider/reactDeviceStore';
import {SecureKeyStorageProvider} from './storage/secureStorage';
import {UnsecureKeyStorageProvider} from './storage/unsecureStorage';

export const FB_MAX_RETRY = 100;
export const FB_WAIT_TIME_MS = 1000;

export const getFireBlocksClient = async (
  deviceId: string,
  jwt: string,
  opts?: {
    pin?: string;
    state: Record<string, Record<string, string>>;
    saveState: (state: Record<string, Record<string, string>>) => void;
    onEventCallback?: (event: TEvent) => void;
  },
): Promise<IFireblocksNCW> => {
  // initialize storage
  const storageFactory = new StorageFactoryProvider(
    new MemoryDeviceStoreProvider(),
    opts ? new ReactDeviceStoreProvider(opts.state, opts.saveState) : undefined,
  );
  const storageProvider = storageFactory.buildDeviceStorage();
  const secureKeyStorageProvider = new SecureKeyStorageProvider(
    deviceId,
    storageProvider,
    opts?.pin,
  );
  const unsecureStorageProvider = new UnsecureKeyStorageProvider(
    deviceId,
    storageProvider,
  );

  // initialize message handler
  const messagesHandler = new RpcMessageProvider(jwt);

  // initialize event handler
  const eventsHandler = new LogEventHandler(opts?.onEventCallback);

  // Initialize the Fireblocks NCW SDK
  const fbOptions: IFireblocksNCWOptions = {
    deviceId,
    messagesHandler,
    eventsHandler,
    secureStorageProvider: secureKeyStorageProvider,
    storageProvider: unsecureStorageProvider,
    env: 'production',
  };

  return await FireblocksNCWFactory(fbOptions);
};

export const initializeClient = async (
  client: IFireblocksNCW,
  opts: {
    bootstrapJwt: string;
    recoveryPhrase: string;
    recoveryToken?: string;
  },
): Promise<boolean> => {
  try {
    // create a join request for this device
    let callbackPromise: Promise<boolean> | undefined;
    await client.requestJoinExistingWallet({
      onRequestId: async requestId => {
        callbackPromise = opts.recoveryToken
          ? // send a reset request
            sendResetRequest(
              requestId,
              opts.bootstrapJwt,
              opts.recoveryToken,
              opts.recoveryPhrase,
            )
          : // send a join request
            sendJoinRequest(requestId, opts.bootstrapJwt, opts.recoveryPhrase);

        // the request has been submitted, but we will wait for the promise to
        // complete after the client call returns
        const isSuccess = await callbackPromise;
        if (!isSuccess) {
          try {
            // request to stop the join transaction
            client.stopJoinWallet();
          } catch (stopJoinWalletErr) {
            notifyEvent(stopJoinWalletErr, 'warning', 'Wallet', 'Fireblocks', {
              msg: 'unable to cancel join request',
            });
          }
        }
      },
    });

    // ensure the promise was initialized
    if (!callbackPromise) {
      throw new Error('failed to initiate join request');
    }

    // wait for the callback promise to complete
    const isCallbackSuccessful = await callbackPromise;

    // determine if join request was successful
    if (!isCallbackSuccessful) {
      throw new Error('failed to initialize fireblocks client');
    }

    // wait for the join request to be approved by the backend
    for (let i = 1; i <= FB_MAX_RETRY; i++) {
      try {
        const status = await client.getKeysStatus();
        if (status.MPC_CMP_ECDSA_SECP256K1.keyStatus === 'READY') {
          // key material is now available on the device
          return true;
        }
      } catch (statusErr) {
        notifyEvent(statusErr, 'error', 'Wallet', 'Configuration', {
          msg: 'error checking key status',
        });
      }
      await sleep(FB_WAIT_TIME_MS);
    }
    throw new Error('fireblocks key status is not ready');
  } catch (initError) {
    notifyEvent(initError, 'error', 'Wallet', 'Configuration', {
      msg: 'unable to initialize client',
    });
  }

  // the request to join was not successful
  return false;
};

export const isClockDrift = (oracleMs: number): boolean => {
  const clockDriftMs = Math.abs(new Date().getTime() - oracleMs);
  if (clockDriftMs > config.WALLETS.MAX_CLOCK_DRIFT_MS) {
    notifyEvent('detected clock drift', 'error', 'Wallet', 'Validation', {
      meta: {oracleMs, clockDriftMs},
    });
    return true;
  }
  return false;
};

export const signTransaction = async (
  client: IFireblocksNCW,
  txId: string,
): Promise<ITransactionSignature | undefined> => {
  for (let i = 1; i <= FB_MAX_RETRY; i++) {
    try {
      return await client.signTransaction(txId);
    } catch (e) {
      notifyEvent(e, 'warning', 'Wallet', 'Signature', {
        msg: 'retrying failed tx signature',
      });
    }
    await sleep(FB_WAIT_TIME_MS);
  }
  notifyEvent(new Error('tx signature failed'), 'error', 'Wallet', 'Signature');
  return undefined;
};
