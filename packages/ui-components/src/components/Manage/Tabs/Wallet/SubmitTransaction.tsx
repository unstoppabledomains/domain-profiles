import type {IFireblocksNCW} from '@fireblocks/ncw-js-sdk';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useState} from 'react';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {sendCrypto} from '../../../../actions/fireBlocksActions';
import {TokenType, useTranslationContext} from '../../../../lib';
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

  useEffect(() => {
    void submitTransaction();
  }, []);

  const submitTransaction = async () => {
    try {
      // send the crypto
      await sendCrypto(
        accessToken,
        asset,
        recipientAddress,
        {
          type: TokenType.Native,
          amount: parseFloat(amount),
        },
        async (internalTxId: string) => {
          await client.signTransaction(internalTxId);
        },
        {
          onTxId: setTransactionId,
          onStatusChange: setStatusMessage,
        },
      );
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
        <Typography
          variant="caption"
          className={
            transactionId ? classes.subTitleComplete : classes.subTitlePending
          }
        >
          {amount} {asset.ticker}{' '}
          {status === Status.Success
            ? 'was successfully sent '
            : status === Status.Failed
            ? 'failed to send '
            : ''}
          to {recipientDomain ? recipientDomain : null} (
          {truncateAddress(recipientAddress)})
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
        {(transactionId || status !== Status.Pending) && (
          <Box display="flex" mt={5} className={classes.fullWidth}>
            <Button fullWidth onClick={onCloseClick} variant="outlined">
              {t('common.close')}
            </Button>
          </Box>
        )}
      </OperationStatus>
    </Box>
  );
};

export default SubmitTransaction;
