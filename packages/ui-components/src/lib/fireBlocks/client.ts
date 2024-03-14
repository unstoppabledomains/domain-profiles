import type {
  IFireblocksNCW,
  IFireblocksNCWOptions,
  ITransactionSignature,
} from '@fireblocks/ncw-js-sdk';
import {FireblocksNCWFactory} from '@fireblocks/ncw-js-sdk';

import {getAccessToken, sendJoinRequest} from '../../actions/fireBlocksActions';
import {notifyEvent} from '../error';
import {sleep} from '../sleep';
import {BootstrapStateKey} from '../types/fireBlocks';
import {LogEventHandler} from './events/logHandler';
import {RpcMessageProvider} from './messages/rpcHandler';
import {StorageFactoryProvider} from './storage/factory';
import {MemoryDeviceStoreProvider} from './storage/provider/memoryDeviceStore';
import {ReactDeviceStoreProvider} from './storage/provider/reactDeviceStore';
import {SecureKeyStorageProvider} from './storage/secureStorage';
import {UnsecureKeyStorageProvider} from './storage/unsecureStorage';

const MAX_RETRY = 50;
const WAIT_TIME_MS = 500;

export const getFireBlocksClient = async (
  deviceId: string,
  jwt: string,
  opts?: {
    isRefreshToken?: boolean;
    state: Record<string, Record<string, string>>;
    saveState: (state: Record<string, Record<string, string>>) => void;
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
  );
  const unsecureStorageProvider = new UnsecureKeyStorageProvider(
    deviceId,
    storageProvider,
  );

  // if the provided token is a refresh token, use it to retrieve an access
  // token and store the new state
  if (opts?.isRefreshToken) {
    // retrieve new tokens
    const newTokens = await getAccessToken(jwt);
    if (!newTokens?.accessToken) {
      throw new Error('error retrieving access token');
    }

    // store new token state
    jwt = newTokens.accessToken;
    opts.state[BootstrapStateKey] = {
      bootstrapToken: newTokens.bootstrapToken,
      refreshToken: newTokens.refreshToken,
      deviceId,
    };
    opts.saveState({...opts.state});
  }

  // initialize message handler
  const messagesHandler = new RpcMessageProvider(jwt);

  // initialize event handler
  const eventsHandler = new LogEventHandler();

  // Initialize the Fireblocks NCW SDK
  const fbOptions: IFireblocksNCWOptions = {
    deviceId,
    messagesHandler,
    eventsHandler,
    secureStorageProvider: secureKeyStorageProvider,
    storageProvider: unsecureStorageProvider,
  };

  return await FireblocksNCWFactory(fbOptions);
};

export const initializeClient = async (
  client: IFireblocksNCW,
  opts: {bootstrapJwt: string; recoveryPhrase: string},
): Promise<boolean> => {
  try {
    // create a join request for this device
    let isJoinRequestSuccessful = false;
    const joinResult = await client.requestJoinExistingWallet({
      onRequestId: async requestId => {
        isJoinRequestSuccessful = await sendJoinRequest(
          requestId,
          opts.bootstrapJwt,
          opts.recoveryPhrase,
        );
        if (!isJoinRequestSuccessful) {
          try {
            client.stopJoinWallet();
          } catch (e) {
            notifyEvent(e, 'warning', 'WALLET', 'Validation', {
              msg: 'unable to cancel join request',
              meta: {requestId},
            });
          }
        }
      },
    });
    if (!joinResult || !isJoinRequestSuccessful) {
      throw new Error('failed to initialize fireblocks client');
    }

    // wait for the join request to be approved by the backend
    for (let i = 1; i <= MAX_RETRY; i++) {
      const status = await client.getKeysStatus();
      if (status.MPC_CMP_ECDSA_SECP256K1.keyStatus === 'READY') {
        // key material is now available on the device
        return true;
      }
      await sleep(WAIT_TIME_MS);
    }
    throw new Error('fireblocks key status is not ready');
  } catch (e) {
    notifyEvent(e, 'error', 'WALLET', 'Validation');
  }

  // the request to join was not successful
  return false;
};

export const signTransaction = async (
  client: IFireblocksNCW,
  txId: string,
): Promise<ITransactionSignature | undefined> => {
  for (let i = 1; i <= MAX_RETRY; i++) {
    try {
      return await client.signTransaction(txId);
    } catch (e) {
      notifyEvent(e, 'warning', 'WALLET', 'Signature', {
        msg: 'retrying failed tx signature',
      });
    }
    await sleep(WAIT_TIME_MS);
  }
  notifyEvent(new Error('tx signature failed'), 'error', 'WALLET', 'Signature');
  return undefined;
};
