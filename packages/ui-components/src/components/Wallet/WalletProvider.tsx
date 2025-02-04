import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
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
  recoverToken,
  recoverTokenOtp,
  signIn,
  signInOtp,
} from '../../actions/fireBlocksActions';
import {
  createMpcCustodyWallet,
  getMpcCustodyWallet,
  getOnboardingStatus,
  getWalletPortfolio,
  syncIdentityConfig,
} from '../../actions/walletActions';
import {
  useDomainConfig,
  useFireblocksAccessToken,
  useWeb3Context,
} from '../../hooks';
import useFireblocksState from '../../hooks/useFireblocksState';
import type {SerializedWalletBalance} from '../../lib';
import {
  CustodyState,
  SessionLockError,
  disablePin,
  isEmailValid,
  loginWithAddress,
  useTranslationContext,
} from '../../lib';
import {notifyEvent} from '../../lib/error';
import {sleep} from '../../lib/sleep';
import type {TokenRefreshResponse} from '../../lib/types/fireBlocks';
import type {SerializedIdentityResponse} from '../../lib/types/identity';
import {isValidWalletPasswordFormat} from '../../lib/wallet/password';
import {
  getBootstrapState,
  saveBootstrapState,
  saveMpcCustodyState,
} from '../../lib/wallet/storage/state';
import {isEthAddress} from '../Chat/protocol/resolution';
import {localStorageWrapper} from '../Chat/storage';
import {DomainProfileTabType} from '../Manage/DomainProfile';
import ManageInput from '../Manage/common/ManageInput';
import type {ManageTabProps} from '../Manage/common/types';
import {Client, getMinClientHeight} from './Client';
import {OperationStatus} from './OperationStatus';
import type {WalletMode} from './index';

const EMAIL_PARAM = 'email';

const useStyles = makeStyles<{
  configState: WalletConfigState;
  mode: WalletMode;
  isMobile: boolean;
}>()((theme: Theme, {configState, mode, isMobile}) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight:
      configState === WalletConfigState.Complete && mode === 'portfolio'
        ? getMinClientHeight(isMobile)
        : undefined,
    height: '100%',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    height:
      configState === WalletConfigState.Complete && mode === 'portfolio'
        ? getMinClientHeight(isMobile, -125)
        : '100%',
    alignItems: 'center',
  },
  infoContainer: {
    marginBottom: theme.spacing(3),
    marginTop: theme.spacing(-2),
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

// one hour in milliseconds
const ONE_HOUR = 60 * 60 * 1000;

export enum WalletConfigState {
  OtpEntry = 'otpEntry',
  PasswordEntry = 'passwordEntry',
  Complete = 'complete',
  NeedsOnboarding = 'needsOnboarding',
  OnboardWithCustody = 'onboardWithCustody',
}

export const WalletProvider: React.FC<
  ManageTabProps & {
    mode?: WalletMode;
    emailAddress?: string;
    recoveryPhrase?: string;
    recoveryToken?: string;
    onError?: () => void;
    onLoaded?: (v: boolean) => void;
    onLoginInitiated?: (
      emailAddress: string,
      password: string,
      state: TokenRefreshResponse,
    ) => void;
    onClaimWallet?: () => void;
    setIsFetching?: (v?: boolean) => void;
    isHeaderClicked: boolean;
    setIsHeaderClicked?: (v: boolean) => void;
    setAuthAddress?: (v: string) => void;
    initialState?: WalletConfigState;
    initialLoginState?: TokenRefreshResponse;
    fullScreenModals?: boolean;
    forceRememberOnDevice?: boolean;
    loginClicked?: boolean;
  }
> = ({
  onUpdate,
  onError,
  onLoaded,
  onLoginInitiated,
  onClaimWallet,
  setButtonComponent,
  setIsFetching,
  setAuthAddress,
  isHeaderClicked,
  setIsHeaderClicked,
  mode = 'basic',
  fullScreenModals,
  forceRememberOnDevice = false,
  emailAddress: initialEmailAddress,
  recoveryPhrase: initialRecoveryPhrase,
  recoveryToken,
  initialState,
  initialLoginState,
  loginClicked,
}) => {
  // component state variables
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const {data: featureFlags} = useFeatureFlags();
  const {setShowSuccessAnimation} = useDomainConfig();
  const [isWalletLoading, setIsWalletLoading] = useState(false);
  const [isWalletLoaded, setIsWalletLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [configState, setConfigState] = useState(
    initialState || WalletConfigState.PasswordEntry,
  );
  const [errorMessage, setErrorMessage] = useState<string>();
  const {enqueueSnackbar} = useSnackbar();

  // wallet key management state
  const [persistKeys, setPersistKeys] = useState(forceRememberOnDevice);
  const [state, saveState] = useFireblocksState(persistKeys);
  const getAccessToken = useFireblocksAccessToken();

  // wallet in custody state
  const [custodySecret, setCustodySecret] = useState<string>();
  const [custodyUpdateMs, setCustodyUpdateMs] = useState<number>();

  // wallet recovery state variables
  const {accessToken, setAccessToken, showPinCta} = useWeb3Context();
  const [loginState, setLoginState] = useState(initialLoginState);
  const [oneTimeCode, setOneTimeCode] = useState<string>();
  const [recoveryPhrase, setRecoveryPhrase] = useState(initialRecoveryPhrase);
  const [recoveryPhraseConfirmation, setRecoveryPhraseConfirmation] = useState(
    initialRecoveryPhrase,
  );
  const [emailAddress, setEmailAddress] = useState(initialEmailAddress);
  const [paymentConfigStatus, setPaymentConfigStatus] =
    useState<SerializedIdentityResponse>();
  const [mpcWallets, setMpcWallets] = useState<SerializedWalletBalance[]>([]);

  // style and translation
  const {classes} = useStyles({configState, mode, isMobile});
  const [t] = useTranslationContext();

  useEffect(() => {
    setIsWalletLoaded(false);
    setButtonComponent(<Box className={classes.continueActionContainer} />);
    void loadFromState();
  }, [showPinCta]);

  useEffect(() => {
    if (recoveryToken || emailAddress) {
      if (!accessToken && !custodySecret) {
        setConfigState(WalletConfigState.PasswordEntry);
      }
    }
  }, [accessToken, custodySecret, recoveryToken, emailAddress]);

  useEffect(() => {
    if (!router?.query) {
      return;
    }

    // select email address if specified in parameter
    if (
      router.query[EMAIL_PARAM] &&
      typeof router.query[EMAIL_PARAM] === 'string'
    ) {
      setEmailAddress(router.query[EMAIL_PARAM]);
    }
  }, [router?.query]);

  useEffect(() => {
    if (!errorMessage || !onError) {
      return;
    }
    onError();
  }, [errorMessage]);

  useEffect(() => {
    if (
      // require completed state
      configState === WalletConfigState.Complete &&
      // require either the access token or custody secret
      (accessToken || custodySecret)
    ) {
      // update state
      if (accessToken) {
        onUpdate(DomainProfileTabType.Wallet, {accessToken});
      }
      setIsWalletLoaded(false);

      // retrieve the MPC wallets on page load
      void loadMpcWallets();
    }
  }, [configState, accessToken, custodySecret]);

  useEffect(() => {
    if (!loginClicked) {
      return;
    }
    if (configState !== WalletConfigState.OnboardWithCustody) {
      return;
    }
    void handleSave();
  }, [loginClicked, configState]);

  useEffect(() => {
    if (!custodyUpdateMs) {
      return;
    }
    void handleRefresh(false);
  }, [custodyUpdateMs]);

  useEffect(() => {
    if (!isWalletLoaded) {
      return;
    }
    if ([WalletConfigState.Complete].includes(configState)) {
      setButtonComponent(<Box className={classes.continueActionContainer} />);
      return;
    }

    // validate whether the save button should be enabled
    const isRecoveryConfirmed = recoveryToken
      ? recoveryPhrase === recoveryPhraseConfirmation
      : true;
    const isSaveEnabled =
      configState === WalletConfigState.NeedsOnboarding ||
      configState === WalletConfigState.OnboardWithCustody ||
      (configState === WalletConfigState.PasswordEntry
        ? isDirty &&
          (emailAddress || recoveryToken) &&
          recoveryPhrase &&
          !errorMessage &&
          isRecoveryConfirmed
        : isDirty && !errorMessage && isRecoveryConfirmed);

    setButtonComponent(
      <Box className={classes.continueActionContainer}>
        <LoadingButton
          variant="contained"
          onClick={handleSave}
          loading={isSaving}
          disabled={!isSaveEnabled}
          fullWidth
        >
          {errorMessage
            ? errorMessage
            : configState === WalletConfigState.NeedsOnboarding
            ? t('wallet.createWallet')
            : configState === WalletConfigState.PasswordEntry
            ? recoveryToken
              ? t('common.continue')
              : t('wallet.beginSetup')
            : configState === WalletConfigState.OtpEntry
            ? t('wallet.completeSetup')
            : configState === WalletConfigState.OnboardWithCustody &&
              t('wallet.createWallet')}
        </LoadingButton>
        {[
          WalletConfigState.OtpEntry,
          WalletConfigState.NeedsOnboarding,
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
        {!recoveryToken &&
          [
            WalletConfigState.PasswordEntry,
            WalletConfigState.OnboardWithCustody,
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
      </Box>,
    );
  }, [
    isSaving,
    isDirty,
    configState,
    oneTimeCode,
    emailAddress,
    recoveryPhrase,
    recoveryPhraseConfirmation,
    recoveryToken,
    errorMessage,
    isWalletLoaded,
    persistKeys,
  ]);

  const loadMpcWallets = async (
    forceRefresh?: boolean,
    showSpinner?: boolean,
    fields?: string[],
  ) => {
    try {
      setIsWalletLoading(true);
      if (accessToken) {
        await loadSelfCustodyWallets(forceRefresh, showSpinner, fields);
      } else if (custodySecret) {
        try {
          await loadCustodyWallets(forceRefresh, showSpinner, fields);
        } finally {
          setIsSaving(false);
          setIsWalletLoaded(true);
          if (setIsFetching) {
            setIsFetching(false);
          }
          if (onLoaded) {
            onLoaded(true);
          }
        }
      }
    } finally {
      setIsWalletLoading(false);
    }
  };

  const loadSelfCustodyWallets = async (
    forceRefresh?: boolean,
    showSpinner?: boolean,
    fields: string[] = ['native', 'price', 'token'],
  ) => {
    if (!accessToken) {
      return;
    }

    // retrieve the accounts associated with the access token
    const bootstrapState = getBootstrapState(state);
    if (!bootstrapState) {
      return;
    }

    // set fetching flag if provided
    if (setIsFetching && showSpinner) {
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

    // wallets may be loaded into cached local storage for up to
    // an hour, to improve loading UX
    const walletCachePrefix = 'portfolio-state';
    const walletCacheExpiry = await localStorageWrapper.getItem(
      `${walletCachePrefix}-expiry`,
    );
    const walletCacheData = forceRefresh
      ? undefined
      : await localStorageWrapper.getItem(`${walletCachePrefix}-data`);
    const walletCacheValid =
      walletCacheData &&
      walletCacheExpiry &&
      Date.now() < parseInt(walletCacheExpiry, 10);
    const wallets: SerializedWalletBalance[] = walletCacheValid
      ? JSON.parse(walletCacheData)
      : [];

    // load any required data depending on feature flags and cache
    const [paymentConfig] = await Promise.all([
      // load payment configuration if feature enabled
      accountAddresses.length > 0 &&
      featureFlags?.variations?.profileServiceEnableWalletIdentity
        ? syncIdentityConfig(accountAddresses[0], accessToken)
        : undefined,
      // load wallet portfolio if required
      forceRefresh || wallets.length === 0
        ? Bluebird.map(accountAddresses, async address => {
            const addressPortfolio = await getWalletPortfolio(
              address,
              accessToken,
              fields,
              true,
            );
            if (!addressPortfolio) {
              const existingWallet = mpcWallets.find(
                w => w.address.toLowerCase() === address.toLowerCase(),
              );
              if (!existingWallet) {
                missingAddresses.push(address);
              }
              return;
            }
            wallets.push(
              ...addressPortfolio.filter(p =>
                accountChains.includes(p.symbol.toLowerCase()),
              ),
            );
          })
        : undefined,
    ]);

    // set payment config status
    setPaymentConfigStatus(paymentConfig);

    // show error message if any wallet data is missing
    if (missingAddresses.length > 0 && mpcWallets.length > 0) {
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
    setIsWalletLoaded(true);

    // store rendered wallets in session memory
    await localStorageWrapper.setItem(
      `${walletCachePrefix}-data`,
      JSON.stringify(wallets),
    );
    await localStorageWrapper.setItem(
      `${walletCachePrefix}-expiry`,
      String(Date.now() + ONE_HOUR),
    );

    // set loaded flag if provided
    if (onLoaded) {
      onLoaded(true);
    }

    // clear fetching flag if provided
    if (setIsFetching) {
      setIsFetching(false);
    }

    // set authenticated address if applicable
    if (setAuthAddress && isWalletLoaded) {
      const accountAddress = accountAddresses.find(v => isEthAddress(v));
      if (accountAddress) {
        setAuthAddress(accountAddress);
      }
    }

    // if data was retrieved from cache, call an async force refresh to ensure new
    // portfolio data is shown soon
    if (walletCacheValid) {
      void loadSelfCustodyWallets(true);
    }
  };

  const loadCustodyWallets = async (
    forceRefresh?: boolean,
    showSpinner?: boolean,
    fields: string[] = ['native', 'price', 'token'],
  ) => {
    if (!custodySecret) {
      return;
    }

    // set fetching flag if provided
    if (setIsFetching && showSpinner) {
      setIsFetching(true);
    }

    // retrieve the accounts associated with the custody wallet
    const bootstrapState = getBootstrapState(state);
    if (
      !bootstrapState?.custodyState?.addresses ||
      Object.keys(bootstrapState.custodyState.addresses).length <
        config.WALLETS.CHAINS.SEND.length
    ) {
      // bootstrap state required
      if (!bootstrapState) {
        return;
      }

      // retrieve latest custody state since address list is not
      // yet completed
      const wallet = await getMpcCustodyWallet(custodySecret);
      if (!wallet) {
        return;
      }
      bootstrapState.custodyState = wallet;
      await saveMpcCustodyState(state, saveState, wallet, custodySecret);

      // check addresses again after retrieving latest status
      if (!bootstrapState?.custodyState?.addresses) {
        return;
      }
    }

    // query addresses belonging to accounts
    const accountChains = Object.keys(
      bootstrapState.custodyState.addresses,
    ).map(k => k.toLowerCase());

    // retrieve portfolio data for each asset
    const missingAddresses: string[] = [];
    const accountAddresses = [
      ...new Set(Object.values(bootstrapState.custodyState.addresses)),
    ];

    // wallets may be loaded into cached local storage for up to
    // an hour, to improve loading UX
    const walletCachePrefix = 'portfolio-state';
    const walletCacheExpiry = await localStorageWrapper.getItem(
      `${walletCachePrefix}-expiry`,
    );
    const walletCacheData = forceRefresh
      ? undefined
      : await localStorageWrapper.getItem(`${walletCachePrefix}-data`);
    const walletCacheValid =
      walletCacheData &&
      walletCacheExpiry &&
      Date.now() < parseInt(walletCacheExpiry, 10);
    const wallets: SerializedWalletBalance[] = walletCacheValid
      ? JSON.parse(walletCacheData)
      : [];

    // load any required data depending on feature flags and cache
    if (forceRefresh || wallets.length === 0) {
      await Bluebird.map(accountAddresses, async address => {
        const addressPortfolio = await getWalletPortfolio(
          address,
          custodySecret,
          fields,
          true,
        );
        if (!addressPortfolio) {
          const existingWallet = mpcWallets.find(
            w => w.address.toLowerCase() === address.toLowerCase(),
          );
          if (!existingWallet) {
            missingAddresses.push(address);
          }
          return;
        }
        wallets.push(
          ...addressPortfolio.filter(p =>
            accountChains.includes(p.symbol.toLowerCase()),
          ),
        );
      });
    }

    // set authenticated address if applicable
    if (setAuthAddress) {
      const accountAddress = accountAddresses.find(v => isEthAddress(v));
      if (accountAddress) {
        setAuthAddress(accountAddress);
      }
    }

    // show error message if any wallet data is missing
    if (missingAddresses.length > 0 && mpcWallets.length > 0) {
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
    setIsWalletLoaded(true);

    // store rendered wallets in session memory
    await localStorageWrapper.setItem(
      `${walletCachePrefix}-data`,
      JSON.stringify(wallets),
    );
    await localStorageWrapper.setItem(
      `${walletCachePrefix}-expiry`,
      String(Date.now() + ONE_HOUR),
    );

    // set loaded flag if provided
    if (onLoaded) {
      onLoaded(true);
    }

    // clear fetching flag if provided
    if (setIsFetching) {
      setIsFetching(false);
    }

    // if data was retrieved from cache, call an async force refresh to ensure new
    // portfolio data is shown soon
    if (walletCacheValid) {
      void loadCustodyWallets(true);
    }
  };

  const loadFromState = async () => {
    try {
      // place the component into confirmation mode if an initial email
      // address and password are provided
      if (initialEmailAddress && initialRecoveryPhrase) {
        // if an account exists, set state to login confirmation. Otherwise, set
        // state to account create confirmation.
        const onboardingStatus = await getOnboardingStatus(initialEmailAddress);
        if (onboardingStatus?.active) {
          setConfigState(WalletConfigState.OtpEntry);
        }
        return;
      }

      // retrieve existing state from session or local storage if available
      const existingState = getBootstrapState(state);
      if (!existingState) {
        await handleLogout();
        return;
      }

      // check for claiming state and sign the user out
      if (existingState.custodyState?.state === CustodyState.CLAIMING) {
        await handleLogout();
        return;
      }

      // check for custody state and the availability of custody secret
      if (
        existingState.custodyState?.state === CustodyState.CUSTODY &&
        existingState.custodyState?.secret
      ) {
        setCustodySecret(existingState.custodyState.secret);
        setConfigState(WalletConfigState.Complete);
        return;
      }

      // after retrieving the unverified state, assume that configuration
      // will complete successfully
      setConfigState(WalletConfigState.Complete);

      // no more work to do if access token available
      if (accessToken) {
        return;
      }

      // retrieve a new access token
      try {
        const newAccessToken = await getAccessToken();
        if (newAccessToken) {
          setAccessToken(newAccessToken);
          return;
        }
      } catch (e) {
        if (e instanceof SessionLockError) {
          return;
        }
        notifyEvent(e, 'warning', 'Wallet', 'Authorization', {
          msg: 'unable to retrieve access token',
        });
      }

      // unable to retrieve access token, so revert back to configuration
      // state before returning
      await handleLogout();
    } finally {
      setIsWalletLoaded(true);
    }
  };

  const handleInputChange = (id: string, value: string) => {
    setIsDirty(true);
    setErrorMessage(undefined);
    if (id === 'recoveryPhrase') {
      setRecoveryPhrase(value);
    } else if (id === 'recoveryPhraseConfirmation') {
      setRecoveryPhraseConfirmation(value);
    } else if (id === 'oneTimeCode') {
      setOneTimeCode(value);
    } else if (id === 'emailAddress') {
      setEmailAddress(value);
    }
  };

  const handleRefresh = async (showSpinner?: boolean, fields?: string[]) => {
    await loadMpcWallets(true, showSpinner, fields);
  };

  const handleBack = () => {
    // clear input variables
    setOneTimeCode(undefined);
    setIsDirty(true);
    setErrorMessage(undefined);
    setConfigState(WalletConfigState.PasswordEntry);
  };

  const handleNeedWallet = () => {
    setErrorMessage(undefined);
    setConfigState(WalletConfigState.OnboardWithCustody);
  };

  const handleLogout = async () => {
    // clear input variables
    setOneTimeCode(undefined);
    setPersistKeys(forceRememberOnDevice);
    setEmailAddress(undefined);
    setRecoveryPhrase(undefined);
    setRecoveryPhraseConfirmation(undefined);

    // clear authenticated address if necessary
    if (setAuthAddress) {
      setAuthAddress('');
    }

    // disable session lock
    await disablePin();

    // clear all storage state
    await saveState({});

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
      // switch to onboarding mode
      processNeedsOnboarding();
    } else if (configState === WalletConfigState.OnboardWithCustody) {
      // submit new wallet request
      await processOnboardWithCustody();
    } else if (configState === WalletConfigState.OtpEntry) {
      // submit the one time code
      await processOtp();
    } else if (configState === WalletConfigState.PasswordEntry) {
      // submit sign in request
      await processPasswordEntry();
    }

    // saving complete
    setIsSaving(false);
  };

  const handlePersistChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPersistKeys(event.target.checked);
    setIsDirty(true);
  };

  const processOnboardWithCustody = async () => {
    // message successfully sent
    setErrorMessage(undefined);

    // request to create the wallet
    let custodyWallet = await createMpcCustodyWallet();
    if (!custodyWallet?.secret) {
      setErrorMessage(t('wallet.errorCreatingWallet'));
      return;
    }

    // persist the secret so that it can be retrieved on a subsequent
    // page load from local storage
    const walletSecret = custodyWallet.secret;
    await saveMpcCustodyState(state, saveState, custodyWallet, walletSecret);
    setCustodySecret(walletSecret);

    // move the state to completed now that a valid custody secret is available,
    // even though the wallet configuration will continue to load in background.
    // This gives the perception of responsive UX.
    setConfigState(WalletConfigState.Complete);

    // show the confetti
    setShowSuccessAnimation(true);

    // wait for wallet creation to complete
    while (true) {
      // retrieve the latest custody wallet state
      custodyWallet = await getMpcCustodyWallet(walletSecret);

      // process the wallet if addresses are detected
      if (custodyWallet?.addresses) {
        // update the storage state with new addresses
        await saveMpcCustodyState(
          state,
          saveState,
          custodyWallet,
          walletSecret,
        );

        // force a wallet refresh for the client to ensure it has the latest set
        // of data for the UX
        setCustodyUpdateMs(Date.now());
      }

      // stop processing once status is complete
      if (custodyWallet?.status === 'COMPLETED') {
        break;
      }

      // continue waiting for completed state
      await sleep(1000);
    }

    // reset the confetti
    setShowSuccessAnimation(false);
  };

  const processNeedsOnboarding = () => {
    setConfigState(WalletConfigState.OnboardWithCustody);
  };

  const processPasswordEntry = async () => {
    // validate recovery phrase
    if (!recoveryPhrase) {
      setErrorMessage(t('common.enterValidPassword'));
      return;
    }

    // validate the email address unless in recovery mode
    if (!recoverToken) {
      if (!emailAddress || !isEmailValid(emailAddress)) {
        setErrorMessage(t('common.enterValidEmail'));
        return;
      }
    }

    // validate password strength
    if (recoveryToken) {
      if (!isValidWalletPasswordFormat(recoveryPhrase)) {
        setErrorMessage(t('wallet.resetPasswordStrength'));
        return;
      }
    }

    // check onboarding status and send the OTP
    const [onboardStatus, tokenStatus] = await Promise.all([
      emailAddress ? getOnboardingStatus(emailAddress) : undefined,
      recoveryToken
        ? recoverToken(recoveryToken)
        : emailAddress
        ? signIn(emailAddress, recoveryPhrase)
        : undefined,
    ]);

    // validate onboarding status
    if (!onboardStatus && !recoveryToken) {
      setConfigState(WalletConfigState.NeedsOnboarding);
      return;
    }

    // validate the sign in status
    if (!tokenStatus?.accessToken || tokenStatus.message) {
      notifyEvent('sign in error', 'error', 'Wallet', 'Authorization', {
        meta: tokenStatus,
      });
      setErrorMessage(t('wallet.signInError'));
      return;
    }

    // raise event for login initiated if requested, which may be required
    // for state management in other parent components
    if (onLoginInitiated && emailAddress) {
      onLoginInitiated(emailAddress, recoveryPhrase, tokenStatus);
    }

    // collect 2FA code if necessary
    if (tokenStatus.status === 'READY') {
      // 2FA not required, which is not an expected state but
      // needs to be handled
      setAccessToken(tokenStatus.accessToken);
      setConfigState(WalletConfigState.Complete);
    } else if (
      tokenStatus.status === 'MFA_EMAIL_REQUIRED' ||
      tokenStatus.status === 'MFA_OTP_REQUIRED'
    ) {
      // 2FA required
      setLoginState(tokenStatus);
      setConfigState(WalletConfigState.OtpEntry);
    } else {
      // unexpected state, show an error to the user and log the details
      // for further analysis
      notifyEvent(
        'unexpected sign in state',
        'error',
        'Wallet',
        'Authorization',
        {
          meta: tokenStatus,
        },
      );
      setErrorMessage(t('wallet.signInError'));
    }
  };

  const processOtp = async () => {
    // one time code and recovery phrase are required
    if (!oneTimeCode || !recoveryPhrase || !loginState) {
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

    // verify the user provided OTP
    const otpResponse = recoveryToken
      ? await recoverTokenOtp(
          loginState.accessToken,
          loginState.status === 'MFA_EMAIL_REQUIRED' ? 'EMAIL' : 'OTP',
          oneTimeCode,
          recoveryPhrase,
        )
      : await signInOtp(
          loginState.accessToken,
          loginState.status === 'MFA_EMAIL_REQUIRED' ? 'EMAIL' : 'OTP',
          oneTimeCode,
        );
    if (!otpResponse?.accessToken || !otpResponse?.refreshToken) {
      setErrorMessage(t('wallet.signInOtpError'));
      return;
    }

    // store the wallet service JWT tokens at desired persistence level
    const bootstrapState = await saveBootstrapState(
      {
        assets: [],
        userName: emailAddress,
        bootstrapToken: loginState.accessToken,
        refreshToken: otpResponse.refreshToken,
        custodyState: {
          state: CustodyState.SELF_CUSTODY,
          status: 'COMPLETED',
        },
      },
      state,
      saveState,
      otpResponse.accessToken,
    );

    // set local storage values if a MATIC address is available
    const primaryAddress = bootstrapState.assets.find(
      v => v.blockchainAsset.symbol === 'MATIC',
    )?.address;
    if (primaryAddress) {
      await loginWithAddress(primaryAddress);
    }

    // set component state
    setAccessToken(otpResponse.accessToken);
    setConfigState(WalletConfigState.Complete);
  };

  // indicates the wallet is ready for user interaction
  const isReadyForUser =
    ![WalletConfigState.Complete].includes(configState) ||
    mode === 'basic' ||
    mpcWallets.length > 0 ||
    custodySecret;

  return (
    <Box className={classes.container}>
      {isWalletLoaded && isReadyForUser ? (
        configState === WalletConfigState.NeedsOnboarding && emailAddress ? (
          <Box>
            <Typography
              variant="body1"
              className={classes.infoContainer}
              component="div"
            >
              <Markdown>
                {t('wallet.onboardingMessage', {emailAddress})}
              </Markdown>
            </Typography>
          </Box>
        ) : [WalletConfigState.OtpEntry].includes(configState) && loginState ? (
          <Box>
            <Typography
              variant="body1"
              className={classes.infoContainer}
              component="div"
            >
              <Markdown>
                {loginState.status === 'MFA_EMAIL_REQUIRED'
                  ? t('wallet.oneTimeCodeEmailDescription', {
                      operation: recoveryToken
                        ? t('wallet.passwordReset')
                        : t('wallet.signIn'),
                      emailAddress:
                        emailAddress || t('common.yourEmailAddress'),
                    })
                  : loginState.status === 'MFA_OTP_REQUIRED'
                  ? t('wallet.oneTimeCodeTotpDescription', {
                      operation: recoveryToken
                        ? t('wallet.passwordReset')
                        : t('wallet.beginSetup'),
                    })
                  : t('wallet.oneTimeCodeGenericDescription', {
                      operation: recoveryToken
                        ? t('wallet.passwordReset')
                        : t('wallet.beginSetup'),
                    })}
              </Markdown>
            </Typography>
            <ManageInput
              mt={2}
              id="oneTimeCode"
              value={oneTimeCode}
              autoComplete="one-time-code"
              label={t('wallet.oneTimeCode')}
              placeholder={t('wallet.enterOneTimeCode')}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              stacked={true}
              disabled={isSaving}
            />
            {configState === WalletConfigState.OtpEntry &&
              !forceRememberOnDevice && (
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
                              oneTimeCode && oneTimeCode.length > 0 && !isSaving
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
            WalletConfigState.OnboardWithCustody,
          ].includes(configState) ? (
          <Box>
            <Typography
              variant="body1"
              className={classes.infoContainer}
              component="div"
            >
              <Markdown>
                {configState === WalletConfigState.OnboardWithCustody
                  ? t('wallet.onboardWithCustodyDescription')
                  : recoveryToken
                  ? t('wallet.resetPasswordDescription')
                  : t('wallet.recoveryPhraseDescription')}
              </Markdown>
            </Typography>
            {configState !== WalletConfigState.OnboardWithCustody ? (
              <Box mt={5}>
                <form>
                  {(!initialEmailAddress || initialRecoveryPhrase) &&
                    !recoveryToken && (
                      <ManageInput
                        mt={2}
                        id="emailAddress"
                        value={emailAddress}
                        autoComplete="username"
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
                    type={'password'}
                    autoComplete="current-password"
                    stacked={false}
                  />
                  {recoveryToken && (
                    <ManageInput
                      mt={2}
                      id="recoveryPhraseConfirmation"
                      value={recoveryPhraseConfirmation}
                      label={t('wallet.confirmRecoveryPhrase')}
                      placeholder={t('wallet.enterRecoveryPhraseConfirmation')}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      stacked={false}
                      type={'password'}
                      autoComplete="current-password"
                      disabled={isSaving}
                    />
                  )}
                </form>
              </Box>
            ) : (
              <Box mb={-3} />
            )}
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
            mode === 'portfolio' && (
              <Client
                wallets={mpcWallets}
                paymentConfigStatus={paymentConfigStatus}
                accessToken={accessToken}
                fullScreenModals={fullScreenModals}
                onRefresh={handleRefresh}
                onClaimWallet={onClaimWallet}
                isWalletLoading={isWalletLoading}
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
