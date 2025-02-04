import GppBadOutlinedIcon from '@mui/icons-material/GppBadOutlined';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Alert from '@mui/lab/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import {useTheme} from '@mui/material/styles';
import Markdown from 'markdown-to-jsx';
import React, {useEffect, useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {useFeatureFlags} from '../../actions';
import {
  getRecoveryKitStatus,
  getTransactionLockStatus,
} from '../../actions/fireBlocksActions';
import {getTwoFactorStatus} from '../../actions/walletMfaActions';
import {useWeb3Context} from '../../hooks';
import {disablePin, isPinEnabled, useTranslationContext} from '../../lib';
import type {
  RecoveryStatusResponse,
  TransactionLockStatusResponse,
} from '../../lib/types/fireBlocks';
import Modal from '../Modal';
import ChangePasswordModal from './ChangePasswordModal';
import RecoverySetupModal from './RecoverySetupModal';
import SetupPinModal from './SetupPinModal';
import SetupTxLockModal from './SetupTxLockModal';
import {TwoFactorModal} from './TwoFactorModal';
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
  const {setTxLockStatus} = useWeb3Context();
  const theme = useTheme();
  const {data: featureFlags} = useFeatureFlags(false);
  const [recoveryKitStatus, setRecoveryKitStatus] =
    useState<RecoveryStatusResponse>();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isMfaModalOpen, setIsMfaModalOpen] = useState(false);
  const [isMfaEnabled, setIsMfaEnabled] = useState(false);
  const [isTxLockManualEnabled, setIsTxLockManualEnabled] = useState<boolean>();
  const [isTxLockTimeEnabled, setIsTxLockTimeEnabled] = useState<number>();
  const [isLockEnabled, setIsLockEnabled] = useState(false);
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [isTxLockModalOpen, setIsTxLockModalOpen] = useState(false);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const loadSettings = async () => {
      try {
        const [pinStatus, mfaStatus, recoveryStatus, txLockStatus] =
          await Promise.all([
            isPinEnabled(),
            getTwoFactorStatus(accessToken),
            getRecoveryKitStatus(accessToken),
            getTransactionLockStatus(accessToken),
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
      } finally {
        setIsLoaded(true);
      }
    };

    void loadSettings();
  }, [accessToken]);

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
      await disablePin();
      setIsLockEnabled(false);
    } else {
      setIsLockModalOpen(true);
    }
  };

  const handleTxLockManualClicked = async () => {
    setIsTxLockModalOpen(true);
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
      <Box display="flex" justifyContent="center">
        <CircularProgress />
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
          {featureFlags?.variations?.udMeEnableWalletChangePw && (
            <Button
              className={classes.button}
              onClick={handleChangePasswordClicked}
              variant="contained"
              size="small"
            >
              {t('wallet.changeRecoveryPhrase')}
            </Button>
          )}
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
            <Alert severity="success" variant="filled">
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
          <WalletPreference
            title={t('wallet.txLockManual')}
            description={t('wallet.txLockDescription')}
            icon={
              <LockOutlinedIcon
                className={cx(classes.icon, {
                  [classes.iconEnabled]:
                    isTxLockManualEnabled ||
                    (!!isTxLockTimeEnabled && isTxLockTimeEnabled > Date.now()),
                })}
              />
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
    </Box>
  );
};

export default SecurityCenterModal;
