import {recoverPersonalSignature} from '@metamask/eth-sig-util';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import {useSnackbar} from 'notistack';
import type {FC} from 'react';
import React, {useCallback, useEffect, useState} from 'react';

import {postCryptoVerification} from '../../../../../actions';
import {useWeb3Context} from '../../../../../hooks';
import type {Web3Dependencies} from '../../../../../lib';
import {useTranslationContext} from '../../../../../lib';
import {sleep} from '../../../../../lib/sleep';
import {AccessWalletModal} from '../../../../Wallet/AccessWallet';
import VerificationInfoModal from '../VerificationInfoModal';
import {getSignatureMessage} from '../message';
import type {VerificationProps} from '../types';

export const EvmVerificationButton: FC<VerificationProps> = ({
  ownerAddress,
  address,
  currency,
  domain,
  setVerified,
  setWeb3Deps,
}) => {
  // wallet model implementation and state management
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [accessWalletModalIsOpen, setAccessWalletModalIsOpen] = useState(false);
  const [signatureRequested, setSignatureRequested] = useState(false);
  const [clickedReconnect, setClickedReconnect] = useState(false);
  const [t] = useTranslationContext();
  const {enqueueSnackbar} = useSnackbar();
  const {web3Deps} = useWeb3Context();

  // wait for connection state and initiate signature dialog
  useEffect(() => {
    if (!web3Deps || !signatureRequested) {
      return;
    }
    void handleSignature();
  }, [web3Deps, signatureRequested]);

  useEffect(() => {
    // ignore when reconnect flag is not set
    if (!clickedReconnect) {
      return;
    }
    const reload = async () => {
      if (accessWalletModalIsOpen) {
        // close the access wallet modal
        setAccessWalletModalIsOpen(false);
      } else {
        // open the access wallet modal
        await sleep(250);
        setClickedReconnect(false);
        setAccessWalletModalIsOpen(true);
      }
    };
    void reload();
  }, [clickedReconnect, accessWalletModalIsOpen]);

  const handleOpenInfoModal = () => {
    setInfoModalOpen(true);
  };

  // open the wallet connection modal
  const handleVerifyClick = useCallback(async () => {
    // always disconnect wallet when loading the verification modal, because
    // the user needs the ability to change their connected wallet to match
    // the crypto address record.
    setWeb3Deps(undefined);

    // open access wallet modal
    setAccessWalletModalIsOpen(true);

    // request signature and close verification info modal
    setSignatureRequested(true);
    setInfoModalOpen(false);
  }, [address]);

  // open the wallet modal to prompt for the signature
  const handleSignature = async (): Promise<void> => {
    try {
      // ensure web3 service was connected and that a signature has been
      // requested by this component
      if (!address || !web3Deps || !signatureRequested) {
        return;
      }

      // clear the signature requested flag
      setSignatureRequested(false);

      // sign a message linking the domain and secondary wallet address
      const messageText = await getSignatureMessage(domain, currency, address);
      const signature = await web3Deps.signer.signMessage(messageText);

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

  const handleReconnect = () => {
    setClickedReconnect(true);
  };

  // verify address is populated
  if (!address) {
    return <div></div>;
  }

  // render the button along with address-specific wallet connection modal
  return (
    <div>
      <Tooltip title={t('manage.learnHowToVerify')}>
        <Button
          variant="text"
          data-testid={`verify-${currency}`}
          onClick={handleOpenInfoModal}
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
        onReconnect={handleReconnect}
      />
      {infoModalOpen && (
        <VerificationInfoModal
          open={infoModalOpen}
          ownerAddress={ownerAddress}
          walletAddress={address}
          symbol={currency}
          onClose={() => setInfoModalOpen(false)}
          onVerifyClick={handleVerifyClick}
          showDelegateInfo={true}
        />
      )}
    </div>
  );
};
