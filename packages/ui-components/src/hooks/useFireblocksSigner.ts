import {
  getAccessToken,
  getMessageSignature,
} from '../actions/fireBlocksActions';
import {notifyEvent} from '../lib/error';
import {getFireBlocksClient} from '../lib/fireBlocks/client';
import {getBootstrapState} from '../lib/fireBlocks/storage/state';
import useFireblocksState from './useFireblocksState';
import useWeb3Context from './useWeb3Context';

export type FireblocksSigner = (
  message: string,
  address?: string,
) => Promise<string>;

const useFireblocksSigner = (): FireblocksSigner => {
  const [state, saveState] = useFireblocksState();
  const {accessToken: existingAccessToken, setAccessToken} = useWeb3Context();

  // return the fireblocks client signer
  return async (message: string, address?: string): Promise<string> => {
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

    // retrieve a new client instance
    const client = await getFireBlocksClient(
      clientState.deviceId,
      accessToken,
      {
        state,
        saveState,
      },
    );

    notifyEvent(
      'signing message with fireblocks client',
      'info',
      'Wallet',
      'Signature',
      {
        meta: {
          deviceId: client.getPhysicalDeviceId(),
          message,
        },
      },
    );

    // request an MPC signature of the desired message string
    const signatureResult = await getMessageSignature(
      accessToken,
      message,
      async (txId: string) => {
        await client.signTransaction(txId);
      },
      {
        address,
        onStatusChange: (m: string) => {
          notifyEvent(m, 'info', 'Wallet', 'Signature');
        },
      },
    );

    // indicate complete with successful signature result
    notifyEvent('signature successful', 'info', 'Wallet', 'Signature', {
      meta: {
        address,
        message,
        signature: signatureResult,
      },
    });

    // validate and return the signature result
    if (!signatureResult) {
      throw new Error('signature failed');
    }
    return signatureResult;
  };
};

export default useFireblocksSigner;
