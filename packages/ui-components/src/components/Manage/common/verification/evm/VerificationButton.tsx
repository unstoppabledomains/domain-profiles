import {recoverPersonalSignature} from '@metamask/eth-sig-util';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import {useSnackbar} from 'notistack';
import type {FC} from 'react';
import React, {useCallback, useContext, useEffect, useState} from 'react';

import {postCryptoVerification} from '../../../../../actions';
import type {Web3Dependencies} from '../../../../../lib';
import {useTranslationContext} from '../../../../../lib';
import {Web3Context} from '../../../../../providers';
import {AccessWalletModal} from '../../../../Wallet/AccessWallet';
import {getSignatureMessage} from '../message';
import type {VerificationProps} from '../types';

export const EvmVerificationButton: FC<VerificationProps> = ({
  address,
  currency,
  domain,
  setVerified,
  setWeb3Deps,
}) => {
  // wallet model implementation and state management
  const web3Context = useContext(Web3Context);
  const [accessWalletModalIsOpen, setAccessWalletModalIsOpen] = useState(false);
  const [signatureRequested, setSignatureRequested] = useState(false);
  const [t] = useTranslationContext();
  const {enqueueSnackbar} = useSnackbar();

  // wait for connection state and initiate signature dialog
  useEffect(() => {
    if (!web3Context.web3Deps || !signatureRequested) {
      return;
    }
    void handleSignature();
  }, [web3Context, signatureRequested]);

  // open the wallet connection modal
  const handleVerifyClick = useCallback(async () => {
    // verify the wallet is connected
    if (!web3Context.web3Deps) {
      setAccessWalletModalIsOpen(true);
    }
    setSignatureRequested(true);
  }, [address]);

  // open the wallet modal to prompt for the signature
  const handleSignature = async (): Promise<void> => {
    try {
      // ensure web3 service was connected and that a signature has been
      // requested by this component
      if (!address || !web3Context.web3Deps || !signatureRequested) {
        return;
      }

      // clear the signature requested flag
      setSignatureRequested(false);

      // sign a message linking the domain and secondary wallet address
      const messageText = await getSignatureMessage(domain, currency, address);
      const signature =
        await web3Context.web3Deps.signer.signMessage(messageText);

      // verify the signature before saving
      const signer = recoverPersonalSignature({
        data: messageText,
        signature,
      });
      if (signer.toLowerCase() !== address.toLowerCase()) {
        throw new Error('Invalid signature');
      }

      // save the verification record
      await postCryptoVerification(domain, {
        symbol: currency,
        address,
        plaintextMessage: messageText,
        signedMessage: signature,
      });

      // set verification status
      setVerified(address);
    } catch (signError) {
      enqueueSnackbar(t('manage.signatureError', {connectedAddress: address}), {
        variant: 'error',
      });
    }
  };

  // set wallet properties after selection
  const handleAccessWalletComplete = async (
    web3Dependencies?: Web3Dependencies,
  ) => {
    setWeb3Deps(web3Dependencies);
    setAccessWalletModalIsOpen(false);
  };

  // verify address is populated
  if (!address) {
    return <div></div>;
  }

  // render the button along with address-specific wallet connection modal
  return (
    <div>
      <Tooltip title={t('manage.connectToVerify', {extension: currency})}>
        <Button
          variant="text"
          data-testid={`verify-${currency}`}
          onClick={handleVerifyClick}
        >
          {t('manage.verify')}
        </Button>
      </Tooltip>
      <AccessWalletModal
        prompt={true}
        address={address}
        onComplete={deps => handleAccessWalletComplete(deps)}
        open={accessWalletModalIsOpen}
        onClose={() => setAccessWalletModalIsOpen(false)}
      />
    </div>
  );
};
