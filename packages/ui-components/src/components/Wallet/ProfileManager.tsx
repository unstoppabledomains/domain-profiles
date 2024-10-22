import {fetcher} from '@xmtp/proto';
import {Signature} from '@xmtp/xmtp-js';
import {Base64} from 'js-base64';
import React, {useEffect, useState} from 'react';

import config from '@unstoppabledomains/config';

import {getProfileData} from '../../actions';
import {AccessWalletModal} from '../../components/Wallet/AccessWallet';
import {useWeb3Context} from '../../hooks';
import {fetchApi} from '../../lib';
import {sleep} from '../../lib/sleep';
import {DomainFieldTypes, DomainProfileKeys} from '../../lib/types/domain';
import type {Web3Dependencies} from '../../lib/types/web3';
import {signMessage as signPushMessage} from '../Chat/protocol/push';
import {signMessage as signXmtpMessage} from '../Chat/protocol/xmtp';
import {
  getPushLocalKey,
  getXmtpLocalKey,
  localStorageWrapper,
} from '../Chat/storage';

export type ManagerProps = {
  domain: string;
  ownerAddress: string;
  setWeb3Deps: (value: Web3Dependencies | undefined) => void;
  saveComplete?: boolean;
  saveClicked: boolean;
  setSaveClicked: (value: boolean) => void;
  onSignature: (signature: string, expiry: string) => void;
  onFailed?: (reason?: string) => void;
  useLocalPushKey?: boolean;
  useLocalXmtpKey?: boolean;
  forceWalletConnected?: boolean;
  closeAfterSignature?: boolean;
};

export const ONE_WEEK = 60 * 60 * 24 * 7 * 1000;

export const ProfileManager: React.FC<ManagerProps> = opts => {
  return opts.saveClicked ? <Manager {...opts} /> : <></>;
};

const Manager: React.FC<ManagerProps> = ({
  domain,
  ownerAddress,
  setWeb3Deps,
  saveComplete,
  saveClicked,
  setSaveClicked,
  onSignature,
  onFailed,
  forceWalletConnected,
  closeAfterSignature,
  useLocalXmtpKey = true,
  useLocalPushKey = false,
}) => {
  const {web3Deps, messageToSign} = useWeb3Context();
  const [messageResponse, setMessageResponse] = useState<MessageResponse>();
  const [signature, setSignature] = useState<string>();
  const [expiry, setExpiry] = useState<string>();
  const [accessWalletModalIsOpen, setAccessWalletModalIsOpen] = useState(false);
  const [clickedReconnect, setClickedReconnect] = useState(false);
  const [isMpcWallet, setIsMpcWallet] = useState(false);

  useEffect(() => {
    if (saveClicked) {
      if (forceWalletConnected && !web3Deps) {
        setAccessWalletModalIsOpen(true);
      }
      void handlePrepareSignature();
    }
  }, [saveClicked]);

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

  useEffect(() => {
    if (!web3Deps || !messageResponse || messageToSign) {
      return;
    }
    void handlePromptSignature(messageResponse.message);
  }, [web3Deps, messageResponse]);

  useEffect(() => {
    if (saveComplete) {
      setAccessWalletModalIsOpen(false);
    }
  }, [saveComplete]);

  useEffect(() => {
    // always require signature and expiry
    if (!signature || !expiry) {
      return;
    }

    // optionally require web3deps to be set
    if (forceWalletConnected && !web3Deps) {
      return;
    }

    // send final call to save preferences to profile API
    void onSignature(signature, expiry);

    // clear state values
    setSaveClicked(false);
    setSignature(undefined);
    setExpiry(undefined);

    // optionally close window after signature
    if (closeAfterSignature) {
      setAccessWalletModalIsOpen(false);
    }

    // store signature value on local device
    void localStorageWrapper.setItem(
      getDomainSignatureValueKey(domain),
      signature,
    );
    void localStorageWrapper.setItem(
      getDomainSignatureExpiryKey(domain),
      expiry,
    );
  }, [signature, expiry, web3Deps]);

  // handlePrepareSignature retrieves the message that must be signed for the profile
  // management request.
  const handlePrepareSignature = async () => {
    // check domain owner address MPC status
    if (!isMpcWallet) {
      const publicData = await getProfileData(domain, [
        DomainFieldTypes.CryptoVerifications,
      ]);
      setIsMpcWallet(
        publicData?.cryptoVerifications?.some(
          v =>
            v.address.toLowerCase() === ownerAddress.toLowerCase() &&
            v.type === 'mpc',
        ) || false,
      );
    }

    // check whether the domain signature is stored on local device
    const localSignature = await localStorageWrapper.getItem(
      getDomainSignatureValueKey(domain),
    );
    const localExpiry = await localStorageWrapper.getItem(
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
    const responseBody = await fetchApi<MessageResponse>(
      `/user/${domain}/signature?device=true&expiry=${Date.now() + ONE_WEEK}`,
      {
        host: config.PROFILE.HOST_URL,
        method: 'GET',
        mode: 'cors',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
    );
    if (!responseBody) {
      onFailed?.(`Authentication error for ${domain}`);
      return;
    }

    // sign with locally stored XMTP key if available
    const localXmtpKey = await getXmtpLocalKey(ownerAddress);
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
    const localPushKey = await getPushLocalKey(ownerAddress);
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
    setAccessWalletModalIsOpen(!web3Deps);
  };

  // handlePromptSignature prompts the user to sign a message to authorize management of
  // the domain profile.
  const handlePromptSignature = async (messageText: string): Promise<void> => {
    try {
      // require web3 dependency value
      if (!web3Deps) {
        return;
      }

      // clear message response value to prepare the state for a subsequent
      // message signature to be collected
      setMessageResponse(undefined);

      // sign a message linking the domain and secondary wallet address
      setSignature(await web3Deps.signer.signMessage(messageText));
      setExpiry(String(messageResponse?.headers['x-auth-expires']));
    } catch (signError) {
      onFailed?.(`signature failed: ${String(signError)}`);
    } finally {
      setSaveClicked(false);
    }
  };

  // handleAccessWalletComplete callback for the wallet selection modal
  const handleAccessWalletComplete = async (
    web3Dependencies?: Web3Dependencies,
  ) => {
    // handle the provided deps if provided
    if (web3Dependencies) {
      setWeb3Deps(web3Dependencies);
    }
    setAccessWalletModalIsOpen(false);
  };

  const handleReconnect = () => {
    setClickedReconnect(true);
  };

  const handleClose = () => {
    setSaveClicked(false);
    setAccessWalletModalIsOpen(false);
  };

  return (
    <div>
      {accessWalletModalIsOpen && (
        <AccessWalletModal
          prompt={true}
          address={ownerAddress}
          onComplete={deps => handleAccessWalletComplete(deps)}
          open={accessWalletModalIsOpen}
          onClose={handleClose}
          onReconnect={handleReconnect}
          isMpcWallet={isMpcWallet}
        />
      )}
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
