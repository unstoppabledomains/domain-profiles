import RocketLaunchOutlined from '@mui/icons-material/RocketLaunchOutlined';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import type {Theme} from '@mui/material/styles';
import React from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {useFireblocksState} from '../../hooks';
import {getBootstrapState} from '../../lib/wallet/storage/state';
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
    marginTop: theme.spacing(2),
    width: '100%',
  },
  icon: {
    '& > svg': {
      width: '150px',
      height: '150px',
      fill: theme.palette.neutralShades[300],
    },
  },
  alert: {
    textAlign: 'left',
    marginTop: theme.spacing(3),
  },
}));

type Props = {
  onReceiveClicked: () => void;
  onBuyClicked: () => void;
  icon?: React.ReactNode;
};

const FundWalletModal: React.FC<Props> = ({
  onReceiveClicked,
  onBuyClicked,
  icon,
}) => {
  const {classes, cx} = useStyles();
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
        <Box className={classes.icon}>
          {icon ? icon : <RocketLaunchOutlined />}
        </Box>
      </Box>
      <Box mt={3} className={classes.content}>
        <BuyCryptoButton
          onReceiveClicked={onReceiveClicked}
          onBuyClicked={onBuyClicked}
        />
        <Box className={classes.button}>
          <ReceiveCryptoButton
            onReceiveClicked={onReceiveClicked}
            onBuyClicked={onBuyClicked}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default FundWalletModal;
