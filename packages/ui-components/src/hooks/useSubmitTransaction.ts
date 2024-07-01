import type {IFireblocksNCW} from '@fireblocks/ncw-js-sdk';
import {useEffect, useRef, useState} from 'react';

import {
  SendCryptoStatusMessage,
  cancelPendingOperations,
  getOperationStatus,
  getTransferOperationResponse,
} from '../actions/fireBlocksActions';
import {
  getBlockchainSymbol,
  getRecordKey,
} from '../components/Manage/common/verification/types';
import {isEmailValid} from '../lib';
import {notifyEvent} from '../lib/error';
import {FB_MAX_RETRY, FB_WAIT_TIME_MS} from '../lib/fireBlocks/client';
import {pollForSuccess} from '../lib/poll';
import type {AccountAsset, GetOperationResponse} from '../lib/types/fireBlocks';
import {OperationStatusType} from '../lib/types/fireBlocks';

export type Params = {
  accessToken: string;
  asset: AccountAsset;
  recipientAddress: string;
  amount: string;
  getClient: () => Promise<IFireblocksNCW>;
  onInvitation: (
    emailAddress: string,
  ) => Promise<Record<string, string> | undefined>;
};

export enum Status {
  Pending = 'pending',
  Success = 'success',
  Failed = 'failed',
}

export const useSubmitTransaction = ({
  accessToken,
  asset,
  recipientAddress: initialRecipientAddress,
  amount,
  getClient,
  onInvitation,
}: Params) => {
  const [transactionId, setTransactionId] = useState('');
  const [status, setStatus] = useState(Status.Pending);
  const [statusMessage, setStatusMessage] = useState<SendCryptoStatusMessage>(
    SendCryptoStatusMessage.CHECKING_QUEUE,
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
      if (!isMounted.current) {
        return;
      }
      // cancel any in progress transactions
      const client = await getClient();
      try {
        // cancel local transactions for this client instance
        while (await client.getInProgressSigningTxId()) {
          await client.stopInProgressSignTransaction();
        }

        // cancel queued operations for this specific account asset, which must be
        // completed in case previous transactions are awaiting signature and in an
        // abandoned state from another client.
        await cancelPendingOperations(accessToken, asset.accountId!, asset.id);
      } catch (e) {
        notifyEvent(e, 'warning', 'Wallet', 'Signature', {
          msg: 'error managing in progress transactions',
        });
      } finally {
        await client.dispose();
      }

      // check the recipient wallet to determine if it needs to be created
      let recipientAddress = initialRecipientAddress;
      if (isEmailValid(recipientAddress)) {
        setStatusMessage(SendCryptoStatusMessage.CREATING_WALLET);
        const records = await onInvitation(recipientAddress);
        const resolvedAddress =
          records && Object.keys(records).length > 0
            ? records[getRecordKey(asset.blockchainAsset.symbol)] ||
              records[getRecordKey(asset.blockchainAsset.symbol, 'ERC20')] ||
              records[
                getRecordKey(
                  getBlockchainSymbol(asset.blockchainAsset.blockchain.id),
                )
              ] ||
              records[
                getRecordKey(
                  getBlockchainSymbol(asset.blockchainAsset.blockchain.id),
                  'ERC20',
                )
              ]
            : undefined;
        if (!resolvedAddress) {
          throw new Error('Wallet not created');
        }
        recipientAddress = resolvedAddress;
      }

      // create new transfer request
      setStatusMessage(SendCryptoStatusMessage.STARTING_TRANSACTION);
      const operationResponse = await getTransferOperationResponse(
        asset,
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
