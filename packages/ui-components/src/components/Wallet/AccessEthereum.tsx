import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import type {GetWalletClientResult} from '@wagmi/core';
import type {Signer} from 'ethers';
import React, {useEffect, useState} from 'react';
import {useConnect, useDisconnect, useWalletClient} from 'wagmi';
import type {Connector} from 'wagmi';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import WalletButton from '../../components/Wallet/WalletButton';
import useTranslationContext from '../../lib/i18n';
import {sleep} from '../../lib/sleep';
import type {WagmiConnectorType, WalletName} from '../../lib/types/wallet';
import {WalletOptions} from '../../lib/types/wallet';
import type {Web3Dependencies} from '../../lib/types/web3';
import {WalletClientSigner} from '../../lib/wallet/signer';

export interface AccessEthereumProps {
  onComplete: (web3Deps?: Web3Dependencies) => void;
  onError?: (message: string) => void;
  onReconnect?: () => void;
}

export const useStyles = makeStyles()((theme: Theme) => ({
  listContainer: {
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
  onComplete,
  onError,
}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();
  const [selectedWallet, setSelectedWallet] = useState<WalletName>();
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
    if (!connectedSigner) {
      return;
    }
    void handleConnected(connectedSigner.account.address, connectedSigner);
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
    setSelectedConnector(connector);
    setSelectedWallet(walletName);
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

  const handleConnected = async (
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
          {Object.keys(WalletOptions).map((k, i) => {
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
                  disabled={selectedConnector !== undefined || !connector.ready}
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
