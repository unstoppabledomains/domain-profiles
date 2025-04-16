import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import {useTheme} from '@mui/material/styles';
import getDevice, {
  MobileOS,
  Platform,
  isChromeExtensionSupported,
} from 'lib/getDevice';
import {NextSeo} from 'next-seo';
import React, {useEffect, useState} from 'react';

import config from '@unstoppabledomains/config';
import {
  Link,
  WalletIcon,
  getSeoTags,
  useTranslationContext,
} from '@unstoppabledomains/ui-components';
import {UP_IO_TWITTER_HANDLE} from '@unstoppabledomains/ui-components/src/lib';
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
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
    marginTop: theme.spacing(2),
    minWidth: '350px',
    boxShadow: theme.shadows[2],
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
    color: theme.palette.wallet.text.secondary,
  },
  header: {
    color: theme.palette.wallet.text.primary,
  },
  button: {
    marginTop: theme.spacing(2),
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
  const theme = useTheme();

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

  const handleOpenInBrowser = () => {
    window.location.href = `${config.UP_IO_BASE_URL}/app`;
  };

  // build default wallet page SEO tags
  const seoTags = getSeoTags({
    title: theme.wallet.title,
    description: theme.wallet.subTitle,
    url: `${config.UP_IO_BASE_URL}/download-mobile-app`,
    domainAvatar:
      'https://storage.googleapis.com/unstoppable-client-assets/images/upio/logo/beta.png',
    twitterSite: UP_IO_TWITTER_HANDLE,
  });

  return (
    <div className={classes.root}>
      <NextSeo {...seoTags} />
      <div className={classes.content}>
        {isLoading ? (
          <CircularProgress />
        ) : (
          <Box className={classes.content}>
            <WalletIcon size={100} beta={true} boxShadow={true} />
            <Typography
              variant="h4"
              className={cx(classes.title, classes.header)}
            >
              {t('wallet.installApp')}
            </Typography>
            <Box className={classes.paper}>
              <Box mt={-2}>
                <Typography className={classes.title} variant="h6">
                  {t('wallet.installMobileApp')}
                </Typography>
              </Box>
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
                <Link
                  to={config.WALLETS.MOBILE.CHROME_STORE_URL}
                  target="_blank"
                >
                  <img
                    src="https://storage.googleapis.com/unstoppable-client-assets/images/common/chrome-store-badge.svg"
                    width={135}
                    height={40}
                  />
                </Link>
              </div>
            </Box>
            <Typography
              variant="caption"
              className={classes.title}
              mt={2}
              mb={2}
            >
              -- {t('common.or')} --
            </Typography>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleOpenInBrowser}
            >
              {t('wallet.openInBrowser')}
            </Button>
          </Box>
        )}
      </div>
    </div>
  );
};

export default DownloadMobileApp;
