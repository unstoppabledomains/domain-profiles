import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useState} from 'react';
import {QRCode} from 'react-qrcode-logo';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {
  disableTwoFactor,
  getTwoFactorChallenge,
  verifyTwoFactorChallenge,
} from '../../actions/walletMfaActions';
import {useFireblocksAccessToken} from '../../hooks';
import ManageInput from '../Manage/common/ManageInput';
import Modal from '../Modal';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    width: '450px',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
  walletContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'space-between',
  },
  contentContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  loadingSpinner: {
    width: '75px',
    height: '75px',
  },
}));

interface TwoFactorModalProps {
  emailAddress: string;
  enabled?: boolean;
  open?: boolean;
  onClose: () => void;
  onUpdated?: (enabled: boolean) => Promise<void>;
}

export const TwoFactorModal: React.FC<TwoFactorModalProps> = ({
  emailAddress,
  enabled = false,
  open,
  onClose,
  onUpdated,
}) => {
  const {classes, cx} = useStyles();
  const getAccessToken = useFireblocksAccessToken();
  const [accessToken, setAccessToken] = useState('');
  const [qrCodeContent, setQrCodeContent] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [otp, setOtp] = useState<string>();

  useEffect(() => {
    const loadAccessToken = async () => {
      setAccessToken(await getAccessToken());
    };
    void loadAccessToken();
  }, []);

  useEffect(() => {
    if (!accessToken || !emailAddress) {
      return;
    }
    const loadStatus = async () => {
      // set callback if required
      if (onUpdated) {
        await onUpdated(enabled);
      }

      // if not enabled, retrieve QR code data
      if (!enabled) {
        const challenge = await getTwoFactorChallenge(accessToken);
        if (!challenge) {
          setErrorMessage('Error setting up two-factor authentication');
          return;
        }
        const encodedChallenge = `otpauth://totp/${encodeURIComponent(
          emailAddress,
        )}?secret=${challenge}`;
        setQrCodeContent(encodedChallenge);
      }
    };
    void loadStatus();
  }, [accessToken, emailAddress]);

  const handleClick = async () => {
    // validate OTP is set
    if (!otp) {
      return;
    }

    // enable or disable the configuration
    const operationFn = enabled ? disableTwoFactor : verifyTwoFactorChallenge;

    // perform the requested operation
    if (await operationFn(accessToken, otp)) {
      // update the configuration settings
      if (onUpdated) {
        await onUpdated(!enabled);
      }
    } else {
      setErrorMessage(
        'Invalid two-factor code. Check your authenticator app and try again.',
      );
      setOtp('');
      return;
    }

    // close the modal
    onClose();
  };

  const handleChange = (_id: string, value: string) => {
    setErrorMessage('');
    setOtp(value);
  };

  const handleKeyDown: React.KeyboardEventHandler = event => {
    if (event.key === 'Enter') {
      void handleClick();
    }
  };

  return (
    <Modal
      open={open || false}
      onClose={onClose}
      title={
        enabled
          ? 'Disable Two-Factor Authentication'
          : 'Enable Two-Factor Authentication'
      }
    >
      <Box className={classes.container}>
        <Typography variant="body2">
          {enabled
            ? 'Two-Factor Authentication (2FA) is highly recommended to ensure your wallet is secure. Use caution if you proceed to disable 2FA.'
            : 'Scan the QR code below with any authenticator app, such as Google Authenticator.'}
        </Typography>
        <Box className={cx(classes.walletContainer, classes.contentContainer)}>
          {!enabled &&
            (qrCodeContent ? (
              <QRCode
                value={qrCodeContent}
                size={200}
                qrStyle="dots"
                ecLevel="L"
              />
            ) : (
              <CircularProgress className={classes.loadingSpinner} />
            ))}
          <Box mt={1} mb={2} width="100%" textAlign="left">
            <ManageInput
              id="otp"
              value={otp}
              label="One-Time Code"
              placeholder="Enter code from authenticator app"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              disabled={!qrCodeContent && !enabled}
              error={errorMessage !== undefined && errorMessage.length > 0}
              errorText={errorMessage}
            />
          </Box>
          <Button
            variant="contained"
            fullWidth
            onClick={handleClick}
            disabled={!otp}
          >
            {enabled ? 'Disable 2FA' : 'Enable 2FA'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};
