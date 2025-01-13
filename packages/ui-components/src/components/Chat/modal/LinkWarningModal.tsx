import BlockIcon from '@mui/icons-material/Block';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import WarningIcon from '@mui/icons-material/Warning';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import useTranslationContext from '../../../lib/i18n';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    '& .MuiPaper-root': {
      minWidth: '420px',
      maxWidth: '420px',
      alignItems: 'center',
      [theme.breakpoints.down('md')]: {
        minWidth: '100%',
        maxWidth: '100%',
        overflowX: 'hidden',
      },
    },
    '& .MuiDialogContent-root': {
      padding: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      [theme.breakpoints.down('md')]: {
        padding: 0,
      },
    },
  },
  warningIcon: {
    color: theme.palette.warning.main,
    marginBottom: theme.spacing(2),
    width: '85px',
    height: '85px',
  },
  warningText: {
    marginBottom: theme.spacing(3),
    color: theme.palette.neutralShades[600],
    textAlign: 'center',
  },
  urlText: {
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(2),
  },
  contentContainer: {
    margin: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  title: {
    marginBottom: theme.spacing(3),
  },
  actionButton: {
    width: '100%',
    marginTop: theme.spacing(2),
  },
  openButton: {
    color: theme.palette.getContrastText(theme.palette.background.default),
  },
  cancelBlockButton: {
    color: theme.palette.getContrastText(theme.palette.warning.main),
  },
  cancelButton: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(-1),
    backgroundColor: 'transparent',
    '&.MuiButtonBase-root:hover': {
      backgroundColor: 'transparent',
    },
  },
}));

export const LinkWarningModal: React.FC<LinkWarningModalProps> = ({
  url,
  onBlockTopic,
  onClose,
}) => {
  const [t] = useTranslationContext();
  const {cx, classes} = useStyles();

  const handleOpenLink = () => {
    window.open(url, '_blank');
  };

  return (
    <Dialog
      className={classes.container}
      open={Boolean(url)}
      onClose={onClose}
      data-testid={'link-warning-modal'}
    >
      <DialogContent>
        <Box className={classes.contentContainer}>
          <WarningIcon className={classes.warningIcon} />
          <Typography variant="h4" className={classes.title}>
            {t('common.warning')}
          </Typography>
          <Typography variant="body2" className={classes.warningText}>
            {t('push.linkWarning')}
          </Typography>
          <Typography variant="h5" className={classes.urlText}>
            {url}
          </Typography>
          <Button
            variant="contained"
            color="inherit"
            disableElevation={true}
            className={cx(classes.actionButton, classes.openButton)}
            onClick={handleOpenLink}
          >
            <OpenInNewIcon />
            &nbsp;
            {t('push.linkOpen')}
          </Button>
          <Button
            variant="contained"
            color="warning"
            className={cx(classes.actionButton, classes.cancelBlockButton)}
            onClick={onBlockTopic}
          >
            <BlockIcon />
            &nbsp;
            {t('push.linkCancelBlock')}
          </Button>
          <Button
            variant="text"
            color="primary"
            className={cx(classes.actionButton, classes.cancelButton)}
            onClick={onClose}
          >
            {t('push.linkCancel')}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export type LinkWarningModalProps = {
  url?: string;
  onBlockTopic: () => void;
  onClose: () => void;
};

export default LinkWarningModal;
