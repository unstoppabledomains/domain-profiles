import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
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
import Markdown from 'markdown-to-jsx';
import React, {useEffect, useState} from 'react';
import {useLocalStorage, useSessionStorage} from 'usehooks-ts';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {
  confirmAuthorizationTokenTx,
  getAccessToken,
  getAuthorizationTokenTx,
  getBootstrapToken,
  sendBootstrapCode,
} from '../../../../actions/fireBlocksActions';
import {useTranslationContext} from '../../../../lib';
import {notifyEvent} from '../../../../lib/error';
import {
  getFireBlocksClient,
  initializeClient,
  signTransaction,
} from '../../../../lib/fireBlocks/client';
import {getState, saveState} from '../../../../lib/fireBlocks/storage/state';
import {FireblocksStateKey} from '../../../../lib/types/fireBlocks';
import {DomainProfileTabType} from '../../DomainProfile';
import ManageInput from '../../common/ManageInput';
import type {ManageTabProps} from '../../common/types';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
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
    mode?: 'basic' | 'portfolio';
  }
> = ({onUpdate, setButtonComponent, mode = 'basic'}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();

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
  const [sessionKeyState, setSessionKeyState] = useSessionStorage<
    Record<string, Record<string, string>>
  >(FireblocksStateKey, {});
  const [persistentKeyState, setPersistentKeyState] = useLocalStorage<
    Record<string, Record<string, string>>
  >(FireblocksStateKey, {});
  const [progressPct, setProgressPct] = useState(0);

  // wallet recovery state variables
  const [accessJwt, setAccessJwt] = useState<string>();
  const [bootstrapCode, setBootstrapCode] = useState<string>();
  const [recoveryPhrase, setRecoveryPhrase] = useState<string>();
  const [emailAddress, setEmailAddress] = useState<string>();

  useEffect(() => {
    setIsLoaded(false);
    setButtonComponent(<></>);
    void loadFromState();
  }, []);

  useEffect(() => {
    if (configState === WalletConfigState.Complete && accessJwt) {
      onUpdate(DomainProfileTabType.Wallet, {accessToken: accessJwt});
    }
  }, [configState, accessJwt]);

  useEffect(() => {
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
        {configState !== WalletConfigState.OtpEntry || !isSaving ? (
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
              {errorMessage
                ? errorMessage
                : configState === WalletConfigState.PasswordEntry
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
          <Box
            display="flex"
            flexDirection="column"
            justifyItems="center"
            width="100%"
          >
            <Box display="flex" alignItems="center" mb={3}>
              <CircularProgress color="inherit" size={20} />
              <Typography variant="body2" ml={1}>
                {savingMessage}
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={progressPct} />
          </Box>
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
  ]);

  const loadFromState = async () => {
    // retrieve existing state from session or local storage if available
    const existingState =
      getState(sessionKeyState) || getState(persistentKeyState);

    // check state for device ID and refresh token
    if (existingState?.deviceId && existingState?.refreshToken) {
      const tokens = await getAccessToken(existingState.refreshToken, {
        deviceId: existingState.deviceId,
        state: persistKeys ? persistentKeyState : sessionKeyState,
        saveState: persistKeys ? setPersistentKeyState : setSessionKeyState,
      });
      setAccessJwt(tokens?.accessToken);
      setConfigState(WalletConfigState.Complete);
    }

    // set loaded state
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

    // clear storage state
    setSessionKeyState({});
    setPersistentKeyState({});

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

    // retrieve a temporary JWT token using the code and validate the
    // response contains expected value format
    setProgressPct(0);
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
    setProgressPct(3);
    const fbClientForInit = await getFireBlocksClient(deviceId, bootstrapJwt, {
      state: persistKeys ? persistentKeyState : sessionKeyState,
      saveState: persistKeys ? setPersistentKeyState : setSessionKeyState,
    });
    const isInitialized = await initializeClient(fbClientForInit, {
      bootstrapJwt,
      recoveryPhrase,
      onRequestIdCallback: () => {
        setProgressPct(16);
      },
      onJoinSuccessCallback: () => {
        setProgressPct(32);
      },
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

    // retrieve a transaction ID from wallet service
    setProgressPct(61);
    const tx = await getAuthorizationTokenTx(bootstrapJwt);
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
    setProgressPct(71);
    const fbClientForTx = await getFireBlocksClient(deviceId, bootstrapJwt, {
      state: persistKeys ? persistentKeyState : sessionKeyState,
      saveState: persistKeys ? setPersistentKeyState : setSessionKeyState,
    });
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
    setProgressPct(94);
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
    setProgressPct(100);
    const keyState = persistKeys ? persistentKeyState : sessionKeyState;
    const setKeyState = persistKeys
      ? setPersistentKeyState
      : setSessionKeyState;
    saveState(
      {
        bootstrapToken: walletServiceTokens.bootstrapToken,
        refreshToken: walletServiceTokens.refreshToken,
        deviceId,
      },
      keyState,
      setKeyState,
    );

    // set component state
    setAccessJwt(walletServiceTokens.accessToken);
    setConfigState(WalletConfigState.Complete);
  };

  return (
    <Box className={classes.container}>
      {isLoaded ? (
        configState === WalletConfigState.OtpEntry && emailAddress ? (
          <Box>
            <Typography variant="body1" className={classes.infoContainer}>
              <Markdown>
                {t('wallet.bootstrapCodeDescription', {emailAddress})}
              </Markdown>
            </Typography>
            <ManageInput
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
                id="recoveryPhrase"
                value={recoveryPhrase}
                label={t('wallet.recoveryPhrase')}
                placeholder={t('wallet.enterRecoveryPhrase')}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={isSaving}
                password={true}
                stacked={false}
              />
            </Box>
          </Box>
        ) : (
          configState === WalletConfigState.Complete && (
            <Box display="flex" flexDirection="column" alignItems="center">
              {mode === 'basic' ? (
                <>
                  <CheckCircleOutlinedIcon className={classes.iconConfigured} />
                  <Typography variant="h5">{t('manage.allSet')}</Typography>
                  <Box mb={2}>
                    <Typography variant="body1">
                      {t('wallet.successDescription')}
                    </Typography>
                  </Box>
                  <Button variant="outlined" onClick={handleLogout}>
                    {t('header.signOut')}
                  </Button>
                </>
              ) : (
                <>
                  <Typography variant="h5">Coming soon</Typography>
                  <Typography variant="body1">Manage this wallet</Typography>
                </>
              )}
            </Box>
          )
        )
      ) : (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};
