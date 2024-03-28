import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import type {GetWalletClientResult} from '@wagmi/core';
import Bluebird from 'bluebird';
import type {Signer} from 'ethers';
import React, {useEffect, useState} from 'react';
import {useConnect, useDisconnect, useWalletClient} from 'wagmi';
import type {Connector} from 'wagmi';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {useFeatureFlags} from '../../actions';
import {getAccountAssets, getAccounts} from '../../actions/fireBlocksActions';
import WalletButton from '../../components/Wallet/WalletButton';
import {
  ReactSigner,
  UD_COMPLETED_SIGNATURE,
} from '../../lib/fireBlocks/reactSigner';
import useTranslationContext from '../../lib/i18n';
import {sleep} from '../../lib/sleep';
import type {WagmiConnectorType} from '../../lib/types/wallet';
import {WalletName, WalletOptions} from '../../lib/types/wallet';
import type {Web3Dependencies} from '../../lib/types/web3';
import {WalletClientSigner} from '../../lib/wallet/signer';
import {isEthAddress} from '../Chat/protocol/resolution';
import type {DomainProfileTabType} from '../Manage';
import {Wallet as UnstoppableWalletConfig} from '../Manage/Tabs/Wallet';
import {Signer as UnstoppableWalletSigner} from '../Manage/Tabs/Wallet/Signer';

export interface AccessEthereumProps {
  onComplete: (web3Deps?: Web3Dependencies) => void;
  onError?: (message: string) => void;
  onReconnect?: () => void;
  onClose?: () => void;
}

export const useStyles = makeStyles()((theme: Theme) => ({
  listContainer: {
    display: 'flex',
    justifyContent: 'center',
    outline: `2px solid ${theme.palette.white}`,
    outlineOffset: -1,
  },
  udConfigContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: '500px',
    minHeight: '450px',
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
  onComplete,
  onError,
  onClose,
}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();
  const {data: featureFlags} = useFeatureFlags();
  const [selectedWallet, setSelectedWallet] = useState<WalletName>();
  const [selectedConnector, setSelectedConnector] = useState<Connector>();

  // Unstoppable wallet signature state variables
  const [udConfigButton, setUdConfigButton] = useState<React.ReactNode>(<></>);
  const [udConfigSuccess, setUdConfigSuccess] = useState(false);
  const [udConfigMessage, setUdConfigMessage] = useState('');

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
    if (walletName === WalletName.UnstoppableWallet) {
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

  const handleUdWalletConnected = async (
    _type: DomainProfileTabType,
    data?: {accessToken: string},
  ) => {
    // ensure an access token was provided
    setUdConfigSuccess(true);
    if (!data?.accessToken) {
      if (onError) {
        onError('no access token provided for account');
      }
      return;
    }

    // query accounts belonging to the UD wallet
    const allAddresses: string[] = [];
    const accounts = await getAccounts(data.accessToken);
    if (!accounts) {
      if (onError) {
        onError('no accounts found for access token');
      }
      return;
    }

    // query addresses belonging to accounts
    await Bluebird.map(accounts.items, async account => {
      const assets = await getAccountAssets(data.accessToken, account.id);
      return (assets?.items || []).map(asset => {
        allAddresses.push(asset.address);
      });
    });

    // validate addresses located
    const addresses = [...new Set(allAddresses.filter(a => isEthAddress(a)))];
    if (addresses.length === 0) {
      if (onError) {
        onError('no EVM wallet addresses found for account');
      }
      return;
    }

    // initialize a react signature UX component that can be called back
    // by a signature request hook
    const address = addresses[0];
    const reactSigner = new ReactSigner(address, setUdConfigMessage, onClose);

    // raise success events
    onComplete({
      address,
      signer: reactSigner as unknown as Signer,
      unstoppableWallet: {
        addresses,
      },
    });
  };

  const handleUdWalletSignature = (signedMessage?: string) => {
    UD_COMPLETED_SIGNATURE.push(signedMessage);
  };

  const getConnector = (id: WagmiConnectorType) => {
    return connectors.find(c => c.id === id);
  };

  return (
    <>
      {selectedWallet !== WalletName.UnstoppableWallet && (
        <Box
          mb={2}
          display="flex"
          flexDirection="column"
          justifyContent="center"
        >
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
      )}
      <>
        <Grid container className={classes.listContainer}>
          {selectedWallet !== WalletName.UnstoppableWallet ? (
            Object.keys(WalletOptions)
              .filter(k => {
                const isUdWalletEnabled =
                  featureFlags.variations?.udMeServiceDomainsEnableFireblocks;
                if (k === WalletName.UnstoppableWallet && !isUdWalletEnabled) {
                  return false;
                }
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
                      loading={
                        isLoading && selectedWallet === (k as WalletName)
                      }
                      onClick={() => handleClick(k as WalletName, connector)}
                    />
                  </Grid>
                );
              })
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
                        message={udConfigMessage}
                        onComplete={handleUdWalletSignature}
                      />
                    </>
                  )
                )}
              </Box>
            </Grid>
          )}
        </Grid>
      </>
    </>
  );
};

export default AccessEthereum;
