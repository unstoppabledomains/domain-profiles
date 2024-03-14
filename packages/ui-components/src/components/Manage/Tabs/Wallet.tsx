import CheckIcon from '@mui/icons-material/Check';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import WalletOutlinedIcon from '@mui/icons-material/WalletOutlined';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useState} from 'react';
import {useLocalStorage, useSessionStorage} from 'usehooks-ts';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {
  confirmAuthorizationTokenTx,
  getAuthorizationTokenTx,
  getBootstrapToken,
} from '../../../actions/fireBlocksActions';
import {useTranslationContext} from '../../../lib';
import {
  getFireBlocksClient,
  initializeClient,
  signTransaction,
} from '../../../lib/fireBlocks/client';
import {BootstrapStateKey} from '../../../lib/types/fireBlocks';
import {DomainProfileTabType} from '../DomainProfile';
import ManageInput from '../common/ManageInput';
import {TabHeader} from '../common/TabHeader';
import type {ManageTabProps} from '../common/types';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
  infoContainer: {
    marginBottom: theme.spacing(3),
  },
  forgotCodeContainer: {
    marginLeft: theme.spacing(15),
  },
  checkboxContainer: {
    marginLeft: theme.spacing(15),
    marginTop: theme.spacing(2),
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
  BootstrapCode = 'bootstrap',
  RecoveryPhrase = 'recoveryPhrase',
  Complete = 'complete',
}

const STATE_KEY = 'fireblocks-state';

export const Wallet: React.FC<ManageTabProps> = ({
  address,
  domain,
  onUpdate,
  setButtonComponent,
}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();

  // component state variables
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [configState, setConfigState] = useState(
    WalletConfigState.BootstrapCode,
  );
  const [errorMessage, setErrorMessage] = useState<string>();

  // wallet key management state
  const [persistKeys, setPersistKeys] = useState(false);
  const [sessionKeyState, setSessionKeyState] = useSessionStorage<
    Record<string, Record<string, string>>
  >(STATE_KEY, {});
  const [persistentKeyState, setPersistentKeyState] = useLocalStorage<
    Record<string, Record<string, string>>
  >(STATE_KEY, {});

  // wallet recovery state variables
  const [deviceId, setDeviceId] = useState<string>();
  const [bootstrapJwt, setBootstrapJwt] = useState<string>();
  const [bootstrapCode, setBootstrapCode] = useState<string>();
  const [recoveryPhrase, setRecoveryPhrase] = useState<string>();

  useEffect(() => {
    setIsLoaded(false);
    setButtonComponent(<></>);
    void loadFromState();
  }, [domain]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }
    setButtonComponent(
      <LoadingButton
        variant="contained"
        onClick={handleSave}
        loading={isSaving}
        disabled={!isDirty}
        fullWidth
        startIcon={
          configState === WalletConfigState.Complete ? <CheckIcon /> : undefined
        }
      >
        {errorMessage
          ? errorMessage
          : configState === WalletConfigState.BootstrapCode
          ? t('wallet.beginSetup')
          : configState === WalletConfigState.RecoveryPhrase
          ? t('wallet.completeSetup')
          : t('wallet.success')}
      </LoadingButton>,
    );
  }, [
    address,
    isSaving,
    bootstrapCode,
    recoveryPhrase,
    errorMessage,
    isLoaded,
  ]);

  const loadFromState = async () => {
    // retrieve existing state from session or local storage if available
    const existingState =
      sessionKeyState[BootstrapStateKey] ||
      persistentKeyState[BootstrapStateKey];

    // check state for device ID and refresh token
    if (existingState?.deviceId && existingState?.refreshToken) {
      setConfigState(WalletConfigState.Complete);
    }

    setIsLoaded(true);
  };

  const handleInputChange = (id: string, value: string) => {
    setIsDirty(true);
    if (id === 'recoveryPhrase') {
      setRecoveryPhrase(value);
    } else if (id === 'bootstrapCode') {
      setBootstrapCode(value);
    }
  };

  const handleLogout = () => {
    setSessionKeyState({});
    setPersistentKeyState({});
    setConfigState(WalletConfigState.BootstrapCode);
  };

  const handleSave = async () => {
    setIsSaving(true);

    if (configState === WalletConfigState.BootstrapCode) {
      // submit the bootstrap code
      await processBootstrapCode();
    } else if (configState === WalletConfigState.RecoveryPhrase) {
      // submit the recovery phrase
      await processRecoveryPhrase();
    }

    // saving complete
    setIsDirty(false);
    setIsSaving(false);
  };

  const handlePersistChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPersistKeys(event.target.checked);
    setIsDirty(true);
  };

  const handleForgotCode = () => {
    // TODO - need to implement handler, but need support from the
    // wallet service for email as prerequisite
  };

  const processBootstrapCode = async () => {
    // bootstrap code is required
    if (!bootstrapCode) {
      return;
    }

    // retrieve a temporary JWT token using the code and validate the
    // response contains expected value format
    const walletResponse = await getBootstrapToken(bootstrapCode);
    if (!walletResponse?.accessToken || !walletResponse.deviceId) {
      setErrorMessage('Invalid bootstrap code');
      return;
    }

    // set recovery state
    setBootstrapJwt(walletResponse?.accessToken);
    setDeviceId(walletResponse?.deviceId);

    // set page state
    setConfigState(WalletConfigState.RecoveryPhrase);
  };

  const processRecoveryPhrase = async () => {
    // device ID and bootstrap JWT are required
    if (!deviceId || !bootstrapJwt || !recoveryPhrase) {
      return;
    }

    // retrieve and initialize the Fireblocks client
    const fbClient = await getFireBlocksClient(deviceId, bootstrapJwt, {
      state: persistKeys ? persistentKeyState : sessionKeyState,
      saveState: persistKeys ? setPersistentKeyState : setSessionKeyState,
    });
    const isInitialized = await initializeClient(fbClient, {
      bootstrapJwt,
      recoveryPhrase,
    });
    if (!isInitialized) {
      setErrorMessage('Error initializing wallet');
      return;
    }

    // retrieve a transaction ID from wallet service
    const tx = await getAuthorizationTokenTx(bootstrapJwt);
    if (!tx) {
      setErrorMessage('Error retrieving auth Tx');
      return;
    }

    // sign the transaction ID with Fireblocks client
    const txSignature = await signTransaction(fbClient, tx.transactionId);
    if (!txSignature) {
      setErrorMessage('Error signing auth Tx');
      return;
    }

    // retrieve the wallet service JWT tokens
    const walletServiceTokens = await confirmAuthorizationTokenTx(bootstrapJwt);
    if (!walletServiceTokens) {
      setErrorMessage('Error retrieving auth tokens');
      return;
    }

    // store the wallet service JWT tokens at desired persistence level
    const keyState = persistKeys ? persistentKeyState : sessionKeyState;
    const setKeyState = persistKeys
      ? setPersistentKeyState
      : setSessionKeyState;
    keyState[BootstrapStateKey] = {
      bootstrapToken: walletServiceTokens.bootstrapToken,
      refreshToken: walletServiceTokens.refreshToken,
      deviceId,
    };
    setKeyState({
      ...keyState,
    });

    // set component state
    setConfigState(WalletConfigState.Complete);
    onUpdate(DomainProfileTabType.Wallet);
  };

  return (
    <Box className={classes.container}>
      <TabHeader
        icon={<WalletOutlinedIcon />}
        description={t('manage.cryptoWalletDescription')}
        learnMoreLink="https://support.unstoppabledomains.com/support/solutions/articles/48001205861-list-domain-for-sale-on-our-website"
      />
      {isLoaded ? (
        configState === WalletConfigState.BootstrapCode ? (
          <Box>
            <Typography variant="body1" className={classes.infoContainer}>
              {t('wallet.bootstrapCodeDescription')}
            </Typography>
            <ManageInput
              id="bootstrapCode"
              value={bootstrapCode}
              label={t('wallet.bootstrapCode')}
              placeholder={t('wallet.enterBootstrapCode')}
              onChange={handleInputChange}
              stacked={false}
              disabled={isSaving}
            />
            <Box className={classes.forgotCodeContainer}>
              <Tooltip title={t('wallet.forgotBootstrapCodeDescription')}>
                <Button
                  variant="text"
                  color="secondary"
                  size="small"
                  onClick={handleForgotCode}
                >
                  {t('wallet.forgotBootstrapCode')}
                </Button>
              </Tooltip>
            </Box>
            <Box className={classes.checkboxContainer}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      onChange={handlePersistChange}
                      className={classes.checkbox}
                      checked={persistKeys}
                      disabled={
                        isSaving ||
                        !bootstrapCode ||
                        bootstrapCode.trim().length === 0
                      }
                    />
                  }
                  label={
                    <Box display="flex" flexDirection="column">
                      <Typography variant="body1">
                        {t('wallet.rememberOnThisDevice', {domain})}
                      </Typography>
                      <Typography
                        variant="caption"
                        className={classes.enableDescription}
                      >
                        {t('wallet.rememberOnThisDeviceDescription')}
                      </Typography>
                    </Box>
                  }
                />
              </FormGroup>
            </Box>
          </Box>
        ) : configState === WalletConfigState.RecoveryPhrase ? (
          <Box>
            <Typography variant="body1" className={classes.infoContainer}>
              {t('wallet.recoveryPhraseDescription')}
            </Typography>
            <ManageInput
              id="recoveryPhrase"
              value={recoveryPhrase}
              label={t('wallet.recoveryPhrase')}
              placeholder={t('wallet.enterRecoveryPhrase')}
              onChange={handleInputChange}
              stacked={false}
              disabled={isSaving}
              password={true}
            />
          </Box>
        ) : (
          configState === WalletConfigState.Complete && (
            <Box display="flex" flexDirection="column" alignItems="center">
              <CheckCircleOutlinedIcon className={classes.iconConfigured} />
              <Typography variant="h5">{t('manage.allSet')}</Typography>
              <Box mb={1}>
                <Typography variant="body1">
                  {t('wallet.successDescription')}
                </Typography>
              </Box>
              <Button variant="outlined" onClick={handleLogout}>
                {t('header.signOut')}
              </Button>
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
