import type {IFireblocksNCW} from '@fireblocks/ncw-js-sdk';
import CheckIcon from '@mui/icons-material/Check';
import ErrorIcon from '@mui/icons-material/Error';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
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
import {OperationStatus} from '../../../../lib/types/fireBlocks';
import Link from '../../../Link';

const useStyles = makeStyles()((theme: Theme) => ({
  flexColCenterAligned: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  contentWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '250px',
    width: '400px',
  },
  selectAssetContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '250px',
    justifyContent: 'space-between',
    width: '100%',
  },
  assetsContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
    alignItems: 'center',
  },
  asset: {
    backgroundImage: 'linear-gradient(#0655DD, #043893)',
    borderRadius: 9,
    padding: 12,
    width: '100%',
  },
  assetLogo: {
    height: '60px',
    width: '60px',
    marginTop: '10px',
  },
  sendAssetContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  sendAmountContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '113px',
  },
  recipientWrapper: {
    height: '109px',
    width: '100%',
  },
  amountInputWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  availableBalance: {
    textAlign: 'right',
    fontSize: '13px',
    marginTop: '2px',
  },
  sendLoadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  transactionStatusContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '7px',
    height: '155px',
  },
  icon: {
    fontSize: '60px',
  },
}));

type Props = {
  onCloseClick: () => void;
  accessToken: string;
  sourceAddress: string;
  sourceSymbol: string;
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
  sourceAddress,
  sourceSymbol,
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
        const asset = assets.find(
          a =>
            a.blockchainAsset.symbol.toLowerCase() ===
              sourceSymbol.toLowerCase() &&
            a.address.toLowerCase() === sourceAddress.toLowerCase(),
        );
        if (!asset) {
          throw new Error('address not found in account');
        }
        if (!isMounted.current) {
          return;
        }
        // initialize a transaction to retrieve auth tokens
        setStatusMessage(SendCryptoStatus.STARTING_TRANSACTION);
        const operationResponse = await getTransferOperationResponse(
          asset,
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
              operationStatus.status === OperationStatus.SIGNATURE_REQUIRED &&
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
            if (operationStatus.status === OperationStatus.COMPLETED) {
              setStatusMessage(SendCryptoStatus.TRANSACTION_COMPLETED);
              return {success: true};
            }
            if (
              operationStatus.status === OperationStatus.FAILED ||
              operationStatus.status === OperationStatus.CANCELLED
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
    <Box>
      <Box className={classes.sendLoadingContainer}>
        {status === Status.Success ? (
          <CheckIcon color="success" className={classes.icon} />
        ) : status === Status.Failed ? (
          <ErrorIcon color="error" className={classes.icon} />
        ) : (
          <CircularProgress />
        )}
        <Box className={classes.transactionStatusContainer} mt={2}>
          <Typography variant="h5">{statusMessage}</Typography>
          <Typography variant="caption">
            {status === Status.Success
              ? t('wallet.sendTransactionSuccess', {
                  amount,
                  sourceSymbol,
                  status,
                  recipientDomain: recipientDomain ? ` ${recipientDomain}` : '',
                  recipientAddress: truncateAddress(recipientAddress),
                })
              : status === Status.Failed
              ? t('wallet.sendTransactionFailed', {
                  amount,
                  sourceSymbol,
                  status,
                  recipientDomain: recipientDomain ? ` ${recipientDomain}` : '',
                  recipientAddress: truncateAddress(recipientAddress),
                })
              : ''}
          </Typography>
          {transactionId && (
            <Link
              variant={'caption'}
              target="_blank"
              href={`${config.BLOCKCHAINS[sourceSymbol].BLOCK_EXPLORER_TX_URL}${transactionId}`}
            >
              {t('wallet.viewTransaction')}
            </Link>
          )}
        </Box>
        <Box display="flex" mt={2} className={classes.fullWidth}>
          <Button fullWidth onClick={onCloseClick} variant="outlined">
            {t('common.close')}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default SubmitTransaction;
