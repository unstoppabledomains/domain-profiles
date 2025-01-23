import LoadingButton from '@mui/lab/LoadingButton';
// eslint-disable-next-line no-restricted-imports
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import Markdown from 'markdown-to-jsx';
import React, {useEffect, useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {signIn, signInOtp} from '../../actions/fireBlocksActions';
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
  notifyEvent,
  saveBootstrapState,
  useTranslationContext,
} from '../../lib';
import {sleep} from '../../lib/sleep';
import type {TokenRefreshResponse} from '../../lib/types/fireBlocks';
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
  onClaimInitiated?: (
    emailAddress: string,
    password: string,
    state: TokenRefreshResponse,
  ) => void;
  onComplete: (accessToken: string) => void;
};

const ClaimWalletModal: React.FC<Props> = ({
  custodyWallet: initialCustodyWallet,
  onClaimInitiated,
  onComplete,
}) => {
  const {classes, cx} = useStyles();
  const [t] = useTranslationContext();
  const [claimStatus, setClaimStatus] = useState<TokenRefreshResponse>();
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [emailError, setEmailError] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();
  const [savingMessage, setSavingMessage] = useState<string>();
  const [emailAddress, setEmailAddress] = useState<string>();
  const [recoveryPhrase, setRecoveryPhrase] = useState<string>();
  const [oneTimeCode, setOneTimeCode] = useState<string>();
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
    setEmailError(undefined);
    setPasswordError(undefined);
    if (id === 'recoveryPhrase') {
      setRecoveryPhrase(value);
    } else if (id === 'emailAddress') {
      setEmailAddress(value);
    } else if (id === 'oneTimeCode') {
      setOneTimeCode(value);
    }
  };

  const handleKeyDown: React.KeyboardEventHandler = event => {
    if (event.key === 'Enter') {
      void handleSave();
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSavingMessage(t('wallet.configuringWalletShort'));

      if (!claimStatus) {
        await processPassword();
      } else {
        await processOtp();
      }
    } finally {
      setIsSaving(false);
    }
  };

  const processPassword = async () => {
    if (!custodyWallet?.secret) {
      return;
    }

    // validate the email address
    if (!emailAddress || !isEmailValid(emailAddress)) {
      setEmailError(t('common.enterValidEmail'));
      return;
    }

    // check for email already onboarded
    const onboardStatus = await getOnboardingStatus(emailAddress);
    if (onboardStatus?.active) {
      setEmailError(t('wallet.emailInUse'));
      return;
    }

    // validate password entered
    if (!recoveryPhrase) {
      setPasswordError(t('common.enterValidPassword'));
      return;
    }

    // validate password strength
    if (!isValidWalletPasswordFormat(recoveryPhrase)) {
      setPasswordError(t('wallet.resetPasswordStrength'));
      return;
    }

    // retrieve current state
    const bootstrapState = getBootstrapState(state);
    if (!bootstrapState) {
      // should not enter this state but needs to be checked
      notifyEvent(
        'error loading bootstrap state during claim',
        'error',
        'Wallet',
        'Configuration',
      );
      setErrorMessage(t('wallet.claimWalletError'));
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

    // update to CLAIMING state to ensure the user is prompted to sign-in next
    // time they open the app. If the user waits for claiming to complete in
    // the current window, they'll be able to complete sign in without leaving.
    bootstrapState.custodyState.state = CustodyState.CLAIMING;
    await saveBootstrapState(bootstrapState, state, saveState);

    // wait for the operation to be completed
    while (true) {
      const c = await getMpcCustodyWallet(custodyWallet.secret, true);
      if (c?.status === 'COMPLETED') {
        break;
      }
      await sleep(1000);
    }

    // set state to SELF_CUSTODY now that claiming is complete
    bootstrapState.custodyState.state = CustodyState.SELF_CUSTODY;
    await saveBootstrapState(bootstrapState, state, saveState);

    // generate a one-time code for the new username and password
    const signInToken = await signIn(emailAddress, recoveryPhrase);
    if (!signInToken?.status) {
      setErrorMessage(t('wallet.signInError'));
      return;
    }

    // callback if requested
    if (onClaimInitiated) {
      onClaimInitiated(emailAddress, recoveryPhrase, signInToken);
    }

    // prompt the user to confirm the one-time code, which will complete the
    // sign-in process and generate a wallet access token.
    setIsDirty(false);
    setClaimStatus(signInToken);
  };

  const processOtp = async () => {
    if (!claimStatus || !emailAddress || !recoveryPhrase || !oneTimeCode) {
      return;
    }

    // verify the user provided one-time code
    const otpResponse = await signInOtp(
      claimStatus.accessToken,
      'EMAIL',
      oneTimeCode,
    );
    if (!otpResponse?.accessToken || !otpResponse?.refreshToken) {
      setErrorMessage(t('wallet.signInOtpError'));
      return;
    }

    // store the wallet service JWT tokens at desired persistence level
    await saveBootstrapState(
      {
        assets: [],
        bootstrapToken: claimStatus.accessToken,
        refreshToken: otpResponse.refreshToken,
        custodyState: {
          state: CustodyState.SELF_CUSTODY,
          status: 'COMPLETED',
        },
      },
      state,
      saveState,
      otpResponse.accessToken,
    );

    // operation is completed
    onComplete(otpResponse.accessToken);
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
        <Typography mb={5}>
          <Markdown>
            {claimStatus && emailAddress
              ? t('wallet.claimWalletOtp', {emailAddress})
              : t('wallet.claimWalletDescription')}
          </Markdown>
        </Typography>
        {claimStatus && (
          <ManageInput
            id="oneTimeCode"
            value={oneTimeCode}
            autoComplete="one-time-code"
            label={t('wallet.oneTimeCode')}
            placeholder={t('wallet.enterOneTimeCode')}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            stacked={false}
            disabled={isSaving}
          />
        )}
        {!claimStatus && (
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
            error={!!emailError}
            errorText={emailError}
          />
        )}
        {!claimStatus && (
          <ManageInput
            mt={2}
            id="recoveryPhrase"
            value={recoveryPhrase}
            label={t('wallet.recoveryPhrase')}
            placeholder={t('wallet.enterRecoveryPhrase')}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isSaving}
            type={'password'}
            autoComplete="current-password"
            stacked={false}
            error={!!passwordError}
            errorText={passwordError}
          />
        )}
      </Box>
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      <Box mt={3} className={classes.content}>
        <LoadingButton
          fullWidth
          onClick={handleSave}
          variant="contained"
          disabled={
            !isDirty || !custodyWallet || !!emailError || !!passwordError
          }
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
          {claimStatus
            ? t('wallet.completeSetup')
            : t('wallet.claimWalletCtaButton')}
        </LoadingButton>
      </Box>
    </Box>
  );
};

export default ClaimWalletModal;
