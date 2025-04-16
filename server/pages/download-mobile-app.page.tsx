import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import getDevice, {
  MobileOS,
  Platform,
  isChromeExtensionSupported,
} from 'lib/getDevice';
import React, {useEffect, useState} from 'react';

import config from '@unstoppabledomains/config';
import {
  Link,
  WalletIcon,
  useTranslationContext,
} from '@unstoppabledomains/ui-components';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    minHeight: 'calc(100vh - 64px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(4),
    boxShadow: theme.shadows[3],
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  title: {
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
    color: theme.palette.wallet.text.secondary,
  },
  header: {
    color: theme.palette.wallet.text.primary,
  },
  appLinksContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appStoreLink: {
    marginRight: theme.spacing(1.5),
    padding: 0,
  },
}));

const DownloadMobileApp: React.FC = () => {
  const [t] = useTranslationContext();
  const {classes, cx} = useStyles();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const detectedOS = getDevice();

    // redirect to Google Play store
    if (detectedOS === MobileOS.Android) {
      window.location.href = config.WALLETS.MOBILE.ANDROID_URL;
      return;
    }

    // redirect to Apple App Store
    if (detectedOS === MobileOS.Ios) {
      window.location.href = config.WALLETS.MOBILE.APPLE_URL;
      return;
    }

    // redirect to Chrome Web Store
    if (detectedOS === Platform.Desktop && isChromeExtensionSupported()) {
      window.location.href = config.WALLETS.MOBILE.CHROME_STORE_URL;
      return;
    }

    setIsLoading(false);
  }, []);

  return (
    <div className={classes.root}>
      <div className={classes.content}>
        {isLoading ? (
          <CircularProgress />
        ) : (
          <Box className={classes.paper}>
            <WalletIcon size={100} beta={true} />
            <Typography
              variant="h4"
              className={cx(classes.title, classes.header)}
            >
              {t('wallet.installApp')}
            </Typography>
            <Typography className={classes.title} variant="h6">
              {t('wallet.installMobileApp')}
            </Typography>
            <div className={classes.appLinksContainer}>
              <Link
                className={classes.appStoreLink}
                to={config.WALLETS.MOBILE.APPLE_URL}
                target="_blank"
              >
                <img
                  src="https://storage.googleapis.com/unstoppable-client-assets/images/mobile-app/DownloadOnAppStoreBadge.svg"
                  width={120}
                  height={40}
                />
              </Link>
              <Link to={config.WALLETS.MOBILE.ANDROID_URL} target="_blank">
                <img
                  src="https://storage.googleapis.com/unstoppable-client-assets/images/mobile-app/DownloadOnGooglePlayBadge.svg"
                  width={135}
                  height={40}
                />
              </Link>
            </div>
            <Typography className={classes.title} variant="h6">
              {t('wallet.installChromeExtension')}
            </Typography>
            <div className={classes.appLinksContainer}>
              <Link to={config.WALLETS.MOBILE.CHROME_STORE_URL} target="_blank">
                <img
                  src="https://storage.googleapis.com/unstoppable-client-assets/images/common/chrome-store-badge.svg"
                  width={135}
                  height={40}
                />
              </Link>
            </div>
          </Box>
        )}
      </div>
    </div>
  );
};

export default DownloadMobileApp;
