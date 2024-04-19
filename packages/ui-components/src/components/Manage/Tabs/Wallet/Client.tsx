import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SendIcon from '@mui/icons-material/Send';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import type {SerializedWalletBalance} from '../../../../lib';
import {useTranslationContext} from '../../../../lib';
import {TokensPortfolio} from '../../../Wallet/TokensPortfolio';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
  walletContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  mainActionsContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },
  balanceContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: theme.spacing(-1),
  },
  actionContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.palette.primaryShades[100],
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    marginRight: theme.spacing(2),
    width: '100px',
    cursor: 'pointer',
  },
  portfolioContainer: {
    display: 'flex',
    marginBottom: theme.spacing(-2),
  },
  actionIcon: {
    color: theme.palette.primary.main,
    width: '50px',
    height: '50px',
  },
  actionText: {
    color: theme.palette.primary.main,
  },
}));

export const Client: React.FC<ClientProps> = ({accessToken, wallets}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();

  // component state variables
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleClickedSend = () => {
    // TODO
    alert('send');
  };

  const handleClickedReceive = () => {
    // TODO
    alert('receive');
  };

  const handleClickedBuy = () => {
    // TODO
    alert('buy');
  };

  return (
    <Box className={classes.container}>
      {isLoaded ? (
        <Box className={classes.walletContainer}>
          <Box className={classes.balanceContainer}>
            <Typography variant="h3">
              {wallets
                .map(w => w.totalValueUsdAmt || 0)
                .reduce((p, c) => p + c, 0)
                .toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                })}
            </Typography>
          </Box>
          <Box className={classes.mainActionsContainer}>
            <Box
              className={classes.actionContainer}
              onClick={handleClickedSend}
            >
              <SendIcon className={classes.actionIcon} />
              <Typography variant="body1" className={classes.actionText}>
                {t('common.send')}
              </Typography>
            </Box>
            <Box
              className={classes.actionContainer}
              onClick={handleClickedReceive}
            >
              <AddOutlinedIcon className={classes.actionIcon} />
              <Typography variant="body1" className={classes.actionText}>
                {t('common.receive')}
              </Typography>
            </Box>
            <Box className={classes.actionContainer} onClick={handleClickedBuy}>
              <AttachMoneyIcon className={classes.actionIcon} />
              <Typography variant="body1" className={classes.actionText}>
                {t('common.buy')}
              </Typography>
            </Box>
          </Box>
          <Box className={classes.portfolioContainer}>
            <TokensPortfolio wallets={wallets} isOwner={true} />
          </Box>
        </Box>
      ) : (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export type ClientProps = {
  accessToken: string;
  wallets: SerializedWalletBalance[];
};
