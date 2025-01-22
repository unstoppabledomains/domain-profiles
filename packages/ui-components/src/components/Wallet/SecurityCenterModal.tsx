import GppBadOutlinedIcon from '@mui/icons-material/GppBadOutlined';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {getTwoFactorStatus} from '../../actions/walletMfaActions';
import {useTranslationContext} from '../../lib';
import Modal from '../Modal';
import ChangePasswordModal from './ChangePasswordModal';
import RecoverySetupModal from './RecoverySetupModal';
import {TwoFactorModal} from './TwoFactorModal';
import {WalletPreference} from './WalletPreference';

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
  const [isLoaded, setIsLoaded] = useState(false);
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isMfaModalOpen, setIsMfaModalOpen] = useState(false);
  const [isMfaEnabled, setIsMfaEnabled] = useState(false);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const loadSettings = async () => {
      try {
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

  // show loading spinner until access token available
  if (!isLoaded) {
    return (
      <Box display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className={classes.container}>
      <Box className={classes.content}>
        <WalletPreference
          title={t('wallet.recoveryPhrase')}
          description={t('wallet.recoveryPhraseEnabled')}
          icon={<GppGoodOutlinedIcon className={classes.iconEnabled} />}
        >
          <Button
            onClick={handleChangePasswordClicked}
            variant="contained"
            size="small"
          >
            {t('wallet.changeRecoveryPhrase')}
          </Button>
        </WalletPreference>
        <WalletPreference
          title={t('wallet.recoveryKit')}
          description={t('wallet.recoveryKitManage')}
          icon={<GppGoodOutlinedIcon className={classes.iconEnabled} />}
        >
          <Button
            onClick={handleRecoveryKitClicked}
            variant="contained"
            size="small"
          >
            {t('manage.manageProfile')} {t('wallet.recoveryKit')}
          </Button>
        </WalletPreference>
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
            {isMfaEnabled ? t('manage.disable') : t('manage.enable')}{' '}
            {t('wallet.twoFactorAuthentication')}
          </Button>
        </WalletPreference>
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
    </Box>
  );
};

export default SecurityCenterModal;
