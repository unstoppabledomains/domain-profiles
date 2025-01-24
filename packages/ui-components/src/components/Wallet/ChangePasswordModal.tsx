import Alert from '@mui/lab/Alert';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import Markdown from 'markdown-to-jsx';
import React, {useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {changePassword} from '../../actions/fireBlocksActions';
import {useTranslationContext} from '../../lib';
import {isValidWalletPasswordFormat} from '../../lib/wallet/password';
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
};

const ChangePasswordModal: React.FC<Props> = ({accessToken}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();
  const [currentPassword, setCurrentPassword] = useState<string>();
  const [newPassword, setNewPassword] = useState<string>();
  const [oneTimeCode, setOneTimeCode] = useState<string>();
  const [isSuccess, setIsSuccess] = useState<boolean>();
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isOtpRequired, setIsOtpRequired] = useState<'TOTP' | 'EMAIL'>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [showContinueButton, setShowContinueButton] = useState(true);
  const [showBackButton, setShowBackButton] = useState(false);

  const handleValueChanged = (id: string, v: string) => {
    if (id === 'current-password') {
      setCurrentPassword(v);
    } else if (id === 'new-password') {
      setNewPassword(v);
    } else if (id === 'oneTimeCode') {
      setOneTimeCode(v);
    }
    setIsDirty(true);
    setIsSuccess(undefined);
  };

  const handleKeyDown: React.KeyboardEventHandler = event => {
    if (event.key === 'Enter') {
      void handleChangePassword();
    }
  };

  const handleBack = () => {
    setOneTimeCode(undefined);
    setIsOtpRequired(undefined);
    setErrorMessage(undefined);
    setShowContinueButton(true);
    setShowBackButton(false);
  };

  const handleChangePassword = async () => {
    // validate password and token
    if (!accessToken || !currentPassword || !newPassword) {
      return;
    }

    // validate password strength
    if (!isValidWalletPasswordFormat(newPassword)) {
      setErrorMessage(t('wallet.resetPasswordStrength'));
      setNewPassword(undefined);
      setIsDirty(false);
      return;
    }

    // clear state
    setIsSaving(true);
    setErrorMessage(undefined);
    setIsDirty(false);

    // request a new recovery kit
    const result = await changePassword(
      accessToken,
      currentPassword,
      newPassword,
      oneTimeCode,
    );

    // clear state
    setIsSaving(false);

    // determine success
    if (result === 'OK') {
      setShowBackButton(false);
      setShowContinueButton(false);
      setIsSuccess(true);
    } else if (result === 'OTP_TOKEN_REQUIRED') {
      setIsOtpRequired('TOTP');
    } else if (result === 'VALIDATION') {
      setErrorMessage(t('wallet.resetPasswordStrength'));
    } else if (result === 'INVALID_OTP_TOKEN') {
      // invalid OTP
      setShowContinueButton(true);
      setShowBackButton(false);
      setOneTimeCode(undefined);
      setErrorMessage(t('wallet.signInOtpError'));
    } else if (result === 'INVALID_PASSWORD') {
      // invalid username or password
      setOneTimeCode(undefined);
      setShowContinueButton(false);
      setShowBackButton(true);
      setErrorMessage(t('wallet.signInError'));
    } else {
      // unknown error
      setOneTimeCode(undefined);
      setShowContinueButton(false);
      setShowBackButton(true);
      setErrorMessage(t('common.unknownError'));
    }
  };

  // show loading spinner until access token available
  if (!accessToken) {
    return (
      <Box display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className={classes.container}>
      <Box className={classes.content}>
        {!isSuccess && (
          <Box>
            <Typography variant="body2" mb={1} mt={-2} component="div">
              <Markdown>{t('wallet.changeRecoveryPhraseDescription')}</Markdown>
            </Typography>
            <Box mt={2} mb={2}>
              <Alert severity="info">
                {t('wallet.changeRecoveryPhraseTip')}
              </Alert>
            </Box>
          </Box>
        )}
        {isSuccess ? (
          <Box mt={3}>
            <OperationStatus
              success={true}
              label={t('wallet.changeRecoveryPhraseSuccess')}
            />
            <Box mt={2} mb={-2}>
              <Alert severity="info">
                {t('wallet.changeRecoveryPhraseSuccessTip')}
              </Alert>
            </Box>
          </Box>
        ) : isOtpRequired ? (
          <Box>
            <ManageInput
              id="oneTimeCode"
              value={oneTimeCode}
              autoComplete="one-time-code"
              label={t('wallet.oneTimeCode')}
              placeholder={t('wallet.enterOneTimeCode')}
              onChange={handleValueChanged}
              onKeyDown={handleKeyDown}
              stacked={true}
              disabled={isSaving}
            />
          </Box>
        ) : (
          <Box>
            <ManageInput
              id="current-password"
              type={'password'}
              autoComplete="current-password"
              label={`${t('common.current')} ${t('wallet.recoveryPhrase')}`}
              placeholder={t('wallet.enterRecoveryPhrase')}
              value={currentPassword}
              onChange={handleValueChanged}
              stacked={true}
              disabled={isSaving}
              onKeyDown={handleKeyDown}
            />
            <ManageInput
              id="new-password"
              type={'password'}
              autoComplete="new-password"
              label={`${t('common.new')} ${t('wallet.recoveryPhrase')}`}
              placeholder={t('wallet.enterRecoveryPhrase')}
              value={newPassword}
              onChange={handleValueChanged}
              mt={1}
              stacked={true}
              disabled={isSaving}
              onKeyDown={handleKeyDown}
            />
          </Box>
        )}
        {errorMessage && (
          <Box mt={3}>
            <Alert severity="error">{errorMessage}</Alert>
          </Box>
        )}
      </Box>
      {showContinueButton && (
        <LoadingButton
          variant="contained"
          fullWidth
          loading={isSaving}
          onClick={handleChangePassword}
          className={classes.button}
          disabled={isSaving || !isDirty}
        >
          {t('common.continue')}
        </LoadingButton>
      )}
      {showBackButton && (
        <Button
          className={classes.button}
          onClick={handleBack}
          variant="outlined"
          fullWidth
        >
          {t('common.back')}
        </Button>
      )}
    </Box>
  );
};

export default ChangePasswordModal;
