import type {IFireblocksNCW} from '@fireblocks/ncw-js-sdk';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React from 'react';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {SendCryptoStatusMessage} from '../../actions/fireBlocksActions';
import {Status, useSubmitTransaction} from '../../hooks/useSubmitTransaction';
import {useTranslationContext} from '../../lib';
import type {AccountAsset} from '../../lib/types/fireBlocks';
import {getBlockchainSymbol} from '../Manage/common/verification/types';
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
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
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
  getClient: () => Promise<IFireblocksNCW>;
  onInvitation: (
    emailAddress: string,
  ) => Promise<Record<string, string> | undefined>;
  accessToken: string;
  asset: AccountAsset;
  recipientAddress: string;
  recipientDomain?: string;
  amount: string;
};

const truncateAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const SubmitTransaction: React.FC<Props> = ({
  onCloseClick,
  getClient,
  onInvitation,
  accessToken,
  asset,
  recipientAddress,
  recipientDomain,
  amount,
}) => {
  const [t] = useTranslationContext();
  const {classes} = useStyles();

  const {transactionId, status, statusMessage} = useSubmitTransaction({
    accessToken,
    asset,
    recipientAddress,
    amount,
    getClient,
    onInvitation,
  });

  const visibleButtonStates = [
    SendCryptoStatusMessage.CREATING_WALLET,
    SendCryptoStatusMessage.CHECKING_QUEUE,
    SendCryptoStatusMessage.STARTING_TRANSACTION,
    SendCryptoStatusMessage.WAITING_TO_SIGN,
    SendCryptoStatusMessage.WAITING_FOR_TRANSACTION,
    SendCryptoStatusMessage.TRANSACTION_COMPLETED,
  ];
  const closeButtonStates = [
    SendCryptoStatusMessage.WAITING_FOR_TRANSACTION,
    SendCryptoStatusMessage.TRANSACTION_COMPLETED,
  ];

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
            {[Status.Success, Status.Failed].includes(status) &&
              t(
                `wallet.sendTransaction${
                  status === Status.Success ? 'Success' : 'Failed'
                }`,
                {
                  amount,
                  sourceSymbol: asset.blockchainAsset.symbol,
                  status,
                  recipientDomain: recipientDomain
                    ? ` ${recipientDomain}`
                    : ` ${recipientAddress}`,
                },
              )}
            {recipientDomain && recipientAddress !== recipientDomain && (
              <>({truncateAddress(recipientAddress)})</>
            )}
          </Typography>
          {transactionId && (
            <Button
              variant="text"
              onClick={() =>
                window.open(
                  `${
                    config.BLOCKCHAINS[
                      getBlockchainSymbol(asset.blockchainAsset.blockchain.id)
                    ].BLOCK_EXPLORER_TX_URL
                  }${transactionId}`,
                  '_blank',
                )
              }
            >
              {t('wallet.viewTransaction')}
            </Button>
          )}
        </Box>
      </OperationStatus>
      {visibleButtonStates.includes(statusMessage) && (
        <Box className={classes.fullWidth}>
          <Button fullWidth onClick={onCloseClick} variant="outlined">
            {closeButtonStates.includes(statusMessage)
              ? t('common.close')
              : t('common.cancel')}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default SubmitTransaction;
