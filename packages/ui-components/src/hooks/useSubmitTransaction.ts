import type {IFireblocksNCW} from '@fireblocks/ncw-js-sdk';
import {useEffect, useRef, useState} from 'react';

import {
  SendCryptoStatusMessage,
  getAccountAssets,
  getOperationStatus,
  getTransferOperationResponse,
} from '../actions/fireBlocksActions';
import type {TokenEntry} from '../components/Wallet/Token';
import {notifyEvent} from '../lib/error';
import {FB_MAX_RETRY, FB_WAIT_TIME_MS} from '../lib/fireBlocks/client';
import {pollForSuccess} from '../lib/poll';
import type {GetOperationResponse} from '../lib/types/fireBlocks';
import {OperationStatusType} from '../lib/types/fireBlocks';

type Params = {
  accessToken: string;
  asset: TokenEntry;
  recipientAddress: string;
  amount: string;
  getClient: () => Promise<IFireblocksNCW>;
};

export enum Status {
  Pending = 'pending',
  Success = 'success',
  Failed = 'failed',
}

export const useSubmitTransaction = ({
  accessToken,
  asset,
  recipientAddress,
  amount,
  getClient,
}: Params) => {
  const [transactionId, setTransactionId] = useState('');
  const [status, setStatus] = useState(Status.Pending);
  const [statusMessage, setStatusMessage] = useState<SendCryptoStatusMessage>(
    SendCryptoStatusMessage.RETRIEVING_ACCOUNT,
  );
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    void submitTransaction();
    return () => {
      isMounted.current = false;
    };
  }, []);

  const submitTransaction = async () => {
    try {
      // retrieve account status
      setStatusMessage(SendCryptoStatusMessage.RETRIEVING_ACCOUNT);
      const assets = await getAccountAssets(accessToken);
      if (!assets) {
        throw new Error('Assets not found');
      }
      const assetToSend = assets.find(
        a =>
          a.blockchainAsset.blockchain.name.toLowerCase() ===
            asset.name.toLowerCase() &&
          a.address.toLowerCase() === asset.walletAddress.toLowerCase(),
      );
      if (!assetToSend) {
        throw new Error('Asset not found in account');
      }
      if (!isMounted.current) {
        return;
      }

      // cancel any in progress transactions
      setStatusMessage(SendCryptoStatusMessage.CHECKING_QUEUE);
      const client = await getClient();
      try {
        while (await client.getInProgressSigningTxId()) {
          await client.stopInProgressSignTransaction();
        }
      } catch (e) {
        notifyEvent(e, 'warning', 'Wallet', 'Signature', {
          msg: 'error managing in progress transactions',
        });
      } finally {
        await client.dispose();
      }

      // create new transfer request
      setStatusMessage(SendCryptoStatusMessage.STARTING_TRANSACTION);
      const operationResponse = await getTransferOperationResponse(
        assetToSend,
        accessToken,
        recipientAddress,
        parseFloat(amount),
      );
      if (!operationResponse) {
        throw new Error('Error starting transaction');
      }
      setStatusMessage(SendCryptoStatusMessage.WAITING_TO_SIGN);
      await pollForSignature(operationResponse);
      setStatusMessage(SendCryptoStatusMessage.SUBMITTING_TRANSACTION);
      await pollForCompletion(operationResponse);
      setStatus(Status.Success);
    } catch (error) {
      notifyEvent(error, 'error', 'Wallet', 'Signature', {
        msg: 'Error sending crypto',
      });
      setStatus(Status.Failed);
    }
  };

  const pollForSignature = async (operationResponse: GetOperationResponse) => {
    const result = await pollForSuccess({
      fn: async () => {
        if (!isMounted.current) {
          throw new Error('Transaction cancelled by user');
        }
        const operationStatus = await getOperationStatus(
          accessToken,
          operationResponse.operation.id,
        );
        if (
          !operationStatus ||
          operationStatus.status === OperationStatusType.FAILED
        ) {
          throw new Error('Error requesting transaction operation status');
        }
        if (
          operationStatus.status === OperationStatusType.SIGNATURE_REQUIRED &&
          operationStatus.transaction?.externalVendorTransactionId
        ) {
          setStatusMessage(SendCryptoStatusMessage.SIGNING);
          const client = await getClient();
          await client.signTransaction(
            operationStatus.transaction.externalVendorTransactionId,
          );
          await client.dispose();
          return {success: true};
        }
        return {success: false};
      },
      attempts: FB_MAX_RETRY,
      interval: FB_WAIT_TIME_MS,
    });
    if (!result.success) {
      throw new Error('Signature process failed');
    }
  };

  const pollForCompletion = async (operationResponse: GetOperationResponse) => {
    const result = await pollForSuccess({
      fn: async () => {
        const operationStatus = await getOperationStatus(
          accessToken,
          operationResponse.operation.id,
        );
        if (!operationStatus) {
          throw new Error('Error requesting transaction operation status');
        }
        if (
          operationStatus.status === OperationStatusType.FAILED ||
          operationStatus.status === OperationStatusType.CANCELLED
        ) {
          throw new Error(
            `Transferred failed ${operationStatus.status.toLowerCase()}`,
          );
        }
        if (operationStatus.transaction?.id) {
          setTransactionId(operationStatus.transaction.id);
          setStatusMessage(SendCryptoStatusMessage.WAITING_FOR_TRANSACTION);
        }
        if (operationStatus.status === OperationStatusType.COMPLETED) {
          setStatusMessage(SendCryptoStatusMessage.TRANSACTION_COMPLETED);
          return {success: true};
        }
        return {success: false};
      },
      attempts: FB_MAX_RETRY,
      interval: FB_WAIT_TIME_MS,
    });
    if (!result.success) {
      throw new Error('Transaction process failed');
    }
  };

  return {
    transactionId,
    status,
    statusMessage,
  };
};
