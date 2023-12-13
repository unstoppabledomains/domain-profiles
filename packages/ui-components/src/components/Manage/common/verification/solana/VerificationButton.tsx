import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import {PhantomWalletAdapter} from '@solana/wallet-adapter-phantom';
import bs58 from 'bs58';
import {useSnackbar} from 'notistack';
import type {FC} from 'react';
import React, {useCallback, useState} from 'react';

import {postCryptoVerification} from '../../../../../actions';
import {useTranslationContext} from '../../../../../lib';
import {getSignatureMessage} from '../message';
import type {VerificationProps} from '../types';

export const SolanaVerificationButton: FC<VerificationProps> = ({
  address,
  currency,
  domain,
  setVerified,
}) => {
  // phantom wallet implementation and state management
  const phantomWallet = new PhantomWalletAdapter();
  const [phantomAddress, setPhantomAddress] = useState<string | undefined>(
    phantomWallet.publicKey?.toBase58(),
  );
  const [phantomConnected, setPhantomConnected] = useState<boolean>(false);

  // react hooks
  const [t] = useTranslationContext();
  const {enqueueSnackbar} = useSnackbar();

  const onVerifyClick = useCallback(async () => {
    // verify the wallet is connected
    try {
      await phantomWallet.connect();
      setPhantomConnected(true);
    } catch (connectError) {
      enqueueSnackbar(t('manage.walletNotConnected', {extension: 'Phantom'}), {
        variant: 'warning',
      });
      return;
    }

    // set the connected address
    const connectedAddress = phantomWallet.publicKey?.toBase58();
    if (!connectedAddress) {
      return;
    }
    setPhantomAddress(connectedAddress);

    // verify input address and connected address are the same
    if (address !== connectedAddress) {
      enqueueSnackbar(
        t('manage.walletAddressIncorrect', {address, connectedAddress}),
        {
          variant: 'error',
        },
      );
      await phantomWallet.disconnect();
      return;
    }

    try {
      // sign a message linking the domain and secondary wallet address
      const messageText = await getSignatureMessage(domain, currency, address);
      const message = new TextEncoder().encode(messageText);
      const signature = await phantomWallet.signMessage(message);
      const signatureBase58 = bs58.encode(signature);

      // save the verification record
      await postCryptoVerification(domain, {
        symbol: currency,
        address: connectedAddress,
        plaintextMessage: messageText,
        signedMessage: signatureBase58,
      });
      setVerified(address);
    } catch (signError) {
      enqueueSnackbar(t('manage.signatureError', {connectedAddress}), {
        variant: 'error',
      });
    }
  }, [address]);

  // verify address is populated
  if (!address) {
    return <div></div>;
  }

  // step 2 - sign
  return (
    <Tooltip
      title={t(
        phantomAddress || phantomConnected
          ? 'manage.signToVerify'
          : 'manage.connectToVerify',
        {extension: 'Phantom'},
      )}
    >
      <Button
        variant="text"
        data-testid={`verify-${currency}`}
        onClick={onVerifyClick}
      >
        {phantomAddress || phantomConnected
          ? t('manage.sign')
          : t('manage.verify')}
      </Button>
    </Tooltip>
  );
};
