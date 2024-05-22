import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import {NextSeo} from 'next-seo';
import React, {useEffect, useState} from 'react';
import useIsMounted from 'react-is-mounted-hook';
import {useStyles} from 'styles/pages/index.styles';
import {GlobalStyles} from 'tss-react';

import config from '@unstoppabledomains/config';
import type {DomainProfileTabType} from '@unstoppabledomains/ui-components';
import {
  DomainProfileKeys,
  Wallet,
  getSeoTags,
  useFireblocksState,
  useTranslationContext,
} from '@unstoppabledomains/ui-components';
import {
  getAddressMetadata,
  isEthAddress,
} from '@unstoppabledomains/ui-components/src/components/Chat/protocol/resolution';
import InlineEducation from '@unstoppabledomains/ui-components/src/components/Wallet/InlineEducation';
import {getBootstrapState} from '@unstoppabledomains/ui-components/src/lib/fireBlocks/storage/state';
import IconPlate from '@unstoppabledomains/ui-kit/icons/IconPlate';
import ShieldKeyHoleIcon from '@unstoppabledomains/ui-kit/icons/ShieldKeyHoleIcon';

const WalletPage = () => {
  const {classes, cx} = useStyles({});
  const [t] = useTranslationContext();
  const isMounted = useIsMounted();
  const [walletState] = useFireblocksState();
  const [authAddress, setAuthAddress] = useState<string>('');
  const [authDomain, setAuthDomain] = useState<string>('');
  const [authAvatar, setAuthAvatar] = useState<string>();
  const [authButton, setAuthButton] = useState<React.ReactNode>();
  const [authComplete, setAuthComplete] = useState(false);
  const [signInClicked, setSignInClicked] = useState(false);

  const seoTags = getSeoTags({
    title: t('wallet.title'),
    description: t('manage.cryptoWalletDescription'),
  });

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
      } catch {}
    };
    void loadWallet();
  }, [isMounted, authComplete]);

  const handleLearnMore = () => {
    window.open(
      'https://unstoppabledomains.freshdesk.com/support/solutions/48000457487',
      '_blank',
    );
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
      <Grid
        container
        className={classes.content}
        data-testid="mainContentContainer"
      >
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
        <Grid item xs={12} className={classes.item}>
          {signInClicked || authAddress ? (
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
                address={authAddress}
                domain={authDomain}
                avatarUrl={authAvatar}
                onUpdate={(_t: DomainProfileTabType) => {
                  handleAuthComplete();
                }}
                setButtonComponent={setAuthButton}
              />
              {!authAddress && (
                <Box display="flex" flexDirection="column" width="100%" mt={2}>
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
                <IconPlate size={35} variant="info">
                  <ShieldKeyHoleIcon />
                </IconPlate>
                <Typography ml={1} variant="h6">
                  Features & highlights
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
