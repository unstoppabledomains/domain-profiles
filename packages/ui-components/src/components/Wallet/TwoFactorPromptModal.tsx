import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import Markdown from 'markdown-to-jsx';
import React, {useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {useTranslationContext} from '../../lib';
import ManageInput from '../Manage/common/ManageInput';
import Modal from '../Modal';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  button: {
    marginTop: theme.spacing(1),
  },
}));

interface TwoFactorPromptModalProps {
  message: string;
  open?: boolean;
  onClose: () => void;
  onComplete: (otpCode: string) => void;
}

export const TwoFactorPromptModal: React.FC<TwoFactorPromptModalProps> = ({
  message,
  open,
  onClose,
  onComplete,
}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();
  const [otp, setOtp] = useState<string>();
  const [isButtonClicked, setIsButtonClicked] = useState(false);

  const handleSubmitOtp = async () => {
    // validate OTP is set
    if (!otp) {
      return;
    }

    // callback the OTP and close the window
    setIsButtonClicked(true);
    onComplete(otp);
  };

  const handleChange = (_id: string, value: string) => {
    setOtp(value);
  };

  const handleKeyDown: React.KeyboardEventHandler = event => {
    if (event.key === 'Enter') {
      void handleSubmitOtp();
    }
  };

  return (
    <Modal
      open={open || false}
      onClose={onClose}
      title={t('wallet.twoFactorAuthentication')}
    >
      <Box className={classes.container}>
        <Typography mb={2} variant="body2">
          <Markdown>{message}</Markdown>
        </Typography>
        <Box className={classes.container}>
          <ManageInput
            id="otp"
            value={otp}
            label={t('wallet.oneTimeCode')}
            placeholder={t('wallet.enter2FaCode')}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
          <LoadingButton
            variant="contained"
            fullWidth
            onClick={handleSubmitOtp}
            disabled={!otp}
            className={classes.button}
            loading={isButtonClicked}
          >
            {t('common.continue')}
          </LoadingButton>
        </Box>
      </Box>
    </Modal>
  );
};
