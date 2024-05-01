import type {IFireblocksNCW} from '@fireblocks/ncw-js-sdk';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React from 'react';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {SendCryptoStatusMessage} from '../../../../actions/fireBlocksActions';
import {
  Status,
  useSubmitTransaction,
} from '../../../../hooks/useSubmitTransaction';
import {useTranslationContext} from '../../../../lib';
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
  const {classes} = useStyles();

  const {transactionId, status, statusMessage} = useSubmitTransaction({
    accessToken,
    asset,
    recipientAddress,
    amount,
    client,
  });

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
          <Button
            fullWidth
            onClick={onCloseClick}
            variant="outlined"
            disabled={
              ![
                SendCryptoStatusMessage.RETRIEVING_ACCOUNT,
                SendCryptoStatusMessage.STARTING_TRANSACTION,
                SendCryptoStatusMessage.WAITING_TO_SIGN,
                SendCryptoStatusMessage.TRANSACTION_COMPLETED,
              ].includes(statusMessage)
            }
          >
            {statusMessage === SendCryptoStatusMessage.TRANSACTION_COMPLETED
              ? t('common.close')
              : t('common.cancel')}
          </Button>
        </Box>
      </OperationStatus>
    </Box>
  );
};

export default SubmitTransaction;
