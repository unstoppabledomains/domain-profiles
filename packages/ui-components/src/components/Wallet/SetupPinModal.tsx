import Alert from '@mui/lab/Alert';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import Markdown from 'markdown-to-jsx';
import React, {useState} from 'react';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {createPIN, unlock, useTranslationContext} from '../../lib';
import ManageInput from '../Manage/common/ManageInput';
import {OperationStatus} from './OperationStatus';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'space-between',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    width: '450px',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
    marginBottom: theme.spacing(2),
  },
  button: {
    marginTop: theme.spacing(1),
  },
  passwordIcon: {
    margin: theme.spacing(0.5),
  },
}));

type Props = {
  accessToken?: string;
  onComplete: () => void;
  onClose: () => void;
};

const SetupPinModal: React.FC<Props> = ({accessToken, onComplete, onClose}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();
  const [password, setPassword] = useState<string>();
  const [isSuccess, setIsSuccess] = useState<boolean>();
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const handleValueChanged = (id: string, v: string) => {
    if (id === 'password') {
      setPassword(v);
    }
    setIsDirty(true);
    setIsSuccess(undefined);
  };

  const handleKeyDown: React.KeyboardEventHandler = event => {
    if (event.key === 'Enter') {
      void handleClick();
    }
  };

  const handleClick = async () => {
    // close window if already success
    if (isSuccess) {
      onClose();
      return;
    }

    // validate password and token
    if (!password || !accessToken) {
      return;
    }

    // set saving state
    setIsSaving(true);

    // enable the PIN with provided value
    await createPIN(password, accessToken);
    await unlock(password, config.WALLETS.DEFAULT_PIN_TIMEOUT_MS);

    // set success state
    setIsSaving(false);
    setIsSuccess(true);
    onComplete();
  };

  return (
    <Box className={classes.container}>
      <Box className={classes.content}>
        {!isSuccess && (
          <Box>
            <Typography variant="body2" mb={1} mt={-2} component="div">
              <Markdown>{t('wallet.sessionLockSetup')}</Markdown>
            </Typography>
            <Box mt={2} mb={2}>
              <Alert severity="info">{t('wallet.sessionLockSetupTip')}</Alert>
            </Box>
          </Box>
        )}
        {isSuccess ? (
          <Box mt={3} mb={3}>
            <OperationStatus
              success={true}
              label={t('wallet.changeSessionLockSuccess')}
            />
            <Box mt={2} mb={-2}>
              <Alert severity="info">
                {t('wallet.changeSessionLockSuccessTip')}
              </Alert>
            </Box>
          </Box>
        ) : (
          <Box>
            <ManageInput
              id="password"
              type={'password'}
              autoComplete="current-password"
              label={`${t('wallet.sessionLock')} ${t('wallet.recoveryPhrase')}`}
              placeholder={t('wallet.enterSessionLockPassword')}
              value={password}
              onChange={handleValueChanged}
              mt={1}
              stacked={true}
              disabled={isSaving}
              onKeyDown={handleKeyDown}
            />
          </Box>
        )}
      </Box>

      <LoadingButton
        variant="contained"
        fullWidth
        loading={isSaving}
        onClick={handleClick}
        className={classes.button}
        disabled={isSaving || !isDirty}
      >
        {isSuccess ? t('common.close') : t('common.continue')}
      </LoadingButton>
    </Box>
  );
};

export default SetupPinModal;
