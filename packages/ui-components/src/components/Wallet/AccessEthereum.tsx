import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import type {GetWalletClientResult} from '@wagmi/core';
import type {Signer} from 'ethers';
import React, {useEffect, useState} from 'react';
import {
  WagmiConfig,
  configureChains,
  createConfig,
  mainnet,
  useConnect,
  useDisconnect,
  useWalletClient,
} from 'wagmi';
import type {Connector} from 'wagmi';
import {CoinbaseWalletConnector} from 'wagmi/connectors/coinbaseWallet';
import {InjectedConnector} from 'wagmi/connectors/injected';
import {MetaMaskConnector} from 'wagmi/connectors/metaMask';
import {WalletConnectConnector} from 'wagmi/connectors/walletConnect';
import {publicProvider} from 'wagmi/providers/public';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import WalletButton from '../../components/Wallet/WalletButton';
import useTranslationContext from '../../lib/i18n';
import {sleep} from '../../lib/sleep';
import type {WagmiConnectorType} from '../../lib/types/wallet';
import {WalletName, WalletOptions} from '../../lib/types/wallet';
import type {Web3Dependencies} from '../../lib/types/web3';
import {WalletClientSigner} from '../../lib/wallet/signer';

// declare the Lite Wallet extension EIP-1193 injected provider property
declare global {
  interface Window {
    unstoppable?: any;
  }
}
export interface AccessEthereumProps {
  address?: string;
  onComplete: (web3Deps?: Web3Dependencies) => void;
  onError?: (message: string) => void;
  onReconnect?: () => void;
  onClose?: () => void;
  selectedWallet?: WalletName;
  setSelectedWallet: (w: WalletName) => void;
  isMpcWallet?: boolean;
}

export const useStyles = makeStyles()((theme: Theme) => ({
  listContainer: {
    display: 'flex',
    justifyContent: 'center',
    outline: `2px solid ${theme.palette.white}`,
    outlineOffset: -1,
  },
  button: {
    marginTop: theme.spacing(2),
  },
  link: {
    fontWeight: 'bold',
    textDecoration: 'none',
    color: theme.palette.primary.main,
    '&:hover': {
      textDecoration: 'none',
      color: theme.palette.primary.main,
    },
  },
}));

const AccessEthereum: React.FC<AccessEthereumProps> = ({
  address,
  isMpcWallet,
  onComplete,
  onError,
  selectedWallet,
  setSelectedWallet,
}) => {
  // theming variables for the QR modal
  const themeVariables = {
    '--wcm-z-index': '100000',
  };

  // Set up wagmi config
  const [t] = useTranslationContext();
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            themeVariables: themeVariables as any,
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
      // an injected provider to connect to the Unstoppable Domains Lite Wallet
      // browser extension, injected info DOM with window.unstoppable property
      // as EIP-1193 Ethereum provider.
      new InjectedConnector({
        chains,
        options: {
          shimDisconnect: true,
          getProvider: () => {
            return typeof window !== 'undefined'
              ? window.unstoppable
              : undefined;
          },
        },
      }),
    ],
    publicClient,
    webSocketPublicClient,
  });

  return (
    <WagmiConfig config={wagmiConfig}>
      <AccessEthereumConnectors
        address={address}
        onComplete={onComplete}
        onError={onError}
        selectedWallet={selectedWallet}
        setSelectedWallet={setSelectedWallet}
        isMpcWallet={isMpcWallet}
      />
    </WagmiConfig>
  );
};

const AccessEthereumConnectors: React.FC<AccessEthereumProps> = ({
  isMpcWallet,
  onComplete,
  onError,
  selectedWallet,
  setSelectedWallet,
}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();
  const [selectedConnector, setSelectedConnector] = useState<Connector>();

  // wagmi hooks
  const {disconnect} = useDisconnect();
  const {data: connectedSigner} = useWalletClient();
  const {
    connectAsync,
    connectors,
    error: connectError,
    isLoading,
  } = useConnect();

  useEffect(() => {
    try {
      disconnect();
    } catch (e) {}
  }, []);

  useEffect(() => {
    // only proceed for lite wallet connections when the extension
    // is already installed
    if (
      !isMpcWallet ||
      !window.unstoppable ||
      !connectors ||
      connectors.length === 0
    ) {
      return;
    }

    // find the UD wallet extension
    const udExtensionConnector = getConnector('injected');
    if (!udExtensionConnector) {
      return;
    }

    // select the UD wallet extension
    handleClick(WalletName.UnstoppableWalletExtension, udExtensionConnector);
  }, [connectors, isMpcWallet]);

  useEffect(() => {
    if (!connectedSigner) {
      return;
    }
    void handleWagmiWalletConnected(
      connectedSigner.account.address,
      connectedSigner,
    );
  }, [connectedSigner]);

  useEffect(() => {
    if (!connectError) {
      return;
    }
    if (onError) {
      onError(connectError.message);
    }
  }, [connectError]);

  const handleClick = async (walletName: WalletName, connector: Connector) => {
    // set the selected wallet name
    setSelectedWallet(walletName);

    // alternative connector logic for Unstoppable Wallet
    if (walletName === WalletName.UnstoppableWalletReact) {
      return;
    }

    // pass control to the selected connector
    setSelectedConnector(connector);
    for (let i = 0; i < 10; i++) {
      try {
        const connectedAddress = await connectAsync({connector});
        await sleep(500);
        if (!connectedAddress || connectedSigner) {
          break;
        }
      } catch (e) {
        break;
      }
    }
  };

  const handleWagmiWalletConnected = async (
    address: string,
    signer: GetWalletClientResult,
  ) => {
    if (!signer) {
      if (onError) {
        onError('wallet not found');
      }
      return;
    }
    const walletClientSigner = new WalletClientSigner(address, signer);
    onComplete({
      address,
      signer: walletClientSigner as unknown as Signer,
      provider: await selectedConnector?.getProvider(),
    });
  };

  const getConnector = (id: WagmiConnectorType) => {
    return connectors.find(c => c.id === id);
  };

  return (
    <>
      <Box mb={2} display="flex" flexDirection="column" justifyContent="center">
        <Typography gutterBottom align="center">
          {t('auth.accessWalletDescription')}
        </Typography>
        <Typography variant="caption" align="center">
          {t('auth.moreInfo')}{' '}
          <a
            target="_blank"
            href="https://unstoppabledomains.com/learn/web3-terms-101"
            rel="noreferrer"
            className={classes.link}
          >
            {t('common.guide')}
          </a>
          .
        </Typography>
      </Box>
      <>
        <Grid container className={classes.listContainer}>
          {Object.keys(WalletOptions)
            .filter(k => {
              // hide the integrated Lite Wallet button if the extension is installed
              if (
                k === WalletName.UnstoppableWalletReact &&
                window.unstoppable !== undefined
              ) {
                return false;
              }

              // hide the Lite Wallet extension button if it is not installed
              if (
                k === WalletName.UnstoppableWalletExtension &&
                window.unstoppable === undefined
              ) {
                return false;
              }

              // show the button
              return true;
            })
            .slice(0, 9)
            .map((k, i) => {
              const connector = getConnector(
                WalletOptions[k as WalletName].connectorType,
              );
              if (!connector) {
                return null;
              }
              return (
                <Grid
                  item
                  xs={4}
                  key={`walletButton-container-${connector.id}-${i}`}
                >
                  <WalletButton
                    key={`walletButton-${connector.id}-${i}`}
                    name={k as WalletName}
                    disabled={
                      selectedConnector !== undefined || !connector.ready
                    }
                    loading={isLoading && selectedWallet === (k as WalletName)}
                    onClick={() => handleClick(k as WalletName, connector)}
                  />
                </Grid>
              );
            })}
        </Grid>
      </>
    </>
  );
};

export default AccessEthereum;
