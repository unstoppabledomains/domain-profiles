import {Mutex} from 'async-mutex';

import {
  getAccessTokenInternal,
  getAccounts,
} from '../actions/fireBlocksActions';
import {localStorageWrapper} from '../components/Chat/storage';
import {
  CustodyState,
  SessionLockError,
  disablePin,
  encrypt,
  isPinEnabled,
  isUnlocked,
} from '../lib';
import {notifyEvent} from '../lib/error';
import {getPinFromToken} from '../lib/wallet/pin/store';
import {
  getBootstrapState,
  saveBootstrapState,
} from '../lib/wallet/storage/state';
import {isChromeStorageSupported} from './useChromeStorage';
import useFireblocksState from './useFireblocksState';
import useWeb3Context from './useWeb3Context';

export type FireblocksTokenRetriever = () => Promise<string>;

// ensure a single access token is requested at a time
const accessTokenMutex = new Mutex();

const useFireblocksAccessToken = (): FireblocksTokenRetriever => {
  const [state, saveState] = useFireblocksState();
  const {accessToken: existingAccessToken, setAccessToken} = useWeb3Context();

  return async (): Promise<string> => {
    return await accessTokenMutex.runExclusive(async () => {
      // retrieve and validate key state
      const clientState = getBootstrapState(state);
      if (!clientState) {
        throw new Error('invalid configuration');
      }

      // cannot use access token in custody state
      if (clientState.custodyState?.state === CustodyState.CUSTODY) {
        throw new Error('access token not available in custody state');
      }

      // retrieve from chrome storage if available
      const isChromeExtension = isChromeStorageSupported('local');
      const existingLocalAccessToken = isChromeExtension
        ? await localStorageWrapper.getItem('localAccessToken')
        : undefined;

      // default access token definition
      let accessToken: string | undefined;

      // test the local token for validity
      if (existingLocalAccessToken) {
        const accounts = await getAccounts(existingLocalAccessToken);
        if (accounts) {
          accessToken = existingLocalAccessToken;
        }
      }

      // test the context token for validity
      if (!accessToken && existingAccessToken) {
        const accounts = await getAccounts(existingAccessToken);
        if (accounts) {
          accessToken = existingAccessToken;
        } else {
          setAccessToken('');
        }
      }

      // retrieve an access token if required
      if (!accessToken) {
        // ensure a refresh token is available
        if (!clientState.refreshToken) {
          if (clientState.lockedRefreshToken) {
            throw new SessionLockError('refresh token is encrypted');
          }
          throw new Error('invalid client state');
        }

        // check session lock status
        const [pinEnabled, unlocked] = await Promise.all([
          isPinEnabled(),
          isUnlocked(),
        ]);
        if (pinEnabled && !unlocked) {
          // lock the wallet by encrypting the refresh token with user-defined PIN
          const pin = await getPinFromToken(clientState.refreshToken);
          clientState.lockedRefreshToken = encrypt(
            clientState.refreshToken,
            pin,
          );
          clientState.refreshToken = '';

          // save the state with encrypted refresh token
          await saveBootstrapState(clientState, state, saveState);

          // throw error to indicate lock status
          throw new SessionLockError('session is locked');
        }

        // retrieve a new access token
        const jwtData = await getAccessTokenInternal(clientState.refreshToken, {
          state,
          saveState,
          setAccessToken,
        });
        if (!jwtData) {
          notifyEvent(
            'clearing invalid bootstrap state',
            'error',
            'Wallet',
            'Authorization',
          );
          await Promise.all([saveState({}), disablePin()]);
          throw new Error('error retrieving access token');
        }
        accessToken = jwtData.accessToken;
      }

      // return the access token
      if (isChromeExtension) {
        await localStorageWrapper.setItem('localAccessToken', accessToken);
      }
      setAccessToken(accessToken);
      return accessToken;
    });
  };
};

export default useFireblocksAccessToken;
