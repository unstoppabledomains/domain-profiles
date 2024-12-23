import RocketLaunchOutlined from '@mui/icons-material/RocketLaunchOutlined';
import Alert from '@mui/lab/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import type {Theme} from '@mui/material/styles';
import React from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {useFireblocksState} from '../../hooks';
import {useTranslationContext} from '../../lib';
import {getBootstrapState} from '../../lib/fireBlocks/storage/state';
import {isEthAddress} from '../Chat/protocol/resolution';
import {BuyCryptoButton, ReceiveCryptoButton} from './LetsGetStartedCta';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'space-between',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  centered: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    marginTop: theme.spacing(1),
    width: '100%',
  },
  icon: {
    color: theme.palette.neutralShades[300],
    width: '150px',
    height: '150px',
  },
  alert: {
    textAlign: 'left',
    marginTop: theme.spacing(3),
  },
}));

type Props = {
  onReceiveClicked: () => void;
  onBuyClicked: () => void;
};

const FundWalletModal: React.FC<Props> = ({onReceiveClicked, onBuyClicked}) => {
  const {classes, cx} = useStyles();
  const [t] = useTranslationContext();
  const [state] = useFireblocksState();
  const walletState = getBootstrapState(state);

  // retrieve EVM address to receive domain
  const address = walletState?.assets.find(a =>
    isEthAddress(a.address),
  )?.address;

  // show loading spinner until address is available
  if (!address) {
    return (
      <Box display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className={classes.container}>
      <Box className={cx(classes.content, classes.centered)}>
        <RocketLaunchOutlined className={classes.icon} />
        <Alert className={classes.alert} severity="info">
          {t('wallet.noTokensAvailableForSend')}
        </Alert>
      </Box>
      <Box mt={3} className={classes.content}>
        <BuyCryptoButton
          onReceiveClicked={onReceiveClicked}
          onBuyClicked={onBuyClicked}
          variant="outlined"
          color="primary"
        />
        <Box className={classes.button}>
          <ReceiveCryptoButton
            onReceiveClicked={onReceiveClicked}
            onBuyClicked={onBuyClicked}
            variant="contained"
            color="primary"
          />
        </Box>
      </Box>
    </Box>
  );
};

export default FundWalletModal;
