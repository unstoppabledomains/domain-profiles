import {signMessage} from '../actions/fireBlocksActions';
import useFireblocksAccessToken from './useFireblocksAccessToken';
import useFireblocksState from './useFireblocksState';

export type FireblocksMessageSigner = (
  message: string,
  address?: string,
  chainId?: number,
) => Promise<string>;

const useFireblocksMessageSigner = (
  otpToken?: string,
): FireblocksMessageSigner => {
  const [state, saveState] = useFireblocksState();
  const getAccessToken = useFireblocksAccessToken();
  return async (
    message: string,
    address?: string,
    chainId?: number,
  ): Promise<string> => {
    // define the Fireblocks client signer
    return await signMessage(
      message,
      {
        accessToken: await getAccessToken(),
        otpToken,
        state,
        saveState,
      },
      {
        address,
        chainId,
      },
    );
  };
};

export default useFireblocksMessageSigner;
