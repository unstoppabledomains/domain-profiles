import CheckIcon from '@mui/icons-material/Check';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
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
  const [passwordVisible, setPasswordVisible] = useState(false);
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
      <Typography variant="body2" mb={1}>
        <Markdown>{t('wallet.recoveryKitDescription')}</Markdown>
      </Typography>
      <ManageInput
        id="password"
        type={passwordVisible ? undefined : 'password'}
        label={t('wallet.recoveryPhrase')}
        placeholder={t('wallet.enterRecoveryPhrase')}
        value={password}
        onChange={handleValueChanged}
        stacked={true}
        disabled={isSaving}
        onKeyDown={handleKeyDown}
        endAdornment={
          <IconButton
            className={classes.passwordIcon}
            onClick={() => {
              setPasswordVisible(!passwordVisible);
            }}
          >
            {passwordVisible ? (
              <Tooltip title={t('common.passwordHide')}>
                <VisibilityOffOutlinedIcon />
              </Tooltip>
            ) : (
              <Tooltip title={t('common.passwordShow')}>
                <VisibilityOutlinedIcon />
              </Tooltip>
            )}
          </IconButton>
        }
      />
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
