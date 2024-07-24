import config from '@unstoppabledomains/config';

import {
  createSignatureOperation,
  signAndWait,
} from '../actions/fireBlocksActions';
import {notifyEvent} from '../lib/error';
import {getFireBlocksClient} from '../lib/fireBlocks/client';
import {getBootstrapState} from '../lib/fireBlocks/storage/state';
import {GetOperationStatusResponse} from '../lib/types/fireBlocks';
import useFireblocksAccessToken from './useFireblocksAccessToken';
import useFireblocksState from './useFireblocksState';

export type FireblocksMessageSigner = (
  message: string,
  address?: string,
) => Promise<string>;

const useFireblocksMessageSigner = (): FireblocksMessageSigner => {
  const [state, saveState] = useFireblocksState();
  const getAccessToken = useFireblocksAccessToken();

  // return the fireblocks client signer
  return async (message: string, address?: string): Promise<string> => {
    // retrieve and validate key state
    const clientState = getBootstrapState(state);
    if (!clientState) {
      throw new Error('invalid configuration');
    }

    // retrieve an access token if required
    const accessToken = await getAccessToken();

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

    // retrieve the asset associated with the optionally requested address,
    // otherwise just retrieve the first first asset.
    const asset =
      clientState.assets.find(
        a =>
          a.blockchainAsset.blockchain.id.toLowerCase() ===
            config.WALLETS.SIGNATURE_SYMBOL.split('/')[0].toLowerCase() &&
          a.blockchainAsset.symbol.toLowerCase() ===
            config.WALLETS.SIGNATURE_SYMBOL.split('/')[1].toLowerCase() &&
          a.address.toLowerCase() === address?.toLowerCase(),
      ) || clientState.assets[0];
    if (!asset?.accountId) {
      throw new Error('address not found in account');
    }

    // request an MPC signature of the desired message string
    const signatureOp = await signAndWait(
      accessToken,
      async () => {
        return await createSignatureOperation(
          accessToken,
          asset.accountId!,
          asset.id,
          message,
        );
      },
      async (txId: string) => {
        await client.signTransaction(txId);
      },
      {
        address,
        onStatusChange: (m: string) => {
          notifyEvent(m, 'info', 'Wallet', 'Signature');
        },
        isComplete: (status: GetOperationStatusResponse) => {
          return status?.result?.signature !== undefined;
        },
      },
    );

    // indicate complete with successful signature result
    notifyEvent('signature successful', 'info', 'Wallet', 'Signature', {
      meta: {
        address,
        message,
        signatureOp,
      },
    });

    // validate and return the signature result
    if (!signatureOp?.result?.signature) {
      throw new Error('signature failed');
    }
    return signatureOp.result.signature;
  };
};

export default useFireblocksMessageSigner;
