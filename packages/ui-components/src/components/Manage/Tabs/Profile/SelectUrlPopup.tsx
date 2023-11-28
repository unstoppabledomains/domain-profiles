import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, {useState} from 'react';

import {useTranslationContext} from '../../../../lib';
import useStyles from '../../../../styles/components/SelectUrlPopup.styles';
import FormError from './FormError';

export type SelectUrlPopupProps = {
  popupOpen: boolean;
  handlePopupClose: () => void;
  handleSelectUrlClick: (url: string) => void;
};

const isValidWeb2Url = (v: string) => {
  // TODO
  return true;
};

const isValidImageUrl = (url: string) => {
  if (url === '') return true;

  if (!isValidWeb2Url(url)) {
    return false;
  }
  const split = url.split('.');
  const last = split.pop();
  return (
    last && ['jpg', 'jpeg', 'png', 'gif', 'glb'].includes(last.toLowerCase())
  );
};

const SelectUrlPopup: React.FC<SelectUrlPopupProps> = ({
  popupOpen,
  handlePopupClose,
  handleSelectUrlClick,
}) => {
  const [t] = useTranslationContext();
  const {classes, cx} = useStyles();
  const [url, setUrl] = useState<string>('');
  const [blurred, setBlurred] = useState<boolean>(false);

  const isValid = isValidImageUrl(url);
  const haveError = Boolean(url) && blurred && !isValidImageUrl(url);

  return (
    <Dialog
      open={popupOpen}
      onClose={handlePopupClose}
      classes={{paper: classes.dialogRoot}}
    >
      <Typography variant="h5" className={classes.dialogHeader}>
        {t('manage.enterAvatarUrl')}
        <IconButton data-testid="url-close-button" onClick={handlePopupClose}>
          <CloseIcon />
        </IconButton>
      </Typography>

      <DialogContent className={classes.dialogContent}>
        <Typography
          variant="body2"
          component="div"
          className={classes.dialogSubheader}
        >
          {t('manage.avatarUrlRequirements')}
        </Typography>
        <TextField
          fullWidth
          value={url}
          label={t('manage.avatarUrl')}
          onChange={event => {
            setBlurred(false);
            setUrl(event.target.value);
          }}
          onBlur={() => {
            setBlurred(true);
          }}
          error={haveError}
        />
        {haveError && (
          <Box mt={1}>
            <FormError message={t('manage.invalidAvatarUrl')} />
          </Box>
        )}
      </DialogContent>
      <Divider />
      <DialogActions className={classes.dialogActions}>
        <Button
          disabled={url === '' || !isValid}
          variant="contained"
          color="primary"
          onClick={() => {
            if (url && isValid) {
              handleSelectUrlClick(url);
            }
            handlePopupClose();
          }}
          className={classes.dialogConfirmButton}
          disableElevation
        >
          {t('common.done')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SelectUrlPopup;
