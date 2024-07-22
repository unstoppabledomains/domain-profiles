import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import {EMAIL_PARAM, RECOVERY_TOKEN_PARAM, SIGN_IN_PARAM} from 'lib/types';
import {NextSeo} from 'next-seo';
import {useRouter} from 'next/router';
import React, {useEffect, useState} from 'react';
import useIsMounted from 'react-is-mounted-hook';
import {useStyles} from 'styles/pages/index.styles';
import {GlobalStyles} from 'tss-react';

import config from '@unstoppabledomains/config';
import type {DomainProfileTabType} from '@unstoppabledomains/ui-components';
import {
  DomainProfileKeys,
  Wallet,
  getAddressMetadata,
  getBootstrapState,
  getSeoTags,
  isEthAddress,
  useFireblocksState,
  useTranslationContext,
} from '@unstoppabledomains/ui-components';
import InlineEducation from '@unstoppabledomains/ui-components/src/components/Wallet/InlineEducation';
import {notifyEvent} from '@unstoppabledomains/ui-components/src/lib/error';
import IconPlate from '@unstoppabledomains/ui-kit/icons/IconPlate';
import UnstoppableWalletIcon from '@unstoppabledomains/ui-kit/icons/UnstoppableWalletIcon';

const WalletPage = () => {
  const {classes, cx} = useStyles({});
  const [t] = useTranslationContext();
  const {query: params} = useRouter();
  const isMounted = useIsMounted();
  const [isLoaded, setIsLoaded] = useState(false);
  const [walletState] = useFireblocksState();
  const [authAddress, setAuthAddress] = useState<string>('');
  const [authDomain, setAuthDomain] = useState<string>('');
  const [authAvatar, setAuthAvatar] = useState<string>();
  const [authButton, setAuthButton] = useState<React.ReactNode>();
  const [authComplete, setAuthComplete] = useState(false);
  const [recoveryToken, setRecoveryToken] = useState<string>();
  const [emailAddress, setEmailAddress] = useState<string>();
  const [signInClicked, setSignInClicked] = useState(false);
  const [isReloadChecked, setIsReloadChecked] = useState(false);

  // build default wallet page SEO tags
  const seoTags = getSeoTags({
    title: t('wallet.title'),
    description: t('manage.cryptoWalletDescriptionShort'),
  });

  // sign the user out if recovery is requested
  useEffect(() => {
    if (!walletState || !recoveryToken || isReloadChecked) {
      return;
    }
    if (Object.keys(walletState).length > 0) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
      return;
    }
    setIsReloadChecked(true);
  }, [walletState, recoveryToken]);

  // load query string params
  useEffect(() => {
    if (!params) {
      return;
    }

    // select email address if specified in parameter
    if (params[EMAIL_PARAM] && typeof params[EMAIL_PARAM] === 'string') {
      setEmailAddress(params[EMAIL_PARAM]);
    }

    // select recovery if specified in parameter
    if (
      params[RECOVERY_TOKEN_PARAM] &&
      typeof params[RECOVERY_TOKEN_PARAM] === 'string'
    ) {
      setRecoveryToken(params[RECOVERY_TOKEN_PARAM]);
      return;
    }

    // select sign in if specified in parameter
    if (params[SIGN_IN_PARAM] !== undefined) {
      setSignInClicked(true);
    }
  }, [params]);

  // load the existing wallet if singed in
  useEffect(() => {
    if (!isMounted()) {
      return;
    }

    const loadWallet = async () => {
      try {
        // retrieve state of logged in wallet (if any)
        const signInState = getBootstrapState(walletState);
        if (!signInState) {
          return;
        }

        // query addresses belonging to accounts
        const accountEvmAddresses = [
          ...new Set(
            signInState.assets
              ?.map(a => a.address)
              .filter(a => isEthAddress(a)),
          ),
        ];

        // ensure an EVM address is available
        if (accountEvmAddresses.length === 0) {
          return;
        }
        setAuthAddress(accountEvmAddresses[0]);
        localStorage.setItem(
          DomainProfileKeys.AuthAddress,
          accountEvmAddresses[0],
        );

        // resolve the domain of this address (if available)
        const resolution = await getAddressMetadata(accountEvmAddresses[0]);
        if (resolution?.name) {
          setAuthDomain(resolution.name);
          localStorage.setItem(
            DomainProfileKeys.AuthDomain,
            resolution.name.toLowerCase(),
          );
          if (resolution?.imageType !== 'default') {
            setAuthAvatar(resolution.avatarUrl);
          }
        }
      } catch (e) {
        notifyEvent(e, 'error', 'Wallet', 'Configuration');
      } finally {
        setIsLoaded(true);
      }
    };
    void loadWallet();
  }, [isMounted, authComplete]);

  const handleLearnMore = () => {
    window.open(config.WALLETS.LANDING_PAGE_URL, '_blank');
  };

  const handleSignIn = () => {
    setSignInClicked(true);
  };

  const handleAuthComplete = () => {
    setAuthComplete(true);
  };

  return (
    <Box className={classes.container}>
      <NextSeo {...seoTags} />
      <GlobalStyles
        styles={{
          '@font-face': {
            fontFamily: 'Helvetica Neue',
            src: `url('${config.ASSETS_BUCKET_URL}/fonts/HelveticaNeueLT97BlackCondensed.ttf') format('truetype')`,
            fontWeight: 900,
            fontStyle: 'normal',
            fontDisplay: 'swap',
          },
        }}
      />
      <Box className={classes.content}>
        <Grid container data-testid="mainContentContainer">
          <Grid item xs={12} className={classes.item}>
            <Typography className={classes.sectionTitle}>
              {t('wallet.title')}
            </Typography>
          </Grid>
          <Grid item xs={12} className={classes.item}>
            <Typography className={classes.sectionSubTitle}>
              {t('manage.cryptoWalletDescriptionShort')}
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            className={classes.item}
            sx={{display: isLoaded ? undefined : 'none'}}
          >
            {signInClicked || recoveryToken || emailAddress || authAddress ? (
              <Box
                className={cx(
                  classes.searchContainer,
                  classes.walletContainer,
                  authAddress
                    ? classes.walletPortfolioContainer
                    : classes.walletInfoContainer,
                )}
              >
                <Wallet
                  mode={authAddress ? 'portfolio' : 'basic'}
                  emailAddress={emailAddress}
                  address={authAddress}
                  domain={authDomain}
                  avatarUrl={authAvatar}
                  recoveryToken={recoveryToken}
                  showMessages={true}
                  onUpdate={(_t: DomainProfileTabType) => {
                    handleAuthComplete();
                  }}
                  setButtonComponent={setAuthButton}
                />
                {!authAddress && (
                  <Box
                    display="flex"
                    flexDirection="column"
                    width="100%"
                    mt={2}
                  >
                    {authButton}
                  </Box>
                )}
              </Box>
            ) : (
              <Box
                className={cx(
                  classes.searchContainer,
                  classes.walletContainer,
                  classes.walletInfoContainer,
                )}
              >
                <Box mt={1} display="flex" alignItems="center">
                  <IconPlate size={40} variant="info">
                    <UnstoppableWalletIcon />
                  </IconPlate>
                  <Typography ml={1} variant="h5">
                    Features & Highlights
                  </Typography>
                </Box>
                <InlineEducation />
                <Box display="flex" flexDirection="column" width="100%">
                  <Button
                    fullWidth
                    variant="contained"
                    className={classes.button}
                    onClick={handleLearnMore}
                  >
                    {t('common.learnMore')}
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    className={classes.button}
                    onClick={handleSignIn}
                  >
                    {t('header.signIn')}
                  </Button>
                </Box>
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>
      <Box className={classes.footerContainer}>
        <Box className={classes.footerContent}>
          <Typography className={classes.copyright} variant="body2">
            {t('footer.copyright')}
          </Typography>
        </Box>
        <Box className={classes.footerContent}>
          <Typography variant="caption">
            <a
              className={classes.footerLink}
              href="https://unstoppabledomains.com/terms"
            >
              {t('footer.terms')}
            </a>
            <a
              className={classes.footerLink}
              href="https://unstoppabledomains.com/privacy-policy"
            >
              {t('footer.privacyPolicy')}
            </a>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default WalletPage;
