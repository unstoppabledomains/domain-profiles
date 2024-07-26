import {
  createTransactionOperation,
  signAndWait,
} from '../actions/fireBlocksActions';
import {notifyEvent} from '../lib/error';
import {getFireBlocksClient} from '../lib/fireBlocks/client';
import {getBootstrapState} from '../lib/fireBlocks/storage/state';
import {GetOperationStatusResponse} from '../lib/types/fireBlocks';
import useFireblocksAccessToken from './useFireblocksAccessToken';
import useFireblocksState from './useFireblocksState';

export type FireblocksTxSigner = (
  chainId: number,
  contractAddress: string,
  data: string,
  value?: string,
) => Promise<string>;

const useFireblocksTxSigner = (): FireblocksTxSigner => {
  const [state, saveState] = useFireblocksState();
  const getAccessToken = useFireblocksAccessToken();

  // return the fireblocks client signer
  return async (
    chainId: number,
    contractAddress: string,
    data: string,
    value?: string,
  ): Promise<string> => {
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
      'signing transaction with fireblocks client',
      'info',
      'Wallet',
      'Signature',
      {
        meta: {
          deviceId: client.getPhysicalDeviceId(),
          contractAddress,
          data,
          value,
        },
      },
    );

    // find asset by provided chain ID
    const asset = clientState.assets.find(
      a => a.blockchainAsset.blockchain.networkId === chainId,
    );
    if (!asset?.accountId) {
      throw new Error('asset not found to sign Tx');
    }

    const txOp = await signAndWait(
      accessToken,
      async () => {
        // create a fireblocks transaction for the user account
        return await createTransactionOperation(
          accessToken,
          asset.accountId!,
          asset.id,
          {
            chainId,
            to: contractAddress,
            data,
            value,
          },
        );
      },
      async (txId: string) => {
        await client.signTransaction(txId);
      },
      {
        address: asset.address,
        onStatusChange: (m: string) => {
          notifyEvent(m, 'info', 'Wallet', 'Signature');
        },
        isComplete: (status: GetOperationStatusResponse) => {
          return status?.transaction?.id !== undefined;
        },
      },
    );

    // indicate complete with successful signature result
    notifyEvent('signature successful', 'info', 'Wallet', 'Signature', {
      meta: {
        chainId,
        contractAddress,
        data,
        value,
        txOp,
      },
    });

    // validate and return the signature result
    if (!txOp?.transaction?.id) {
      throw new Error('signature failed');
    }
    return txOp.transaction.id;
  };
};

export default useFireblocksTxSigner;
