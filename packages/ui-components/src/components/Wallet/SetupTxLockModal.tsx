import Alert from '@mui/lab/Alert';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import type {SelectChangeEvent} from '@mui/material/Select';
import Select from '@mui/material/Select';
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

// time constants in milliseconds
const ONE_MINUTE_MS = 1 * 60 * 1000;
const ONE_HOUR_MS = 60 * ONE_MINUTE_MS;
const ONE_DAY_MS = 24 * ONE_HOUR_MS;

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
    height: '100%',
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
  const [lockStatus, setLockStatus] = useState<TransactionLockStatusResponse>();
  const [otp, setOtp] = useState<string>();
  const [timeLockPeriodMs, setTimeLockPeriodMs] = useState<number>();
  const [isLoaded, setIsLoaded] = useState<boolean>();
  const [isSuccess, setIsSuccess] = useState<boolean>();
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  useAsyncEffect(async () => {
    if (!accessToken) {
      return;
    }
    setLockStatus(await getTransactionLockStatus(accessToken));
    setIsLoaded(true);
  }, [accessToken]);

  const handleTimePeriodChanged = (event: SelectChangeEvent) => {
    setTimeLockPeriodMs(parseInt(event.target.value, 10));
    setIsDirty(true);
  };

  const handleOtpChanged = (id: string, v: string) => {
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

    if (mode === 'MANUAL' && lockStatus?.enabled) {
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
        mode === 'TIME' && timeLockPeriodMs
          ? {time: timeLockPeriodMs / ONE_MINUTE_MS, timeUnit: 'MINUTES'}
          : undefined,
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
      enabled: lockStatus?.enabled ? false : true,
      validUntil:
        mode === 'TIME' && timeLockPeriodMs
          ? Date.now() + timeLockPeriodMs
          : undefined,
    });
  };

  if (!isLoaded) {
    return (
      <Box className={classes.container}>
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
              <Markdown>
                {mode === 'MANUAL'
                  ? t('wallet.txLockManualDescription')
                  : t('wallet.txLockTimeDescription')}
              </Markdown>
            </Typography>
            {((mode === 'MANUAL' && !lockStatus?.enabled) ||
              (mode === 'TIME' && !lockStatus?.validUntil)) && (
              <>
                <Box mt={2} mb={2}>
                  <Alert severity="warning">
                    {mode === 'MANUAL'
                      ? t('wallet.txLockManualTip')
                      : t('wallet.txLockTimeTip')}
                  </Alert>
                </Box>
                {mode === 'TIME' && (
                  <Box mt={4}>
                    <FormControl fullWidth>
                      <InputLabel id="time-period-label">
                        {t('wallet.enterTimeLockDays')}
                      </InputLabel>
                      <Select
                        labelId="time-period-label"
                        id="time-period"
                        value={
                          timeLockPeriodMs
                            ? String(timeLockPeriodMs)
                            : undefined
                        }
                        onChange={handleTimePeriodChanged}
                        label={t('wallet.enterTimeLockDays')}
                        fullWidth
                      >
                        <MenuItem value={String(1 * ONE_DAY_MS)}>1</MenuItem>
                        <MenuItem value={String(3 * ONE_DAY_MS)}>3</MenuItem>
                        <MenuItem value={String(7 * ONE_DAY_MS)}>7</MenuItem>
                        <MenuItem value={String(30 * ONE_DAY_MS)}>30</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                )}
              </>
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
                      action: lockStatus?.enabled ? 'disabled' : 'enabled',
                    })
                  : t('wallet.txLockTimeSuccess', {
                      action: lockStatus?.enabled ? 'disabled' : 'enabled',
                    })
              }
            />
            {!lockStatus?.enabled && timeLockPeriodMs && (
              <Box mt={2} mb={-2}>
                <Alert severity="warning">
                  <Markdown>
                    {mode === 'MANUAL'
                      ? t('wallet.txLockManualTip')
                      : t('wallet.txLockTimeStatus', {
                          date: new Date(
                            Date.now() + timeLockPeriodMs,
                          ).toLocaleString(),
                        })}
                  </Markdown>
                </Alert>
              </Box>
            )}
          </Box>
        ) : mode === 'MANUAL' && lockStatus?.enabled ? (
          <Box>
            <ManageInput
              id="otp"
              autoComplete="one-time-code"
              label={t('wallet.oneTimeCode')}
              placeholder={t('wallet.enterOneTimeCode')}
              value={otp}
              onChange={handleOtpChanged}
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
        disabled={
          isSaving ||
          (lockStatus?.enabled && !isDirty) ||
          (mode === 'TIME' && !timeLockPeriodMs)
        }
      >
        {isSuccess
          ? t('common.close')
          : (mode === 'MANUAL' && lockStatus?.enabled) ||
            (mode === 'TIME' && lockStatus?.validUntil)
          ? t('manage.disable')
          : t('manage.enable')}
      </LoadingButton>
    </Box>
  );
};

export default SetupTxLockModal;
