import CheckIcon from '@mui/icons-material/Check';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import Markdown from 'markdown-to-jsx';
import React, {useEffect, useState} from 'react';
import type {Eip712TypedData} from 'web3';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {useWeb3Context} from '../../hooks';
import useFireblocksMessageSigner from '../../hooks/useFireblocksMessageSigner';
import {useTranslationContext} from '../../lib';
import {notifyEvent} from '../../lib/error';
import {EIP_712_KEY} from '../../lib/types/fireBlocks';
import {Header} from './Header';
import {OperationStatus} from './OperationStatus';
import {SignForDappHeader} from './SignForDappHeader';
import {TypedMessage} from './TypedMessage';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
  },
  contentContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
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
      maxHeight: '100px',
      overflow: 'auto',
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
  const [errorMessage, setErrorMessage] = useState<string>();
  const {web3Deps} = useWeb3Context();
  const fireblocksSigner = useFireblocksMessageSigner();

  // determine if a specific chain ID should override based upon a typed
  // EIP-712 message
  let typedData: Eip712TypedData | undefined;
  if (message.includes(EIP_712_KEY)) {
    try {
      const maybeTypedData = JSON.parse(message);
      if (
        maybeTypedData?.message &&
        maybeTypedData?.domain &&
        maybeTypedData.primaryType
      ) {
        typedData = maybeTypedData;
      }
    } catch (e) {
      notifyEvent(e, 'warning', 'Wallet', 'Signature', {
        msg: 'unable to parse typed message',
      });
    }
  }

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
    setErrorMessage(undefined);
  }, [message]);

  const handleSignature = async () => {
    if (!fireblocksSigner) {
      return;
    }

    // sign with fireblocks client
    let signatureResult: string | undefined;
    try {
      signatureResult = await fireblocksSigner(message, address);
      onComplete(signatureResult);
      setIsSuccess(true);
      return;
    } catch (e) {
      notifyEvent(e, 'error', 'Wallet', 'Signature', {
        msg: 'error signing message',
      });
    }

    // show error message
    setErrorMessage(t('wallet.errorConfirming'));
  };

  const handleClickApprove = () => {
    // set the signing state flag
    setIsSigning(true);
  };

  const handleClickReject = () => {
    // indicate complete with undefined signature result
    onComplete(undefined);
  };

  // show standard screen when not signing
  return (
    <Box className={classes.container}>
      <Box className={classes.contentContainer}>
        {hideHeader ? (
          <Box mt={2} />
        ) : (
          <Header mode="basic" address={address || ''} isLoaded={true} />
        )}
        {isSigning ? (
          <Box className={classes.contentContainer}>
            <OperationStatus
              label={errorMessage || t('manage.signing')}
              icon={<LockOutlinedIcon />}
              error={errorMessage !== undefined}
            />
          </Box>
        ) : (
          <Box className={classes.contentContainer}>
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
              {typedData ? (
                <Box mt={1} mb={1}>
                  <TypedMessage typedData={typedData} />
                </Box>
              ) : (
                <Markdown>{message}</Markdown>
              )}
            </Box>
          </Box>
        )}
      </Box>
      {!isSigning && (
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
      )}
    </Box>
  );
};

export interface SignMessageProps {
  address?: string;
  message: string;
  onComplete: (signedMessage?: string) => void;
  hideHeader?: boolean;
}
