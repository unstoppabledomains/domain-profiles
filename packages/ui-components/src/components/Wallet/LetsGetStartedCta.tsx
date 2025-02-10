import PaymentIcon from '@mui/icons-material/Payment';
import QrCodeIcon from '@mui/icons-material/QrCode';
import Box from '@mui/material/Box';
import type {ButtonProps} from '@mui/material/Button';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import {darken, styled, useTheme} from '@mui/material/styles';
import React, {useState} from 'react';
import useAsyncEffect from 'use-async-effect';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {useWeb3Context} from '../../hooks';
import {useTranslationContext} from '../../lib';
import {localStorageWrapper} from '../Chat';
import Modal from '../Modal';
import ClaimWalletModal from './ClaimWalletModal';
import {OperationStatus} from './OperationStatus';

const passwordCtaConfirmField = 'passwordCtaConfirmed';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
    width: '100%',
  },
  modal: {
    maxWidth: '400px',
  },
  centered: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[3],
    padding: theme.spacing(2),
  },
  buttonContent: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  buttonTitle: {
    maxWidth: '195px',
    fontWeight: 'bold',
  },
  button: {
    marginTop: theme.spacing(2),
  },
  actionButton: {
    marginTop: theme.spacing(1),
  },
  icon: {
    width: '30px',
    height: '30px',
  },
  primary: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.getContrastText(theme.palette.primary.main),
  },
  secondary: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.getContrastText(theme.palette.background.paper),
  },
}));

type Props = {
  onReceiveClicked: () => void;
  onBuyClicked: () => void;
};

export const BuyCryptoButton: React.FC<Props> = ({onBuyClicked}) => {
  const {classes, cx} = useStyles();
  const theme = useTheme();
  const [t] = useTranslationContext();

  return (
    <Box className={cx(classes.buttonContainer, classes.primary)}>
      <Box className={classes.buttonContent}>
        <Typography variant="subtitle1" className={classes.buttonTitle}>
          {t('wallet.fundWithPurchaseDescription')}
        </Typography>
        <PaymentIcon className={classes.icon} />
      </Box>
      <Box className={classes.buttonContent}>
        <StyledButton
          fullWidth
          variant="contained"
          className={classes.button}
          backgroundColor={theme.palette.common.white}
          onClick={onBuyClicked}
          disableElevation
          size="small"
        >
          {t('wallet.fundWithPurchaseTitle')}
        </StyledButton>
      </Box>
    </Box>
  );
};

export const LetsGetStartedCta: React.FC<Props> = props => {
  const theme = useTheme();
  const {classes, cx} = useStyles();
  const [t] = useTranslationContext();
  const {setAccessToken} = useWeb3Context();
  const [showPasswordCta, setShowPasswordCta] = useState<boolean>();
  const [showClaimWallet, setShowClaimWallet] = useState<boolean>();

  useAsyncEffect(async () => {
    const isCtaConfirmed = await localStorageWrapper.getItem(
      passwordCtaConfirmField,
    );
    if (isCtaConfirmed) {
      setShowPasswordCta(false);
      return;
    }
    await localStorageWrapper.setItem(passwordCtaConfirmField, 'true');
    setShowPasswordCta(true);
  }, []);

  const handleSkipClicked = async () => {
    handleClose();
  };

  const handleSetPasswordClicked = () => {
    setShowClaimWallet(true);
  };

  const handleClose = () => {
    setShowPasswordCta(false);
  };

  const handleComplete = (token: string) => {
    setAccessToken(token);
    handleClose();
  };

  return (
    <Box className={classes.container}>
      <Typography variant="h4" mb={3}>
        {t('wallet.letsGetStarted')}
      </Typography>
      <Box className={cx(classes.content, classes.centered)}>
        <Box mb={2} className={classes.content}>
          <BuyCryptoButton {...props} />
        </Box>
        <Box className={classes.content}>
          <ReceiveCryptoButton {...props} />
        </Box>
      </Box>
      {showPasswordCta && (
        <Modal open={showPasswordCta} onClose={handleClose} noModalHeader>
          <Box className={classes.modal}>
            {showClaimWallet ? (
              <ClaimWalletModal onComplete={handleComplete} />
            ) : (
              <Box className={cx(classes.content, classes.centered)}>
                <OperationStatus
                  success={true}
                  label={t('wallet.successDescription')}
                >
                  <Typography
                    variant="body2"
                    mb={2}
                    color={theme.palette.wallet.text.primary}
                  >
                    {t('wallet.setPasswordNowOrLater')}
                  </Typography>
                </OperationStatus>
                <Button
                  fullWidth
                  variant="outlined"
                  className={classes.actionButton}
                  onClick={handleSkipClicked}
                >
                  {t('common.skipForNow')}
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  className={classes.actionButton}
                  onClick={handleSetPasswordClicked}
                >
                  {t('wallet.claimWalletCtaButton')}
                </Button>
              </Box>
            )}
          </Box>
        </Modal>
      )}
    </Box>
  );
};

export const ReceiveCryptoButton: React.FC<Props> = ({onReceiveClicked}) => {
  const {classes, cx} = useStyles();
  const theme = useTheme();
  const [t] = useTranslationContext();

  return (
    <Box className={cx(classes.buttonContainer, classes.secondary)}>
      <Box className={classes.buttonContent}>
        <Typography variant="subtitle1" className={classes.buttonTitle}>
          {t('wallet.fundWithTransferDescription')}
        </Typography>
        <QrCodeIcon className={classes.icon} />
      </Box>
      <Box className={classes.buttonContent}>
        <StyledButton
          fullWidth
          variant="contained"
          className={classes.button}
          backgroundColor={theme.palette.neutralShades[100]}
          onClick={onReceiveClicked}
          disableElevation
          size="small"
        >
          {t('wallet.fundWithTransferTitle')}
        </StyledButton>
      </Box>
    </Box>
  );
};

type StyledButtonProps = ButtonProps & {
  backgroundColor: string;
};

const StyledButton = styled(Button)<StyledButtonProps>(
  ({theme, backgroundColor = theme.palette.primary.main}) => ({
    color: theme.palette.getContrastText(backgroundColor),
    backgroundColor,
    '&:hover': {
      backgroundColor: darken(backgroundColor, 0.1),
    },
  }),
);
