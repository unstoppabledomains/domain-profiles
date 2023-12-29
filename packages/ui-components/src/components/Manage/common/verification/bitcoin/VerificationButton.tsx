import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import {Verifier} from 'bip322-js';
import {getAddressInfo} from 'bitcoin-address-validation';
import {useSnackbar} from 'notistack';
import type {FC} from 'react';
import React, {useCallback} from 'react';

import {postCryptoVerification} from '../../../../../actions';
import {useTranslationContext} from '../../../../../lib';
import {getSignatureMessage} from '../message';
import type {VerificationProps} from '../types';

interface SignaturePayload {
  message: string;
  paymentType?: string;
}

interface SignatureResult {
  result: {
    address: string;
    signature: string;
  };
}

declare global {
  interface Window {
    btc?: {
      request: (
        method: string,
        payload: SignaturePayload,
      ) => Promise<SignatureResult>;
    };
  }
}

export const BitcoinVerificationButton: FC<VerificationProps> = ({
  address,
  currency,
  domain,
  setVerified,
}) => {
  // wallet model implementation and state management
  const [t] = useTranslationContext();
  const {enqueueSnackbar} = useSnackbar();

  // open the browser extension signature modal
  const handleVerifyClick = useCallback(async () => {
    try {
      // ensure wallet with BIP-322 support
      if (!window.btc) {
        throw new Error('Supported Bitcoin wallet not found');
      }

      // validate supported address type
      if (!isAddressSupported(address)) {
        throw new Error(`Address format not supported for verification`);
      }

      // request the signature from the user per documentation found at BIP-322
      // library https://leather.gitbook.io/developers/bitcoin/sign-messages
      const addressInfo = getAddressInfo(address);
      const messageText = await getSignatureMessage(domain, currency, address);
      const signature = await window.btc.request('signMessage', {
        message: messageText,
        paymentType: addressInfo.type === 'p2tr' ? 'p2tr' : 'p2wpkh',
      });

      // verify the signature was captured
      if (!signature?.result?.signature) {
        throw new Error('Message was not signed');
      }

      // verify the signature contents
      if (signature.result?.address?.toLowerCase() !== address.toLowerCase()) {
        throw new Error(
          `Message signed by unexpected address: ${signature.result?.address}`,
        );
      }

      // verify the signature matches the expected address
      if (
        !Verifier.verifySignature(
          signature.result.address,
          messageText,
          signature.result.signature,
        )
      ) {
        throw new Error(`Invalid signature for address: ${address}`);
      }

      // save the verification record
      await postCryptoVerification(domain, {
        symbol: currency,
        address,
        plaintextMessage: messageText,
        signedMessage: signature.result.signature,
      });

      // set verification status
      setVerified(address);
    } catch (signError) {
      enqueueSnackbar(t('manage.signatureError', {connectedAddress: address}), {
        variant: 'error',
      });
    }
  }, [address]);

  // render the button along with address-specific wallet connection modal
  return (
    <div>
      <Tooltip
        title={
          window.btc
            ? t('manage.connectToVerify', {extension: currency})
            : isAddressSupported(address)
            ? t('manage.btcWalletUnsupported')
            : t('manage.btcAddressUnsupported')
        }
      >
        <span>
          <Button
            variant="text"
            data-testid={`verify-${currency}`}
            disabled={!window.btc || !isAddressSupported(address)}
            onClick={handleVerifyClick}
          >
            {t('manage.verify')}
          </Button>
        </span>
      </Tooltip>
    </div>
  );
};

export const isAddressSupported = (address: string): boolean => {
  const addressInfo = getAddressInfo(address);
  if (
    addressInfo.type !== 'p2tr' &&
    addressInfo.type !== 'p2wpkh' &&
    addressInfo.type !== 'p2wsh'
  ) {
    return false;
  }
  return true;
};
