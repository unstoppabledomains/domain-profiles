import {retryAsync} from 'ts-retry';

import {signMessage} from '../actions/fireBlocksActions';
import {notifyEvent} from '../lib/error';
import {TX_MAX_RETRY} from '../lib/types/fireBlocks';
import useFireblocksAccessToken from './useFireblocksAccessToken';
import useFireblocksState from './useFireblocksState';

export type FireblocksMessageSigner = (
  message: string,
  address?: string,
  chainId?: number,
) => Promise<string>;

const useFireblocksMessageSigner = (): FireblocksMessageSigner => {
  const [state, saveState] = useFireblocksState();
  const getAccessToken = useFireblocksAccessToken();

  // wrap the signing function in retry logic to ensure it has a chance to
  // succeed if there are intermittent failures
  return async (
    message: string,
    address?: string,
    chainId?: number,
  ): Promise<string> => {
    // wrap the signing function in retry logic
    return retryAsync(
      async () =>
        await signMessage(
          message,
          {
            accessToken: await getAccessToken(),
            state,
            saveState,
          },
          {
            address,
            chainId,
          },
        ),
      {
        delay: 100,
        maxTry: TX_MAX_RETRY,
        onError: (err: Error, currentTry: number) => {
          notifyEvent(err, 'warning', 'Wallet', 'Signature', {
            msg: 'encountered signature error in retry logic',
            meta: {currentTry},
          });
        },
      },
    );
  };
};

export default useFireblocksMessageSigner;
