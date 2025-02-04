import LockClockOutlinedIcon from '@mui/icons-material/LockClockOutlined';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Alert from '@mui/lab/Alert';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
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
    width: '100%',
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
  radio: {
    display: 'flex',
    alignItems: 'start',
  },
  modeContainer: {
    display: 'flex',
    width: '100%',
  },
  mode: {
    margin: theme.spacing(1),
  },
  icon: {
    marginTop: theme.spacing(1),
    width: '35px',
    height: '35px',
    color: theme.palette.wallet.text.secondary,
  },
}));

type Props = {
  accessToken?: string;
  onComplete: (
    mode: 'MANUAL' | 'TIME',
    status: TransactionLockStatusResponse,
  ) => void;
  onClose: () => void;
};

const SetupTxLockModal: React.FC<Props> = ({
  accessToken,
  onComplete,
  onClose,
}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();
  const [lockStatus, setLockStatus] = useState<TransactionLockStatusResponse>();
  const [otp, setOtp] = useState<string>();
  const [mode, setMode] = useState<'MANUAL' | 'TIME'>('MANUAL');
  const [timeLockPeriodMs, setTimeLockPeriodMs] = useState(7 * ONE_DAY_MS);
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

  const handleModeChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMode((event.target as HTMLInputElement).value as 'MANUAL' | 'TIME');
  };

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
        {!isSuccess && !lockStatus?.enabled && (
          <Box>
            <RadioGroup
              onChange={handleModeChanged}
              aria-labelledby="radio-group-label"
              defaultValue={'MANUAL'}
              name="radio-group"
            >
              <FormControlLabel
                value="MANUAL"
                control={<Radio />}
                className={classes.radio}
                labelPlacement="start"
                label={
                  <Box className={classes.modeContainer}>
                    <LockOutlinedIcon className={classes.icon} />
                    <Box
                      display="flex"
                      flexDirection="column"
                      className={classes.mode}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        {t('wallet.txLockStandard')}
                      </Typography>
                      <Typography variant="body2">
                        {t('wallet.txLockManualDescription')}
                      </Typography>
                    </Box>
                  </Box>
                }
              />
              <FormControlLabel
                value="TIME"
                control={<Radio />}
                className={classes.radio}
                labelPlacement="start"
                label={
                  <Box className={classes.modeContainer}>
                    <LockClockOutlinedIcon className={classes.icon} />
                    <Box
                      display="flex"
                      flexDirection="column"
                      className={classes.mode}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        {t('wallet.txLockTime')}
                      </Typography>
                      <Typography variant="body2">
                        {t('wallet.txLockTimeDescription')}
                      </Typography>
                    </Box>
                  </Box>
                }
              />
            </RadioGroup>
            {((mode === 'MANUAL' && !lockStatus?.enabled) ||
              (mode === 'TIME' && !lockStatus?.validUntil)) && (
              <>
                {mode === 'TIME' && (
                  <Box mt={2} mb={4}>
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
                        <MenuItem value={String(15 * ONE_DAY_MS)}>15</MenuItem>
                        <MenuItem value={String(30 * ONE_DAY_MS)}>30</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                )}
                <Box mt={2}>
                  <Alert severity={mode === 'MANUAL' ? 'info' : 'warning'}>
                    {mode === 'MANUAL'
                      ? t('wallet.txLockManualTip')
                      : t('wallet.txLockTimeTip')}
                  </Alert>
                </Box>
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
                <Alert severity={mode === 'MANUAL' ? 'info' : 'warning'}>
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
        startIcon={
          isSuccess ? undefined : lockStatus?.enabled ? (
            <LockOpenOutlinedIcon />
          ) : mode === 'MANUAL' ? (
            <LockOutlinedIcon />
          ) : (
            <LockClockOutlinedIcon />
          )
        }
        disabled={
          isSaving ||
          (mode === 'MANUAL' && lockStatus?.enabled && !isDirty) ||
          (mode === 'TIME' && !timeLockPeriodMs)
        }
      >
        {isSuccess
          ? t('common.close')
          : (mode === 'MANUAL' && lockStatus?.enabled) ||
            (mode === 'TIME' && lockStatus?.validUntil)
          ? t('wallet.unlock')
          : mode === 'TIME' && timeLockPeriodMs
          ? t('wallet.txLockTimeAction', {
              number: String(timeLockPeriodMs / ONE_DAY_MS),
            })
          : t('wallet.lock')}
      </LoadingButton>
    </Box>
  );
};

export default SetupTxLockModal;
