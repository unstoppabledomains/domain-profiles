import CloseIcon from '@mui/icons-material/Close';
import Alert from '@mui/lab/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import type {Signer} from 'ethers';
import Markdown from 'markdown-to-jsx';
import React, {useEffect, useState} from 'react';
import truncateEthAddress from 'truncate-eth-address';

import AccessEthereum from '../../components/Wallet/AccessEthereum';
import useFireblocksSigner from '../../hooks/useFireblocksSigner';
import useFireblocksState from '../../hooks/useFireblocksState';
import {WalletName} from '../../lib';
import {
  ReactSigner,
  UD_COMPLETED_SIGNATURE,
} from '../../lib/fireBlocks/reactSigner';
import {getBootstrapState} from '../../lib/fireBlocks/storage/state';
import useTranslationContext from '../../lib/i18n';
import type {Web3Dependencies} from '../../lib/types/web3';
import useAccessWalletStyles from '../../styles/components/accessWallet.styles';
import {isEthAddress} from '../Chat/protocol/resolution';
import {DomainProfileTabType} from '../Manage/DomainProfile';
import {Wallet as UnstoppableWalletConfig} from '../Manage/Tabs/Wallet';
import {Signer as UnstoppableWalletSigner} from '../Manage/Tabs/Wallet/Signer';

type Props = {
  address?: string;
  message?: React.ReactNode;
  prompt?: boolean;
  onComplete?: (web3Deps?: Web3Dependencies) => void;
  onReconnect?: () => void;
  onClose?: () => void;
};

const AccessWallet = (props: Props) => {
  const {classes} = useAccessWalletStyles();
  const [error, setError] = useState('');
  const [t] = useTranslationContext();

  // selected wallet state
  const [selectedWallet, setSelectedWallet] = useState<WalletName>();

  // Unstoppable wallet signature state variables
  const [state] = useFireblocksState();
  const fireblocksSigner = useFireblocksSigner();
  const [udConfigButton, setUdConfigButton] = useState<React.ReactNode>(<></>);
  const [udConfigSuccess, setUdConfigSuccess] = useState(false);
  const [udConfigMessage, setUdConfigMessage] = useState('');

  useEffect(() => {
    // automatically select a connected Unstoppable Wallet if one of the managed
    // addresses matches the requested address
    if (state && Object.keys(state).length > 0 && props.address) {
      const bootstrapState = getBootstrapState(state);
      if (
        bootstrapState?.assets?.find(
          a => a.address.toLowerCase() === props.address?.toLowerCase(),
        )
      ) {
        setSelectedWallet(WalletName.UnstoppableWallet);
        void handleUdWalletConnected(DomainProfileTabType.Wallet);
      }
    }
  }, [state, props.address]);

  const handleWalletConnected = (web3Deps?: Web3Dependencies) => {
    setError('');
    if (!props.address) {
      if (props.onComplete) {
        props.onComplete(web3Deps);
      }
      return;
    }
    const addresses = [
      web3Deps?.address,
      ...(web3Deps?.unstoppableWallet?.addresses || []),
    ];
    if (
      addresses.map(a => a?.toLowerCase()).includes(props.address.toLowerCase())
    ) {
      if (props.onComplete) {
        props.onComplete(web3Deps);
      }
    } else {
      const expectedAddress = props.address;
      setError(
        t('auth.walletAddressIncorrect', {
          actual: truncateEthAddress(
            web3Deps?.address.toLowerCase() || t('common.address'),
          ),
          expected: truncateEthAddress(expectedAddress),
        }),
      );
    }
  };

  const handleUdWalletConnected = async (_type: DomainProfileTabType) => {
    // retrieve an access token if one was not provided
    setUdConfigSuccess(true);

    // query accounts belonging to the UD wallet
    const bootstrapState = getBootstrapState(state);
    const allAddresses = bootstrapState?.assets?.map(a => a.address) || [];

    // validate addresses located
    const ethAddresses = [
      ...new Set(allAddresses.filter(a => isEthAddress(a))),
    ];
    if (ethAddresses.length === 0) {
      return;
    }

    // TODO - create an account or feature flag for this value
    const promptForSignatures = true;

    // initialize a react signature UX component that can be called back
    // by a signature request hook
    const udWalletSigner = new ReactSigner(
      ethAddresses[0],
      promptForSignatures
        ? {
            setMessage: setUdConfigMessage,
          }
        : {
            signWithFireblocks: fireblocksSigner,
          },
    );

    // raise success events
    handleWalletConnected({
      address: ethAddresses[0],
      signer: udWalletSigner as unknown as Signer,
      unstoppableWallet: {
        addresses: ethAddresses,
        promptForSignatures,
      },
    });
  };

  const handleUdWalletSignature = (signedMessage?: string) => {
    UD_COMPLETED_SIGNATURE.push(signedMessage);
  };

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <div className={classes.root}>
      <div className={classes.column}>
        {error && (
          <Box display="flex" flexDirection="column" justifyContent="center">
            <Alert
              action={
                props.onReconnect ? (
                  <Button
                    onClick={props.onReconnect}
                    color="inherit"
                    size="small"
                  >
                    {t('auth.retry')}
                  </Button>
                ) : undefined
              }
              severity="error"
            >
              <Markdown>{error}</Markdown>
            </Alert>
          </Box>
        )}
        {props.message && (
          <Typography align="center" variant="h5" mb={2}>
            {props.message}
          </Typography>
        )}
        {props.prompt && props.address && (
          <Typography align="center" className={classes.prompt} component="div">
            {t('auth.walletAddress')}:
            <div className={classes.ethWalletAddress}>{props.address}</div>
          </Typography>
        )}
        <div className={classes.column}>
          {selectedWallet !== WalletName.UnstoppableWallet ? (
            <AccessEthereum
              address={props.address}
              onComplete={handleWalletConnected}
              onReconnect={props.onReconnect}
              onClose={props.onClose}
              selectedWallet={selectedWallet}
              setSelectedWallet={setSelectedWallet}
            />
          ) : (
            <Grid item xs={12} display="flex" justifyContent="center">
              <Box className={classes.udConfigContainer}>
                {!udConfigMessage || !udConfigSuccess ? (
                  <Box
                    display="flex"
                    flexDirection="column"
                    justifyContent="space-between"
                    height="100%"
                  >
                    <UnstoppableWalletConfig
                      address={''}
                      domain={''}
                      onUpdate={handleUdWalletConnected}
                      setButtonComponent={setUdConfigButton}
                    />
                    <Box width="100%" mt={2}>
                      {udConfigButton}
                    </Box>
                  </Box>
                ) : (
                  udConfigMessage && (
                    <>
                      <UnstoppableWalletSigner
                        address={props.address}
                        message={udConfigMessage}
                        onComplete={handleUdWalletSignature}
                      />
                    </>
                  )
                )}
              </Box>
            </Grid>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccessWallet;

type ModalProps = Props & {
  open: boolean;
  onClose: () => void;
  requireConfirmation?: boolean;
};

export const AccessWalletModal = (props: ModalProps) => {
  const {classes, theme} = useAccessWalletStyles();
  const [t] = useTranslationContext();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const ConnectWalletWrapper = isMobile ? Popover : Dialog;

  return (
    <ConnectWalletWrapper
      open={props.open}
      onClose={props.onClose}
      classes={{paper: classes.modalRoot}}
      {...(isMobile
        ? {
            anchorOrigin: {
              vertical: 'bottom',
              horizontal: 'center',
            },
            transformOrigin: {
              vertical: 'top',
              horizontal: 'center',
            },
            elevation: 3,
          }
        : {})}
    >
      <div className={classes.modalHeader} data-testid={'access-wallet-modal'}>
        <Typography className={classes.modalTitle}>
          {t('auth.accessWallet')}
        </Typography>
        <IconButton onClick={props.onClose} size="medium">
          <CloseIcon />
        </IconButton>
      </div>
      <div className={classes.modalContent}>
        <AccessWallet
          address={props.address}
          onComplete={props.onComplete}
          onReconnect={props.onReconnect}
          onClose={props.onClose}
          prompt={props.prompt}
          message={props.message}
        />
      </div>
    </ConnectWalletWrapper>
  );
};
