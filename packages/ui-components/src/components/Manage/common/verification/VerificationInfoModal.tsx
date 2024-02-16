import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React from 'react';
import truncateEthAddress from 'truncate-eth-address';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {useTranslationContext} from '../../../../lib';
import CopyToClipboard from '../../../CopyToClipboard';
import Link from '../../../Link';

const useStyles = makeStyles()((theme: Theme) => ({
  dialogRoot: {
    padding: theme.spacing(3),
  },
  modalHeader: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    color: theme.palette.common.black,
  },
  modalSubTitle: {
    color: theme.palette.neutralShades[600],
  },
  contentContainer: {
    marginTop: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
  },
  infoText: {
    color: theme.palette.neutralShades[600],
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
}));

type Props = {
  open: boolean;
  ownerAddress: string;
  walletAddress: string;
  symbol: string;
  onClose: () => void;
  onVerifyClick: () => void;
  showDelegateInfo?: boolean;
};

const VerificationInfoModal: React.FC<Props> = ({
  open,
  onClose,
  onVerifyClick,
  showDelegateInfo,
  ownerAddress,
  walletAddress,
}) => {
  const [t] = useTranslationContext();
  const {classes} = useStyles();

  const handleClickDelegate = async () => {
    window.open(
      `https://delegate.xyz/profile/${walletAddress}/registry?r`,
      '_blank',
    );
  };

  return (
    <Dialog open={open} onClose={onClose} classes={{paper: classes.dialogRoot}}>
      <Box className={classes.modalHeader}>
        <Box display="flex" flexDirection="column">
          <Typography variant="h5" className={classes.modalTitle}>
            {t('manage.verificationInfoModal.title')}
          </Typography>
          <Typography className={classes.modalSubTitle} variant="caption">
            {t('manage.verificationInfoModal.address', {
              walletAddress,
            })}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="large">
          <CloseIcon />
        </IconButton>
      </Box>
      <Box className={classes.contentContainer}>
        <Typography variant="body1">
          {t('manage.verificationInfoModal.introduction', {
            ownerAddress: truncateEthAddress(ownerAddress),
            walletAddress: truncateEthAddress(walletAddress),
          })}
        </Typography>
        <Typography mt={3} variant="h6">
          {showDelegateInfo &&
            t('manage.verificationInfoModal.optionN', {number: 1})}{' '}
          {t('manage.verificationInfoModal.verifyWithSignature')}
        </Typography>
        <Typography className={classes.infoText} variant="body2">
          {t('manage.verificationInfoModal.infoSigning', {
            ownerAddress: truncateEthAddress(ownerAddress),
            walletAddress: truncateEthAddress(walletAddress),
          })}
        </Typography>
        <Button fullWidth onClick={onVerifyClick} variant="contained">
          {t('manage.verificationInfoModal.signAndVerify')}
        </Button>
        {showDelegateInfo && (
          <>
            <Typography mt={3} variant="h6">
              {showDelegateInfo &&
                t('manage.verificationInfoModal.optionN', {number: 2})}{' '}
              {t('manage.verificationInfoModal.verifyWithDelegate')}
            </Typography>
            <Typography className={classes.infoText} variant="body2">
              {t('manage.verificationInfoModal.infoDelegateXyz', {
                ownerAddress: truncateEthAddress(ownerAddress),
                walletAddress: truncateEthAddress(walletAddress),
              })}{' '}
              <Link href="https://docs.delegate.xyz/delegate/" target="_blank">
                {t('common.learnMore')}
              </Link>
            </Typography>
            <CopyToClipboard
              stringToCopy={ownerAddress}
              onCopy={handleClickDelegate}
            >
              <Button fullWidth variant="contained">
                {t('manage.verificationInfoModal.goToDelegateXyz')}
              </Button>
            </CopyToClipboard>
          </>
        )}
      </Box>
    </Dialog>
  );
};

export default VerificationInfoModal;
