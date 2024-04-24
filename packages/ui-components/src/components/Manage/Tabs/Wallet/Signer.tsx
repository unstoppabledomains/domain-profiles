import WalletOutlinedIcon from '@mui/icons-material/WalletOutlined';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import Markdown from 'markdown-to-jsx';
import React, {useEffect, useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import useFireblocksSigner from '../../../../hooks/useFireblocksSigner';
import {useTranslationContext} from '../../../../lib';
import {notifyEvent} from '../../../../lib/error';
import {TabHeader} from '../../common/TabHeader';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  messageContainer: {
    backgroundColor: theme.palette.neutralShades[100],
    border: `1px solid ${theme.palette.neutralShades[400]}`,
    borderRadius: theme.shape.borderRadius,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(1),
    marginLeft: '1px',
    marginRight: '1px',
    fontFamily: 'monospace',
    fontSize: '12px',
    wordWrap: 'break-word',
    maxWidth: '500px',
    textAlign: 'left',
  },
  button: {
    marginTop: theme.spacing(1),
  },
}));

export const Signer: React.FC<SignerProps> = ({
  address,
  message,
  onComplete,
}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();
  const [isSigning, setIsSigning] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fireblocksSigner = useFireblocksSigner();

  // sign requested message when button is clicked and the Fireblocks
  // client has been properly initialized
  useEffect(() => {
    if (!isSigning) {
      return;
    }
    void handleSignature();
  }, [isSigning]);

  // clear the success flag for new message
  useEffect(() => {
    setIsSuccess(false);
  }, [message]);

  const handleSignature = async () => {
    if (!fireblocksSigner) {
      return;
    }

    // sign with fireblocks client
    let signatureResult: string | undefined;
    try {
      signatureResult = await fireblocksSigner(message, address);
    } catch (e) {
      notifyEvent(e, 'error', 'Wallet', 'Signature', {
        msg: 'error signing message',
      });
    }

    onComplete(signatureResult);
    setIsSuccess(true);
    setIsSigning(false);
  };

  const handleClickApprove = () => {
    // set the signing state flag
    setIsSigning(true);
  };

  const handleClickReject = () => {
    // indicate complete with undefined signature result
    onComplete(undefined);
  };

  return (
    <Box className={classes.container}>
      <Box display="flex" flexDirection="column" height="100%">
        <TabHeader
          icon={<WalletOutlinedIcon />}
          description={t('manage.cryptoWalletDescription')}
          learnMoreLink="https://support.unstoppabledomains.com/support/solutions/articles/48001205861-list-domain-for-sale-on-our-website"
        />
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          alignContent="center"
          justifyContent="center"
          textAlign="center"
        >
          <Typography variant="h4">{t('wallet.signMessage')}</Typography>
          <Typography mt={3} variant="body2">
            {t('wallet.signMessageDescription')}
          </Typography>
          <Typography mt={3} variant="body1">
            {t('wallet.signMessageSubtitle')}:
          </Typography>
          <Box className={classes.messageContainer}>
            <Markdown>{message}</Markdown>
          </Box>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column">
        <LoadingButton
          className={classes.button}
          fullWidth
          loading={isSigning}
          disabled={isSuccess}
          variant="contained"
          onClick={handleClickApprove}
        >
          {isSuccess ? t('common.success') : t('wallet.approve')}
        </LoadingButton>
        <Button
          className={classes.button}
          fullWidth
          disabled={isSigning}
          variant="outlined"
          onClick={handleClickReject}
        >
          {t('wallet.reject')}
        </Button>
      </Box>
    </Box>
  );
};

export interface SignerProps {
  address?: string;
  message: string;
  onComplete: (signedMessage?: string) => void;
}
