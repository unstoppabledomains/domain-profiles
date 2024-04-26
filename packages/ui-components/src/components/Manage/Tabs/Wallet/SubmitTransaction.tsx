import type {IFireblocksNCW} from '@fireblocks/ncw-js-sdk';
import CheckIcon from '@mui/icons-material/Check';
import ErrorIcon from '@mui/icons-material/Error';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useState} from 'react';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {sendCrypto} from '../../../../actions/fireBlocksActions';
import {TokenType, useTranslationContext} from '../../../../lib';
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

  useEffect(() => {
    void submitTransaction();
  }, []);

  const submitTransaction = async () => {
    try {
      await sendCrypto(
        accessToken,
        sourceAddress,
        sourceSymbol,
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
            {amount} {sourceSymbol}{' '}
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
