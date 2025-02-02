import Alert from '@mui/lab/Alert';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import Markdown from 'markdown-to-jsx';
import React, {useState} from 'react';
import useAsyncEffect from 'use-async-effect';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {
  disableTransactionLock,
  enableTransactionLock,
  getTransactionLockStatus,
} from '../../actions/fireBlocksActions';
import {useTranslationContext} from '../../lib';
import type {TransactionLockStatusResponse} from '../../lib/types/fireBlocks';
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
  mode: 'MANUAL' | 'TIME';
  accessToken?: string;
  onComplete: (
    mode: 'MANUAL' | 'TIME',
    status: TransactionLockStatusResponse,
  ) => void;
  onClose: () => void;
};

const SetupTxLockModal: React.FC<Props> = ({
  mode,
  accessToken,
  onComplete,
  onClose,
}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();
  const [otp, setOtp] = useState<string>();
  const [isEnabled, setIsEnabled] = useState<boolean>();
  const [isSuccess, setIsSuccess] = useState<boolean>();
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  useAsyncEffect(async () => {
    if (!accessToken) {
      return;
    }
    const status = await getTransactionLockStatus(accessToken);
    setIsEnabled(status?.enabled);
  }, [accessToken]);

  const handleValueChanged = (id: string, v: string) => {
    if (id === 'otp') {
      setOtp(v);
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
    if (!accessToken) {
      return;
    }

    // set saving state
    setIsSaving(true);

    if (isEnabled) {
      // disable lock
      if (otp) {
        const disableResult = await disableTransactionLock(accessToken, otp);
        if (!disableResult) {
          setIsSaving(false);
          setIsSuccess(false);
          setErrorMessage(
            t(
              mode === 'MANUAL'
                ? 'wallet.txLockManualError'
                : 'wallet.txLockTimeError',
              {action: 'disabling'},
            ),
          );
          return;
        }
      }
    } else {
      // enable lock
      const enableResult = await enableTransactionLock(
        accessToken,
        mode === 'TIME' ? {time: 1, timeUnit: 'MINUTES'} : undefined,
      );
      if (!enableResult) {
        setIsSaving(false);
        setIsSuccess(false);
        setErrorMessage(
          t(
            mode === 'MANUAL'
              ? 'wallet.txLockManualError'
              : 'wallet.txLockTimeError',
            {action: 'enabling'},
          ),
        );
        return;
      }
    }

    // set success state
    setIsSaving(false);
    setIsSuccess(true);
    onComplete(mode, {
      '@type': 'TransactionLockStatusResponse',
      enabled: isEnabled ? false : true,
      validUntil: mode === 'TIME' ? Date.now() : 0,
    });
  };

  return (
    <Box className={classes.container}>
      <Box className={classes.content}>
        {!isSuccess && (
          <Box>
            <Typography variant="body2" mb={1} mt={-2} component="div">
              <Markdown>
                {mode === 'MANUAL'
                  ? t('wallet.txLockManualDescription')
                  : t('wallet.txLockTimeDescription')}
              </Markdown>
            </Typography>
            {!isEnabled && (
              <Box mt={2} mb={2}>
                <Alert severity="warning">
                  {mode === 'MANUAL'
                    ? t('wallet.txLockManualTip')
                    : t('wallet.txLockTimeTip')}
                </Alert>
              </Box>
            )}
          </Box>
        )}
        {isSuccess ? (
          <Box mt={3} mb={3}>
            <OperationStatus
              success={true}
              label={
                mode === 'MANUAL'
                  ? t('wallet.txLockManualSuccess', {
                      action: isEnabled ? 'disabled' : 'enabled',
                    })
                  : t('wallet.txLockTimeSuccess', {
                      action: isEnabled ? 'disabled' : 'enabled',
                    })
              }
            />
            {!isEnabled && (
              <Box mt={2} mb={-2}>
                <Alert severity="warning">
                  {mode === 'MANUAL'
                    ? t('wallet.txLockManualTip')
                    : t('wallet.txLockTimeTip')}
                </Alert>
              </Box>
            )}
          </Box>
        ) : isEnabled ? (
          <Box>
            <ManageInput
              id="otp"
              autoComplete="one-time-code"
              label={t('wallet.oneTimeCode')}
              placeholder={t('wallet.enterOneTimeCode')}
              value={otp}
              onChange={handleValueChanged}
              mt={1}
              stacked={true}
              disabled={isSaving}
              onKeyDown={handleKeyDown}
              error={!!errorMessage}
              errorText={errorMessage}
            />
          </Box>
        ) : errorMessage ? (
          <Alert severity="error">{errorMessage}</Alert>
        ) : null}
      </Box>
      <LoadingButton
        variant="contained"
        fullWidth
        loading={isSaving}
        onClick={handleClick}
        className={classes.button}
        disabled={isSaving || (isEnabled && !isDirty)}
      >
        {isSuccess
          ? t('common.close')
          : isEnabled
          ? t('manage.disable')
          : t('manage.enable')}
      </LoadingButton>
    </Box>
  );
};

export default SetupTxLockModal;
