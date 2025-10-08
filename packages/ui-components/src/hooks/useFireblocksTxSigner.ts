import {
  createTransactionOperation,
  signAndWait,
} from '../actions/fireBlocksActions';
import {notifyEvent} from '../lib/error';
import type {GetOperationStatusResponse} from '../lib/types/fireBlocks';
import {getAsset} from '../lib/wallet/asset';
import {getBootstrapState} from '../lib/wallet/storage/state';
import useFireblocksAccessToken from './useFireblocksAccessToken';
import useFireblocksState from './useFireblocksState';

export type FireblocksTxSigner = (
  chainId: number,
  contractAddress: string,
  data: string,
  value?: string,
) => Promise<string>;

const useFireblocksTxSigner = (): FireblocksTxSigner => {
  const [state] = useFireblocksState();
  const getAccessToken = useFireblocksAccessToken();

  // define the fireblocks client signer
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

    notifyEvent(
      'signing transaction with fireblocks client',
      'info',
      'Wallet',
      'Signature',
      {
        meta: {
          contractAddress,
          data,
          value,
        },
      },
    );

    // find asset by provided chain ID
    const asset = getAsset(clientState.assets, {chainId});
    if (!asset?.accountId) {
      throw new Error(
        `asset not found to sign Tx. ${JSON.stringify({
          chainId,
          assets: clientState.assets,
        })}`,
      );
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

    // validate and return the signature result
    if (!txOp?.transaction?.id) {
      throw new Error('signature failed');
    }

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
    return txOp.transaction.id;
  };
};

export default useFireblocksTxSigner;
