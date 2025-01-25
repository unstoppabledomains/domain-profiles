import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import {useTheme} from '@mui/material/styles';
import React, {useState} from 'react';

import config from '@unstoppabledomains/config';
import IconPlate from '@unstoppabledomains/ui-kit/icons/IconPlate';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {useFireblocksState} from '../../hooks';
import {
  decrypt,
  getBootstrapState,
  notifyEvent,
  saveBootstrapState,
  unlock,
  useTranslationContext,
} from '../../lib';
import ManageInput from '../Manage/common/ManageInput';
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
  button: {
    marginTop: theme.spacing(1),
  },
}));

type Props = {
  onSuccess: () => void;
};

const UnlockPinModal: React.FC<Props> = ({onSuccess}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();
  const theme = useTheme();
  const [state, saveState] = useFireblocksState();
  const [pin, setPin] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

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
        <ManageInput
          id="pin"
          value={pin}
          type="password"
          autoComplete="current-password"
          placeholder={t('wallet.enterRecoveryPhrase')}
          onChange={handleValueChanged}
          onKeyDown={handleKeyDown}
          stacked={true}
          disabled={isSaving}
          error={!!errorMessage}
          errorText={errorMessage}
        />
        <LoadingButton
          variant="contained"
          fullWidth
          loading={isSaving}
          onClick={handleUnlock}
          className={classes.button}
          disabled={isSaving || !isDirty}
        >
          {t('wallet.unlock')}
        </LoadingButton>
      </Box>
    </Box>
  );
};

export default UnlockPinModal;
