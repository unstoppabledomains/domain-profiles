import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {
  claimMpcCustodyWallet,
  getMpcCustodyWallet,
  getOnboardingStatus,
} from '../../actions/walletActions';
import {useFireblocksState} from '../../hooks';
import type {CustodyWallet} from '../../lib';
import {
  CustodyState,
  getBootstrapState,
  isEmailValid,
  useTranslationContext,
} from '../../lib';
import {sleep} from '../../lib/sleep';
import ManageInput from '../Manage/common/ManageInput';

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
    width: '100%',
  },
  centered: {
    height: '100%',
    alignItems: 'center',
  },
  button: {
    marginTop: theme.spacing(1),
    width: '100%',
  },
  icon: {
    color: theme.palette.neutralShades[300],
    width: '150px',
    height: '150px',
  },
  alert: {
    textAlign: 'left',
    marginTop: theme.spacing(3),
  },
  passwordIcon: {
    margin: theme.spacing(0.5),
  },
}));

const WALLET_PASSWORD_MIN_LENGTH = 12;
const WALLET_PASSWORD_MAX_LENGTH = 32;
const WALLET_PASSWORD_NUMBER_VALIDATION_REGEX = /\d/;
const WALLET_PASSWORD_SPECIAL_CHARACTER_VALIDATION_REGEX =
  /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;

type Props = {
  custodyWallet?: CustodyWallet;
  onComplete: (emailAddress: string) => void;
};

const ClaimWalletModal: React.FC<Props> = ({
  custodyWallet: initialCustodyWallet,
  onComplete,
}) => {
  const {classes, cx} = useStyles();
  const [t] = useTranslationContext();
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [savingMessage, setSavingMessage] = useState<string>();
  const [emailAddress, setEmailAddress] = useState<string>();
  const [recoveryPhrase, setRecoveryPhrase] = useState<string>();
  const [custodyWallet, setCustodyWallet] = useState(initialCustodyWallet);
  const [state, saveState] = useFireblocksState();

  useEffect(() => {
    if (custodyWallet) {
      return;
    }
    const bootstrapState = getBootstrapState(state);
    if (!bootstrapState?.custodyState) {
      return;
    }
    setCustodyWallet(bootstrapState.custodyState);
  }, [custodyWallet]);

  const handleInputChange = (id: string, value: string) => {
    setIsDirty(true);
    setErrorMessage(undefined);
    if (id === 'recoveryPhrase') {
      setRecoveryPhrase(value);
    } else if (id === 'emailAddress') {
      setEmailAddress(value);
    }
  };

  const handleKeyDown: React.KeyboardEventHandler = event => {
    if (event.key === 'Enter') {
      void handleSave();
    }
  };

  const handleSave = async () => {
    // start claiming process
    try {
      setIsSaving(true);
      setSavingMessage(t('wallet.configuringWalletShort'));

      if (!custodyWallet?.secret) {
        return;
      }

      // validate the email address
      if (!emailAddress || !isEmailValid(emailAddress)) {
        setErrorMessage(t('common.enterValidEmail'));
        return;
      }

      // validate password entered
      if (!recoveryPhrase) {
        setErrorMessage(t('common.enterValidPassword'));
        return;
      }

      // validate password strength
      if (!isValidWalletPasswordFormat(recoveryPhrase)) {
        setErrorMessage(t('wallet.resetPasswordStrength'));
        return;
      }

      // check for email already onboarded
      const onboardStatus = await getOnboardingStatus(emailAddress);
      if (onboardStatus?.active) {
        setErrorMessage(t('wallet.emailInUse'));
        return;
      }

      // start request to claim the wallet
      const claimResult = await claimMpcCustodyWallet(custodyWallet.secret, {
        emailAddress,
        password: recoveryPhrase,
      });
      if (claimResult?.state !== CustodyState.SELF_CUSTODY) {
        setErrorMessage(t('wallet.claimWalletError'));
        return;
      }

      // wait for the operation to be completed
      while (true) {
        const c = await getMpcCustodyWallet(custodyWallet.secret, true);
        if (c?.status === 'COMPLETED') {
          break;
        }
        await sleep(1000);
      }

      // operation is completed
      setErrorMessage(t('common.success'));
      onComplete(emailAddress);
    } finally {
      setIsSaving(false);
    }
  };

  const isValidWalletPasswordFormat = (password: string): boolean => {
    return (
      password.length >= WALLET_PASSWORD_MIN_LENGTH &&
      password.length < WALLET_PASSWORD_MAX_LENGTH &&
      WALLET_PASSWORD_NUMBER_VALIDATION_REGEX.test(password) &&
      WALLET_PASSWORD_SPECIAL_CHARACTER_VALIDATION_REGEX.test(password)
    );
  };

  return (
    <Box className={classes.container}>
      <Box className={cx(classes.content, classes.centered)}>
        <Typography mb={5}>{t('wallet.claimWalletDescription')}</Typography>
        <ManageInput
          id="emailAddress"
          value={emailAddress}
          autoComplete="username"
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
          type={passwordVisible ? undefined : 'password'}
          autoComplete="current-password"
          endAdornment={
            <IconButton
              className={classes.passwordIcon}
              onClick={() => {
                setPasswordVisible(!passwordVisible);
              }}
            >
              {passwordVisible ? (
                <Tooltip title={t('common.passwordHide')}>
                  <VisibilityOffOutlinedIcon />
                </Tooltip>
              ) : (
                <Tooltip title={t('common.passwordShow')}>
                  <VisibilityOutlinedIcon />
                </Tooltip>
              )}
            </IconButton>
          }
          stacked={false}
        />
      </Box>
      <Box mt={3} className={classes.content}>
        <LoadingButton
          fullWidth
          onClick={handleSave}
          variant="contained"
          disabled={!isDirty || !custodyWallet || !!errorMessage}
          loading={isSaving}
          loadingIndicator={
            savingMessage ? (
              <Box display="flex" alignItems="center">
                <CircularProgress color="inherit" size={16} />
                <Box ml={1}>{savingMessage}</Box>
              </Box>
            ) : undefined
          }
        >
          {errorMessage || t('wallet.completeSetup')}
        </LoadingButton>
      </Box>
    </Box>
  );
};

export default ClaimWalletModal;
