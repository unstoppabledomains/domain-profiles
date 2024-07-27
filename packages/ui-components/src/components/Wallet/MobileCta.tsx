import AppStoreButton from '@fenderdigital/react-app-store-button';
import Box from '@mui/material/Box';
import type {Theme} from '@mui/material/styles';
import React from 'react';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    width: '100%',
    justifyContent: 'center',
    textAlign: 'center',
  },
  button: {
    marginBottom: theme.spacing(-6),
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
  },
}));
type Props = {
  platform?: string;
};

export const MobileCta: React.FC<Props> = ({}) => {
  const {classes} = useStyles();

  return (
    <Box className={classes.container}>
      <AppStoreButton
        className={classes.button}
        variant="apple"
        link={config.WALLETS.MOBILE.APPLE_URL}
      />
      <AppStoreButton
        className={classes.button}
        variant="google"
        link={config.WALLETS.MOBILE.ANDROID_URL}
      />
    </Box>
  );
};
