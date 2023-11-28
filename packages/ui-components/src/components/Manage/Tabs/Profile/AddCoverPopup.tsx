import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowRightOutlinedIcon from '@mui/icons-material/KeyboardArrowRightOutlined';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React from 'react';

import SendFileIcon from '@unstoppabledomains/ui-kit/icons/SendFile';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {useTranslationContext} from '../../../../lib';

const useStyles = makeStyles()((theme: Theme) => ({
  dialogRoot: {
    width: '100%',
    maxWidth: 420,
    paddingBottom: 0,
  },
  dialogHeader: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '1.5rem',
    padding: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
      padding: theme.spacing(3),
    },
  },
  dialogContent: {
    padding: theme.spacing(2),
    paddingTop: 0,
    [theme.breakpoints.up('sm')]: {
      padding: theme.spacing(3),
      paddingTop: 0,
    },
  },
  input: {
    display: 'none',
  },
  button: {
    width: '100%',
    padding: theme.spacing(2),
    borderColor: theme.palette.neutralShades[300],
  },
  buttonIconContainer: {
    marginRight: theme.spacing(2),
  },
  buttonStartIcon: {
    width: 32,
    height: 32,
  },
  buttonEndIcon: {
    width: 24,
    height: 24,
    fill: theme.palette.neutralShades[400],
  },
  buttonText: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  buttonDisabled: {
    '&.Mui-disabled': {
      opacity: 0.33,
      filter: 'grayscale(1)',
      color: theme.palette.neutralShades[600],
    },
  },
}));

type Props = {
  uiDisabled: boolean;
  popupOpen: boolean;
  handleCoverPopupClose: () => void;
  handleUploadClick: (event: {target: HTMLInputElement}) => void;
};

export const AddCoverPopup: React.FC<Props> = ({
  uiDisabled,
  popupOpen,
  handleCoverPopupClose,
  handleUploadClick,
}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();

  return (
    <Dialog
      open={popupOpen}
      onClose={handleCoverPopupClose}
      classes={{paper: classes.dialogRoot}}
    >
      <Typography variant="h5" className={classes.dialogHeader}>
        {t('manage.addCover')}
        <IconButton onClick={handleCoverPopupClose}>
          <CloseIcon />
        </IconButton>
      </Typography>

      <DialogContent className={classes.dialogContent}>
        <label htmlFor="upload-cover-input">
          <input
            disabled={uiDisabled}
            type="file"
            accept="image/png, image/jpeg"
            className={classes.input}
            id="upload-cover-input"
            onChange={handleUploadClick}
          />
          <Button
            component="span"
            variant="outlined"
            color="inherit"
            disabled={uiDisabled}
            classes={{
              startIcon: classes.buttonIconContainer,
              disabled: classes.buttonDisabled,
            }}
            className={classes.button}
            startIcon={
              <SendFileIcon
                color="primary"
                className={classes.buttonStartIcon}
              />
            }
            endIcon={
              <KeyboardArrowRightOutlinedIcon
                className={classes.buttonEndIcon}
              />
            }
          >
            <div className={classes.buttonText}>
              {t('manage.uploadPhoto')}
              <Typography variant="body2" color="textSecondary">
                {t('manage.coverJpgOrPngAndMaxSize')}
              </Typography>
            </div>
          </Button>
        </label>
      </DialogContent>
    </Dialog>
  );
};
