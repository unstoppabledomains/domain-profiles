import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import QrCodeIcon from '@mui/icons-material/QrCode';
import Box from '@mui/material/Box';
import type {ButtonProps} from '@mui/material/Button';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import {styled, useTheme} from '@mui/material/styles';
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
  button: {
    width: '100%',
    padding: theme.spacing(2),
  },
  actionButton: {
    marginTop: theme.spacing(1),
  },
  icon: {
    width: '40px',
    height: '40px',
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
}));

type Props = {
  onReceiveClicked: () => void;
  onBuyClicked: () => void;
  color?: 'primary' | 'secondary' | 'info' | 'inherit';
  variant?: 'contained' | 'outlined';
};

export const BuyCryptoButton: React.FC<Props> = ({
  onBuyClicked,
  color = 'primary',
  variant = 'contained',
}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();

  return (
    <StyledButton
      onClick={onBuyClicked}
      variant={variant}
      color={color}
      startIcon={<AccountBalanceIcon className={classes.icon} />}
      className={classes.button}
      shade={500}
    >
      <Box className={classes.content}>
        <Typography variant="body1" fontWeight="bold">
          {t('wallet.fundWithPurchaseTitle')}
        </Typography>
        <Typography variant="caption">
          {t('wallet.fundWithPurchaseDescription')}
        </Typography>
      </Box>
    </StyledButton>
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
      <Typography variant="h5" mb={3}>
        {t('wallet.letsGetStarted')}
      </Typography>
      <Box className={cx(classes.content, classes.centered)}>
        <Box mb={2} className={classes.content}>
          <BuyCryptoButton {...props} />
        </Box>
        <ReceiveCryptoButton {...props} />
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

export const ReceiveCryptoButton: React.FC<Props> = ({
  onReceiveClicked,
  color = 'primary',
  variant = 'contained',
}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();

  return (
    <StyledButton
      onClick={onReceiveClicked}
      variant={variant}
      color={color}
      startIcon={<QrCodeIcon className={classes.icon} />}
      className={classes.button}
      shade={100}
    >
      <Box className={classes.content}>
        <Typography variant="body1" fontWeight="bold">
          {t('wallet.fundWithTransferTitle')}
        </Typography>
        <Typography variant="caption">
          {t('wallet.fundWithTransferDescription')}
        </Typography>
      </Box>
    </StyledButton>
  );
};

type StyledButtonProps = ButtonProps & {
  colorPalette?: Record<number, string>;
  shade: number;
};

const StyledButton = styled(Button)<StyledButtonProps>(
  ({theme, shade, colorPalette = theme.palette.primaryShades}) => ({
    color: theme.palette.getContrastText(colorPalette[shade]),
    backgroundColor: colorPalette[shade],
    '&:hover': {
      backgroundColor: colorPalette[shade + 100],
    },
  }),
);
