import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import RocketLaunchOutlined from '@mui/icons-material/RocketLaunchOutlined';
import Alert from '@mui/lab/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import type {Theme} from '@mui/material/styles';
import React from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {useFireblocksState} from '../../hooks';
import {useTranslationContext} from '../../lib';
import {getBootstrapState} from '../../lib/fireBlocks/storage/state';
import {isEthAddress} from '../Chat/protocol/resolution';

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
    marginTop: theme.spacing(3),
    width: '100%',
  },
  icon: {
    color: theme.palette.neutralShades[300],
    width: '150px',
    height: '150px',
  },
  alert: {
    textAlign: 'left',
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
      </Box>
      <Box mt={3} className={classes.content}>
        <Alert className={classes.alert} severity="info">
          {t('wallet.noTokensAvailableForSend')}
        </Alert>
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Button
              onClick={onReceiveClicked}
              variant="contained"
              startIcon={<AddOutlinedIcon />}
              className={classes.button}
            >
              {t('common.receive')}
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              onClick={onBuyClicked}
              variant="contained"
              startIcon={<AttachMoneyIcon />}
              className={classes.button}
            >
              {t('common.buy')}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default FundWalletModal;
