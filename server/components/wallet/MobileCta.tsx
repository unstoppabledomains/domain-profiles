import AppStoreButton from '@fenderdigital/react-app-store-button';
import Box from '@mui/material/Box';
import type {Theme} from '@mui/material/styles';
import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
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
  chromeStore: {
    cursor: 'pointer',
    backgroundImage: `url("https://storage.googleapis.com/unstoppable-client-assets/images/common/chrome-store-badge.svg")`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'contain',
    width: '165px',
    height: '50px',
  },
}));

export const MobileCta: React.FC = () => {
  const {classes} = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleChromeStoreClick = () => {
    window.open(config.WALLETS.MOBILE.CHROME_STORE_URL, '_blank');
  };

  return (
    <Box className={classes.container}>
      {isMobile ? (
        <>
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
        </>
      ) : (
        <Box className={classes.chromeStore} onClick={handleChromeStoreClick} />
      )}
    </Box>
  );
};
