import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import {MobileCta} from 'components/wallet/MobileCta';
import {EMAIL_PARAM, RECOVERY_TOKEN_PARAM} from 'lib/types';
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
  localStorageWrapper,
  useCustomTheme,
  useFireblocksState,
  useTranslationContext,
  useWeb3Context,
} from '@unstoppabledomains/ui-components';
import {notifyEvent} from '@unstoppabledomains/ui-components/src/lib/error';

const WalletPage = () => {
  const {classes, cx} = useStyles({});
  const [t] = useTranslationContext();
  const {web3Deps} = useWeb3Context();
  const {query: params} = useRouter();
  const isMounted = useIsMounted();
  const theme = useCustomTheme();
  const [isLoaded, setIsLoaded] = useState(false);
  const [walletState] = useFireblocksState();
  const [authAddress, setAuthAddress] = useState<string>('');
  const [authDomain, setAuthDomain] = useState<string>('');
  const [authAvatar, setAuthAvatar] = useState<string>();
  const [authButton, setAuthButton] = useState<React.ReactNode>();
  const [authComplete, setAuthComplete] = useState(false);
  const [recoveryToken, setRecoveryToken] = useState<string>();
  const [emailAddress, setEmailAddress] = useState<string>();
  const [isReloadChecked, setIsReloadChecked] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // build default wallet page SEO tags
  const seoTags = getSeoTags({
    title: theme.palette.wallet.product.title,
    description: theme.palette.wallet.product.subTitle,
  });

  // sign the user out if recovery is requested
  useEffect(() => {
    if (!walletState || (!recoveryToken && !emailAddress) || isReloadChecked) {
      return;
    }
    if (Object.keys(walletState).length > 0) {
      void localStorageWrapper.clear();
      sessionStorage.clear();
      window.location.reload();
      return;
    }
    setIsReloadChecked(true);
  }, [walletState, recoveryToken, emailAddress]);

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
        setIsLoaded(true);
        await localStorageWrapper.setItem(
          DomainProfileKeys.AuthAddress,
          accountEvmAddresses[0],
        );

        // resolve the domain of this address (if available)
        const resolution = await getAddressMetadata(accountEvmAddresses[0]);
        if (resolution?.name) {
          setAuthDomain(resolution.name);
          await localStorageWrapper.setItem(
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

  const handleAuthComplete = () => {
    setAuthComplete(true);
  };

  const handleClaimComplete = async (v: string) => {
    await localStorageWrapper.clear();
    sessionStorage.clear();
    window.location.href = `${
      config.UD_ME_BASE_URL
    }/wallet?${EMAIL_PARAM}=${encodeURIComponent(v)}`;
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
        {isLoaded && (
          <Grid container data-testid="mainContentContainer">
            <Grid item xs={12} className={classes.item}>
              <Typography className={classes.sectionTitle}>
                {theme.palette.wallet.product.title}
              </Typography>
            </Grid>
            <Grid item xs={12} className={classes.item}>
              <Typography className={classes.sectionSubTitle}>
                {theme.palette.wallet.product.subTitle}
              </Typography>
            </Grid>
            <Grid item xs={12} className={classes.item}>
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
                  onClaimComplete={handleClaimComplete}
                  setAuthAddress={setAuthAddress}
                  setButtonComponent={setAuthButton}
                  isNewUser={!emailAddress}
                  fullScreenModals={isMobile}
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
            </Grid>
            {web3Deps?.unstoppableWallet && (
              <Grid item xs={12}>
                <Box mt={5}>
                  <MobileCta />
                </Box>
              </Grid>
            )}
          </Grid>
        )}
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
