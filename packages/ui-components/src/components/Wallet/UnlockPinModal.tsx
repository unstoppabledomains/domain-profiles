import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import {useTheme} from '@mui/material/styles';
import Markdown from 'markdown-to-jsx';
import React, {useState} from 'react';
import useAsyncEffect from 'use-async-effect';

import config from '@unstoppabledomains/config';
import IconPlate from '@unstoppabledomains/ui-kit/icons/IconPlate';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {
  useFireblocksAccessToken,
  useFireblocksState,
  useWeb3Context,
} from '../../hooks';
import {
  decrypt,
  disablePin,
  getBootstrapState,
  notifyEvent,
  saveBootstrapState,
  unlock,
  useTranslationContext,
} from '../../lib';
import ManageInput from '../Manage/common/ManageInput';
import Modal from '../Modal';
import WalletIcon from './WalletIcon';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    width: '400px',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
  modalTitleStyle: {
    color: 'inherit',
    alignSelf: 'center',
  },
  inputContainer: {
    textAlign: 'left',
    width: '100%',
  },
  buttonContainer: {
    marginTop: theme.spacing(1),
    width: '100%',
  },
  button: {
    marginTop: theme.spacing(1),
    width: '100%',
  },
}));

type Props = {
  onSuccess: () => void;
};

const UnlockPinModal: React.FC<Props> = ({onSuccess}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();
  const theme = useTheme();
  const {setShowPinCta} = useWeb3Context();
  const [state, saveState] = useFireblocksState();
  const getAccessToken = useFireblocksAccessToken();
  const [pin, setPin] = useState<string>();
  const [emailAddress, setEmailAddress] = useState<string>();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  useAsyncEffect(async () => {
    try {
      await getAccessToken();
    } catch (e) {
      setIsLoaded(true);
    }

    // load user email address
    const clientState = getBootstrapState(state);
    setEmailAddress(clientState?.userName);
  }, []);

  const handleValueChanged = (id: string, v: string) => {
    if (id === 'pin') {
      setPin(v);
    }
    setErrorMessage(undefined);
    setIsDirty(true);
  };

  const handleKeyDown: React.KeyboardEventHandler = event => {
    if (event.key === 'Enter') {
      void handleUnlock();
    }
  };

  const handleUnlock = async () => {
    // validate PIN exists
    if (!pin) {
      return;
    }

    // clear state
    setIsSaving(true);
    setErrorMessage(undefined);
    setIsDirty(false);

    try {
      // attempt to unlock with user provided input
      await unlock(pin, config.WALLETS.DEFAULT_PIN_TIMEOUT_MS);

      // retrieve the encrypted session state
      const bootstrapState = getBootstrapState(state);
      if (!bootstrapState?.lockedRefreshToken) {
        throw new Error('error locating encrypted session state');
      }

      // decrypt the refresh token
      const refreshToken = decrypt(bootstrapState.lockedRefreshToken, pin);
      if (!refreshToken) {
        throw new Error('error decrypting session state');
      }

      // restore the session state
      bootstrapState.refreshToken = refreshToken;
      bootstrapState.lockedRefreshToken = undefined;
      await saveBootstrapState(bootstrapState, state, saveState);

      // request a new access token using the refresh token
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error('unable to retrieve new access token');
      }

      // unlock was successful
      onSuccess();
    } catch (e) {
      // unlock failed
      notifyEvent(e, 'error', 'Wallet', 'Configuration');
      setErrorMessage(t('wallet.sessionLockError'));
    } finally {
      setPin(undefined);
      setIsSaving(false);
    }
  };

  const handleForgotPassword = () => {
    setShowForgotPasswordModal(true);
  };

  const handleLogout = async () => {
    await Promise.all([saveState({}), disablePin()]);
    setShowPinCta(false);
  };

  return (
    <Box className={classes.container}>
      <Box className={classes.content}>
        <Box mb={5}>
          <IconPlate size={100} variant="info">
            <WalletIcon />
          </IconPlate>
        </Box>
        <Typography variant="h4" mb={5}>
          {theme.wallet.title}
        </Typography>
        <Box className={classes.inputContainer}>
          <ManageInput
            id="pin"
            value={pin}
            type="password"
            autoComplete="current-password"
            placeholder={t('wallet.enterSessionLockPassword')}
            onChange={handleValueChanged}
            onKeyDown={handleKeyDown}
            stacked={true}
            disabled={isSaving}
            error={!!errorMessage}
            errorText={errorMessage}
          />
        </Box>
        <Box className={classes.buttonContainer}>
          <LoadingButton
            variant="contained"
            fullWidth
            loading={isSaving}
            onClick={handleUnlock}
            className={classes.button}
            disabled={isSaving || !isDirty || !isLoaded}
          >
            {t('wallet.unlock')}
          </LoadingButton>
          {emailAddress && (
            <Button
              size="small"
              variant="text"
              className={classes.button}
              onClick={handleForgotPassword}
            >
              {t('common.forgotPassword')}
            </Button>
          )}
        </Box>
      </Box>
      {showForgotPasswordModal && emailAddress && (
        <Modal
          title={t('common.forgotPassword')}
          open={showForgotPasswordModal}
          titleStyle={classes.modalTitleStyle}
          onClose={() => setShowForgotPasswordModal(false)}
          fullScreen={false}
          maxWidth="xs"
        >
          <Typography variant="body2">
            <Markdown>
              {t('wallet.sessionLockForgotDescription', {
                emailAddress,
              })}
            </Markdown>
          </Typography>
          <Button
            onClick={() => setShowForgotPasswordModal(false)}
            variant="outlined"
            className={classes.button}
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleLogout}
            variant="contained"
            className={classes.button}
          >
            {t('header.signOut')}
          </Button>
        </Modal>
      )}
    </Box>
  );
};

export default UnlockPinModal;
