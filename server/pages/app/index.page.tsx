import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import useMediaQuery from '@mui/material/useMediaQuery';
import Footer from 'components/app/Footer';
import {EMAIL_PARAM, RECOVERY_TOKEN_PARAM} from 'lib/types';
import {NextSeo} from 'next-seo';
import {useRouter} from 'next/router';
import React, {useEffect, useState} from 'react';
import useIsMounted from 'react-is-mounted-hook';
import {useStyles} from 'styles/pages/index.styles';
import {GlobalStyles} from 'tss-react';
import useAsyncEffect from 'use-async-effect';

import config from '@unstoppabledomains/config';
import type {DomainProfileTabType} from '@unstoppabledomains/ui-components';
import {
  DomainProfileKeys,
  Modal,
  Wallet,
  getAddressMetadata,
  getBootstrapState,
  getWalletSeoTags,
  isEthAddress,
  localStorageWrapper,
  useCustomTheme,
  useFireblocksState,
  useWeb3Context,
} from '@unstoppabledomains/ui-components';
import {notifyEvent} from '@unstoppabledomains/ui-components/src/lib/error';

const WalletPage = () => {
  const {classes, cx} = useStyles({});
  const {query: params} = useRouter();
  const isMounted = useIsMounted();
  const theme = useCustomTheme();
  const [isLoaded, setIsLoaded] = useState(false);
  const [walletState] = useFireblocksState();
  const {showPinCta} = useWeb3Context({enforcePin: true});
  const [authAddress, setAuthAddress] = useState<string>();
  const [authDomain, setAuthDomain] = useState<string>();
  const [authAvatar, setAuthAvatar] = useState<string>();
  const [authButton, setAuthButton] = useState<React.ReactNode>();
  const [authComplete, setAuthComplete] = useState(false);
  const [recoveryToken, setRecoveryToken] = useState<string>();
  const [emailAddress, setEmailAddress] = useState<string>();
  const [isReloadChecked, setIsReloadChecked] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // indicates session lock has been checked and the session is
  // not in a locked state
  const isSessionUnlocked = showPinCta === false;

  // build default wallet page SEO tags
  const seoTags = getWalletSeoTags();

  // sign the user out if recovery is requested
  useEffect(() => {
    if (!walletState || (!recoveryToken && !emailAddress) || isReloadChecked) {
      return;
    }
    if (Object.keys(walletState).length > 0) {
      void handleLogout();
      sessionStorage.clear();
      window.location.reload();
      return;
    }
    setIsReloadChecked(true);
  }, [walletState, recoveryToken, emailAddress]);

  const handleLogout = async () => {
    // clear local storage and session storage
    await Promise.all([
      localStorageWrapper.clear({type: 'local'}),
      localStorageWrapper.clear({type: 'session'}),
    ]);

    // clear state variables
    setAuthAddress(undefined);
    setAuthDomain(undefined);
  };

  useAsyncEffect(async () => {
    if (authAddress !== undefined) {
      await localStorageWrapper.setItem(
        DomainProfileKeys.AuthAddress,
        authAddress,
      );
    }
    if (authDomain !== undefined) {
      await localStorageWrapper.setItem(
        DomainProfileKeys.AuthDomain,
        authDomain,
      );
    }
  }, [authAddress, authDomain]);

  // load the existing wallet if singed in
  useEffect(() => {
    if (!isMounted() || !params || !isSessionUnlocked) {
      return;
    }

    const loadWallet = async () => {
      try {
        if (params) {
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
        }

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
  }, [isMounted, isSessionUnlocked, authComplete, params]);

  const handleAuthComplete = () => {
    setAuthComplete(true);
  };

  const handleUseExistingAccount = async (existingEmailAddress: string) => {
    // sign the user out and prepare to use the existing email account
    setIsReloadChecked(true);
    setEmailAddress(existingEmailAddress);
    await handleLogout();

    // set the window location including the existing email address
    window.location.href = `${window.location.pathname}?${EMAIL_PARAM}=${existingEmailAddress}`;
  };

  const renderWallet = () => (
    <Wallet
      mode={authAddress ? 'portfolio' : 'basic'}
      disableBasicHeader={true}
      emailAddress={emailAddress}
      address={authAddress !== undefined ? authAddress : ''}
      domain={authDomain !== undefined ? authDomain : ''}
      avatarUrl={authAvatar}
      recoveryToken={recoveryToken}
      showMessages={true}
      onUpdate={(_t: DomainProfileTabType) => {
        handleAuthComplete();
      }}
      onUseExistingAccount={handleUseExistingAccount}
      setAuthAddress={setAuthAddress}
      setAuthDomain={setAuthDomain}
      setButtonComponent={setAuthButton}
      isNewUser={!emailAddress}
      fullScreenModals={isMobile}
    />
  );

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
              {isMobile && authAddress ? (
                <Modal
                  open={true}
                  fullScreen
                  isConfirmation
                  noModalHeader
                  noContentPadding
                  onClose={() => {}}
                >
                  {renderWallet()}
                </Modal>
              ) : (
                <Box
                  className={cx(
                    classes.searchContainer,
                    classes.walletContainer,
                    authAddress
                      ? classes.walletPortfolioContainer
                      : classes.walletInfoContainer,
                  )}
                >
                  {renderWallet()}
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
              )}
            </Grid>
          </Grid>
        )}
      </Box>
      <Footer />
    </Box>
  );
};

export default WalletPage;
