import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {useTranslationContext} from '../../../../lib';
import {TitleWithBackButton} from './TitleWithBackButton';

const useStyles = makeStyles()((theme: Theme) => ({
  fullWidth: {
    width: '100%',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  contentContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    gap: '7px',
    marginBottom: theme.spacing(5),
    backgroundColor: theme.palette.primaryShades[100],
    padding: 12,
    borderRadius: 8,
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
  onBackClick: () => void;
  onSendClick: () => void;
  recipientAddress: string;
  resolvedDomain: string;
  amount: string;
  symbol: string;
  amountInDollars: string;
  blockchainName: string;
};

const truncateAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const SendConfirm: React.FC<Props> = ({
  onBackClick,
  recipientAddress,
  resolvedDomain,
  amount,
  symbol,
  amountInDollars,
  blockchainName,
  onSendClick,
}) => {
  const [t] = useTranslationContext();
  const {classes} = useStyles();

  return (
    <Box className={classes.container}>
      <TitleWithBackButton onCancelClick={onBackClick} label={'Summary'} />
      <Box
        mt={2}
        display="flex"
        alignItems="center"
        flexDirection="column"
        width="100%"
      >
        <Typography variant="h4" textAlign="center">
          {amount} {symbol}
        </Typography>
        <Typography variant="subtitle1">{amountInDollars}</Typography>
        <Box className={classes.contentContainer} mt={3}>
          <Box
            display="flex"
            width="100%"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h6">{t('common.to')}</Typography>
            <Typography variant="subtitle1">
              {resolvedDomain ? <b>{resolvedDomain} </b> : ''}(
              {truncateAddress(recipientAddress)})
            </Typography>
          </Box>
          <Box
            display="flex"
            width="100%"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h6">{t('common.network')}</Typography>
            <Typography variant="subtitle1">{blockchainName}</Typography>
          </Box>
          <Box
            display="flex"
            width="100%"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h6">{t('wallet.networkFee')}</Typography>
            <Typography variant="subtitle1">TODO</Typography>
          </Box>
        </Box>
        <Button onClick={onSendClick} variant="contained" fullWidth data-testid='send-confirm-button'>
          {t('common.send')}
        </Button>
      </Box>
    </Box>
  );
};

export default SendConfirm;
