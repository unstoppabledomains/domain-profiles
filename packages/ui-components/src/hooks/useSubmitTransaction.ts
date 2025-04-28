import {useEffect, useRef, useState} from 'react';

import {
  SendCryptoStatusMessage,
  cancelPendingOperations,
  createSolanaTokenTransfer,
  createTransactionOperation,
  createTransferOperation,
  getOperationStatus,
} from '../actions/fireBlocksActions';
import {getRecordKeys} from '../components/Manage/common/verification/types';
import type {TokenEntry} from '../lib';
import {TokenType} from '../lib';
import {notifyEvent} from '../lib/error';
import {isEmailValid} from '../lib/isEmailValid';
import {pollForSuccess} from '../lib/poll';
import {
  FB_MAX_RETRY,
  FB_WAIT_TIME_MS,
  OperationStatusType,
  TransactionRuleEmailOtpRequiredError,
  TransactionRuleMfaRequiredError,
} from '../lib/types/fireBlocks';
import type {AccountAsset, GetOperationResponse} from '../lib/types/fireBlocks';
import {
  createErc20TransferTx,
  createErc721TransferTx,
} from '../lib/wallet/evm/token';
import {waitForTx} from '../lib/wallet/solana/transaction';
import useDomainConfig from './useDomainConfig';
import useFireblocksMessageSigner from './useFireblocksMessageSigner';
import useResolverKeys from './useResolverKeys';

export type Params = {
  accessToken: string;
  asset: AccountAsset;
  token: TokenEntry;
  recipientAddress: string;
  amount: string;
  otpToken?: string;
  onInvitation: (
    emailAddress: string,
  ) => Promise<Record<string, string> | undefined>;
};

export enum Status {
  Pending = 'pending',
  Success = 'success',
  Failed = 'failed',
  PromptForMfa = 'promptForMfa',
  PromptForEmailOtp = 'promptForEmailOtp',
}

export const useSubmitTransaction = ({
  accessToken,
  asset,
  token,
  recipientAddress: initialRecipientAddress,
  amount,
  otpToken,
  onInvitation,
}: Params) => {
  const {mappedResolverKeys} = useResolverKeys();
  const {setShowSuccessAnimation} = useDomainConfig();
  const fireblocksMessageSigner = useFireblocksMessageSigner(otpToken);
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
  }, [otpToken]);

  const submitTransaction = async () => {
    setShowSuccessAnimation(false);
    try {
      if (!isMounted.current) {
        return;
      }
      // cancel any in progress transactions
      try {
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
          // submit the transaction to be signed by the wallet
          setStatusMessage(SendCryptoStatusMessage.SIGNING);
          const txResult = await createSolanaTokenTransfer(
            accessToken,
            token.walletAddress,
            recipientAddress,
            parseFloat(amount),
            token.address,
            otpToken,
          );
          if (!txResult?.hash) {
            throw new Error('Error submitting transaction');
          }

          // wait for transaction confirmation
          setStatusMessage(SendCryptoStatusMessage.WAITING_FOR_TRANSACTION);
          setShowSuccessAnimation(true);
          setTransactionId(txResult.hash);
          await waitForTx(txResult.hash, token.walletAddress, accessToken);

          // operation is complete
          setStatusMessage(SendCryptoStatusMessage.TRANSACTION_COMPLETED);
          setStatus(Status.Success);
        } catch (e) {
          // handle the transaction MFA required error
          if (e instanceof TransactionRuleMfaRequiredError) {
            setStatus(Status.PromptForMfa);
            setStatusMessage(SendCryptoStatusMessage.PROMPT_FOR_MFA);
            return;
          }

          // handle the transaction email OTP required error
          if (e instanceof TransactionRuleEmailOtpRequiredError) {
            setStatus(Status.PromptForEmailOtp);
            setStatusMessage(SendCryptoStatusMessage.PROMPT_FOR_EMAIL_OTP);
            return;
          }

          // handle the unknown error
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
          // submit the transaction to be signed by the wallet
          setStatusMessage(SendCryptoStatusMessage.SIGNING);
          const txResult = await createSolanaTokenTransfer(
            accessToken,
            token.walletAddress,
            recipientAddress,
            parseFloat(amount),
            undefined,
            otpToken,
          );
          if (!txResult?.hash) {
            throw new Error('Error submitting transaction');
          }

          // wait for transaction confirmation
          setStatusMessage(SendCryptoStatusMessage.WAITING_FOR_TRANSACTION);
          setShowSuccessAnimation(true);
          setTransactionId(txResult.hash);
          await waitForTx(txResult.hash, token.walletAddress, accessToken);

          // operation is complete
          setStatusMessage(SendCryptoStatusMessage.TRANSACTION_COMPLETED);
          setStatus(Status.Success);
        } catch (e) {
          // handle the transaction MFA required error
          if (e instanceof TransactionRuleMfaRequiredError) {
            setStatus(Status.PromptForMfa);
            setStatusMessage(SendCryptoStatusMessage.PROMPT_FOR_MFA);
            return;
          }

          // handle the transaction email OTP required error
          if (e instanceof TransactionRuleEmailOtpRequiredError) {
            setStatus(Status.PromptForEmailOtp);
            setStatusMessage(SendCryptoStatusMessage.PROMPT_FOR_EMAIL_OTP);
            return;
          }

          // handle the unknown error
          notifyEvent(e, 'error', 'Wallet', 'Transaction', {
            msg: 'error sending SOL native transfer',
            meta: {recipientAddress, amount},
          });
          setStatus(Status.Failed);
        }
        return;
      }

      // create a transfer transaction if we are working with
      // an ERC-20 or ERC-721 token on an EVM chain
      const transferErcTx =
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
          : asset.blockchainAsset.blockchain.networkId &&
            token.address &&
            token.address.split('/').length === 2 &&
            token.type === TokenType.Erc721
          ? await createErc721TransferTx({
              accessToken,
              chainId: asset.blockchainAsset.blockchain.networkId,
              tokenAddress: token.address.split('/')[0],
              tokenId: token.address.split('/')[1],
              fromAddress: token.walletAddress,
              toAddress: recipientAddress,
            })
          : undefined;

      // create new transfer request, depending on token type
      setStatusMessage(SendCryptoStatusMessage.STARTING_TRANSACTION);
      const operationResponse =
        transferErcTx && asset.accountId
          ? await createTransactionOperation(
              accessToken,
              asset.accountId,
              asset.id,
              transferErcTx,
              otpToken,
            )
          : await createTransferOperation(
              asset,
              accessToken,
              recipientAddress,
              parseFloat(amount),
              otpToken,
            );
      if (!operationResponse) {
        throw new Error('Error starting transaction');
      }
      setStatusMessage(SendCryptoStatusMessage.SIGNING);
      await pollForSignature(operationResponse);
      setStatusMessage(SendCryptoStatusMessage.SUBMITTING_TRANSACTION);
      await pollForCompletion(operationResponse);
      setStatus(Status.Success);
    } catch (error) {
      // handle the transaction MFA required error
      if (error instanceof TransactionRuleMfaRequiredError) {
        // indicate that the user needs to provide a MFA code
        setStatus(Status.PromptForMfa);
        setStatusMessage(SendCryptoStatusMessage.PROMPT_FOR_MFA);
        return;
      }

      // handle the transaction email OTP required error
      if (error instanceof TransactionRuleEmailOtpRequiredError) {
        // indicate that the user needs to provide an email OTP
        setStatus(Status.PromptForEmailOtp);
        setStatusMessage(SendCryptoStatusMessage.PROMPT_FOR_EMAIL_OTP);
        return;
      }

      // handle the unknown error
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
        } else if (operationStatus.status === OperationStatusType.COMPLETED) {
          return {success: true};
        } else if (operationStatus.transaction?.id) {
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
