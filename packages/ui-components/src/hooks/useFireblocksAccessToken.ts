import {getAccessToken} from '../actions/fireBlocksActions';
import {getBootstrapState} from '../lib';
import useFireblocksState from './useFireblocksState';
import useWeb3Context from './useWeb3Context';

export type FireblocksTokenRetriever = () => Promise<string>;

const useFireblocksAccessToken = (): FireblocksTokenRetriever => {
  const [state, saveState] = useFireblocksState();
  const {accessToken: existingAccessToken, setAccessToken} = useWeb3Context();

  return async (): Promise<string> => {
    // retrieve and validate key state
    const clientState = getBootstrapState(state);
    if (!clientState) {
      throw new Error('invalid configuration');
    }

    // retrieve an access token if required
    let accessToken = existingAccessToken;
    if (!accessToken) {
      const jwtData = await getAccessToken(clientState.refreshToken, {
        deviceId: clientState.deviceId,
        state,
        saveState,
        setAccessToken,
      });
      if (!jwtData) {
        throw new Error('error retrieving access token');
      }
      accessToken = jwtData.accessToken;
    }

    // return the access token
    return accessToken;
  };
};

export default useFireblocksAccessToken;
