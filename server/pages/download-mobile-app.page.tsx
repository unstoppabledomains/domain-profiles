import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import {useTheme} from '@mui/material/styles';
import {MobileOS, getMobileOperatingSystem} from 'lib/getDevice';
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
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  title: {
    color: theme.palette.greyShades[600],
    marginBottom: theme.spacing(2),
  },
  appLinksContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing(4),
  },
  appStoreLink: {
    marginRight: theme.spacing(1.5),
    padding: 0,
  },
}));

const DownloadMobileApp: React.FC = () => {
  const [t] = useTranslationContext();
  const {classes} = useStyles();
  const [isLoading, setIsLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const detectedOS = getMobileOperatingSystem();

    if (detectedOS === MobileOS.Android) {
      window.location.href = config.WALLETS.MOBILE.ANDROID_URL;
      return;
    }

    if (detectedOS === MobileOS.Ios) {
      window.location.href = config.WALLETS.MOBILE.APPLE_URL;
    }

    setIsLoading(false);
  }, []);

  return (
    <div className={classes.root}>
      <div className={classes.content}>
        {isLoading ? (
          <CircularProgress />
        ) : (
          <>
            <WalletIcon size={100} beta={true} />
            <Typography variant="h4" mb={4} mt={2}>
              {t('wallet.installApp')}
            </Typography>
            <Typography className={classes.title} variant="h5">
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
            <Typography className={classes.title} variant="h5">
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
          </>
        )}
      </div>
    </div>
  );
};

export default DownloadMobileApp;
