import type {TEvent} from '@fireblocks/ncw-js-sdk';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import Bluebird from 'bluebird';
import Markdown from 'markdown-to-jsx';
import {useRouter} from 'next/router';
import {useSnackbar} from 'notistack';
import React, {useEffect, useState} from 'react';
import truncateMiddle from 'truncate-middle';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {useFeatureFlags} from '../../actions';
import {
  confirmAuthorizationTokenTx,
  getAccessToken,
  getAuthorizationTokenTx,
  getBootstrapToken,
  sendBootstrapCode,
  sendRecoveryEmail,
} from '../../actions/fireBlocksActions';
import {
  createWallet,
  createWalletOtp,
  getOnboardingStatus,
  getWalletPortfolio,
  syncIdentityConfig,
} from '../../actions/walletActions';
import {useWeb3Context} from '../../hooks';
import useFireblocksState from '../../hooks/useFireblocksState';
import type {SerializedWalletBalance} from '../../lib';
import {isEmailValid, loginWithAddress, useTranslationContext} from '../../lib';
import {notifyEvent} from '../../lib/error';
import {
  getFireBlocksClient,
  initializeClient,
  isClockDrift,
  signTransaction,
} from '../../lib/fireBlocks/client';
import {
  getBootstrapState,
  saveBootstrapState,
} from '../../lib/fireBlocks/storage/state';
import {sleep} from '../../lib/sleep';
import type {SerializedIdentityResponse} from '../../lib/types/identity';
import {isEthAddress} from '../Chat/protocol/resolution';
import {DomainProfileTabType} from '../Manage/DomainProfile';
import ManageInput from '../Manage/common/ManageInput';
import type {ManageTabProps} from '../Manage/common/types';
import {Client, MIN_CLIENT_HEIGHT} from './Client';
import InlineEducation from './InlineEducation';
import {OperationStatus} from './OperationStatus';
import type {WalletMode} from './index';

const EMAIL_PARAM = 'email';
const WALLET_PASSWORD_MIN_LENGTH = 12;
const WALLET_PASSWORD_MAX_LENGTH = 32;
const WALLET_PASSWORD_NUMBER_VALIDATION_REGEX = /\d/;
const WALLET_PASSWORD_SPECIAL_CHARACTER_VALIDATION_REGEX =
  /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;

const isValidWalletPasswordFormat = (password: string): boolean => {
  return (
    password.length >= WALLET_PASSWORD_MIN_LENGTH &&
    password.length < WALLET_PASSWORD_MAX_LENGTH &&
    WALLET_PASSWORD_NUMBER_VALIDATION_REGEX.test(password) &&
    WALLET_PASSWORD_SPECIAL_CHARACTER_VALIDATION_REGEX.test(password)
  );
};

const useStyles = makeStyles<{
  configState: WalletConfigState;
  mode: WalletMode;
}>()((theme: Theme, {configState, mode}) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight:
      configState === WalletConfigState.Complete && mode === 'portfolio'
        ? `${MIN_CLIENT_HEIGHT}px`
        : undefined,
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    height:
      configState === WalletConfigState.Complete && mode === 'portfolio'
        ? `${MIN_CLIENT_HEIGHT - 125}px`
        : undefined,
    alignItems: 'center',
  },
  infoContainer: {
    marginBottom: theme.spacing(3),
  },
  checkboxContainer: {
    marginTop: theme.spacing(3),
  },
  continueActionContainer: {
    marginTop: theme.spacing(3),
    width: '100%',
  },
  checkbox: {
    marginRight: theme.spacing(0),
    marginTop: theme.spacing(-1),
    alignSelf: 'flex-start',
  },
  iconConfigured: {
    color: theme.palette.success.main,
    width: '75px',
    height: '75px',
  },
  enableDescription: {
    color: theme.palette.neutralShades[600],
  },
  passwordIcon: {
    margin: theme.spacing(0.5),
  },
}));

export const Configuration: React.FC<
  ManageTabProps & {
    mode?: WalletMode;
    emailAddress?: string;
    recoveryToken?: string;
    onLoaded?: (v: boolean) => void;
    setIsFetching?: (v?: boolean) => void;
    isHeaderClicked: boolean;
    setIsHeaderClicked?: (v: boolean) => void;
    setAuthAddress?: (v: string) => void;
    initialState?: WalletConfigState;
  }
> = ({
  onUpdate,
  onLoaded,
  setButtonComponent,
  setIsFetching,
  setAuthAddress,
  isHeaderClicked,
  setIsHeaderClicked,
  mode = 'basic',
  emailAddress: initialEmailAddress,
  recoveryToken,
  initialState,
}) => {
  // component state variables
  const {query: params} = useRouter();
  const {data: featureFlags} = useFeatureFlags();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [savingMessage, setSavingMessage] = useState<string>();
  const [configState, setConfigState] = useState(
    initialState || WalletConfigState.PasswordEntry,
  );
  const [errorMessage, setErrorMessage] = useState<string>();
  const {enqueueSnackbar} = useSnackbar();

  // wallet key management state
  const [persistKeys, setPersistKeys] = useState(false);
  const [state, saveState] = useFireblocksState(persistKeys);
  const [progressPct, setProgressPct] = useState(0);

  // wallet recovery state variables
  const {accessToken, setAccessToken} = useWeb3Context();
  const [bootstrapCode, setBootstrapCode] = useState<string>();
  const [recoveryPhrase, setRecoveryPhrase] = useState<string>();
  const [recoveryPhraseConfirmation, setRecoveryPhraseConfirmation] =
    useState<string>();
  const [emailAddress, setEmailAddress] = useState(initialEmailAddress);
  const [paymentConfigStatus, setPaymentConfigStatus] =
    useState<SerializedIdentityResponse>();
  const [mpcWallets, setMpcWallets] = useState<SerializedWalletBalance[]>([]);

  // style and translation
  const {classes} = useStyles({configState, mode});
  const [t] = useTranslationContext();

  const isCreateWalletEnabled =
    featureFlags.variations?.profileServiceEnableWalletCreation === true;

  useEffect(() => {
    setIsLoaded(false);
    setButtonComponent(<></>);
    void loadFromState();
  }, []);

  useEffect(() => {
    // select email address if specified in parameter
    if (params[EMAIL_PARAM] && typeof params[EMAIL_PARAM] === 'string') {
      setEmailAddress(params[EMAIL_PARAM]);
    }
  }, [params]);

  useEffect(() => {
    if (configState === WalletConfigState.OnboardSuccess) {
      void waitForAccount();
    } else if (configState === WalletConfigState.Complete && accessToken) {
      // update state
      onUpdate(DomainProfileTabType.Wallet, {accessToken});
      setIsLoaded(false);

      // retrieve the MPC wallets on page load
      void loadMpcWallets();
    }
  }, [configState, accessToken]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }
    if (
      [WalletConfigState.Complete, WalletConfigState.OnboardSuccess].includes(
        configState,
      )
    ) {
      setButtonComponent(<></>);
      return;
    }

    // validate whether the save button should be enabled
    const isRecoveryConfirmed = recoveryToken
      ? recoveryPhrase === recoveryPhraseConfirmation
      : true;
    const isSaveEnabled =
      configState === WalletConfigState.NeedsOnboarding ||
      (configState === WalletConfigState.PasswordEntry ||
      configState === WalletConfigState.OnboardWithEmail
        ? isDirty &&
          emailAddress &&
          recoveryPhrase &&
          !errorMessage &&
          isRecoveryConfirmed
        : isDirty && !errorMessage && isRecoveryConfirmed);

    setButtonComponent(
      <Box className={classes.continueActionContainer}>
        {!isSaving && !errorMessage ? (
          <>
            <LoadingButton
              variant="contained"
              onClick={handleSave}
              loading={isSaving}
              loadingIndicator={
                savingMessage ? (
                  <Box display="flex" alignItems="center">
                    <CircularProgress color="inherit" size={16} />
                    <Box ml={1}>{savingMessage}</Box>
                  </Box>
                ) : undefined
              }
              disabled={!isSaveEnabled}
              fullWidth
            >
              {configState === WalletConfigState.NeedsOnboarding
                ? isCreateWalletEnabled
                  ? t('wallet.createWallet')
                  : t('common.learnMore')
                : configState === WalletConfigState.PasswordEntry
                ? t('wallet.beginSetup')
                : configState === WalletConfigState.OtpEntry
                ? t('wallet.completeSetup')
                : configState === WalletConfigState.OnboardWithEmail
                ? t('wallet.verifyEmail')
                : configState === WalletConfigState.OnboardConfirmation &&
                  t('wallet.createWallet')}
            </LoadingButton>
            {[
              WalletConfigState.OtpEntry,
              WalletConfigState.NeedsOnboarding,
              WalletConfigState.OnboardConfirmation,
            ].includes(configState) && (
              <Box mt={1}>
                <Button
                  onClick={handleBack}
                  variant="outlined"
                  disabled={isSaving}
                  fullWidth
                >
                  {t('common.back')}
                </Button>
              </Box>
            )}
            {isCreateWalletEnabled &&
              [
                WalletConfigState.PasswordEntry,
                WalletConfigState.OnboardWithEmail,
              ].includes(configState) && (
                <Box mt={1} display="flex" justifyContent="center" width="100%">
                  <Button
                    onClick={
                      configState === WalletConfigState.PasswordEntry
                        ? handleNeedWallet
                        : handleBack
                    }
                    disabled={isSaving}
                    variant="text"
                    size="small"
                  >
                    {configState === WalletConfigState.PasswordEntry
                      ? t('wallet.needWallet')
                      : t('wallet.alreadyHaveWallet')}
                  </Button>
                </Box>
              )}
          </>
        ) : (
          !errorMessage &&
          configState === WalletConfigState.OtpEntry && (
            <Box
              display="flex"
              flexDirection="column"
              justifyItems="center"
              width="100%"
            >
              <InlineEducation />
              <Box mt={2}>
                <LinearProgress variant="determinate" value={progressPct} />
              </Box>
            </Box>
          )
        )}
      </Box>,
    );
  }, [
    isSaving,
    isDirty,
    configState,
    savingMessage,
    bootstrapCode,
    emailAddress,
    recoveryPhrase,
    recoveryPhraseConfirmation,
    errorMessage,
    progressPct,
    isLoaded,
    persistKeys,
  ]);

  // trackProgress updates the progress bar and logs events for wallet setup
  const trackProgress = (startTime: number, progressValue: number) => {
    notifyEvent('setup elapsed time', 'info', 'Wallet', 'Configuration', {
      meta: {
        elapsedSeconds: (Date.now() - startTime) / 1000,
        progressPct: progressValue,
      },
    });
    setProgressPct(progressValue);
  };

  const waitForAccount = async () => {
    // verify an email and password were already provided
    if (!emailAddress || !recoveryPhrase) {
      return;
    }

    // clear the one-time code used for email verification
    setBootstrapCode(undefined);

    // wait for the account status to be ready and then request a new one time
    // code to automatically start the user's login process
    while (true) {
      const isOnboarded = await getOnboardingStatus(emailAddress);
      if (isOnboarded) {
        break;
      }
      await sleep(5000);
    }

    // request a one time code once the user account has been initialized
    await processPasswordEntry();
  };

  const loadMpcWallets = async () => {
    if (!accessToken) {
      return;
    }

    // retrieve the accounts associated with the access token
    const bootstrapState = getBootstrapState(state);
    if (!bootstrapState) {
      return;
    }

    // set fetching flag if provided
    if (setIsFetching) {
      setIsFetching(true);
    }

    // query addresses belonging to accounts
    const accountChains = [
      ...bootstrapState.assets?.map(a =>
        a.blockchainAsset.symbol.toLowerCase(),
      ),
      ...bootstrapState.assets?.map(a =>
        a.blockchainAsset.blockchain.id.toLowerCase(),
      ),
    ];

    // retrieve portfolio data for each asset
    const missingAddresses: string[] = [];
    const accountAddresses = [
      ...new Set(bootstrapState.assets?.map(a => a.address)),
    ];
    const wallets: SerializedWalletBalance[] = [];
    const [paymentConfig] = await Promise.all([
      accountAddresses.length > 0 &&
      featureFlags?.variations?.profileServiceEnableWalletIdentity
        ? syncIdentityConfig(accountAddresses[0], accessToken)
        : undefined,
      Bluebird.map(accountAddresses, async address => {
        const addressPortfolio = await getWalletPortfolio(
          address,
          accessToken,
          undefined,
          true,
        );
        if (!addressPortfolio) {
          missingAddresses.push(address);
          return;
        }
        wallets.push(
          ...addressPortfolio.filter(p =>
            accountChains.includes(p.symbol.toLowerCase()),
          ),
        );
      }),
    ]);

    // set authenticated address if applicable
    if (setAuthAddress && isLoaded) {
      const accountAddress = accountAddresses.find(v => isEthAddress(v));
      if (accountAddress) {
        setAuthAddress(accountAddress);
      }
    }

    // set payment config status
    setPaymentConfigStatus(paymentConfig);

    // show error message if any wallet data is missing
    if (missingAddresses.length > 0) {
      enqueueSnackbar(
        <Markdown>
          {t('wallet.loadingError', {
            address: missingAddresses
              .map(a => truncateMiddle(a, 4, 4, '...'))
              .join(', '),
          })}
        </Markdown>,
        {variant: 'error'},
      );
    }

    // display rendered wallets
    setMpcWallets(wallets.sort((a, b) => a.name.localeCompare(b.name)));
    setIsLoaded(true);

    // set loaded flag if provided
    if (onLoaded) {
      onLoaded(true);
    }

    // clear fetching flag if provided
    if (setIsFetching) {
      setIsFetching(false);
    }
  };

  const loadFromState = async () => {
    try {
      // retrieve existing state from session or local storage if available
      const existingState = getBootstrapState(state);
      if (!existingState) {
        return;
      }

      // after retrieving the unverified state, assume that configuration
      // will complete successfully
      setConfigState(WalletConfigState.Complete);

      // no more work to do if access token available
      if (accessToken) {
        return;
      }

      // check state for device ID and refresh token
      if (
        !accessToken &&
        existingState?.deviceId &&
        existingState?.refreshToken
      ) {
        const tokens = await getAccessToken(existingState.refreshToken, {
          deviceId: existingState.deviceId,
          state,
          saveState,
          setAccessToken,
        });
        if (tokens) {
          // successfully retrieved access token
          setAccessToken(tokens.accessToken);
          return;
        }
      }

      // unable to retrieve access token, so revert back to configuration
      // state before returning
      handleLogout();
    } finally {
      setIsLoaded(true);
    }
  };

  const handleInputChange = (id: string, value: string) => {
    setIsDirty(true);
    setErrorMessage(undefined);
    if (id === 'recoveryPhrase') {
      setRecoveryPhrase(value);
    } else if (id === 'recoveryPhraseConfirmation') {
      setRecoveryPhraseConfirmation(value);
    } else if (id === 'bootstrapCode') {
      setBootstrapCode(value);
    } else if (id === 'emailAddress') {
      setEmailAddress(value);
    }
  };

  const handleBack = () => {
    // clear input variables
    setBootstrapCode(undefined);
    setIsDirty(true);
    setErrorMessage(undefined);
    setConfigState(WalletConfigState.PasswordEntry);
  };

  const handleNeedWallet = () => {
    setErrorMessage(undefined);
    setConfigState(WalletConfigState.OnboardWithEmail);
  };

  const handleLogout = () => {
    // clear input variables
    setBootstrapCode(undefined);
    setPersistKeys(false);
    setEmailAddress(undefined);
    setRecoveryPhrase(undefined);
    setRecoveryPhraseConfirmation(undefined);

    // clear authenticated address if necessary
    if (setAuthAddress) {
      setAuthAddress('');
    }

    // clear all storage state
    saveState({});

    // reset configuration state
    setConfigState(WalletConfigState.PasswordEntry);
  };

  const handleKeyDown: React.KeyboardEventHandler = event => {
    if (event.key === 'Enter') {
      void handleSave();
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setIsDirty(false);

    if (configState === WalletConfigState.NeedsOnboarding) {
      processNeedsOnboarding();
    } else if (configState === WalletConfigState.OnboardWithEmail) {
      await processOnboardWithEmail();
    } else if (configState === WalletConfigState.OnboardConfirmation) {
      await processOnboardConfirmation();
    } else if (configState === WalletConfigState.OtpEntry) {
      // submit the bootstrap code
      await processBootstrapCode();
    } else if (configState === WalletConfigState.PasswordEntry) {
      // submit the recovery phrase
      await processPasswordEntry();
    }

    // saving complete
    setIsSaving(false);
    setSavingMessage(undefined);
  };

  const handlePersistChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPersistKeys(event.target.checked);
    setIsDirty(true);
  };

  const handleTryAgain = () => {
    setErrorMessage(undefined);
  };

  const processOnboardWithEmail = async () => {
    // validate recovery phrase
    if (!recoveryPhrase) {
      setErrorMessage(t('common.enterValidPassword'));
      return;
    }

    // validate the email address
    if (!emailAddress || !isEmailValid(emailAddress)) {
      setErrorMessage(t('common.enterValidEmail'));
      return;
    }

    // check for onboarding
    const isOnboarded = await getOnboardingStatus(emailAddress);
    if (isOnboarded) {
      setErrorMessage(t('wallet.alreadyExists'));
      return;
    }

    // validate the two password fields match
    if (recoveryPhrase !== recoveryPhraseConfirmation) {
      setErrorMessage(t('wallet.resetPasswordMismatch'));
      return;
    }

    // validate password strength
    if (!isValidWalletPasswordFormat(recoveryPhrase)) {
      setErrorMessage(t('wallet.resetPasswordStrength'));
      return;
    }

    // send the email verification
    const isSuccess = await createWalletOtp(emailAddress);
    if (!isSuccess) {
      setErrorMessage(t('wallet.alreadySentVerification', {emailAddress}));
      return;
    }

    // message successfully sent
    setErrorMessage(undefined);
    setConfigState(WalletConfigState.OnboardConfirmation);
  };

  const processOnboardConfirmation = async () => {
    if (!emailAddress || !bootstrapCode || !recoveryPhrase) {
      return;
    }

    // request to create the wallet
    const walletRequested = await createWallet(
      emailAddress,
      bootstrapCode,
      recoveryPhrase,
    );
    if (!walletRequested) {
      setErrorMessage(t('wallet.errorCreatingWallet'));
      return;
    }

    // saving is complete
    setConfigState(WalletConfigState.OnboardSuccess);
  };

  const processNeedsOnboarding = () => {
    if (isCreateWalletEnabled) {
      setConfigState(WalletConfigState.OnboardWithEmail);
    } else {
      window.open(config.WALLETS.LANDING_PAGE_URL, '_blank');
    }
  };

  const processPasswordEntry = async () => {
    // validate recovery phrase
    if (!recoveryPhrase) {
      setErrorMessage(t('common.enterValidPassword'));
      return;
    }

    // validate the email address
    if (!emailAddress || !isEmailValid(emailAddress)) {
      setErrorMessage(t('common.enterValidEmail'));
      return;
    }

    // validate password strength
    if (recoveryToken) {
      if (!isValidWalletPasswordFormat(recoveryPhrase)) {
        setErrorMessage(t('wallet.resetPasswordStrength'));
        return;
      }
    }

    // check for onboarding
    const onboardStatus = await getOnboardingStatus(emailAddress);
    if (!onboardStatus) {
      setConfigState(WalletConfigState.NeedsOnboarding);
      return;
    }

    // check system clock synchronization
    if (isClockDrift(onboardStatus.clock)) {
      setErrorMessage(
        t('wallet.clockDriftError', {
          deviceTime: new Date().toLocaleString(),
          expectedTime: new Date(onboardStatus.clock).toLocaleString(),
        }),
      );
      return;
    }

    // send the OTP
    const sendResult = await sendBootstrapCode(emailAddress);
    if (sendResult) {
      setConfigState(WalletConfigState.OtpEntry);
    } else {
      setErrorMessage(t('wallet.forgotBootstrapCodeError'));
    }
  };

  const processBootstrapCode = async () => {
    // bootstrap and recovery phrase code is required
    if (!bootstrapCode || !recoveryPhrase) {
      return;
    }

    // validate recovery phrase confirmation
    if (recoveryToken) {
      // validate the two password fields match
      if (recoveryPhrase !== recoveryPhraseConfirmation) {
        setErrorMessage(t('wallet.resetPasswordMismatch'));
        return;
      }

      // validate password strength
      if (!isValidWalletPasswordFormat(recoveryPhrase)) {
        setErrorMessage(t('wallet.resetPasswordStrength'));
        return;
      }
    }

    // indicates start time for progress tracking
    const startTime = Date.now();

    // retrieve a temporary JWT token using the code and validate the
    // response contains expected value format
    trackProgress(startTime, 0);
    setSavingMessage(t('wallet.configuringWallet'));
    const walletResponse = await getBootstrapToken(bootstrapCode);
    if (!walletResponse?.accessToken || !walletResponse.deviceId) {
      notifyEvent(
        new Error('invalid setup code'),
        'error',
        'Wallet',
        'Authorization',
      );
      setErrorMessage(t('wallet.invalidSetupCode'));
      return;
    }

    // store the JWT token and device ID in memory
    const bootstrapJwt = walletResponse?.accessToken;
    const deviceId = walletResponse?.deviceId;

    // retrieve and initialize the Fireblocks client
    trackProgress(startTime, 3);
    const fbClientForInit = await getFireBlocksClient(deviceId, bootstrapJwt, {
      state,
      saveState,
      onEventCallback: (e: TEvent) => {
        if (e.type === 'join_wallet_descriptor') {
          switch (e.joinWalletDescriptor.status) {
            case 'JOIN_INITIATED':
              trackProgress(startTime, 5);
              break;
            case 'ADD_DEVICE_SETUP_REQUESTED':
              trackProgress(startTime, 11);
              break;
          }
        }
        if (e.type === 'key_descriptor_changed') {
          switch (e.keyDescriptor.keyStatus) {
            case 'INITIATED':
              trackProgress(startTime, 24);
              break;
            case 'SETUP':
              trackProgress(startTime, 30);
              break;
            case 'SETUP_COMPLETE':
              trackProgress(startTime, 60);
              break;
            case 'READY':
              trackProgress(startTime, 65);
              break;
          }
        }
      },
    });
    const isInitialized = await initializeClient(fbClientForInit, {
      bootstrapJwt,
      recoveryPhrase,
      recoveryToken,
    });
    if (!isInitialized) {
      notifyEvent(
        new Error('error validating recovery phrase'),
        'error',
        'Wallet',
        'Authorization',
      );
      setErrorMessage(
        recoveryToken
          ? t('wallet.invalidResetAttempt')
          : t('wallet.invalidRecoveryAccount'),
      );
      return;
    }

    // retrieve a transaction ID from wallet service, and initialize a new client
    // instance with which to sign the transaction ID
    trackProgress(startTime, 70);
    const [tx, fbClientForTx] = await Promise.all([
      getAuthorizationTokenTx(bootstrapJwt),
      getFireBlocksClient(deviceId, bootstrapJwt, {
        state,
        saveState,
        onEventCallback: (e: TEvent) => {
          if (e.type === 'transaction_signature_changed') {
            switch (e.transactionSignature.transactionSignatureStatus) {
              case 'PENDING':
                trackProgress(startTime, 80);
                break;
              case 'STARTED':
                trackProgress(startTime, 85);
                break;
            }
          }
        },
      }),
    ]);
    if (!tx) {
      notifyEvent(
        new Error('error retrieving auth tx'),
        'error',
        'Wallet',
        'Authorization',
      );
      setErrorMessage(t('wallet.recoveryError'));
      return;
    }

    // sign the transaction ID with Fireblocks client
    trackProgress(startTime, 79);
    const txSignature = await signTransaction(fbClientForTx, tx.transactionId);
    if (!txSignature) {
      notifyEvent(
        new Error('error signing auth tx'),
        'error',
        'Wallet',
        'Authorization',
      );
      setErrorMessage(t('wallet.recoveryError'));
      return;
    }

    // retrieve the wallet service JWT tokens
    trackProgress(startTime, 90);
    const walletServiceTokens = await confirmAuthorizationTokenTx(bootstrapJwt);
    if (!walletServiceTokens) {
      notifyEvent(
        new Error('error retrieving auth tokens'),
        'error',
        'Wallet',
        'Authorization',
      );
      setErrorMessage(t('wallet.recoveryError'));
      return;
    }

    // if this is a recovery, also send a new recovery email
    if (recoveryToken) {
      trackProgress(startTime, 95);
      await sendRecoveryEmail(walletServiceTokens.accessToken, recoveryPhrase);
    }

    // store the wallet service JWT tokens at desired persistence level
    const bootstrapState = await saveBootstrapState(
      {
        assets: [],
        bootstrapToken: walletServiceTokens.bootstrapToken,
        refreshToken: walletServiceTokens.refreshToken,
        deviceId,
      },
      state,
      saveState,
      walletServiceTokens.accessToken,
    );

    // set local storage values if a MATIC address is available
    const primaryAddress = bootstrapState.assets.find(
      v => v.blockchainAsset.symbol === 'MATIC',
    )?.address;
    if (primaryAddress) {
      await loginWithAddress(primaryAddress);
    }

    // set component state
    trackProgress(startTime, 100);
    setAccessToken(walletServiceTokens.accessToken);
    setConfigState(WalletConfigState.Complete);
  };

  return (
    <Box className={classes.container}>
      {isLoaded &&
      (![WalletConfigState.Complete, WalletConfigState.OnboardSuccess].includes(
        configState,
      ) ||
        mode === 'basic' ||
        mpcWallets.length > 0) ? (
        isSaving || errorMessage ? (
          <Box mt={5} textAlign="center">
            <OperationStatus
              label={errorMessage || t('wallet.configuringWallet')}
              icon={<LockOutlinedIcon />}
              error={errorMessage !== undefined && errorMessage.length > 0}
            >
              {errorMessage && (
                <Button variant="text" onClick={handleTryAgain}>
                  {t('common.tryAgain')}
                </Button>
              )}
            </OperationStatus>
          </Box>
        ) : configState === WalletConfigState.NeedsOnboarding &&
          emailAddress ? (
          <Box>
            <Typography variant="body1" className={classes.infoContainer}>
              <Markdown>
                {t('wallet.onboardingMessage', {emailAddress})}
              </Markdown>
            </Typography>
          </Box>
        ) : [
            WalletConfigState.OtpEntry,
            WalletConfigState.OnboardConfirmation,
          ].includes(configState) && emailAddress ? (
          <Box>
            <Typography variant="body1" className={classes.infoContainer}>
              <Markdown>
                {configState === WalletConfigState.OnboardConfirmation
                  ? t('wallet.onboardConfirmationDescription', {emailAddress})
                  : recoveryToken
                  ? t('wallet.resetPasswordConfirmation', {emailAddress})
                  : t('wallet.bootstrapCodeDescription', {emailAddress})}
              </Markdown>
            </Typography>
            <ManageInput
              mt={2}
              id="bootstrapCode"
              value={bootstrapCode}
              label={t('wallet.bootstrapCode')}
              placeholder={t('wallet.enterBootstrapCode')}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              stacked={true}
              disabled={isSaving}
            />
            {configState === WalletConfigState.OtpEntry && (
              <Box className={classes.checkboxContainer}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        onChange={handlePersistChange}
                        className={classes.checkbox}
                        checked={persistKeys}
                        disabled={isSaving}
                      />
                    }
                    label={
                      <Box display="flex" flexDirection="column">
                        <Typography variant="body1">
                          {t('wallet.rememberOnThisDevice')}
                        </Typography>
                        <Typography
                          variant="caption"
                          className={
                            bootstrapCode &&
                            bootstrapCode.length > 0 &&
                            !isSaving
                              ? classes.enableDescription
                              : undefined
                          }
                        >
                          {t('wallet.rememberOnThisDeviceDescription')}
                        </Typography>
                      </Box>
                    }
                  />
                </FormGroup>
              </Box>
            )}
          </Box>
        ) : [
            WalletConfigState.PasswordEntry,
            WalletConfigState.OnboardWithEmail,
          ].includes(configState) ? (
          <Box>
            <Typography variant="body1" className={classes.infoContainer}>
              <Markdown>
                {configState === WalletConfigState.OnboardWithEmail
                  ? t('wallet.onboardWithEmailDescription')
                  : recoveryToken
                  ? t('wallet.resetPasswordDescription')
                  : t('wallet.recoveryPhraseDescription')}
              </Markdown>
            </Typography>
            <Box mt={5}>
              {!initialEmailAddress && (
                <ManageInput
                  mt={2}
                  id="emailAddress"
                  value={emailAddress}
                  label={t('wallet.emailAddress')}
                  placeholder={t('common.enterYourEmail')}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  stacked={false}
                  disabled={isSaving}
                />
              )}
              <ManageInput
                mt={2}
                id="recoveryPhrase"
                value={recoveryPhrase}
                label={
                  recoveryToken
                    ? t('wallet.resetPassword')
                    : t('wallet.recoveryPhrase')
                }
                placeholder={
                  recoveryToken
                    ? t('wallet.enterResetPassword')
                    : t('wallet.enterRecoveryPhrase')
                }
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={isSaving}
                type={passwordVisible ? undefined : 'password'}
                endAdornment={
                  <IconButton
                    className={classes.passwordIcon}
                    onClick={() => {
                      setPasswordVisible(!passwordVisible);
                    }}
                  >
                    {passwordVisible ? (
                      <Tooltip title={t('common.passwordHide')}>
                        <VisibilityOffOutlinedIcon />
                      </Tooltip>
                    ) : (
                      <Tooltip title={t('common.passwordShow')}>
                        <VisibilityOutlinedIcon />
                      </Tooltip>
                    )}
                  </IconButton>
                }
                stacked={false}
              />
              {(recoveryToken ||
                configState === WalletConfigState.OnboardWithEmail) && (
                <ManageInput
                  mt={2}
                  id="recoveryPhraseConfirmation"
                  value={recoveryPhraseConfirmation}
                  label={t('wallet.confirmRecoveryPhrase')}
                  placeholder={t('wallet.enterRecoveryPhraseConfirmation')}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  stacked={false}
                  type={passwordVisible ? undefined : 'password'}
                  disabled={isSaving}
                  endAdornment={
                    <IconButton
                      className={classes.passwordIcon}
                      onClick={() => {
                        setPasswordVisible(!passwordVisible);
                      }}
                    >
                      {passwordVisible ? (
                        <Tooltip title={t('common.passwordHide')}>
                          <VisibilityOffOutlinedIcon />
                        </Tooltip>
                      ) : (
                        <Tooltip title={t('common.passwordShow')}>
                          <VisibilityOutlinedIcon />
                        </Tooltip>
                      )}
                    </IconButton>
                  }
                />
              )}
            </Box>
          </Box>
        ) : configState === WalletConfigState.OnboardSuccess ? (
          <Box mt={5}>
            <OperationStatus
              icon={<LockOutlinedIcon />}
              label={t('wallet.onboardSuccessTitle')}
            >
              <Box mt={3} display="flex" textAlign="center">
                <Typography variant="body1">
                  <Markdown>
                    {t('wallet.onboardSuccessDescription', {
                      emailAddress: emailAddress!,
                    })}
                  </Markdown>
                </Typography>
              </Box>
            </OperationStatus>
          </Box>
        ) : (
          configState === WalletConfigState.Complete &&
          (mode === 'basic' ? (
            <Box mt={5}>
              <OperationStatus label={t('manage.allSet')} success={true}>
                <Box mb={3} display="flex" textAlign="center">
                  <Typography variant="body1">
                    {t('wallet.successDescription')}
                  </Typography>
                </Box>
                <Button variant="outlined" onClick={handleLogout}>
                  {t('header.signOut')}
                </Button>
              </OperationStatus>
            </Box>
          ) : (
            mode === 'portfolio' &&
            accessToken && (
              <Client
                wallets={mpcWallets}
                paymentConfigStatus={paymentConfigStatus}
                accessToken={accessToken}
                onRefresh={loadMpcWallets}
                isHeaderClicked={isHeaderClicked}
                setIsHeaderClicked={setIsHeaderClicked}
              />
            )
          ))
        )
      ) : (
        <Box className={classes.loadingContainer}>
          <OperationStatus
            icon={<LockOutlinedIcon />}
            label={t('wallet.loadingWallet')}
          />
        </Box>
      )}
    </Box>
  );
};

export enum WalletConfigState {
  OtpEntry = 'otpEntry',
  PasswordEntry = 'passwordEntry',
  Complete = 'complete',
  NeedsOnboarding = 'needsOnboarding',
  OnboardWithEmail = 'onboardWithEmail',
  OnboardConfirmation = 'onboardConfirmation',
  OnboardSuccess = 'onboardSuccess',
}
