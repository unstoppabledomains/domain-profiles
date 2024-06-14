import WalletIcon from '@mui/icons-material/Wallet';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import {jwtDecode} from 'jwt-decode';
import Markdown from 'markdown-to-jsx';
import {NextSeo} from 'next-seo';
import {useSnackbar} from 'notistack';
import React, {useEffect, useState} from 'react';
import {useStyles} from 'styles/pages/index.styles';
import {GlobalStyles} from 'tss-react';
import {useSessionStorage} from 'usehooks-ts';

import config from '@unstoppabledomains/config';
import {
  Crypto,
  DomainFieldTypes,
  getProfileData,
  getSeoTags,
  useTranslationContext,
  verifyOneTimeCode,
} from '@unstoppabledomains/ui-components';
import {
  getIdentity,
  saveIdentity,
  sendOneTimeCode,
} from '@unstoppabledomains/ui-components/src/actions';
import ManageInput from '@unstoppabledomains/ui-components/src/components/Manage/common/ManageInput';
import Modal from '@unstoppabledomains/ui-components/src/components/Modal';
import {isEmailValid} from '@unstoppabledomains/ui-components/src/lib';
import {sleep} from '@unstoppabledomains/ui-components/src/lib/sleep';

enum VerificationState {
  EnterEmail = 'enterEmail',
  EnterOtp = 'enterOtp',
  Complete = 'complete',
  Minting = 'minting',
  Updating = 'updating',
}

const disabledStates = [
  VerificationState.Complete,
  VerificationState.Minting,
  VerificationState.Updating,
];
const updatingStates = [VerificationState.Minting, VerificationState.Updating];

const ClaimPage = () => {
  const {classes, cx} = useStyles({});
  const [t] = useTranslationContext();
  const {enqueueSnackbar} = useSnackbar();
  const [verificationState, setVerificationState] = useState(
    VerificationState.EnterEmail,
  );
  const [domainUpdateButton, setDomainUpdateButton] = useState<React.ReactNode>(
    <></>,
  );
  const [accessToken, setAccessToken] = useSessionStorage<string | undefined>(
    'identityAccessToken',
    undefined,
  );
  const [identityDomain, setIdentityDomain] = useSessionStorage<
    string | undefined
  >('identityDomain', undefined);
  const [emailAddress, setEmailAddress] = useState<string>();
  const [oneTimeCode, setOneTimeCode] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!accessToken || !identityDomain) {
      return;
    }
    const decodedToken = jwtDecode(accessToken);
    if (decodedToken) {
      setEmailAddress(decodedToken.sub);
    }
  }, [accessToken, identityDomain]);

  useEffect(() => {
    if (!accessToken || !identityDomain || !emailAddress) {
      return;
    }
    const validateState = async () => {
      if (await isTokenValid(emailAddress, accessToken)) {
        // token is valid and can be used to manage identity
        setVerificationState(VerificationState.Complete);
        setIsSaving(false);
      } else {
        // clear state for invalid token
        handleLogout();
      }
    };
    void validateState();
  }, [accessToken, identityDomain, emailAddress]);

  useEffect(() => {
    if (errorMessage) {
      setIsSaving(false);
    }
  }, [errorMessage]);

  // build default wallet page SEO tags
  const seoTags = getSeoTags({
    title: t('claimIdentity.title'),
    description: t('claimIdentity.subTitle'),
  });

  const handleKeyDown: React.KeyboardEventHandler = event => {
    if (event.key === 'Enter') {
      void handleVerifyClicked();
    }
  };

  const handleInputChange = (id: string, value: string) => {
    setErrorMessage(undefined);
    setAccessToken(undefined);
    setIdentityDomain(undefined);
    if (id === 'identityValue') {
      setEmailAddress(value);
    } else if (id === 'otpValue') {
      setOneTimeCode(value);
    }
  };

  const handleCancel = () => {
    setEmailAddress(undefined);
    setOneTimeCode(undefined);
    setVerificationState(VerificationState.EnterEmail);
  };

  const handleLogout = () => {
    handleCancel();
    setIsSaving(false);
    setAccessToken(undefined);
    setIdentityDomain(undefined);
    setErrorMessage(t('claimIdentity.sessionExpired'));
  };

  const handleVerifyClicked = () => {
    if (!isEmailValid(emailAddress)) {
      setErrorMessage(t('wallet.invalidEmailAddress'));
      return;
    }

    // process the save operation
    setIsSaving(true);
    switch (verificationState) {
      case VerificationState.EnterEmail:
        void processEmailInput();
        return;
      case VerificationState.EnterOtp:
        void processVerifyOtp();
        return;
    }
  };

  const handleSaveIdentityClicked = async (records: Record<string, string>) => {
    if (!emailAddress || !accessToken || !identityDomain) {
      return;
    }

    // call the action to save the domain records, which will automatically determine
    // whether the domain should be minted or updated
    const saveResult = await saveIdentity(emailAddress, accessToken, records);
    if (!saveResult) {
      setErrorMessage(t('claimIdentity.saveRecordError'));
      setVerificationState(VerificationState.EnterOtp);
      return;
    }

    // call the success handler
    handleUpdateSuccess();

    // wait for changes to take effect
    while (true) {
      // wait 30 seconds and check domain status
      setVerificationState(
        saveResult.status === 'minting'
          ? VerificationState.Minting
          : VerificationState.Updating,
      );
      await sleep(30000);

      // check status of the identity domain and mint if necessary
      if (await isDomainReady(emailAddress, identityDomain, accessToken)) {
        setVerificationState(VerificationState.Complete);
        return;
      }
    }
  };

  const handleUpdateSuccess = () => {
    enqueueSnackbar(t('claimIdentity.updateSuccessful'), {variant: 'success'});
  };

  const processEmailInput = async () => {
    if (!emailAddress) {
      return;
    }

    // send a one time passcode and validate response
    const otpResult = await sendOneTimeCode(emailAddress, 'email');
    if (!otpResult) {
      setErrorMessage(t('claimIdentity.sendOtpError'));
      setIsSaving(false);
      return;
    }

    // set page state
    setVerificationState(VerificationState.EnterOtp);
    setIsSaving(false);
  };

  const processVerifyOtp = async () => {
    if (!emailAddress || !oneTimeCode) {
      return;
    }

    // validate the provided one-time code
    const jwtToken = await verifyOneTimeCode(
      emailAddress,
      'email',
      oneTimeCode,
    );
    if (!jwtToken) {
      setErrorMessage(t('claimIdentity.invalidOtp'));
      return;
    }

    // decode and validate the format of the JWT token
    try {
      const decodedToken = jwtDecode<{meta: Record<string, string>}>(jwtToken);
      if (!decodedToken?.meta.domain) {
        throw new Error('no domain in JWT claims');
      }

      // update page state with the JWT token and domain
      setAccessToken(jwtToken);
      setIdentityDomain(decodedToken.meta.domain);
    } catch (e) {
      setErrorMessage(t('claimIdentity.invalidOtp'));
      return;
    }
  };

  const isTokenValid = async (
    subject: string,
    token: string,
  ): Promise<boolean> => {
    const statusResponse = await getIdentity(subject, token);
    if (!statusResponse) {
      return false;
    }
    return true;
  };

  const isDomainReady = async (
    subject: string,
    domain: string,
    token: string,
  ): Promise<boolean> => {
    // request subject domain status
    const statusResponse = await getIdentity(subject, token);
    if (!statusResponse) {
      handleLogout();
      return false;
    }

    if (statusResponse?.status === 'ready') {
      const recordsResponse = await getProfileData(domain, [
        DomainFieldTypes.Records,
        DomainFieldTypes.CryptoVerifications,
      ]);
      if (!recordsResponse?.metadata?.pending) {
        return true;
      }
    }
    return false;
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
              {t('claimIdentity.title')}
            </Typography>
          </Grid>
          <Grid item xs={12} className={classes.item}>
            <Typography className={classes.sectionSubTitle}>
              {t('claimIdentity.subTitle')}
            </Typography>
          </Grid>
          <Grid item xs={12} className={classes.item}>
            <Box
              className={cx(
                classes.searchContainer,
                classes.walletContainer,
                classes.walletInfoContainer,
              )}
            >
              <Box mt={1} display="flex" alignItems="center">
                <Typography ml={1} variant="body1">
                  <Markdown>{t('claimIdentity.description')}</Markdown>
                </Typography>
              </Box>
              <Box display="flex" width="100%" mt={2} mb={2}>
                <ManageInput
                  id={
                    verificationState === VerificationState.EnterEmail
                      ? 'identityValue'
                      : 'otpValue'
                  }
                  value={
                    verificationState === VerificationState.EnterEmail
                      ? emailAddress
                      : oneTimeCode
                  }
                  label={
                    verificationState === VerificationState.EnterEmail
                      ? t('wallet.emailAddress')
                      : t('claimIdentity.oneTimeCode')
                  }
                  placeholder={
                    verificationState === VerificationState.EnterEmail
                      ? t('common.enterYourEmail')
                      : t('claimIdentity.enterOneTimeCode')
                  }
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  stacked={true}
                  disabled={
                    isSaving || disabledStates.includes(verificationState)
                  }
                  error={errorMessage !== undefined}
                  errorText={errorMessage}
                />
              </Box>
              <Box display="flex" flexDirection="column" width="100%">
                <LoadingButton
                  fullWidth
                  variant="contained"
                  className={classes.button}
                  onClick={handleVerifyClicked}
                  loading={isSaving}
                  disabled={disabledStates.includes(verificationState)}
                >
                  {verificationState === VerificationState.EnterEmail
                    ? t('claimIdentity.sendCode')
                    : t('claimIdentity.manage')}
                </LoadingButton>
              </Box>
            </Box>
            {verificationState === VerificationState.Complete &&
              identityDomain && (
                <Modal
                  onClose={handleCancel}
                  open={true}
                  titleStyle={classes.manageTitle}
                  title={
                    <Box
                      display="flex"
                      width="100%"
                      textAlign="center"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <WalletIcon className={classes.manageIcon} />
                      <Typography ml={1} variant="h5">
                        {emailAddress}
                      </Typography>
                    </Box>
                  }
                >
                  <Box className={cx(classes.manageContainer)}>
                    <Box className={classes.upperContainer}>
                      {emailAddress && (
                        <Typography variant="body2" mb={-1}>
                          <Markdown>
                            {t('claimIdentity.manageDescription', {
                              emailAddress,
                            })}
                          </Markdown>
                        </Typography>
                      )}
                      <Crypto
                        domain={identityDomain}
                        address={''}
                        setButtonComponent={setDomainUpdateButton}
                        filterFn={(k: string) => k.startsWith('crypto.')}
                        updateFn={handleSaveIdentityClicked}
                        onUpdate={handleUpdateSuccess}
                        hideHeader={true}
                      />
                    </Box>
                    <Box className={cx(classes.lowerContainer)}>
                      <Grid container>
                        <Grid item xs={12}>
                          {domainUpdateButton}
                        </Grid>
                      </Grid>
                    </Box>
                  </Box>
                </Modal>
              )}
            {updatingStates.includes(verificationState) && emailAddress && (
              <Modal
                titleStyle={classes.manageTitle}
                title={
                  <Box
                    display="flex"
                    width="100%"
                    textAlign="center"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <WalletIcon className={classes.manageIcon} />
                    <Typography ml={1} variant="h5">
                      {verificationState === VerificationState.Minting
                        ? t('claimIdentity.mintingTitle')
                        : t('claimIdentity.updatingTitle')}
                    </Typography>
                  </Box>
                }
                onClose={handleCancel}
                open={true}
              >
                <Box className={classes.loadingContainer}>
                  <Box mt={3}>
                    <CircularProgress />
                  </Box>
                  <Typography variant="body1" mt={3}>
                    <Markdown>
                      {t('claimIdentity.savingDescription', {
                        identity: emailAddress,
                      })}
                    </Markdown>
                  </Typography>
                </Box>
              </Modal>
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

export default ClaimPage;
