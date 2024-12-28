import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import QrCodeIcon from '@mui/icons-material/QrCode';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {useTranslationContext} from '../../lib';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
    width: '100%',
  },
  centered: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: '100%',
  },
  icon: {
    width: '40px',
    height: '40px',
    marginRight: theme.spacing(1),
  },
}));

type Props = {
  onReceiveClicked: () => void;
  onBuyClicked: () => void;
  color?: 'primary' | 'secondary' | 'info' | 'inherit';
  variant?: 'contained' | 'outlined';
};

export const LetsGetStartedCta: React.FC<Props> = props => {
  const {classes, cx} = useStyles();
  const [t] = useTranslationContext();
  return (
    <Box className={classes.container}>
      <Typography variant="h5" mb={1}>
        {t('wallet.letsGetStarted')}
      </Typography>
      <Box className={cx(classes.content, classes.centered)}>
        <Box mb={1} className={classes.content}>
          <BuyCryptoButton {...props} />
        </Box>
        <ReceiveCryptoButton {...props} />
      </Box>
    </Box>
  );
};

export const BuyCryptoButton: React.FC<Props> = ({
  onBuyClicked,
  color = 'primary',
  variant = 'outlined',
}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();

  return (
    <Button
      onClick={onBuyClicked}
      variant={variant}
      color={color}
      startIcon={<AccountBalanceIcon className={classes.icon} />}
      className={classes.button}
    >
      <Box className={classes.content}>
        <Typography variant="body1" fontWeight="bold">
          {t('wallet.fundWithPurchaseTitle')}
        </Typography>
        <Typography variant="caption">
          {t('wallet.fundWithPurchaseDescription')}
        </Typography>
      </Box>
    </Button>
  );
};

export const ReceiveCryptoButton: React.FC<Props> = ({
  onReceiveClicked,
  color = 'primary',
  variant = 'contained',
}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();

  return (
    <Button
      onClick={onReceiveClicked}
      variant={variant}
      color={color}
      startIcon={<QrCodeIcon className={classes.icon} />}
      className={classes.button}
    >
      <Box className={classes.content}>
        <Typography variant="body1" fontWeight="bold">
          {t('wallet.fundWithTransferTitle')}
        </Typography>
        <Typography variant="caption">
          {t('wallet.fundWithTransferDescription')}
        </Typography>
      </Box>
    </Button>
  );
};
