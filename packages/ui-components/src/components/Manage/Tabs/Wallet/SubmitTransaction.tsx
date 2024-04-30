import type {IFireblocksNCW} from '@fireblocks/ncw-js-sdk';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useRef, useState} from 'react';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {
  SendCryptoStatus,
  getAccountAssets,
  getOperationStatus,
  getTransferOperationResponse,
} from '../../../../actions/fireBlocksActions';
import {useTranslationContext} from '../../../../lib';
import {notifyEvent} from '../../../../lib/error';
import {FB_MAX_RETRY, FB_WAIT_TIME_MS} from '../../../../lib/fireBlocks/client';
import {pollForSuccess} from '../../../../lib/poll';
import {OperationStatusType} from '../../../../lib/types/fireBlocks';
import Link from '../../../Link';
import type {TokenEntry} from '../../../Wallet/Token';
import {OperationStatus} from './OperationStatus';

const useStyles = makeStyles()((theme: Theme) => ({
  fullWidth: {
    width: '100%',
  },
  sendLoadingContainer: {
    marginTop: theme.spacing(10),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  transactionStatusContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '7px',
    marginBottom: theme.spacing(5),
  },
  icon: {
    fontSize: '60px',
  },
  subTitlePending: {
    marginTop: theme.spacing(1),
    color: theme.palette.neutralShades[400],
  },
  subTitleComplete: {
    marginTop: theme.spacing(1),
  },
}));

type Props = {
  onCloseClick: () => void;
  accessToken: string;
  asset: TokenEntry;
  recipientAddress: string;
  recipientDomain?: string;
  amount: string;
  client: IFireblocksNCW;
};

enum Status {
  Pending = 'pending',
  Success = 'success',
  Failed = 'failed',
}

const truncateAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const SubmitTransaction: React.FC<Props> = ({
  onCloseClick,
  accessToken,
  asset,
  recipientAddress,
  recipientDomain,
  amount,
  client,
}) => {
  const [t] = useTranslationContext();
  const [transactionId, setTransactionId] = useState<string>('');
  const [status, setStatus] = useState<Status>(Status.Pending);
  const [statusMessage, setStatusMessage] = useState<string>();
  const {classes} = useStyles();
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
      try {
        // retrieve the accounts associated with the access token
        setStatusMessage(SendCryptoStatus.RETRIEVING_ACCOUNT);
        const assets = await getAccountAssets(accessToken);
        if (!assets) {
          throw new Error('account assets not found');
        }
        // retrieve the asset associated with the optionally requested address,
        // otherwise just retrieve the first first asset.
        const assetToSend = assets.find(
          a =>
            a.blockchainAsset.symbol.toLowerCase() ===
              asset.symbol.toLowerCase() &&
            a.address.toLowerCase() === asset.walletAddress.toLowerCase(),
        );
        if (!assetToSend) {
          throw new Error('address not found in account');
        }
        if (!isMounted.current) {
          return;
        }
        // initialize a transaction to retrieve auth tokens
        setStatusMessage(SendCryptoStatus.STARTING_TRANSACTION);
        const operationResponse = await getTransferOperationResponse(
          assetToSend,
          accessToken,
          recipientAddress,
          parseFloat(amount),
        );
        if (!operationResponse) {
          throw new Error('error starting transaction');
        }
        setStatusMessage(SendCryptoStatus.GETTING_TRANSACTION_TO_SIGN);
        await pollForSuccess({
          fn: async () => {
            if (!isMounted.current) {
              throw new Error('transaction cancelled by user');
            }
            const operationStatus = await getOperationStatus(
              accessToken,
              operationResponse.operation.id,
            );
            if (!operationStatus) {
              throw new Error('error requesting transaction operation status');
            }
            if (
              operationStatus.status ===
                OperationStatusType.SIGNATURE_REQUIRED &&
              operationStatus.transaction?.externalVendorTransactionId
            ) {
              // request for the client to sign the Tx string
              setStatusMessage(SendCryptoStatus.SIGNING);
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

        setStatusMessage(SendCryptoStatus.SUBMITTING_TRANSACTION);

        const {success} = await pollForSuccess({
          fn: async () => {
            const operationStatus = await getOperationStatus(
              accessToken,
              operationResponse.operation.id,
            );
            if (!operationStatus) {
              throw new Error('error requesting transaction operation status');
            }
            if (operationStatus.transaction?.id) {
              setTransactionId(operationStatus.transaction.id);
              setStatusMessage(SendCryptoStatus.WAITING_FOR_TRANSACTION);
            }
            if (operationStatus.status === OperationStatusType.COMPLETED) {
              setStatusMessage(SendCryptoStatus.TRANSACTION_COMPLETED);
              return {success: true};
            }
            if (
              operationStatus.status === OperationStatusType.FAILED ||
              operationStatus.status === OperationStatusType.CANCELLED
            ) {
              throw new Error(
                `Transferred failed ${operationStatus.status.toLowerCase()}`,
              );
            }
            return {success: false};
          },
          attempts: FB_MAX_RETRY,
          interval: FB_WAIT_TIME_MS,
        });
        if (!success) {
          throw new Error('failed to complete transaction');
        }
      } catch (e) {
        setStatusMessage(SendCryptoStatus.TRANSACTION_FAILED);
        notifyEvent(e, 'error', 'Wallet', 'Signature', {
          msg: 'error sending crypto',
          meta: crypto,
        });
        throw e;
      }
      setStatus(Status.Success);
    } catch (e) {
      setStatus(Status.Failed);
    }
  };

  return (
    <Box className={classes.sendLoadingContainer}>
      <OperationStatus
        label={statusMessage}
        icon={<SendOutlinedIcon />}
        success={status === Status.Success}
        error={status === Status.Failed}
      >
        <Box className={classes.transactionStatusContainer} mt={2}>
          <Typography variant="caption">
            {status === Status.Success || status === Status.Failed
              ? t(
                  status === Status.Success
                    ? 'wallet.sendTransactionSuccess'
                    : 'wallet.sendTransactionFailed',
                  {
                    amount,
                    sourceSymbol: asset.symbol,
                    status,
                    recipientDomain: recipientDomain
                      ? ` ${recipientDomain}`
                      : '',
                    recipientAddress: truncateAddress(recipientAddress),
                  },
                )
              : null}
          </Typography>
          {transactionId && (
            <Link
              variant={'caption'}
              target="_blank"
              href={`${
                config.BLOCKCHAINS[asset.symbol].BLOCK_EXPLORER_TX_URL
              }${transactionId}`}
            >
              {t('wallet.viewTransaction')}
            </Link>
          )}
        </Box>
        <Box display="flex" mt={5} className={classes.fullWidth}>
          <Button fullWidth onClick={onCloseClick} variant="outlined">
            {statusMessage === SendCryptoStatus.RETRIEVING_ACCOUNT ||
            statusMessage === SendCryptoStatus.STARTING_TRANSACTION ||
            statusMessage === SendCryptoStatus.GETTING_TRANSACTION_TO_SIGN
              ? t('common.cancel')
              : t('common.close')}
          </Button>
        </Box>
      </OperationStatus>
    </Box>
  );
};

export default SubmitTransaction;
