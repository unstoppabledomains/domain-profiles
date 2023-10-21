import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import type {GetWalletClientResult} from '@wagmi/core';
import Link from 'components/Link';
import WalletButton from 'components/Wallet/WalletButton';
import type {Signer} from 'ethers';
import useTranslationContext from 'lib/i18n';
import type {WagmiConnectorType, WalletName} from 'lib/types/wallet';
import {WalletOptions} from 'lib/types/wallet';
import type {Web3Dependencies} from 'lib/types/web3';
import {WalletClientSigner} from 'lib/wallet/signer';
import React, {useEffect, useState} from 'react';
import type {Connector} from 'wagmi';
import {useAccount, useConnect, useDisconnect, useWalletClient} from 'wagmi';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

export const useStyles = makeStyles()((theme: Theme) => ({
  listContainer: {
    outline: `2px solid ${theme.palette.white}`,
    outlineOffset: -1,
  },
  button: {
    marginTop: theme.spacing(2),
  },
}));

export interface AccessEthereumProps {
  onComplete: (web3Deps?: Web3Dependencies) => void;
  onError?: (message: string) => void;
}

const AccessEthereum: React.FC<AccessEthereumProps> = ({
  onComplete,
  onError,
}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();
  const [isReady, setIsReady] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<WalletName>();

  // wagmi hooks
  const {disconnect} = useDisconnect();
  const {data: connectedSigner} = useWalletClient();
  const {address: connectedAddress, isConnected} = useAccount();
  const {connect, connectors, error: wagmiError, isLoading} = useConnect();

  useEffect(() => {
    if (isLoading || isReady) {
      return;
    }
    if (isConnected) {
      disconnect();
      return;
    }
    setIsReady(true);
  }, [isLoading, isConnected]);

  useEffect(() => {
    if (!isConnected || !isReady || !connectedAddress || !connectedSigner) {
      return;
    }
    void handleConnected(connectedAddress, connectedSigner);
  }, [connectedAddress, connectedSigner, isConnected, isReady]);

  useEffect(() => {
    if (!wagmiError) {
      return;
    }
    if (onError) {
      onError(wagmiError.message);
    }
  }, [wagmiError]);

  const handleClick = (walletName: WalletName, connector: Connector) => {
    setSelectedWallet(walletName);
    connect({connector});
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
    });
  };

  const getConnector = (id: WagmiConnectorType) => {
    return connectors.find(c => c.id === id);
  };

  return (
    <>
      <Box mb={2}>
        <Typography gutterBottom align="center">
          {t('auth.accessWalletDescription')}
        </Typography>
        <Typography align="center">
          {t('auth.moreInfo')}{' '}
          <Link
            external
            to="https://support.unstoppabledomains.com/support/solutions/articles/48001181696-claim-your-domain"
          >
            {t('common.guide')}.
          </Link>
        </Typography>
      </Box>
      <>
        <Grid container className={classes.listContainer}>
          {Object.keys(WalletOptions).map(k => {
            const connector = getConnector(
              WalletOptions[k as WalletName].connectorType,
            );
            if (!connector) {
              return null;
            }
            return (
              <Grid item xs={4} key={connector.id}>
                <WalletButton
                  key={connector.id}
                  name={k as WalletName}
                  disabled={!connector.ready}
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
