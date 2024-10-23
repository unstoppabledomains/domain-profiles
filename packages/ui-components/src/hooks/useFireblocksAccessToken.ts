import {Mutex} from 'async-mutex';

import {getAccessToken, getAccountAssets} from '../actions/fireBlocksActions';
import {localStorageWrapper} from '../components';
import {getBootstrapState, notifyEvent} from '../lib';
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

      // retrieve from chrome storage if available
      const isChromeExtension = isChromeStorageSupported('local');
      let existingLocalAccessToken = isChromeExtension
        ? await localStorageWrapper.getItem('localAccessToken')
        : undefined;

      // default access token definition
      let accessToken = existingAccessToken || existingLocalAccessToken;

      // test the local token for validity
      if (existingLocalAccessToken) {
        const accounts = await getAccountAssets(existingLocalAccessToken);
        if (accounts) {
          accessToken = existingLocalAccessToken;
        } else {
          existingLocalAccessToken = undefined;
        }
      }

      // test the context token for validity
      if (existingAccessToken) {
        const accounts = await getAccountAssets(existingAccessToken);
        if (accounts) {
          accessToken = existingAccessToken;
        } else {
          setAccessToken('');
        }
      }

      // retrieve an access token if required
      if (!accessToken) {
        const jwtData = await getAccessToken(clientState.refreshToken, {
          deviceId: clientState.deviceId,
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
          await saveState({});
          throw new Error('error retrieving access token');
        }
        accessToken = jwtData.accessToken;
      }

      // return the access token
      if (isChromeExtension) {
        await localStorageWrapper.setItem('localAccessToken', accessToken);
      }
      return accessToken;
    });
  };
};

export default useFireblocksAccessToken;
