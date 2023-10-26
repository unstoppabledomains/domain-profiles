import CloseIcon from '@mui/icons-material/Close';
import Alert from '@mui/lab/Alert';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import AccessEthereum from 'components/Wallet/AccessEthereum';
import useTranslationContext from 'lib/i18n';
import type {Web3Dependencies} from 'lib/types/web3';
import React, {useState} from 'react';
import useSettingsStyles from 'styles/pages/settings.styles';
import {WagmiConfig, configureChains, createConfig, mainnet} from 'wagmi';
import {CoinbaseWalletConnector} from 'wagmi/connectors/coinbaseWallet';
import {InjectedConnector} from 'wagmi/connectors/injected';
import {MetaMaskConnector} from 'wagmi/connectors/metaMask';
import {WalletConnectConnector} from 'wagmi/connectors/walletConnect';
import {publicProvider} from 'wagmi/providers/public';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  modalRoot: {
    left: '0 !important',
    bottom: '0 !important',
    [theme.breakpoints.down('md')]: {
      maxWidth: 432,
    },
  },
  modalHeader: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(1.5),
    paddingLeft: theme.spacing(3),
  },
  modalTitle: {
    fontSize: theme.typography.h6.fontSize,
    fontWeight: theme.typography.fontWeightBold,
  },
  modalContent: {
    padding: theme.spacing(3),
    paddingTop: 0,
  },
}));

type Props = {
  address?: string;
  message?: React.ReactNode;
  prompt?: boolean;
  onComplete?: (web3Deps?: Web3Dependencies) => void;
};

const AccessWallet = (props: Props) => {
  const {classes: settingsClasses} = useSettingsStyles();
  const [error, setError] = useState('');
  const [t] = useTranslationContext();

  // Set up wagmi config
  const {chains, publicClient, webSocketPublicClient} = configureChains(
    [mainnet],
    [publicProvider()],
  );
  const wagmiConfig = createConfig({
    autoConnect: false,
    connectors: [
      new MetaMaskConnector({chains}),
      new WalletConnectConnector({
        chains,
        options: {
          projectId: config.WALLETCONNECT_PROJECT_ID,
          qrModalOptions: {
            themeVariables: {
              '--wcm-z-index': '100000',
            },
          },
          metadata: {
            name: t('nftCollection.unstoppableDomains'),
            description: t('nftCollection.unstoppableDomainsDescription'),
            url: config.UD_ME_BASE_URL,
            icons: [config.UD_LOGO_URL],
          },
        },
      }),
      new CoinbaseWalletConnector({
        chains,
        options: {
          appName: 'wagmi',
        },
      }),
      new InjectedConnector({
        chains,
        options: {
          shimDisconnect: true,
        },
      }),
    ],
    publicClient,
    webSocketPublicClient,
  });

  const handleWalletConnected = (web3Deps?: Web3Dependencies) => {
    setError('');
    if (!props.address) {
      if (props.onComplete) {
        props.onComplete(web3Deps);
      }
      return;
    }
    if (props.address.toLowerCase() === web3Deps?.address.toLowerCase()) {
      if (props.onComplete) {
        props.onComplete(web3Deps);
      }
    } else {
      const expectedAddress = props.address;
      setError(
        t('auth.walletAddressIncorrect', {
          actual: web3Deps?.address.toLowerCase() || t('common.address'),
          expected: expectedAddress,
        }),
      );
    }
  };

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <WagmiConfig config={wagmiConfig}>
      <div className={settingsClasses.root}>
        <div className={settingsClasses.column}>
          {error && <Alert severity="error">{error}</Alert>}
          {props.message && (
            <Typography align="center" variant="h5">
              {props.message}
            </Typography>
          )}
          {props.prompt && props.address && (
            <Typography
              align="center"
              className={settingsClasses.prompt}
              component="div"
            >
              {t('auth.walletAddress')}:
              <div className={settingsClasses.ethWalletAddress}>
                {props.address}
              </div>
            </Typography>
          )}
          <div className={settingsClasses.column}>
            <AccessEthereum onComplete={handleWalletConnected} />
          </div>
        </div>
      </div>
    </WagmiConfig>
  );
};

export default AccessWallet;

type ModalProps = Props & {
  open: boolean;
  onClose: () => void;
  requireConfirmation?: boolean;
};

export const AccessWalletModal = (props: ModalProps) => {
  const {classes, theme} = useStyles();
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
          prompt={props.prompt}
          message={props.message}
        />
      </div>
    </ConnectWalletWrapper>
  );
};
