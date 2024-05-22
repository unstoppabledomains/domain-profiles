import type {TEvent} from '@fireblocks/ncw-js-sdk';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import Bluebird from 'bluebird';
import Markdown from 'markdown-to-jsx';
import React, {useEffect, useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {
  confirmAuthorizationTokenTx,
  getAccessToken,
  getAuthorizationTokenTx,
  getBootstrapToken,
  sendBootstrapCode,
} from '../../actions/fireBlocksActions';
import {getWalletPortfolio} from '../../actions/walletActions';
import {useWeb3Context} from '../../hooks';
import useFireblocksState from '../../hooks/useFireblocksState';
import type {SerializedWalletBalance} from '../../lib';
import {useTranslationContext} from '../../lib';
import {notifyEvent} from '../../lib/error';
import {
  getFireBlocksClient,
  initializeClient,
  signTransaction,
} from '../../lib/fireBlocks/client';
import {
  getBootstrapState,
  saveBootstrapState,
} from '../../lib/fireBlocks/storage/state';
import {DomainProfileTabType} from '../Manage/DomainProfile';
import ManageInput from '../Manage/common/ManageInput';
import type {ManageTabProps} from '../Manage/common/types';
import {Client, MIN_CLIENT_HEIGHT} from './Client';
import InlineEducation from './InlineEducation';
import {OperationStatus} from './OperationStatus';
import type {WalletMode} from './index';

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
}));

enum WalletConfigState {
  OtpEntry = 'otpEntry',
  PasswordEntry = 'passwordEntry',
  Complete = 'complete',
}

export const Configuration: React.FC<
  ManageTabProps & {
    mode?: WalletMode;
    onLoaded?: (v: boolean) => void;
  }
> = ({onUpdate, onLoaded, setButtonComponent, mode = 'basic'}) => {
  // component state variables
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [savingMessage, setSavingMessage] = useState<string>();
  const [configState, setConfigState] = useState(
    WalletConfigState.PasswordEntry,
  );
  const [errorMessage, setErrorMessage] = useState<string>();

  // wallet key management state
  const [persistKeys, setPersistKeys] = useState(false);
  const [state, saveState] = useFireblocksState(persistKeys);
  const [progressPct, setProgressPct] = useState(0);

  // wallet recovery state variables
  const {accessToken, setAccessToken} = useWeb3Context();
  const [bootstrapCode, setBootstrapCode] = useState<string>();
  const [recoveryPhrase, setRecoveryPhrase] = useState<string>();
  const [emailAddress, setEmailAddress] = useState<string>();
  const [mpcWallets, setMpcWallets] = useState<SerializedWalletBalance[]>([]);

  // style and translation
  const {classes} = useStyles({configState, mode});
  const [t] = useTranslationContext();

  useEffect(() => {
    setIsLoaded(false);
    setButtonComponent(<></>);
    void loadFromState();
  }, []);

  useEffect(() => {
    if (configState === WalletConfigState.Complete && accessToken) {
      // update state
      onUpdate(DomainProfileTabType.Wallet, {accessToken});
      setIsLoaded(false);

      // retrieve the MPC wallets on page load
      void loadMpcWallets();
    }
  }, [configState, accessToken]);

  useEffect(() => {
    if (onLoaded) {
      onLoaded(isLoaded);
    }
    if (!isLoaded) {
      return;
    }
    if (configState === WalletConfigState.Complete) {
      setButtonComponent(<></>);
      return;
    }
    const isSaveEnabled =
      configState === WalletConfigState.PasswordEntry
        ? isDirty && emailAddress && recoveryPhrase && !errorMessage
        : isDirty && !errorMessage;

    setButtonComponent(
      <Box className={classes.continueActionContainer}>
        {(configState !== WalletConfigState.OtpEntry || !isSaving) &&
        !errorMessage ? (
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
              {configState === WalletConfigState.PasswordEntry
                ? t('wallet.beginSetup')
                : configState === WalletConfigState.OtpEntry &&
                  t('wallet.completeSetup')}
            </LoadingButton>
            {configState === WalletConfigState.OtpEntry && (
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
          </>
        ) : (
          !errorMessage && (
            <Box
              display="flex"
              flexDirection="column"
              justifyItems="center"
              width="100%"
            >
              <InlineEducation />
              <LinearProgress variant="determinate" value={progressPct} />
            </Box>
          )
        )}
      </Box>,
    );
  }, [
    isSaving,
    configState,
    savingMessage,
    bootstrapCode,
    emailAddress,
    recoveryPhrase,
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

  const loadMpcWallets = async () => {
    if (!accessToken) {
      return;
    }

    // retrieve the accounts associated with the access token
    const bootstrapState = getBootstrapState(state);
    if (!bootstrapState) {
      return;
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
    const accountAddresses = [
      ...new Set(bootstrapState.assets?.map(a => a.address)),
    ];
    const wallets: SerializedWalletBalance[] = [];
    await Bluebird.map(accountAddresses, async address => {
      const addressPortfolio = await getWalletPortfolio(
        address,
        accessToken,
        undefined,
        true,
      );
      if (addressPortfolio) {
        wallets.push(
          ...addressPortfolio.filter(p =>
            accountChains.includes(p.symbol.toLowerCase()),
          ),
        );
      }
    });

    // display rendered wallets
    setMpcWallets(wallets.sort((a, b) => a.name.localeCompare(b.name)));
    setIsLoaded(true);
  };

  const loadFromState = async () => {
    // retrieve existing state from session or local storage if available
    const existingState = getBootstrapState(state);
    if (!existingState) {
      setIsLoaded(true);
      return;
    }

    // after retrieving the unverified state, assume that configuration
    // will complete successfully
    setConfigState(WalletConfigState.Complete);

    // no more work to do if access token available
    if (accessToken) {
      setIsLoaded(true);
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
    setConfigState(WalletConfigState.PasswordEntry);
    setIsLoaded(true);
  };

  const handleInputChange = (id: string, value: string) => {
    setIsDirty(true);
    setErrorMessage(undefined);
    if (id === 'recoveryPhrase') {
      setRecoveryPhrase(value);
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

  const handleLogout = () => {
    // clear input variables
    setBootstrapCode(undefined);
    setPersistKeys(false);
    setEmailAddress(undefined);
    setRecoveryPhrase(undefined);

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

    if (configState === WalletConfigState.OtpEntry) {
      // submit the bootstrap code
      await processBootstrapCode();
    } else if (configState === WalletConfigState.PasswordEntry) {
      // submit the recovery phrase
      await processPasswordEntry();
    }

    // saving complete
    setIsDirty(false);
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

  const processPasswordEntry = async () => {
    // validate recovery phrase
    if (!recoveryPhrase) {
      setErrorMessage(t('common.enterValidPassword'));
      return;
    }

    // validate the email address
    if (
      !emailAddress?.match(
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      )
    ) {
      setErrorMessage(t('common.enterValidEmail'));
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
    });
    if (!isInitialized) {
      notifyEvent(
        new Error('error validating recovery phrase'),
        'error',
        'Wallet',
        'Authorization',
      );
      setErrorMessage(t('wallet.invalidRecoveryAccount'));
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
    trackProgress(startTime, 95);
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

    // store the wallet service JWT tokens at desired persistence level
    trackProgress(startTime, 100);
    await saveBootstrapState(
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

    // set component state
    setAccessToken(walletServiceTokens.accessToken);
    setConfigState(WalletConfigState.Complete);
  };

  return (
    <Box className={classes.container}>
      {isLoaded ? (
        isSaving || errorMessage ? (
          <Box mt={5}>
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
        ) : configState === WalletConfigState.OtpEntry && emailAddress ? (
          <Box>
            <Typography variant="body1" className={classes.infoContainer}>
              <Markdown>
                {t('wallet.bootstrapCodeDescription', {emailAddress})}
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
                          bootstrapCode && bootstrapCode.length > 0 && !isSaving
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
          </Box>
        ) : configState === WalletConfigState.PasswordEntry ? (
          <Box>
            <Typography variant="body1" className={classes.infoContainer}>
              <Markdown>{t('wallet.recoveryPhraseDescription')}</Markdown>
            </Typography>
            <Box mt={5}>
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
              <ManageInput
                mt={2}
                id="recoveryPhrase"
                value={recoveryPhrase}
                label={t('wallet.recoveryPhrase')}
                placeholder={t('wallet.enterRecoveryPhrase')}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={isSaving}
                type="password"
                stacked={false}
              />
            </Box>
          </Box>
        ) : (
          configState === WalletConfigState.Complete &&
          (mode === 'basic' ? (
            <Box mt={5}>
              <OperationStatus label={t('manage.allSet')} success={true}>
                <Box mb={2}>
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
                accessToken={accessToken}
                onRefresh={loadMpcWallets}
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
