import type {IFireblocksNCW} from '@fireblocks/ncw-js-sdk';
import {useEffect, useRef, useState} from 'react';

import {
  SendCryptoStatusMessage,
  cancelPendingOperations,
  createTransactionOperation,
  getOperationStatus,
  getTransferOperationResponse,
} from '../actions/fireBlocksActions';
import {getRecordKeys} from '../components/Manage/common/verification/types';
import type {TokenEntry} from '../lib';
import {TokenType} from '../lib';
import {notifyEvent} from '../lib/error';
import {FB_MAX_RETRY, FB_WAIT_TIME_MS} from '../lib/fireBlocks/client';
import {isEmailValid} from '../lib/isEmailValid';
import {pollForSuccess} from '../lib/poll';
import type {AccountAsset, GetOperationResponse} from '../lib/types/fireBlocks';
import {OperationStatusType} from '../lib/types/fireBlocks';
import {createErc20TransferTx} from '../lib/wallet/evm/token';
import {
  broadcastTx,
  createNativeTransferTx,
  createSplTransferTx,
  signTransaction,
  waitForTx,
} from '../lib/wallet/solana/transaction';
import useDomainConfig from './useDomainConfig';
import useFireblocksMessageSigner from './useFireblocksMessageSigner';
import useResolverKeys from './useResolverKeys';

export type Params = {
  accessToken: string;
  asset: AccountAsset;
  token: TokenEntry;
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
  token,
  recipientAddress: initialRecipientAddress,
  amount,
  getClient,
  onInvitation,
}: Params) => {
  const {mappedResolverKeys} = useResolverKeys();
  const {setShowSuccessAnimation} = useDomainConfig();
  const fireblocksMessageSigner = useFireblocksMessageSigner();
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
    setShowSuccessAnimation(false);
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
      }

      // check the recipient wallet to determine if it needs to be created
      let recipientAddress = initialRecipientAddress;
      if (isEmailValid(recipientAddress) && mappedResolverKeys) {
        setStatusMessage(SendCryptoStatusMessage.CREATING_WALLET);
        const records = await onInvitation(recipientAddress);
        const resolvedAddress =
          records && Object.keys(records).length > 0
            ? getRecordKeys(
                asset.blockchainAsset.symbol,
                mappedResolverKeys,
                records,
              )
                .map(k => records[k])
                .find(k => k) ||
              getRecordKeys(
                asset.blockchainAsset.blockchain.id,
                mappedResolverKeys,
                records,
              )
                .map(k => records[k])
                .find(k => k)
            : undefined;
        if (!resolvedAddress) {
          throw new Error('Wallet not created');
        }
        recipientAddress = resolvedAddress;
      }

      // handle an Solana SPL token transfer
      if (token.address && token.type === TokenType.Spl) {
        try {
          // create the transaction that must be signed
          setStatusMessage(SendCryptoStatusMessage.STARTING_TRANSACTION);
          const tx = await createSplTransferTx(
            token.walletAddress,
            recipientAddress,
            token.address,
            parseFloat(amount),
            fireblocksMessageSigner,
            accessToken,
          );

          // sign and wait for the signature value
          setStatusMessage(SendCryptoStatusMessage.WAITING_TO_SIGN);
          const signedTx = await signTransaction(
            tx,
            token.walletAddress,
            fireblocksMessageSigner,
            accessToken,
            false,
          );

          // submit the transaction
          setStatusMessage(SendCryptoStatusMessage.SUBMITTING_TRANSACTION);
          const txHash = await broadcastTx(
            signedTx,
            token.walletAddress,
            accessToken,
          );

          // wait for transaction confirmation
          setStatusMessage(SendCryptoStatusMessage.WAITING_FOR_TRANSACTION);
          setShowSuccessAnimation(true);
          setTransactionId(txHash);
          await waitForTx(txHash, token.walletAddress, accessToken);

          // operation is complete
          setStatusMessage(SendCryptoStatusMessage.TRANSACTION_COMPLETED);
          setStatus(Status.Success);
        } catch (e) {
          notifyEvent(e, 'error', 'Wallet', 'Transaction', {
            msg: 'error sending SPL token',
            meta: {token, recipientAddress, amount},
          });
          setStatus(Status.Failed);
        }
        return;
      }

      // handle Solana native transfer
      if (asset.blockchainAsset.blockchain.id.toLowerCase() === 'solana') {
        try {
          // create the transaction that must be signed
          setStatusMessage(SendCryptoStatusMessage.STARTING_TRANSACTION);
          const fromAddress = asset.address;
          const tx = await createNativeTransferTx(
            fromAddress,
            recipientAddress,
            parseFloat(amount),
            accessToken,
          );

          // sign and wait for the signature value
          setStatusMessage(SendCryptoStatusMessage.WAITING_TO_SIGN);
          const signedTx = await signTransaction(
            tx,
            fromAddress,
            fireblocksMessageSigner,
            accessToken,
            false,
          );

          // submit the transaction
          setStatusMessage(SendCryptoStatusMessage.SUBMITTING_TRANSACTION);
          const txHash = await broadcastTx(signedTx, fromAddress, accessToken);

          // wait for transaction confirmation
          setStatusMessage(SendCryptoStatusMessage.WAITING_FOR_TRANSACTION);
          setShowSuccessAnimation(true);
          setTransactionId(txHash);
          await waitForTx(txHash, fromAddress, accessToken);

          // operation is complete
          setStatusMessage(SendCryptoStatusMessage.TRANSACTION_COMPLETED);
          setStatus(Status.Success);
        } catch (e) {
          notifyEvent(e, 'error', 'Wallet', 'Transaction', {
            msg: 'error sending SOL native transfer',
            meta: {recipientAddress, amount},
          });
          setStatus(Status.Failed);
        }
        return;
      }

      // create a transfer transaction if we are working with
      // an ERC-20 token on an EVM chain
      const transferErc20Tx =
        asset.blockchainAsset.blockchain.networkId &&
        token.address &&
        token.type === TokenType.Erc20
          ? await createErc20TransferTx({
              accessToken,
              chainId: asset.blockchainAsset.blockchain.networkId,
              tokenAddress: token.address,
              fromAddress: token.walletAddress,
              toAddress: recipientAddress,
              amount: parseFloat(amount),
            })
          : undefined;

      // create new transfer request, depending on token type
      setStatusMessage(SendCryptoStatusMessage.STARTING_TRANSACTION);
      const operationResponse =
        transferErc20Tx && asset.accountId
          ? await createTransactionOperation(
              accessToken,
              asset.accountId,
              asset.id,
              transferErc20Tx,
            )
          : await getTransferOperationResponse(
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
          setShowSuccessAnimation(true);
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
