import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React, {useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {sendBootstrapCode} from '../../../../actions/fireBlocksActions';
import {useTranslationContext} from '../../../../lib';
import Modal from '../../../Modal';
import ManageInput from '../../common/ManageInput';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    marginTop: theme.spacing(3),
    minHeight: '110px',
    justifyContent: 'space-between',
  },
  titleStyle: {
    color: 'inherit',
    alignSelf: 'center',
  },
  button: {
    marginTop: theme.spacing(3),
    width: '100%',
  },
}));

export const ForgotCode: React.FC<ForgotCodeProps> = ({open, onClose}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [emailAddress, setEmailAddress] = useState<string>();

  const handleInputChange = (_id: string, value: string) => {
    setIsDirty(true);
    setEmailAddress(value);

    // validate the email address
    setErrorMessage(
      !value.match(
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      )
        ? t('common.enterValidEmail')
        : undefined,
    );
  };

  const handleKeyDown: React.KeyboardEventHandler = event => {
    if (event.key === 'Enter') {
      void handleSave();
    }
  };

  const handleSave = async () => {
    // validate no errors
    if (errorMessage || !emailAddress) {
      return;
    }

    // send the error code to provided email address
    setIsDirty(false);
    setIsSaving(true);
    const sendResult = await sendBootstrapCode(emailAddress);
    if (sendResult) {
      onClose();
    } else {
      setErrorMessage(t('wallet.forgotBootstrapCodeError'));
    }

    // saving complete
    setIsSaving(false);
    onClose();
  };

  return (
    <Modal
      title={t('wallet.getBootstrapCode')}
      open={open}
      onClose={onClose}
      titleStyle={classes.titleStyle}
      noContentPadding
    >
      <Box display="flex" width="100%" justifyItems="left" maxWidth="400px">
        <Typography variant="body2">
          {t('wallet.forgotBootstrapCodeDescription')}
        </Typography>
      </Box>
      <Box className={classes.container}>
        <ManageInput
          id="emailAddress"
          value={emailAddress}
          label={t('common.email')}
          placeholder={t('common.enterYourEmail')}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          stacked={false}
          disabled={isSaving}
          error={errorMessage !== undefined}
        />
        <LoadingButton
          disabled={!isDirty || errorMessage !== undefined}
          variant="contained"
          onClick={handleSave}
          loading={isSaving}
          className={classes.button}
        >
          {t('wallet.sendBootstrapCode')}
        </LoadingButton>
      </Box>
    </Modal>
  );
};

export interface ForgotCodeProps {
  open: boolean;
  onClose: () => void;
}
