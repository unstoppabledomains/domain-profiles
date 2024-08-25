import CloseIcon from '@mui/icons-material/Close';
import type {DialogProps} from '@mui/material/Dialog';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import type {ModalProps as MuiModalProps} from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import React from 'react';

import useTranslationContext from '../lib/i18n';
import useStyles from '../styles/components/modal.styles';
import {TitleWithBackButton} from './Wallet';

export type ModalProps = {
  title?: string | JSX.Element;
  open: boolean;
  centerHeader?: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /**
   * Disables modal backdrop and ESC clicks to close the dialog https://v4.mui.com/components/dialogs/#confirmation-dialogs
   * Acts as a confirmation dialog where only a close button can hide the dialog
   */
  isConfirmation?: boolean;
  noContentPadding?: boolean;
  titleStyle?: string;
  dialogPaperStyle?: string;
  includeHeaderPadding?: boolean;
  noModalHeader?: boolean;
  fullScreen?: boolean;
};

/**
 * UD Modal component which wraps MUI Dialog and unifies the design to match branding
 */
const Modal: React.FC<ModalProps> = ({
  open,
  title,
  titleStyle,
  dialogPaperStyle,
  onClose,
  children,
  isConfirmation = false,
  centerHeader = false,
  noContentPadding = false,
  includeHeaderPadding = false,
  noModalHeader = false,
  fullScreen,
}) => {
  const {classes, cx} = useStyles();
  const [t] = useTranslationContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleCloseOnBlur: MuiModalProps['onClose'] = event => {
    if (isConfirmation) {
      return;
    }
    onClose();
  };

  const dialogProps: DialogProps = {
    open: open || false,
    onClose: handleCloseOnBlur,
    classes: {paper: cx(classes.dialogRoot, dialogPaperStyle)},
  };

  return (
    <Dialog
      {...dialogProps}
      fullWidth={isMobile}
      fullScreen={fullScreen}
      className={cx({
        [classes.fullScreen]: fullScreen,
      })}
    >
      <div className={classes.modalContent} data-testid={`${title}-modal`}>
        {!noModalHeader && (
          <div
            className={cx(classes.modalHeader, {
              [classes.centerHeader]: centerHeader,
              [classes.modalHeaderPadding]: includeHeaderPadding,
            })}
          >
            {fullScreen && typeof title === 'string' ? (
              <TitleWithBackButton label={title} onCancelClick={onClose} />
            ) : (
              <>
                <Typography
                  variant="h5"
                  color="primary"
                  className={cx(titleStyle ?? '', classes.bold)}
                >
                  {title}
                </Typography>
                <IconButton
                  onClick={onClose}
                  aria-label={t('common.close')}
                  size="large"
                >
                  <CloseIcon />
                </IconButton>
              </>
            )}
          </div>
        )}
        <div
          className={
            noContentPadding && !fullScreen
              ? classes.contentContainerNoPadding
              : classes.contentContainer
          }
        >
          {children}
        </div>
      </div>
    </Dialog>
  );
};

export default Modal;
