import {retryAsync} from 'ts-retry';
import type {Eip712TypedData} from 'web3';
import {utils as web3utils} from 'web3';

import config from '@unstoppabledomains/config';

import {
  createSignatureOperation,
  signAndWait,
} from '../actions/fireBlocksActions';
import {notifyEvent} from '../lib/error';
import {getFireBlocksClient} from '../lib/fireBlocks/client';
import {getBootstrapState} from '../lib/fireBlocks/storage/state';
import type {GetOperationStatusResponse} from '../lib/types/fireBlocks';
import {EIP_712_KEY, MAX_RETRIES} from '../lib/types/fireBlocks';
import {getAsset} from '../lib/wallet/asset';
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

  // define the fireblocks client signer
  const signingFn = async (
    message: string,
    address?: string,
    chainId?: number,
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

    // determine if a specific chain ID should override based upon a typed
    // EIP-712 message
    const isTypedMessage = message.includes(EIP_712_KEY);
    if (isTypedMessage) {
      try {
        const typedMessage: Eip712TypedData = JSON.parse(message);
        if (typedMessage?.domain?.chainId) {
          chainId =
            typeof typedMessage.domain.chainId === 'string'
              ? typedMessage.domain.chainId.startsWith('0x')
                ? (web3utils.hexToNumber(typedMessage.domain.chainId) as number)
                : parseInt(typedMessage.domain.chainId, 10)
              : typedMessage.domain.chainId;
        }
      } catch (e) {
        notifyEvent(e, 'warning', 'Wallet', 'Signature', {
          msg: 'unable to parse typed message',
        });
      }
    }

    // retrieve the asset associated with the optionally requested address,
    // otherwise just retrieve the first first asset.
    notifyEvent(
      'retrieving wallet asset for signature',
      'info',
      'Wallet',
      'Signature',
      {
        meta: {chainId, default: config.WALLETS.SIGNATURE_SYMBOL},
      },
    );
    const asset = getAsset(clientState.assets, {address, chainId});
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
          isTypedMessage,
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

    // validate and return the signature result
    if (!signatureOp?.result?.signature) {
      throw new Error('signature failed');
    }

    // indicate complete with successful signature result
    notifyEvent('signature successful', 'info', 'Wallet', 'Signature', {
      meta: {
        address,
        message,
        signatureOp,
      },
    });
    return signatureOp.result.signature;
  };

  // wrap the signing function in retry logic to ensure it has a chance to
  // succeed if there are intermittent failures
  return async (
    message: string,
    address?: string,
    chainId?: number,
  ): Promise<string> => {
    // wrap the signing function in retry logic
    return retryAsync(async () => await signingFn(message, address, chainId), {
      delay: 100,
      maxTry: MAX_RETRIES,
      onError: (err: Error, currentTry: number) => {
        notifyEvent(err, 'warning', 'Wallet', 'Signature', {
          msg: 'encountered signature error in retry logic',
          meta: {currentTry},
        });
      },
    });
  };
};

export default useFireblocksMessageSigner;
