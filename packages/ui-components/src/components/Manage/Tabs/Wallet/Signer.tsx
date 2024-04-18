import type {IFireblocksNCW} from '@fireblocks/ncw-js-sdk';
import WalletOutlinedIcon from '@mui/icons-material/WalletOutlined';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import Markdown from 'markdown-to-jsx';
import React, {useEffect, useState} from 'react';
import {useLocalStorage, useSessionStorage} from 'usehooks-ts';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {
  getAccessToken,
  getMessageSignature,
} from '../../../../actions/fireBlocksActions';
import {useTranslationContext} from '../../../../lib';
import {notifyEvent} from '../../../../lib/error';
import {getFireBlocksClient} from '../../../../lib/fireBlocks/client';
import {getState} from '../../../../lib/fireBlocks/storage/state';
import {FireblocksStateKey} from '../../../../lib/types/fireBlocks';
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
  const [accessToken, setAccessToken] = useState<string>();
  const [client, setClient] = useState<IFireblocksNCW>();
  const [sessionKeyState, setSessionKeyState] = useSessionStorage<
    Record<string, Record<string, string>>
  >(FireblocksStateKey, {});
  const [persistentKeyState, setPersistentKeyState] = useLocalStorage<
    Record<string, Record<string, string>>
  >(FireblocksStateKey, {});

  // load Fireblocks state on component load
  useEffect(() => {
    // wait for key state to be available
    if (!sessionKeyState || !persistentKeyState) {
      return;
    }
    void handleLoadClient();
  }, []);

  // sign requested message when button is clicked and the Fireblocks
  // client has been properly initialized
  useEffect(() => {
    if (!isSigning || !client) {
      return;
    }
    void handleSignature();
  }, [isSigning, client]);

  const handleLoadClient = async () => {
    // retrieve and validate key state
    const sessionState = getState(sessionKeyState);
    const persistentState = getState(persistentKeyState);
    const state = sessionState || persistentState;
    if (!state) {
      throw new Error('invalid configuration');
    }

    // retrieve an access token
    const jwtToken = await getAccessToken(state.refreshToken, {
      deviceId: state.deviceId,
      state: sessionState ? sessionKeyState : persistentKeyState,
      saveState: sessionState ? setSessionKeyState : setPersistentKeyState,
    });
    if (!jwtToken) {
      throw new Error('error retrieving access token');
    }
    setAccessToken(jwtToken.accessToken);

    // initialize and set the client
    setClient(
      await getFireBlocksClient(state.deviceId, jwtToken.accessToken, {
        state: sessionState ? sessionKeyState : persistentKeyState,
        saveState: sessionState ? setSessionKeyState : setPersistentKeyState,
      }),
    );
  };

  const handleSignature = async () => {
    if (!client || !accessToken) {
      return;
    }
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
    onComplete(signatureResult);
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
          variant="contained"
          onClick={handleClickApprove}
        >
          {t('wallet.approve')}
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
