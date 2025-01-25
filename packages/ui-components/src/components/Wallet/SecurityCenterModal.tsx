import GppBadOutlinedIcon from '@mui/icons-material/GppBadOutlined';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {useFeatureFlags} from '../../actions';
import {getTwoFactorStatus} from '../../actions/walletMfaActions';
import {disablePin, isPinEnabled, useTranslationContext} from '../../lib';
import Modal from '../Modal';
import ChangePasswordModal from './ChangePasswordModal';
import RecoverySetupModal from './RecoverySetupModal';
import SetupPinModal from './SetupPinModal';
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
    },
    height: '500px',
    overflow: 'auto',
  },
  recommendedContainer: {
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.dangerShades[100],
  },
  recommendedText: {
    color: theme.palette.getContrastText(theme.palette.dangerShades[100]),
  },
  button: {
    marginTop: theme.spacing(3),
  },
  modalTitleStyle: {
    color: 'inherit',
    alignSelf: 'center',
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
  const {classes} = useStyles();
  const [t] = useTranslationContext();
  const {data: featureFlags} = useFeatureFlags(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isMfaModalOpen, setIsMfaModalOpen] = useState(false);
  const [isMfaEnabled, setIsMfaEnabled] = useState(false);
  const [isLockEnabled, setIsLockEnabled] = useState(false);
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const loadSettings = async () => {
      try {
        setIsLockEnabled(await isPinEnabled());
        setIsMfaEnabled(await getTwoFactorStatus(accessToken));
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

  // show loading spinner until access token available
  if (!isLoaded) {
    return (
      <Box display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  interface preferenceItem {
    enabled: boolean;
    component: React.ReactNode;
  }
  const preferenceList: preferenceItem[] = [
    {
      enabled: true,
      component: (
        <WalletPreference
          title={t('wallet.recoveryPhrase')}
          description={t('wallet.recoveryPhraseEnabled')}
          icon={<GppGoodOutlinedIcon className={classes.iconEnabled} />}
        >
          {featureFlags?.variations?.udMeEnableWalletChangePw && (
            <Button
              onClick={handleChangePasswordClicked}
              variant="outlined"
              size="small"
            >
              {t('wallet.changeRecoveryPhrase')}
            </Button>
          )}
        </WalletPreference>
      ),
    },
    {
      enabled: true,
      component: (
        <WalletPreference
          title={t('wallet.recoveryKit')}
          description={t('wallet.recoveryKitManage')}
          icon={<GppGoodOutlinedIcon className={classes.iconEnabled} />}
        >
          <Button
            onClick={handleRecoveryKitClicked}
            variant="outlined"
            size="small"
          >
            {t('manage.manageProfile')} {t('wallet.recoveryKit')}
          </Button>
        </WalletPreference>
      ),
    },
    {
      enabled: isMfaEnabled,
      component: (
        <WalletPreference
          title={t('wallet.twoFactorAuthentication')}
          description={
            isMfaEnabled
              ? t('wallet.twoFactorAuthenticationEnabled')
              : t('wallet.twoFactorAuthenticationDisabled')
          }
          icon={
            isMfaEnabled ? (
              <GppGoodOutlinedIcon className={classes.iconEnabled} />
            ) : (
              <GppBadOutlinedIcon className={classes.iconDisabled} />
            )
          }
        >
          <Button
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
      enabled: isLockEnabled,
      component: (
        <WalletPreference
          title={t('wallet.sessionLock')}
          description={
            isLockEnabled
              ? t('wallet.sessionLockEnabledDescription')
              : t('wallet.sessionLockDisabledDescription')
          }
          icon={
            isLockEnabled ? (
              <GppGoodOutlinedIcon className={classes.iconEnabled} />
            ) : (
              <GppBadOutlinedIcon className={classes.iconDisabled} />
            )
          }
        >
          <Button
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
        {preferenceList.find(item => !item.enabled) && (
          <Box className={classes.recommendedContainer}>
            {preferenceList
              .filter(item => !item.enabled)
              .map((item, i) => (
                <Box
                  className={classes.recommendedText}
                  mt={i === 0 ? -3 : undefined}
                >
                  {item.component}
                </Box>
              ))}
          </Box>
        )}
        {preferenceList
          .filter(item => item.enabled)
          .map(item => item.component)}
      </Box>
      {isRecoveryModalOpen && (
        <Modal
          title={t('wallet.recoveryKit')}
          open={isRecoveryModalOpen}
          fullScreen={false}
          titleStyle={classes.modalTitleStyle}
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
          titleStyle={classes.modalTitleStyle}
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
          titleStyle={classes.modalTitleStyle}
          onClose={() => setIsLockModalOpen(false)}
        >
          <SetupPinModal
            accessToken={accessToken}
            onComplete={() => setIsLockEnabled(true)}
            onClose={() => setIsLockModalOpen(false)}
          />
        </Modal>
      )}
    </Box>
  );
};

export default SecurityCenterModal;
