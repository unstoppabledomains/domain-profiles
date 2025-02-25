import AddLinkIcon from '@mui/icons-material/AddLink';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowRightOutlinedIcon from '@mui/icons-material/KeyboardArrowRightOutlined';
import StarOutlinedIcon from '@mui/icons-material/StarOutlined';
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
  marginButton: {
    marginBottom: theme.spacing(2),
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
    textAlign: 'left',
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
  handleAvatarPopupClose: () => void;
  handleUrlPopupOpen: () => void;
  handleNftPopupOpen: () => void;
  handleUploadClick: (event: {target: HTMLInputElement}) => void;
};

export const AddAvatarPopup: React.FC<Props> = ({
  uiDisabled,
  popupOpen,
  handleAvatarPopupClose,
  handleUrlPopupOpen,
  handleNftPopupOpen,
  handleUploadClick,
}) => {
  const {classes, cx} = useStyles();
  const [t] = useTranslationContext();

  return (
    <Dialog
      open={popupOpen}
      onClose={handleAvatarPopupClose}
      classes={{paper: classes.dialogRoot}}
    >
      <Typography variant="h5" className={classes.dialogHeader}>
        {t('manage.addAvatar')}
        <IconButton onClick={handleAvatarPopupClose}>
          <CloseIcon />
        </IconButton>
      </Typography>

      <DialogContent className={classes.dialogContent}>
        <label htmlFor="upload-avatar-input">
          <input
            disabled={uiDisabled}
            type="file"
            accept="image/png, image/jpeg, image/gif"
            className={classes.input}
            id="upload-avatar-input"
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
            className={cx(classes.button, classes.marginButton)}
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
              {t('manage.uploadAvatar')}
              <Typography variant="body2" color="textSecondary">
                {t('manage.avatarJpgOrPngAndMaxSize')}
              </Typography>
            </div>
          </Button>
        </label>
        <Button
          variant="outlined"
          color="inherit"
          disabled={uiDisabled}
          onClick={handleNftPopupOpen}
          classes={{
            startIcon: classes.buttonIconContainer,
            disabled: classes.buttonDisabled,
          }}
          className={classes.button}
          startIcon={
            <StarOutlinedIcon
              color="primary"
              className={classes.buttonStartIcon}
            />
          }
          endIcon={
            <KeyboardArrowRightOutlinedIcon className={classes.buttonEndIcon} />
          }
        >
          <div className={classes.buttonText}>
            {t('manage.selectNft')}
            <Typography variant="body2" color="textSecondary">
              {t('manage.selectNftDescription')}
            </Typography>
          </div>
        </Button>
      </DialogContent>
    </Dialog>
  );
};
