import {useEffect, useState} from 'react';

import {
  getAccessToken,
  getAccounts,
  getMessageSignature,
} from '../actions/fireBlocksActions';
import {notifyEvent} from '../lib/error';
import {getFireBlocksClient} from '../lib/fireBlocks/client';
import {getBootstrapState} from '../lib/fireBlocks/storage/state';
import useFireblocksState from './useFireblocksState';

export type FireblocksSigner = (
  message: string,
  address?: string,
) => Promise<string>;

const useFireblocksSigner = (): [FireblocksSigner | undefined, boolean] => {
  const [accessToken, setAccessToken] = useState<string>();
  const [state, saveState] = useFireblocksState();

  // load Fireblocks state on component load
  useEffect(() => {
    void handleLoadAccessToken();
  }, []);

  const handleLoadAccessToken = async (): Promise<string | undefined> => {
    // retrieve and validate key state
    const clientState = getBootstrapState(state);
    if (!clientState) {
      return;
    }

    // retrieve an access token
    const jwtToken = await getAccessToken(clientState.refreshToken, {
      deviceId: clientState.deviceId,
      state,
      saveState,
    });
    if (!jwtToken) {
      throw new Error('error retrieving access token');
    }
    setAccessToken(jwtToken.accessToken);
    return jwtToken.accessToken;
  };

  // only return a signer if access token is available
  if (!accessToken) {
    return [undefined, false];
  }

  // return the fireblocks client signer
  const signer = async (message: string, address?: string): Promise<string> => {
    // retrieve and validate key state
    const clientState = getBootstrapState(state);
    if (!clientState) {
      throw new Error('invalid configuration');
    }

    // validate the access token and attempt to refresh the token if it
    // has become stale
    let signingToken = accessToken;
    let accounts = await getAccounts(signingToken);
    if (!accounts) {
      signingToken = (await handleLoadAccessToken()) || '';
      accounts = await getAccounts(signingToken);
      if (!accounts) {
        throw new Error('invalid wallet token');
      }
    }

    // retrieve a new client instance
    const client = await getFireBlocksClient(
      clientState.deviceId,
      signingToken,
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
      signingToken,
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

  // return the signer in ready state
  return [signer, true];
};

export default useFireblocksSigner;
