import type {
  IFireblocksNCW,
  IFireblocksNCWOptions,
  ITransactionSignature,
  TEvent,
} from '@fireblocks/ncw-js-sdk';
import {
  FireblocksNCWFactory,
  getFireblocksNCWInstance,
} from '@fireblocks/ncw-js-sdk';

import config from '@unstoppabledomains/config';

import {notifyEvent} from '../error';
import {sleep} from '../sleep';
import {LogEventHandler} from './events/logHandler';
import {
  RpcMessageProvider,
  setRpcMessageProviderJwt,
} from './messages/rpcHandler';
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
    saveState: (
      state: Record<string, Record<string, string>>,
    ) => void | Promise<void>;
    onEventCallback?: (event: TEvent) => void;
  },
): Promise<IFireblocksNCW> => {
  // check if an instance exists for this device ID
  const existingInstance = getFireblocksNCWInstance(deviceId);
  if (existingInstance) {
    setRpcMessageProviderJwt(jwt);
    return existingInstance;
  }

  // initialize storage
  const storageFactory = new StorageFactoryProvider(
    new MemoryDeviceStoreProvider(),
    opts?.state && opts?.saveState
      ? new ReactDeviceStoreProvider(opts.state, opts.saveState)
      : undefined,
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
    logger: config.APP_ENV !== 'production' ? console : undefined,
    env: 'production',
  };

  return await FireblocksNCWFactory(fbOptions);
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
