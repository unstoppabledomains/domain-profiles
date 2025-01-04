import CheckIcon from '@mui/icons-material/Check';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import Markdown from 'markdown-to-jsx';
import React, {useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {sendRecoveryEmail} from '../../actions/fireBlocksActions';
import {useTranslationContext} from '../../lib';
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
    width: '450px',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
  button: {
    marginTop: theme.spacing(3),
  },
  passwordIcon: {
    margin: theme.spacing(0.5),
  },
}));

type Props = {
  accessToken?: string;
};

const RecoverySetupModal: React.FC<Props> = ({accessToken}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();
  const [password, setPassword] = useState<string>();
  const [isSuccess, setIsSuccess] = useState<boolean>();
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const handleValueChanged = (id: string, v: string) => {
    if (id === 'password') {
      setPassword(v);
      setIsDirty(true);
      setIsSuccess(undefined);
    }
  };

  const handleKeyDown: React.KeyboardEventHandler = event => {
    if (event.key === 'Enter') {
      void handleGenerateKit();
    }
  };

  const handleGenerateKit = async () => {
    // validate password and token
    if (!accessToken || !password) {
      return;
    }

    // request a new recovery kit
    setIsSaving(true);
    setIsSuccess(await sendRecoveryEmail(accessToken, password));
    setIsSaving(false);
    setIsDirty(false);
  };

  // show loading spinner until access token available
  if (!accessToken) {
    return (
      <Box display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className={classes.container}>
      <Box className={classes.content}>
        <Typography variant="body2" mb={1} mt={-2} component="div">
          <Markdown>{t('wallet.recoveryKitDescription')}</Markdown>
        </Typography>
        <ManageInput
          id="password"
          type={'password'}
          autoComplete="current-password"
          label={t('wallet.recoveryPhrase')}
          placeholder={t('wallet.enterRecoveryPhrase')}
          value={password}
          onChange={handleValueChanged}
          stacked={true}
          disabled={isSaving}
          onKeyDown={handleKeyDown}
        />
      </Box>
      <LoadingButton
        variant="contained"
        fullWidth
        loading={isSaving}
        onClick={handleGenerateKit}
        className={classes.button}
        disabled={isSaving || !isDirty}
      >
        {isSuccess ? (
          <Box display="flex" alignItems="center">
            <CheckIcon />
            <Typography ml={1}>{t('common.success')}</Typography>
          </Box>
        ) : isSuccess === false ? (
          t('wallet.recoveryKitError')
        ) : (
          t('common.continue')
        )}
      </LoadingButton>
    </Box>
  );
};

export default RecoverySetupModal;
