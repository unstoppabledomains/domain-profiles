import {fetcher} from '@xmtp/proto';
import {Signature} from '@xmtp/xmtp-js';
import {Base64} from 'js-base64';
import React, {useContext, useEffect, useState} from 'react';

import config from '@unstoppabledomains/config';

import {AccessWalletModal} from '../../components/Wallet/AccessWallet';
import {DomainProfileKeys} from '../../lib/types/domain';
import type {Web3Dependencies} from '../../lib/types/web3';
import {Web3Context} from '../../providers/Web3ContextProvider';
import {signMessage as signPushMessage} from '../Chat/protocol/push';
import {signMessage as signXmtpMessage} from '../Chat/protocol/xmtp';
import {getPushLocalKey, getXmtpLocalKey} from '../Chat/storage';

export type ManagerProps = {
  domain: string;
  ownerAddress: string;
  setWeb3Deps: (value: Web3Dependencies | undefined) => void;
  saveClicked: boolean;
  setSaveClicked: (value: boolean) => void;
  onSignature: (signature: string, expiry: string) => void;
  onFailed?: () => void;
  useLocalPushKey?: boolean;
  useLocalXmtpKey?: boolean;
  forceWalletConnected?: boolean;
};

export const ONE_WEEK = 60 * 60 * 24 * 7 * 1000;

export const ProfileManager: React.FC<ManagerProps> = ({
  domain,
  ownerAddress,
  setWeb3Deps,
  saveClicked,
  setSaveClicked,
  onSignature,
  onFailed,
  forceWalletConnected,
  useLocalXmtpKey = true,
  useLocalPushKey = false,
}) => {
  const web3Context = useContext(Web3Context);
  const [messageResponse, setMessageResponse] = useState<MessageResponse>();
  const [signature, setSignature] = useState<string>();
  const [expiry, setExpiry] = useState<string>();
  const [accessWalletModalIsOpen, setAccessWalletModalIsOpen] = useState(false);

  useEffect(() => {
    if (saveClicked) {
      if (forceWalletConnected && !web3Context?.web3Deps) {
        setAccessWalletModalIsOpen(true);
      }
      void handlePrepareSignature();
    }
  }, [saveClicked]);

  useEffect(() => {
    if (!web3Context.web3Deps || !messageResponse) {
      return;
    }
    void handlePromptSignature(messageResponse.message);
  }, [web3Context, messageResponse]);

  useEffect(() => {
    // always require signature and expiry
    if (!signature || !expiry) {
      return;
    }

    // optionally require web3deps to be set
    if (forceWalletConnected && !web3Context?.web3Deps) {
      return;
    }

    // send final call to save preferences to profile API
    void onSignature(signature, expiry);

    // clear state values
    setSaveClicked(false);
    setSignature(undefined);
    setExpiry(undefined);

    // store signature value on local device
    localStorage.setItem(getDomainSignatureValueKey(domain), signature);
    localStorage.setItem(getDomainSignatureExpiryKey(domain), expiry);
  }, [signature, expiry, web3Context]);

  // handlePrepareSignature retrieves the message that must be signed for the profile
  // management request.
  const handlePrepareSignature = async () => {
    // check whether the domain signature is stored on local device
    const localSignature = localStorage.getItem(
      getDomainSignatureValueKey(domain),
    );
    const localExpiry = localStorage.getItem(
      getDomainSignatureExpiryKey(domain),
    );
    if (
      localSignature &&
      localExpiry &&
      parseInt(localExpiry, 10) > Date.now()
    ) {
      setSignature(localSignature);
      setExpiry(localExpiry);
      return;
    }

    // request a new domain signature
    const domainProfileUrl = `${
      config.PROFILE.HOST_URL
    }/user/${domain}/signature?device=true&expiry=${Date.now() + ONE_WEEK}`;
    const response = await fetch(domainProfileUrl, {
      method: 'GET',
      mode: 'cors',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    const responseBody: MessageResponse = await response.json();

    // sign with locally stored XMTP key if available
    const localXmtpKey = getXmtpLocalKey(ownerAddress);
    if (localXmtpKey && useLocalXmtpKey) {
      const xmtpSignatureBytes = new Signature(
        await signXmtpMessage(ownerAddress, responseBody.message),
      ).toBytes();
      const xmtpSignature = fetcher.b64Encode(
        xmtpSignatureBytes,
        0,
        xmtpSignatureBytes.length,
      );
      setSignature(xmtpSignature);
      setExpiry(String(responseBody.headers['x-auth-expires']));
      return;
    }

    // sign with a locally stored Push Protocol key if available
    const localPushKey = getPushLocalKey(ownerAddress);
    if (localPushKey && useLocalPushKey) {
      const pushSignature = await signPushMessage(
        responseBody.message,
        localPushKey,
      );
      setSignature(Base64.encode(pushSignature));
      setExpiry(String(responseBody.headers['x-auth-expires']));
      return;
    }

    // request wallet signature
    setMessageResponse(responseBody);
    setAccessWalletModalIsOpen(!web3Context.web3Deps);
  };

  // handlePromptSignature prompts the user to sign a message to authorize management of
  // the domain profile.
  const handlePromptSignature = async (messageText: string): Promise<void> => {
    try {
      if (!web3Context.web3Deps) {
        return;
      }

      // sign a message linking the domain and secondary wallet address
      setSignature(await web3Context.web3Deps.signer.signMessage(messageText));
      setExpiry(String(messageResponse?.headers['x-auth-expires']));
    } catch (signError) {
      onFailed?.();
    } finally {
      setSaveClicked(false);
    }
  };

  // handleAccessWalletComplete callback for the wallet selection modal
  const handleAccessWalletComplete = async (
    web3Dependencies?: Web3Dependencies,
  ) => {
    setWeb3Deps(web3Dependencies);
    setAccessWalletModalIsOpen(false);
  };

  return (
    <div>
      <AccessWalletModal
        prompt={true}
        address={ownerAddress}
        onComplete={deps => handleAccessWalletComplete(deps)}
        open={accessWalletModalIsOpen}
        onClose={() => setAccessWalletModalIsOpen(false)}
      />
    </div>
  );
};

export const getDomainSignatureExpiryKey = (domain: string): string => {
  return `${DomainProfileKeys.Signature}-expiry-${domain}`;
};

interface MessageResponse {
  message: string;
  headers: {
    ['x-auth-expires']: number;
  };
}

// milliseconds in a week
export const getDomainSignatureValueKey = (domain: string): string => {
  return `${DomainProfileKeys.Signature}-value-${domain}`;
};
