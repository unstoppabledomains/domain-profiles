import CallMissedOutgoingIcon from '@mui/icons-material/CallMissedOutgoing';
import CallReceivedIcon from '@mui/icons-material/CallReceived';
import CheckIcon from '@mui/icons-material/Check';
import GppBadOutlinedIcon from '@mui/icons-material/GppBadOutlined';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Alert from '@mui/lab/Alert';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import {useTheme} from '@mui/material/styles';
import Markdown from 'markdown-to-jsx';
import {useSnackbar} from 'notistack';
import React, {useEffect, useMemo, useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {useFeatureFlags} from '../../actions';
import {
  createTransactionRule,
  createTransactionRuleAcceptanceCriteria,
  deleteTransactionRule,
  getRecoveryKitStatus,
  getTransactionLockStatus,
  getTransactionRules,
  updateTransactionRule,
} from '../../actions/fireBlocksActions';
import {getTwoFactorStatus} from '../../actions/walletMfaActions';
import {useFireblocksState, useWeb3Context} from '../../hooks';
import {
  disablePin,
  getAccountIdFromBootstrapState,
  getBootstrapState,
  isPinEnabled,
  useTranslationContext,
} from '../../lib';
import {isNumeric} from '../../lib/number';
import type {
  RecoveryStatusResponse,
  TransactionLockStatusResponse,
  TransactionRule,
  TransactionRuleRequest,
} from '../../lib/types/fireBlocks';
import {
  hasChromePermission,
  isChromeExtension,
} from '../../lib/wallet/chromeRuntime';
import ManageInput from '../Manage/common/ManageInput';
import Modal from '../Modal';
import ChangePasswordModal from './ChangePasswordModal';
import RecoverySetupModal from './RecoverySetupModal';
import SetupPinModal from './SetupPinModal';
import SetupTxLockModal from './SetupTxLockModal';
import {TwoFactorModal} from './TwoFactorModal';
import {TwoFactorPromptModal} from './TwoFactorPromptModal';
import {WalletPreference} from './WalletPreference';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    width: '450px',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      height: 'calc(100vh - 80px)',
      maxHeight: 'calc(100vh - 80px)',
    },
    maxHeight: '500px',
    overflow: 'auto',
    padding: '1px',
  },
  flexContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  recommendedContainer: {
    marginBottom: theme.spacing(2),
  },
  noRecommendationContainer: {
    marginBottom: theme.spacing(2),
  },
  button: {
    marginTop: theme.spacing(2),
  },
  icon: {
    marginRight: theme.spacing(1),
  },
  iconEnabled: {
    color: theme.palette.success.main,
    marginRight: theme.spacing(1),
  },
  iconDisabled: {
    color: theme.palette.error.main,
    marginRight: theme.spacing(1),
  },
}));

type Props = {
  accessToken?: string;
};

const SecurityCenterModal: React.FC<Props> = ({accessToken}) => {
  const {classes, cx} = useStyles();
  const [t] = useTranslationContext();
  const {enqueueSnackbar} = useSnackbar();
  const {setTxLockStatus} = useWeb3Context({enforcePin: true});
  const [state] = useFireblocksState();
  const clientState = getBootstrapState(state);
  const theme = useTheme();
  const {data: featureFlags} = useFeatureFlags(false);
  const [recoveryKitStatus, setRecoveryKitStatus] =
    useState<RecoveryStatusResponse>();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isMfaModalOpen, setIsMfaModalOpen] = useState(false);
  const [isMfaEnabled, setIsMfaEnabled] = useState(false);
  const [isAppConnectionEnabled, setIsAppConnectionEnabled] = useState(false);

  // OTP prompt state
  const [otpPrompt, setOtpPrompt] = useState<'update' | 'disable'>();

  // transaction lock state
  const [isTxLockManualEnabled, setIsTxLockManualEnabled] = useState<boolean>();
  const [isTxLockTimeEnabled, setIsTxLockTimeEnabled] = useState<number>();
  const [isLockEnabled, setIsLockEnabled] = useState(false);
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [isTxLockModalOpen, setIsTxLockModalOpen] = useState(false);

  // transaction rule filters
  const isLargeTxRule = (rule: TransactionRule) => {
    return (
      rule.type === 'SEND_FUNDS' &&
      rule.active &&
      rule.name === t('wallet.largeTxProtection')
    );
  };

  // transaction rule state
  const [txRules, setTxRules] = useState<TransactionRule[]>([]);
  const [largeTxAmountInput, setLargeTxAmountInput] = useState<number>();
  const [isSavingLargeTxProtection, setIsSavingLargeTxProtection] =
    useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [
    isSavingLargeTxProtectionSuccess,
    setIsSavingLargeTxProtectionSuccess,
  ] = useState(false);
  const isLargeTxProtectionEnabled = useMemo(() => {
    return txRules.some(isLargeTxRule);
  }, [txRules]);
  const largeTxDisplayAmount = useMemo(() => {
    return isLargeTxProtectionEnabled
      ? txRules.find(isLargeTxRule)?.parameters?.conditions?.any
        ? (txRules.find(isLargeTxRule)?.parameters?.conditions?.any?.[0]
            ?.value as number)
        : undefined
      : undefined;
  }, [txRules, isLargeTxProtectionEnabled]);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const loadSettings = async () => {
      try {
        const [
          pinStatus,
          mfaStatus,
          recoveryStatus,
          txLockStatus,
          txRuleList,
          tabsPermission,
        ] = await Promise.all([
          isPinEnabled(),
          getTwoFactorStatus(accessToken),
          getRecoveryKitStatus(accessToken),
          getTransactionLockStatus(accessToken),
          getTransactionRules(accessToken),
          hasChromePermission('tabs'),
        ]);
        setIsLockEnabled(pinStatus);
        setIsMfaEnabled(mfaStatus);
        setRecoveryKitStatus(recoveryStatus);
        setIsTxLockManualEnabled(
          txLockStatus?.enabled && !txLockStatus?.validUntil,
        );
        setIsTxLockTimeEnabled(
          txLockStatus?.enabled && txLockStatus?.validUntil
            ? txLockStatus.validUntil
            : undefined,
        );
        setTxRules(txRuleList ?? []);
        setIsAppConnectionEnabled(tabsPermission);
      } finally {
        setIsLoaded(true);
      }
    };

    void loadSettings();
  }, [accessToken]);

  useEffect(() => {
    if (errorMessage) {
      enqueueSnackbar(errorMessage, {
        variant: 'error',
      });
    }
  }, [errorMessage]);

  const handleRecoveryKitClicked = () => {
    setIsRecoveryModalOpen(true);
  };

  const handleChangePasswordClicked = () => {
    setIsPasswordModalOpen(true);
  };

  const handleMfaClicked = () => {
    setIsMfaModalOpen(true);
  };

  const handleLockClicked = async () => {
    if (isLockEnabled) {
      await disablePin({
        accessToken,
        accountId: getAccountIdFromBootstrapState(clientState),
      });
      setIsLockEnabled(false);
    } else {
      setIsLockModalOpen(true);
    }
  };

  const handleTxLockManualClicked = () => {
    setIsTxLockModalOpen(true);
  };

  const handleUpdateLargeTxProtectionClicked = async (otpCode?: string) => {
    // check if access token is available
    if (!accessToken || largeTxAmountInput === undefined) {
      return;
    }

    // show loading spinner
    setErrorMessage(undefined);
    setIsSavingLargeTxProtection(true);

    // prompt for OTP if not yet provided
    if (!otpCode) {
      setOtpPrompt('update');
      return;
    }

    // clear OTP state
    setOtpPrompt(undefined);

    // create a new rule if large tx protection is not enabled
    if (!isLargeTxProtectionEnabled) {
      const rule: TransactionRuleRequest = {
        name: t('wallet.largeTxProtection'),
        type: 'SEND_FUNDS',
        active: true,
        parameters: {
          conditions: {
            any: [
              {
                field: 'AMOUNT',
                operator: 'GT',
                value: largeTxAmountInput,
              },
            ],
          },
        },
      };
      const ruleId = await createTransactionRule(accessToken, otpCode, rule);
      if (!ruleId) {
        return;
      }

      // create the acceptance criteria
      await createTransactionRuleAcceptanceCriteria(
        accessToken,
        ruleId,
        'MFA_CODE',
      );

      // refresh the tx rules
      const updatedRules = await getTransactionRules(accessToken);
      if (updatedRules) {
        setTxRules(updatedRules);
      }
    }
    // update the rule if large tx protection is already enabled
    else {
      const rule = txRules.find(isLargeTxRule);
      if (!rule) {
        return;
      }
      const updatedRule: Partial<TransactionRuleRequest> = {
        type: 'SEND_FUNDS',
        parameters: {
          conditions: {
            any: [
              {
                field: 'AMOUNT',
                operator: 'GT',
                value: largeTxAmountInput,
              },
            ],
          },
        },
      };

      // update the rule
      const updateResponse = await updateTransactionRule(
        accessToken,
        otpCode,
        rule.id,
        updatedRule,
      );
      if (!updateResponse) {
        setIsSavingLargeTxProtection(false);
        setErrorMessage(
          t('wallet.largeTxProtectionError', {action: 'updating'}),
        );
        return;
      }

      // create the acceptance criteria if it doesn't exist
      if (
        !rule.acceptanceCriteria?.items ||
        rule.acceptanceCriteria.items.filter(c => c.status === 'ACTIVE')
          .length === 0
      ) {
        await createTransactionRuleAcceptanceCriteria(
          accessToken,
          rule.id,
          'MFA_CODE',
        );
      }

      // refresh the tx rules
      const updatedRules = await getTransactionRules(accessToken);
      if (updatedRules) {
        setTxRules(updatedRules);
      }
    }

    // hide loading spinner and success state
    setIsSavingLargeTxProtectionSuccess(true);
    setIsSavingLargeTxProtection(false);
  };

  const handleDisableLargeTxProtectionClicked = async (otpCode?: string) => {
    // check if access token is available
    if (!accessToken) {
      return;
    }

    // check if large tx protection is already enabled
    if (!isLargeTxProtectionEnabled) {
      return;
    }

    // prompt for OTP if not yet provided
    if (!otpCode) {
      setOtpPrompt('disable');
      return;
    }

    // clear OTP state
    setOtpPrompt(undefined);

    // find the rule
    const rule = txRules.find(r => r.type === 'SEND_FUNDS');
    if (!rule) {
      return;
    }

    // delete the rule
    setErrorMessage(undefined);
    setIsSavingLargeTxProtection(true);
    const isDeleteSuccess = await deleteTransactionRule(
      accessToken,
      otpCode,
      rule,
    );
    if (!isDeleteSuccess) {
      setIsSavingLargeTxProtection(false);
      setErrorMessage(
        t('wallet.largeTxProtectionError', {action: 'disabling'}),
      );
      return;
    }

    // hide the rule after successful removal
    setTxRules(txRules.filter(r => r.id !== rule.id));
    setIsSavingLargeTxProtectionSuccess(false);
    setLargeTxAmountInput(undefined);

    // success
    setIsSavingLargeTxProtection(false);
  };

  const handleTxLockComplete = async (
    mode: 'MANUAL' | 'TIME',
    status: TransactionLockStatusResponse,
  ) => {
    setTxLockStatus(status);
    if (status.enabled) {
      if (mode === 'MANUAL') {
        setIsTxLockManualEnabled(true);
      } else {
        setIsTxLockTimeEnabled(status.validUntil);
      }
    } else {
      if (mode === 'MANUAL') {
        setIsTxLockManualEnabled(false);
      } else {
        setIsTxLockTimeEnabled(undefined);
      }
    }
  };

  const handleAppConnections = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (event.target.checked) {
      if (await chrome.permissions.request({permissions: ['tabs']})) {
        setIsAppConnectionEnabled(true);
      }
    } else {
      await chrome.permissions.remove({permissions: ['tabs']});
      setIsAppConnectionEnabled(false);
    }
  };

  const handleLargeTxAmountChange = async (id: string, v: string) => {
    if (id === 'large-tx-amount') {
      if (isNumeric(v) && Number(v) >= 0) {
        setLargeTxAmountInput(Math.max(Number(v), 0));
        setIsSavingLargeTxProtectionSuccess(false);
        setErrorMessage(undefined);
      }
    }
  };

  const renderStatus = (v: string) => {
    return (
      <Typography color={theme.palette.wallet.text.secondary} variant="caption">
        {v}
      </Typography>
    );
  };

  // show loading spinner until access token available
  if (!isLoaded) {
    return (
      <Box className={classes.content}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  const suggestionStatus: Record<string, boolean> = {};
  const getIsSuggested = (isConfigured: boolean, key: string): boolean => {
    if (isConfigured) {
      return false;
    }

    if (!Object.values(suggestionStatus).find(v => v)) {
      suggestionStatus[key] = true;
      return true;
    }
    return suggestionStatus[key] ? suggestionStatus[key] : false;
  };

  interface preferenceItem {
    suggested?: boolean;
    component: React.ReactNode;
  }

  const preferenceList: preferenceItem[] = [
    {
      suggested: false,
      component: (
        <WalletPreference
          title={t('wallet.recoveryPhrase')}
          description={t('wallet.recoveryPhraseEnabled')}
          icon={<GppGoodOutlinedIcon className={classes.iconEnabled} />}
          statusElement={renderStatus(t('common.strong'))}
        >
          <Button
            className={classes.button}
            onClick={handleChangePasswordClicked}
            variant="contained"
            size="small"
          >
            {t('wallet.changeRecoveryPhrase')}
          </Button>
        </WalletPreference>
      ),
    },
    {
      suggested: getIsSuggested(!!recoveryKitStatus, 'recoveryKit'),
      component: (
        <WalletPreference
          title={t('wallet.recoveryKit')}
          description={
            recoveryKitStatus?.createdDate
              ? t('wallet.recoveryKitManage', {
                  emailAddress: recoveryKitStatus.emailAddress,
                  date: new Date(
                    recoveryKitStatus.createdDate,
                  ).toLocaleString(),
                })
              : t('wallet.recoveryKitSuggest')
          }
          expanded={getIsSuggested(!!recoveryKitStatus, 'recoveryKit')}
          icon={
            recoveryKitStatus ? (
              <GppGoodOutlinedIcon className={classes.iconEnabled} />
            ) : (
              <GppBadOutlinedIcon className={classes.iconDisabled} />
            )
          }
          statusElement={
            recoveryKitStatus
              ? renderStatus(t('common.on'))
              : renderStatus(t('common.off'))
          }
        >
          <Button
            className={classes.button}
            onClick={handleRecoveryKitClicked}
            variant="contained"
            size="small"
          >
            {t('common.create')} {t('wallet.recoveryKit')}
          </Button>
        </WalletPreference>
      ),
    },
    {
      suggested: getIsSuggested(isMfaEnabled, '2fa'),
      component: (
        <WalletPreference
          title={t('wallet.twoFactorAuthentication')}
          description={
            isMfaEnabled
              ? t('wallet.twoFactorAuthenticationEnabled')
              : t('wallet.twoFactorAuthenticationDisabled')
          }
          expanded={getIsSuggested(isMfaEnabled, '2fa')}
          icon={
            isMfaEnabled ? (
              <GppGoodOutlinedIcon className={classes.iconEnabled} />
            ) : (
              <GppBadOutlinedIcon className={classes.iconDisabled} />
            )
          }
          statusElement={renderStatus(
            isMfaEnabled ? t('common.on') : t('common.off'),
          )}
        >
          <Button
            className={classes.button}
            onClick={handleMfaClicked}
            color={isMfaEnabled ? 'warning' : undefined}
            variant={isMfaEnabled ? 'outlined' : 'contained'}
            size="small"
          >
            {isMfaEnabled ? t('manage.disable') : t('manage.enable')}
            {isMfaEnabled && ` (${t('common.notRecommended')})`}
          </Button>
        </WalletPreference>
      ),
    },
    {
      suggested: getIsSuggested(isLockEnabled, 'sessionLock'),
      component: (
        <WalletPreference
          title={t('wallet.sessionLock')}
          description={
            isLockEnabled
              ? t('wallet.sessionLockEnabledDescription')
              : t('wallet.sessionLockDisabledDescription')
          }
          expanded={getIsSuggested(isLockEnabled, 'sessionLock')}
          icon={
            isLockEnabled ? (
              <GppGoodOutlinedIcon className={classes.iconEnabled} />
            ) : (
              <GppBadOutlinedIcon className={classes.iconDisabled} />
            )
          }
          statusElement={renderStatus(
            isLockEnabled ? t('common.on') : t('common.off'),
          )}
        >
          <Button
            className={classes.button}
            onClick={handleLockClicked}
            color={isLockEnabled ? 'warning' : undefined}
            variant={isLockEnabled ? 'outlined' : 'contained'}
            size="small"
          >
            {isLockEnabled ? t('manage.disable') : t('manage.enable')}
            {isLockEnabled && ` (${t('common.notRecommended')})`}
          </Button>
        </WalletPreference>
      ),
    },
  ];

  return (
    <Box className={classes.container}>
      <Box className={classes.content}>
        {preferenceList.find(item => item.suggested) ? (
          <Box className={classes.recommendedContainer}>
            {preferenceList
              .filter(item => item.suggested)
              .map(item => item.component)}
            <Typography mt={4} variant="h6">
              {t('common.moreOptions')}
            </Typography>
          </Box>
        ) : (
          <Box className={classes.noRecommendationContainer}>
            <Alert
              severity="success"
              variant="filled"
              sx={{color: theme.palette.white}}
            >
              {t('wallet.yourWalletIsSecure')}
            </Alert>
            <Typography mt={4} variant="h6">
              {t('common.options')}
            </Typography>
          </Box>
        )}
        <Box>
          {preferenceList
            .filter(item => !item.suggested)
            .map(item => item.component)}
        </Box>
        <Box className={classes.noRecommendationContainer}>
          <Typography mt={4} variant="h6">
            {t('wallet.rules')}
          </Typography>
        </Box>
        <Box>
          {isChromeExtension() && (
            <WalletPreference
              title={t('extension.appConnections')}
              description={t('extension.appConnectionsDescription')}
              icon={
                isAppConnectionEnabled ? (
                  <CallReceivedIcon
                    className={cx(classes.icon, classes.iconEnabled)}
                  />
                ) : (
                  <CallMissedOutgoingIcon className={classes.icon} />
                )
              }
              statusElement={renderStatus(
                isAppConnectionEnabled ? t('common.on') : t('common.off'),
              )}
            >
              <FormControlLabel
                label={`${t('manage.enable')} ${t('extension.appConnections')}`}
                control={
                  <Checkbox
                    color={
                      theme.palette.mode === 'light' ? 'primary' : 'secondary'
                    }
                    checked={isAppConnectionEnabled}
                    onChange={handleAppConnections}
                  />
                }
              />
            </WalletPreference>
          )}
          <WalletPreference
            title={t('wallet.largeTxProtection')}
            description={t('wallet.largeTxProtectionDescription')}
            icon={
              isLargeTxProtectionEnabled ? (
                <LockOutlinedIcon
                  className={cx(classes.icon, classes.iconEnabled)}
                />
              ) : (
                <LockOpenOutlinedIcon className={classes.icon} />
              )
            }
            statusElement={renderStatus(
              isLargeTxProtectionEnabled && largeTxDisplayAmount !== undefined
                ? ` > ${largeTxDisplayAmount
                    .toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    })
                    .replace('.00', '')}`
                : t('common.off'),
            )}
          >
            {!featureFlags?.variations?.udMeServiceDomainsEnableManagement ? (
              <Alert severity="info">{t('common.comingSoon')}</Alert>
            ) : (
              <Box className={classes.flexContainer}>
                <ManageInput
                  value={
                    largeTxAmountInput !== undefined
                      ? String(largeTxAmountInput)
                      : largeTxDisplayAmount
                      ? String(largeTxDisplayAmount)
                      : undefined
                  }
                  onChange={handleLargeTxAmountChange}
                  id="large-tx-amount"
                  label={t('wallet.amount')}
                  placeholder={t('manage.enterAmount')}
                  startAdornment={<Typography ml={2}>$</Typography>}
                  disabled={isSavingLargeTxProtection}
                  mt={2}
                />
                <LoadingButton
                  className={classes.button}
                  variant="contained"
                  fullWidth
                  onClick={() => handleUpdateLargeTxProtectionClicked()}
                  size="small"
                  disabled={
                    largeTxAmountInput === undefined ||
                    isSavingLargeTxProtectionSuccess
                  }
                  loading={isSavingLargeTxProtection}
                  startIcon={
                    isSavingLargeTxProtectionSuccess ? <CheckIcon /> : undefined
                  }
                >
                  {isLargeTxProtectionEnabled
                    ? isSavingLargeTxProtectionSuccess
                      ? t('common.success')
                      : t('manage.update')
                    : t('manage.enable')}
                </LoadingButton>
                {isLargeTxProtectionEnabled && (
                  <Box width="100%" mt={1}>
                    <Button
                      color={isLargeTxProtectionEnabled ? 'warning' : undefined}
                      variant={
                        isLargeTxProtectionEnabled ? 'outlined' : 'contained'
                      }
                      fullWidth
                      onClick={() => handleDisableLargeTxProtectionClicked()}
                      disabled={isSavingLargeTxProtection}
                      size="small"
                    >
                      {t('manage.disable')} ({t('common.notRecommended')})
                    </Button>
                  </Box>
                )}
              </Box>
            )}
          </WalletPreference>
          <WalletPreference
            title={t('wallet.txLockManual')}
            description={t('wallet.txLockDescription')}
            icon={
              isTxLockManualEnabled ||
              (isTxLockTimeEnabled && isTxLockTimeEnabled > Date.now()) ? (
                <LockOutlinedIcon
                  className={cx(classes.icon, classes.iconEnabled)}
                />
              ) : (
                <LockOpenOutlinedIcon className={classes.icon} />
              )
            }
            statusElement={renderStatus(
              isTxLockManualEnabled || isTxLockTimeEnabled
                ? t('common.on')
                : t('common.off'),
            )}
          >
            {isMfaEnabled ? (
              isTxLockTimeEnabled && isTxLockTimeEnabled > Date.now() ? (
                <Alert severity="info">
                  <Markdown>
                    {t('wallet.txLockTimeStatus', {
                      date: new Date(isTxLockTimeEnabled).toLocaleString(),
                    })}
                  </Markdown>
                </Alert>
              ) : (
                <Button
                  className={classes.button}
                  variant="contained"
                  fullWidth
                  onClick={handleTxLockManualClicked}
                  size="small"
                >
                  {isTxLockManualEnabled
                    ? t('wallet.unlock')
                    : t('manage.configure')}
                </Button>
              )
            ) : (
              <Alert severity="warning">{t('wallet.txLockPrerequisite')}</Alert>
            )}
          </WalletPreference>
        </Box>
      </Box>
      {isRecoveryModalOpen && (
        <Modal
          title={t('wallet.recoveryKit')}
          open={isRecoveryModalOpen}
          fullScreen={false}
          onClose={() => setIsRecoveryModalOpen(false)}
        >
          <RecoverySetupModal accessToken={accessToken} />
        </Modal>
      )}
      {isPasswordModalOpen && (
        <Modal
          title={t('wallet.changeRecoveryPhrase')}
          open={isPasswordModalOpen}
          fullScreen={false}
          onClose={() => setIsPasswordModalOpen(false)}
        >
          <ChangePasswordModal accessToken={accessToken} />
        </Modal>
      )}
      {isMfaModalOpen && (
        <TwoFactorModal
          accessToken={accessToken}
          emailAddress="no-reply@unstoppabledomains.com"
          enabled={isMfaEnabled}
          open={isMfaModalOpen}
          onClose={() => setIsMfaModalOpen(false)}
          onUpdated={async (enabled: boolean) => setIsMfaEnabled(enabled)}
        />
      )}
      {isLockModalOpen && (
        <Modal
          title={t('wallet.sessionLock')}
          open={isLockModalOpen}
          fullScreen={false}
          onClose={() => setIsLockModalOpen(false)}
        >
          <SetupPinModal
            accessToken={accessToken}
            onComplete={() => setIsLockEnabled(true)}
            onClose={() => setIsLockModalOpen(false)}
          />
        </Modal>
      )}
      {isTxLockModalOpen && (
        <Modal
          title={t('wallet.txLockManual')}
          open={true}
          fullScreen={false}
          onClose={() => setIsTxLockModalOpen(false)}
        >
          <SetupTxLockModal
            accessToken={accessToken}
            onComplete={handleTxLockComplete}
            onClose={() => setIsTxLockModalOpen(false)}
          />
        </Modal>
      )}
      {otpPrompt && (
        <TwoFactorPromptModal
          message={
            isMfaEnabled
              ? t('wallet.twoFactorAuthenticationTotpDescription', {
                  action: t('common.operation').toLowerCase(),
                })
              : t('wallet.twoFactorAuthenticationEmailDescription', {
                  action: t('common.operation').toLowerCase(),
                  emailAddress:
                    clientState?.userName || t('common.yourEmailAddress'),
                })
          }
          open={true}
          onClose={() => {
            setIsSavingLargeTxProtection(false);
            setIsSavingLargeTxProtectionSuccess(false);
            setOtpPrompt(undefined);
          }}
          onComplete={
            otpPrompt === 'update'
              ? handleUpdateLargeTxProtectionClicked
              : handleDisableLargeTxProtectionClicked
          }
        />
      )}
    </Box>
  );
};

export default SecurityCenterModal;
