import CheckIcon from '@mui/icons-material/Check';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import Markdown from 'markdown-to-jsx';
import React, {useEffect, useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {useWeb3Context} from '../../hooks';
import useFireblocksMessageSigner from '../../hooks/useFireblocksMessageSigner';
import {useTranslationContext} from '../../lib';
import {notifyEvent} from '../../lib/error';
import {Header} from './Header';
import {SignForDappHeader} from './SignForDappHeader';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
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
    textAlign: 'center',
    width: '100%',
    overflowWrap: 'break-word',
    [theme.breakpoints.down('sm')]: {
      maxWidth: 'calc(100vw - 50px)',
    },
  },
  button: {
    marginTop: theme.spacing(1),
  },
}));

export const SignMessage: React.FC<SignMessageProps> = ({
  address,
  hideHeader,
  message,
  onComplete,
}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();
  const [isSigning, setIsSigning] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const {web3Deps} = useWeb3Context();
  const fireblocksSigner = useFireblocksMessageSigner();

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
      <Box display="flex" flexDirection="column">
        {hideHeader ? (
          <Box mt={2} />
        ) : (
          <Header mode="basic" address={address || ''} isLoaded={true} />
        )}
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          alignContent="center"
          justifyContent="center"
          textAlign="center"
        >
          <Typography variant="h4">{t('wallet.signMessage')}</Typography>
          {web3Deps?.unstoppableWallet?.connectedApp ? (
            <SignForDappHeader
              name={web3Deps.unstoppableWallet.connectedApp.name}
              hostUrl={web3Deps.unstoppableWallet.connectedApp.hostUrl}
              iconUrl={web3Deps.unstoppableWallet.connectedApp.iconUrl}
              actionText={t('wallet.signMessageAction')}
            />
          ) : (
            <Typography mt={3} variant="body2">
              {t('wallet.signMessageDescription')}
            </Typography>
          )}
          <Typography mt={3} variant="body1">
            {t('auth.walletAddress')}:
          </Typography>
          <Typography variant="body2">
            <b>{address}</b>
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
          loadingIndicator={
            <Box display="flex" alignItems="center">
              <CircularProgress color="inherit" size={16} />
              <Box ml={1}>{t('manage.signing')}...</Box>
            </Box>
          }
          disabled={isSuccess}
          variant="contained"
          onClick={handleClickApprove}
          startIcon={isSuccess ? <CheckIcon /> : undefined}
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
        {web3Deps?.unstoppableWallet?.fullScreenModal &&
          message.length > 90 && <Box mt={3} />}
      </Box>
    </Box>
  );
};

export interface SignMessageProps {
  address?: string;
  message: string;
  onComplete: (signedMessage?: string) => void;
  hideHeader?: boolean;
}
