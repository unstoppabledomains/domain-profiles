import WalletOutlinedIcon from '@mui/icons-material/WalletOutlined';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import Markdown from 'markdown-to-jsx';
import React, {useEffect, useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {
  getAccessToken,
  getMessageSignature,
} from '../../../../actions/fireBlocksActions';
import useFireblocksState from '../../../../hooks/useFireblocksState';
import {useTranslationContext} from '../../../../lib';
import {notifyEvent} from '../../../../lib/error';
import {getFireBlocksClient} from '../../../../lib/fireBlocks/client';
import {getBootstrapState} from '../../../../lib/fireBlocks/storage/state';
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
  const [accessToken, setAccessToken] = useState<string>();
  const [state, saveState] = useFireblocksState();

  // load Fireblocks state on component load
  useEffect(() => {
    void handleLoadClient();
  }, []);

  // sign requested message when button is clicked and the Fireblocks
  // client has been properly initialized
  useEffect(() => {
    if (!isSigning || !accessToken) {
      return;
    }
    void handleSignature();
  }, [isSigning, accessToken]);

  // clear the success flag for new message
  useEffect(() => {
    setIsSuccess(false);
  }, [message]);

  const handleLoadClient = async () => {
    // retrieve and validate key state
    const clientState = getBootstrapState(state);
    if (!clientState) {
      throw new Error('invalid configuration');
    }

    // retrieve an access token
    const jwtToken = await getAccessToken(clientState.refreshToken, {
      deviceId: clientState.deviceId,
      state,
      saveState,
    });
    if (!jwtToken) {
      throw new Error('error retrieving access token');
    }
    setAccessToken(jwtToken.accessToken);
  };

  const handleSignature = async () => {
    if (!accessToken) {
      return;
    }

    // retrieve and validate key state
    const clientState = getBootstrapState(state);
    if (!clientState) {
      throw new Error('invalid configuration');
    }

    // retrieve a new client instance
    const client = await getFireBlocksClient(
      clientState.deviceId,
      accessToken,
      {
        state,
        saveState,
      },
    );

    notifyEvent(
      'signing message with fireblocks client',
      'info',
      'Wallet',
      'Signature',
      {
        meta: {
          deviceId: client.getPhysicalDeviceId(),
          message,
        },
      },
    );

    // request an MPC signature of the desired message string
    const signatureResult = await getMessageSignature(
      accessToken,
      message,
      async (txId: string) => {
        await client.signTransaction(txId);
      },
      {
        address,
        onStatusChange: (m: string) => {
          notifyEvent(m, 'info', 'Wallet', 'Signature');
        },
      },
    );

    // indicate complete with successful signature result
    notifyEvent('signature successful', 'info', 'Wallet', 'Signature', {
      meta: {
        address,
        message,
        signature: signatureResult,
      },
    });
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
